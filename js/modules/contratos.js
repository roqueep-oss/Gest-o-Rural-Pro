// ================================================================
// MÓDULO: CONTRATOS (CRÉDITO) - COMPLETO COM MELHORIAS
// ================================================================
// Mantém todas as funcionalidades originais + melhorias:
// - Captura de saldo entre aspas ("62.423,64")
// - Captura de saldo no formato % a.a. 62.423,64 0 Conta Garantia
// - Card Saldo Devedor usando saldoQuitacao do PDF
// - Card Parcelas Pendentes com quantidade + valor total
// - Clique nos cards de vencimento abre detalhes das parcelas
// - Notificação de vencimentos ao abrir o app (30 dias)
// - Tooltips em todos os botões e elementos interativos
// - 🆕 Card de Contratos no Dashboard com visualização por ano
// - 🆕 Expandir/recolher anos no card de contratos
// - 🆕 Modal com gráfico (colunas/linhas/pizza) e parcelas por ano
// - 🆕 Aba Crédito com visualização por ano (acordeão)
// - 🆕 Filtros por status na aba Crédito
// - 🆕 Cards de resumo na aba Crédito
// - 🆕 Gráfico em tela cheia na aba Crédito
// - 🆕 Valores visíveis em cima das colunas, pontos e fatias da pizza
// - 🆕 Carregamento automático do plugin ChartDataLabels com fallback
// - 🏠 Filtro de dados por propriedade (perfil)
// ================================================================

if (typeof GR.Modules === 'undefined') {
    GR.Modules = {};
}

// ================================================================
// 🆕 FUNÇÃO MELHORADA PARA CARREGAR O PLUGIN DATALABELS
// ================================================================
function carregarChartDataLabels(callback) {
    // Verifica se já está carregado
    if (typeof ChartDataLabels !== 'undefined') {
        try {
            Chart.register(ChartDataLabels);
            console.log('✅ ChartDataLabels já registrado!');
        } catch (e) {
            console.warn('⚠️ Erro ao registrar ChartDataLabels:', e);
        }
        if (callback) callback();
        return;
    }
    
    console.log('📦 Carregando ChartDataLabels...');
    
    // Tenta carregar de múltiplas fontes
    var fontes = [
        'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-datalabels/2.0.0/chartjs-plugin-datalabels.min.js',
        'https://unpkg.com/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js'
    ];
    
    var tentativa = 0;
    
    function tentarCarregar() {
        if (tentativa >= fontes.length) {
            console.error('❌ Todas as tentativas de carregar ChartDataLabels falharam!');
            // Tenta carregar inline
            console.log('📦 Tentando carregar ChartDataLabels inline...');
            var script = document.createElement('script');
            script.textContent = `
                // ChartDataLabels plugin fallback
                if (typeof Chart !== 'undefined' && Chart.registry && !Chart.registry.plugins.get('datalabels')) {
                    Chart.register({
                        id: 'datalabels',
                        afterDraw: function(chart) {
                            var ctx = chart.ctx;
                            chart.data.datasets.forEach(function(dataset, i) {
                                var meta = chart.getDatasetMeta(i);
                                meta.data.forEach(function(element, index) {
                                    var value = dataset.data[index];
                                    if (value > 0) {
                                        var label = 'R$ ' + value.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0});
                                        ctx.save();
                                        ctx.font = 'bold 12px sans-serif';
                                        ctx.fillStyle = '#1e293b';
                                        ctx.textAlign = 'center';
                                        ctx.textBaseline = 'bottom';
                                        ctx.fillText(label, element.x, element.y - 8);
                                        ctx.restore();
                                    }
                                });
                            });
                        }
                    });
                    console.log('✅ ChartDataLabels (fallback inline) registrado!');
                }
            `;
            document.head.appendChild(script);
            if (callback) callback();
            return;
        }
        
        var script = document.createElement('script');
        script.src = fontes[tentativa];
        script.onload = function() {
            console.log('✅ ChartDataLabels carregado da fonte', tentativa + 1);
            try {
                if (typeof ChartDataLabels !== 'undefined') {
                    Chart.register(ChartDataLabels);
                    console.log('✅ ChartDataLabels registrado com sucesso!');
                } else {
                    console.warn('⚠️ ChartDataLabels carregado mas não disponível globalmente');
                }
            } catch (e) {
                console.warn('⚠️ Erro ao registrar:', e);
            }
            if (callback) callback();
        };
        script.onerror = function() {
            console.warn('⚠️ Falha na fonte', tentativa + 1, 'tentando próxima...');
            tentativa++;
            tentarCarregar();
        };
        document.head.appendChild(script);
    }
    
    tentarCarregar();
}

// ================================================================
// 🆕 FUNÇÃO PARA GARANTIR QUE O PLUGIN ESTÁ PRONTO
// ================================================================
function garantirChartDataLabels(callback, tentativas) {
    tentativas = tentativas || 0;
    if (tentativas > 10) {
        console.warn('⚠️ Máximo de tentativas para carregar ChartDataLabels');
        if (callback) callback();
        return;
    }
    
    if (typeof ChartDataLabels !== 'undefined') {
        try {
            Chart.register(ChartDataLabels);
            console.log('✅ ChartDataLabels pronto!');
            if (callback) callback();
            return;
        } catch (e) {
            console.warn('⚠️ Erro ao registrar:', e);
        }
    }
    
    console.log('⏳ Aguardando ChartDataLabels carregar... (tentativa', tentativas + 1, ')');
    setTimeout(function() {
        garantirChartDataLabels(callback, tentativas + 1);
    }, 500);
}

