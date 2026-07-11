// script.js
const { Octokit } = require("@octokit/rest");

const token = process.env.GITHUB_TOKEN;
const prsPerRun = parseInt(process.env.PRS_PER_RUN || "2", 10);
const delayMs = parseInt(process.env.DELAY_MS || "1000", 10);

const octokit = new Octokit({ auth: token });

async function createPRs() {
  const owner = "SEU_USUARIO";      // substitua pelo seu usuário GitHub
  const repo = "SEU_REPOSITORIO";   // substitua pelo nome do repositório

  for (let i = 0; i < prsPerRun; i++) {
    const branchName = `auto-branch-${Date.now()}-${i}`;

    // cria branch a partir da main
    const mainRef = await octokit.git.getRef({ owner, repo, ref: "heads/main" });
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: mainRef.data.object.sha,
    });

    // cria PR
    await octokit.pulls.create({
      owner,
      repo,
      title: `Automated PR ${i + 1}`,
      head: branchName,
      base: "main",
      body: "PR criado automaticamente pelo bot.",
    });

    console.log(`PR ${i + 1} criado`);
    await new Promise(res => setTimeout(res, delayMs));
  }
}

createPRs().catch(err => {
  console.error("Erro ao criar PRs:", err);
  process.exit(1);
});
