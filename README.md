# Conecta Impacto (MVP)

O **Conecta Impacto** é um sistema web simples e funcional desenvolvido para cadastrar voluntários e vinculá-los a ONGs parceiras, registrando os dados em tempo real no banco de dados **Firebase Firestore**.

## Estrutura do Projeto

O projeto utiliza uma estrutura plana e leve, ideal para demonstrações e apresentações rápidas, baseada inteiramente em Vanilla HTML, CSS e JavaScript ES6 nativo:

- `index.html`: Interface com o formulário de cadastro de voluntários (com seleção de ONG vinculada) e tabela de listagem.
- `style.css`: Estilização premium baseada em um tema escuro (#0b1c1c), com cards (#1a3333) e botões verde-claro (#00d48a).
- `db.js`: Inicialização do Firebase e implementação da classe `DatabaseConnection` de persistência.
- `app.js`: Script de orquestração do DOM, captura de dados do formulário e carregamento dos dados gravados em tempo real na tabela.

## Padrões de Projeto Utilizados

- **Singleton (db.js)**: A classe `DatabaseConnection` centraliza e encapsula a conexão com o banco de dados Firebase Firestore. Isso garante que o SDK do Firebase seja inicializado uma única vez em toda a execução da aplicação, evitando conexões concorrentes e redundantes.

## Como Executar

Por utilizar módulos ES6 nativos do JavaScript (`import` e `export` nos scripts), navegadores modernos bloqueiam o carregamento de arquivos locais via protocolo `file://` por restrições de CORS.

1. Abra a pasta `projeto-final` no seu editor.
2. Inicie um servidor local usando a extensão **Live Server** no VS Code (ou execute `npx serve .` / `python -m http.server` no terminal dentro da pasta).
3. Acesse o endereço retornado (geralmente `http://localhost:5500` ou `http://localhost:8000`) no seu navegador.
