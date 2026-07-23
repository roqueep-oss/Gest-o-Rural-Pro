// ================================================================
// MÓDULO: HISTÓRICO
// ================================================================

GR.Modules.Historico = {
    render: function() {
        var div = document.getElementById('historico-content');
        if (!div) return;

        var historico = GR.State.data.historico || [];

        if (!historico.length) {
            div.innerHTML = '<div class="empty-state"><span class="icon">📜</span><div class="message">Nenhuma atividade registrada</div></div>';
            return;
        }

        var html = '<div style="max-height:400px;overflow-y:auto;">';
        historico.slice().reverse().forEach(function(h) {
            var data = h.timestamp ? new Date(h.timestamp).toLocaleString() : 'Data desconhecida';
            html += '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;">' +
                '<span style="color:var(--text-light);min-width:140px;">' + data + '</span>' +
                '<span style="font-weight:500;">' + GR.Utils.escapeHtml(h.acao || '') + '</span>' +
                '<span style="color:var(--text-light);">' + GR.Utils.escapeHtml(h.modulo || '') + '</span>' +
                '<span style="color:var(--text-light);font-size:11px;">' + GR.Utils.escapeHtml(h.detalhes || '') + '</span>' +
                '</div>';
        });
        html += '</div>';

        html += '<div style="margin-top:8px;">' +
            '<button class="btn btn-danger" onclick="GR.Modules.Historico.limpar()">🗑️ Limpar Histórico</button>' +
            '</div>';

        div.innerHTML = html;
    },

    limpar: function() {
        if (!confirm('Limpar todo o histórico?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('historico').get().then(function(snapshot) {
            var batch = db.batch();
            snapshot.forEach(function(doc) { batch.delete(doc.ref); });
            return batch.commit();
        }).then(function() {
            GR.State.data.historico = [];
            GR.Toast.success('Histórico limpo!');
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro ao limpar: ' + err.message);
        });
    }
};

console.log('✅ Módulo Histórico carregado!');