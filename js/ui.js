// ================================================================
// UI - INTERFACE PRINCIPAL - COMPLETO COM MELHORIAS E CORREÇÕES
// ================================================================
// Versão: 3.1 - CORRIGIDO com verificação segura de perfis
// ================================================================

GR.UI = {
    _acoesPadrao: [
        'Plantio de café', 'Plantio de soja', 'Plantio de milho', 'Plantio de pimenta do reino',
        'Adubação', 'Adubação de cobertura', 'Calagem', 'Aplicação de defensivos',
        'Aplicação de herbicidas', 'Aplicação de fungicidas', 'Irrigação', 'Poda',
        'Colheita de café', 'Colheita de pimenta', 'Colheita de grãos',
        'Venda de café', 'Venda de pimenta do reino', 'Venda de soja', 'Venda de milho',
        'Venda de animais', 'Compra de insumos', 'Manutenção de máquinas', 'Reparo de cercas',
        'Preparo do solo', 'Aração', 'Gradagem', 'Semeadura', 'Fertirrigação',
        'Controle de pragas', 'Controle de plantas daninhas', 'Aplicação de biofertilizantes'
    ],

    // ================================================================
    // CACHE PARA ELEMENTOS DOM
    // ================================================================
    _domCache: {},

    _getElement: function(id) {
        if (!this._domCache[id]) {
            this._domCache[id] = document.getElementById(id);
        }
        return this._domCache[id];
    },

    _clearCache: function() {
        this._domCache = {};
    },

    // ================================================================
    // THROTTLE E DEBOUNCE
    // ================================================================
    _throttle: function(fn, delay = 300) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return fn.apply(this, args);
            }
        };
    },

    _debounce: function(fn, delay = 500) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    },

    ajustarFonte: function(delta) {
        var root = document.documentElement;
        var current = parseFloat(root.style.getPropertyValue('--font-size-base')) || 14;
        var novo = Math.max(10, Math.min(22, current + delta));
        root.style.setProperty('--font-size-base', novo + 'px');
        var label = this._getElement('fontSizeLabel');
        if (label) label.textContent = Math.round((novo / 14) * 100) + '%';
        
        var label2 = document.getElementById('fontSizeLabel2');
        if (label2) label2.textContent = Math.round((novo / 14) * 100) + '%';
        
        localStorage.setItem('gr_font_size', novo);
        GR.Toast.info(`🔤 Fonte ajustada para ${Math.round((novo / 14) * 100)}%`);
    },

    resetarFonte: function() {
        var root = document.documentElement;
        root.style.setProperty('--font-size-base', '14px');
        var label = this._getElement('fontSizeLabel');
        if (label) label.textContent = '100%';
        
        var label2 = document.getElementById('fontSizeLabel2');
        if (label2) label2.textContent = '100%';
        
        localStorage.setItem('gr_font_size', 14);
        GR.Toast.info('🔤 Fonte resetada para 100%');
    },

    toggleModoEscuro: function() {
        var theme = document.documentElement.getAttribute('data-theme');
        var themes = ['claro', 'escuro', 'azul', 'verde', 'roxo', 'vermelho', 'laranja'];
        var idx = themes.indexOf(theme) + 1;
        if (idx >= themes.length) idx = 0;
        var novo = themes[idx];
        document.documentElement.setAttribute('data-theme', novo);
        localStorage.setItem('gr_theme', novo);
        var sel = this._getElement('themeSelector');
        if (sel) sel.value = novo;
        
        var nomesTemas = {
            'claro': '☀️ Claro',
            'escuro': '🌙 Escuro',
            'azul': '🔵 Azul',
            'verde': '🟢 Verde',
            'roxo': '🟣 Roxo',
            'vermelho': '🔴 Vermelho',
            'laranja': '🟠 Laranja'
        };
        GR.Toast.info(`🎨 Tema alterado para: ${nomesTemas[novo] || novo}`);
    },

    mudarView: function(view) {
        // 🔥 VERIFICA PERMISSÃO DE ACESSO (COM VERIFICAÇÃO SEGURA)
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeVer === 'function' && view !== 'dashboard') {
            if (!GR.Modules.Perfis.podeVer(view)) {
                GR.Toast.error('❌ Você não tem permissão para acessar este módulo!');
                return;
            }
        }
        
        if (GR.State.ui.viewAtual === view) {
            this.refreshCurrentView();
            return;
        }
        
        GR.State.ui.viewAtual = view;
        var titles = {
            'dashboard': '📊 Dashboard',
            'acoes': '📋 Ações',
            'orcamentos': '💰 Orçamentos',
            'credito': '💳 Crédito',
            'insumos': '🧪 Insumos',
            'pecuaria': '🐄 Pecuária',
            'funcionarios': '👨‍🌾 Funcionários',
            'parceiros': '👥 Parceiros',
            'contabilidade': '🧾 Contabilidade',
            'documentos': '📁 Documentos',
            'analises': '🧪 Análises',
            'viveiro': '🌱 Viveiro',
            'relatorios': '📊 Relatórios',
            'configuracoes': '⚙️ Configurações',
            'historico': '📜 Histórico',
            'notificacoes': '🔔 Notificações',
            'nfe': '📄 NF-e',
            'producao': '🌾 Produção'
        };
        var titleEl = this._getElement('view-title');
        if (titleEl) titleEl.textContent = titles[view] || view;
        
        document.querySelectorAll('.nav-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.section === view);
        });
        
        try {
            localStorage.setItem('gr_ultima_aba', view);
        } catch(e) {}
        
        this._closeSidebarMobile();
        this.refreshCurrentView();
    },

    _closeSidebarMobile: function() {
        var sidebar = this._getElement('sidebar');
        var overlay = this._getElement('sidebar-overlay');
        if (window.innerWidth <= 768) {
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
        }
    },

    refreshCurrentView: function() {
        var view = GR.State.ui.viewAtual || 'dashboard';
        var container = this._getElement('sectionContainer');
        if (!container) return;

        container.style.opacity = '0.5';
        container.style.transition = 'opacity 0.2s';

        var renderMap = {
            'dashboard': GR.Modules.Dashboard._renderDashboard,
            'acoes': this._renderAcoes.bind(this),
            'orcamentos': this._renderOrcamentos.bind(this),
            'credito': this._renderCredito.bind(this),
            'insumos': this._renderInsumos.bind(this),
            'pecuaria': this._renderPecuaria.bind(this),
            'funcionarios': this._renderFuncionarios.bind(this),
            'parceiros': this._renderParceiros.bind(this),
            'contabilidade': this._renderContabilidade.bind(this),
            'documentos': this._renderDocumentos.bind(this),
            'analises': this._renderAnalises.bind(this),
            'viveiro': this._renderViveiro.bind(this),
            'relatorios': this._renderRelatorios.bind(this),
            'configuracoes': this._renderConfiguracoes.bind(this),
            'historico': this._renderHistorico.bind(this),
            'notificacoes': this._renderNotificacoes.bind(this),
            'nfe': this._renderNFe.bind(this),
            'producao': this._renderProducao.bind(this)
        };

        var renderFn = renderMap[view];
        if (renderFn && typeof renderFn === 'function') {
            renderFn(container);
        } else {
            container.innerHTML = '<div class="card"><div class="empty-state"><span class="icon">🚧</span><div class="message">Módulo em desenvolvimento: ' + view + '</div></div></div>';
        }

        requestAnimationFrame(() => {
            container.style.opacity = '1';
        });
    },

    // ================================================================
    // 🏠 FILTRAR PROPRIEDADES POR PERFIL (CORRIGIDO)
    // ================================================================
    atualizarPropTabsComPermissoes: function() {
        var container = this._getElement('prop-tabs-container');
        if (!container) return;
        container.innerHTML = '';
        
        var props = GR.State.data.propriedades || [];
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        
        // 🔧 VERIFICAÇÃO SEGURA DO PERFIL
        var perfilAtual = null;
        if (GR.Modules.Perfis) {
            if (typeof GR.Modules.Perfis.getPerfilAtual === 'function') {
                perfilAtual = GR.Modules.Perfis.getPerfilAtual();
            } else {
                perfilAtual = GR.Modules.Perfis.perfilAtual || null;
            }
        }
        
        var propsPermitidas = perfilAtual?.propriedadesPermitidas;
        var isMaster = perfilAtual?.id === 'master' || perfilAtual?.id === 'admin';
        var temRestricao = propsPermitidas && propsPermitidas.length > 0 && !isMaster;

        var btnAll = document.createElement('button');
        btnAll.className = 'prop-tab' + (propAtiva === 'todas' ? ' active' : '');
        btnAll.textContent = '🏠 Todas';
        btnAll.title = 'Mostrar todas as propriedades permitidas';
        btnAll.onclick = function() { GR.UI.setPropriedadeAtiva('todas'); };
        container.appendChild(btnAll);

        props.forEach(function(p) {
            if (temRestricao && !propsPermitidas.includes(p.nome)) {
                return;
            }
            
            var btn = document.createElement('button');
            btn.className = 'prop-tab' + (propAtiva === p.nome ? ' active' : '');
            btn.textContent = p.nome;
            btn.title = 'Filtrar por ' + p.nome;
            btn.onclick = function() { GR.UI.setPropriedadeAtiva(p.nome); };
            container.appendChild(btn);
        });
        
        if (container.children.length <= 1) {
            var msg = document.createElement('span');
            msg.style.cssText = 'font-size:11px;color:var(--text-light);padding:4px;';
            msg.textContent = '🔒 Nenhuma propriedade disponível para seu perfil';
            container.appendChild(msg);
        }

        var addBtn = document.createElement('button');
        addBtn.className = 'prop-tab-add';
        addBtn.textContent = '➕';
        addBtn.title = 'Cadastrar Nova Propriedade';
        addBtn.style.cssText = 'padding:4px 10px;border:1px dashed #4CAF50;background:transparent;color:#4CAF50;border-radius:4px;cursor:pointer;font-size:14px;margin-left:4px;transition:all 0.2s;';
        addBtn.onmouseover = function() { this.style.background = '#e8f5e9'; };
        addBtn.onmouseout = function() { this.style.background = 'transparent'; };
        addBtn.onclick = function() { GR.Modules.Propriedades.abrirModal(); };
        container.appendChild(addBtn);
    },

    // ================================================================
    // INIT - COMPLETO COM CORREÇÕES
    // ================================================================
    init: function() {
        var self = this;

        try {
            var savedTheme = localStorage.getItem('gr_theme') || 'claro';
            document.documentElement.setAttribute('data-theme', savedTheme);
            var sel = this._getElement('themeSelector');
            if (sel) {
                sel.value = savedTheme;
                sel.onchange = function() {
                    document.documentElement.setAttribute('data-theme', this.value);
                    localStorage.setItem('gr_theme', this.value);
                    GR.Toast.info('🎨 Tema alterado para: ' + this.value);
                };
            }

            var savedFont = parseFloat(localStorage.getItem('gr_font_size')) || 14;
            document.documentElement.style.setProperty('--font-size-base', savedFont + 'px');
            var label = this._getElement('fontSizeLabel');
            if (label) label.textContent = Math.round((savedFont / 14) * 100) + '%';

            document.querySelectorAll('.nav-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var section = this.dataset.section;
                    if (section) self.mudarView(section);
                });
                
                btn.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        var section = this.dataset.section;
                        if (section) self.mudarView(section);
                    }
                });
            });

            this.atualizarPropTabsComPermissoes();
            this.atualizarDatalists();
            
            // 🔧 INICIALIZAÇÃO SEGURA DOS PERFIS
            if (GR.Modules.Perfis) {
                // Verifica se a função init existe
                if (typeof GR.Modules.Perfis.init === 'function') {
                    GR.Modules.Perfis.init();
                } else if (typeof GR.Modules.Perfis._forcarCarregamentoPerfil === 'function') {
                    GR.Modules.Perfis._forcarCarregamentoPerfil();
                    if (typeof GR.Modules.Perfis.filtrarMenu === 'function') {
                        GR.Modules.Perfis.filtrarMenu();
                    }
                }
                
                setTimeout(function() {
                    if (typeof GR.Modules.Perfis.filtrarMenu === 'function') {
                        GR.Modules.Perfis.filtrarMenu();
                    }
                    var btnPerfis = self._getElement('btn-gerenciar-perfis');
                    if (btnPerfis) {
                        var podeGerenciar = false;
                        if (typeof GR.Modules.Perfis.podeGerenciarPerfis === 'function') {
                            podeGerenciar = GR.Modules.Perfis.podeGerenciarPerfis();
                        }
                        btnPerfis.style.display = podeGerenciar ? 'inline-block' : 'none';
                    }
                    setTimeout(function() {
                        self.atualizarPropTabsComPermissoes();
                    }, 100);
                }, 500);
            }
            
            this.mudarView('dashboard');
            this._filtrarNavPorPropriedade();

            setTimeout(function() {
                if (typeof self.atualizarInfoUsuario === 'function') {
                    self.atualizarInfoUsuario();
                }
            }, 600);

            setTimeout(function() { 
                if (GR.State && typeof GR.State.verificarVencimentos === 'function') {
                    GR.State.verificarVencimentos(); 
                }
            }, 3000);
            
            setInterval(function() { 
                if (GR.State && typeof GR.State.verificarVencimentos === 'function') {
                    GR.State.verificarVencimentos(); 
                }
            }, 300000);

            setInterval(function() {
                if (!document.hidden) {
                    GR.Modules.Dashboard._atualizarDashboard();
                }
            }, 300000);

            window.addEventListener('beforeunload', function() {
                self._clearCache();
            });

            window.addEventListener('resize', function() {
                if (window.innerWidth > 768) {
                    var sidebar = self._getElement('sidebar');
                    var overlay = self._getElement('sidebar-overlay');
                    if (sidebar) sidebar.classList.remove('open');
                    if (overlay) overlay.classList.remove('show');
                }
            });

            window.addEventListener('fornecedores-atualizados', function() {
                console.log('🔄 Fornecedores atualizados, atualizando UI...');
                self._atualizarSelectsFornecedores();
                if (GR.State.ui.viewAtual === 'configuracoes') {
                    self.refreshCurrentView();
                }
            });

            window.addEventListener('perfil-atualizado', function() {
                console.log('🔄 Perfil atualizado, atualizando abas de propriedades...');
                setTimeout(function() {
                    self.atualizarPropTabsComPermissoes();
                }, 200);
            });

            // ================================================================
            // 🚀 MELHORIAS ADICIONADAS
            // ================================================================

            // 1. PERSISTÊNCIA DA ABA ATIVA
            (function() {
                var ultimaAba = localStorage.getItem('gr_ultima_aba');
                if (ultimaAba && ultimaAba !== 'dashboard') {
                    setTimeout(function() {
                        var btn = document.querySelector('.nav-btn[data-section="' + ultimaAba + '"]');
                        if (btn) {
                            self.mudarView(ultimaAba);
                        }
                    }, 800);
                }
            })();

            // 2. ATALHOS DE TECLADO
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
                    e.preventDefault();
                    var index = parseInt(e.key) - 1;
                    var botoes = document.querySelectorAll('.nav-btn');
                    if (botoes[index]) {
                        botoes[index].click();
                    }
                }
                if (e.ctrlKey && e.key === 'd') {
                    e.preventDefault();
                    var btn = document.querySelector('.nav-btn[data-section="dashboard"]');
                    if (btn) btn.click();
                }
                if (e.ctrlKey && e.key === 'c') {
                    e.preventDefault();
                    var btn = document.querySelector('.nav-btn[data-section="configuracoes"]');
                    if (btn) btn.click();
                }
                if (e.ctrlKey && e.key === 's') {
                    var activeModal = document.querySelector('.modal.active');
                    if (activeModal) {
                        var saveBtn = activeModal.querySelector('.btn-primary[onclick*="salvar"]');
                        if (saveBtn) {
                            e.preventDefault();
                            saveBtn.click();
                        }
                    }
                }
                if (e.key === 'Escape') {
                    var modal = document.querySelector('.modal.active');
                    if (modal) {
                        var closeBtn = modal.querySelector('.close-btn');
                        if (closeBtn) closeBtn.click();
                    }
                }
                if (e.key === 'F1') {
                    e.preventDefault();
                    GR.Toast.info('📚 Atalhos disponíveis: Ctrl+1 a Ctrl+9, Ctrl+D, Ctrl+C, Ctrl+S, ESC');
                }
            });

            // 3. DETECÇÃO DE CONEXÃO
            function atualizarStatusConexao() {
                var onlineEl = document.getElementById('footer-online');
                if (!onlineEl) return;
                if (navigator.onLine) {
                    onlineEl.textContent = '🟢 Online';
                    onlineEl.style.color = 'var(--success)';
                } else {
                    onlineEl.textContent = '🔴 Offline';
                    onlineEl.style.color = 'var(--danger)';
                }
            }
            window.addEventListener('online', atualizarStatusConexao);
            window.addEventListener('offline', atualizarStatusConexao);
            setTimeout(atualizarStatusConexao, 100);

            // 4. TEMPO DE CARREGAMENTO
            (function() {
                var startTime = performance.now();
                window.addEventListener('load', function() {
                    var loadTime = Math.round(performance.now() - startTime);
                    var footer = document.querySelector('#app-footer');
                    if (footer) {
                        var span = document.createElement('span');
                        span.textContent = '| ⚡ ' + loadTime + 'ms';
                        span.style.fontSize = '10px';
                        span.style.color = 'var(--text-light)';
                        footer.appendChild(span);
                    }
                });
            })();

            // 5. BOTÃO DE TELA CHEIA
            setTimeout(function() {
                var headerRight = document.querySelector('.header-right');
                if (headerRight) {
                    var btnFullscreen = document.createElement('button');
                    btnFullscreen.className = 'config-btn';
                    btnFullscreen.innerHTML = '⛶';
                    btnFullscreen.title = 'Tela cheia (F11)';
                    btnFullscreen.onclick = function() {
                        if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen().catch(function() {});
                        } else {
                            document.exitFullscreen().catch(function() {});
                        }
                    };
                    headerRight.appendChild(btnFullscreen);
                }
            }, 500);

            // 6. SCROLL SUAVE NO MENU
            var menu = document.querySelector('.nav-menu');
            if (menu) {
                menu.addEventListener('wheel', function(e) {
                    if (e.deltaY !== 0) {
                        e.preventDefault();
                        this.scrollLeft += e.deltaY;
                    }
                }, { passive: false });
            }

            // 7. DUPLO CLIQUE NO HEADER VOLTA AO TOPO
            var header = document.querySelector('.header');
            if (header) {
                header.addEventListener('dblclick', function() {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }

            // 8. NOTIFICAÇÃO DE ATUALIZAÇÃO DIÁRIA
            (function() {
                var ultimaAtualizacao = localStorage.getItem('gr_ultima_atualizacao');
                var hoje = new Date().toDateString();
                if (ultimaAtualizacao !== hoje) {
                    setTimeout(function() {
                        if (GR.Toast) {
                            GR.Toast.info('📢 Dados atualizados automaticamente!');
                        }
                        localStorage.setItem('gr_ultima_atualizacao', hoje);
                    }, 3000);
                }
            })();

            // 9. FUNÇÃO GLOBAL PARA EXPORTAR RELATÓRIO RÁPIDO
            window.exportarRelatorioRapido = function() {
                try {
                    var tarefasFiltradas = GR.State.filtrarPorPropriedade(GR.State.data.tarefas || [], 'propriedade');
                    var contratosFiltrados = GR.State.filtrarPorPropriedade(GR.State.data.contratos || [], 'propriedade');
                    var insumosFiltrados = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
                    var animaisFiltrados = GR.State.filtrarPorPropriedade(GR.State.data.animais || [], 'propriedade');
                    var funcionariosFiltrados = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
                    var receitasFiltradas = GR.State.filtrarPorPropriedade(GR.State.data.receitas || [], 'propriedade');
                    var despesasFiltradas = GR.State.filtrarPorPropriedade(GR.State.data.despesas || [], 'propriedade');
                    
                    var dados = {
                        exportadoEm: new Date().toLocaleString('pt-BR'),
                        propriedadeAtiva: GR.State.ui.propriedadeAtiva || 'todas',
                        totalTarefas: tarefasFiltradas.length,
                        totalContratos: contratosFiltrados.length,
                        totalInsumos: insumosFiltrados.length,
                        totalAnimais: animaisFiltrados.length,
                        totalFuncionarios: funcionariosFiltrados.length,
                        totalReceitas: receitasFiltradas.length,
                        totalDespesas: despesasFiltradas.length,
                        saldo: receitasFiltradas.reduce((s, r) => s + (r.valor || 0), 0) - 
                               despesasFiltradas.reduce((s, d) => s + (d.valor || 0), 0)
                    };
                    var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'relatorio_rapido_' + new Date().toISOString().slice(0, 10) + '.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    if (GR.Toast) GR.Toast.success('✅ Relatório exportado!');
                } catch(e) {
                    if (GR.Toast) GR.Toast.error('Erro ao exportar');
                }
            };

            // 10. FUNÇÃO GLOBAL PARA LIMPAR NOTIFICAÇÕES
            window.limparTodasNotificacoes = function() {
                if (GR.Notificacoes && typeof GR.Notificacoes.limparTodas === 'function') {
                    GR.Notificacoes.limparTodas();
                    if (GR.Toast) GR.Toast.success('✅ Notificações limpas!');
                } else {
                    if (GR.Toast) GR.Toast.error('Função não disponível');
                }
            };

            // 11. FUNÇÃO GLOBAL PARA ATUALIZAR DADOS
            window.atualizarDadosSistema = function() {
                if (GR.UI && typeof GR.UI.atualizarDados === 'function') {
                    GR.UI.atualizarDados();
                } else {
                    if (GR.Toast) GR.Toast.error('Função não disponível');
                }
            };

            // 12. FUNÇÃO GLOBAL PARA EXPORTAR DADOS COMPLETOS
            window.exportarDadosCompletos = function() {
                try {
                    var dados = GR.State.exportarDadosCompletos();
                    var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'dados_completos_' + new Date().toISOString().slice(0, 10) + '.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    if (GR.Toast) GR.Toast.success('✅ Dados exportados!');
                } catch(e) {
                    if (GR.Toast) GR.Toast.error('Erro ao exportar: ' + e.message);
                }
            };

            // 13. BOTÃO DE AJUDA RÁPIDA
            setTimeout(function() {
                var headerRight = document.querySelector('.header-right');
                if (headerRight) {
                    var btnHelp = document.createElement('button');
                    btnHelp.className = 'config-btn';
                    btnHelp.innerHTML = '❓';
                    btnHelp.title = 'Ajuda rápida (F1)';
                    btnHelp.onclick = function() {
                        GR.Toast.info('📚 Atalhos: Ctrl+1 a Ctrl+9 (módulos), Ctrl+D (dashboard), Ctrl+C (config), Ctrl+S (salvar), ESC (fechar)');
                    };
                    headerRight.appendChild(btnHelp);
                }
            }, 600);

            // 14. PREVENÇÃO DE CLIQUE DUPLO EM BOTÕES
            document.addEventListener('click', function(e) {
                var btn = e.target.closest('.btn');
                if (btn && btn.dataset.clicked) {
                    e.preventDefault();
                    return;
                }
                if (btn && btn.classList.contains('btn-primary')) {
                    btn.dataset.clicked = 'true';
                    setTimeout(function() {
                        delete btn.dataset.clicked;
                    }, 1000);
                }
            });

            // 15. DETECÇÃO DE ALTERAÇÕES NOS DADOS
            window.addEventListener('dados-carregados', function() {
                console.log('🔄 Dados carregados, atualizando UI...');
                self.atualizarPropTabsComPermissoes();
                self._atualizarSelectsPropriedade();
                self._atualizarSelectsFornecedores();
                self._filtrarNavPorPropriedade();
                if (GR.State.ui.viewAtual === 'dashboard') {
                    GR.Modules.Dashboard._atualizarDashboard();
                }
            });

            console.log('✅ UI inicializada com sucesso!');
            console.log('📌 Melhorias ativas:');
            console.log('   - 🆕 Cache de elementos DOM');
            console.log('   - 🆕 Throttle e Debounce');
            console.log('   - 🆕 Animações de transição');
            console.log('   - 🆕 Suporte a teclado (acessibilidade)');
            console.log('   - 🆕 Fechamento automático do sidebar mobile');
            console.log('   - 🆕 Atualização automática em segundo plano');
            console.log('   - 🆕 Valores FIXOS no TOPO das colunas do gráfico 🚀');
            console.log('   - 🆕 Fundo branco nos valores para legibilidade');
            console.log('   - 🆕 Exportação do dashboard');
            console.log('   - 🆕 Verificação de permissões por módulo');
            console.log('   - 🆕 Indicadores de tendência no dashboard');
            console.log('   - 🆕 Sub-abas de configuração com Fornecedores');
            console.log('   - 🆕 Listener em tempo real para fornecedores');
            console.log('   - 🆕 Atualização automática de selects de fornecedores');
            console.log('   - 🆕 Botão de ajuda rápida');
            console.log('   - 🆕 Prevenção de clique duplo em botões');
            console.log('   - 🆕 Detecção de alterações nos dados');
            console.log('   - 🆕 Ctrl+S para salvar modais');
            console.log('   - 🆕 ESC para fechar modais');
            console.log('   - 🆕 F1 para ajuda');
            console.log('   - 🏠 Filtro de propriedades por perfil');
            console.log('   - 📊 Dashboard filtrado por propriedade');
            console.log('   - 🚀 Persistência da aba ativa');
            console.log('   - 🚀 Atalhos de teclado (Ctrl+1 a Ctrl+9, Ctrl+D, Ctrl+C)');
            console.log('   - 🚀 Detecção de conexão Online/Offline');
            console.log('   - 🚀 Tempo de carregamento no footer');
            console.log('   - 🚀 Botão de tela cheia');
            console.log('   - 🚀 Scroll suave no menu');
            console.log('   - 🚀 Duplo clique no header volta ao topo');
            console.log('   - 🚀 Notificação diária de atualização');
            console.log('   - 🚀 Exportar relatório rápido (exportarRelatorioRapido())');
            console.log('   - 🚀 Limpar notificações (limparTodasNotificacoes())');
            console.log('   - 🚀 Atualizar dados (atualizarDadosSistema())');
            console.log('   - 🚀 Exportar dados completos (exportarDadosCompletos())');

        } catch (error) {
            console.error('❌ Erro ao inicializar UI:', error);
            if (GR.Toast) GR.Toast.error('Erro ao inicializar interface. Recarregue a página.');
        }
    },

    // ================================================================
    // ATUALIZAR SELECTS DE FORNECEDORES
    // ================================================================
    _atualizarSelectsFornecedores: function() {
        var selects = document.querySelectorAll('select[id$="-fornecedor-id"]');
        var fornecedores = GR.State?.data?.fornecedores || [];
        var ativos = fornecedores.filter(f => f.ativo !== false);
        
        ativos.sort((a, b) => (a.nome || a.razaoSocial || '').localeCompare(b.nome || b.razaoSocial || ''));
        
        selects.forEach(function(select) {
            var valorAtual = select.value;
            select.innerHTML = '<option value="">Selecione um fornecedor</option>';
            
            ativos.forEach(function(f) {
                var opt = document.createElement('option');
                opt.value = f.id;
                var nome = f.nome || f.razaoSocial || 'N/A';
                var doc = f.cpfcnpj ? ' - ' + f.cpfcnpj : '';
                opt.textContent = nome + doc;
                select.appendChild(opt);
            });
            
            var optNovo = document.createElement('option');
            optNovo.value = 'novo';
            optNovo.textContent = '➕ Cadastrar Novo Fornecedor';
            optNovo.style.color = 'var(--primary)';
            optNovo.style.fontWeight = 'bold';
            select.appendChild(optNovo);
            
            if (valorAtual) {
                select.value = valorAtual;
            }
        });
    },

    // ================================================================
    // ATUALIZAR INFORMAÇÕES DO USUÁRIO
    // ================================================================
    atualizarInfoUsuario: function() {
        console.log('👤 Atualizando informações do usuário...');
        
        try {
            var user = firebase.auth().currentUser;
            if (!user) {
                console.log('⚠️ Nenhum usuário logado');
                return;
            }
            
            var userNameEl = this._getElement('userName');
            if (userNameEl) {
                userNameEl.textContent = user.displayName || user.email;
                userNameEl.title = user.email || '';
            }
            
            var userLevelEl = this._getElement('userLevel');
            if (userLevelEl && GR.Modules.Perfis) {
                var perfil = null;
                if (typeof GR.Modules.Perfis.getPerfilAtual === 'function') {
                    perfil = GR.Modules.Perfis.getPerfilAtual();
                } else {
                    perfil = GR.Modules.Perfis.perfilAtual || null;
                }
                
                if (perfil) {
                    userLevelEl.textContent = perfil.nome;
                    var cores = {
                        'master': '#d32f2f',
                        'admin': '#1976d2',
                        'gerente': '#388e3c',
                        'operador': '#f57c00',
                        'visitante': '#78909c',
                        'funcionario': '#4CAF50'
                    };
                    userLevelEl.style.background = cores[perfil.id] || '#78909c';
                    userLevelEl.style.color = '#fff';
                    userLevelEl.style.padding = '2px 10px';
                    userLevelEl.style.borderRadius = '12px';
                    userLevelEl.style.fontSize = '10px';
                    userLevelEl.style.fontWeight = 'bold';
                    userLevelEl.style.display = 'inline-block';
                    userLevelEl.title = 'Nível: ' + perfil.nivel;
                }
            }
            
            var footerUser = this._getElement('footer-user-name');
            if (footerUser) {
                footerUser.textContent = user.displayName || user.email;
            }
            
            var footerLevel = this._getElement('footer-user-level');
            if (footerLevel && GR.Modules.Perfis) {
                var perfil = null;
                if (typeof GR.Modules.Perfis.getPerfilAtual === 'function') {
                    perfil = GR.Modules.Perfis.getPerfilAtual();
                } else {
                    perfil = GR.Modules.Perfis.perfilAtual || null;
                }
                
                if (perfil) {
                    footerLevel.textContent = perfil.nome;
                    footerLevel.style.color = 'var(--primary)';
                    footerLevel.style.fontWeight = '600';
                } else {
                    footerLevel.textContent = '-';
                }
            }

            var avatarEl = this._getElement('user-avatar');
            if (avatarEl) {
                var nome = user.displayName || user.email || 'U';
                var inicial = nome.charAt(0).toUpperCase();
                avatarEl.textContent = inicial;
                avatarEl.style.display = 'flex';
            }

            console.log('✅ Informações do usuário atualizadas!');
        } catch (error) {
            console.error('❌ Erro ao atualizar informações do usuário:', error);
        }
    },

    // ================================================================
    // MÉTODOS RENDER - OS MÓDULOS SERÃO FILTRADOS PELOS PRÓPRIOS MÓDULOS
    // ================================================================
    _renderAcoes: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('acoes');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">📋</span> Ações</div>
                    ${podeCriar ? 
                        `<button class="btn btn-primary" onclick="GR.Modules.Tarefas.abrirModal()" title="Criar nova ação">➕ Nova Ação</button>` :
                        `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                    }
                </div>
                <div id="lista-acoes"></div>
            </div>
        `;
        if (GR.Modules.Tarefas && typeof GR.Modules.Tarefas.render === 'function') GR.Modules.Tarefas.render();
    },

    _renderOrcamentos: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('orcamentos');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">💰</span> Orçamentos</div>
                    ${podeCriar ?
                        `<button class="btn btn-primary" onclick="GR.Modal.open('modal-orcamento')" title="Criar novo orçamento">➕ Novo Orçamento</button>` :
                        `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                    }
                </div>
                <div id="lista-orcamentos"></div>
            </div>
        `;
        if (GR.Modules.Orcamentos && typeof GR.Modules.Orcamentos.render === 'function') GR.Modules.Orcamentos.render();
    },

    _renderCredito: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('credito');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">💳</span> Crédito</div>
                    <div style="display:flex;gap:3px;flex-wrap:wrap;">
                        ${podeCriar ?
                            `<button class="btn btn-primary" onclick="GR.Modal.open('modal-contrato')" title="Criar nova operação de crédito">➕ Nova Operação</button>` :
                            `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                        }
                        <button class="btn btn-info" onclick="GR.UI._abrirGraficoCredito()" title="Ver gráficos em tela cheia">📊 Ver Gráfico</button>
                    </div>
                </div>
                <div id="lista-contratos"></div>
            </div>
        `;
        if (GR.Modules.Contratos && typeof GR.Modules.Contratos.render === 'function') GR.Modules.Contratos.render();
    },

    // ================================================================
    // ABRIR GRÁFICO DE CRÉDITO EM TELA CHEIA
    // ================================================================
    _abrirGraficoCredito: function() {
        console.log('📊 Abrindo gráfico de crédito em tela cheia...');
        
        var items = GR.State.filtrarPorPropriedade(GR.State.data.contratos || [], 'propriedade');
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
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
        
        var container = this._getElement('sectionContainer');
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
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">📊</span> Contratos - Vencimentos por Ano</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn btn-secondary" onclick="GR.UI.mudarView('credito')" title="Voltar para Crédito">⬅️ Voltar</button>
                        <button class="btn btn-primary btn-sm" onclick="GR.UI._renderGraficoCredito('bar')" title="Visualizar em gráfico de colunas">📊 Colunas</button>
                        <button class="btn btn-info btn-sm" onclick="GR.UI._renderGraficoCredito('line')" title="Visualizar em gráfico de linhas">📈 Linhas</button>
                        <button class="btn btn-success btn-sm" onclick="GR.UI._renderGraficoCredito('pie')" title="Visualizar em gráfico de pizza">🍕 Pizza</button>
                    </div>
                </div>
                
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
                
                <div style="background:var(--surface);border-radius:8px;padding:16px;border:1px solid var(--border);margin-bottom:12px;min-height:300px;">
                    <canvas id="grafico-credito-tela-cheia" style="max-height:400px;width:100%;"></canvas>
                </div>
                
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
        
        this._graficoLabelsCredito = labels;
        this._graficoValoresCredito = valores;
        this._graficoCoresCredito = cores;
        this._tipoGraficoCredito = 'bar';
        
        setTimeout(function() {
            GR.UI._renderGraficoCredito('bar');
        }, 300);
    },
    
    // ================================================================
    // RENDERIZAR GRÁFICO DE CRÉDITO
    // ================================================================
    _renderGraficoCredito: function(tipo) {
        console.log('📊 Renderizando gráfico de crédito tipo:', tipo);
        
        if (tipo) {
            this._tipoGraficoCredito = tipo;
        }
        
        var labels = this._graficoLabelsCredito || [];
        var valores = this._graficoValoresCredito || [];
        var cores = this._graficoCoresCredito || ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0', '#00BCD4', '#FF5722'];
        var tipoAtual = this._tipoGraficoCredito || 'bar';
        
        var canvas = this._getElement('grafico-credito-tela-cheia');
        if (!canvas) {
            console.warn('⚠️ Canvas do gráfico de crédito não encontrado');
            return;
        }
        
        if (this._meuGraficoCredito) {
            this._meuGraficoCredito.destroy();
        }
        
        var self = this;
        
        function renderizarGrafico(comPlugin) {
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
                }
            };
            
            if (comPlugin && typeof ChartDataLabels !== 'undefined') {
                config.options.plugins.datalabels = {
                    display: true,
                    color: '#1e293b',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: function(value, context) {
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
                    anchor: 'end',
                    align: 'top',
                    offset: 4,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: 4,
                    padding: {
                        top: 2,
                        bottom: 2,
                        left: 4,
                        right: 4
                    }
                };
                config.plugins = [ChartDataLabels];
                console.log('✅ Datasets configurados com valores fixos no TOPO da coluna!');
            }
            
            try {
                self._meuGraficoCredito = new Chart(canvas, config);
                if (comPlugin) {
                    console.log('✅ Gráfico renderizado com valores fixos no TOPO!');
                } else {
                    console.log('⚠️ Gráfico renderizado SEM plugin');
                }
                console.log('📊 Labels:', labels);
                console.log('📊 Valores:', valores);
            } catch (e) {
                console.error('❌ Erro ao criar gráfico:', e);
                if (comPlugin) {
                    console.log('🔄 Tentando renderizar sem plugin...');
                    renderizarGrafico(false);
                } else {
                    GR.Toast.error('Erro ao renderizar gráfico');
                }
            }
        }
        
        if (typeof ChartDataLabels !== 'undefined') {
            try {
                Chart.register(ChartDataLabels);
                console.log('✅ ChartDataLabels registrado no Chart.js');
                renderizarGrafico(true);
            } catch (e) {
                console.warn('⚠️ Erro ao registrar ChartDataLabels:', e);
                renderizarGrafico(false);
            }
        } else {
            console.warn('⚠️ ChartDataLabels não disponível! Tentando carregar...');
            
            var fontes = [
                'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-datalabels/2.0.0/chartjs-plugin-datalabels.min.js'
            ];
            var tentativa = 0;
            
            function tentarCarregar() {
                if (tentativa >= fontes.length) {
                    console.warn('⚠️ Falha ao carregar ChartDataLabels. Renderizando sem plugin...');
                    renderizarGrafico(false);
                    return;
                }
                
                var script = document.createElement('script');
                script.src = fontes[tentativa];
                script.onload = function() {
                    console.log('✅ ChartDataLabels carregado!');
                    try {
                        Chart.register(ChartDataLabels);
                        console.log('✅ ChartDataLabels registrado!');
                    } catch (e) {
                        console.warn('⚠️ Erro ao registrar:', e);
                    }
                    renderizarGrafico(true);
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
    },

    _renderInsumos: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('insumos');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">🧪</span> Insumos</div>
                    ${podeCriar ?
                        `<button class="btn btn-primary" onclick="GR.Modules.Insumos.abrirModal()" title="Criar novo insumo">➕ Novo</button>` :
                        `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                    }
                </div>
                <div class="stats-grid">
                    <div class="stats-card"><div class="number" id="total-insumos">0</div><div class="label">Total de Insumos</div></div>
                    <div class="stats-card"><div class="number" id="valor-estoque">R$ 0,00</div><div class="label">Valor em Estoque</div></div>
                    <div class="stats-card danger"><div class="number" id="insumos-vencidos">0</div><div class="label">Insumos Vencidos</div></div>
                </div>
                <div id="lista-insumos"></div>
            </div>
        `;
        if (GR.Modules.Insumos && typeof GR.Modules.Insumos.render === 'function') GR.Modules.Insumos.render();
    },

    _renderPecuaria: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('pecuaria');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">🐄</span> Pecuária</div>
                    ${podeCriar ?
                        `<div style="display:flex;gap:3px;flex-wrap:wrap;">
                            <button class="btn btn-primary" onclick="GR.Modules.Pecuaria.abrirModalAnimal()" title="Cadastrar novo animal">➕ Novo Animal</button>
                            <button class="btn btn-info btn-sm" onclick="GR.Modules.Pecuaria.abrirModalPesagem()" title="Registrar pesagem">⚖️ Pesagem</button>
                            <button class="btn btn-warning btn-sm" onclick="GR.Modules.Pecuaria.abrirModalVacina()" title="Registrar vacinação">💉 Vacina</button>
                        </div>` :
                        `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                    }
                </div>
                <div id="lista-animais"></div>
            </div>
        `;
        if (GR.Modules.Pecuaria && typeof GR.Modules.Pecuaria.render === 'function') GR.Modules.Pecuaria.render();
    },

    _renderFuncionarios: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('funcionarios');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">👨‍🌾</span> Funcionários</div>
                    ${podeCriar ?
                        `<button class="btn btn-primary" onclick="GR.Modules.Funcionarios.abrirModal()" title="Cadastrar novo funcionário">➕ Novo Funcionário</button>` :
                        `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                    }
                </div>
                <div id="lista-funcionarios"></div>
            </div>
        `;
        if (GR.Modules.Funcionarios && typeof GR.Modules.Funcionarios.render === 'function') GR.Modules.Funcionarios.render();
    },

    _renderParceiros: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('parceiros');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">👥</span> Parceiros</div>
                    ${podeCriar ?
                        `<div style="display:flex;gap:3px;flex-wrap:wrap;">
                            <button class="btn btn-primary" onclick="GR.Modules.Parceiros.abrirModal()" title="Cadastrar novo parceiro">➕ Novo Parceiro</button>
                            <button class="btn btn-info btn-sm" onclick="GR.Modules.PartesRelacionadas.abrirModal()" title="Cadastrar nova parte relacionada">👤 Nova Parte</button>
                        </div>` :
                        `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                    }
                </div>
                <div id="lista-parceiros"></div>
            </div>
        `;
        if (GR.Modules.Parceiros && typeof GR.Modules.Parceiros.render === 'function') GR.Modules.Parceiros.render();
    },

    _renderContabilidade: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('contabilidade');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">🧾</span> Contabilidade</div>
                    ${podeCriar ?
                        `<div style="display:flex;gap:3px;flex-wrap:wrap;">
                            <button class="btn btn-danger" onclick="GR.Modal.open('modal-despesa')" title="Registrar nova despesa">💸 Despesa</button>
                            <button class="btn btn-success" onclick="GR.Modal.open('modal-receita')" title="Registrar nova receita">💰 Receita</button>
                        </div>` :
                        `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                    }
                </div>
                <div id="lista-contabilidade"></div>
            </div>
        `;
        if (GR.Modules.Contabilidade && typeof GR.Modules.Contabilidade.render === 'function') GR.Modules.Contabilidade.render();
    },

    _renderDocumentos: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('documentos');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">📁</span> Documentos</div>
                    ${podeCriar ?
                        `<button class="btn btn-primary" onclick="GR.Modules.Documentos.abrirModal()" title="Adicionar novo documento">➕ Novo Documento</button>` :
                        `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                    }
                </div>
                <div id="lista-documentos"></div>
            </div>
        `;
        if (GR.Modules.Documentos && typeof GR.Modules.Documentos.render === 'function') GR.Modules.Documentos.render();
    },

    _renderAnalises: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('analises');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">🧪</span> Análises</div>
                    ${podeCriar ?
                        `<button class="btn btn-primary" onclick="GR.Analises.abrirModal()" title="Criar nova análise">➕ Nova Análise</button>` :
                        `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                    }
                </div>
                <div id="lista-analises"></div>
            </div>
        `;
        if (GR.Analises && typeof GR.Analises.render === 'function') GR.Analises.render();
    },

    // ================================================================
    // VIVEIRO - APENAS O CONTEÚDO (SEM CABEÇALHO DUPLICADO)
    // ================================================================
    _renderViveiro: function(container) {
        container.innerHTML = `
            <div id="viveiro-content"></div>
        `;
        if (GR.Modules.Viveiro && typeof GR.Modules.Viveiro.render === 'function') {
            GR.Modules.Viveiro.render();
        }
    },

    _renderRelatorios: function(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">📊</span> Relatórios</div>
                </div>
                <div id="relatorios-content"></div>
            </div>
        `;
        if (GR.Modules.Relatorios && typeof GR.Modules.Relatorios.render === 'function') GR.Modules.Relatorios.render();
    },

    // ================================================================
    // RENDER CONFIGURAÇÕES - COM SUB-ABAS E FORNECEDORES
    // ================================================================
    _renderConfiguracoes: function(container) {
        console.log('⚙️ Renderizando configurações com sub-abas...');
        
        if (!container) {
            container = this._getElement('sectionContainer');
        }
        if (!container) return;
        
        var podeGerenciarPerfis = false;
        var podeZerarBanco = false;
        var perfilAtual = null;
        
        if (GR.Modules.Perfis) {
            if (typeof GR.Modules.Perfis.podeGerenciarPerfis === 'function') {
                podeGerenciarPerfis = GR.Modules.Perfis.podeGerenciarPerfis();
            }
            if (typeof GR.Modules.Perfis.podeZerarBanco === 'function') {
                podeZerarBanco = GR.Modules.Perfis.podeZerarBanco();
            }
            if (typeof GR.Modules.Perfis.getPerfilAtual === 'function') {
                perfilAtual = GR.Modules.Perfis.getPerfilAtual();
            } else {
                perfilAtual = GR.Modules.Perfis.perfilAtual || null;
            }
        }
        
        var user = firebase.auth().currentUser;
        var fornecedoresCount = (GR.State.data.fornecedores || []).length;
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">⚙️</span> Configurações</div>
                    <button class="btn btn-secondary btn-sm" onclick="GR.UI._exportarConfiguracoes()" title="Exportar configurações">📤 Exportar Config</button>
                </div>
                <div id="configuracoes-content">
                    
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;border-bottom:2px solid var(--border);padding-bottom:12px;">
                        <button class="btn btn-sm btn-primary" onclick="GR.UI._mostrarSubAba('config-gerais')" id="tab-config-gerais" style="font-size:12px;">
                            ⚙️ Gerais
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="GR.UI._mostrarSubAba('config-perfis')" id="tab-config-perfis" style="font-size:12px;">
                            🔐 Perfis
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="GR.UI._mostrarSubAba('config-partes')" id="tab-config-partes" style="font-size:12px;">
                            👤 Partes Relacionadas
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="GR.UI._mostrarSubAba('config-fornecedores')" id="tab-config-fornecedores" style="font-size:12px;">
                            🏢 Fornecedores <span style="background:rgba(255,255,255,0.2);padding:0 6px;border-radius:8px;font-size:10px;">${fornecedoresCount}</span>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="GR.UI._mostrarSubAba('config-backup')" id="tab-config-backup" style="font-size:12px;">
                            💾 Backup
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="GR.UI._mostrarSubAba('config-aparencia')" id="tab-config-aparencia" style="font-size:12px;">
                            🎨 Aparência
                        </button>
                    </div>
                    
                    <div id="config-gerais" class="sub-aba-content">
                        <div style="background:linear-gradient(135deg, #1a237e, #283593);color:#fff;border-radius:12px;padding:16px;margin-bottom:12px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                                <div>
                                    <div style="font-size:12px;opacity:0.8;">👤 Usuário</div>
                                    <div style="font-size:18px;font-weight:700;">${user ? user.email : 'Não logado'}</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:12px;opacity:0.8;">📋 Perfil</div>
                                    <div style="font-size:18px;font-weight:700;background:rgba(255,255,255,0.2);padding:4px 16px;border-radius:20px;display:inline-block;">
                                        ${perfilAtual ? perfilAtual.nome : 'Não definido'}
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:12px;opacity:0.8;">📊 Nível</div>
                                    <div style="font-size:18px;font-weight:700;">
                                        ${perfilAtual ? perfilAtual.nivel : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                                <span style="font-size:24px;">ℹ️</span>
                                <h3 style="font-size:15px;margin:0;color:var(--text);">Informações do Sistema</h3>
                            </div>
                            <div style="font-size:12px;color:var(--text-light);">
                                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-light);">
                                    <span><strong>Versão:</strong></span>
                                    <span>3.1</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-light);">
                                    <span><strong>Usuário:</strong></span>
                                    <span>${user ? user.email : 'Não logado'}</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-light);">
                                    <span><strong>Perfil:</strong></span>
                                    <span style="font-weight:600;color:var(--primary-dark);">${perfilAtual ? perfilAtual.nome : 'Não definido'}</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;padding:4px 0;">
                                    <span><strong>Nível:</strong></span>
                                    <span>${perfilAtual ? perfilAtual.nivel : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="config-perfis" class="sub-aba-content" style="display:none;">
                        <div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);border-top:4px solid #4CAF50;">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                                <span style="font-size:24px;">🔐</span>
                                <h3 style="font-size:15px;margin:0;color:var(--text);">Perfis de Usuários</h3>
                            </div>
                            <p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">
                                Gerencie as permissões de cada perfil de usuário
                            </p>
                            ${podeGerenciarPerfis ? `
                                <button class="btn btn-primary" onclick="GR.Modules.Perfis.abrirGerenciamentoPerfis()" style="width:100%;justify-content:center;">
                                    🔐 Gerenciar Perfis
                                </button>
                            ` : `
                                <div style="font-size:12px;color:var(--text-light);padding:8px;background:var(--bg);border-radius:4px;text-align:center;">
                                    ⚠️ Você não tem permissão para gerenciar perfis
                                </div>
                            `}
                            ${podeZerarBanco ? `
                                <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
                                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                                        <span style="font-size:24px;">💣</span>
                                        <h3 style="font-size:15px;margin:0;color:var(--danger);">Zona de Risco</h3>
                                    </div>
                                    <p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">
                                        <strong>ATENÇÃO:</strong> Esta ação irá APAGAR TODOS OS DADOS do sistema. Irreversível!
                                    </p>
                                    <button class="btn btn-danger" onclick="GR.Modules.Perfis.zerarBancoDeDados()" style="width:100%;justify-content:center;">
                                        💣 Zerar Banco de Dados
                                    </button>
                                </div>
                            ` : ''}
</div>
                    </div>

                    <div id="config-partes" class="sub-aba-content" style="display:none;">
                        <div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);border-top:4px solid #9C27B0;">
                            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                                <div>
                                    <h3 style="font-size:15px;margin:0;color:var(--text);">👤 Partes Relacionadas</h3>
                                    <p style="font-size:12px;color:var(--text-light);margin:4px 0 0 0;">
                                        Cadastre partes relacionadas para associar a parceiros, contratos e outras operações
                                    </p>
                                </div>
                                <button class="btn btn-success" onclick="GR.Modules.PartesRelacionadas.abrirModal()">
                                    ➕ Nova Parte
                                </button>
                            </div>
                            <div id="lista-partes-relacionadas">
                                <div style="text-align:center;padding:20px;color:var(--text-light);">
                                    ⏳ Carregando partes relacionadas...
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="config-fornecedores" class="sub-aba-content" style="display:none;">
                        <div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);border-top:4px solid #2196F3;">
                            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                                <div>
                                    <h3 style="font-size:15px;margin:0;color:var(--text);">🏢 Fornecedores</h3>
                                    <p style="font-size:12px;color:var(--text-light);margin:4px 0 0 0;">
                                        Cadastre fornecedores para usar em cotações, insumos e compras
                                    </p>
                                </div>
                                <button class="btn btn-primary" onclick="GR.Modules.Fornecedores.abrirModal()" title="Cadastrar novo fornecedor">
                                    ➕ Novo Fornecedor
                                </button>
                            </div>
                            <div id="lista-fornecedores">
                                <div style="text-align:center;padding:20px;color:var(--text-light);">
                                    ⏳ Carregando fornecedores...
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="config-backup" class="sub-aba-content" style="display:none;">
                        <div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);border-top:4px solid #FF9800;">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                                <span style="font-size:24px;">💾</span>
                                <h3 style="font-size:15px;margin:0;color:var(--text);">Backup</h3>
                            </div>
                            <p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">
                                Faça backup ou restaure seus dados
                            </p>
                            <button class="btn btn-primary" onclick="GR.Backup.openBackupModal()" style="width:100%;justify-content:center;">
                                💾 Backup
                            </button>
                        </div>
                    </div>
                    
                    <div id="config-aparencia" class="sub-aba-content" style="display:none;">
                        <div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);border-top:4px solid #9C27B0;">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                                <span style="font-size:24px;">🎨</span>
                                <h3 style="font-size:15px;margin:0;color:var(--text);">Aparência</h3>
                            </div>
                            <p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">
                                Personalize a aparência do sistema
                            </p>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                <button class="btn btn-secondary" onclick="GR.UI.toggleModoEscuro()" style="flex:1;justify-content:center;" title="Alternar tema">
                                    🌓 Alternar Tema
                                </button>
                                <button class="btn btn-secondary" onclick="GR.UI.resetarFonte()" style="flex:1;justify-content:center;" title="Resetar fonte">
                                    ↺ Resetar Fonte
                                </button>
                            </div>
                            <div style="margin-top:12px;">
                                <label style="font-size:12px;color:var(--text-light);">Tamanho da Fonte:</label>
                                <div style="display:flex;gap:4px;align-items:center;margin-top:4px;">
                                    <button class="btn btn-sm btn-secondary" onclick="GR.UI.ajustarFonte(-1)">A-</button>
                                    <span id="fontSizeLabel2" style="font-size:14px;font-weight:600;min-width:50px;text-align:center;">100%</span>
                                    <button class="btn btn-sm btn-secondary" onclick="GR.UI.ajustarFonte(1)">A+</button>
                                    <button class="btn btn-sm btn-secondary" onclick="GR.UI.resetarFonte()">↺</button>
                                </div>
                            </div>
                            <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
                                <label style="font-size:12px;color:var(--text-light);">Tema:</label>
                                <select id="themeSelector" style="width:100%;margin-top:4px;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:13px;">
                                    <option value="claro">☀️ Claro</option>
                                    <option value="escuro">🌙 Escuro</option>
                                    <option value="azul">🔵 Azul</option>
                                    <option value="verde">🟢 Verde</option>
                                    <option value="roxo">🟣 Roxo</option>
                                    <option value="vermelho">🔴 Vermelho</option>
                                    <option value="laranja">🟠 Laranja</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        `;
        
        var label = this._getElement('fontSizeLabel');
        var label2 = document.getElementById('fontSizeLabel2');
        if (label && label2) {
            label2.textContent = label.textContent;
        }
        
        try {
            var themeSelector = this._getElement('themeSelector');
            if (themeSelector) {
                var savedTheme = localStorage.getItem('gr_theme') || 'claro';
                themeSelector.value = savedTheme;
                themeSelector.onchange = function() {
                    document.documentElement.setAttribute('data-theme', this.value);
                    localStorage.setItem('gr_theme', this.value);
                    GR.Toast.info('🎨 Tema alterado para: ' + this.value);
                };
            }
        } catch(e) {}
        
        this._mostrarSubAba('config-gerais');
        
        if (typeof this.atualizarInfoUsuario === 'function') {
            this.atualizarInfoUsuario();
        }
        
        setTimeout(function() {
            var abaFornecedores = document.getElementById('config-fornecedores');
            if (abaFornecedores && abaFornecedores.style.display !== 'none') {
                if (GR.Modules.Fornecedores && typeof GR.Modules.Fornecedores.render === 'function') {
                    GR.Modules.Fornecedores.render();
                    console.log('✅ Fornecedores renderizados na sub-aba');
                } else {
                    console.warn('⚠️ Módulo Fornecedores não encontrado!');
                    var lista = document.getElementById('lista-fornecedores');
                    if (lista) {
                        lista.innerHTML = `
                            <div style="text-align:center;padding:20px;color:var(--text-light);">
                                ⚠️ Módulo de fornecedores não carregado. Recarregue a página.
                            </div>
                        `;
                    }
                }
            }
        }, 300);

        setTimeout(function() {
            var abaPartes = document.getElementById('config-partes');
            if (abaPartes && abaPartes.style.display !== 'none') {
                GR.UI._renderListaPartesRelacionadas();
            }
        }, 300);
    },

    _renderListaPartesRelacionadas: function() {
        var lista = document.getElementById('lista-partes-relacionadas');
        if (!lista) return;
        var partes = GR.State.data.partesRelacionadas || [];
        if (partes.length === 0) {
            lista.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-light);">Nenhuma parte relacionada cadastrada</div>';
            return;
        }
        var html = '<div style="max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;">';
        partes.forEach(function(p) {
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border);background:var(--bg-light);">' +
                '<div><strong>' + GR.Utils.escapeHtml(p.nome || 'Sem nome') + '</strong>' +
                (p.cpf ? ' <span style="font-size:11px;color:var(--text-light);">📄 ' + p.cpf + '</span>' : '') +
                (p.telefone ? ' <span style="font-size:11px;color:var(--text-light);">📱 ' + (p.telefone.ddd || '') + (p.telefone.numero || '') + '</span>' : '') +
                '</div>' +
                '<div style="display:flex;gap:4px;">' +
                '<button class="btn btn-info btn-sm" onclick="GR.Modules.PartesRelacionadas.editar(\'' + p.id + '\')" title="Editar" style="padding:2px 6px;border:none;border-radius:4px;cursor:pointer;background:#2196F3;color:#fff;font-size:10px;">✏️</button>' +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.PartesRelacionadas.excluir(\'' + p.id + '\')" title="Excluir" style="padding:2px 6px;border:none;border-radius:4px;cursor:pointer;background:#f44336;color:#fff;font-size:10px;">🗑️</button>' +
                '</div></div>';
        });
        html += '</div>';
        lista.innerHTML = html;
    },

    // ================================================================
    // MOSTRAR SUB-ABA
    // ================================================================
    _mostrarSubAba: function(abaId) {
        document.querySelectorAll('.sub-aba-content').forEach(function(el) {
            el.style.display = 'none';
        });
        
        var content = document.getElementById(abaId);
        if (content) {
            content.style.display = 'block';
        }
        
        document.querySelectorAll('[id^="tab-config-"]').forEach(function(btn) {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
        
        var btn = document.getElementById('tab-' + abaId);
        if (btn) {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        }
        
        if (abaId === 'config-fornecedores') {
            if (GR.Modules.Fornecedores && typeof GR.Modules.Fornecedores.render === 'function') {
                setTimeout(function() {
                    GR.Modules.Fornecedores.render();
                    console.log('✅ Fornecedores renderizados na sub-aba');
                }, 200);
            } else {
                console.warn('⚠️ Módulo Fornecedores não encontrado!');
            }
        }

        if (abaId === 'config-partes') {
            setTimeout(function() {
                GR.UI._renderListaPartesRelacionadas();
                console.log('✅ Partes relacionadas renderizadas na sub-aba');
            }, 200);
        }
    },

    // ================================================================
    // EXPORTAR CONFIGURAÇÕES
    // ================================================================
    _exportarConfiguracoes: function() {
        try {
            var user = firebase.auth().currentUser;
            var perfil = null;
            if (GR.Modules.Perfis) {
                if (typeof GR.Modules.Perfis.getPerfilAtual === 'function') {
                    perfil = GR.Modules.Perfis.getPerfilAtual();
                } else {
                    perfil = GR.Modules.Perfis.perfilAtual || null;
                }
            }
            
            var dados = {
                exportadoEm: new Date().toISOString(),
                usuario: user ? user.email : 'N/A',
                configuracoes: GR.State.data.configuracoes || {},
                perfil: perfil ? {
                    id: perfil.id,
                    nome: perfil.nome,
                    nivel: perfil.nivel,
                    permissoes: perfil.permissoes
                } : null,
                tema: localStorage.getItem('gr_theme') || 'claro',
                fonte: localStorage.getItem('gr_font_size') || 14
            };
            
            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'configuracoes_export_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            
            GR.Toast.success('✅ Configurações exportadas!');
        } catch(e) {
            GR.Toast.error('Erro ao exportar configurações: ' + e.message);
        }
    },

    _renderHistorico: function(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">📜</span> Histórico</div>
                </div>
                <div id="historico-content"></div>
            </div>
        `;
        if (GR.Modules.Historico && typeof GR.Modules.Historico.render === 'function') GR.Modules.Historico.render();
    },

    _renderNotificacoes: function(container) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">🔔</span> Notificações</div>
                    <button class="btn btn-danger btn-sm" onclick="limparTodasNotificacoes()" title="Limpar todas as notificações">🗑️ Limpar todas</button>
                </div>
                <div id="notificacoes-content"></div>
            </div>
        `;
        if (GR.Modules.Notificacoes && typeof GR.Modules.Notificacoes.render === 'function') GR.Modules.Notificacoes.render();
    },

    _renderNFe: function(container) {
        var podeCriar = true;
        if (GR.Modules.Perfis && typeof GR.Modules.Perfis.podeCriar === 'function') {
            podeCriar = GR.Modules.Perfis.podeCriar('nfe');
        }
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">📄</span> NF-e</div>
                    ${podeCriar ?
                        `<button class="btn btn-primary" onclick="GR.Modal.open('modal-nfe')" title="Importar Nota Fiscal">📤 Importar NF-e</button>` :
                        `<span style="font-size:12px;color:var(--text-light);">👁️ Visualização apenas</span>`
                    }
                </div>
                <div id="nfe-content"></div>
                <div id="nfe-visualizacao" style="margin-top:8px;"></div>
            </div>
        `;
        if (GR.Modules.NFe && typeof GR.Modules.NFe.render === 'function') GR.Modules.NFe.render();
    },

    _renderProducao: function(container) {
        container.innerHTML = '<div class="card"><div class="card-header"><div class="card-title"><span class="emoji">🌾</span> Produção</div>' +
            '</div><div id="lista-producao"></div></div>';
        if (GR.Modules.Producao && typeof GR.Modules.Producao.render === 'function') GR.Modules.Producao.render();
    },

    // ================================================================
    // UTILITÁRIOS
    // ================================================================
    
    atualizarPropTabs: function() {
        this.atualizarPropTabsComPermissoes();
    },

    setPropriedadeAtiva: function(nome) {
        GR.State.setPropriedadeAtiva(nome);
        this.atualizarPropTabsComPermissoes();
        this._atualizarSelectsPropriedade();
        this._filtrarNavPorPropriedade();
        this.refreshCurrentView();
    },

    _filtrarNavPorPropriedade: function() {
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        var propriedade = null;
        if (propAtiva !== 'todas') {
            propriedade = (GR.State.data.propriedades || []).find(function(p) { return p.nome === propAtiva; });
        }

        var modulosPermitidos = null;
        if (propriedade && propriedade.modulos && propriedade.modulos.length) {
            modulosPermitidos = propriedade.modulos;
        }

        var sempreVisiveis = ['dashboard', 'configuracoes', 'historico', 'notificacoes'];

        document.querySelectorAll('.nav-btn').forEach(function(btn) {
            var section = btn.dataset.section;
            if (!section) return;
            if (modulosPermitidos && sempreVisiveis.indexOf(section) === -1) {
                btn.style.display = modulosPermitidos.indexOf(section) !== -1 ? '' : 'none';
            } else {
                btn.style.display = '';
            }
        });
    },

    _atualizarSelectsPropriedade: function() {
        var props = GR.State.data.propriedades || [];
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
var selectIds = ['tarefa-propriedade', 'orc-propriedade', 'contrato-propriedade',
        'insumo-propriedade', 'animal-propriedade', 'func-propriedade',
        'parceiro-propriedade', 'desp-propriedade', 'rec-propriedade',
        'doc-propriedade', 'analise-propriedade',
        'viveiro-insumo-propriedade', 'viveiro-servico-propriedade',
        'viveiro-muda-propriedade', 'viveiro-trabalhador-propriedade',
        'cultura-propriedade', 'colheita-propriedade'
    ];

        selectIds.forEach(function(id) {
            var select = document.getElementById(id);
            if (!select) return;
            var valorAtual = select.value;
            select.innerHTML = '';
            var optEmpty = document.createElement('option');
            optEmpty.value = '';
            optEmpty.textContent = 'Selecione uma propriedade';
            select.appendChild(optEmpty);
            props.forEach(function(p) {
                var opt = document.createElement('option');
                opt.value = p.nome;
                opt.textContent = p.nome;
                select.appendChild(opt);
            });
            if (valorAtual && Array.from(select.options).some(function(o) { return o.value === valorAtual; })) {
                select.value = valorAtual;
            } else if (propAtiva !== 'todas' && Array.from(select.options).some(function(o) { return o.value === propAtiva; })) {
                select.value = propAtiva;
            }
        });
    },

    atualizarDatalists: function() {
        var datalistAcoes = this._getElement('acoes-sugestoes');
        if (datalistAcoes) {
            datalistAcoes.innerHTML = '';
            this._acoesPadrao.forEach(function(a) {
                var opt = document.createElement('option');
                opt.value = a;
                datalistAcoes.appendChild(opt);
            });
        }

        var datalistPartes = this._getElement('partes-list');
        if (datalistPartes) {
            datalistPartes.innerHTML = '';
            (GR.State.data.partesRelacionadas || []).forEach(function(p) {
                var opt = document.createElement('option');
                opt.value = p.nome;
                datalistPartes.appendChild(opt);
            });
        }

        var datalistModalidades = this._getElement('modalidades-list');
        if (datalistModalidades) {
            datalistModalidades.innerHTML = '';
            ['CDC', 'Crédito Rural', 'Pronaf', 'Finame', 'Custeio', 'Investimento'].forEach(function(m) {
                var opt = document.createElement('option');
                opt.value = m;
                datalistModalidades.appendChild(opt);
            });
        }

        var datalistInstituicoes = this._getElement('instituicoes-list');
        if (datalistInstituicoes) {
            datalistInstituicoes.innerHTML = '';
            ['Banco do Brasil', 'Sicoob', 'Sicredi', 'Caixa Econômica', 'Itaú', 'Bradesco', 'Santander', 'Safra'].forEach(function(i) {
                var opt = document.createElement('option');
                opt.value = i;
                datalistInstituicoes.appendChild(opt);
            });
        }
    },

    atualizarDados: function() {
        GR.Toast.info('🔄 Atualizando dados...');
        GR.State.carregarDados().then(function() {
            GR.Toast.success('✅ Dados atualizados!');
            GR.UI.refreshCurrentView();
            GR.UI.atualizarPropTabsComPermissoes();
            GR.UI._atualizarSelectsFornecedores();
        }).catch(function(err) {
            GR.Toast.error('❌ Erro ao atualizar: ' + err.message);
        });
    },

    filtrarPropriedade: function(propriedade) {
        GR.State.setPropriedadeAtiva(propriedade);
        this.atualizarPropTabsComPermissoes();
        this.refreshCurrentView();
    },

    toggleSidebar: function() {
        var sidebar = this._getElement('sidebar');
        var overlay = this._getElement('sidebar-overlay');
        if (sidebar) {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('show');
        }
    },

    updateUserInfo: function() {
        var user = GR.State.data.usuario;
        if (!user) return;
        var nomeEl = this._getElement('user-name');
        var emailEl = this._getElement('user-email');
        if (nomeEl) nomeEl.textContent = user.nome || user.email || 'Usuário';
        if (emailEl) emailEl.textContent = user.email || '';
    },

    atualizarBadgeNotificacoes: function() {
        var badge = this._getElement('notificacao-badge');
        if (!badge) return;
        var notificacoes = GR.State.data.notificacoes || [];
        var naoLidas = notificacoes.filter(function(n) { return !n.lida; });
        var count = naoLidas.length;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    },

    openConfigurations: function() {
        this.mudarView('configuracoes');
    },

    _abrirArquivo: function(arquivoId) {
        if (!arquivoId) { GR.Toast.error('Arquivo não encontrado.'); return; }
        GR.Toast.info('📄 Abrindo arquivo: ' + arquivoId);
    }
};

// ================================================================
// EXPORTA AS FUNÇÕES DE GRÁFICO PARA USO GLOBAL
// ================================================================
GR.UI._abrirGraficoCredito = GR.UI._abrirGraficoCredito;
GR.UI._renderGraficoCredito = GR.UI._renderGraficoCredito;

console.log('✅ GR.UI v3.1 carregado com CORREÇÕES!');
console.log('📌 CORREÇÕES APLICADAS:');
console.log('   - 🔧 Verificação segura de GR.Modules.Perfis.init()');
console.log('   - 🔧 Verificação segura de GR.Modules.Perfis.podeVer()');
console.log('   - 🔧 Verificação segura de GR.Modules.Perfis.podeCriar()');
console.log('   - 🔧 Verificação segura de GR.Modules.Perfis.getPerfilAtual()');
console.log('   - 🔧 Verificação segura de GR.Modules.Perfis.podeGerenciarPerfis()');
console.log('   - 🔧 Verificação segura de GR.Modules.Perfis.podeZerarBanco()');
console.log('📌 Melhorias ativas:');
console.log('   - 🆕 Cache de elementos DOM');
console.log('   - 🆕 Throttle e Debounce');
console.log('   - 🆕 Animações de transição');
console.log('   - 🆕 Suporte a teclado (acessibilidade)');
console.log('   - 🆕 Fechamento automático do sidebar mobile');
console.log('   - 🆕 Atualização automática em segundo plano');
console.log('   - 🆕 Valores FIXOS no TOPO das colunas do gráfico 🚀');
console.log('   - 🆕 Fundo branco nos valores para legibilidade');
console.log('   - 🆕 Exportação do dashboard');
console.log('   - 🆕 Verificação de permissões por módulo');
console.log('   - 🆕 Indicadores de tendência no dashboard');
console.log('   - 🆕 Sub-abas de configuração com Fornecedores');
console.log('   - 🆕 Listener em tempo real para fornecedores');
console.log('   - 🆕 Atualização automática de selects de fornecedores');
console.log('   - 🆕 Exportação de configurações');
console.log('   - 🆕 Seletor de tema na aba Aparência');
console.log('   - 🆕 Botão de ajuda rápida');
console.log('   - 🆕 Prevenção de clique duplo em botões');
console.log('   - 🆕 Detecção de alterações nos dados');
console.log('   - 🆕 Ctrl+S para salvar modais');
console.log('   - 🆕 ESC para fechar modais');
console.log('   - 🆕 F1 para ajuda');
console.log('   - 🏠 Filtro de propriedades por perfil');
console.log('   - 📊 Dashboard filtrado por propriedade');
console.log('   - 🚀 Persistência da aba ativa');
console.log('   - 🚀 Atalhos de teclado (Ctrl+1 a Ctrl+9, Ctrl+D, Ctrl+C)');
console.log('   - 🚀 Detecção de conexão Online/Offline');
console.log('   - 🚀 Tempo de carregamento no footer');
console.log('   - 🚀 Botão de tela cheia');
console.log('   - 🚀 Scroll suave no menu');
console.log('   - 🚀 Duplo clique no header volta ao topo');
console.log('   - 🚀 Notificação diária de atualização');
console.log('   - 🚀 Exportar relatório rápido (exportarRelatorioRapido())');
console.log('   - 🚀 Limpar notificações (limparTodasNotificacoes())');
console.log('   - 🚀 Atualizar dados (atualizarDadosSistema())');
console.log('   - 🚀 Exportar dados completos (exportarDadosCompletos())');