GR.Modules.Contratos = {
    // Instituição padrão
    _instituicaoPadrao: 'Sicoob',

    // ================================================================
    // 🆕 v2.1 - SINCRONIZAÇÃO EM TEMPO REAL + PERFORMANCE + UI
    // ================================================================
    _realtimeBound: false,
    _stylesInjected: false,
    _forceRender: true,
    _lastSignature: '',
    _renderTimer: null,

    _injectStyles: function() {
        if (this._stylesInjected) return;
        this._stylesInjected = true;
        var css = ''
            + '#lista-contratos .contrato-card{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;border:1px solid rgba(148,163,184,.25);border-radius:14px}'
            + '#lista-contratos .contrato-card:hover{transform:translateY(-2px);box-shadow:0 10px 24px -12px rgba(15,23,42,.25);border-color:rgba(59,130,246,.45)}'
            + '#lista-contratos .contrato-card .contrato-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.2px}'
            + '#lista-contratos .contrato-card .badge-ativo{background:#dcfce7;color:#166534}'
            + '#lista-contratos .contrato-card .badge-quitado{background:#e0f2fe;color:#075985}'
            + '#lista-contratos .contrato-card .badge-atrasado{background:#fee2e2;color:#991b1b}'
            + '#lista-contratos .contrato-card .contrato-actions button{transition:transform .12s ease,background .12s ease}'
            + '#lista-contratos .contrato-card .contrato-actions button:hover{transform:scale(1.06)}'
            + '#lista-contratos table thead th{position:sticky;top:0;background:#f8fafc;z-index:2}'
            + '.contratos-resumo-card{transition:transform .18s ease,box-shadow .18s ease;cursor:pointer}'
            + '.contratos-resumo-card:hover{transform:translateY(-2px);box-shadow:0 10px 22px -14px rgba(15,23,42,.35)}'
            + '.contratos-fade{animation:contratosFade .22s ease}'
            + '@keyframes contratosFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}'
            + '#lista-contratos .contrato-busca{width:100%;max-width:320px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:10px;font-size:14px;outline:none;transition:border-color .15s}'
            + '#lista-contratos .contrato-busca:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.15)}';
        var tag = document.createElement('style');
        tag.setAttribute('data-contratos', 'v2.1');
        tag.textContent = css;
        document.head.appendChild(tag);
    },

    _contentSignature: function() {
        var items = (GR.State.data && GR.State.data.contratos) || [];
        var sig = 'n' + items.length + '|p:' + ((GR.State.ui && GR.State.ui.propriedadeAtiva) || 'todas');
        for (var i = 0; i < items.length; i++) {
            var c = items[i] || {};
            var parcelasSig = 0;
            if (c.parcelas && c.parcelas.length) {
                parcelasSig = c.parcelas.length;
                for (var j = 0; j < c.parcelas.length; j++) {
                    var p = c.parcelas[j] || {};
                    parcelasSig += (p.status === 'Pago' ? 1 : 0);
                }
            }
            sig += '|' + (c.id || '') + ':' + (c.dataCriacao || '') + ':' + (c.saldoQuitacao || 0)
                 + ':' + (c.status || '') + ':' + parcelasSig + ':' + (c.valor || 0);
        }
        return sig;
    },

    _invalidateAndRender: function() {
        this._forceRender = true;
        this._lastSignature = '';
        var self = this;
        clearTimeout(this._renderTimer);
        this._renderTimer = setTimeout(function() {
            try { self.render(); } catch (e) { console.warn('render contratos:', e); }
            try { if (typeof self.renderCardContratos === 'function') self.renderCardContratos(); } catch (e) {}
        }, 30);
    },

    _atualizarLocal: function(op, id, dados) {
        // Atualização otimista do cache local (antes do snapshot chegar)
        if (!GR.State || !GR.State.data) return;
        GR.State.data.contratos = GR.State.data.contratos || [];
        if (op === 'add') {
            GR.State.data.contratos.push(Object.assign({ id: id }, dados));
        } else if (op === 'update') {
            var i = GR.State.data.contratos.findIndex(function(c) { return c.id === id; });
            if (i >= 0) GR.State.data.contratos[i] = Object.assign({}, GR.State.data.contratos[i], dados);
        } else if (op === 'delete') {
            GR.State.data.contratos = GR.State.data.contratos.filter(function(c) { return c.id !== id; });
        }
    },

    _bindRealtime: function() {
        if (this._realtimeBound) return;
        var self = this;
        try {
            if (typeof firebase === 'undefined' || typeof db === 'undefined') return;
            var user = firebase.auth().currentUser;
            if (!user) return;
            db.collection('users').doc(user.uid).collection('contratos')
                .onSnapshot(function(snap) {
                    var items = [];
                    snap.forEach(function(doc) {
                        var d = doc.data(); d.id = doc.id; items.push(d);
                    });
                    GR.State.data.contratos = items;
                    if (window.dispatchEvent) window.dispatchEvent(new Event('contratos-atualizados'));
                    self._invalidateAndRender();
                }, function(err) { console.warn('⚠️ onSnapshot contratos:', err && err.message); });
            window.addEventListener('contratos-atualizados', function() { self._invalidateAndRender(); });
            window.addEventListener('dados-carregados', function() { self._invalidateAndRender(); });
            this._realtimeBound = true;
            console.log('🔗 Contratos: realtime ativo');
        } catch (e) {
            console.warn('Erro ao ligar realtime contratos:', e);
        }
    },

    // Filtro de busca (aplicado em memória sobre a lista já filtrada por propriedade)
    _termoBusca: '',
    _aplicarBusca: function(items) {
        var t = (this._termoBusca || '').toLowerCase().trim();
        if (!t) return items;
        return items.filter(function(c) {
            return ((c.numero || '') + ' ' + (c.instituicao || '') + ' ' + (c.mutuario || '') + ' ' + (c.modalidade || '') + ' ' + (c.propriedade || ''))
                .toLowerCase().indexOf(t) >= 0;
        });
    },
    setBusca: function(valor) {
        this._termoBusca = valor || '';
        this._invalidateAndRender();
    },

    // ================================================================
    // RENDER - LISTA DE CONTRATOS COM CARDS MELHORADOS E FILTRO
    // ================================================================
    render: function() {
        this._injectStyles();
        this._bindRealtime();

        // Skip re-render se conteúdo idêntico (economia de DOM)
        var sig = this._contentSignature();
        if (!this._forceRender && sig === this._lastSignature) return;
        this._lastSignature = sig;
        this._forceRender = false;
        var div = document.getElementById('lista-contratos');
        if (!div) {
            console.warn('⚠️ Elemento lista-contratos não encontrado');
            return;
        }
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.contratos || [], 'propriedade');
        
        // 🔥 APLICA O FILTRO DA ABA ATIVA (SE NÃO FOR "TODAS")
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }

        var totalAtivos = 0,
            saldoDevedor = 0,
            totalParcelasPendentes = 0,
            somaParcelasPendentes = 0,
            venc15 = 0,
            venc30 = 0,
            venc180 = 0,
            venc365 = 0;
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // ============================================================
        // ARMAZENAR PARCELAS POR PERÍODO PARA OS CARDS
        // ============================================================
        var parcelasVenc15 = [];
        var parcelasVenc30 = [];
        var parcelasVenc180 = [];
        var parcelasVenc365 = [];

        items.forEach(function(c) {
            if (c.status === 'Ativo') totalAtivos++;
            
            // ============================================================
            // SALDO DEVEDOR USA saldoQuitacao DO PDF
            // ============================================================
            if (c.saldoQuitacao && c.saldoQuitacao > 0) {
                saldoDevedor += c.saldoQuitacao;
            } else if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.status === 'Pendente') {
                        saldoDevedor += parseFloat(p.valor) || 0;
                    }
                });
            }
            
            // ============================================================
            // PARCELAS PENDENTES: Conta, soma e armazena por período
            // ============================================================
            if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.status === 'Pendente' && p.vencimento) {
                        var valorParcela = parseFloat(p.valor) || 0;
                        totalParcelasPendentes++;
                        somaParcelasPendentes += valorParcela;
                        
                        var dataVencimento = p.vencimento;
                        if (dataVencimento && dataVencimento.includes('/')) {
                            var partes = dataVencimento.split('/');
                            if (partes.length === 3) {
                                dataVencimento = partes[2] + '-' + partes[1] + '-' + partes[0];
                            }
                        }
                        
                        var venc = new Date(dataVencimento);
                        if (isNaN(venc.getTime())) {
                            return;
                        }
                        
                        venc.setHours(0, 0, 0, 0);
                        var diffTime = venc.getTime() - hoje.getTime();
                        var diff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        // ============================================================
                        // ARMAZENA PARCELAS POR PERÍODO
                        // ============================================================
                        var parcelaInfo = {
                            contrato: c.numero || 'N/A',
                            propriedade: c.propriedade || 'N/A',
                            parcela: p.numero || 0,
                            vencimento: p.vencimento || '',
                            valor: valorParcela,
                            status: p.status || 'Pendente',
                            contratoId: c.id
                        };
                        
                        if (diff >= 0) {
                            if (diff <= 15) {
                                venc15++;
                                parcelasVenc15.push(parcelaInfo);
                            }
                            if (diff <= 30) {
                                venc30++;
                                parcelasVenc30.push(parcelaInfo);
                            }
                            if (diff <= 180) {
                                venc180++;
                                parcelasVenc180.push(parcelaInfo);
                            }
                            if (diff <= 365) {
                                venc365++;
                                parcelasVenc365.push(parcelaInfo);
                            }
                        }
                    }
                });
            }
        });

        // ============================================================
        // ARMAZENA PARCELAS POR PERÍODO PARA USO NOS CARDS
        // ============================================================
        this._parcelasVenc15 = parcelasVenc15;
        this._parcelasVenc30 = parcelasVenc30;
        this._parcelasVenc180 = parcelasVenc180;
        this._parcelasVenc365 = parcelasVenc365;

        // ============================================================
        // CARDS ATUALIZADOS COM CLIQUE
        // ============================================================
        var statsHtml = '<div class="credito-stats-grid">' +
            '<div class="credito-stats-card"><div class="number">' + totalAtivos + '</div><div class="label">📋 Contratos Ativos</div></div>' +
            '<div class="credito-stats-card danger"><div class="number">' + GR.Utils.formatarMoedaBR(saldoDevedor) + '</div><div class="label">💰 Saldo Devedor (Quitação)</div><div style="font-size:9px;color:var(--text-light);margin-top:2px;">Valor real para quitação</div></div>' +
            '<div class="credito-stats-card warning"><div class="number">' + totalParcelasPendentes + '</div><div class="label">📌 Parcelas Pendentes</div><div style="font-size:9px;color:var(--text-light);margin-top:2px;">Total: ' + GR.Utils.formatarMoedaBR(somaParcelasPendentes) + '</div></div>' +
            '<div class="credito-stats-card warning clickable" onclick="GR.Modules.Contratos.abrirModalVencimentos(15)" style="cursor:pointer;" title="Clique para ver detalhes das parcelas que vencem em até 15 dias">' +
                '<div class="number">' + venc15 + '</div>' +
                '<div class="label">⚠️ Vence em 15 dias</div>' +
                '<div style="font-size:9px;color:var(--text-light);margin-top:2px;">' + venc15 + ' parcela' + (venc15 > 1 ? 's' : '') + '</div>' +
            '</div>' +
            '<div class="credito-stats-card info clickable" onclick="GR.Modules.Contratos.abrirModalVencimentos(30)" style="cursor:pointer;" title="Clique para ver detalhes das parcelas que vencem em até 30 dias">' +
                '<div class="number">' + venc30 + '</div>' +
                '<div class="label">📅 Vence em 30 dias</div>' +
                '<div style="font-size:9px;color:var(--text-light);margin-top:2px;">' + venc30 + ' parcela' + (venc30 > 1 ? 's' : '') + '</div>' +
            '</div>' +
            '<div class="credito-stats-card info clickable" onclick="GR.Modules.Contratos.abrirModalVencimentos(180)" style="cursor:pointer;" title="Clique para ver detalhes das parcelas que vencem em até 180 dias">' +
                '<div class="number">' + venc180 + '</div>' +
                '<div class="label">📆 Vence em 180 dias</div>' +
                '<div style="font-size:9px;color:var(--text-light);margin-top:2px;">' + venc180 + ' parcela' + (venc180 > 1 ? 's' : '') + '</div>' +
            '</div>' +
            '<div class="credito-stats-card info clickable" onclick="GR.Modules.Contratos.abrirModalVencimentos(365)" style="cursor:pointer;" title="Clique para ver detalhes das parcelas que vencem em até 365 dias">' +
                '<div class="number">' + venc365 + '</div>' +
                '<div class="label">📆 Vence em 365 dias</div>' +
                '<div style="font-size:9px;color:var(--text-light);margin-top:2px;">' + venc365 + ' parcela' + (venc365 > 1 ? 's' : '') + '</div>' +
            '</div>' +
            '</div>';

        if (!items.length) {
            div.innerHTML = statsHtml + '<div class="empty-state"><span class="icon">💳</span><div class="message">Nenhuma operação de crédito</div></div>';
            return;
        }

        // ============================================================
        // TABELA DE CONTRATOS
        // ============================================================
        var rows = items.map(function(c) {
            var totalPendente = 0;
            var parcelasEmAberto = 0;
            
            if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.status === 'Pendente') {
                        totalPendente += parseFloat(p.valor) || 0;
                        parcelasEmAberto++;
                    }
                });
            }
            
            var statusBadge = c.status === 'Ativo' ? '<span class="badge badge-success" title="Contrato ativo">Ativo</span>' :
                c.status === 'Quitado' ? '<span class="badge badge-info" title="Contrato quitado">Quitado</span>' :
                '<span class="badge badge-danger" title="Contrato cancelado">Cancelado</span>';

            var hasFile = c.arquivoUrl ? 
                '<button class="btn btn-info btn-sm" title="Visualizar PDF do contrato" onclick="GR.Modules.Contratos.visualizarPDF(\'' + c.id + '\')">📄 PDF</button>' : 
                '<span style="color:#999;font-size:10px;" title="Nenhum PDF anexado a este contrato">Sem PDF</span>';

            var parcelasInfo = '';
            if (parcelasEmAberto > 0) {
                parcelasInfo = '<span style="color:#ff9800;font-weight:bold;" title="' + parcelasEmAberto + ' parcelas em aberto">' + parcelasEmAberto + ' em aberto</span>';
            } else {
                parcelasInfo = '<span style="color:#4caf50;" title="Todas as parcelas foram quitadas">✅ Quitado</span>';
            }

            var dataExibicao = c.data || '';
            if (dataExibicao && dataExibicao.includes('-')) {
                var partes = dataExibicao.split('-');
                if (partes.length === 3) {
                    dataExibicao = partes[2] + '/' + partes[1] + '/' + partes[0];
                }
            }

            return '<tr>' +
                '<td><strong title="Número do contrato">' + GR.Utils.escapeHtml(c.numero) + '</strong></td>' +
                '<td title="Propriedade do contrato">' + GR.Utils.escapeHtml(c.propriedade) + '</td>' +
                '<td title="Data de liberação">' + dataExibicao + '</td>' +
                '<td title="Valor original do contrato">' + GR.Utils.formatarMoedaBR(c.valor) + '</td>' +
                '<td title="Valor total pendente (soma das parcelas em aberto)">' + GR.Utils.formatarMoedaBR(totalPendente) + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + parcelasInfo + '</td>' +
                '<td>' + hasFile + '</td>' +
                '<td>' +
                '<button class="btn btn-primary btn-sm" title="Editar os dados do contrato" onclick="GR.Modules.Contratos.editar(\'' + c.id + '\')">✏️</button>' +
                '<button class="btn btn-info btn-sm" title="Visualizar todas as parcelas do contrato" onclick="GR.Vencimentos.verParcelas(\'' + c.id + '\')">📅</button>' +
                '<button class="btn btn-danger btn-sm" title="Excluir permanentemente este contrato" onclick="GR.Modules.Contratos.excluir(\'' + c.id + '\')">🗑️</button>' +
                '</td>' +
                '</tr>';
        }).join('');

        div.innerHTML = statsHtml +
            '<div class="table-responsive"><table><thead><tr>' +
            '<th>Nº</th>' +
            '<th>Propriedade</th>' +
            '<th>Data</th>' +
            '<th>Valor</th>' +
            '<th>Pendente</th>' +
            '<th>Status</th>' +
            '<th>Parcelas em Aberto</th>' +
            '<th>PDF</th>' +
            '<th>Ações</th>' +
            '</tr></thead><tbody>' +
            rows + '</tbody></table></div>';
            
        console.log('📊 Contratos filtrados:', items.length, 'de', (GR.State.data.contratos || []).length);
    },

    // ================================================================
    // ABRIR MODAL DE VENCIMENTOS POR PERÍODO
    // ================================================================
    abrirModalVencimentos: function(dias) {
        console.log('📅 Abrindo modal de vencimentos para ' + dias + ' dias...');
        
        var parcelas = [];
        var titulo = '';
        
        switch(dias) {
            case 15:
                parcelas = this._parcelasVenc15 || [];
                titulo = '⚠️ Parcelas que vencem em até 15 dias';
                break;
            case 30:
                parcelas = this._parcelasVenc30 || [];
                titulo = '📅 Parcelas que vencem em até 30 dias';
                break;
            case 180:
                parcelas = this._parcelasVenc180 || [];
                titulo = '📆 Parcelas que vencem em até 180 dias';
                break;
            case 365:
                parcelas = this._parcelasVenc365 || [];
                titulo = '📆 Parcelas que vencem em até 365 dias';
                break;
            default:
                GR.Toast.error('Período inválido!');
                return;
        }
        
        if (!parcelas || parcelas.length === 0) {
            GR.Toast.info('Nenhuma parcela vence neste período.');
            return;
        }
        
        var totalPeriodo = 0;
        parcelas.forEach(function(p) {
            totalPeriodo += p.valor || 0;
        });
        
        var modalId = 'modal-vencimentos-' + dias;
        
        var modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }
        
        var modalHTML = `
        <div id="${modalId}" class="modal" role="dialog" aria-modal="true">
            <div class="modal-content" style="max-width:800px;max-height:90vh;">
                <div class="modal-header">
                    <h2 class="modal-title">${titulo}</h2>
                    <button class="close-btn" onclick="GR.Modal.close('${modalId}')">×</button>
                </div>
                <div style="padding:10px 0;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;padding:8px 12px;background:#f5f5f5;border-radius:4px;">
                        <span><strong>Total de parcelas:</strong> ${parcelas.length}</span>
                        <span><strong>Valor total:</strong> ${GR.Utils.formatarMoedaBR(totalPeriodo)}</span>
                    </div>
                    <div class="table-responsive" style="max-height:400px;overflow-y:auto;">
                        <table style="width:100%;font-size:13px;">
                            <thead>
                                <tr>
                                    <th>Contrato</th>
                                    <th>Propriedade</th>
                                    <th>Parcela</th>
                                    <th>Vencimento</th>
                                    <th>Valor</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${parcelas.map(function(p, index) {
                                    return `
                                    <tr>
                                        <td><strong>${GR.Utils.escapeHtml(p.contrato)}</strong></td>
                                        <td>${GR.Utils.escapeHtml(p.propriedade)}</td>
                                        <td>${p.parcela}</td>
                                        <td>${p.vencimento}</td>
                                        <td>${GR.Utils.formatarMoedaBR(p.valor)}</td>
                                        <td>
                                            <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos.editar('${p.contratoId}')" title="Editar contrato">✏️</button>
                                            <button class="btn btn-info btn-sm" onclick="GR.Vencimentos.verParcelas('${p.contratoId}')" title="Ver parcelas">📅</button>
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer" style="display:flex;justify-content:flex-end;padding-top:10px;border-top:1px solid var(--border);">
                    <button class="btn btn-secondary" onclick="GR.Modal.close('${modalId}')">Fechar</button>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        GR.Modal.open(modalId);
    },

    // ================================================================
    // VERIFICAR VENCIMENTOS PRÓXIMOS (30 DIAS) - COM FILTRO
    // ================================================================
    verificarVencimentosProximos: function() {
        console.log('🔔 Verificando vencimentos próximos (30 dias)...');
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.contratos || [], 'propriedade');
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        var vencimentosProximos = [];
        var vencimentosHoje = [];
        
        items.forEach(function(c) {
            if (c.status !== 'Ativo') return;
            
            if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.status !== 'Pendente') return;
                    if (!p.vencimento) return;
                    
                    var dataVencimento = p.vencimento;
                    if (dataVencimento && dataVencimento.includes('/')) {
                        var partes = dataVencimento.split('/');
                        if (partes.length === 3) {
                            dataVencimento = partes[2] + '-' + partes[1] + '-' + partes[0];
                        }
                    }
                    
                    var venc = new Date(dataVencimento);
                    if (isNaN(venc.getTime())) return;
                    
                    venc.setHours(0, 0, 0, 0);
                    var diffTime = venc.getTime() - hoje.getTime();
                    var diff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diff === 0) {
                        vencimentosHoje.push({
                            contrato: c.numero || 'N/A',
                            propriedade: c.propriedade || 'N/A',
                            parcela: p.numero || 0,
                            vencimento: p.vencimento,
                            valor: parseFloat(p.valor) || 0,
                            contratoId: c.id
                        });
                    } else if (diff > 0 && diff <= 30) {
                        vencimentosProximos.push({
                            contrato: c.numero || 'N/A',
                            propriedade: c.propriedade || 'N/A',
                            parcela: p.numero || 0,
                            vencimento: p.vencimento,
                            valor: parseFloat(p.valor) || 0,
                            dias: diff,
                            contratoId: c.id
                        });
                    }
                });
            }
        });
        
        if (vencimentosHoje.length > 0) {
            var totalHoje = 0;
            vencimentosHoje.forEach(function(p) {
                totalHoje += p.valor;
            });
            
            var msg = '🔴 ATENÇÃO! ' + vencimentosHoje.length + ' parcela(s) VENCEM HOJE!\n\n';
            vencimentosHoje.forEach(function(p) {
                msg += '  • Contrato ' + p.contrato + ' - Parcela ' + p.parcela + ': R$ ' + p.valor.toFixed(2).replace('.', ',') + '\n';
            });
            msg += '\nTotal: ' + GR.Utils.formatarMoedaBR(totalHoje);
            
            setTimeout(function() {
                alert(msg);
            }, 500);
            
            GR.Toast.error('🔴 ' + vencimentosHoje.length + ' parcela(s) vencem HOJE!');
        }
        
        if (vencimentosProximos.length > 0) {
            var agrupado = {};
            vencimentosProximos.forEach(function(p) {
                var key = p.dias + ' dias';
                if (!agrupado[key]) {
                    agrupado[key] = [];
                }
                agrupado[key].push(p);
            });
            
            var msg = '📢 ATENÇÃO! ' + vencimentosProximos.length + ' parcela(s) vencem nos próximos 30 dias:\n\n';
            
            var chavesOrdenadas = Object.keys(agrupado).sort(function(a, b) {
                return parseInt(a) - parseInt(b);
            });
            
            chavesOrdenadas.forEach(function(key) {
                var parcelasDoDia = agrupado[key];
                msg += '📅 ' + key + ' (' + parcelasDoDia.length + ' parcela(s)):\n';
                parcelasDoDia.forEach(function(p) {
                    msg += '  • Contrato ' + p.contrato + ' - Parcela ' + p.parcela + ': R$ ' + p.valor.toFixed(2).replace('.', ',') + '\n';
                });
                msg += '\n';
            });
            
            setTimeout(function() {
                alert(msg);
            }, 1000);
            
            GR.Toast.warning('📢 ' + vencimentosProximos.length + ' parcela(s) vencem nos próximos 30 dias!');
        }
        
        if (vencimentosHoje.length === 0 && vencimentosProximos.length === 0) {
            setTimeout(function() {
                GR.Toast.success('✅ Nenhum vencimento próximo! Tudo em dia.');
            }, 500);
        }
        
        console.log('🔔 Vencimentos de hoje:', vencimentosHoje.length);
        console.log('🔔 Vencimentos nos próximos 30 dias:', vencimentosProximos.length);
    },

    // ================================================================
    // ABRIR MODAL
    // ================================================================
    abrirModal: function(editId) {
        console.log('🔓 GR.Modules.Contratos.abrirModal chamado!');
        GR.State.ui.contratoEditando = editId || null;
        
        var titleEl = document.getElementById('modal-contrato-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Operação' : '💳 Nova Operação de Crédito';
        
        var campos = ['contrato-propriedade', 'contrato-numero', 'contrato-data', 'contrato-valor',
            'contrato-status', 'contrato-taxa-juros', 'contrato-saldo-quitacao', 'contrato-data-saldo',
            'contrato-modalidade', 'contrato-mutuario', 'contrato-instituicao'
        ];
        campos.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
        });

        var preview = document.getElementById('pdf-preview');
        if (preview) preview.style.display = 'none';
        var info = document.getElementById('pdf-info-geral');
        if (info) info.style.display = 'none';
        
        var parcelasInfo = document.getElementById('parcelas-info');
        if (parcelasInfo) parcelasInfo.textContent = 'Parcelas em aberto: 0 | Liquidadas: 0';

        var statusEl = document.getElementById('pdf-status');
        if (statusEl) statusEl.textContent = 'Nenhum';

        this._parcelasTemp = [];
        this._preencherTabelaParcelas([]);

        GR.UI._atualizarSelectsPropriedade();

        if (editId) {
            var item = GR.State.data.contratos.find(function(c) { return c.id === editId; });
            if (item) {
                var propEl = document.getElementById('contrato-propriedade');
                if (propEl) propEl.value = item.propriedade || '';
                var numEl = document.getElementById('contrato-numero');
                if (numEl) numEl.value = item.numero || '';
                
                var dataEl = document.getElementById('contrato-data');
                if (dataEl) {
                    var dataValue = item.data || '';
                    if (dataValue && dataValue.includes('/')) {
                        var partes = dataValue.split('/');
                        if (partes.length === 3) {
                            dataValue = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                        }
                    }
                    dataEl.value = dataValue;
                }
                
                var valEl = document.getElementById('contrato-valor');
                if (valEl) valEl.value = GR.Utils.formatarMoedaSemSimbolo(item.valor || 0);
                var statusEl2 = document.getElementById('contrato-status');
                if (statusEl2) statusEl2.value = item.status || 'Ativo';
                var taxaEl = document.getElementById('contrato-taxa-juros');
                if (taxaEl) taxaEl.value = item.taxaJuros || '';
                var saldoEl = document.getElementById('contrato-saldo-quitacao');
                if (saldoEl) saldoEl.value = GR.Utils.formatarMoedaSemSimbolo(item.saldoQuitacao || 0);
                var dsEl = document.getElementById('contrato-data-saldo');
                if (dsEl) {
                    var dsValue = item.dataSaldo || '';
                    if (dsValue && dsValue.includes('/')) {
                        var partes = dsValue.split('/');
                        if (partes.length === 3) {
                            dsValue = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                        }
                    }
                    dsEl.value = dsValue;
                }
                var modEl = document.getElementById('contrato-modalidade');
                if (modEl) modEl.value = item.modalidade || '';
                var mutEl = document.getElementById('contrato-mutuario');
                if (mutEl) mutEl.value = item.mutuario || '';
                var instEl = document.getElementById('contrato-instituicao');
                if (instEl) instEl.value = item.instituicao || '';
                
                if (item.parcelas && item.parcelas.length > 0) {
                    this._parcelasTemp = JSON.parse(JSON.stringify(item.parcelas));
                    this._parcelasTemp = this._parcelasTemp.map(function(p) {
                        var novaP = JSON.parse(JSON.stringify(p));
                        if (novaP.vencimento) {
                            var partes = novaP.vencimento.split('/');
                            if (partes.length === 3) {
                                novaP.vencimento = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                            }
                        }
                        if (novaP.dataPagamento) {
                            var partes = novaP.dataPagamento.split('/');
                            if (partes.length === 3) {
                                novaP.dataPagamento = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                            }
                        }
                        return novaP;
                    });
                    this._preencherTabelaParcelas(this._parcelasTemp);
                }
            }
        }
        
        var pdfInput = document.getElementById('pdf-file-input');
        if (pdfInput) {
            pdfInput.onchange = null;
            pdfInput.onchange = function(e) {
                if (this.files && this.files[0]) {
                    GR.Modules.Contratos.processarPDF(this.files[0]);
                }
            };
        }

        GR.Modal.open('modal-contrato');
    },

    // ================================================================
    // BUSCAR DATA DE LIBERAÇÃO
    // ================================================================
    _buscarDataLiberacao: function(texto) {
        console.log('🔍 Buscando Data de Liberação...');
        
        var dataEncontrada = '';
        
        var dataOperacaoMatch = texto.match(/Data\s+Operação\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (dataOperacaoMatch) {
            dataEncontrada = dataOperacaoMatch[1].trim();
            console.log('📅 Data Liberação (campo Data Operação):', dataEncontrada);
            return dataEncontrada;
        }
        
        console.log('🔄 Buscando em "Liberações Efetuadas" (com aspas)...');
        var liberacoesMatch1 = texto.match(/Liberações\s+Efetuadas[\s\S]*?1\s+[0-9.,]+\s+"([0-9]{2}\/[0-9]{2}\/[0-9]{4})"/i);
        if (liberacoesMatch1) {
            dataEncontrada = liberacoesMatch1[1].trim();
            console.log('📅 Data Liberação (Liberações Efetuadas com aspas):', dataEncontrada);
            return dataEncontrada;
        }
        
        console.log('🔄 Buscando em "Liberações Efetuadas" (sem aspas)...');
        var liberacoesMatch2 = texto.match(/Liberações\s+Efetuadas[\s\S]*?1\s+[0-9.,]+\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (liberacoesMatch2) {
            dataEncontrada = liberacoesMatch2[1].trim();
            console.log('📅 Data Liberação (Liberações Efetuadas sem aspas):', dataEncontrada);
            return dataEncontrada;
        }
        
        console.log('🔄 Buscando padrão alternativo de liberação...');
        var parcela1Match = texto.match(/1\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+[0-9.,]+/i);
        if (parcela1Match) {
            dataEncontrada = parcela1Match[1].trim();
            console.log('📅 Data Liberação (parcela 1):', dataEncontrada);
            return dataEncontrada;
        }
        
        console.log('🔄 Buscando data genérica após "Liberações Efetuadas"...');
        var liberacoesGenMatch = texto.match(/Liberações\s+Efetuadas[\s\S]*?([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (liberacoesGenMatch) {
            dataEncontrada = liberacoesGenMatch[1].trim();
            console.log('📅 Data Liberação (genérica após Liberações):', dataEncontrada);
            return dataEncontrada;
        }
        
        console.log('🔄 Usando fallback - data de emissão...');
        var fallbackData = texto.match(/Data\s+de\s+Emissão\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (fallbackData) {
            dataEncontrada = fallbackData[1].trim();
            console.log('📅 Data Liberação (fallback - data emissão):', dataEncontrada);
            return dataEncontrada;
        }
        
        console.warn('⚠️ Nenhuma data de liberação encontrada!');
        return dataEncontrada;
    },

    // ================================================================
    // IDENTIFICAR INSTITUIÇÃO
    // ================================================================
    _identificarInstituicao: function(texto) {
        console.log('🔍 Identificando instituição...');
        
        var cooperativa = texto.match(/Cooperativa\s*:\s*([0-9]+)/i);
        if (cooperativa) {
            var id = 'cooperativa_' + cooperativa[1].trim();
            console.log('🏦 Instituição identificada (Cooperativa):', id);
            return id;
        }
        
        var singular = texto.match(/Coop\.\s+Singular\s*:\s*([0-9]+-[A-Za-zÀ-Üà-ü\s-]+)/i);
        if (singular) {
            var id = 'singular_' + singular[1].trim().substring(0, 20);
            console.log('🏦 Instituição identificada (Coop. Singular):', id);
            return id;
        }
        
        var nome = texto.match(/BANCO\s+([A-Za-zÀ-Üà-ü\s]+)/i);
        if (nome) {
            var id = 'banco_' + nome[1].trim().replace(/\s+/g, '_').substring(0, 30);
            console.log('🏦 Instituição identificada (Banco):', id);
            return id;
        }
        
        console.log('🏦 Instituição não identificada, usando padrão');
        return 'padrao';
    },

    // ================================================================
    // MODELO 4 - FUNÇÕES DE TREINAMENTO
    // ================================================================
    _abrirModalTreinamento: function(texto, padraoId) {
        console.log('📌 Abrindo modal de treinamento do Modelo 4...');
        
        var modalTreinamento = document.getElementById('modal-treinamento-modelo4');
        if (!modalTreinamento) {
            var modalHTML = `
            <div id="modal-treinamento-modelo4" class="modal" role="dialog" aria-modal="true">
                <div class="modal-content" style="max-width:800px;max-height:90vh;">
                    <div class="modal-header">
                        <h2 class="modal-title">🧠 Treinamento do Modelo 4</h2>
                        <button class="close-btn" onclick="GR.Modal.close('modal-treinamento-modelo4')">×</button>
                    </div>
                    <div style="margin-bottom:6px;">
                        <p style="font-size:11px;color:var(--text-light);">Selecione com o mouse o texto correspondente a cada campo e clique no botão correspondente.</p>
                        <p style="font-size:10px;color:var(--warning);">⚠️ O texto selecionado será usado para encontrar os dados em futuros PDFs.</p>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px;">
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos._selecionarCampo('contrato')">📄 Contrato</button>
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos._selecionarCampo('cliente')">👤 Cliente</button>
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos._selecionarCampo('modalidade')">🏷️ Modalidade</button>
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos._selecionarCampo('valor')">💰 Valor</button>
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos._selecionarCampo('taxa')">📊 Taxa</button>
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos._selecionarCampo('saldo')">💵 Saldo</button>
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos._selecionarCampo('data')">📅 Data</button>
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos._selecionarCampo('parcelas')">📋 Parcelas</button>
                    </div>
                    <div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:6px;">
                        <button class="btn btn-success btn-sm" onclick="GR.Modules.Contratos._salvarPadrao()">💾 Salvar Padrão</button>
                        <button class="btn btn-danger btn-sm" onclick="GR.Modules.Contratos._limparSelecao()">🗑️ Limpar</button>
                        <button class="btn btn-secondary btn-sm" onclick="GR.Modal.close('modal-treinamento-modelo4')">Fechar</button>
                    </div>
                    <div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:6px;">
                        <span id="campo-selecionado-label" style="font-size:10px;background:#e8f5e9;padding:2px 6px;border-radius:2px;">Nenhum campo selecionado</span>
                        <span id="texto-selecionado-label" style="font-size:10px;color:var(--text-light);">Nenhum texto selecionado</span>
                    </div>
                    <div class="table-responsive" style="max-height:400px;overflow-y:auto;border:1px solid var(--border);border-radius:4px;padding:4px;">
                        <pre id="texto-treinamento" style="margin:0;font-size:10px;white-space:pre-wrap;word-wrap:break-word;user-select:text;cursor:text;max-height:400px;overflow-y:auto;">${texto}</pre>
                    </div>
                    <div id="campos-treinamento" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:3px;margin-top:4px;font-size:10px;max-height:150px;overflow-y:auto;"></div>
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            var pre = document.getElementById('texto-treinamento');
            pre.addEventListener('mouseup', function() {
                var selection = window.getSelection();
                var selectedText = selection.toString().trim();
                if (selectedText) {
                    document.getElementById('texto-selecionado-label').textContent = '📌 Selecionado: ' + selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : '');
                    GR.Modules.Contratos._textoSelecionado = selectedText;
                }
            });
        }
        
        GR.Modules.Contratos._camposTreinamento = {};
        GR.Modules.Contratos._textoSelecionado = '';
        GR.Modules.Contratos._padraoId = padraoId;
        document.getElementById('campo-selecionado-label').textContent = 'Nenhum campo selecionado';
        document.getElementById('texto-selecionado-label').textContent = 'Nenhum texto selecionado';
        document.getElementById('campos-treinamento').innerHTML = '';
        
        GR.Modal.open('modal-treinamento-modelo4');
    },
    
    _selecionarCampo: function(campo) {
        var textoSelecionado = this._textoSelecionado;
        if (!textoSelecionado) {
            GR.Toast.warning('Selecione um texto no documento primeiro!');
            return;
        }
        
        var nomesCampos = {
            'contrato': '📄 Contrato',
            'cliente': '👤 Cliente',
            'modalidade': '🏷️ Modalidade',
            'valor': '💰 Valor',
            'taxa': '📊 Taxa',
            'saldo': '💵 Saldo',
            'data': '📅 Data',
            'parcelas': '📋 Parcelas'
        };
        
        this._camposTreinamento[campo] = textoSelecionado;
        document.getElementById('campo-selecionado-label').textContent = '✅ ' + nomesCampos[campo] + ' selecionado';
        
        var container = document.getElementById('campos-treinamento');
        var html = '';
        for (var key in this._camposTreinamento) {
            html += '<div style="background:#e8f5e9;padding:2px 4px;border-radius:2px;border-left:2px solid var(--success);">';
            html += '<strong>' + nomesCampos[key] + ':</strong> ';
            html += '<span style="font-size:9px;">' + this._camposTreinamento[key].substring(0, 30) + (this._camposTreinamento[key].length > 30 ? '...' : '') + '</span>';
            html += '</div>';
        }
        container.innerHTML = html;
        
        GR.Toast.success(nomesCampos[campo] + ' salvo!');
        this._textoSelecionado = '';
        document.getElementById('texto-selecionado-label').textContent = 'Nenhum texto selecionado (selecione o próximo campo)';
    },
    
    _salvarPadrao: function() {
        var campos = this._camposTreinamento;
        var count = Object.keys(campos).length;
        if (count < 3) {
            GR.Toast.warning('Selecione pelo menos 3 campos para treinar o modelo!');
            return;
        }
        
        var padraoId = this._padraoId || 'modelo4_padrao';
        var padroes = GR.State.data.padroesExtracao || {};
        padroes[padraoId] = campos;
        GR.State.data.padroesExtracao = padroes;
        
        var user = firebase.auth().currentUser;
        if (user) {
            db.collection('users').doc(user.uid).collection('config').doc('padroesExtracao').set({ padroes: padroes })
                .then(function() {
                    GR.Toast.success('✅ Padrão salvo com sucesso! ' + count + ' campos treinados.');
                    GR.Modal.close('modal-treinamento-modelo4');
                })
                .catch(function(err) {
                    GR.Toast.error('Erro ao salvar: ' + err.message);
                });
        } else {
            GR.Toast.error('Usuário não autenticado!');
        }
    },
    
    _limparSelecao: function() {
        this._camposTreinamento = {};
        this._textoSelecionado = '';
        document.getElementById('campo-selecionado-label').textContent = 'Nenhum campo selecionado';
        document.getElementById('texto-selecionado-label').textContent = 'Nenhum texto selecionado';
        document.getElementById('campos-treinamento').innerHTML = '';
        GR.Toast.info('Seleções limpas!');
    },

    // ================================================================
    // EXTRAIR COM PADRÕES APRENDIDOS (MODELO 4)
    // ================================================================
    _extrairComPadroes: function(texto, padroes) {
        console.log('🧠 Extraindo com padrões aprendidos...');
        var dados = {
            contrato: '',
            cliente: '',
            modalidade: '',
            valorOperacao: 0,
            taxaJuros: 0,
            saldoQuitacao: 0,
            dataLiberacao: '',
            parcelasAbertas: [],
            parcelasLiquidadas: []
        };
        
        for (var campo in padroes) {
            var padrao = padroes[campo];
            var padraoEscapado = padrao.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            var regex = new RegExp(padraoEscapado + '[\\s\\S]*?([0-9,.\\/\\-a-zA-ZÀ-Üà-ü\\s]+?)(?=\\s+[A-Z]|\\n|$|\\s{2,})', 'i');
            var match = texto.match(regex);
            
            if (match) {
                var valor = match[1].trim();
                switch(campo) {
                    case 'contrato':
                        dados.contrato = valor;
                        console.log('📄 Contrato capturado:', valor);
                        break;
                    case 'cliente':
                        dados.cliente = valor;
                        console.log('👤 Cliente capturado:', valor);
                        break;
                    case 'modalidade':
                        dados.modalidade = valor;
                        console.log('🏷️ Modalidade capturada:', valor);
                        break;
                    case 'valor':
                        var v = valor.replace(/[^0-9,]/g, '').replace(',', '.');
                        dados.valorOperacao = parseFloat(v) || 0;
                        console.log('💰 Valor capturado:', dados.valorOperacao);
                        break;
                    case 'taxa':
                        var t = valor.replace(',', '.');
                        dados.taxaJuros = parseFloat(t) || 0;
                        console.log('📊 Taxa capturada:', dados.taxaJuros);
                        break;
                    case 'saldo':
                        var s = valor.replace(/[^0-9,]/g, '').replace(',', '.');
                        dados.saldoQuitacao = parseFloat(s) || 0;
                        console.log('💵 Saldo capturado:', dados.saldoQuitacao);
                        break;
                    case 'data':
                        dados.dataLiberacao = valor;
                        console.log('📅 Data capturada:', valor);
                        break;
                }
            } else {
                console.warn('⚠️ Campo ' + campo + ' não encontrado com o padrão aprendido');
            }
        }
        
        return dados;
    },

    // ================================================================
    // PROCESSAR PDF
    // ================================================================
    processarPDF: function(file) {
        console.log('📄 GR.Modules.Contratos.processarPDF chamado!', file);
        
        if (!file) {
            GR.Toast.error('Nenhum arquivo selecionado!');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            GR.Toast.error('Arquivo muito grande (máx 10MB).');
            return;
        }

        var statusEl = document.getElementById('pdf-status');
        if (statusEl) statusEl.textContent = '🔄 Processando...';

        if (typeof pdfjsLib === 'undefined') {
            GR.Toast.error('PDF.js não carregado.');
            if (statusEl) statusEl.textContent = '❌ Erro';
            return;
        }

        var reader = new FileReader();
        var self = this;

        reader.onload = function(e) {
            var arrayBuffer = e.target.result;

            try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            } catch (err) {}

            pdfjsLib.getDocument({ data: arrayBuffer }).promise
                .then(function(pdf) {
                    var textoCompleto = '';
                    var promises = [];

                    for (var i = 1; i <= pdf.numPages; i++) {
                        promises.push(pdf.getPage(i).then(function(page) {
                            return page.getTextContent().then(function(textContent) {
                                if (textContent && textContent.items) {
                                    textoCompleto += textContent.items.map(function(item) { return item.str || ''; }).join(' ') + '\n';
                                }
                            });
                        }));
                    }

                    return Promise.all(promises).then(function() { return textoCompleto; });
                })
                .then(function(texto) {
                    self._pdfTexto = texto;
                    console.log('📄 TEXTO COMPLETO EXTRAÍDO DO PDF:');
                    console.log(texto);
                    
                    var dadosBrutos = self._extrairTodosOsDados(texto);
                    console.log('📊 DADOS BRUTOS EXTRAÍDOS:', dadosBrutos);
                    
                    var dadosMapeados = self._mapearDados(dadosBrutos);
                    console.log('📊 DADOS MAPEADOS:', dadosMapeados);
                    
                    self._dadosExtraidos = dadosMapeados;
                    self._preencherCampos(dadosMapeados);
                    
                    var todasParcelas = [];
                    
                    if (dadosMapeados.parcelasAbertas && dadosMapeados.parcelasAbertas.length > 0) {
                        dadosMapeados.parcelasAbertas.forEach(function(p) {
                            todasParcelas.push({
                                numero: p.numero || 0,
                                vencimento: p.dataVencimento || p.vencimento || '',
                                valor: p.valor || 0,
                                status: p.status || 'Pendente',
                                dataPagamento: p.dataPagamento || '',
                                historico: p.historico || ''
                            });
                        });
                    }
                    
                    if (dadosMapeados.parcelasLiquidadas && dadosMapeados.parcelasLiquidadas.length > 0) {
                        dadosMapeados.parcelasLiquidadas.forEach(function(p) {
                            todasParcelas.push({
                                numero: p.numero || 0,
                                vencimento: p.dataVencimento || p.vencimento || '',
                                valor: p.valorPago || p.valor || 0,
                                status: p.status || 'Pago',
                                dataPagamento: p.dataPagamento || '',
                                historico: p.historico || ''
                            });
                        });
                    }
                    
                    todasParcelas.sort(function(a, b) {
                        return (a.numero || 0) - (b.numero || 0);
                    });
                    
                    console.log('📋 TODAS AS PARCELAS (abertas + liquidadas):', todasParcelas);
                    console.log('📋 Quantidade total:', todasParcelas.length);
                    
                    if (todasParcelas.length > 0) {
                        todasParcelas = todasParcelas.map(function(p) {
                            var novaP = JSON.parse(JSON.stringify(p));
                            if (novaP.vencimento) {
                                var partes = novaP.vencimento.split('/');
                                if (partes.length === 3) {
                                    novaP.vencimento = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                                }
                            }
                            if (novaP.dataPagamento) {
                                var partes = novaP.dataPagamento.split('/');
                                if (partes.length === 3) {
                                    novaP.dataPagamento = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                                }
                            }
                            return novaP;
                        });
                        
                        self._parcelasTemp = JSON.parse(JSON.stringify(todasParcelas));
                        setTimeout(function() {
                            self._preencherTabelaParcelas(self._parcelasTemp);
                            console.log('✅ Tabela com TODAS as parcelas preenchida!');
                        }, 300);
                    } else {
                        console.warn('⚠️ Nenhuma parcela extraída do PDF');
                        self._parcelasTemp = [];
                        self._preencherTabelaParcelas([]);
                    }
                    
                    var preview = document.getElementById('pdf-preview');
                    if (preview) preview.style.display = 'block';
                    var info = document.getElementById('pdf-info-geral');
                    if (info) info.style.display = 'block';
                    
                    var parcelasInfo = document.getElementById('parcelas-info');
                    if (parcelasInfo) {
                        var abertas = dadosMapeados.parcelasAbertas ? dadosMapeados.parcelasAbertas.length : 0;
                        var liquidadas = dadosMapeados.parcelasLiquidadas ? dadosMapeados.parcelasLiquidadas.length : 0;
                        parcelasInfo.textContent = 'Parcelas em aberto: ' + abertas + ' | Liquidadas: ' + liquidadas + ' | Total: ' + (abertas + liquidadas);
                    }
                    
                    if (statusEl) statusEl.textContent = '✅ Dados extraídos!';
                    
                    GR.Toast.success('PDF processado! ' + todasParcelas.length + ' parcelas extraídas.');
                })
                .catch(function(err) {
                    console.error('❌ Erro no PDF:', err);
                    GR.Toast.error('Erro ao processar: ' + err.message);
                    if (statusEl) statusEl.textContent = '❌ Erro';
                });
        };

        reader.readAsArrayBuffer(file);
    },

    // ================================================================
    // MELHORIA: EXTRAIR SALDO QUITAÇÃO (ASPAS E PADRÕES ESPECÍFICOS)
    // ================================================================
    _extrairSaldoEntreAspas: function(texto) {
        console.log('🔍 [MELHORIA] Verificando saldo em padrões especiais...');
        
        var saldo = 0;
        var padroes = [
            {
                regex: /"([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})"/,
                desc: 'Aspas duplas'
            },
            {
                regex: /'([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})'/,
                desc: 'Aspas simples'
            },
            {
                regex: /%\s+a\.a\.\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+0\s+Conta\s+Garantia/,
                desc: '% a.a. [valor] 0 Conta Garantia'
            },
            {
                regex: /%\s+a\.a\.\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/,
                desc: '% a.a. [valor]'
            },
            {
                regex: /%\s+a\.a\.\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+0/,
                desc: '% a.a. [valor] 0'
            }
        ];
        
        for (var i = 0; i < padroes.length; i++) {
            var match = texto.match(padroes[i].regex);
            if (match) {
                var valor = match[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                saldo = parseFloat(valor) || 0;
                if (saldo > 0) {
                    console.log('💰 [MELHORIA] Saldo encontrado (padrão ' + (i + 1) + ' - ' + padroes[i].desc + '):', saldo);
                    console.log('   Match completo:', match[0]);
                    return saldo;
                }
            }
        }
        
        console.log('ℹ️ [MELHORIA] Nenhum saldo encontrado nos padrões especiais.');
        return 0;
    },

    // ================================================================
    // EXTRAIR TODOS OS DADOS DO TEXTO - COM MODELO 1, 2, 3 e 4
    // ================================================================
    _extrairTodosOsDados: function(texto) {
        console.log('🔍 Extraindo TODOS os dados do texto...');
        
        var saldoEspecial = this._extrairSaldoEntreAspas(texto);
        if (saldoEspecial > 0) {
            console.log('💰 [MELHORIA] Saldo especial será usado como prioridade:', saldoEspecial);
        }
        
        var dados = {
            contrato: '',
            matricula: '',
            cliente: '',
            modalidade: '',
            instituicao: '',
            taxaJuros: 0,
            valorOperacao: 0,
            saldoQuitacao: 0,
            dataEmissao: '',
            dataOperacao: '',
            dataVencto: '',
            cooperativa: '',
            prazo: '',
            valorLiquido: 0,
            taxaMulta: 0,
            taxaMora: 0,
            parcelasAbertas: [],
            parcelasLiquidadas: [],
            totalParcelasAbertas: 0,
            totalParcelasLiquidadas: 0,
            valorParcelasAbertas: 0,
            valorParcelasLiquidadas: 0
        };

        var dataEmissaoMatch = texto.match(/Data\s+de\s+Emissão\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (dataEmissaoMatch) {
            dados.dataEmissao = dataEmissaoMatch[1].trim();
            console.log('📅 Data Emissão:', dados.dataEmissao);
        }

        dados.dataOperacao = this._buscarDataLiberacao(texto);
        console.log('📅 Data Liberação final:', dados.dataOperacao);

        var dataVenctoMatch = texto.match(/Data\s+Vencto\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (dataVenctoMatch) {
            dados.dataVencto = dataVenctoMatch[1].trim();
            console.log('📅 Data Vencto:', dados.dataVencto);
        }

        var matriculaMatch = texto.match(/Matrícula\s*:\s*([0-9]+)/i);
        if (matriculaMatch) {
            dados.matricula = matriculaMatch[1].trim();
            console.log('📄 Matrícula:', dados.matricula);
        }

        var cooperativaMatch = texto.match(/Cooperativa\s*:\s*([0-9]+)/i);
        if (cooperativaMatch) {
            dados.cooperativa = cooperativaMatch[1].trim();
            console.log('🏦 Cooperativa:', dados.cooperativa);
        }

        var taxaMultaMatch = texto.match(/Taxa\s+Multa\s*:\s*([0-9]+[,.]?[0-9]*)\s*%/i);
        if (taxaMultaMatch) {
            dados.taxaMulta = parseFloat(taxaMultaMatch[1].trim().replace(',', '.')) || 0;
            console.log('📊 Taxa Multa:', dados.taxaMulta);
        }
        
        var taxaMoraMatch = texto.match(/Taxa\s+Mora\s*:\s*([0-9]+[,.]?[0-9]*)\s*%/i);
        if (taxaMoraMatch) {
            dados.taxaMora = parseFloat(taxaMoraMatch[1].trim().replace(',', '.')) || 0;
            console.log('📊 Taxa Mora:', dados.taxaMora);
        }

        var prazoMatch = texto.match(/Prazo\s*:\s*([0-9]+)/i);
        if (prazoMatch) {
            dados.prazo = prazoMatch[1].trim();
            console.log('📋 Prazo:', dados.prazo);
        }

        var abertoIndex = texto.search(/Parcelas\s+em\s+Aberto/i);
        var liquidadoIndex = texto.search(/Parcelas\s+Liquidadas/i);
        var amortizacaoIndex = texto.search(/Amortização\s+do\s+Saldo\s+Devedor/i);
        
        var instituicao = this._identificarInstituicao(texto);
        var padraoId = 'modelo4_' + (instituicao || 'padrao');
        var padroes = GR.State.data.padroesExtracao || {};
        var padraoSalvo = padroes[padraoId] || null;
        
        console.log('📌 "Parcelas em Aberto":', abertoIndex);
        console.log('📌 "Parcelas Liquidadas":', liquidadoIndex);
        console.log('📌 "Amortização":', amortizacaoIndex);
        console.log('📌 "Instituição detectada":', instituicao);
        console.log('📌 "Padrão Modelo 4 existe?":', padraoSalvo ? '✅ Sim' : '❌ Não');

        if (abertoIndex !== -1) {
            var inicioAberto = abertoIndex;
            var fimAberto = liquidadoIndex !== -1 ? liquidadoIndex : (amortizacaoIndex !== -1 ? amortizacaoIndex : texto.length);
            var secaoAberto = texto.substring(inicioAberto, fimAberto);
            
            console.log('📄 Seção Parcelas em Aberto:', secaoAberto.substring(0, 500));
            
            var padraoAberto = /([0-9]+)\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+[0-9,]+\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g;
            var abertas = [];
            var valorAbertas = 0;
            var match;
            
            while ((match = padraoAberto.exec(secaoAberto)) !== null) {
                var numero = parseInt(match[1]) || 0;
                var dataVencimento = match[2].trim();
                var valor = parseFloat(match[3].replace(/[^0-9,]/g, '').replace(',', '.'));
                
                if (valor > 0) {
                    abertas.push({
                        numero: numero,
                        dataVencimento: dataVencimento,
                        valor: valor,
                        status: 'Pendente',
                        dataPagamento: '',
                        historico: ''
                    });
                    valorAbertas += valor;
                    console.log('✅ Parcela em aberto:', numero, dataVencimento, 'R$', valor);
                }
            }
            
            dados.parcelasAbertas = abertas;
            dados.totalParcelasAbertas = abertas.length;
            dados.valorParcelasAbertas = valorAbertas;
            console.log('📋 Total Parcelas em Aberto:', abertas.length, 'parcelas, total: R$', valorAbertas);
        }

        // MODELO 1
        if (liquidadoIndex !== -1) {
            console.log('📄 MODELO 1: "Parcelas Liquidadas" detectado!');
            
            var contratoMatch = texto.match(/Contrato\s*:\s*([0-9]+)/i);
            if (contratoMatch) {
                dados.contrato = contratoMatch[1].trim();
                console.log('📄 Contrato (MODELO 1):', dados.contrato);
            } else {
                var fallbackContrato = texto.match(/- % a\.a\s+([0-9]+)\s+3-SAC/);
                if (fallbackContrato) {
                    dados.contrato = fallbackContrato[1].trim();
                    console.log('📄 Contrato (MODELO 1 - fallback):', dados.contrato);
                }
            }

            var clienteMatch = texto.match(/[0-9]+-[0-9]+\s+([A-Z][A-Z\s]+?)(?=\s+[0-9]+\s+[0-9]+-ACI)/);
            if (clienteMatch) {
                dados.cliente = clienteMatch[1].trim();
                console.log('👤 Cliente (MODELO 1):', dados.cliente);
            }

            var modalidadeMatch = texto.match(/[0-9]+-ACI\s*-\s*([A-Za-zÀ-Üà-ü\s]+?)(?=\s+[0-9,]+)/);
            if (modalidadeMatch) {
                dados.modalidade = modalidadeMatch[1].trim();
                console.log('🏷️ Modalidade (MODELO 1):', dados.modalidade);
            }

            var instituicaoMatch = texto.match(/([0-9]+-[A-Za-zÀ-Üà-ü]+)\s+-\s+PA\s+RIO\s+BANANAL/);
            if (instituicaoMatch) {
                var inst = instituicaoMatch[1].trim();
                var partes = inst.split('-');
                if (partes.length > 1) {
                    dados.instituicao = partes[1].trim();
                } else {
                    dados.instituicao = inst;
                }
                console.log('🏦 Instituição (MODELO 1):', dados.instituicao);
            }

            var valorOperacaoMatch = texto.match(/Valor\s+Operação\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/);
            if (valorOperacaoMatch) {
                var v = valorOperacaoMatch[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                dados.valorOperacao = parseFloat(v) || 0;
                console.log('💰 Valor Operação (MODELO 1):', dados.valorOperacao);
            } else {
                var fallbackValor = texto.match(/1,0000\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+2,00/);
                if (fallbackValor) {
                    var v = fallbackValor[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                    dados.valorOperacao = parseFloat(v) || 0;
                    console.log('💰 Valor Operação (MODELO 1 - fallback):', dados.valorOperacao);
                }
            }

            if (saldoEspecial > 0) {
                dados.saldoQuitacao = saldoEspecial;
                console.log('💰 Saldo Quitação (MODELO 1 - especial):', dados.saldoQuitacao);
            } else {
                var saldoMatch = texto.match(/([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+Taxa\s+Juros\s+Inad/);
                if (saldoMatch) {
                    var s = saldoMatch[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                    dados.saldoQuitacao = parseFloat(s) || 0;
                    console.log('💰 Saldo Quitação (MODELO 1):', dados.saldoQuitacao);
                } else {
                    var saldoQuit = texto.match(/Saldo\s+p\/\s+Quitação\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/);
                    if (saldoQuit) {
                        var s = saldoQuit[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                        dados.saldoQuitacao = parseFloat(s) || 0;
                        console.log('💰 Saldo Quitação (MODELO 1 - fallback):', dados.saldoQuitacao);
                    }
                }
            }

            var taxaJurosMatch = texto.match(/Taxa\s+Juros\s*:\s*([0-9]+[,.]?[0-9]*)/);
            if (taxaJurosMatch) {
                dados.taxaJuros = parseFloat(taxaJurosMatch[1].trim().replace(',', '.')) || 0;
                console.log('📊 Taxa Juros (MODELO 1):', dados.taxaJuros);
            } else {
                var fallbackTaxa = texto.match(/PRONAF REPASSE\s+([0-9,]+)\s+1,0000/);
                if (fallbackTaxa) {
                    dados.taxaJuros = parseFloat(fallbackTaxa[1].trim().replace(',', '.')) || 0;
                    console.log('📊 Taxa Juros (MODELO 1 - fallback):', dados.taxaJuros);
                }
            }

            var secaoLiquidado = texto.substring(liquidadoIndex);
            console.log('📄 Seção Parcelas Liquidadas (MODELO 1):', secaoLiquidado.substring(0, 500));
            
            var padraoLiq = /([0-9]+)\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+([A-Za-zÀ-Üà-ü0-9\s\/\.-]+?)\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/g;
            
            var liquidadas = [];
            var valorLiquidadas = 0;
            var matchLiq;
            
            while ((matchLiq = padraoLiq.exec(secaoLiquidado)) !== null) {
                var numero = parseInt(matchLiq[1]) || 0;
                var dataVencimento = matchLiq[2].trim();
                var historico = matchLiq[3].trim();
                var valorPago = parseFloat(matchLiq[4].replace(/[^0-9,]/g, '').replace(',', '.'));
                var dataPagamento = matchLiq[5].trim();
                
                if (valorPago > 0) {
                    liquidadas.push({
                        numero: numero,
                        dataVencimento: dataVencimento,
                        historico: historico,
                        valorPago: valorPago,
                        dataPagamento: dataPagamento,
                        status: 'Pago'
                    });
                    valorLiquidadas += valorPago;
                    console.log('✅ Parcela liquidada (MODELO 1):', numero, dataVencimento, 'R$', valorPago, 'Pagto:', dataPagamento);
                }
            }
            
            if (liquidadas.length === 0) {
                console.log('🔄 Tentando padrão alternativo para liquidadas (MODELO 1)...');
                var padraoAlt = /([0-9]+)\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+([A-Za-zÀ-Üà-ü0-9\s\/\.-]+?)\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g;
                while ((matchLiq = padraoAlt.exec(secaoLiquidado)) !== null) {
                    var numero = parseInt(matchLiq[1]) || 0;
                    var dataVencimento = matchLiq[2].trim();
                    var historico = matchLiq[3].trim();
                    var valorPago = parseFloat(matchLiq[4].replace(/[^0-9,]/g, '').replace(',', '.'));
                    
                    if (valorPago > 0) {
                        liquidadas.push({
                            numero: numero,
                            dataVencimento: dataVencimento,
                            historico: historico,
                            valorPago: valorPago,
                            dataPagamento: '',
                            status: 'Pago'
                        });
                        valorLiquidadas += valorPago;
                        console.log('✅ Parcela liquidada (MODELO 1 - alt):', numero, dataVencimento, 'R$', valorPago);
                    }
                }
            }
            
            dados.parcelasLiquidadas = liquidadas;
            dados.totalParcelasLiquidadas = liquidadas.length;
            dados.valorParcelasLiquidadas = valorLiquidadas;
            console.log('📋 Total Parcelas Liquidadas (MODELO 1):', liquidadas.length, 'parcelas, total: R$', valorLiquidadas);
        }

        // MODELO 2
        else if (amortizacaoIndex !== -1) {
            console.log('📄 MODELO 2: "Amortização do Saldo Devedor" detectado!');
            
            console.log('🔍 Buscando Contrato (MODELO 2)...');
            var contratoMatch2 = texto.match(/Contrato\s*:\s*([0-9]+)/i);
            if (contratoMatch2) {
                dados.contrato = contratoMatch2[1].trim();
                console.log('📄 Contrato (MODELO 2 - campo):', dados.contrato);
            } else {
                var contratoAntigo = texto.match(/Contrato\s+Antigo\s*:\s*([0-9]+)/i);
                if (contratoAntigo) {
                    dados.contrato = contratoAntigo[1].trim();
                    console.log('📄 Contrato (MODELO 2 - antigo):', dados.contrato);
                } else {
                    var numDoc = texto.match(/Relatório[\s\S]*?([0-9]{8})/i);
                    if (numDoc) {
                        dados.contrato = numDoc[1].trim();
                        console.log('📄 Contrato (MODELO 2 - documento):', dados.contrato);
                    } else {
                        var numLinha = texto.match(/([0-9]{8})\s+[0-9]-[A-Z]/);
                        if (numLinha) {
                            dados.contrato = numLinha[1].trim();
                            console.log('📄 Contrato (MODELO 2 - linha de dados):', dados.contrato);
                        }
                    }
                }
            }

            console.log('🔍 Buscando Mutuário (MODELO 2)...');
            
            var mutuarioMatch = texto.match(/"([A-Z][A-Z\s]+)"/i);
            if (mutuarioMatch) {
                var nome = mutuarioMatch[1].trim();
                if (nome.split(' ').length >= 2) {
                    dados.cliente = nome;
                    console.log('👤 Mutuário (MODELO 2 - aspas):', dados.cliente);
                }
            }
            
            if (!dados.cliente) {
                var clienteMatch2 = texto.match(/Cliente\s*:\s*([0-9]+-[0-9]+\s+[A-Za-zÀ-Üà-ü\s]+)/i);
                if (clienteMatch2) {
                    var cliente = clienteMatch2[1].trim();
                    var nomeMatch = cliente.match(/[0-9]+-[0-9]+\s+(.+)/);
                    if (nomeMatch) {
                        dados.cliente = nomeMatch[1].trim();
                        console.log('👤 Mutuário (MODELO 2 - Cliente):', dados.cliente);
                    } else {
                        dados.cliente = cliente;
                        console.log('👤 Mutuário (MODELO 2 - Cliente):', dados.cliente);
                    }
                }
            }
            
            if (!dados.cliente) {
                var clienteLinha = texto.match(/([0-9]+-[0-9]+\s+[A-Z][A-Z\s]+?)(?=\s+[0-9]+\s+[0-9]+-ACI)/i);
                if (clienteLinha) {
                    var cliente = clienteLinha[1].trim();
                    var nomeMatch = cliente.match(/[0-9]+-[0-9]+\s+(.+)/);
                    if (nomeMatch) {
                        dados.cliente = nomeMatch[1].trim();
                        console.log('👤 Mutuário (MODELO 2 - linha de dados):', dados.cliente);
                    }
                }
            }
            
            if (!dados.cliente) {
                var clienteGen = texto.match(/([0-9]+-[0-9]+\s+[A-Za-zÀ-Üà-ü\s]+)/);
                if (clienteGen) {
                    var cliente = clienteGen[1].trim();
                    var nomeMatch = cliente.match(/[0-9]+-[0-9]+\s+(.+)/);
                    if (nomeMatch) {
                        dados.cliente = nomeMatch[1].trim();
                        console.log('👤 Mutuário (MODELO 2 - genérico):', dados.cliente);
                    }
                }
            }

            console.log('🔍 Buscando Modalidade (MODELO 2)...');
            
            var modalidadeMatch1 = texto.match(/([0-9]+)-"([A-Za-zÀ-Üà-ü\s]+)"/i);
            if (modalidadeMatch1) {
                dados.modalidade = modalidadeMatch1[2].trim();
                console.log('🏷️ Modalidade (MODELO 2 - aspas com código):', dados.modalidade);
            }
            
            if (!dados.modalidade) {
                var modalidadeMatch2 = texto.match(/"([A-Za-zÀ-Üà-ü\s]+)"/i);
                if (modalidadeMatch2) {
                    var modalidade = modalidadeMatch2[1].trim();
                    if (/PRONAF|BNDES|CDC|AGRO|RURAL|CREDITO/i.test(modalidade)) {
                        dados.modalidade = modalidade;
                        console.log('🏷️ Modalidade (MODELO 2 - aspas):', dados.modalidade);
                    }
                }
            }
            
            if (!dados.modalidade) {
                var modalidadeMatch3 = texto.match(/Modalidade\s*:\s*([0-9]+-[A-Za-zÀ-Üà-ü\s-]+)/i);
                if (modalidadeMatch3) {
                    var modalidade = modalidadeMatch3[1].trim();
                    var modNome = modalidade.replace(/[0-9]+-ACI\s*-\s*/, '');
                    dados.modalidade = modNome;
                    console.log('🏷️ Modalidade (MODELO 2 - campo):', dados.modalidade);
                }
            }
            
            if (!dados.modalidade) {
                var modalidadeLinha = texto.match(/([0-9]+-[A-Za-zÀ-Üà-ü\s]+?)(?=\s+[0-9,])/i);
                if (modalidadeLinha) {
                    var modalidade = modalidadeLinha[1].trim();
                    if (/[0-9]+-[A-Za-z]/.test(modalidade)) {
                        var modNome = modalidade.replace(/[0-9]+-/, '');
                        dados.modalidade = modNome;
                        console.log('🏷️ Modalidade (MODELO 2 - linha de dados):', dados.modalidade);
                    }
                }
            }

            console.log('🔍 Buscando Taxa Juros (MODELO 2)...');
            
            var taxaMatch1 = texto.match(/"([0-9]+[,.]?[0-9]+)"/i);
            if (taxaMatch1) {
                var taxa = parseFloat(taxaMatch1[1].trim().replace(',', '.')) || 0;
                if (taxa > 0 && taxa < 100) {
                    dados.taxaJuros = taxa;
                    console.log('📊 Taxa Juros (MODELO 2 - aspas):', dados.taxaJuros);
                }
            }
            
            if (dados.taxaJuros === 0) {
                var taxaMatch2 = texto.match(/(PRONAF|BNDES|AGRO|RURAL)[\s\S]*?([0-9]+[,.]?[0-9]{4})/i);
                if (taxaMatch2) {
                    var taxa = parseFloat(taxaMatch2[2].trim().replace(',', '.')) || 0;
                    if (taxa > 0 && taxa < 100) {
                        dados.taxaJuros = taxa;
                        console.log('📊 Taxa Juros (MODELO 2 - após PRONAF/BNDES):', dados.taxaJuros);
                    }
                }
            }
            
            if (dados.taxaJuros === 0) {
                var taxaMatch3 = texto.match(/Taxa\s+Juros\s*:\s*([0-9]+[,.]?[0-9]*)\s*%/i);
                if (taxaMatch3) {
                    dados.taxaJuros = parseFloat(taxaMatch3[1].trim().replace(',', '.')) || 0;
                    console.log('📊 Taxa Juros (MODELO 2 - campo):', dados.taxaJuros);
                }
            }
            
            if (dados.taxaJuros === 0) {
                var taxaMatch4 = texto.match(/([0-9]+[,.]?[0-9]{4})/i);
                if (taxaMatch4) {
                    var taxa = parseFloat(taxaMatch4[1].trim().replace(',', '.')) || 0;
                    if (taxa > 0 && taxa < 100) {
                        dados.taxaJuros = taxa;
                        console.log('📊 Taxa Juros (MODELO 2 - genérico):', dados.taxaJuros);
                    }
                }
            }

            if (saldoEspecial > 0) {
                dados.saldoQuitacao = saldoEspecial;
                console.log('💰 Saldo Quitação (MODELO 2 - especial):', dados.saldoQuitacao);
            } else {
                var saldoMatch1 = texto.match(/"([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})"/i);
                if (saldoMatch1) {
                    var s = saldoMatch1[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                    var valor = parseFloat(s) || 0;
                    if (valor > 1000) {
                        dados.saldoQuitacao = valor;
                        console.log('💰 Saldo Quitação (MODELO 2 - aspas):', dados.saldoQuitacao);
                    }
                }
                
                if (dados.saldoQuitacao === 0) {
                    var saldoMatch2 = texto.match(/Saldo\s+p\/\s+Quitação\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
                    if (saldoMatch2) {
                        var s = saldoMatch2[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                        dados.saldoQuitacao = parseFloat(s) || 0;
                        console.log('💰 Saldo Quitação (MODELO 2 - campo):', dados.saldoQuitacao);
                    }
                }
                
                if (dados.saldoQuitacao === 0) {
                    var saldoGen = texto.match(/([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g);
                    if (saldoGen) {
                        var valorOperacao = dados.valorOperacao || 0;
                        for (var i = 0; i < saldoGen.length; i++) {
                            var s = saldoGen[i].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                            var valor = parseFloat(s) || 0;
                            if (valor > 1000 && (valor > valorOperacao || Math.abs(valor - valorOperacao) < 10000)) {
                                dados.saldoQuitacao = valor;
                                console.log('💰 Saldo Quitação (MODELO 2 - genérico):', dados.saldoQuitacao);
                                break;
                            }
                        }
                    }
                }
            }

            console.log('🔍 Buscando Valor Operação (MODELO 2)...');
            var valorOperacaoMatch2 = texto.match(/Valor\s+Operação\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
            if (valorOperacaoMatch2) {
                var v = valorOperacaoMatch2[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                dados.valorOperacao = parseFloat(v) || 0;
                console.log('💰 Valor Operação (MODELO 2 - campo):', dados.valorOperacao);
            } else {
                var liberacaoValor = texto.match(/Liberações\s+Efetuadas[\s\S]*?1\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
                if (liberacaoValor) {
                    var v = liberacaoValor[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                    dados.valorOperacao = parseFloat(v) || 0;
                    console.log('💰 Valor Operação (MODELO 2 - Liberação):', dados.valorOperacao);
                }
            }

            console.log('🔍 Buscando Instituição (MODELO 2)...');
            var instituicaoMatch2 = texto.match(/Coop\.\s+Singular\s*:\s*([0-9]+-[A-Za-zÀ-Üà-ü\s-]+)/i);
            if (instituicaoMatch2) {
                dados.instituicao = instituicaoMatch2[1].trim();
                console.log('🏦 Instituição (MODELO 2):', dados.instituicao);
            } else {
                var cooperativaMatch2 = texto.match(/Cooperativa\s*:\s*([0-9]+)/i);
                if (cooperativaMatch2) {
                    dados.instituicao = cooperativaMatch2[1].trim();
                    console.log('🏦 Instituição (MODELO 2 - Cooperativa):', dados.instituicao);
                }
            }

            var secaoAmortizacao = texto.substring(amortizacaoIndex);
            console.log('📄 Seção Amortização (MODELO 2):', secaoAmortizacao.substring(0, 500));
            
            var padraoAmort = /([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+([A-Za-zÀ-Üà-ü0-9\s\/\.-]+?)\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/g;
            
            var amortizacoes = [];
            var valorAmortizacoes = 0;
            var matchAmort;
            var parcelaNumero = 1;
            
            while ((matchAmort = padraoAmort.exec(secaoAmortizacao)) !== null) {
                var dataPagamento = matchAmort[1].trim();
                var historico = matchAmort[2].trim();
                var valorPago = parseFloat(matchAmort[3].replace(/[^0-9,]/g, '').replace(',', '.'));
                var dataVencimento = matchAmort[4].trim();
                
                if (valorPago > 0) {
                    amortizacoes.push({
                        numero: parcelaNumero++,
                        dataVencimento: dataVencimento || dataPagamento,
                        dataPagamento: dataPagamento,
                        historico: historico,
                        valorPago: valorPago,
                        status: 'Pago'
                    });
                    valorAmortizacoes += valorPago;
                    console.log('✅ Amortização (MODELO 2):', dataPagamento, 'R$', valorPago);
                }
            }
            
            if (amortizacoes.length === 0) {
                console.log('🔄 Tentando padrão alternativo para amortização (MODELO 2)...');
                var padraoAlt = /([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+([A-Za-zÀ-Üà-ü0-9\s\/\.-]+?)\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g;
                parcelaNumero = 1;
                while ((matchAmort = padraoAlt.exec(secaoAmortizacao)) !== null) {
                    var dataPagamento = matchAmort[1].trim();
                    var historico = matchAmort[2].trim();
                    var valorPago = parseFloat(matchAmort[3].replace(/[^0-9,]/g, '').replace(',', '.'));
                    
                    if (valorPago > 0) {
                        amortizacoes.push({
                            numero: parcelaNumero++,
                            dataVencimento: dataPagamento,
                            dataPagamento: dataPagamento,
                            historico: historico,
                            valorPago: valorPago,
                            status: 'Pago'
                        });
                        valorAmortizacoes += valorPago;
                        console.log('✅ Amortização (MODELO 2 - alt):', dataPagamento, 'R$', valorPago);
                    }
                }
            }
            
            dados.parcelasLiquidadas = amortizacoes;
            dados.totalParcelasLiquidadas = amortizacoes.length;
            dados.valorParcelasLiquidadas = valorAmortizacoes;
            console.log('📋 Total Amortizações (MODELO 2):', amortizacoes.length, 'parcelas, total: R$', valorAmortizacoes);
        }

        // MODELO 4
        else if (padraoSalvo) {
            console.log('📄 MODELO 4: "Inteligente" detectado (padrão treinado para ' + instituicao + ')!');
            
            var dadosModelo4 = this._extrairComPadroes(texto, padraoSalvo);
            
            dados.contrato = dadosModelo4.contrato || dados.contrato;
            dados.cliente = dadosModelo4.cliente || dados.cliente;
            dados.modalidade = dadosModelo4.modalidade || dados.modalidade;
            dados.valorOperacao = dadosModelo4.valorOperacao || dados.valorOperacao;
            dados.taxaJuros = dadosModelo4.taxaJuros || dados.taxaJuros;
            
            if (saldoEspecial > 0) {
                dados.saldoQuitacao = saldoEspecial;
                console.log('💰 Saldo Quitação (MODELO 4 - especial):', dados.saldoQuitacao);
            } else if (dadosModelo4.saldoQuitacao > 0) {
                dados.saldoQuitacao = dadosModelo4.saldoQuitacao;
            }
            
            dados.dataOperacao = dadosModelo4.dataLiberacao || dados.dataOperacao;
            
            if (dados.parcelasAbertas.length === 0 && abertoIndex !== -1) {
                var secaoAberto4 = texto.substring(abertoIndex, texto.length);
                var padraoAberto4 = /([0-9]+)\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+[0-9,]+\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g;
                var match4;
                while ((match4 = padraoAberto4.exec(secaoAberto4)) !== null) {
                    var numero = parseInt(match4[1]) || 0;
                    var dataVencimento = match4[2].trim();
                    var valor = parseFloat(match4[3].replace(/[^0-9,]/g, '').replace(',', '.'));
                    if (valor > 0) {
                        dados.parcelasAbertas.push({
                            numero: numero,
                            dataVencimento: dataVencimento,
                            valor: valor,
                            status: 'Pendente',
                            dataPagamento: '',
                            historico: ''
                        });
                        dados.totalParcelasAbertas++;
                        dados.valorParcelasAbertas += valor;
                    }
                }
            }
            
            console.log('✅ Dados extraídos com MODELO 4:', {
                contrato: dados.contrato,
                cliente: dados.cliente,
                modalidade: dados.modalidade,
                valorOperacao: dados.valorOperacao,
                taxaJuros: dados.taxaJuros,
                saldoQuitacao: dados.saldoQuitacao,
                dataLiberacao: dados.dataOperacao,
                parcelasAbertas: dados.parcelasAbertas.length
            });
        }

        // MODELO 3
        else {
            console.log('📄 MODELO 3: "Somente Parcelas em Aberto" detectado!');
            
            console.log('🔍 Buscando Contrato (MODELO 3)...');
            var contratoMatch3 = texto.match(/Contrato\s*:\s*([0-9]+)/i);
            if (contratoMatch3) {
                dados.contrato = contratoMatch3[1].trim();
                console.log('📄 Contrato (MODELO 3 - campo):', dados.contrato);
            } else {
                var contratoNum3 = texto.match(/([0-9]{8})\s+Contrato\s+Antigo/i);
                if (contratoNum3) {
                    dados.contrato = contratoNum3[1].trim();
                    console.log('📄 Contrato (MODELO 3 - número no texto):', dados.contrato);
                } else {
                    var contratoDoc3 = texto.match(/Relatório[\s\S]*?([0-9]{8})/i);
                    if (contratoDoc3) {
                        dados.contrato = contratoDoc3[1].trim();
                        console.log('📄 Contrato (MODELO 3 - documento):', dados.contrato);
                    } else {
                        var contratoFinal = texto.match(/([0-9]{8})\s+[0-9]-[A-Z]/);
                        if (contratoFinal) {
                            dados.contrato = contratoFinal[1].trim();
                            console.log('📄 Contrato (MODELO 3 - final):', dados.contrato);
                        }
                    }
                }
            }

            console.log('🔍 Buscando Mutuário (MODELO 3)...');
            var clienteMatch3 = texto.match(/Cliente\s*:\s*([0-9]+-[0-9]+\s+[A-Za-zÀ-Üà-ü\s]+)/i);
            if (clienteMatch3) {
                var cliente = clienteMatch3[1].trim();
                var nomeMatch = cliente.match(/[0-9]+-[0-9]+\s+(.+)/);
                if (nomeMatch) {
                    dados.cliente = nomeMatch[1].trim();
                    console.log('👤 Mutuário (MODELO 3 - campo):', dados.cliente);
                } else {
                    dados.cliente = cliente;
                    console.log('👤 Mutuário (MODELO 3 - campo):', dados.cliente);
                }
            } else {
                var clienteLinha3 = texto.match(/([0-9]+-[0-9]+\s+[A-Z][A-Z\s]+?)(?=\s+[0-9]+\s+[0-9]+-ACI)/i);
                if (clienteLinha3) {
                    var cliente = clienteLinha3[1].trim();
                    var nomeMatch = cliente.match(/[0-9]+-[0-9]+\s+(.+)/);
                    if (nomeMatch) {
                        dados.cliente = nomeMatch[1].trim();
                        console.log('👤 Mutuário (MODELO 3 - linha de dados):', dados.cliente);
                    }
                } else {
                    var clienteGen3 = texto.match(/([0-9]+-[0-9]+\s+[A-Za-zÀ-Üà-ü\s]+)/);
                    if (clienteGen3) {
                        var cliente = clienteGen3[1].trim();
                        var nomeMatch = cliente.match(/[0-9]+-[0-9]+\s+(.+)/);
                        if (nomeMatch) {
                            dados.cliente = nomeMatch[1].trim();
                            console.log('👤 Mutuário (MODELO 3 - genérico):', dados.cliente);
                        }
                    }
                }
            }

            console.log('🔍 Buscando Modalidade (MODELO 3)...');
            var modalidadeMatch3 = texto.match(/Modalidade\s*:\s*([0-9]+-[A-Za-zÀ-Üà-ü\s-]+)/i);
            if (modalidadeMatch3) {
                var modalidade = modalidadeMatch3[1].trim();
                var modNome = modalidade.replace(/[0-9]+-ACI\s*-\s*/, '');
                dados.modalidade = modNome;
                console.log('🏷️ Modalidade (MODELO 3 - campo):', dados.modalidade);
            } else {
                var modalidadeLinha3 = texto.match(/([0-9]+-ACI\s*-\s*[A-Za-zÀ-Üà-ü\s]+?)(?=\s+[0-9,])/i);
                if (modalidadeLinha3) {
                    var modalidade = modalidadeLinha3[1].trim();
                    var modNome = modalidade.replace(/[0-9]+-ACI\s*-\s*/, '');
                    dados.modalidade = modNome;
                    console.log('🏷️ Modalidade (MODELO 3 - linha de dados):', dados.modalidade);
                } else {
                    var modalidadeGen3 = texto.match(/([0-9]+-[A-Za-zÀ-Üà-ü\s]+?)(?=\s+[0-9,])/i);
                    if (modalidadeGen3) {
                        var modalidade = modalidadeGen3[1].trim();
                        if (/[0-9]+-[A-Za-z]/.test(modalidade)) {
                            var modNome = modalidade.replace(/[0-9]+-/, '');
                            dados.modalidade = modNome;
                            console.log('🏷️ Modalidade (MODELO 3 - genérico):', dados.modalidade);
                        }
                    }
                }
            }

            console.log('🔍 Buscando Valor Operação (MODELO 3)...');
            var valorMatch3 = texto.match(/Valor\s+Operação\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
            if (valorMatch3) {
                var v = valorMatch3[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                dados.valorOperacao = parseFloat(v) || 0;
                console.log('💰 Valor Operação (MODELO 3 - campo):', dados.valorOperacao);
            } else {
                var liberacaoValor3 = texto.match(/Liberações\s+Efetuadas[\s\S]*?1\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
                if (liberacaoValor3) {
                    var v = liberacaoValor3[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                    dados.valorOperacao = parseFloat(v) || 0;
                    console.log('💰 Valor Operação (MODELO 3 - Liberação):', dados.valorOperacao);
                } else {
                    var valorGrande = texto.match(/([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+[0-9,]+/);
                    if (valorGrande) {
                        var v = valorGrande[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                        dados.valorOperacao = parseFloat(v) || 0;
                        console.log('💰 Valor Operação (MODELO 3 - genérico):', dados.valorOperacao);
                    }
                }
            }

            console.log('🔍 Buscando Taxa Juros (MODELO 3)...');
            var taxaMatch3 = texto.match(/Taxa\s+Juros\s*:\s*([0-9]+[,.]?[0-9]*)\s*%/i);
            if (taxaMatch3) {
                dados.taxaJuros = parseFloat(taxaMatch3[1].trim().replace(',', '.')) || 0;
                console.log('📊 Taxa Juros (MODELO 3 - campo):', dados.taxaJuros);
            } else {
                var taxaLinha3 = texto.match(/(PRONAF|BNDES|AGRO|RURAL)[\s\S]*?([0-9]+[,.]?[0-9]+)/i);
                if (taxaLinha3) {
                    var taxa = parseFloat(taxaLinha3[2].trim().replace(',', '.')) || 0;
                    if (taxa > 0 && taxa < 100) {
                        dados.taxaJuros = taxa;
                        console.log('📊 Taxa Juros (MODELO 3 - linha de dados):', dados.taxaJuros);
                    }
                } else {
                    var taxaGen3 = texto.match(/([0-9]+[,.]?[0-9]{4})/i);
                    if (taxaGen3) {
                        var taxa = parseFloat(taxaGen3[1].trim().replace(',', '.')) || 0;
                        if (taxa > 0 && taxa < 100) {
                            dados.taxaJuros = taxa;
                            console.log('📊 Taxa Juros (MODELO 3 - genérico):', dados.taxaJuros);
                        }
                    }
                }
            }

            if (saldoEspecial > 0) {
                dados.saldoQuitacao = saldoEspecial;
                console.log('💰 Saldo Quitação (MODELO 3 - especial):', dados.saldoQuitacao);
            } else {
                var saldoMatch3 = texto.match(/Saldo\s+p\/\s+Quitação\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
                if (saldoMatch3) {
                    var s = saldoMatch3[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                    dados.saldoQuitacao = parseFloat(s) || 0;
                    console.log('💰 Saldo Quitação (MODELO 3 - campo):', dados.saldoQuitacao);
                } else {
                    var saldoLinha3 = texto.match(/([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+Taxa\s+Juros\s+Inad/i);
                    if (saldoLinha3) {
                        var s = saldoLinha3[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                        dados.saldoQuitacao = parseFloat(s) || 0;
                        console.log('💰 Saldo Quitação (MODELO 3 - Taxa Juros Inad):', dados.saldoQuitacao);
                    } else {
                        var saldoGen3 = texto.match(/([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g);
                        if (saldoGen3) {
                            var valorOperacao = dados.valorOperacao || 0;
                            for (var i = 0; i < saldoGen3.length; i++) {
                                var s = saldoGen3[i].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                                var valor = parseFloat(s) || 0;
                                if (valor > 1000 && valor > valorOperacao) {
                                    dados.saldoQuitacao = valor;
                                    console.log('💰 Saldo Quitação (MODELO 3 - genérico):', dados.saldoQuitacao);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            console.log('🔍 Buscando Instituição (MODELO 3)...');
            var instituicaoMatch3 = texto.match(/Coop\.\s+Singular\s*:\s*([0-9]+-[A-Za-zÀ-Üà-ü\s-]+)/i);
            if (instituicaoMatch3) {
                dados.instituicao = instituicaoMatch3[1].trim();
                console.log('🏦 Instituição (MODELO 3):', dados.instituicao);
            }

            console.log('🔍 Buscando Parcelas em Aberto (MODELO 3)...');
            
            var padraoAberto3 = /([0-9]+)\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+[0-9]+\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g;
            var abertas3 = [];
            var valorAbertas3 = 0;
            var match3;
            
            while ((match3 = padraoAberto3.exec(texto)) !== null) {
                var numero = parseInt(match3[1]) || 0;
                var dataVencimento = match3[2].trim();
                var valor = parseFloat(match3[3].replace(/[^0-9,]/g, '').replace(',', '.'));
                
                if (valor > 0) {
                    abertas3.push({
                        numero: numero,
                        dataVencimento: dataVencimento,
                        valor: valor,
                        status: 'Pendente',
                        dataPagamento: '',
                        historico: ''
                    });
                    valorAbertas3 += valor;
                    console.log('✅ Parcela em aberto (MODELO 3):', numero, dataVencimento, 'R$', valor);
                }
            }
            
            dados.parcelasAbertas = abertas3;
            dados.totalParcelasAbertas = abertas3.length;
            dados.valorParcelasAbertas = valorAbertas3;
            console.log('📋 Total Parcelas em Aberto (MODELO 3):', abertas3.length, 'parcelas, total: R$', valorAbertas3);
        }

        console.log('✅ Extração completa concluída!');
        console.log('📊 Resumo: Abertas=' + dados.parcelasAbertas.length + ', Liquidadas=' + dados.parcelasLiquidadas.length + ', SaldoQuitação=' + dados.saldoQuitacao);
        return dados;
    },

    // ================================================================
    // MAPEAR DADOS BRUTOS
    // ================================================================
    _mapearDados: function(dadosBrutos) {
        return {
            numeroContrato: dadosBrutos.contrato || dadosBrutos.matricula || '',
            mutuario: dadosBrutos.cliente || '',
            valorOperacao: dadosBrutos.valorOperacao || dadosBrutos.valorLiquido || 0,
            modalidade: dadosBrutos.modalidade || '',
            instituicao: dadosBrutos.instituicao || dadosBrutos.cooperativa || '',
            taxaJuros: dadosBrutos.taxaJuros || 0,
            dataLiberacao: dadosBrutos.dataOperacao || dadosBrutos.dataVencto || '',
            saldoQuitacao: dadosBrutos.saldoQuitacao || 0,
            dataQuitacao: dadosBrutos.dataEmissao || '',
            parcelasAbertas: dadosBrutos.parcelasAbertas || [],
            parcelasLiquidadas: dadosBrutos.parcelasLiquidadas || [],
            totalParcelasAbertas: dadosBrutos.totalParcelasAbertas || 0,
            totalParcelasLiquidadas: dadosBrutos.totalParcelasLiquidadas || 0,
            valorParcelasAbertas: dadosBrutos.valorParcelasAbertas || 0,
            valorParcelasLiquidadas: dadosBrutos.valorParcelasLiquidadas || 0
        };
    },

    // ================================================================
    // PREENCHER CAMPOS
    // ================================================================
    _preencherCampos: function(dados) {
        console.log('📝 Preenchendo campos...');
        console.log('📝 Dados recebidos:', dados);
        
        if (dados.numeroContrato) {
            var el = document.getElementById('contrato-numero');
            if (el) {
                el.value = dados.numeroContrato;
                console.log('📝 Número do Contrato preenchido:', dados.numeroContrato);
            }
        }
        
        if (dados.mutuario) {
            var el = document.getElementById('contrato-mutuario');
            if (el) {
                el.value = dados.mutuario;
                console.log('📝 Mutuário preenchido:', dados.mutuario);
            }
        }
        
        if (dados.valorOperacao > 0) {
            var el = document.getElementById('contrato-valor');
            if (el) {
                el.value = GR.Utils.formatarMoedaSemSimbolo(dados.valorOperacao);
                console.log('📝 Valor preenchido:', dados.valorOperacao);
            }
        }
        
        if (dados.modalidade) {
            var el = document.getElementById('contrato-modalidade');
            if (el) {
                el.value = dados.modalidade;
                console.log('📝 Modalidade preenchida:', dados.modalidade);
            }
        }
        
        if (dados.instituicao) {
            var el = document.getElementById('contrato-instituicao');
            if (el) {
                el.value = dados.instituicao;
                console.log('📝 Instituição preenchida:', dados.instituicao);
            }
        }
        
        if (dados.taxaJuros > 0) {
            var el = document.getElementById('contrato-taxa-juros');
            if (el) {
                el.value = dados.taxaJuros;
                console.log('📝 Taxa preenchida:', dados.taxaJuros);
            }
        }
        
        if (dados.dataLiberacao) {
            var partes = dados.dataLiberacao.split(/[\/-]/);
            if (partes.length === 3) {
                var el = document.getElementById('contrato-data');
                if (el) {
                    el.value = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                    console.log('📝 Data Liberação preenchida:', dados.dataLiberacao);
                }
            }
        }
        
        if (dados.saldoQuitacao > 0) {
            var el = document.getElementById('contrato-saldo-quitacao');
            if (el) {
                el.value = GR.Utils.formatarMoedaSemSimbolo(dados.saldoQuitacao);
                console.log('📝 Saldo Quitação preenchido:', dados.saldoQuitacao);
            }
        }
        
        if (dados.dataQuitacao) {
            var partes = dados.dataQuitacao.split(/[\/-]/);
            if (partes.length === 3) {
                var el = document.getElementById('contrato-data-saldo');
                if (el) {
                    el.value = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                    console.log('📝 Data Quitação preenchida:', dados.dataQuitacao);
                }
            }
        }

        var els = {
            'pdf-data-liberacao': dados.dataLiberacao || '-',
            'pdf-valor-liberacao': dados.valorOperacao > 0 ? GR.Utils.formatarMoedaBR(dados.valorOperacao) : '-',
            'pdf-cliente': dados.mutuario || '-',
            'pdf-numero-contrato': dados.numeroContrato || '-',
            'pdf-taxa-juros': dados.taxaJuros > 0 ? dados.taxaJuros + '%' : '-',
            'pdf-saldo-quitacao': dados.saldoQuitacao > 0 ? GR.Utils.formatarMoedaBR(dados.saldoQuitacao) : '-',
            'pdf-data-saldo': dados.dataQuitacao || '-',
            'pdf-modalidade': dados.modalidade || '-',
            'pdf-instituicao': dados.instituicao || '-'
        };
        
        for (var id in els) {
            var el = document.getElementById(id);
            if (el) el.textContent = els[id];
        }
    },

    // ================================================================
    // GERENCIAR PARCELAS NA TABELA
    // ================================================================
    _preencherTabelaParcelas: function(parcelas) {
        console.log('📝 _preencherTabelaParcelas chamado com:', parcelas);
        var tbody = document.getElementById('parcelas-tbody');
        if (!tbody) {
            console.warn('⚠️ tbody não encontrado!');
            return;
        }
        tbody.innerHTML = '';
        if (!parcelas || !parcelas.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:6px;">Nenhuma parcela cadastrada</td></tr>';
            this._atualizarTotaisParcelas();
            return;
        }
        console.log('📝 Exibindo ' + parcelas.length + ' parcelas');
        
        var self = this;
        parcelas.forEach(function(p, index) {
            var tr = document.createElement('tr');
            tr.dataset.index = index;
            
            var vencimento = p.vencimento || '';
            var dataPagamento = p.dataPagamento || '';
            
            var converterData = function(dataStr) {
                if (!dataStr) return '';
                if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) return dataStr;
                var partes = dataStr.split('/');
                if (partes.length === 3) {
                    return partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                }
                return dataStr;
            };
            
            var vencimentoISO = converterData(vencimento);
            var dataPagamentoISO = converterData(dataPagamento);
            
            tr.innerHTML = `
                <td><input type="number" class="form-control" style="width:50px;font-size:10px;padding:2px;" value="${p.numero || ''}" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'numero', this.value)"></td>
                <td><input type="date" class="form-control" style="width:90px;font-size:10px;padding:2px;" value="${vencimentoISO}" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'vencimento', this.value)"></td>
                <td><input type="text" class="form-control" style="width:80px;font-size:10px;padding:2px;" value="${p.valor ? GR.Utils.formatarMoedaSemSimbolo(p.valor) : '0,00'}" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'valor', this.value)"></td>
                <td>
                    <select class="form-control" style="width:80px;font-size:10px;padding:2px;" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'status', this.value)">
                        <option value="Pendente" ${p.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Pago" ${p.status === 'Pago' ? 'selected' : ''}>Pago</option>
                    </select>
                </td>
                <td><input type="date" class="form-control" style="width:90px;font-size:10px;padding:2px;" value="${dataPagamentoISO}" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'dataPagamento', this.value)"></td>
                <td><input type="text" class="form-control" style="width:100px;font-size:10px;padding:2px;" value="${p.historico || ''}" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'historico', this.value)"></td>
                <td><button class="btn btn-danger btn-sm" onclick="GR.Modules.Contratos._removerParcela(${index})" style="padding:0 4px;font-size:10px;">✕</button></td>
            `;
            tbody.appendChild(tr);
        });
        this._atualizarTotaisParcelas();
    },

    _atualizarParcela: function(index, campo, valor) {
        if (!this._parcelasTemp) this._parcelasTemp = [];
        if (!this._parcelasTemp[index]) {
            this._parcelasTemp[index] = { numero: 0, vencimento: '', valor: 0, status: 'Pendente', dataPagamento: '', historico: '' };
        }
        
        if (campo === 'vencimento' || campo === 'dataPagamento') {
            if (valor) {
                var partes = valor.split('-');
                if (partes.length === 3) {
                    valor = partes[2] + '/' + partes[1] + '/' + partes[0];
                }
            }
        }
        
        if (campo === 'valor') {
            valor = GR.Utils.parseMoedaBR(valor);
        }
        
        if (campo === 'numero') {
            valor = parseInt(valor) || 0;
        }
        
        this._parcelasTemp[index][campo] = valor;
        this._atualizarTotaisParcelas();
    },

    _removerParcela: function(index) {
        if (!this._parcelasTemp) this._parcelasTemp = [];
        if (index >= 0 && index < this._parcelasTemp.length) {
            this._parcelasTemp.splice(index, 1);
            this._preencherTabelaParcelas(this._parcelasTemp);
            this._atualizarTotaisParcelas();
        }
    },

    adicionarParcela: function() {
        if (!this._parcelasTemp) this._parcelasTemp = [];
        var ultimoNumero = 0;
        if (this._parcelasTemp.length > 0) {
            ultimoNumero = this._parcelasTemp[this._parcelasTemp.length - 1].numero || 0;
        }
        this._parcelasTemp.push({
            numero: ultimoNumero + 1,
            vencimento: '',
            valor: 0,
            status: 'Pendente',
            dataPagamento: '',
            historico: ''
        });
        this._preencherTabelaParcelas(this._parcelasTemp);
        this._atualizarTotaisParcelas();
    },

    removerUltimaParcela: function() {
        if (!this._parcelasTemp || this._parcelasTemp.length === 0) {
            GR.Toast.warning('Nenhuma parcela para remover');
            return;
        }
        this._parcelasTemp.pop();
        this._preencherTabelaParcelas(this._parcelasTemp);
        this._atualizarTotaisParcelas();
    },

    _atualizarTotaisParcelas: function() {
        var total = document.getElementById('total-parcelas');
        var totalValor = document.getElementById('total-parcelas-valor');
        if (!total || !totalValor) return;
        var parcelas = this._parcelasTemp || [];
        total.textContent = parcelas.length;
        var soma = parcelas.reduce(function(acc, p) { return acc + (parseFloat(p.valor) || 0); }, 0);
        totalValor.textContent = GR.Utils.formatarMoedaBR(soma);
    },

    _obterParcelasDoFormulario: function() {
        var parcelas = this._parcelasTemp || [];
        return parcelas.map(function(p) {
            var novaP = JSON.parse(JSON.stringify(p));
            if (novaP.vencimento && /^\d{4}-\d{2}-\d{2}$/.test(novaP.vencimento)) {
                var partes = novaP.vencimento.split('-');
                novaP.vencimento = partes[2] + '/' + partes[1] + '/' + partes[0];
            }
            if (novaP.dataPagamento && /^\d{4}-\d{2}-\d{2}$/.test(novaP.dataPagamento)) {
                var partes = novaP.dataPagamento.split('-');
                novaP.dataPagamento = partes[2] + '/' + partes[1] + '/' + partes[0];
            }
            return novaP;
        });
    },

    aplicarDadosPDF: function() {
        var preview = document.getElementById('pdf-preview');
        if (preview) preview.style.display = 'none';
        GR.Toast.success('Dados aplicados com sucesso!');
    },

    abrirMapeamentoVisual: function() {
        GR.Modal.open('modal-mapeamento-visual');
    },

    // ================================================================
    // SALVAR CONTRATO
    // ================================================================
    salvar: function() {
        var propriedade = document.getElementById('contrato-propriedade')?.value || '';
        var numero = document.getElementById('contrato-numero')?.value?.trim() || '';
        var data = document.getElementById('contrato-data')?.value || '';
        var valor = GR.Utils.parseMoedaBR(document.getElementById('contrato-valor')?.value || '0');
        var status = document.getElementById('contrato-status')?.value || 'Ativo';
        var taxaJuros = parseFloat(document.getElementById('contrato-taxa-juros')?.value) || 0;
        var saldoQuitacao = GR.Utils.parseMoedaBR(document.getElementById('contrato-saldo-quitacao')?.value || '0');
        var dataSaldo = document.getElementById('contrato-data-saldo')?.value || '';
        var modalidade = document.getElementById('contrato-modalidade')?.value?.trim() || '';
        var mutuario = document.getElementById('contrato-mutuario')?.value?.trim() || '';
        var instituicao = document.getElementById('contrato-instituicao')?.value?.trim() || '';

        if (!propriedade || !numero || !data || !valor) {
            GR.Toast.error('Campos obrigatórios: Propriedade, Número, Data e Valor!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var parcelasParaSalvar = this._obterParcelasDoFormulario();

        var dados = {
            propriedade: GR.Utils.escapeHtml(propriedade),
            numero: GR.Utils.escapeHtml(numero),
            data: data,
            valor: valor || 0,
            status: status,
            taxaJuros: taxaJuros,
            saldoQuitacao: saldoQuitacao || 0,
            dataSaldo: dataSaldo || '',
            modalidade: GR.Utils.escapeHtml(modalidade),
            mutuario: GR.Utils.escapeHtml(mutuario),
            instituicao: GR.Utils.escapeHtml(instituicao),
            parcelas: parcelasParaSalvar,
            dataCriacao: GR.Utils.now()
        };

        var pdfInput = document.getElementById('pdf-file-input');
        var file = null;
        if (pdfInput && pdfInput.files && pdfInput.files[0]) {
            file = pdfInput.files[0];
        }

        var self = this;
        var salvarEDepoisAtualizar = function(dados, uid) {
            self._salvarDados(dados, uid).then(function() {
                self._invalidateAndRender();
            });
        };

        if (file) {
            var isLocal = window.location.protocol === 'file:';
            if (isLocal) {
                GR.Toast.warning('⚠️ Ambiente local. PDF não será salvo.');
                salvarEDepoisAtualizar(dados, uid);
            } else {
                var filePath = 'contratos/' + uid + '/' + Date.now() + '_' + file.name;
                var uploadTask = storage.ref(filePath).put(file);
                GR.Toast.info('📤 Fazendo upload do PDF...');
                uploadTask.then(function(snapshot) {
                    return snapshot.ref.getDownloadURL();
                }).then(function(downloadURL) {
                    dados.arquivoUrl = downloadURL;
                    dados.arquivoNome = file.name;
                    dados.arquivoPath = filePath;
                    salvarEDepoisAtualizar(dados, uid);
                }).catch(function(err) {
                    GR.Toast.error('Erro no upload: ' + err.message);
                    salvarEDepoisAtualizar(dados, uid);
                });
            }
        } else {
            salvarEDepoisAtualizar(dados, uid);
        }
    },

    _salvarDados: function(dados, uid) {
        var ref = db.collection('users').doc(uid).collection('contratos');
        var editId = GR.State.ui.contratoEditando;

        var self = GR.Modules.Contratos;
        return new Promise(function(resolve, reject) {
            if (editId) {
                ref.doc(editId).update(dados).then(function() {
                    self._atualizarLocal('update', editId, dados);
                    GR.Modal.close('modal-contrato');
                    GR.Toast.success('Operação atualizada!');
                    GR.State.adicionarHistorico('editou contrato', 'Crédito', 'Contrato: ' + dados.numero);
                    self._invalidateAndRender();
                    GR.State.verificarVencimentos();
                    resolve();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao atualizar: ' + err.message);
                    reject(err);
                });
            } else {
                ref.add(dados).then(function(docRef) {
                    self._atualizarLocal('add', docRef.id, dados);
                    GR.Modal.close('modal-contrato');
                    GR.Toast.success('Operação salva!');
                    GR.State.adicionarHistorico('criou contrato', 'Crédito', 'Contrato: ' + dados.numero);
                    GR.Vencimentos.idContratoAtivo = docRef.id;
                    self._invalidateAndRender();
                    GR.State.verificarVencimentos();
                    resolve();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao salvar: ' + err.message);
                    reject(err);
                });
            }
        });
    },

    editar: function(id) {
        this.abrirModal(id);
    },

    excluir: function(id) {
        if (!confirm('Excluir esta operação?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        var item = GR.State.data.contratos.find(function(c) { return c.id === id; });
        var self = this;

        // Otimista: remove imediatamente da UI
        self._atualizarLocal('delete', id);
        self._invalidateAndRender();

        db.collection('users').doc(uid).collection('contratos').doc(id).delete()
            .then(function() {
                if (item && item.arquivoPath) {
                    storage.ref(item.arquivoPath).delete().catch(function(err) {
                        console.warn('Erro ao excluir arquivo:', err);
                    });
                }
                GR.Toast.success('Excluído!');
                GR.State.adicionarHistorico('excluiu contrato', 'Crédito', 'Contrato ID: ' + id);
            }).catch(function(err) {
                // Rollback se falhou
                if (item) { GR.State.data.contratos.push(item); }
                self._invalidateAndRender();
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    visualizarPDF: function(id) {
        var item = GR.State.data.contratos.find(function(c) { return c.id === id; });
        if (!item || !item.arquivoUrl) {
            GR.Toast.error('PDF não encontrado!');
            return;
        }
        window.open(item.arquivoUrl, '_blank');
    },

    // ================================================================
    // 🆕 RENDER - CARD CONTRATOS NO PAINEL (COM VISUALIZAÇÃO POR ANO E FILTRO)
    // ================================================================
    renderCardContratos: function() {
        console.log('📊 Renderizando card de contratos para o painel...');
        
        var container = document.getElementById('card-contratos');
        if (!container) {
            console.warn('⚠️ Elemento card-contratos não encontrado');
            return;
        }
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.contratos || [], 'propriedade');
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // ============================================================
        // AGRUPA PARCELAS POR ANO
        // ============================================================
        var parcelasPorAno = {};
        
        items.forEach(function(c) {
            if (c.status !== 'Ativo') return;
            
            if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.status !== 'Pendente') return;
                    if (!p.vencimento) return;
                    
                    var dataVencimento = p.vencimento;
                    if (dataVencimento && dataVencimento.includes('/')) {
                        var partes = dataVencimento.split('/');
                        if (partes.length === 3) {
                            dataVencimento = partes[2] + '-' + partes[1] + '-' + partes[0];
                        }
                    }
                    
                    var venc = new Date(dataVencimento);
                    if (isNaN(venc.getTime())) return;
                    
                    var ano = venc.getFullYear();
                    var hojeAno = hoje.getFullYear();
                    
                    // Só mostra parcelas do ano atual ou futuros
                    if (ano < hojeAno) return;
                    
                    if (!parcelasPorAno[ano]) {
                        parcelasPorAno[ano] = [];
                    }
                    
                    parcelasPorAno[ano].push({
                        contrato: c.numero || 'N/A',
                        propriedade: c.propriedade || 'N/A',
                        parcela: p.numero || 0,
                        vencimento: p.vencimento,
                        valor: parseFloat(p.valor) || 0,
                        contratoId: c.id,
                        ano: ano
                    });
                });
            }
        });
        
        // ============================================================
        // ORDENA ANOS CRESCENTE
        // ============================================================
        var anos = Object.keys(parcelasPorAno).sort();
        
        if (anos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="icon">✅</span>
                    <div class="message">Nenhum vencimento futuro</div>
                    <div style="font-size:11px;color:var(--text-light);">Todos os contratos estão em dia</div>
                </div>
            `;
            return;
        }
        
        // ============================================================
        // MONTA O HTML
        // ============================================================
        var html = '<div class="contratos-anos-container">';
        
        anos.forEach(function(ano) {
            var parcelas = parcelasPorAno[ano];
            var totalAno = 0;
            parcelas.forEach(function(p) {
                totalAno += p.valor;
            });
            
            html += `
                <div class="contrato-ano-card">
                    <div class="contrato-ano-header" onclick="GR.Modules.Contratos._toggleAno(this)">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span class="ano-label">📅 ${ano}</span>
                            <span class="ano-count">${parcelas.length} parcela(s)</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span class="ano-total">${GR.Utils.formatarMoedaBR(totalAno)}</span>
                            <span class="arrow">▼</span>
                        </div>
                    </div>
                    <div class="contrato-ano-body">
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Parcela</th>
                                        <th>Vencimento</th>
                                        <th style="text-align:right;">Valor</th>
                                        <th>Contrato</th>
                                        <th style="text-align:center;">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${parcelas.map(function(p) {
                                        return `
                                        <tr>
                                            <td>${p.parcela}</td>
                                            <td>${p.vencimento}</td>
                                            <td style="text-align:right;font-weight:600;color:var(--danger);">${GR.Utils.formatarMoedaBR(p.valor)}</td>
                                            <td>${p.contrato}</td>
                                            <td style="text-align:center;">
                                                <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos.editar('${p.contratoId}')" title="Editar contrato">✏️</button>
                                                <button class="btn btn-info btn-sm" onclick="GR.Vencimentos.verParcelas('${p.contratoId}')" title="Ver parcelas">📅</button>
                                            </td>
                                        </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },

    // ================================================================
    // 🆕 TOGGLE PARA EXPANDIR/RECOLHER ANO
    // ================================================================
    _toggleAno: function(element) {
        var body = element.nextElementSibling;
        var arrow = element.querySelector('.arrow');
        
        if (body.style.display === 'none') {
            body.style.display = 'block';
            arrow.textContent = '▼';
            arrow.style.transform = 'rotate(0deg)';
        } else {
            body.style.display = 'none';
            arrow.textContent = '▶';
            arrow.style.transform = 'rotate(0deg)';
        }
    },

    // ================================================================
    // 🆕 ABRIR MODAL DE CONTRATOS COM GRÁFICO E PARCELAS POR ANO (COM FILTRO)
    // ================================================================
    abrirModalContratosDashboard: function() {
        console.log('📊 Abrindo modal de contratos com gráfico...');
        
        // ============================================================
        // VERIFICA SE O PLUGIN DATALABELS ESTÁ CARREGADO
        // ============================================================
        if (typeof ChartDataLabels === 'undefined') {
            console.log('📦 Carregando ChartDataLabels...');
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js';
            document.head.appendChild(script);
            script.onload = function() {
                console.log('✅ ChartDataLabels carregado!');
                GR.Modules.Contratos.abrirModalContratosDashboard();
            };
            return;
        }
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.contratos || [], 'propriedade');
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // ============================================================
        // AGRUPA PARCELAS POR ANO
        // ============================================================
        var parcelasPorAno = {};
        var totalContratosAtivos = 0;
        var totalParcelasPendentes = 0;
        
        items.forEach(function(c) {
            if (c.status === 'Ativo') totalContratosAtivos++;
            
            if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.status === 'Pendente') {
                        totalParcelasPendentes++;
                        
                        if (!p.vencimento) return;
                        
                        var dataVencimento = p.vencimento;
                        if (dataVencimento && dataVencimento.includes('/')) {
                            var partes = dataVencimento.split('/');
                            if (partes.length === 3) {
                                dataVencimento = partes[2] + '-' + partes[1] + '-' + partes[0];
                            }
                        }
                        
                        var venc = new Date(dataVencimento);
                        if (isNaN(venc.getTime())) return;
                        
                        var ano = venc.getFullYear();
                        var hojeAno = hoje.getFullYear();
                        
                        if (ano < hojeAno) return;
                        
                        if (!parcelasPorAno[ano]) {
                            parcelasPorAno[ano] = [];
                        }
                        
                        parcelasPorAno[ano].push({
                            contrato: c.numero || 'N/A',
                            propriedade: c.propriedade || 'N/A',
                            parcela: p.numero || 0,
                            vencimento: p.vencimento,
                            valor: parseFloat(p.valor) || 0,
                            contratoId: c.id,
                            ano: ano
                        });
                    }
                });
            }
        });
        
        var anos = Object.keys(parcelasPorAno).sort();
        
        if (anos.length === 0) {
            GR.Toast.info('✅ Nenhum vencimento futuro encontrado!');
            return;
        }
        
        // ============================================================
        // PREPARA DADOS PARA O GRÁFICO
        // ============================================================
        var labels = [];
        var valores = [];
        var cores = ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0', '#00BCD4', '#FF5722'];
        
        anos.forEach(function(ano, index) {
            var parcelas = parcelasPorAno[ano];
            var total = 0;
            parcelas.forEach(function(p) {
                total += p.valor;
            });
            labels.push(ano);
            valores.push(total);
        });
        
        var modalId = 'modal-contratos-dashboard';
        var modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // ============================================================
        // MONTA O MODAL
        // ============================================================
        var modalHTML = `
        <div id="${modalId}" class="modal" role="dialog" aria-modal="true">
            <div class="modal-content" style="max-width:900px;max-height:90vh;">
                <div class="modal-header">
                    <h2 class="modal-title">📊 Contratos - Vencimentos por Ano</h2>
                    <button class="close-btn" onclick="GR.Modal.close('${modalId}')">×</button>
                </div>
                <div style="padding:10px 0;">
                    <!-- Resumo -->
                    <div style="display:flex;justify-content:space-around;padding:8px;background:var(--bg);border-radius:6px;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
                        <div style="text-align:center;">
                            <div style="font-size:20px;font-weight:700;color:var(--primary-dark);">${totalContratosAtivos}</div>
                            <div style="font-size:11px;color:var(--text-light);">Contratos Ativos</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:20px;font-weight:700;color:var(--danger);">${totalParcelasPendentes}</div>
                            <div style="font-size:11px;color:var(--text-light);">Parcelas Pendentes</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:20px;font-weight:700;color:var(--warning);">${anos.length}</div>
                            <div style="font-size:11px;color:var(--text-light);">Anos com Vencimento</div>
                        </div>
                    </div>
                    
                    <!-- Botões de gráfico -->
                    <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos._renderGrafico('bar')" title="Visualizar em gráfico de colunas">📊 Colunas</button>
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Contratos._renderGrafico('line')" title="Visualizar em gráfico de linhas">📈 Linhas</button>
                        <button class="btn btn-success btn-sm" onclick="GR.Modules.Contratos._renderGrafico('pie')" title="Visualizar em gráfico de pizza">🍕 Pizza</button>
                        <span style="font-size:10px;color:var(--text-light);align-self:center;">Clique para alternar o tipo de gráfico</span>
                    </div>
                    
                    <!-- Container do gráfico -->
                    <div style="background:var(--surface);border-radius:6px;padding:10px;border:1px solid var(--border);margin-bottom:10px;">
                        <canvas id="grafico-contratos" style="max-height:250px;width:100%;"></canvas>
                    </div>
                    
                    <!-- Lista de anos com parcelas -->
                    <div style="max-height:300px;overflow-y:auto;">
                        ${anos.map(function(ano) {
                            var parcelas = parcelasPorAno[ano];
                            var totalAno = 0;
                            parcelas.forEach(function(p) {
                                totalAno += p.valor;
                            });
                            
                            return `
                            <div class="contrato-ano-card">
                                <div class="contrato-ano-header" onclick="GR.Modules.Contratos._toggleAno(this)">
                                    <div style="display:flex;align-items:center;gap:8px;">
                                        <span class="ano-label">📅 ${ano}</span>
                                        <span class="ano-count">${parcelas.length} parcela(s)</span>
                                    </div>
                                    <div style="display:flex;align-items:center;gap:8px;">
                                        <span class="ano-total">${GR.Utils.formatarMoedaBR(totalAno)}</span>
                                        <span class="arrow">▼</span>
                                    </div>
                                </div>
                                <div class="contrato-ano-body">
                                    <div class="table-responsive">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Parcela</th>
                                                    <th>Vencimento</th>
                                                    <th style="text-align:right;">Valor</th>
                                                    <th>Contrato</th>
                                                    <th style="text-align:center;">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${parcelas.map(function(p) {
                                                    return `
                                                    <tr>
                                                        <td>${p.parcela}</td>
                                                        <td>${p.vencimento}</td>
                                                        <td style="text-align:right;font-weight:600;color:var(--danger);">${GR.Utils.formatarMoedaBR(p.valor)}</td>
                                                        <td>${p.contrato}</td>
                                                        <td style="text-align:center;">
                                                            <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos.editar('${p.contratoId}')" title="Editar contrato">✏️</button>
                                                            <button class="btn btn-info btn-sm" onclick="GR.Vencimentos.verParcelas('${p.contratoId}')" title="Ver parcelas">📅</button>
                                                        </td>
                                                    </tr>
                                                    `;
                                                }).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="modal-footer" style="display:flex;justify-content:flex-end;padding-top:10px;border-top:1px solid var(--border);">
                    <button class="btn btn-secondary" onclick="GR.Modal.close('${modalId}')">Fechar</button>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        GR.Modal.open(modalId);
        
        // ============================================================
        // RENDERIZA O GRÁFICO APÓS O MODAL ABRIR
        // ============================================================
        var self = this;
        setTimeout(function() {
            self._renderGrafico('bar', labels, valores, cores);
        }, 300);
        
        // Armazena os dados para usar no gráfico
        this._graficoLabels = labels;
        this._graficoValores = valores;
        this._graficoCores = cores;
    },

    // ================================================================
    // 🆕 RENDERIZAR GRÁFICO - COM VALORES VISÍVEIS
    // ================================================================
    _renderGrafico: function(tipo, labels, valores, cores) {
        console.log('📊 Renderizando gráfico tipo:', tipo);
        
        // Se não passou os dados, pega dos armazenados
        if (!labels) {
            labels = this._graficoLabels || [];
            valores = this._graficoValores || [];
            cores = this._graficoCores || ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0', '#00BCD4', '#FF5722'];
        }
        
        var canvas = document.getElementById('grafico-contratos');
        if (!canvas) {
            console.warn('⚠️ Canvas do gráfico não encontrado');
            return;
        }
        
        // Se já existe um gráfico, destrói
        if (this._meuGrafico) {
            this._meuGrafico.destroy();
        }
        
        // ============================================================
        // VERIFICA SE O PLUGIN DATALABELS ESTÁ DISPONÍVEL
        // ============================================================
        if (typeof ChartDataLabels === 'undefined') {
            console.warn('⚠️ ChartDataLabels não disponível! Carregando...');
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js';
            document.head.appendChild(script);
            script.onload = function() {
                console.log('✅ ChartDataLabels carregado!');
                GR.Modules.Contratos._renderGrafico(tipo, labels, valores, cores);
            };
            return;
        }
        
        // ============================================================
        // CONFIGURAÇÃO DO GRÁFICO COM DATALABELS
        // ============================================================
        var config = {
            type: tipo,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor das Parcelas',
                    data: valores,
                    backgroundColor: cores.slice(0, labels.length),
                    borderColor: cores.slice(0, labels.length),
                    borderWidth: 2,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: tipo === 'pie' ? true : false,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Total: ' + GR.Utils.formatarMoedaBR(context.parsed.y || context.parsed);
                            }
                        }
                    },
                    // ============================================================
                    // 🆕 DATALABELS - MOSTRA VALORES EM CIMA DE CADA ELEMENTO
                    // ============================================================
                    datalabels: {
                        display: function(context) {
                            return context.dataset.data.length > 0;
                        },
                        color: function(context) {
                            // Para pizza, usa branco para contraste
                            if (context.chart.config.type === 'pie') {
                                return '#ffffff';
                            }
                            return '#1e293b';
                        },
                        font: {
                            weight: 'bold',
                            size: function(context) {
                                // Tamanho maior para pizza
                                if (context.chart.config.type === 'pie') {
                                    return 14;
                                }
                                return 12;
                            }
                        },
                        formatter: function(value, context) {
                            // Formata o valor como moeda
                            if (context.chart.config.type === 'pie') {
                                var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                                var percentage = ((value / total) * 100).toFixed(1);
                                return 'R$ ' + value.toLocaleString('pt-BR', { 
                                    minimumFractionDigits: 0, 
                                    maximumFractionDigits: 0 
                                }) + '\n' + percentage + '%';
                            }
                            return 'R$ ' + value.toLocaleString('pt-BR', { 
                                minimumFractionDigits: 0, 
                                maximumFractionDigits: 0 
                            });
                        },
                        anchor: function(context) {
                            if (context.chart.config.type === 'pie') {
                                return 'center';
                            }
                            return 'end';
                        },
                        align: function(context) {
                            if (context.chart.config.type === 'pie') {
                                return 'center';
                            }
                            return 'top';
                        },
                        offset: 2
                    }
                },
                scales: tipo === 'pie' ? undefined : {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        };
        
        // Cria o gráfico
        this._meuGrafico = new Chart(canvas, config);
        console.log('✅ Gráfico renderizado com valores visíveis!');
    },

    // ================================================================
    // 🆕 ABRIR GRÁFICO EM TELA CHEIA NA ABA CRÉDITO (COM VALORES FIXOS E FILTRO)
    // ================================================================
    abrirGraficoTelaCheia: function() {
        console.log('📊 Abrindo gráfico em tela cheia na aba Crédito...');
        
        // ============================================================
        // VERIFICA SE O PLUGIN DATALABELS ESTÁ CARREGADO
        // ============================================================
        if (typeof ChartDataLabels === 'undefined') {
            console.log('📦 Carregando ChartDataLabels...');
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js';
            document.head.appendChild(script);
            script.onload = function() {
                console.log('✅ ChartDataLabels carregado!');
                GR.Modules.Contratos.abrirGraficoTelaCheia();
            };
            return;
        }
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.contratos || [], 'propriedade');
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // ============================================================
        // AGRUPA PARCELAS POR ANO
        // ============================================================
        var parcelasPorAno = {};
        var totalContratosAtivos = 0;
        var totalParcelasPendentes = 0;
        
        items.forEach(function(c) {
            if (c.status === 'Ativo') totalContratosAtivos++;
            
            if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.status === 'Pendente') {
                        totalParcelasPendentes++;
                        
                        if (!p.vencimento) return;
                        
                        var dataVencimento = p.vencimento;
                        if (dataVencimento && dataVencimento.includes('/')) {
                            var partes = dataVencimento.split('/');
                            if (partes.length === 3) {
                                dataVencimento = partes[2] + '-' + partes[1] + '-' + partes[0];
                            }
                        }
                        
                        var venc = new Date(dataVencimento);
                        if (isNaN(venc.getTime())) return;
                        
                        var ano = venc.getFullYear();
                        var hojeAno = hoje.getFullYear();
                        
                        if (ano < hojeAno) return;
                        
                        if (!parcelasPorAno[ano]) {
                            parcelasPorAno[ano] = [];
                        }
                        
                        parcelasPorAno[ano].push({
                            contrato: c.numero || 'N/A',
                            propriedade: c.propriedade || 'N/A',
                            parcela: p.numero || 0,
                            vencimento: p.vencimento,
                            valor: parseFloat(p.valor) || 0,
                            contratoId: c.id,
                            ano: ano
                        });
                    }
                });
            }
        });
        
        var anos = Object.keys(parcelasPorAno).sort();
        
        // ============================================================
        // PREPARA DADOS PARA O GRÁFICO
        // ============================================================
        var labels = [];
        var valores = [];
        var cores = ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0', '#00BCD4', '#FF5722'];
        
        anos.forEach(function(ano, index) {
            var parcelas = parcelasPorAno[ano];
            var total = 0;
            parcelas.forEach(function(p) {
                total += p.valor;
            });
            labels.push(ano);
            valores.push(total);
        });
        
        var container = document.getElementById('sectionContainer');
        if (!container) return;
        
        if (anos.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title"><span class="emoji">📊</span> Gráfico de Contratos</div>
                        <button class="btn btn-secondary" onclick="GR.UI.mudarView('credito')" title="Voltar para Crédito">⬅️ Voltar</button>
                    </div>
                    <div class="empty-state">
                        <span class="icon">✅</span>
                        <div class="message">Nenhum vencimento futuro encontrado!</div>
                        <div style="font-size:11px;color:var(--text-light);margin-top:8px;">Todos os contratos estão em dia</div>
                    </div>
                </div>
            `;
            return;
        }
        
        // ============================================================
        // MONTA O HTML DA TELA CHEIA
        // ============================================================
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">📊</span> Contratos - Vencimentos por Ano</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn btn-secondary" onclick="GR.UI.mudarView('credito')" title="Voltar para Crédito">⬅️ Voltar</button>
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos._renderGraficoTelaCheia('bar')" title="Visualizar em gráfico de colunas">📊 Colunas</button>
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Contratos._renderGraficoTelaCheia('line')" title="Visualizar em gráfico de linhas">📈 Linhas</button>
                        <button class="btn btn-success btn-sm" onclick="GR.Modules.Contratos._renderGraficoTelaCheia('pie')" title="Visualizar em gráfico de pizza">🍕 Pizza</button>
                    </div>
                </div>
                
                <!-- Resumo -->
                <div style="display:flex;justify-content:space-around;padding:12px;background:var(--bg);border-radius:8px;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                    <div style="text-align:center;">
                        <div style="font-size:24px;font-weight:700;color:var(--primary-dark);">${totalContratosAtivos}</div>
                        <div style="font-size:12px;color:var(--text-light);">📋 Contratos Ativos</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:24px;font-weight:700;color:var(--danger);">${totalParcelasPendentes}</div>
                        <div style="font-size:12px;color:var(--text-light);">📌 Parcelas Pendentes</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:24px;font-weight:700;color:var(--warning);">${anos.length}</div>
                        <div style="font-size:12px;color:var(--text-light);">📅 Anos com Vencimento</div>
                    </div>
                </div>
                
                <!-- Container do gráfico -->
                <div style="background:var(--surface);border-radius:8px;padding:16px;border:1px solid var(--border);margin-bottom:12px;min-height:300px;">
                    <canvas id="grafico-contratos-tela-cheia" style="max-height:400px;width:100%;"></canvas>
                </div>
                
                <!-- Lista de anos com parcelas -->
                <div style="max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;">
                    ${anos.map(function(ano) {
                        var parcelas = parcelasPorAno[ano];
                        var totalAno = 0;
                        parcelas.forEach(function(p) {
                            totalAno += p.valor;
                        });
                        
                        return `
                        <div class="contrato-ano-card">
                            <div class="contrato-ano-header" onclick="GR.Modules.Contratos._toggleAno(this)">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <span class="ano-label">📅 ${ano}</span>
                                    <span class="ano-count">${parcelas.length} parcela(s)</span>
                                </div>
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <span class="ano-total">${GR.Utils.formatarMoedaBR(totalAno)}</span>
                                    <span class="arrow">▼</span>
                                </div>
                            </div>
                            <div class="contrato-ano-body">
                                <div class="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Parcela</th>
                                                <th>Vencimento</th>
                                                <th style="text-align:right;">Valor</th>
                                                <th>Contrato</th>
                                                <th style="text-align:center;">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${parcelas.map(function(p) {
                                                return `
                                                <tr>
                                                    <td>${p.parcela}</td>
                                                    <td>${p.vencimento}</td>
                                                    <td style="text-align:right;font-weight:600;color:var(--danger);">${GR.Utils.formatarMoedaBR(p.valor)}</td>
                                                    <td>${p.contrato}</td>
                                                    <td style="text-align:center;">
                                                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos.editar('${p.contratoId}')" title="Editar contrato">✏️</button>
                                                        <button class="btn btn-info btn-sm" onclick="GR.Vencimentos.verParcelas('${p.contratoId}')" title="Ver parcelas">📅</button>
                                                    </td>
                                                </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        // ============================================================
        // RENDERIZA O GRÁFICO
        // ============================================================
        this._graficoLabelsTelaCheia = labels;
        this._graficoValoresTelaCheia = valores;
        this._graficoCoresTelaCheia = cores;
        this._tipoGraficoTelaCheia = 'bar';
        
        setTimeout(function() {
            GR.Modules.Contratos._renderGraficoTelaCheia('bar');
        }, 300);
    },
    
    // ================================================================
    // 🆕 RENDERIZAR GRÁFICO EM TELA CHEIA COM VALORES FIXOS VISÍVEIS
    // ================================================================
    _renderGraficoTelaCheia: function(tipo) {
        console.log('📊 Renderizando gráfico em tela cheia tipo:', tipo);
        
        if (tipo) {
            this._tipoGraficoTelaCheia = tipo;
        }
        
        var labels = this._graficoLabelsTelaCheia || [];
        var valores = this._graficoValoresTelaCheia || [];
        var cores = this._graficoCoresTelaCheia || ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0', '#00BCD4', '#FF5722'];
        var tipoAtual = this._tipoGraficoTelaCheia || 'bar';
        
        var canvas = document.getElementById('grafico-contratos-tela-cheia');
        if (!canvas) {
            console.warn('⚠️ Canvas do gráfico em tela cheia não encontrado');
            return;
        }
        
        // Se já existe um gráfico, destrói
        if (this._meuGraficoTelaCheia) {
            this._meuGraficoTelaCheia.destroy();
        }
        
        // ============================================================
        // 🆕 GARANTE QUE O PLUGIN DATALABELS ESTÁ REGISTRADO
        // ============================================================
        function renderizarComPlugin() {
            // ============================================================
            // CONFIGURAÇÃO DO GRÁFICO COM DATALABELS (VALORES FIXOS)
            // ============================================================
            var config = {
                type: tipoAtual,
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Valor das Parcelas',
                        data: valores,
                        backgroundColor: cores.slice(0, labels.length),
                        borderColor: cores.slice(0, labels.length),
                        borderWidth: 2,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: tipoAtual === 'pie' ? true : false,
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Total: ' + GR.Utils.formatarMoedaBR(context.parsed.y || context.parsed);
                                }
                            }
                        },
                        // ============================================================
                        // 🆕 DATALABELS - MOSTRA VALORES FIXOS EM CIMA DE CADA ELEMENTO
                        // ============================================================
                        datalabels: {
                            display: function(context) {
                                // Mostra apenas se houver dados válidos
                                return context.dataset.data.length > 0 && context.dataset.data[context.dataIndex] > 0;
                            },
                            color: function(context) {
                                // Cor diferente para cada tipo de gráfico
                                if (context.chart.config.type === 'pie') {
                                    return '#ffffff';
                                }
                                return '#1e293b';
                            },
                            font: {
                                weight: 'bold',
                                size: function(context) {
                                    if (context.chart.config.type === 'pie') {
                                        return 14;
                                    }
                                    // Ajusta o tamanho baseado no número de dados
                                    var count = context.dataset.data.length;
                                    if (count <= 3) return 16;
                                    if (count <= 6) return 13;
                                    return 11;
                                }
                            },
                            formatter: function(value, context) {
                                // Formata como moeda
                                if (context.chart.config.type === 'pie') {
                                    var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                                    var percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return 'R$ ' + value.toLocaleString('pt-BR', { 
                                        minimumFractionDigits: 0, 
                                        maximumFractionDigits: 0 
                                    }) + '\n' + percentage + '%';
                                }
                                return 'R$ ' + value.toLocaleString('pt-BR', { 
                                    minimumFractionDigits: 0, 
                                    maximumFractionDigits: 0 
                                });
                            },
                            anchor: function(context) {
                                if (context.chart.config.type === 'pie') {
                                    return 'center';
                                }
                                return 'end';
                            },
                            align: function(context) {
                                if (context.chart.config.type === 'pie') {
                                    return 'center';
                                }
                                return 'top';
                            },
                            offset: function(context) {
                                if (context.chart.config.type === 'pie') {
                                    return 0;
                                }
                                // Ajusta o offset baseado no valor
                                var value = context.dataset.data[context.dataIndex];
                                if (value > 100000) return 8;
                                if (value > 50000) return 6;
                                return 4;
                            },
                            // Fundo branco para melhor legibilidade
                            backgroundColor: function(context) {
                                if (context.chart.config.type === 'pie') {
                                    return 'rgba(0,0,0,0.3)';
                                }
                                return 'rgba(255,255,255,0.7)';
                            },
                            borderRadius: 4,
                            padding: {
                                top: 2,
                                bottom: 2,
                                left: 4,
                                right: 4
                            }
                        }
                    },
                    scales: tipoAtual === 'pie' ? undefined : {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + value.toLocaleString('pt-BR');
                                }
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            };
            
            // Cria o gráfico
            try {
                GR.Modules.Contratos._meuGraficoTelaCheia = new Chart(canvas, config);
                console.log('✅ Gráfico em tela cheia renderizado com valores fixos!');
                console.log('📊 Labels:', labels);
                console.log('📊 Valores:', valores);
            } catch (e) {
                console.error('❌ Erro ao criar gráfico:', e);
                GR.Toast.error('Erro ao renderizar gráfico: ' + e.message);
            }
        }
        
        // ============================================================
        // VERIFICA SE O PLUGIN DATALABELS ESTÁ DISPONÍVEL
        // ============================================================
        if (typeof ChartDataLabels !== 'undefined') {
            try {
                Chart.register(ChartDataLabels);
                console.log('✅ ChartDataLabels registrado no Chart.js');
                renderizarComPlugin();
            } catch (e) {
                console.warn('⚠️ Erro ao registrar ChartDataLabels:', e);
                renderizarComPlugin();
            }
        } else {
            console.warn('⚠️ ChartDataLabels não disponível! Tentando carregar...');
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js';
            script.onload = function() {
                console.log('✅ ChartDataLabels carregado!');
                try {
                    Chart.register(ChartDataLabels);
                    console.log('✅ ChartDataLabels registrado!');
                } catch (e) {
                    console.warn('⚠️ Erro ao registrar ChartDataLabels:', e);
                }
                renderizarComPlugin();
            };
            script.onerror = function() {
                console.warn('⚠️ Falha ao carregar ChartDataLabels. Tentando sem plugin...');
                renderizarComPlugin();
            };
            document.head.appendChild(script);
        }
    }

};  // ← FECHA O OBJETO AQUI!

// ================================================================
// 🆕 CARREGA O PLUGIN DATALABELS AUTOMATICAMENTE
// ================================================================
carregarChartDataLabels(function() {
    console.log('✅ Plugin ChartDataLabels pronto para uso!');
});

console.log('✅ Módulo Contratos carregado com melhorias!');
console.log('📌 Melhorias ativas:');
console.log('   - Captura de saldo entre aspas ("62.423,64")');
console.log('   - Captura de saldo no formato % a.a. 62.423,64 0 Conta Garantia');
console.log('   - Card Saldo Devedor usando saldoQuitacao do PDF');
console.log('   - Card Parcelas Pendentes com quantidade + valor total');
console.log('   - Clique nos cards de vencimento abre detalhes das parcelas');
console.log('   - Notificação de vencimentos ao abrir o app (30 dias)');
console.log('   - Tooltips em todos os botões e elementos interativos');
console.log('   - 🆕 Card de Contratos no Dashboard com visualização por ano');
console.log('   - 🆕 Expandir/recolher anos no card de contratos');
console.log('   - 🆕 Modal com gráfico (colunas/linhas/pizza) e parcelas por ano');
console.log('   - 🆕 Gráfico em tela cheia na aba Crédito');
console.log('   - 🆕 Valores visíveis em cima das colunas, pontos e fatias da pizza');
console.log('   - 🆕 Carregamento automático do plugin ChartDataLabels com fallback');
console.log('   - 🆕 Plugin registrado antes de renderizar o gráfico');
console.log('   - 🏠 Filtro de dados por propriedade (perfil)');
console.log('   - 🏠 render() filtrando contratos por propriedade');
console.log('   - 🏠 verificarVencimentosProximos() filtrando por propriedade');
console.log('   - 🏠 renderCardContratos() filtrando por propriedade');
console.log('   - 🏠 abrirModalContratosDashboard() filtrando por propriedade');
console.log('   - 🏠 abrirGraficoTelaCheia() filtrando por propriedade');
