// ================================================================
// MÓDULO: NF-e (SIMPLIFICADO)
// ================================================================

GR.Modules.NFe = {
    render: function() {
        var div = document.getElementById('nfe-content');
        if (!div) return;

        var nfes = GR.State.data.nfes || [];

        if (!nfes.length) {
            div.innerHTML = '<div class="empty-state"><span class="icon">📄</span><div class="message">Nenhuma NF-e cadastrada</div></div>';
            return;
        }

        var html = '<div class="table-responsive"><table><thead><tr><th>Número</th><th>Data</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>';
        nfes.forEach(function(n) {
            var statusBadge = n.status === 'Autorizada' ? '<span class="badge badge-success">✅ Autorizada</span>' :
                n.status === 'Rejeitada' ? '<span class="badge badge-danger">❌ Rejeitada</span>' :
                '<span class="badge badge-warning">⏳ Pendente</span>';
            html += '<tr>' +
                '<td>' + GR.Utils.escapeHtml(n.numero || '-') + '</td>' +
                '<td>' + GR.Utils.formatarDataBR(n.data) + '</td>' +
                '<td>R$ ' + (n.valor || 0).toFixed(2) + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td><button class="btn btn-danger btn-sm" onclick="GR.Modules.NFe.excluir(\'' + n.id + '\')">🗑️</button></td>' +
                '</tr>';
        });
        html += '</tbody></table></div>';
        div.innerHTML = html;
    },

    salvar: function() {
        var numero = document.getElementById('nfe-numero').value.trim();
        var data = document.getElementById('nfe-data').value;
        var valor = parseFloat(document.getElementById('nfe-valor').value) || 0;
        var status = document.getElementById('nfe-status').value;

        if (!numero || !data) {
            GR.Toast.error('Número e data são obrigatórios!');
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
            valor: valor,
            status: status,
            dataCriacao: GR.Utils.now()
        };

        db.collection('users').doc(uid).collection('nfes').add(dados)
            .then(function() {
                GR.Modal.close('modal-nfe');
                GR.Toast.success('NF-e salva!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
    },

    excluir: function(id) {
        if (!confirm('Excluir esta NF-e?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('nfes').doc(id).delete()
            .then(function() {
                GR.Toast.success('NF-e excluída!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    }
};

console.log('✅ Módulo NF-e carregado!');