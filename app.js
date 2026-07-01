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

    const novoVoluntario = { 
        nome, 
        email, 
        ong, 
        dataCadastro: new Date().toISOString() 
    };

    // Salva no Firebase aguardando a resposta
    const sucesso = await DatabaseConnection.salvarVoluntario(novoVoluntario);

    if (sucesso) {
        alert(`Voluntário ${nome} vinculado à ONG ${ong} com sucesso!`);
        document.getElementById('cadastro-form').reset();
        await carregarVoluntarios(); // Atualiza a lista exibida na tabela
    } else {
        alert("Erro ao cadastrar voluntário. Verifique o console.");
    }
}

// Função para listar os voluntários gravados no Firebase
async function carregarVoluntarios() {
    const listaElement = document.getElementById('lista-voluntarios');
    if (!listaElement) return;

    const lista = await DatabaseConnection.obterVoluntarios();
    
    if (lista.length === 0) {
        listaElement.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-secondary);">Nenhum voluntário cadastrado.</td>
            </tr>
        `;
        return;
    }

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
