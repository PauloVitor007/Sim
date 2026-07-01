// Certifique-se de importar o banco no topo do app.js
import DatabaseConnection from './db.js';

// Função que é chamada quando você clica em cadastrar o voluntário
async function handleCadastrarVoluntario(event) {
    event.preventDefault(); // Evita recarregar a página

    const nome = document.getElementById('nomeVoluntario').value.trim();
    const email = document.getElementById('emailVoluntario').value.trim();
    const ong = document.getElementById('ong-vinculada').value;

    if (!nome || !email) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Obtém o check-in emocional selecionado
    const checkinSelecionado = document.querySelector('input[name="checkin"]:checked')?.value || "Não informado";

    const novoVoluntario = { 
        nome, 
        email, 
        ong, 
        checkinEmocional: checkinSelecionado,
        dataCadastro: new Date().toISOString() 
    };

    // Salva no Firebase aguardando a resposta
    const sucesso = await DatabaseConnection.salvarVoluntario(novoVoluntario);

    if (sucesso) {
        alert(`Voluntário ${nome} vinculado à ONG ${ong} com sucesso!`);
        document.getElementById('cadastro-form').reset();
        // Restaura check-in padrão
        const radioAnimado = document.getElementById('checkin-animado');
        if (radioAnimado) radioAnimado.checked = true;

        await carregarVoluntarios(); // Atualiza a lista exibida na tabela
    } else {
        alert("Erro ao cadastrar voluntário. Verifique o console.");
    }
}

// Função para listar os voluntários gravados no Firebase e atualizar KPIs
async function carregarVoluntarios() {
    const listaElement = document.getElementById('lista-voluntarios');
    const tabelaVazia = document.getElementById('tabela-vazia');
    const tabela = document.querySelector('table');
    
    if (!listaElement) return;

    const lista = await DatabaseConnection.obterVoluntarios();
    
    // Atualiza o KPI de voluntários ativos na tela
    const kpiAtivos = document.querySelector('.grid-kpis .kpi-card:nth-child(3) .kpi-value span');
    if (kpiAtivos) {
        kpiAtivos.textContent = lista.length;
    }

    // Atualiza o KPI de total de horas (simulando 4h por voluntário registrado)
    const kpiHoras = document.querySelector('.grid-kpis .kpi-card:nth-child(1) .kpi-value span');
    if (kpiHoras) {
        kpiHoras.textContent = lista.length * 4;
    }

    if (lista.length === 0) {
        listaElement.innerHTML = '';
        if (tabelaVazia) tabelaVazia.style.display = 'flex';
        if (tabela) tabela.style.display = 'none';
        return;
    }

    if (tabelaVazia) tabelaVazia.style.display = 'none';
    if (tabela) tabela.style.display = 'table';

    listaElement.innerHTML = '';
    lista.forEach(vol => {
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

// Adiciona o evento de submit do formulário e inicia o carregamento de voluntários
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastro-form');
    if (form) {
        form.addEventListener('submit', handleCadastrarVoluntario);
    }
    carregarVoluntarios();
});
