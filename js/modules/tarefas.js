// ================================================================
// MÓDULO: TAREFAS (AÇÕES) - VERSÃO COMPLETA COM WHATSAPP
// ================================================================

GR.Modules.Tarefas = {
    // ============================================================
    // CONFIGURAÇÕES
    // ============================================================
    _config: {
        camposObrigatorios: ['tipo', 'data', 'responsavel'],
        tiposAcao: [
            'Visita Técnica',
            'Manutenção',
            'Reunião',
            'Ligação',
            'E-mail',
            'Documentação',
            'Agendamento',
            'Fiscalização',
            'Plantio',
            'Colheita',
            'Outro'
        ],
        coresPorTipo: {
            'Visita Técnica': '#4CAF50',
            'Manutenção': '#FF9800',
            'Reunião': '#2196F3',
            'Ligação': '#9C27B0',
            'E-mail': '#00BCD4',
            'Documentação': '#F44336',
            'Agendamento': '#795548',
            'Fiscalização': '#607D8B',
            'Plantio': '#8BC34A',
            'Colheita': '#FFC107',
            'Outro': '#9E9E9E'
        },
        iconesPorTipo: {
            'Visita Técnica': '🔧',
            'Manutenção': '🛠️',
            'Reunião': '🤝',
            'Ligação': '📞',
            'E-mail': '📧',
            'Documentação': '📄',
            'Agendamento': '📅',
            'Fiscalização': '🔍',
            'Plantio': '🌱',
            'Colheita': '🌾',
            'Outro': '📌'
        },
        whatsapp: {
            numeroPadrao: '55',
            mensagemTemplate: {
                lembrete: '🔔 *LEMBRETE DE AÇÃO*\n\n' +
                          '📋 *Tipo:* {tipo}\n' +
                          '📅 *Data:* {data}\n' +
                          '👤 *Responsável:* {responsavel}\n' +
                          '💰 *Custo:* {custo}\n' +
                          '🏠 *Propriedade:* {propriedade}\n\n' +
                          '⚠️ *Ação pendente!*',
                confirmacao: '✅ *AÇÃO CONCLUÍDA*\n\n' +
                             '📋 *Tipo:* {tipo}\n' +
                             '📅 *Data:* {data}\n' +
                             '👤 *Responsável:* {responsavel}\n' +
                             '💰 *Custo:* {custo}\n' +
                             '🏠 *Propriedade:* {propriedade}\n\n' +
                             '✅ *Ação realizada com sucesso!*',
                atraso: '⚠️ *AÇÃO ATRASADA*\n\n' +
                        '📋 *Tipo:* {tipo}\n' +
                        '📅 *Data programada:* {data}\n' +
                        '👤 *Responsável:* {responsavel}\n' +
                        '💰 *Custo:* {custo}\n' +
                        '🏠 *Propriedade:* {propriedade}\n\n' +
                        '🕐 *Esta ação está atrasada!*'
            }
        }
    },

    // ============================================================
    // FUNÇÃO UTILITÁRIA PARA EXTRAIR TELEFONE (CORRIGIDA)
    // ============================================================
    _extrairTelefone: function(valor) {
        if (!valor) return '';
        
        // Se for string
        if (typeof valor === 'string') {
            // Remove caracteres não numéricos
            const numeros = valor.replace(/\D/g, '');
            
            // Tenta extrair do formato "numero:996321008,ddd:27"
            const matchNumero = valor.match(/numero[:.]?\s*(\d+)/i);
            const matchDdd = valor.match(/ddd[:.]?\s*(\d+)/i);
            
            if (matchNumero && matchDdd) {
                const ddd = matchDdd[1].replace(/\D/g, '');
                const numero = matchNumero[1].replace(/\D/g, '');
                if (ddd && numero) {
                    return ddd + numero;
                }
                return numero;
            }
            
            // Se tiver 10 ou 11 dígitos, é um número válido
            if (numeros.length >= 10) {
                return numeros;
            }
            
            return numeros;
        }
        
        // Se for objeto
        if (typeof valor === 'object' && valor !== null) {
            const num = valor.numero || valor.telefone || valor.phone || '';
            const ddd = valor.ddd || valor.DDD || '';
            const numStr = String(num).replace(/\D/g, '');
            const dddStr = String(ddd).replace(/\D/g, '');
            
            if (dddStr && numStr) {
                return dddStr + numStr;
            }
            return numStr;
        }
        
        // Se for número
        if (typeof valor === 'number') {
            return String(valor).replace(/\D/g, '');
        }
        
        return '';
    },

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    init: function() {
        console.log('🔄 Inicializando módulo Tarefas com WhatsApp...');
        this._carregarSugestoes();
        this._configurarEventos();
        this._popularDatalistPartes();
    },

    // ============================================================
    // EVENTOS
    // ============================================================
    _configurarEventos: function() {
        var respInput = document.getElementById('tarefa-responsavel');
        if (respInput) {
            respInput.addEventListener('input', function() {
                GR.Modules.Tarefas._preencherTelefoneAutomatico(this.value);
            });
            respInput.addEventListener('change', function() {
                GR.Modules.Tarefas._preencherTelefoneAutomatico(this.value);
            });
        }

        var tipoInput = document.getElementById('tarefa-tipo');
        if (tipoInput) {
            tipoInput.addEventListener('focus', function() {
                GR.Modules.Tarefas._popularSugestoesAcoes();
            });
            tipoInput.addEventListener('change', function() {
                GR.Modules.Tarefas._sugerirCustoPadrao(this.value);
            });
        }
    },

    // ============================================================
    // DATALIST DE PARTES
    // ============================================================
    _popularDatalistPartes: function() {
        var datalist = document.getElementById('partes-list');
        if (!datalist) return;

        var partes = GR.State.data.partesRelacionadas || [];
        var funcionarios = GR.State.data.funcionarios || [];
        var todas = [...partes, ...funcionarios];

        datalist.innerHTML = '';
        todas.forEach(function(item) {
            var option = document.createElement('option');
            var nome = item.nome || item.name || '';
            option.value = nome;
            option.dataset.cpf = item.cpf || item.documento || '';
            
            var telefone = GR.Modules.Tarefas._extrairTelefone(item.telefone || item.phone || '');
            option.dataset.telefone = telefone;
            option.dataset.whatsapp = telefone;
            datalist.appendChild(option);
        });
    },

    // ============================================================
    // SUGESTÕES
    // ============================================================
    _carregarSugestoes: function() {
        var datalist = document.getElementById('acoes-sugestoes');
        if (!datalist) return;

        var tarefas = GR.State.data.tarefas || [];
        var tiposExistentes = new Set();
        tarefas.forEach(function(t) {
            if (t.tipo) tiposExistentes.add(t.tipo);
        });

        var todosTipos = [...new Set([...this._config.tiposAcao, ...tiposExistentes])];
        todosTipos.sort();

        datalist.innerHTML = '';
        todosTipos.forEach(function(tipo) {
            var option = document.createElement('option');
            option.value = tipo;
            datalist.appendChild(option);
        });
    },

    _popularSugestoesAcoes: function() {
        this._carregarSugestoes();
    },

    // ============================================================
    // PREENCHIMENTO AUTOMÁTICO
    // ============================================================
    _preencherTelefoneAutomatico: function(nome) {
        if (!nome || nome.trim() === '') {
            document.getElementById('tarefa-telefone').value = '';
            document.getElementById('parte-info-container').style.display = 'none';
            return;
        }

        var partes = GR.State.data.partesRelacionadas || [];
        var funcionarios = GR.State.data.funcionarios || [];
        var todas = [...partes, ...funcionarios];

        var encontrado = todas.find(function(item) {
            var itemNome = item.nome || item.name || '';
            return itemNome.toLowerCase() === nome.toLowerCase().trim();
        });

        if (encontrado) {
            var telefone = GR.Modules.Tarefas._extrairTelefone(encontrado.telefone || encontrado.phone || '');
            document.getElementById('tarefa-telefone').value = telefone;

            var container = document.getElementById('parte-info-container');
            if (container) {
                container.style.display = 'block';
                document.getElementById('parte-nome-exibicao').textContent = encontrado.nome || encontrado.name || '';
                document.getElementById('parte-cpf-exibicao').textContent = encontrado.cpf || encontrado.documento || 'N/A';
                document.getElementById('parte-telefone-exibicao').textContent = telefone || 'N/A';
            }
        } else {
            document.getElementById('tarefa-telefone').value = '';
            document.getElementById('parte-info-container').style.display = 'none';
        }
    },

    _sugerirCustoPadrao: function(tipo) {
        var sugestoes = {
            'Visita Técnica': 150,
            'Manutenção': 200,
            'Reunião': 50,
            'Ligação': 10,
            'Documentação': 30,
            'Agendamento': 25,
            'Fiscalização': 120,
            'Plantio': 300,
            'Colheita': 350
        };

        if (tipo && sugestoes[tipo]) {
            var custoInput = document.getElementById('tarefa-custo');
            if (custoInput && custoInput.value === '0,00') {
                custoInput.value = sugestoes[tipo].toFixed(2).replace('.', ',');
            }
        }
    },

    // ============================================================
    // WHATSAPP - ENVIO DE MENSAGENS (CORRIGIDO)
    // ============================================================
    
    enviarWhatsApp: function(numero, mensagem) {
        var numeroExtraido = this._extrairTelefone(numero);
        
        if (!numeroExtraido || numeroExtraido.length < 10) {
            console.warn('⚠️ Número de WhatsApp inválido:', numero);
            GR.Toast.warning('⚠️ Número de telefone inválido ou incompleto');
            return false;
        }

        // 🔥 CORREÇÃO: Garantir que o número tenha DDD + código do país
        var numeroLimpo = numeroExtraido;
        
        // Se tiver 10 dígitos (DDD + 8 dígitos) ou 11 dígitos (DDD + 9 dígitos)
        if (numeroLimpo.length === 10 || numeroLimpo.length === 11) {
            if (!numeroLimpo.startsWith('55')) {
                numeroLimpo = '55' + numeroLimpo;
            }
        } else {
            console.warn('⚠️ Número com formato inválido:', numeroLimpo);
            GR.Toast.warning('⚠️ Número deve ter DDD + 8 ou 9 dígitos');
            return false;
        }

        var mensagemStr = String(mensagem || '');
        var mensagemCodificada = encodeURIComponent(mensagemStr);
        var url = 'https://wa.me/' + numeroLimpo + '?text=' + mensagemCodificada;
        
        console.log('📱 Abrindo WhatsApp para:', numeroLimpo);
        window.open(url, '_blank');
        GR.Toast.success('📱 Abrindo WhatsApp...');
        return true;
    },

    enviarLembreteWhatsApp: function(id) {
        try {
            if (!id) {
                console.warn('⚠️ ID da ação não informado');
                return;
            }

            var item = GR.State.data.tarefas.find(function(t) { 
                return t.id === id; 
            });
            
            if (!item) {
                console.warn('⚠️ Ação não encontrada: ' + id);
                return;
            }

            var telefone = this._buscarTelefoneResponsavel(item.responsavel);
            
            if (!telefone) {
                GR.Toast.warning('⚠️ Número de WhatsApp não encontrado para: ' + item.responsavel);
                return;
            }

            var mensagem = this._config.whatsapp.mensagemTemplate.lembrete
                .replace(/{tipo}/g, item.tipo || '')
                .replace(/{data}/g, GR.Utils.formatarDataBR(item.data) || '')
                .replace(/{responsavel}/g, item.responsavel || '')
                .replace(/{custo}/g, GR.Utils.formatarMoedaBR(item.custo) || 'R$ 0,00')
                .replace(/{propriedade}/g, item.propriedade || '-');

            var enviado = this.enviarWhatsApp(telefone, mensagem);
            
            if (enviado) {
                GR.State.adicionarHistorico(
                    'enviou lembrete WhatsApp', 
                    'Ações', 
                    'Lembrete: ' + item.tipo + ' para ' + item.responsavel
                );
            }
        } catch (err) {
            console.error('❌ Erro ao enviar lembrete WhatsApp:', err);
        }
    },

    _buscarTelefoneResponsavel: function(nome) {
        try {
            if (!nome) return null;

            var partes = GR.State.data.partesRelacionadas || [];
            var funcionarios = GR.State.data.funcionarios || [];
            var todas = [...partes, ...funcionarios];

            var encontrado = todas.find(function(item) {
                var itemNome = item.nome || item.name || '';
                return itemNome.toLowerCase() === nome.toLowerCase().trim();
            });

            if (encontrado) {
                var telefone = encontrado.whatsapp || encontrado.telefone || encontrado.phone || null;
                return this._extrairTelefone(telefone) || null;
            }

            return null;
        } catch (err) {
            console.error('❌ Erro ao buscar telefone:', err);
            return null;
        }
    },

    enviarConfirmacaoWhatsApp: function(id) {
        try {
            if (!id) {
                console.warn('⚠️ ID da ação não informado');
                return;
            }

            var item = GR.State.data.tarefas.find(function(t) { 
                return t.id === id; 
            });
            
            if (!item) {
                console.warn('⚠️ Ação não encontrada: ' + id);
                return;
            }

            var telefone = this._buscarTelefoneResponsavel(item.responsavel);
            
            if (!telefone) {
                GR.Toast.warning('⚠️ Número de WhatsApp não encontrado para: ' + item.responsavel);
                return;
            }

            var mensagem = this._config.whatsapp.mensagemTemplate.confirmacao
                .replace(/{tipo}/g, item.tipo || '')
                .replace(/{data}/g, GR.Utils.formatarDataBR(item.data) || '')
                .replace(/{responsavel}/g, item.responsavel || '')
                .replace(/{custo}/g, GR.Utils.formatarMoedaBR(item.custo) || 'R$ 0,00')
                .replace(/{propriedade}/g, item.propriedade || '-');

            var enviado = this.enviarWhatsApp(telefone, mensagem);
            
            if (enviado) {
                GR.State.adicionarHistorico(
                    'enviou confirmação WhatsApp', 
                    'Ações', 
                    'Confirmação: ' + item.tipo + ' - ' + item.responsavel
                );
            }
        } catch (err) {
            console.error('❌ Erro ao enviar confirmação WhatsApp:', err);
        }
    },

    enviarAtrasoWhatsApp: function(id) {
        try {
            if (!id) {
                console.warn('⚠️ ID da ação não informado');
                return;
            }

            var item = GR.State.data.tarefas.find(function(t) { 
                return t.id === id; 
            });
            
            if (!item) {
                console.warn('⚠️ Ação não encontrada: ' + id);
                return;
            }

            var telefone = this._buscarTelefoneResponsavel(item.responsavel);
            
            if (!telefone) {
                GR.Toast.warning('⚠️ Número de WhatsApp não encontrado para: ' + item.responsavel);
                return;
            }

            var mensagem = this._config.whatsapp.mensagemTemplate.atraso
                .replace(/{tipo}/g, item.tipo || '')
                .replace(/{data}/g, GR.Utils.formatarDataBR(item.data) || '')
                .replace(/{responsavel}/g, item.responsavel || '')
                .replace(/{custo}/g, GR.Utils.formatarMoedaBR(item.custo) || 'R$ 0,00')
                .replace(/{propriedade}/g, item.propriedade || '-');

            var enviado = this.enviarWhatsApp(telefone, mensagem);
            
            if (enviado) {
                GR.State.adicionarHistorico(
                    'enviou aviso de atraso WhatsApp', 
                    'Ações', 
                    'Aviso atraso: ' + item.tipo + ' - ' + item.responsavel
                );
            }
        } catch (err) {
            console.error('❌ Erro ao enviar aviso de atraso:', err);
        }
    },

    enviarLembretesDiarios: function() {
        try {
            var items = this._filtrarTarefas();
            var hoje = new Date().toISOString().split('T')[0];
            
            var acoesHoje = items.filter(function(t) {
                return t.data === hoje;
            });

            if (acoesHoje.length === 0) {
                GR.Toast.info('📭 Nenhuma ação agendada para hoje');
                return;
            }

            var enviados = 0;
            var naoEncontrados = 0;

            acoesHoje.forEach(function(item) {
                var telefone = GR.Modules.Tarefas._buscarTelefoneResponsavel(item.responsavel);
                if (telefone) {
                    var mensagem = GR.Modules.Tarefas._config.whatsapp.mensagemTemplate.lembrete
                        .replace(/{tipo}/g, item.tipo || '')
                        .replace(/{data}/g, GR.Utils.formatarDataBR(item.data) || '')
                        .replace(/{responsavel}/g, item.responsavel || '')
                        .replace(/{custo}/g, GR.Utils.formatarMoedaBR(item.custo) || 'R$ 0,00')
                        .replace(/{propriedade}/g, item.propriedade || '-');
                    
                    var enviado = GR.Modules.Tarefas.enviarWhatsApp(telefone, mensagem);
                    if (enviado) enviados++;
                } else {
                    naoEncontrados++;
                }
            });

            GR.Toast.success('📱 Lembretes enviados: ' + enviados + ' | Não encontrados: ' + naoEncontrados);
            
            if (enviados > 0) {
                GR.State.adicionarHistorico(
                    'enviou lembretes diários', 
                    'Ações', 
                    'Lembretes enviados: ' + enviados + ' ações'
                );
            }
        } catch (err) {
            console.error('❌ Erro ao enviar lembretes diários:', err);
            GR.Toast.error('❌ Erro ao enviar lembretes');
        }
    },

    // ============================================================
    // VERIFICAÇÕES AUTOMÁTICAS (DESATIVADAS)
    // ============================================================
    _verificarAcoesAtrasadas: function() {},
    _marcarAvisoAtraso: function(id) {},
    _verificarLembretes: function() {},
    _marcarLembreteEnviado: function(id) {},

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    render: function() {
        var div = document.getElementById('lista-acoes');
        if (!div) {
            console.warn('⚠️ Elemento lista-acoes não encontrado');
            return;
        }

        var items = this._filtrarTarefas();
        var html = this._gerarLayout(items);
        div.innerHTML = html;
        
        this._atualizarEstatisticas(items);
        this._popularDatalistPartes();
        this._carregarSugestoes();
    },

    // ============================================================
    // FILTRAGEM
    // ============================================================
    _filtrarTarefas: function() {
        var items = GR.State.filtrarPorPropriedade(
            GR.State.data.tarefas || [], 
            'propriedade'
        );

        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }

        items.sort(function(a, b) {
            return new Date(b.data) - new Date(a.data);
        });

        return items;
    },

    // ============================================================
    // GERAÇÃO DE LAYOUT
    // ============================================================
    _gerarLayout: function(items) {
        if (!items.length) {
            return this._gerarEmptyState();
        }

        var html = this._gerarCabecalhoEstatisticas(items);
        html += this._gerarTabela(items);
        return html;
    },

    _gerarEmptyState: function() {
        return `
            <div class="empty-state">
                <span class="icon">📋</span>
                <div class="message">Nenhuma ação cadastrada</div>
                <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                    <button class="btn btn-primary" onclick="GR.Modules.Tarefas.abrirModal()">
                        ➕ Criar Primeira Ação
                    </button>
                    <button class="btn btn-success" onclick="GR.Modules.Tarefas.enviarLembretesDiarios()">
                        📱 Enviar Lembretes
                    </button>
                </div>
            </div>
        `;
    },

    _gerarCabecalhoEstatisticas: function(items) {
        var total = items.length;
        var custoTotal = items.reduce(function(sum, t) { 
            return sum + (t.custo || 0); 
        }, 0);
        
        var tipos = {};
        items.forEach(function(t) {
            var tipo = t.tipo || 'Outro';
            tipos[tipo] = (tipos[tipo] || 0) + 1;
        });
        
        var tipoMaisFrequente = '';
        var maxCount = 0;
        for (var key in tipos) {
            if (tipos[key] > maxCount) {
                maxCount = tipos[key];
                tipoMaisFrequente = key;
            }
        }

        var hoje = new Date();
        var proximos7Dias = items.filter(function(t) {
            var data = new Date(t.data);
            var diff = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
            return diff >= 0 && diff <= 7;
        });

        var atrasadas = items.filter(function(t) {
            return new Date(t.data) < hoje && !t.concluida;
        });

        return `
            <div class="stats-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;">
                <div class="stat-card" style="background:var(--surface);padding:12px;border-radius:8px;border:1px solid var(--border);text-align:center;">
                    <div class="stat-number" style="font-size:24px;font-weight:700;">${total}</div>
                    <div class="stat-label" style="font-size:12px;color:var(--text-light);">Total de Ações</div>
                </div>
                <div class="stat-card" style="background:var(--surface);padding:12px;border-radius:8px;border:1px solid var(--border);text-align:center;">
                    <div class="stat-number" style="font-size:24px;font-weight:700;">${GR.Utils.formatarMoedaBR(custoTotal)}</div>
                    <div class="stat-label" style="font-size:12px;color:var(--text-light);">Custo Total</div>
                </div>
                <div class="stat-card" style="background:var(--surface);padding:12px;border-radius:8px;border:1px solid var(--border);text-align:center;">
                    <div class="stat-number" style="font-size:24px;font-weight:700;color:${atrasadas.length > 0 ? '#f44336' : 'inherit'};">${atrasadas.length}</div>
                    <div class="stat-label" style="font-size:12px;color:var(--text-light);">⚠️ Atrasadas</div>
                </div>
                <div class="stat-card" style="background:var(--surface);padding:12px;border-radius:8px;border:1px solid var(--border);text-align:center;">
                    <div class="stat-number" style="font-size:24px;font-weight:700;">${proximos7Dias.length}</div>
                    <div class="stat-label" style="font-size:12px;color:var(--text-light);">Próximos 7 Dias</div>
                </div>
                <div class="stat-card" style="background:var(--surface);padding:12px;border-radius:8px;border:1px solid var(--border);text-align:center;">
                    <div class="stat-number" style="font-size:24px;font-weight:700;">${items.length > 0 ? 'R$ ' + Math.round(custoTotal / items.length) : 'R$ 0'}</div>
                    <div class="stat-label" style="font-size:12px;color:var(--text-light);">Custo Médio</div>
                </div>
            </div>
        `;
    },

    _gerarTabela: function(items) {
        var html = `
            <div class="table-responsive">
                <div class="table-toolbar" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding:8px 12px;background:var(--surface);border-radius:6px;border:1px solid var(--border);flex-wrap:wrap;gap:8px;">
                    <div class="toolbar-left" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <span style="font-size:13px;">📋 <strong>${items.length}</strong> ações</span>
                        <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Tarefas._alternarVisao()" style="font-size:11px;padding:2px 10px;">
                            👁️ Alternar Visão
                        </button>
                    </div>
                    <div class="toolbar-right" style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Tarefas.abrirModal()">
                            ➕ Nova Ação
                        </button>
                        <button class="btn btn-success btn-sm" onclick="GR.Modules.Tarefas.enviarLembretesDiarios()">
                            📱 Enviar Lembretes
                        </button>
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Tarefas.exportarCSV()">
                            📥 CSV
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="GR.Modules.Tarefas.exportarPDF()">
                            📄 PDF
                        </button>
                    </div>
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                    <thead>
                        <tr style="border-bottom:2px solid var(--border);">
                            <th style="padding:8px;text-align:left;">Tipo</th>
                            <th style="padding:8px;text-align:left;">Data</th>
                            <th style="padding:8px;text-align:left;">Responsável</th>
                            <th style="padding:8px;text-align:right;">Custo</th>
                            <th style="padding:8px;text-align:left;">Propriedade</th>
                            <th style="padding:8px;text-align:center;">Status</th>
                            <th style="padding:8px;text-align:center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        items.forEach(function(t) {
            html += this._gerarLinha(t);
        }, this);

        html += `
                    </tbody>
                </table>
            </div>
        `;
        return html;
    },

    _gerarLinha: function(t) {
        var cor = this._config.coresPorTipo[t.tipo] || '#9E9E9E';
        var icone = this._config.iconesPorTipo[t.tipo] || '📌';
        var custoFormatado = GR.Utils.formatarMoedaBR(t.custo);
        
        var hoje = new Date();
        var data = new Date(t.data);
        var diff = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
        
        var statusHtml = '';
        if (t.concluida) {
            statusHtml = '<span style="color:#4CAF50;">✅ Concluída</span>';
        } else if (diff < 0) {
            statusHtml = '<span style="color:#f44336;">⚠️ Atrasada</span>';
        } else if (diff <= 3) {
            statusHtml = '<span style="color:#FF9800;">⏳ Próxima</span>';
        } else {
            statusHtml = '<span style="color:#2196F3;">📋 Pendente</span>';
        }

        var telefone = this._buscarTelefoneResponsavel(t.responsavel);
        var temWhatsApp = !!telefone && telefone.length >= 10;
        
        return `
            <tr style="border-bottom:1px solid var(--border-light);${diff < 0 && !t.concluida ? 'background:#fff3e0;' : ''}">
                <td style="padding:8px;">
                    <span class="tipo-badge" style="background-color:${cor};color:#fff;padding:2px 10px;border-radius:12px;font-size:0.8rem;display:inline-block;">
                        ${icone} ${GR.Utils.escapeHtml(t.tipo)}
                    </span>
                </td>
                <td style="padding:8px;">
                    ${GR.Utils.formatarDataBR(t.data)}
                    ${diff < 0 && !t.concluida ? ' <span style="font-size:10px;color:#f44336;">(Atrasado)</span>' : ''}
                    ${diff >= 0 && diff <= 3 && !t.concluida ? ' <span style="font-size:10px;color:#FF9800;">(Próximo)</span>' : ''}
                </td>
                <td style="padding:8px;">
                    <span style="display:flex;align-items:center;gap:4px;">
                        <span>👤</span>
                        ${GR.Utils.escapeHtml(t.responsavel)}
                        ${t.telefone ? `<span style="font-size:10px;color:var(--text-light);">(${GR.Utils.escapeHtml(t.telefone)})</span>` : ''}
                        ${temWhatsApp ? ' <span style="font-size:10px;color:#25D366;">📱</span>' : ''}
                    </span>
                </td>
                <td style="padding:8px;text-align:right;font-weight:600;">
                    ${custoFormatado}
                </td>
                <td style="padding:8px;">
                    <span style="background:var(--bg);padding:2px 8px;border-radius:4px;font-size:0.8rem;">
                        ${GR.Utils.escapeHtml(t.propriedade || '-')}
                    </span>
                </td>
                <td style="padding:8px;text-align:center;font-size:12px;">
                    ${statusHtml}
                </td>
                <td style="padding:8px;text-align:center;">
                    <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Tarefas.abrirModal('${t.id}')" style="font-size:11px;padding:3px 8px;" title="Editar">
                            ✏️
                        </button>
                        ${!t.concluida ? `
                            <button class="btn btn-success btn-sm" onclick="GR.Modules.Tarefas.marcarConcluida('${t.id}')" style="font-size:11px;padding:3px 8px;" title="Marcar como concluída">
                                ✅
                            </button>
                        ` : ''}
                        ${temWhatsApp ? `
                            <button class="btn btn-success btn-sm" onclick="GR.Modules.Tarefas.enviarLembreteWhatsApp('${t.id}')" style="font-size:11px;padding:3px 8px;background:#25D366;" title="Enviar WhatsApp">
                                📱
                            </button>
                        ` : ''}
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Tarefas._copiarAcao('${t.id}')" style="font-size:11px;padding:3px 8px;" title="Copiar">
                            📋
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="GR.Modules.Tarefas.excluir('${t.id}')" style="font-size:11px;padding:3px 8px;" title="Excluir">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    // ============================================================
    // MARCAR COMO CONCLUÍDA
    // ============================================================
    marcarConcluida: function(id) {
        var item = GR.State.data.tarefas.find(function(t) { 
            return t.id === id; 
        });
        
        if (!item) {
            GR.Toast.error('❌ Ação não encontrada');
            return;
        }

        if (!confirm('✅ Confirmar conclusão da ação?\n\n' +
                    '📋 ' + item.tipo + '\n' +
                    '👤 ' + item.responsavel + '\n\n' +
                    'Deseja enviar confirmação por WhatsApp?')) {
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('❌ Usuário não autenticado');
            return;
        }

        var ref = db.collection('users').doc(user.uid).collection('tarefas').doc(id);
        ref.update({
            concluida: true,
            dataConclusao: GR.Utils.now()
        })
        .then(function() {
            GR.Toast.success('✅ Ação marcada como concluída!');
            GR.State.adicionarHistorico(
                'concluiu ação', 
                'Ações', 
                'Ação: ' + item.tipo + ' - ' + item.responsavel
            );
            
            if (confirm('📱 Enviar confirmação por WhatsApp para ' + item.responsavel + '?')) {
                GR.Modules.Tarefas.enviarConfirmacaoWhatsApp(id);
            }
            
            GR.UI.refreshCurrentView();
        })
        .catch(function(err) {
            GR.Toast.error('❌ Erro ao marcar como concluída: ' + err.message);
        });
    },

    // ============================================================
    // ALTERNAR VISÃO
    // ============================================================
    _alternarVisao: function() {
        var tabela = document.querySelector('#lista-acoes .table-responsive table');
        if (!tabela) return;

        var linhas = tabela.querySelectorAll('tbody tr');
        if (linhas.length === 0) return;

        var atualmenteCompacto = tabela.dataset.compacto === 'true';
        var novoCompacto = !atualmenteCompacto;
        tabela.dataset.compacto = novoCompacto;

        linhas.forEach(function(linha) {
            var celulas = linha.querySelectorAll('td');
            if (celulas.length >= 6) {
                if (novoCompacto) {
                    celulas[2].innerHTML = celulas[2].textContent.trim().split('(')[0].trim();
                    celulas[4].style.display = 'none';
                    celulas[5].style.display = 'none';
                } else {
                    var responsavel = celulas[2].textContent.trim();
                    celulas[2].innerHTML = `<span>👤 ${responsavel}</span>`;
                    celulas[4].style.display = 'table-cell';
                    celulas[5].style.display = 'table-cell';
                }
            }
        });

        GR.Toast.info(novoCompacto ? '📊 Visão compacta ativada' : '📋 Visão detalhada ativada');
    },

    // ============================================================
    // COPIAR AÇÃO
    // ============================================================
    _copiarAcao: function(id) {
        var item = GR.State.data.tarefas.find(function(t) { 
            return t.id === id; 
        });
        
        if (!item) {
            GR.Toast.error('❌ Ação não encontrada');
            return;
        }

        GR.State.ui.tarefaEditando = null;
        document.getElementById('modal-tarefa-title').textContent = '📋 Copiar Ação';
        
        document.getElementById('tarefa-tipo').value = item.tipo || '';
        document.getElementById('tarefa-data').value = new Date().toISOString().split('T')[0];
        document.getElementById('tarefa-responsavel').value = item.responsavel || '';
        document.getElementById('tarefa-telefone').value = item.telefone || '';
        document.getElementById('tarefa-custo').value = GR.Utils.formatarMoedaSemSimbolo(item.custo || 0);
        document.getElementById('tarefa-propriedade').value = item.propriedade || '';
        
        if (item.responsavel) {
            this._preencherTelefoneAutomatico(item.responsavel);
        }
        
        GR.Modal.open('modal-tarefa');
        GR.Toast.info('📋 Ação copiada - ajuste a data e salve');
    },

    // ============================================================
    // MODAL
    // ============================================================
    abrirModal: function(editId) {
        GR.State.ui.tarefaEditando = editId || null;
        
        var modalTitle = document.getElementById('modal-tarefa-title');
        modalTitle.textContent = editId ? '✏️ Editar Ação' : '📋 Nova Ação';

        var tipoSelect = document.getElementById('tarefa-tipo');
        this._popularTipos(tipoSelect);

        document.getElementById('tarefa-data').value = new Date().toISOString().split('T')[0];
        document.getElementById('tarefa-responsavel').value = '';
        document.getElementById('tarefa-telefone').value = '';
        document.getElementById('tarefa-custo').value = '0,00';
        document.getElementById('parte-info-container').style.display = 'none';
        
        GR.UI._atualizarSelectsPropriedade();

        if (editId) {
            this._preencherModalEdicao(editId);
        }

        this._popularDatalistPartes();
        GR.Modal.open('modal-tarefa');
    },

    _popularTipos: function(select) {
        var valorAtual = select.value;
        select.innerHTML = '<option value="">Selecione o tipo...</option>';
        this._config.tiposAcao.forEach(function(tipo) {
            var option = document.createElement('option');
            option.value = tipo;
            var icone = GR.Modules.Tarefas._config.iconesPorTipo[tipo] || '📌';
            option.textContent = icone + ' ' + tipo;
            select.appendChild(option);
        });
        if (valorAtual) {
            select.value = valorAtual;
        }
    },

    _preencherModalEdicao: function(editId) {
        var item = GR.State.data.tarefas.find(function(t) { 
            return t.id === editId; 
        });
        
        if (!item) return;

        document.getElementById('tarefa-tipo').value = item.tipo || '';
        document.getElementById('tarefa-data').value = item.data || '';
        document.getElementById('tarefa-responsavel').value = item.responsavel || '';
        document.getElementById('tarefa-telefone').value = item.telefone || '';
        document.getElementById('tarefa-custo').value = GR.Utils.formatarMoedaSemSimbolo(item.custo || 0);
        document.getElementById('tarefa-propriedade').value = item.propriedade || '';
        
        if (item.responsavel) {
            this._preencherTelefoneAutomatico(item.responsavel);
        }
    },

    // ============================================================
    // SALVAR
    // ============================================================
    salvar: function() {
        var dados = this._coletarDadosFormulario();
        
        if (!this._validarDados(dados)) {
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('❌ Usuário não autenticado!');
            return;
        }

        var ref = db.collection('users').doc(user.uid).collection('tarefas');
        var editId = GR.State.ui.tarefaEditando;

        if (dados.telefone) {
            dados.telefone = this._extrairTelefone(dados.telefone);
        }
        if (!dados.telefone) delete dados.telefone;

        var operacao = editId ? 
            ref.doc(editId).update(dados) : 
            ref.add(dados);

        var btnSalvar = document.querySelector('#modal-tarefa .btn-success');
        if (btnSalvar) {
            btnSalvar.disabled = true;
            btnSalvar.textContent = '⏳ Salvando...';
        }

        operacao
            .then(function() {
                GR.Modal.close('modal-tarefa');
                GR.Toast.success(editId ? '✅ Ação atualizada!' : '✅ Ação salva!');
                GR.State.adicionarHistorico(
                    editId ? 'editou ação' : 'criou ação', 
                    'Ações', 
                    'Ação: ' + dados.tipo + ' - ' + dados.responsavel
                );
                
                GR.UI.refreshCurrentView();
                
                if (!editId) {
                    setTimeout(function() {
                        if (confirm('📱 Enviar lembrete por WhatsApp para ' + dados.responsavel + '?')) {
                            var tarefas = GR.State.data.tarefas || [];
                            var ultima = tarefas[tarefas.length - 1];
                            if (ultima && ultima.responsavel === dados.responsavel) {
                                GR.Modules.Tarefas.enviarLembreteWhatsApp(ultima.id);
                            }
                        }
                    }, 500);
                }
            })
            .catch(function(err) {
                GR.Toast.error('❌ Erro ao salvar: ' + err.message);
            })
            .finally(function() {
                if (btnSalvar) {
                    btnSalvar.disabled = false;
                    btnSalvar.textContent = '💾 Salvar';
                }
            });
    },

    _coletarDadosFormulario: function() {
        var resp = document.getElementById('tarefa-responsavel').value.trim();
        var telefone = document.getElementById('tarefa-telefone').value.trim();
        
        telefone = this._extrairTelefone(telefone);
        
        if (!telefone && resp) {
            telefone = this._buscarTelefoneResponsavel(resp) || '';
        }

        return {
            tipo: document.getElementById('tarefa-tipo').value.trim(),
            data: document.getElementById('tarefa-data').value,
            responsavel: GR.Utils.escapeHtml(resp),
            telefone: String(telefone || ''),
            custo: GR.Utils.parseMoedaBR(document.getElementById('tarefa-custo').value) || 0,
            propriedade: GR.Utils.escapeHtml(document.getElementById('tarefa-propriedade').value),
            dataAtualizacao: GR.Utils.now(),
            concluida: false
        };
    },

    _validarDados: function(dados) {
        var erros = [];
        
        if (!dados.tipo) erros.push('Selecione o tipo de ação');
        if (!dados.data) erros.push('Informe a data');
        if (!dados.responsavel) erros.push('Informe o responsável');
        if (!dados.propriedade) erros.push('Selecione a propriedade');

        if (erros.length > 0) {
            GR.Toast.error('❌ ' + erros.join(', '));
            return false;
        }

        var data = new Date(dados.data);
        if (isNaN(data.getTime())) {
            GR.Toast.error('❌ Data inválida');
            return false;
        }

        return true;
    },

    // ============================================================
    // EXCLUSÃO
    // ============================================================
    excluir: function(id) {
        var item = GR.State.data.tarefas.find(function(t) { 
            return t.id === id; 
        });
        
        if (!item) {
            GR.Toast.error('❌ Ação não encontrada');
            return;
        }

        var msg = '⚠️ DESEJA EXCLUIR ESTA AÇÃO?\n\n' +
                  '📋 Tipo: ' + item.tipo + '\n' +
                  '📅 Data: ' + GR.Utils.formatarDataBR(item.data) + '\n' +
                  '👤 Responsável: ' + item.responsavel + '\n' +
                  '💰 Custo: ' + GR.Utils.formatarMoedaBR(item.custo) + '\n' +
                  '🏠 Propriedade: ' + (item.propriedade || '-') + '\n\n' +
                  'Esta ação não poderá ser recuperada!';

        if (!confirm(msg)) return;

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('❌ Usuário não autenticado');
            return;
        }

        db.collection('users').doc(user.uid).collection('tarefas')
            .doc(id).delete()
            .then(function() {
                GR.Toast.success('🗑️ Ação excluída!');
                GR.State.adicionarHistorico(
                    'excluiu ação', 
                    'Ações', 
                    'Ação: ' + item.tipo + ' - ' + item.responsavel
                );
                GR.UI.refreshCurrentView();
            })
            .catch(function(err) {
                GR.Toast.error('❌ Erro ao excluir: ' + err.message);
            });
    },

    // ============================================================
    // EXPORTAÇÃO
    // ============================================================
    exportarCSV: function() {
        var items = this._filtrarTarefas();
        if (!items.length) {
            GR.Toast.warning('⚠️ Nenhuma ação para exportar');
            return;
        }

        try {
            var cabecalho = 'Tipo,Data,Responsável,Telefone,Custo,Propriedade,Status\n';
            var linhas = items.map(function(t) {
                var status = t.concluida ? 'Concluída' : 'Pendente';
                return [
                    (t.tipo || '').replace(/,/g, ';'),
                    t.data || '',
                    (t.responsavel || '').replace(/,/g, ';'),
                    (t.telefone || '').replace(/,/g, ';'),
                    (t.custo || 0).toFixed(2).replace('.', ','),
                    (t.propriedade || '').replace(/,/g, ';'),
                    status
                ].join(',');
            }).join('\n');

            var conteudo = cabecalho + linhas;
            var blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'acoes_' + new Date().toISOString().split('T')[0] + '.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            GR.Toast.success('✅ Exportação CSV realizada com sucesso!');
        } catch (err) {
            GR.Toast.error('❌ Erro ao exportar: ' + err.message);
        }
    },

    exportarPDF: function() {
        var items = this._filtrarTarefas();
        if (!items.length) {
            GR.Toast.warning('⚠️ Nenhuma ação para exportar');
            return;
        }

        try {
            if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
                GR.Toast.error('❌ Biblioteca PDF não carregada');
                return;
            }

            var jsPDF = window.jspdf?.jsPDF || jspdf?.jsPDF;
            if (!jsPDF) {
                GR.Toast.error('❌ Biblioteca PDF não disponível');
                return;
            }

            var doc = new jsPDF('landscape', 'mm', 'a4');
            doc.setFontSize(16);
            doc.text('📋 Lista de Ações', 14, 15);
            doc.setFontSize(10);
            doc.text('Gerado em: ' + new Date().toLocaleString(), 14, 22);
            doc.text('Total de ações: ' + items.length, 14, 28);

            var headers = ['Tipo', 'Data', 'Responsável', 'Custo', 'Propriedade', 'Status'];
            var rows = items.map(function(t) {
                var status = t.concluida ? '✅ Concluída' : '⏳ Pendente';
                return [
                    t.tipo || '',
                    GR.Utils.formatarDataBR(t.data),
                    t.responsavel || '',
                    GR.Utils.formatarMoedaBR(t.custo),
                    t.propriedade || '-',
                    status
                ];
            });

            doc.autoTable({
                head: [headers],
                body: rows,
                startY: 32,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [41, 128, 185] },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });

            doc.save('acoes_' + new Date().toISOString().split('T')[0] + '.pdf');
            GR.Toast.success('✅ PDF exportado com sucesso!');
        } catch (err) {
            GR.Toast.error('❌ Erro ao exportar PDF: ' + err.message);
        }
    },

    // ============================================================
    // ESTATÍSTICAS
    // ============================================================
    getEstatisticas: function() {
        var items = this._filtrarTarefas();
        var total = items.length;
        var custoTotal = items.reduce(function(sum, t) { 
            return sum + (t.custo || 0); 
        }, 0);
        
        var hoje = new Date();
        var atrasadas = items.filter(function(t) {
            return new Date(t.data) < hoje && !t.concluida;
        });
        
        var concluidas = items.filter(function(t) {
            return t.concluida;
        });

        return {
            total: total,
            custoTotal: custoTotal,
            custoMedio: total > 0 ? custoTotal / total : 0,
            atrasadas: atrasadas.length,
            concluidas: concluidas.length,
            pendentes: total - concluidas.length
        };
    },

    // ============================================================
    // ATUALIZAR ESTATÍSTICAS (EVENTO)
    // ============================================================
    _atualizarEstatisticas: function(items) {
        var total = items.length;
        var custoTotal = items.reduce(function(sum, t) { 
            return sum + (t.custo || 0); 
        }, 0);
        
        document.dispatchEvent(new CustomEvent('tarefas:atualizadas', {
            detail: { 
                total: total, 
                custoTotal: custoTotal, 
                items: items,
                timestamp: new Date().toISOString()
            }
        }));
    }
};

console.log('✅ Módulo Tarefas carregado com WhatsApp! (CORRIGIDO)');