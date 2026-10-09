# Security Policy

## Context
The `jupiterweb-bot` is a client-side JavaScript snippet designed to be executed manually within the browser's Developer Tools Console. It operates strictly locally on the user's machine and interacts only with the active JupiterWeb session to scrape DOM elements and generate a CSV file. It does not transmit user data, session tokens, or passwords to any external server.

## Safe Execution Warning (Self-XSS)
Pasting code into the browser console can be dangerous if the source is untrusted. Users should **only** copy the code directly from the official `index.js` file in this repository. Never paste code sent to you by third parties in chat apps or forums claiming to be this bot.

## Supported Versions
Only the latest version available on the `main` branch is actively maintained.

## Reporting a Vulnerability
If you discover a security issue or unexpected behavior handling session data, please do not open a public issue. Report it privately using one of the following methods:

1. **GitHub Private Reporting:** Go to the Security tab → Report a vulnerability.
2. **Email:** Send a message directly to millena@usp.br.

You will receive an acknowledgment within ten working days.
