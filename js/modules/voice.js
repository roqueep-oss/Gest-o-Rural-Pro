// ================================================================
// MÓDULO: VOICE (COMANDOS DE VOZ)
// ================================================================

GR.Voice = {
    reconhecimento: null,
    ativo: false,

    iniciar: function() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            GR.Toast.error('Navegador não suporta comandos de voz.');
            return;
        }

        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.reconhecimento = new SpeechRecognition();
        this.reconhecimento.lang = 'pt-BR';
        this.reconhecimento.continuous = true;
        this.reconhecimento.interimResults = true;

        var self = this;
        this.reconhecimento.onresult = function(event) {
            for (var i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    var comando = event.results[i][0].transcript.toLowerCase().trim();
                    self._processarComando(comando);
                }
            }
        };

        this.reconhecimento.onerror = function(event) {
            console.error('Erro no reconhecimento de voz:', event.error);
            if (event.error === 'not-allowed') {
                GR.Toast.error('Permissão de microfone negada.');
            }
        };

        try {
            this.reconhecimento.start();
            this.ativo = true;
            GR.Toast.success('🎤 Comandos de voz ativados! Diga "ajuda" para ver os comandos.');
            var status = document.getElementById('voice-status');
            if (status) { status.textContent = '🎤 Ativo';
                status.className = 'ativo'; }
        } catch (e) {
            GR.Toast.error('Erro ao iniciar voz: ' + e.message);
        }
    },

    _processarComando: function(comando) {
        console.log('Comando de voz:', comando);

        var acoes = {
            'dashboard': function() { GR.UI.mudarView('dashboard'); },
            'tarefas': function() { GR.UI.mudarView('acoes'); },
            'financeiro': function() { GR.UI.mudarView('contabilidade'); },
            'estoque': function() { GR.UI.mudarView('insumos'); },
            'pecuária': function() { GR.UI.mudarView('pecuaria'); },
            'funcionários': function() { GR.UI.mudarView('funcionarios'); },
            'documentos': function() { GR.UI.mudarView('documentos'); },
            'análises': function() { GR.UI.mudarView('analises'); },
            'viveiro': function() { GR.UI.mudarView('viveiro'); },
            'relatórios': function() { GR.UI.mudarView('relatorios'); },
            'configurações': function() { GR.UI.mudarView('configuracoes'); },
            'histórico': function() { GR.UI.mudarView('historico'); },
            'ajuda': function() {
                GR.Toast.info('Comandos: dashboard, tarefas, financeiro, estoque, pecuária, funcionários, documentos, análises, viveiro, relatórios, configurações, histórico');
            },
            'parar': function() { GR.Voice.parar(); }
        };

        for (var key in acoes) {
            if (comando.includes(key)) {
                acoes[key]();
                GR.Voice._falar('Comando ' + key + ' executado.');
                return;
            }
        }

        GR.Toast.info('Comando não reconhecido: "' + comando + '". Diga "ajuda" para ver os comandos.');
    },

    _falar: function(texto) {
        if (!('speechSynthesis' in window)) return;
        var utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    },

    parar: function() {
        if (this.reconhecimento) {
            try { this.reconhecimento.stop(); } catch (e) {}
            this.reconhecimento = null;
        }
        this.ativo = false;
        var status = document.getElementById('voice-status');
        if (status) { status.textContent = '🔇 Inativo';
            status.className = 'inativo'; }
        GR.Toast.info('Comandos de voz desativados.');
    }
};

console.log('✅ Módulo Voice carregado!');