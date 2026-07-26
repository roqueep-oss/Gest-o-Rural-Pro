// ================================================================
// MÓDULO: PECUÁRIA - VERSÃO 5.0 (AUTO-CONTAINER)
// ================================================================
// Esta versão cria o container se não existir e registra
// funções globais para garantir compatibilidade
// ================================================================

(function() {
    'use strict';

    console.log('🐄 Carregando módulo Pecuária v5.0...');

    // ================================================================
    // GARANTE QUE O CONTAINER EXISTA
    // ================================================================
    function garantirContainer() {
        var container = document.getElementById('pecuaria-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'pecuaria-container';
            container.style.display = 'block';
            container.style.width = '100%';
            container.style.padding = '10px';
            
            // Tenta encontrar o local correto para inserir
            var mainContent = document.querySelector('.main-content') || 
                             document.querySelector('#content') || 
                             document.querySelector('main') || 
                             document.body;
            
            // Cria o container para lista de animais
            var listaAnimais = document.createElement('div');
            listaAnimais.id = 'lista-animais';
            listaAnimais.style.width = '100%';
            container.appendChild(listaAnimais);
            
            mainContent.appendChild(container);
            console.log('✅ Container #pecuaria-container criado');
        }
        
        // Garante que #lista-animais existe
        var lista = document.getElementById('lista-animais');
        if (!lista) {
            lista = document.createElement('div');
            lista.id = 'lista-animais';
            lista.style.width = '100%';
            container.appendChild(lista);
            console.log('✅ Container #lista-animais criado');
        }
        
        return container;
    }

    // ================================================================
    // VERIFICA SE O GR ESTÁ DISPONÍVEL
    // ================================================================
    if (typeof GR === 'undefined') {
        console.warn('⚠️ GR não definido, criando fallback...');
        window.GR = {
            Modules: {},
            State: {
                data: { animais: [] },
                ui: { propriedadeAtiva: 'todas' },
                filtrarPorPropriedade: function(arr) { return arr || []; },
                adicionarHistorico: function() {}
            },
            Utils: {
                escapeHtml: function(str) { return str || ''; },
                formatarDataBR: function(d) { return d || ''; },
                calcularIdade: function(d) { return 'N/A'; },
                formatarMoedaBR: function(v) { return 'R$ 0,00'; },
                formatarMoedaSemSimbolo: function(v) { return '0,00'; },
                parseMoedaBR: function(v) { return 0; },
                now: function() { return new Date().toISOString(); },
                debounce: function(fn, ms) { return fn; }
            },
            Modal: { 
                open: function(id) { 
                    var el = document.getElementById(id);
                    if (el) { el.style.display = 'flex'; el.classList.add('active'); }
                },
                close: function(id) {
                    var el = document.getElementById(id);
                    if (el) { el.style.display = 'none'; el.classList.remove('active'); }
                }
            },
            Toast: { 
                success: function(msg) { console.log('✅', msg); },
                error: function(msg) { console.error('❌', msg); },
                warning: function(msg) { console.warn('⚠️', msg); },
                info: function(msg) { console.info('ℹ️', msg); }
            },
            UI: { 
                refreshCurrentView: function() {
                    if (window.PecuariaModule) window.PecuariaModule.render();
                }
            }
        };
        console.log('✅ Fallback GR criado');
    }

    // ================================================================
    // GARANTE QUE O MÓDULO EXISTA EM GR
    // ================================================================
    if (!GR.Modules) GR.Modules = {};
    if (!GR.Modules.Pecuaria) {
        GR.Modules.Pecuaria = {};
        console.log('✅ Módulo Pecuaria registrado em GR.Modules');
    }

    // ================================================================
    // CRIA O MÓDULO PECUÁRIA
    // ================================================================
    var Pecuaria = {
        _inicializado: false,
        _versao: '5.0',
        
        config: {
            ITEMS_PER_PAGE: 50,
            DASHBOARD_REFRESH_INTERVAL: 60000
        },

        state: {
            filtroStatus: 'todos',
            filtroSexo: 'todos',
            filtroBusca: '',
            paginaAtual: 1,
            itemsCache: null,
            ordenacao: 'nascimento-desc',
            dashboardTimer: null
        },

        // ================================================================
        // INICIALIZAÇÃO
        // ================================================================
        init: function() {
            if (this._inicializado) {
                console.log('ℹ️ Pecuária já inicializada');
                return;
            }
            
            console.log('🐄 Inicializando módulo Pecuária v' + this._versao + '...');
            this._inicializado = true;
            
            // Garante que o container existe
            garantirContainer();
            
            // Aguarda o DOM estar pronto
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', this._onDOMReady.bind(this));
            } else {
                this._onDOMReady();
            }
            
            // Registra aliases globais
            this._registrarAliasesGlobais();
            
            console.log('✅ Módulo Pecuária v' + this._versao + ' inicializado!');
        },

        _onDOMReady: function() {
            // Configura listeners
            this._setupEventListeners();
            
            // Inicializa o dashboard timer
            this._startDashboardRefresh();
            
            // Renderiza
            setTimeout(this.render.bind(this), 100);
            
            console.log('✅ Pecuária pronta para uso!');
        },

        _registrarAliasesGlobais: function() {
            var self = this;
            
            // Registra funções no escopo global
            window.abrirModalAnimal = function(editId) {
                console.log('🌐 Chamando abrirModalAnimal global');
                return self.abrirModal(editId);
            };
            
            window.editarAnimal = function(id) {
                return self.editar(id);
            };
            
            window.salvarAnimal = function() {
                return self.salvar();
            };
            
            window.excluirAnimal = function(id) {
                return self.excluir(id);
            };
            
            window.registrarPrenhaAnimal = function(id) {
                return self.registrarPrenha(id);
            };
            
            window.renderizarPecuaria = function() {
                return self.render();
            };
            
            window.abrirModalPesagemGlobal = function() {
                return self.abrirModalPesagem();
            };
            
            window.abrirModalVacinaGlobal = function() {
                return self.abrirModalVacina();
            };
            
            console.log('✅ Aliases globais registrados');
        },

        // ================================================================
        // RENDER PRINCIPAL
        // ================================================================
        render: function() {
            console.log('📊 Renderizando Pecuária...');
            
            // Garante que o container existe
            garantirContainer();
            
            var div = document.getElementById('lista-animais');
            if (!div) {
                console.warn('⚠️ Elemento #lista-animais não encontrado, recriando...');
                var container = document.getElementById('pecuaria-container');
                if (container) {
                    div = document.createElement('div');
                    div.id = 'lista-animais';
                    container.appendChild(div);
                }
                if (!div) return;
            }

            try {
                var items = this._getItems();
                var filtrados = this._applyFilters(items);
                filtrados = this._sortItems(filtrados);
                
                var totalItems = filtrados.length;
                var totalPaginas = Math.ceil(totalItems / this.config.ITEMS_PER_PAGE) || 1;
                var paginados = this._paginate(filtrados);

                var html = this._generateDashboard(filtrados) +
                           this._generateSearchBar() +
                           this._generateQuickFilters() +
                           this._generateTable(paginados, totalItems, totalPaginas) +
                           this._generatePagination(totalPaginas);

                div.innerHTML = html;
                this._initEventListeners();
                
                console.log(`📊 Pecuária: ${filtrados.length} animais exibidos`);
            } catch (e) {
                console.error('❌ Erro ao renderizar pecuária:', e);
                div.innerHTML = this._generateErrorState(e.message);
            }
        },

        _generateErrorState: function(message) {
            return `
                <div style="text-align:center;padding:40px;color:#dc3545;">
                    <span style="font-size:48px;">⚠️</span>
                    <div style="margin-top:12px;font-size:16px;">Erro ao carregar dados</div>
                    <div style="font-size:12px;color:#6c757d;margin-top:8px;">${message}</div>
                    <button class="btn btn-primary btn-sm" onclick="GR.Modules.Pecuaria.render()" style="margin-top:12px;">🔄 Tentar novamente</button>
                </div>
            `;
        },

        // ================================================================
        // OBTENÇÃO DE DADOS
        // ================================================================
        _getItems: function() {
            var animais = [];
            try {
                if (GR && GR.State && GR.State.data && GR.State.data.animais) {
                    animais = GR.State.data.animais || [];
                }
            } catch (e) {
                console.warn('⚠️ Erro ao acessar GR.State:', e);
            }
            
            var propAtiva = 'todas';
            try {
                if (GR && GR.State && GR.State.ui) {
                    propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
                }
            } catch (e) {}
            
            var items = animais;
            if (propAtiva !== 'todas') {
                items = items.filter(function(item) {
                    return item.propriedade === propAtiva;
                });
            }
            
            return items;
        },

        _applyFilters: function(items) {
            var resultado = items || [];

            if (this.state.filtroStatus !== 'todos') {
                resultado = resultado.filter(function(item) {
                    return item.status === this.state.filtroStatus;
                }.bind(this));
            }

            if (this.state.filtroSexo !== 'todos') {
                resultado = resultado.filter(function(item) {
                    return item.sexo === this.state.filtroSexo;
                }.bind(this));
            }

            if (this.state.filtroBusca && this.state.filtroBusca.length >= 2) {
                var busca = this.state.filtroBusca.toLowerCase().trim();
                resultado = resultado.filter(function(item) {
                    var texto = (item.nome || '') + ' ' + 
                               (item.brinco || '') + ' ' + 
                               (item.raca || '') + ' ' + 
                               (item.obs || '');
                    return texto.toLowerCase().includes(busca);
                });
            }

            return resultado;
        },

        _sortItems: function(items) {
            var ordem = this.state.ordenacao || 'nascimento-desc';
            
            return items.slice().sort(function(a, b) {
                switch(ordem) {
                    case 'nascimento-desc':
                        return new Date(b.dataNascimento) - new Date(a.dataNascimento);
                    case 'nascimento-asc':
                        return new Date(a.dataNascimento) - new Date(b.dataNascimento);
                    case 'valor-desc':
                        return (b.valor || 0) - (a.valor || 0);
                    case 'valor-asc':
                        return (a.valor || 0) - (b.valor || 0);
                    case 'nome-asc':
                        return (a.nome || '').localeCompare(b.nome || '');
                    default:
                        return 0;
                }
            });
        },

        _paginate: function(items) {
            var inicio = (this.state.paginaAtual - 1) * this.config.ITEMS_PER_PAGE;
            var fim = inicio + this.config.ITEMS_PER_PAGE;
            return items.slice(inicio, fim);
        },

        // ================================================================
        // DASHBOARD
        // ================================================================
        _generateDashboard: function(items) {
            var total = items.length;
            var machos = items.filter(function(a) { return a.sexo === 'Macho'; }).length;
            var femeas = items.filter(function(a) { return a.sexo === 'Fêmea'; }).length;
            var prenhes = items.filter(function(a) { return a.prenha === true; }).length;
            var ativos = items.filter(function(a) { return a.status === 'Ativo'; }).length;
            var vendidos = items.filter(function(a) { return a.status === 'Vendido'; }).length;
            var mortos = items.filter(function(a) { return a.status === 'Morto'; }).length;
            var baixas = vendidos + mortos;
            var valorTotal = items.reduce(function(sum, a) { return sum + (a.valor || 0); }, 0);

            return `
                <div style="margin-bottom:16px;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;margin-bottom:12px;">
                        <div class="stats-card" style="border-left-color:#007bff;padding:8px;background:#fff;border-radius:4px;border-left:3px solid #007bff;">
                            <div style="font-size:18px;font-weight:700;">${total}</div>
                            <div style="font-size:10px;color:#6c757d;">🐄 Total</div>
                        </div>
                        <div class="stats-card" style="border-left-color:#17a2b8;padding:8px;background:#fff;border-radius:4px;border-left:3px solid #17a2b8;">
                            <div style="font-size:18px;font-weight:700;color:#17a2b8;">${machos}</div>
                            <div style="font-size:10px;color:#6c757d;">♂️ Machos</div>
                        </div>
                        <div class="stats-card" style="border-left-color:#EC407A;padding:8px;background:#fff;border-radius:4px;border-left:3px solid #EC407A;">
                            <div style="font-size:18px;font-weight:700;color:#EC407A;">${femeas}</div>
                            <div style="font-size:10px;color:#6c757d;">♀️ Fêmeas</div>
                        </div>
                        <div class="stats-card" style="border-left-color:#ffc107;padding:8px;background:#fff;border-radius:4px;border-left:3px solid #ffc107;">
                            <div style="font-size:18px;font-weight:700;color:#ffc107;">${prenhes}</div>
                            <div style="font-size:10px;color:#6c757d;">🤰 Prenhes</div>
                        </div>
                        <div class="stats-card" style="border-left-color:#28a745;padding:8px;background:#fff;border-radius:4px;border-left:3px solid #28a745;">
                            <div style="font-size:18px;font-weight:700;color:#28a745;">${ativos}</div>
                            <div style="font-size:10px;color:#6c757d;">✅ Ativos</div>
                        </div>
                        <div class="stats-card" style="border-left-color:#dc3545;padding:8px;background:#fff;border-radius:4px;border-left:3px solid #dc3545;">
                            <div style="font-size:18px;font-weight:700;color:#dc3545;">${baixas}</div>
                            <div style="font-size:10px;color:#6c757d;">📉 Baixas</div>
                        </div>
                        <div class="stats-card" style="border-left-color:#FFD700;padding:8px;background:#fff;border-radius:4px;border-left:3px solid #FFD700;">
                            <div style="font-size:18px;font-weight:700;color:#FFD700;">R$ ${valorTotal.toFixed(2).replace('.', ',')}</div>
                            <div style="font-size:10px;color:#6c757d;">💰 Valor</div>
                        </div>
                    </div>
                    
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;">
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Pecuaria.abrirModal()" style="font-size:11px;">➕ Novo Animal</button>
                        <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Pecuaria.gerarRelatorio()" style="font-size:11px;">📊 Relatório</button>
                        <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Pecuaria.exportarLista()" style="font-size:11px;">📤 Exportar</button>
                    </div>
                </div>
            `;
        },

        _generateSearchBar: function() {
            return `
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;align-items:center;padding:6px 10px;background:#f8f9fa;border-radius:4px;">
                    <div style="flex:2;min-width:150px;position:relative;">
                        <input type="text" id="busca-pecuaria" 
                               placeholder="🔍 Buscar animal..." 
                               class="form-control" 
                               style="padding-right:30px;font-size:12px;"
                               value="${this._escapeHtml(this.state.filtroBusca || '')}">
                        <span id="busca-clear" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;color:#6c757d;display:${this.state.filtroBusca ? 'block' : 'none'};">✕</span>
                    </div>
                    
                    <select id="ordenacao-pecuaria" class="form-control" style="width:auto;min-width:100px;font-size:11px;">
                        <option value="nascimento-desc">📅 Mais novos</option>
                        <option value="nascimento-asc">📅 Mais velhos</option>
                        <option value="valor-desc">💰 Maior valor</option>
                        <option value="valor-asc">💰 Menor valor</option>
                        <option value="nome-asc">🔤 Nome A-Z</option>
                    </select>
                    
                    <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Pecuaria._limparFiltros()" style="font-size:11px;">🧹 Limpar</button>
                </div>
            `;
        },

        _generateQuickFilters: function() {
            var botoes = [
                { key: 'todos', label: '📋 Todos', class: 'btn-secondary' },
                { key: 'Ativo', label: '✅ Ativos', class: 'btn-success' },
                { key: 'Prenhe', label: '🤰 Prenhes', class: 'btn-warning' },
                { key: 'Vendido', label: '💰 Vendidos', class: 'btn-info' },
                { key: 'Morto', label: '💀 Mortos', class: 'btn-danger' },
                { key: 'Macho', label: '♂️ Machos', class: 'btn-info' },
                { key: 'Fêmea', label: '♀️ Fêmeas', class: 'btn-pink' }
            ];

            var ativo = this.state.filtroStatus !== 'todos' ? this.state.filtroStatus : 
                        this.state.filtroSexo !== 'todos' ? this.state.filtroSexo : 'todos';

            return `
                <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;">
                    ${botoes.map(function(b) {
                        var isActive = ativo === b.key;
                        return `<button class="btn btn-sm ${b.class} ${isActive ? 'active' : ''}" 
                                       onclick="GR.Modules.Pecuaria._aplicarFiltroRapido('${b.key}')" 
                                       style="font-size:10px;${isActive ? 'box-shadow:0 0 0 2px #007bff;' : ''}">
                            ${b.label}
                        </button>`;
                    }).join('')}
                </div>
            `;
        },

        _generateTable: function(items, total, totalPaginas) {
            if (!items || items.length === 0) {
                var msg = this.state.filtroBusca ? 'Nenhum animal encontrado com este filtro' : 'Nenhum animal cadastrado';
                var icon = this.state.filtroBusca ? '🔍' : '🐄';
                return `
                    <div style="text-align:center;padding:40px;">
                        <span style="font-size:48px;">${icon}</span>
                        <div style="font-size:16px;margin:12px 0;">${msg}</div>
                        ${this.state.filtroBusca ? 
                            `<button class="btn btn-secondary btn-sm" onclick="GR.Modules.Pecuaria._limparFiltros()">🔄 Limpar filtros</button>` :
                            `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Pecuaria.abrirModal()">➕ Novo Animal</button>`
                        }
                    </div>
                `;
            }

            var rows = items.map(function(a) {
                var idade = a.dataNascimento ? this._calcularIdade(a.dataNascimento) : '-';
                var valorDisplay = a.valor ? 'R$ ' + a.valor.toFixed(2).replace('.', ',') : '-';
                var sexoBadge = a.sexo === 'Macho' ? 
                    '<span style="font-size:10px;background:#17a2b8;color:#fff;padding:2px 6px;border-radius:3px;">♂️ Macho</span>' :
                    '<span style="font-size:10px;background:#EC407A;color:#fff;padding:2px 6px;border-radius:3px;">♀️ Fêmea</span>';
                
                var statusBadge = this._getStatusBadge(a.status);

                return `
                    <tr style="${items.indexOf(a) % 2 === 0 ? 'background:#f8f9fa;' : ''}">
                        <td style="padding:4px 6px;font-weight:600;font-size:12px;">${this._escapeHtml(a.brinco || a.nome || 'N/A')}</td>
                        <td style="padding:4px 6px;font-size:12px;">${this._escapeHtml(a.nome || '-')}</td>
                        <td style="padding:4px 6px;font-size:12px;">${sexoBadge}</td>
                        <td style="padding:4px 6px;font-size:12px;">${this._escapeHtml(a.raca || '-')}</td>
                        <td style="padding:4px 6px;font-size:12px;">${this._formatarDataBR(a.dataNascimento)}</td>
                        <td style="padding:4px 6px;font-size:12px;">${idade}</td>
                        <td style="padding:4px 6px;font-size:12px;">${statusBadge}</td>
                        <td style="padding:4px 6px;font-size:12px;">${this._escapeHtml(a.propriedade || '-')}</td>
                        <td style="padding:4px 6px;font-size:12px;text-align:right;">${valorDisplay}</td>
                        <td style="padding:4px 6px;font-size:12px;white-space:nowrap;text-align:center;">
                            <button class="btn btn-primary btn-xs" onclick="GR.Modules.Pecuaria.editar('${a.id}')" title="Editar" style="padding:2px 4px;font-size:10px;">✏️</button>
                            <button class="btn btn-warning btn-xs" onclick="GR.Modules.Pecuaria.registrarPrenha('${a.id}')" title="Prenha" style="padding:2px 4px;font-size:10px;">🤰</button>
                            <button class="btn btn-danger btn-xs" onclick="GR.Modules.Pecuaria.excluir('${a.id}')" title="Excluir" style="padding:2px 4px;font-size:10px;">🗑️</button>
                        </td>
                    </tr>
                `;
            }.bind(this)).join('');

            return `
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:12px;">
                        <thead>
                            <tr style="background:#e9ecef;border-bottom:2px solid #dee2e6;">
                                <th style="padding:4px 6px;text-align:left;">Brinco</th>
                                <th style="padding:4px 6px;text-align:left;">Nome</th>
                                <th style="padding:4px 6px;text-align:left;">Sexo</th>
                                <th style="padding:4px 6px;text-align:left;">Raça</th>
                                <th style="padding:4px 6px;text-align:left;">Nascimento</th>
                                <th style="padding:4px 6px;text-align:left;">Idade</th>
                                <th style="padding:4px 6px;text-align:left;">Status</th>
                                <th style="padding:4px 6px;text-align:left;">Propriedade</th>
                                <th style="padding:4px 6px;text-align:right;">Valor</th>
                                <th style="padding:4px 6px;text-align:center;">Ações</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        },

        _getStatusBadge: function(status) {
            var map = {
                'Ativo': '<span style="font-size:10px;background:#28a745;color:#fff;padding:2px 6px;border-radius:3px;">✅ Ativo</span>',
                'Prenhe': '<span style="font-size:10px;background:#ffc107;color:#212529;padding:2px 6px;border-radius:3px;">🤰 Prenhe</span>',
                'Vendido': '<span style="font-size:10px;background:#17a2b8;color:#fff;padding:2px 6px;border-radius:3px;">💰 Vendido</span>',
                'Morto': '<span style="font-size:10px;background:#dc3545;color:#fff;padding:2px 6px;border-radius:3px;">💀 Morto</span>'
            };
            return map[status] || `<span style="font-size:10px;background:#6c757d;color:#fff;padding:2px 6px;border-radius:3px;">${status}</span>`;
        },

        _generatePagination: function(totalPaginas) {
            if (totalPaginas <= 1) return '';

            var current = this.state.paginaAtual;
            var html = '<div style="display:flex;gap:4px;justify-content:center;margin-top:12px;flex-wrap:wrap;">';
            
            for (var i = 1; i <= Math.min(totalPaginas, 7); i++) {
                var active = i === current ? 'btn-primary' : 'btn-secondary';
                html += `<button class="btn btn-sm ${active}" onclick="GR.Modules.Pecuaria._irPagina(${i})" style="font-size:10px;min-width:28px;">${i}</button>`;
            }
            
            if (totalPaginas > 7) {
                html += `<span style="padding:0 4px;color:#6c757d;">…</span>`;
                html += `<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Pecuaria._irPagina(${totalPaginas})" style="font-size:10px;min-width:28px;">${totalPaginas}</button>`;
            }

            html += '</div>';
            html += `<div style="text-align:center;font-size:10px;color:#6c757d;margin-top:4px;">Página ${current} de ${totalPaginas}</div>`;
            
            return html;
        },

        // ================================================================
        // EVENTOS
        // ================================================================
        _setupEventListeners: function() {
            document.addEventListener('GRStateChanged', function(e) {
                if (e.detail && e.detail.key === 'animais') {
                    this.render();
                }
            }.bind(this));

            document.addEventListener('GRPropriedadeChanged', function() {
                this.render();
            }.bind(this));
        },

        _initEventListeners: function() {
            var buscaInput = document.getElementById('busca-pecuaria');
            if (buscaInput) {
                buscaInput.oninput = function(e) {
                    this.state.filtroBusca = e.target.value;
                    var clearBtn = document.getElementById('busca-clear');
                    if (clearBtn) clearBtn.style.display = this.state.filtroBusca ? 'block' : 'none';
                    this.state.paginaAtual = 1;
                    this.render();
                }.bind(this);
            }

            var clearBtn = document.getElementById('busca-clear');
            if (clearBtn) {
                clearBtn.onclick = function() {
                    var input = document.getElementById('busca-pecuaria');
                    if (input) input.value = '';
                    this.state.filtroBusca = '';
                    clearBtn.style.display = 'none';
                    this.state.paginaAtual = 1;
                    this.render();
                }.bind(this);
            }

            var ordenacao = document.getElementById('ordenacao-pecuaria');
            if (ordenacao) {
                ordenacao.onchange = function(e) {
                    this.state.ordenacao = e.target.value;
                    this.render();
                }.bind(this);
            }
        },

        // ================================================================
        // AÇÕES DOS FILTROS
        // ================================================================
        _aplicarFiltroRapido: function(key) {
            this.state.filtroStatus = 'todos';
            this.state.filtroSexo = 'todos';
            this.state.paginaAtual = 1;

            if (key === 'Macho' || key === 'Fêmea') {
                this.state.filtroSexo = key;
            } else if (key !== 'todos') {
                this.state.filtroStatus = key;
            }

            this.render();
        },

        _limparFiltros: function() {
            this.state.filtroStatus = 'todos';
            this.state.filtroSexo = 'todos';
            this.state.filtroBusca = '';
            this.state.paginaAtual = 1;
            
            var input = document.getElementById('busca-pecuaria');
            if (input) input.value = '';
            
            var clearBtn = document.getElementById('busca-clear');
            if (clearBtn) clearBtn.style.display = 'none';
            
            this.render();
        },

        _irPagina: function(pagina) {
            this.state.paginaAtual = pagina;
            this.render();
        },

        // ================================================================
        // FUNÇÕES PRINCIPAIS
        // ================================================================
        abrirModal: function(editId) {
            console.log('📝 Abrindo modal para', editId ? 'editar' : 'novo', 'animal');
            
            try {
                if (GR && GR.State) {
                    GR.State.ui.animalEditando = editId || null;
                }

                var titleEl = document.getElementById('modal-animal-title');
                if (titleEl) titleEl.textContent = editId ? '✏️ Editar Animal' : '🐄 Novo Animal';

                var campos = ['animal-brinco', 'animal-nome', 'animal-raca', 'animal-data-nascimento', 'animal-obs'];
                campos.forEach(function(campo) {
                    var el = document.getElementById(campo);
                    if (el) el.value = '';
                });

                var sexoEl = document.getElementById('animal-sexo');
                if (sexoEl) sexoEl.value = 'Macho';
                
                var statusEl = document.getElementById('animal-status');
                if (statusEl) statusEl.value = 'Ativo';
                
                var valorEl = document.getElementById('animal-valor');
                if (valorEl) valorEl.value = '0,00';
                
                var prenhaEl = document.getElementById('animal-prenha');
                if (prenhaEl) prenhaEl.checked = false;

                if (editId) {
                    var animais = [];
                    try {
                        if (GR && GR.State && GR.State.data) {
                            animais = GR.State.data.animais || [];
                        }
                    } catch (e) {}
                    
                    var item = animais.find(function(a) { return a.id === editId; });
                    if (item) {
                        document.getElementById('animal-brinco').value = item.brinco || '';
                        document.getElementById('animal-nome').value = item.nome || '';
                        document.getElementById('animal-sexo').value = item.sexo || 'Macho';
                        document.getElementById('animal-raca').value = item.raca || '';
                        document.getElementById('animal-data-nascimento').value = item.dataNascimento || '';
                        document.getElementById('animal-status').value = item.status || 'Ativo';
                        document.getElementById('animal-valor').value = this._formatarMoedaSemSimbolo(item.valor || 0);
                        var propEl = document.getElementById('animal-propriedade');
                        if (propEl) propEl.value = item.propriedade || '';
                        document.getElementById('animal-obs').value = item.obs || '';
                        document.getElementById('animal-prenha').checked = item.prenha || false;
                    }
                }

                var modal = document.getElementById('modal-animal');
                if (modal) {
                    modal.style.display = 'flex';
                    modal.classList.add('active');
                } else {
                    alert('Modal não encontrado! Verifique se o elemento #modal-animal existe.');
                }
            } catch (e) {
                console.error('❌ Erro em abrirModal:', e);
                alert('Erro ao abrir modal: ' + e.message);
            }
        },

        salvar: function() {
            try {
                var brinco = document.getElementById('animal-brinco').value.trim();
                var nome = document.getElementById('animal-nome').value.trim();
                var sexo = document.getElementById('animal-sexo').value;
                var raca = document.getElementById('animal-raca').value.trim();
                var dataNascimento = document.getElementById('animal-data-nascimento').value;
                var status = document.getElementById('animal-status').value;
                var valor = this._parseMoedaBR(document.getElementById('animal-valor').value);
                var propriedade = document.getElementById('animal-propriedade').value;
                var obs = document.getElementById('animal-obs').value.trim();
                var prenha = document.getElementById('animal-prenha').checked;
                var editId = null;
                
                try {
                    if (GR && GR.State) {
                        editId = GR.State.ui.animalEditando;
                    }
                } catch (e) {}

                if (!brinco || !dataNascimento) {
                    alert('Brinco e data de nascimento são obrigatórios!');
                    return;
                }

                var user = null;
                try {
                    if (firebase && firebase.auth) {
                        user = firebase.auth().currentUser;
                    }
                } catch (e) {}

                if (!user) {
                    alert('Usuário não autenticado!');
                    return;
                }

                var uid = user.uid;
                var dados = {
                    brinco: this._escapeHtml(brinco),
                    nome: this._escapeHtml(nome),
                    sexo: sexo,
                    raca: this._escapeHtml(raca),
                    dataNascimento: dataNascimento,
                    status: status || 'Ativo',
                    valor: valor || 0,
                    propriedade: this._escapeHtml(propriedade),
                    obs: this._escapeHtml(obs),
                    prenha: prenha || false,
                    dataAtualizacao: new Date().toISOString()
                };

                if (prenha && status !== 'Prenhe' && sexo === 'Fêmea') {
                    dados.status = 'Prenhe';
                }

                var ref = db.collection('users').doc(uid).collection('animais');

                if (editId) {
                    ref.doc(editId).update(dados)
                        .then(function() {
                            GR.State.atualizarNoCache('animais', editId, dados);
                            this._closeModal('modal-animal');
                            alert('🐄 Animal atualizado!');
                            this._refreshView();
                        }.bind(this))
                        .catch(function(err) {
                            alert('Erro ao atualizar: ' + err.message);
                        }.bind(this));
                } else {
                    dados.dataCriacao = new Date().toISOString();
                    ref.add(dados)
                        .then(function(docRef) {
                            dados.id = docRef.id;
                            GR.State.inserirNoCache('animais', dados);
                            this._closeModal('modal-animal');
                            alert('🐄 Animal salvo!');
                            this._refreshView();
                        }.bind(this))
                        .catch(function(err) {
                            alert('Erro ao salvar: ' + err.message);
                        }.bind(this));
                }
            } catch (e) {
                console.error('❌ Erro em salvar:', e);
                alert('Erro ao salvar: ' + e.message);
            }
        },

        editar: function(id) {
            this.abrirModal(id);
        },

        excluir: function(id) {
            if (!confirm('⚠️ Tem certeza que deseja excluir este animal?\nEsta ação não pode ser desfeita!')) return;

            try {
                var user = firebase.auth().currentUser;
                if (!user) {
                    alert('Usuário não autenticado!');
                    return;
                }

                var uid = user.uid;
                db.collection('users').doc(uid).collection('animais').doc(id).delete()
                    .then(function() {
                        GR.State.removerDoCache('animais', id);
                        alert('🐄 Animal excluído!');
                        this._refreshView();
                    }.bind(this))
                    .catch(function(err) {
                        alert('Erro ao excluir: ' + err.message);
                    }.bind(this));
            } catch (e) {
                console.error('❌ Erro em excluir:', e);
                alert('Erro ao excluir: ' + e.message);
            }
        },

        registrarPrenha: function(id) {
            try {
                var animais = [];
                if (GR && GR.State && GR.State.data) {
                    animais = GR.State.data.animais || [];
                }
                
                var item = animais.find(function(a) { return a.id === id; });
                if (!item) {
                    alert('Animal não encontrado!');
                    return;
                }

                if (item.sexo === 'Macho') {
                    alert('⚠️ Apenas fêmeas podem ser registradas como prenhes!');
                    return;
                }

                var dataParto = prompt('Data estimada do parto (YYYY-MM-DD):', '');
                if (dataParto === null) return;

                var user = firebase.auth().currentUser;
                if (!user) {
                    alert('Usuário não autenticado!');
                    return;
                }

                var uid = user.uid;
                var dados = {
                    prenha: true,
                    status: 'Prenhe',
                    dataPartoEstimada: dataParto || null,
                    dataAtualizacao: new Date().toISOString()
                };

                db.collection('users').doc(uid).collection('animais').doc(id).update(dados)
                    .then(function() {
                        GR.State.atualizarNoCache('animais', id, dados);
                        alert('🤰 Prenha registrada com sucesso!');
                        this._refreshView();
                    }.bind(this))
                    .catch(function(err) {
                        alert('Erro ao registrar prenha: ' + err.message);
                    }.bind(this));
            } catch (e) {
                console.error('❌ Erro em registrarPrenha:', e);
                alert('Erro ao registrar prenha: ' + e.message);
            }
        },

        gerarRelatorio: function() {
            try {
                var items = this._getItems();
                items = this._applyFilters(items);
                
                var total = items.length;
                var machos = items.filter(function(a) { return a.sexo === 'Macho'; }).length;
                var femeas = items.filter(function(a) { return a.sexo === 'Fêmea'; }).length;
                var prenhes = items.filter(function(a) { return a.prenha === true; }).length;
                var ativos = items.filter(function(a) { return a.status === 'Ativo'; }).length;
                var vendidos = items.filter(function(a) { return a.status === 'Vendido'; }).length;
                var mortos = items.filter(function(a) { return a.status === 'Morto'; }).length;
                var valorTotal = items.reduce(function(sum, a) { return sum + (a.valor || 0); }, 0);

                var relatorio = `
📊 RELATÓRIO DO REBANHO
📅 ${new Date().toLocaleString('pt-BR')}
─────────────────────────────
🐄 Total de Animais: ${total}
  ♂️ Machos: ${machos}
  ♀️ Fêmeas: ${femeas}
  🤰 Prenhes: ${prenhes}
─────────────────────────────
📋 Status:
  ✅ Ativos: ${ativos}
  💰 Vendidos: ${vendidos}
  💀 Mortos: ${mortos}
─────────────────────────────
💰 Valor Total: R$ ${valorTotal.toFixed(2).replace('.', ',')}
📈 Média por Animal: ${total > 0 ? 'R$ ' + (valorTotal / total).toFixed(2).replace('.', ',') : 'R$ 0,00'}
`;

                alert(relatorio);
            } catch (e) {
                console.error('❌ Erro em gerarRelatorio:', e);
                alert('Erro ao gerar relatório: ' + e.message);
            }
        },

        exportarLista: function() {
            try {
                var items = this._getItems();
                items = this._applyFilters(items);
                
                var dados = {
                    exportadoEm: new Date().toLocaleString('pt-BR'),
                    total: items.length,
                    animais: items.map(function(a) {
                        return {
                            brinco: a.brinco,
                            nome: a.nome,
                            sexo: a.sexo,
                            raca: a.raca,
                            dataNascimento: a.dataNascimento,
                            status: a.status,
                            prenha: a.prenha || false,
                            valor: a.valor,
                            propriedade: a.propriedade,
                            obs: a.obs
                        };
                    })
                };

                var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'animais_export_' + new Date().toISOString().slice(0, 10) + '.json';
                a.click();
                URL.revokeObjectURL(url);

                alert('✅ Lista exportada!');
            } catch (e) {
                console.error('❌ Erro em exportarLista:', e);
                alert('Erro ao exportar: ' + e.message);
            }
        },

        // ================================================================
        // PESAGEM
        // ================================================================
        abrirModalPesagem: function() {
            var modal = document.getElementById('modal-pesagem');
            if (!modal) { alert('Modal de pesagem não encontrado!'); return; }
            document.getElementById('pesagem-data').value = new Date().toISOString().split('T')[0];
            document.getElementById('pesagem-peso').value = '';
            document.getElementById('pesagem-obs').value = '';
            var select = document.getElementById('pesagem-animal');
            select.innerHTML = '<option value="">Selecione um animal</option>';
            try {
                var animais = (GR.State.data.animais || []).filter(function(a) { return a.status === 'Ativo' || a.status === 'Prenhe'; });
                animais.sort(function(a, b) { return (a.brinco || a.nome || '').localeCompare(b.brinco || b.nome || ''); });
                animais.forEach(function(a) {
                    var opt = document.createElement('option');
                    opt.value = a.id;
                    opt.textContent = (a.brinco || '') + ' - ' + (a.nome || '');
                    select.appendChild(opt);
                });
            } catch (e) { console.warn('Erro ao carregar animais:', e); }
            GR.Modal.open('modal-pesagem');
        },

        salvarPesagem: function() {
            var animalId = document.getElementById('pesagem-animal').value;
            var data = document.getElementById('pesagem-data').value;
            var peso = parseFloat(document.getElementById('pesagem-peso').value);
            var obs = document.getElementById('pesagem-obs').value.trim();
            if (!animalId || !data || !peso) { alert('Animal, data e peso são obrigatórios!'); return; }
            var user = firebase.auth().currentUser;
            if (!user) { alert('Usuário não autenticado!'); return; }
            var uid = user.uid;
            var dados = { data: data, peso: peso, obs: this._escapeHtml(obs), dataCriacao: new Date().toISOString() };
            db.collection('users').doc(uid).collection('animais').doc(animalId).collection('pesagens').add(dados)
                .then(function() {
                    GR.Modal.close('modal-pesagem');
                    alert('✅ Pesagem registrada!');
                })
                .catch(function(err) { alert('Erro: ' + err.message); });
        },

        // ================================================================
        // VACINA
        // ================================================================
        abrirModalVacina: function() {
            var modal = document.getElementById('modal-vacina');
            if (!modal) { alert('Modal de vacinação não encontrado!'); return; }
            document.getElementById('vacina-nome').value = '';
            document.getElementById('vacina-data').value = new Date().toISOString().split('T')[0];
            document.getElementById('vacina-proxima').value = '';
            document.getElementById('vacina-lote').value = '';
            var select = document.getElementById('vacina-animal');
            select.innerHTML = '<option value="">Selecione um animal</option>';
            try {
                var animais = (GR.State.data.animais || []).filter(function(a) { return a.status === 'Ativo' || a.status === 'Prenhe'; });
                animais.sort(function(a, b) { return (a.brinco || a.nome || '').localeCompare(b.brinco || b.nome || ''); });
                animais.forEach(function(a) {
                    var opt = document.createElement('option');
                    opt.value = a.id;
                    opt.textContent = (a.brinco || '') + ' - ' + (a.nome || '');
                    select.appendChild(opt);
                });
            } catch (e) { console.warn('Erro ao carregar animais:', e); }
            GR.Modal.open('modal-vacina');
        },

        salvarVacina: function() {
            var animalId = document.getElementById('vacina-animal').value;
            var nome = document.getElementById('vacina-nome').value.trim();
            var data = document.getElementById('vacina-data').value;
            var proxima = document.getElementById('vacina-proxima').value;
            var lote = document.getElementById('vacina-lote').value.trim();
            if (!animalId || !nome || !data) { alert('Animal, vacina e data são obrigatórios!'); return; }
            var user = firebase.auth().currentUser;
            if (!user) { alert('Usuário não autenticado!'); return; }
            var uid = user.uid;
            var dados = {
                vacina: this._escapeHtml(nome), data: data,
                proximaDose: proxima || '', lote: this._escapeHtml(lote),
                dataCriacao: new Date().toISOString()
            };
            db.collection('users').doc(uid).collection('animais').doc(animalId).collection('vacinas').add(dados)
                .then(function() {
                    GR.Modal.close('modal-vacina');
                    alert('✅ Vacinação registrada!');
                })
                .catch(function(err) { alert('Erro: ' + err.message); });
        },

        // ================================================================
        // UTILIDADES
        // ================================================================
        _escapeHtml: function(str) {
            if (!str) return '';
            var div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        _formatarDataBR: function(data) {
            if (!data) return '-';
            try {
                var d = new Date(data);
                return d.toLocaleDateString('pt-BR');
            } catch (e) {
                return data;
            }
        },

        _calcularIdade: function(dataNascimento) {
            if (!dataNascimento) return '-';
            try {
                var nasc = new Date(dataNascimento);
                var hoje = new Date();
                var diff = hoje - nasc;
                var anos = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                var meses = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
                if (anos > 0) {
                    return anos + 'a ' + meses + 'm';
                }
                return meses + 'm';
            } catch (e) {
                return '-';
            }
        },

        _formatarMoedaSemSimbolo: function(valor) {
            return (valor || 0).toFixed(2).replace('.', ',');
        },

        _parseMoedaBR: function(valor) {
            if (!valor) return 0;
            var num = valor.replace(/[R$\s.]/g, '').replace(',', '.');
            return parseFloat(num) || 0;
        },

        _closeModal: function(id) {
            try {
                var modal = document.getElementById(id);
                if (modal) {
                    modal.style.display = 'none';
                    modal.classList.remove('active');
                }
            } catch (e) {}
        },

        _refreshView: function() {
            try {
                if (GR && GR.UI && GR.UI.refreshCurrentView) {
                    GR.UI.refreshCurrentView();
                } else {
                    this.render();
                }
            } catch (e) {
                this.render();
            }
        },

        _startDashboardRefresh: function() {
            if (this.state.dashboardTimer) {
                clearInterval(this.state.dashboardTimer);
            }
            this.state.dashboardTimer = setInterval(function() {
                if (document.getElementById('lista-animais')) {
                    this.render();
                }
            }.bind(this), this.config.DASHBOARD_REFRESH_INTERVAL);
        },

        _stopDashboardRefresh: function() {
            if (this.state.dashboardTimer) {
                clearInterval(this.state.dashboardTimer);
                this.state.dashboardTimer = null;
            }
        },

        // ================================================================
        // ALIASES
        // ================================================================
        abrirModalAnimal: function(editId) { return this.abrirModal(editId); },
        editarAnimal: function(id) { return this.editar(id); },
        salvarAnimal: function() { return this.salvar(); },
        excluirAnimal: function(id) { return this.excluir(id); },
        registrarPrenhaAnimal: function(id) { return this.registrarPrenha(id); },
        renderizar: function() { return this.render(); },
        renderAnimais: function() { return this.render(); },
        abrirModalPesagemAnimal: function() { return this.abrirModalPesagem(); },
        abrirModalVacinaAnimal: function() { return this.abrirModalVacina(); },
        salvarPesagemAnimal: function() { return this.salvarPesagem(); },
        salvarVacinaAnimal: function() { return this.salvarVacina(); },

        destroy: function() {
            this._stopDashboardRefresh();
            this._inicializado = false;
            console.log('🧹 Módulo Pecuária destruído');
        }
    };

    // ================================================================
    // REGISTRA O MÓDULO
    // ================================================================
    GR.Modules.Pecuaria = Pecuaria;
    window.PecuariaModule = Pecuaria;

    // ================================================================
    // FALLBACK GLOBAL
    // ================================================================
    window.abrirModalAnimal = function(editId) {
        if (GR && GR.Modules && GR.Modules.Pecuaria) {
            if (typeof GR.Modules.Pecuaria.abrirModalAnimal === 'function') {
                return GR.Modules.Pecuaria.abrirModalAnimal(editId);
            } else if (typeof GR.Modules.Pecuaria.abrirModal === 'function') {
                return GR.Modules.Pecuaria.abrirModal(editId);
            }
        }
        if (window.PecuariaModule) {
            return window.PecuariaModule.abrirModal(editId);
        }
        console.error('❌ Módulo Pecuária não disponível!');
        alert('Módulo de pecuária não disponível. Recarregue a página.');
    };

    window.abrirModalPesagem = function() {
        if (GR && GR.Modules && GR.Modules.Pecuaria && typeof GR.Modules.Pecuaria.abrirModalPesagem === 'function') {
            return GR.Modules.Pecuaria.abrirModalPesagem();
        }
        if (window.PecuariaModule) return window.PecuariaModule.abrirModalPesagem();
        console.error('❌ Pesagem não disponível');
    };

    window.abrirModalVacina = function() {
        if (GR && GR.Modules && GR.Modules.Pecuaria && typeof GR.Modules.Pecuaria.abrirModalVacina === 'function') {
            return GR.Modules.Pecuaria.abrirModalVacina();
        }
        if (window.PecuariaModule) return window.PecuariaModule.abrirModalVacina();
        console.error('❌ Vacina não disponível');
    };

    // ================================================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ================================================================
    function inicializarPecuaria() {
        try {
            if (GR && GR.Modules && GR.Modules.Pecuaria) {
                if (!GR.Modules.Pecuaria._inicializado) {
                    GR.Modules.Pecuaria.init();
                }
            } else if (window.PecuariaModule && !window.PecuariaModule._inicializado) {
                window.PecuariaModule.init();
            }
        } catch (e) {
            console.error('❌ Erro ao inicializar pecuária:', e);
        }
    }

    setTimeout(inicializarPecuaria, 50);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(inicializarPecuaria, 100);
        });
    }

    console.log('✅ Módulo Pecuária v5.0 carregado!');
    console.log('📌 Funções: abrirModal, abrirModalAnimal, abrirModalPesagem, abrirModalVacina, editar, salvar, salvarPesagem, salvarVacina, excluir, registrarPrenha');
})();