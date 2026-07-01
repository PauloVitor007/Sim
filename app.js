// Importa o banco no topo do app.js
import DatabaseConnection from './db.js';

// --- PADRÃO OBSERVER (Pub/Sub) ---
// Professor, a classe EventObserver gerencia o disparo reativo de eventos da nossa SPA.
// Quando cadastramos um voluntário, o observer notifica os listeners inscritos para atualizar
// a tabela e recalcular os KPIs do dashboard instantaneamente.
class VoluntarioObserver {
    constructor() {
        this.listeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify(data) {
        this.listeners.forEach(callback => callback(data));
    }
}

const cadastroObserver = new VoluntarioObserver();

// --- PADRÃO FACADE (Auditoria e Indicadores) ---
class GeminiFacade {
    static calcularScore(voluntario) {
        const total = voluntario.nome.length + voluntario.email.length;
        const score = Math.min(85 + (total % 15), 98);
        return {
            score: score,
            status: "Auditado",
            selo: "Selo ESG Raízes"
        };
    }
}

// ONGs padrão iniciais da aplicação
const ongMocksPadrao = [
    "Instituto Conecta RN",
    "GACC-RN",
    "Casa Durval Paiva"
];

// Mock inicial de Ações (Voluntários cadastrados para simular dados pré-existentes na interface)
const voluntarioMocks = [
    { nome: "Mariana Souza", email: "mariana.souza@email.com", ong: "Instituto Conecta RN", dataCadastro: new Date(Date.now() - 3600000 * 24 * 3).toISOString() },
    { nome: "Carlos Henrique", email: "carlos.h@email.com", ong: "GACC-RN", dataCadastro: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
    { nome: "Beatriz Costa", email: "beatriz.costa@email.com", ong: "Casa Durval Paiva", dataCadastro: new Date(Date.now() - 3600000 * 12).toISOString() }
];

// --- NAVEGAÇÃO ENTRE VISÕES PRINCIPAIS (DASHBOARD vs ACESSO) ---
const menuAcesso = document.getElementById('menu-acesso');
const menuDashboard = document.getElementById('menu-dashboard');
const viewAuth = document.getElementById('view-auth');
const viewDashboard = document.getElementById('view-dashboard');

function alternarSecaoPrincipal(secaoAtiva) {
    if (secaoAtiva === 'auth') {
        menuAcesso.classList.add('active');
        menuDashboard.classList.remove('active');
        viewAuth.classList.add('active');
        viewDashboard.classList.remove('active');
    } else {
        menuDashboard.classList.add('active');
        menuAcesso.classList.remove('active');
        viewDashboard.classList.add('active');
        viewAuth.classList.remove('active');
    }
}

if (menuAcesso && menuDashboard) {
    menuAcesso.addEventListener('click', () => alternarSecaoPrincipal('auth'));
    menuDashboard.addEventListener('click', () => alternarSecaoPrincipal('dashboard'));
}

// --- NAVEGAÇÃO DE ABAS DE FORMULÁRIO NA TELA DE ACESSO ---
const tabBtnLogin = document.getElementById('tab-btn-login');
const tabBtnOng = document.getElementById('tab-btn-ong');
const tabBtnVoluntario = document.getElementById('tab-btn-voluntario');

const formLogin = document.getElementById('login-form');
const formOng = document.getElementById('ong-form');
const formCadastro = document.getElementById('cadastro-form');

function alternarFormAuth(abaAtiva) {
    const botoes = [tabBtnLogin, tabBtnOng, tabBtnVoluntario];
    const formularios = [formLogin, formOng, formCadastro];

    botoes.forEach(b => b?.classList.remove('active'));
    formularios.forEach(f => f?.classList.remove('active'));

    if (abaAtiva === 'login') {
        tabBtnLogin?.classList.add('active');
        formLogin?.classList.add('active');
    } else if (abaAtiva === 'ong') {
        tabBtnOng?.classList.add('active');
        formOng?.classList.add('active');
    } else if (abaAtiva === 'voluntario') {
        tabBtnVoluntario?.classList.add('active');
        formCadastro?.classList.add('active');
    }
}

tabBtnLogin?.addEventListener('click', () => alternarFormAuth('login'));
tabBtnOng?.addEventListener('click', () => alternarFormAuth('ong'));
tabBtnVoluntario?.addEventListener('click', () => alternarFormAuth('voluntario'));

// --- LÓGICA DE ONGs ---
async function carregarOngs() {
    const selectElement = document.getElementById('ong-vinculada');
    if (!selectElement) return;

    // Busca ONGs cadastradas em tempo real no Firebase Firestore
    const ongsReais = await DatabaseConnection.obterOngs();
    const nomesOngsReais = ongsReais.map(o => o.nome);

    // Une com a lista mockada estática, removendo duplicados
    const todasOngs = [...new Set([...ongMocksPadrao, ...nomesOngsReais])];

    selectElement.innerHTML = '';
    todasOngs.forEach(ong => {
        const option = document.createElement('option');
        option.value = ong;
        option.textContent = ong;
        selectElement.appendChild(option);
    });
}

async function handleCadastrarOng(event) {
    event.preventDefault();

    const nome = document.getElementById('nomeOng').value.trim();
    const areaAtuacao = document.getElementById('areaAtuacao').value.trim();

    if (!nome || !areaAtuacao) {
        alert("Por favor, preencha todos os campos da ONG.");
        return;
    }

    const novaOng = {
        nome: nome,
        areaAtuacao: areaAtuacao,
        dataCadastro: new Date().toISOString()
    };

    const sucesso = await DatabaseConnection.salvarOng(novaOng);

    if (sucesso) {
        alert(`ONG "${nome}" cadastrada com sucesso no Firebase!`);
        document.getElementById('ong-form').reset();
        
        // Atualiza dinamicamente o select de vínculo de voluntários
        await carregarOngs();
        
        // Direciona o usuário para a aba de cadastro de voluntários para conveniência
        alternarFormAuth('voluntario');
    } else {
        alert("Erro ao cadastrar ONG no Firebase.");
    }
}

// --- LÓGICA DE VOLUNTÁRIOS ---
async function renderizarTabela() {
    const listaElement = document.getElementById('lista-voluntarios');
    const tabelaVazia = document.getElementById('tabela-vazia');
    const tabela = document.querySelector('table');
    
    if (!listaElement) return;

    // Busca voluntários salvos em tempo real no Firebase Firestore
    const listaReais = await DatabaseConnection.obterVoluntarios();
    const listaCompleta = [...voluntarioMocks, ...listaReais];

    // Atualiza KPIs
    const kpiAtivos = document.querySelector('.grid-kpis .kpi-card:nth-child(3) .kpi-value span');
    if (kpiAtivos) kpiAtivos.textContent = listaCompleta.length;

    const kpiHoras = document.querySelector('.grid-kpis .kpi-card:nth-child(1) .kpi-value span');
    if (kpiHoras) kpiHoras.textContent = listaCompleta.length * 6;

    const kpiInvestimento = document.querySelector('.grid-kpis .kpi-card:nth-child(2) .kpi-value span:last-child');
    if (kpiInvestimento) {
        kpiInvestimento.textContent = (listaCompleta.length * 120).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (listaCompleta.length === 0) {
        listaElement.innerHTML = '';
        if (tabelaVazia) tabelaVazia.style.display = 'flex';
        if (tabela) tabela.style.display = 'none';
        return;
    }

    if (tabelaVazia) tabelaVazia.style.display = 'none';
    if (tabela) tabela.style.display = 'table';

    listaElement.innerHTML = '';
    listaCompleta.forEach(vol => {
        const dataFormatada = new Date(vol.dataCadastro).toLocaleDateString('pt-BR');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${vol.nome}</strong></td>
            <td>${vol.email}</td>
            <td>${vol.ong}</td>
            <td>${dataFormatada}</td>
        `;
        listaElement.appendChild(tr);
    });
}

async function handleCadastrarVoluntario(event) {
    event.preventDefault();

    const nome = document.getElementById('nomeVoluntario').value.trim();
    const email = document.getElementById('emailVoluntario').value.trim();
    const ong = document.getElementById('ong-vinculada').value;
    const checkin = document.querySelector('input[name="checkin"]:checked')?.value || "Não Informado";

    if (!nome || !email || !ong) {
        alert("Por favor, preencha todos os campos do Voluntário.");
        return;
    }

    const novoVoluntario = {
        nome: nome,
        email: email,
        ong: ong,
        checkinEmocional: checkin,
        dataCadastro: new Date().toISOString()
    };

    // Gravação no Firebase
    const sucesso = await DatabaseConnection.salvarVoluntario(novoVoluntario);

    if (sucesso) {
        // Auditoria IA via Facade
        const auditoria = GeminiFacade.calcularScore(novoVoluntario);
        const scoreVal = document.querySelector('.score-card .score-value');
        if (scoreVal) scoreVal.textContent = `${auditoria.score}% Certificado pelo Selo ESG Raízes do Bem`;
        
        const scoreDesc = document.querySelector('.score-card .score-desc');
        if (scoreDesc) scoreDesc.textContent = `${auditoria.status} (${auditoria.selo})`;

        alert(`Voluntário ${nome} cadastrado com sucesso!`);
        document.getElementById('cadastro-form').reset();
        
        const radioAnimado = document.getElementById('checkin-animado');
        if (radioAnimado) radioAnimado.checked = true;

        // Dispara o Observer para notificar alteração de dados e reconstruir a tabela
        cadastroObserver.notify(novoVoluntario);

        // Direciona visualmente ao Dashboard para a visualização das métricas
        alternarSecaoPrincipal('dashboard');
    } else {
        alert("Erro ao salvar voluntário no Firebase.");
    }
}

// --- LOGICA DE LOGIN (REDIRECIONAMENTO SIMULADO DO MVP) ---
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    alert(`Boas-vindas! Acesso concedido para o administrador de e-mail ${email}.`);
    document.getElementById('login-form').reset();
    
    // Direciona ao Dashboard automaticamente após login bem sucedido
    alternarSecaoPrincipal('dashboard');
}

// Registro no Observer
cadastroObserver.subscribe(() => {
    renderizarTabela();
});

// Vincula os listeners diretamente
const loginForm = document.getElementById('login-form');
if (loginForm) loginForm.addEventListener('submit', handleLogin);

const ongForm = document.getElementById('ong-form');
if (ongForm) ongForm.addEventListener('submit', handleCadastrarOng);

const cadastroForm = document.getElementById('cadastro-form');
if (cadastroForm) cadastroForm.addEventListener('submit', handleCadastrarVoluntario);

// Inicializa a carga de dropdowns e dados
carregarOngs();
renderizarTabela();
