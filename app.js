// Importa o banco no topo do app.js
import DatabaseConnection from './db.js';

// --- PADRÃO OBSERVER (Pub/Sub) ---
// Professor, o padrão Observer é utilizado para atualizar a tabela na tela de forma reativa e automática
// assim que o Firebase confirma a gravação do voluntário, sem necessitar de recarregar a página (F5).
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

// Instancia o observer que monitora novos cadastros de voluntários
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

// Carrega as ONGs do Firebase e as une às mockadas padrão, populando o dropdown select
async function carregarOngs() {
    const selectElement = document.getElementById('ong-vinculada');
    if (!selectElement) return;

    // Busca ONGs reais salvas no Firebase Firestore
    const ongsReais = await DatabaseConnection.obterOngs();
    
    // Nomes das ONGs vindas do Firebase
    const nomesOngsReais = ongsReais.map(o => o.nome);

    // Combina ONGs padrão com as criadas na nuvem, removendo duplicados
    const todasOngs = [...new Set([...ongMocksPadrao, ...nomesOngsReais])];

    selectElement.innerHTML = '';
    todasOngs.forEach(ong => {
        const option = document.createElement('option');
        option.value = ong;
        option.textContent = ong;
        selectElement.appendChild(option);
    });
}

// Carrega e desenha a tabela de voluntários cadastrados
async function renderizarTabela() {
    const listaElement = document.getElementById('lista-voluntarios');
    const tabelaVazia = document.getElementById('tabela-vazia');
    const tabela = document.querySelector('table');
    
    if (!listaElement) return;

    // Busca os dados cadastrados realmente no Firebase Firestore
    const listaReais = await DatabaseConnection.obterVoluntarios();
    
    // Une dados reais com dados de Fachada (Mocks)
    const listaCompleta = [...voluntarioMocks, ...listaReais];

    // Atualiza o KPI de voluntários ativos
    const kpiAtivos = document.querySelector('.grid-kpis .kpi-card:nth-child(3) .kpi-value span');
    if (kpiAtivos) {
        kpiAtivos.textContent = listaCompleta.length;
    }

    // Atualiza o KPI de total de horas (média simulada de 6h por voluntário)
    const kpiHoras = document.querySelector('.grid-kpis .kpi-card:nth-child(1) .kpi-value span');
    if (kpiHoras) {
        kpiHoras.textContent = listaCompleta.length * 6;
    }

    // Atualiza o KPI de Investimento Social estimado
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

// Função de Tratamento do Submit do Formulário de Voluntários
async function handleCadastrarVoluntario(event) {
    event.preventDefault(); // Impede o reload da página

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

    // 1. Gravação Real no Firebase Firestore
    const sucesso = await DatabaseConnection.salvarVoluntario(novoVoluntario);

    if (sucesso) {
        // Auditoria IA Simulado via Facade
        const auditoria = GeminiFacade.calcularScore(novoVoluntario);
        
        // Atualiza dinamicamente o Score de Confiança na tela
        const scoreVal = document.querySelector('.score-card .score-value');
        if (scoreVal) {
            scoreVal.textContent = `${auditoria.score}% Certificado pelo Selo ESG Raízes do Bem`;
        }
        const scoreDesc = document.querySelector('.score-card .score-desc');
        if (scoreDesc) {
            scoreDesc.textContent = `${auditoria.status} (${auditoria.selo})`;
        }

        alert(`Voluntário ${nome} vinculado à ONG ${ong} com sucesso!`);
        document.getElementById('cadastro-form').reset();
        
        // Reseta o check-in emocional para o padrão
        const radioAnimado = document.getElementById('checkin-animado');
        if (radioAnimado) radioAnimado.checked = true;

        // 2. Dispara Notificação pelo Observer para atualizar a tabela na hora
        cadastroObserver.notify(novoVoluntario);
    } else {
        alert("Erro ao salvar voluntário no Firebase Firestore.");
    }
}

// Função de Tratamento do Submit do Formulário de Cadastro de ONGs
async function handleCadastrarOng(event) {
    event.preventDefault(); // Impede o reload da página

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

    // 1. Gravação da nova ONG no Firebase Firestore
    const sucesso = await DatabaseConnection.salvarOng(novaOng);

    if (sucesso) {
        alert(`ONG "${nome}" cadastrada com sucesso!`);
        document.getElementById('ong-form').reset();

        // 2. Atualiza dinamicamente o <select> do formulário de voluntários
        await carregarOngs();
    } else {
        alert("Erro ao cadastrar ONG no Firebase Firestore.");
    }
}

// O Observer escuta novos cadastros e reconstrói a tabela reativa
cadastroObserver.subscribe(() => {
    renderizarTabela();
});

// Vincula os listeners diretamente aos formulários no carregamento do script
const formVoluntario = document.getElementById('cadastro-form');
if (formVoluntario) {
    formVoluntario.addEventListener('submit', handleCadastrarVoluntario);
}

const formOng = document.getElementById('ong-form');
if (formOng) {
    formOng.addEventListener('submit', handleCadastrarOng);
}

// Inicializa a carga de dados nos dropdowns e tabelas
carregarOngs();
renderizarTabela();
