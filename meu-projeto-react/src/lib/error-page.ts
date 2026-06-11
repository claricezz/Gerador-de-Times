export function renderErrorPage(): string {
    return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Ops! Bola fora... · O Pior Vôlei de Belém</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon-container">
        <!-- Ícone de Vôlei em SVG Estilizado e Animado -->
        <svg class="volleyball-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" stroke="#aa3bff" stroke-width="4"/>
          <path d="M12 28.5C24.5 40.5 40.5 24.5 28.5 12" stroke="#aa3bff" stroke-width="3" stroke-linecap="round"/>
          <path d="M88 71.5C75.5 59.5 59.5 75.5 71.5 88" stroke="#aa3bff" stroke-width="3" stroke-linecap="round"/>
          <path d="M28.5 88C40.5 75.5 24.5 59.5 12 71.5" stroke="#aa3bff" stroke-width="3" stroke-linecap="round"/>
          <path d="M71.5 12C59.5 24.5 75.5 40.5 88 28.5" stroke="#aa3bff" stroke-width="3" stroke-linecap="round"/>
          <path d="M24 50C24 35.64 35.64 24 50 24C64.36 24 76 35.64 76 50C76 64.36 64.36 76 50 76C35.64 76 24 64.36 24 50Z" stroke="#aa3bff" stroke-width="3"/>
          <path d="M38 50H62" stroke="#aa3bff" stroke-width="3" stroke-linecap="round"/>
          <path d="M50 38V62" stroke="#aa3bff" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
      <h1>Ops! Deu bola fora...</h1>
      <p>A recepção falhou e o servidor mandou esse saque direto na rede. A página não conseguiu carregar no momento.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Recuperar o ponto</button>
        <a class="secondary" href="/">Voltar para a quadra</a>
      </div>
    </div>
  </body>
</html>`;
}