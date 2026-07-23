// ================================================================
// MÓDULO: NOTIFICAÇÕES
// ================================================================

GR.Notificacoes = {
    abrirModal: function() {
        this.render();
        GR.Modal.open('modal-notificacoes');
    },

    render: function() {
        var div = document.getElementById('lista-notificacoes');
        if (!div) return;

        var notificacoes = GR.State.data.notificacoes || [];

        if (!notificacoes.length) {
            div.innerHTML = '<div class="empty-state"><span class="icon">🔔</span><div class="message">Nenhuma notificação</div></div>';
            return;
        }

        var html = '';
        notificacoes.slice().reverse().forEach(function(n) {
            var lida = n.lida ? 'lida' : '';
            var data = n.data ? new Date(n.data).toLocaleString() : '';
            html += '<div class="notificacao-item ' + lida + '">' +
                '<span class="notificacao-data">' + data + '</span>' +
                '<div class="notificacao-titulo">' + GR.Utils.escapeHtml(n.titulo || 'Notificação') + '</div>' +
                '<div class="notificacao-mensagem">' + GR.Utils.escapeHtml(n.mensagem || '') + '</div>' +
                '</div>';
        });

        div.innerHTML = html;
    },

    marcarTodasLidas: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        var ref = db.collection('users').doc(uid).collection('notificacoes');
        ref.where('lida', '==', false).get().then(function(snapshot) {
            var batch = db.batch();
            snapshot.forEach(function(doc) { batch.update(doc.ref, { lida: true }); });
            return batch.commit();
        }).then(function() {
            GR.Toast.success('Notificações marcadas como lidas!');
            GR.State.carregarDados().then(function() { GR.UI.refreshCurrentView(); });
            GR.Modal.close('modal-notificacoes');
        }).catch(function(err) {
            GR.Toast.error('Erro: ' + err.message);
        });
    },

    limparTodas: function() {
        if (!confirm('Limpar todas as notificações?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('notificacoes').get().then(function(snapshot) {
            var batch = db.batch();
            snapshot.forEach(function(doc) { batch.delete(doc.ref); });
            return batch.commit();
        }).then(function() {
            GR.State.data.notificacoes = [];
            GR.Toast.success('Notificações limpas!');
            GR.UI.refreshCurrentView();
            GR.Modal.close('modal-notificacoes');
        }).catch(function(err) {
            GR.Toast.error('Erro: ' + err.message);
        });
    },

    adicionar: function(titulo, mensagem) {
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        var dados = {
            titulo: titulo,
            mensagem: mensagem,
            lida: false,
            data: GR.Utils.now()
        };

        db.collection('users').doc(uid).collection('notificacoes').add(dados)
            .then(function() {
                if (GR.State.data.notificacoes) {
                    GR.State.data.notificacoes.push(dados);
                }
                GR.UI.atualizarBadgeNotificacoes();
            })
            .catch(function(err) { console.error('Erro ao adicionar notificação:', err); });
    }
};

console.log('✅ Módulo Notificações carregado!');