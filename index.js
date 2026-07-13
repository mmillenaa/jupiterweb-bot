async function botJupiterCalibrado() {
    window.originalConfirm = window.confirm; window.confirm = () => true; 
    window.originalAlert = window.alert; window.alert = () => true;

    let selects = document.querySelectorAll("select");
    let combo = Array.from(selects).find(s => s.options.length > 2 && s.innerText.match(/[A-Z]{3}\d{4}/));
    let btnAdicionar = Array.from(document.querySelectorAll("a, button, span")).find(el => el.innerText.includes("Adicionar disciplina selecionada"));
    
    if(!combo) {
        console.error("ERRO: Não encontrei o menu. Marque a bolinha 'Optativas Eletivas' primeiro.");
        return;
    }

    let opcoes = Array.from(combo.options).filter(opt => opt.innerText.match(/[A-Z]{3}\d{4}/));
    let dados = [];
    
    for(let i = 0; i < opcoes.length; i++) {
        let option = opcoes[i];
        let codigo = option.innerText.match(/[A-Z]{3}\d{4}/)[0];
        let nome = option.innerText.trim().replace(/;/g, "").replace(/,/g, ""); 
        
        console.log(`[${i+1}/${opcoes.length}] Extraindo: ${codigo}...`);
        
        combo.value = option.value;
        combo.dispatchEvent(new Event('change'));
        btnAdicionar.click();
        await new Promise(r => setTimeout(r, 2000));
        
        let linkMateria = Array.from(document.querySelectorAll("[onclick], a")).find(el => el.innerText && el.innerText.includes(codigo) && (el.getAttribute("onclick") || el.href));
        if(!linkMateria) {
            let fecha = document.querySelector(".ui-dialog-titlebar-close");
            if(fecha) fecha.click();
            continue;
        }
        
        linkMateria.click();
        await new Promise(r => setTimeout(r, 1500));
        
        let creditos = "NA", vagas = "NA", inscritos = "NA", horarioTexto = "NA", professorTexto = "NA";
        let dialog = document.querySelector(".ui-dialog[style*='display: block']"); 
        
        if(dialog) {
            let mCred = dialog.innerText.match(/Créditos aula:\s*(\d+)/);
            if(mCred) creditos = mCred[1];
            
            let abaTurma = Array.from(document.querySelectorAll(".ui-dialog[style*='display: block'] a, .ui-dialog[style*='display: block'] span")).find(x => x.innerText.trim() === "Turma");
            if(abaTurma) {
                abaTurma.click();
                await new Promise(r => setTimeout(r, 1500));
                
                let dialogTurma = document.querySelector(".ui-dialog[style*='display: block']");
                if(dialogTurma) {
                    
                    // LÓGICA CORRIGIDA: Prioriza o montante global de Optativa Eletiva/Livre
                    let mOptativa = dialogTurma.innerText.match(/Optativa\s+(?:Eletiva|Livre)\s+(\d+)\s+(\d+)/i);
                    
                    if(mOptativa && parseInt(mOptativa[1]) > 0) {
                        vagas = mOptativa[1];
                        inscritos = mOptativa[2];
                    } else {
                        // Fallback: se não tiver vaga de optativa, tenta ler a linha de Obrigatória global
                        let mObrigatoria = dialogTurma.innerText.match(/Obrigatória\s+(\d+)\s+(\d+)/i);
                        if(mObrigatoria) {
                            vagas = mObrigatoria[1];
                            inscritos = mObrigatoria[2];
                        }
                    }

                    // Captura Horário e Professor
                    let linhas = dialogTurma.innerText.split('\n');
                    let horariosArray = [];
                    let professoresSet = new Set();
                    
                    linhas.forEach(linha => {
                        let matchLinha = linha.match(/(seg|ter|qua|qui|sex|sab)\s+(\d{2}:\d{2})\s+(\d{2}:\d{2})\s*(.*)/i);
                        if(matchLinha) {
                            horariosArray.push(`${matchLinha[1]} ${matchLinha[2]} ${matchLinha[3]}`);
                            let prof = matchLinha[4].trim();
                            if(prof && !prof.includes("Vagas") && !prof.includes("Optativa") && !prof.includes("Obrigatória")) {
                                professoresSet.add(prof);
                            }
                        }
                    });
                    
                    if(horariosArray.length > 0) horarioTexto = horariosArray.join(" | ");
                    if(professoresSet.size > 0) professorTexto = Array.from(professoresSet).join(" / ");
                }
            }
            
            let btnRemover = Array.from(document.querySelectorAll(".ui-dialog[style*='display: block'] a, .ui-dialog[style*='display: block'] button")).find(el => el.innerText.includes("Remover disciplina"));
            if(btnRemover) btnRemover.click();
            else {
                let fechaDialog = document.querySelector(".ui-dialog[style*='display: block'] .ui-dialog-titlebar-close");
                if(fechaDialog) fechaDialog.click();
            }
        }
        
        dados.push({ Disciplina: nome, Creditos: creditos, Horario: horarioTexto, Professor: professorTexto, Vagas: vagas, Inscritos: inscritos, Sobrando: (parseInt(vagas) || 0) - (parseInt(inscritos) || 0) });
        await new Promise(r => setTimeout(r, 1500)); 
    }
    
    window.confirm = window.originalConfirm; window.alert = window.originalAlert;
    
    let csv = "data:text/csv;charset=utf-8,Disciplina;Creditos;Horario;Professor;Vagas;Inscritos;Sobrando\n";
    dados.forEach(d => { csv += `${d.Disciplina};${d.Creditos};${d.Horario};${d.Professor};${d.Vagas};${d.Inscritos};${d.Sobrando}\n`; });
    let link = document.createElement("a"); link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "Optativas_Jupiter_Definitivo.csv");
    document.body.appendChild(link); link.click(); link.remove();
    
    console.log("FINALIZADO! Planilha salva com a lógica de cotas globais.");
}
botJupiterCalibrado();
