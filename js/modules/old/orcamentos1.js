// ================================================================
// MÓDULO: ORÇAMENTOS
// ================================================================

GR.Modules.Orcamentos = {
    render: function() {
        var div = document.getElementById('lista-orcamentos');
        if (!div) return;
        var items = GR.State.data.orcamentos || [];
        var filtrados = items.filter(function(item) {
            if (GR.State.ui.propriedadeAtiva === 'todas') return true;
            return item.propriedade === GR.State.ui.propriedadeAtiva;
        });

        if (!filtrados.length) {
            div.innerHTML = '<div class="empty-state"><span class="icon">💰</span><div class="message">Nenhum orçamento cadastrado</div></div>';
            return;
        }

        var html = '<div class="table-responsive"><table><thead><tr><th>Nº</th><th>Data</th><th>Empresa/Pessoa</th><th>Valor</th><th>Status</th><th>Propriedade</th><th>Ações</th></tr></thead><tbody>';
        filtrados.forEach(function(o) {
            var statusBadge = o.status === 'Aprovado' ? '<span class="badge badge-success">Aprovado</span>' :
                o.status === 'Recusado' ? '<span class="badge badge-danger">Recusado</span>' :
                '<span class="badge badge-warning">Pendente</span>';
            html += '<tr>' +
                '<td><strong>' + GR.Utils.escapeHtml(o.numero) + '</strong></td>' +
                '<td>' + GR.Utils.formatarDataBR(o.data) + '</td>' +
                '<td>' + GR.Utils.escapeHtml(o.nome) + '</td>' +
                '<td>' + GR.Utils.formatarMoedaBR(o.valor) + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + GR.Utils.escapeHtml(o.propriedade || '-') + '</td>' +
                '<td><button class="btn btn-danger btn-sm" onclick="GR.Modules.Orcamentos.excluir(\'' + o.id + '\')">🗑️</button></td>' +
                '</tr>';
        });
        html += '</tbody></table></div>';
        div.innerHTML = html;
    },

    salvar: function() {
        var numero = document.getElementById('orc-numero').value.trim();
        var data = document.getElementById('orc-data').value;
        var nome = document.getElementById('orc-nome').value.trim();
        var cpfcnpj = document.getElementById('orc-cpfcnpj').value.trim();
        var valor = GR.Utils.parseMoedaBR(document.getElementById('orc-valor').value);
        var status = document.getElementById('orc-status').value;
        var prop = document.getElementById('orc-propriedade').value;

        if (!numero || !data || !nome || !cpfcnpj || !valor) {
            GR.Toast.error('Campos obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            numero: GR.Utils.escapeHtml(numero),
            data: data,
            nome: GR.Utils.escapeHtml(nome),
            cpfcnpj: cpfcnpj,
            valor: valor || 0,
            status: status,
            propriedade: GR.Utils.escapeHtml(prop),
            dataCriacao: GR.Utils.now()
        };

        db.collection('users').doc(uid).collection('orcamentos').add(dados)
            .then(function() {
                GR.Modal.close('modal-orcamento');
                GR.Toast.success('Orçamento salvo!');
                GR.State.adicionarHistorico('criou orçamento', 'Orçamentos', 'Orçamento: ' + numero);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
    },

    excluir: function(id) {
        if (!confirm('Excluir este orçamento?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        db.collection('users').doc(uid).collection('orcamentos').doc(id).delete()
            .then(function() {
                GR.Toast.success('Excluído!');
                GR.State.adicionarHistorico('excluiu orçamento', 'Orçamentos', 'Orçamento ID: ' + id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    }
};

console.log('✅ Módulo Orçamentos carregado!');