// ================================================================
// MÓDULO: VIVEIRO - SISTEMA COMPLETO COM PERMISSÕES
// ================================================================
// Controle de acesso por usuário/perfil
// Produção, Vendas e Livro Caixa
// ================================================================

GR.Modules.Viveiro = {
    // ================================================================
    // 🆕 PROPRIEDADE ATIVA DO MÓDULO VIVEIRO (GLOBAL)
    // ================================================================
    _propriedadeAtiva: null,

    // ================================================================
    // 🆕 OBTER PROPRIEDADE ATIVA DO VIVEIRO
    // ================================================================
    getPropriedadeAtiva: function() {
        if (this._propriedadeAtiva === null) {
            try {
                var saved = localStorage.getItem('viveiro_propriedade_ativa');
                if (saved && saved !== 'null' && saved !== 'undefined' && saved !== '') {
                    this._propriedadeAtiva = saved;
                }
            } catch(e) {}
            
            if (!this._propriedadeAtiva || this._propriedadeAtiva === '' || this._propriedadeAtiva === 'null') {
                var props = GR.State.data.propriedades || [];
                if (props.length > 0) {
                    this._propriedadeAtiva = props[0].nome;
                } else {
                    this._propriedadeAtiva = 'todas';
                }
                try {
                    localStorage.setItem('viveiro_propriedade_ativa', this._propriedadeAtiva);
                } catch(e) {}
            }
        }
        return this._propriedadeAtiva;
    },

    // ================================================================
    // 🆕 DEFINIR PROPRIEDADE ATIVA DO VIVEIRO
    // ================================================================
    setPropriedadeAtiva: function(propriedade) {
        this._propriedadeAtiva = propriedade || 'todas';
        try {
            localStorage.setItem('viveiro_propriedade_ativa', this._propriedadeAtiva);
        } catch(e) {}
        console.log('📌 Propriedade do Viveiro alterada para:', this._propriedadeAtiva);
        
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('viveiro-propriedade-alterada', {
                detail: { propriedade: this._propriedadeAtiva }
            }));
        }
        
        this.render();
    },

    // ================================================================
    // 🆕 GERAR SELECT DE PROPRIEDADES DO VIVEIRO (COM PERMISSÃO)
    // ================================================================
    _gerarSelectPropriedades: function() {
        var podeAlterar = this._temPermissao('alterar_propriedade') || 
                           this._temPermissao('viveiro_alterar_propriedade');
        var propAtual = this.getPropriedadeAtiva();
        var propriedades = GR.State.data.propriedades || [];
        
        if (!podeAlterar) {
            var displayName = propAtual === 'todas' ? '🌍 Todas' : propAtual;
            return `
                <div style="display:flex;align-items:center;gap:6px;background:var(--bg);padding:4px 10px;border-radius:6px;border:1px solid var(--border);">
                    <span style="font-size:11px;font-weight:600;color:var(--text-light);">📍</span>
                    <span style="font-size:12px;font-weight:600;color:var(--primary);">${displayName}</span>
                    <span style="font-size:9px;color:var(--text-light);font-style:italic;">🔒</span>
                </div>
            `;
        }
        
        var options = propriedades.map(function(p) {
            return `<option value="${p.nome}" ${propAtual === p.nome ? 'selected' : ''}>${p.nome}</option>`;
        }).join('');
        
        return `
            <div style="display:flex;align-items:center;gap:6px;background:var(--bg);padding:4px 10px;border-radius:6px;border:1px solid var(--border);">
                <span style="font-size:11px;font-weight:600;color:var(--text-light);">📍</span>
                <select id="viveiro-propriedade-select" 
                        style="font-size:12px;padding:4px 8px;border-radius:4px;border:1px solid var(--border);background:var(--bg);color:var(--text);cursor:pointer;max-width:200px;"
                        onchange="GR.Modules.Viveiro.setPropriedadeAtiva(this.value)">
                    <option value="todas" ${propAtual === 'todas' ? 'selected' : ''}>🌍 Todas</option>
                    ${options}
                </select>
            </div>
        `;
    },

    // ================================================================
    // 🆕 QUANDO A PROPRIEDADE FOR ALTERADA
    // ================================================================
    _onPropriedadeChange: function(valor) {
        this.setPropriedadeAtiva(valor);
        GR.Toast.info('📍 Viveiro filtrando por: ' + (valor === 'todas' ? 'Todas as propriedades' : valor));
    },

    // ================================================================
    // CONFIGURAÇÃO DE PERMISSÕES (LEGADO - MANTIDO PARA COMPATIBILIDADE)
    // ================================================================
    _permissoes: {
        'master': {
            producao: true,
            vendas: true,
            caixa: true,
            relatorios: true,
            exportar: true,
            excluir: true,
            editar: true,
            criar: true,
            alterar_propriedade: true
        },
        'admin': {
            producao: true,
            vendas: true,
            caixa: true,
            relatorios: true,
            exportar: true,
            excluir: true,
            editar: true,
            criar: true,
            alterar_propriedade: true
        },
        'gerente': {
            producao: true,
            vendas: true,
            caixa: true,
            relatorios: true,
            exportar: true,
            excluir: false,
            editar: true,
            criar: true,
            alterar_propriedade: false
        },
        'operador': {
            producao: true,
            vendas: false,
            caixa: false,
            relatorios: false,
            exportar: false,
            excluir: false,
            editar: true,
            criar: true,
            alterar_propriedade: false
        },
        'visitante': {
            producao: true,
            vendas: false,
            caixa: false,
            relatorios: false,
            exportar: false,
            excluir: false,
            editar: false,
            criar: false,
            alterar_propriedade: false
        }
    },

    // ================================================================
    // VERIFICAR PERMISSÃO DO USUÁRIO (INTEGRADO COM PERFIS)
    // ================================================================
    _temPermissao: function(permissao) {
        if (GR.Modules && GR.Modules.Perfis && GR.Modules.Perfis.perfilAtual) {
            var perfil = GR.Modules.Perfis.perfilAtual;
            var mapa = {
                'producao': 'viveiro_producao',
                'vendas': 'viveiro_vendas',
                'caixa': 'viveiro_caixa',
                'relatorios': 'viveiro_relatorios',
                'exportar': 'viveiro_exportar',
                'excluir': 'viveiro_excluir',
                'editar': 'viveiro_editar',
                'criar': 'viveiro_criar',
                'alterar_propriedade': 'viveiro_alterar_propriedade'
            };
            var novaPermissao = mapa[permissao] || permissao;
            if (perfil.permissoes && perfil.permissoes[novaPermissao] !== undefined) {
                return perfil.permissoes[novaPermissao] === true;
            }
        }

        var perfilId = 'visitante';
        if (GR.Modules && GR.Modules.Perfis && GR.Modules.Perfis.perfilAtual) {
            perfilId = GR.Modules.Perfis.perfilAtual.id;
        }
        if (!perfilId || perfilId === 'visitante') {
            var user = firebase.auth().currentUser;
            if (user && user.email === 'roqueep@gmail.com') {
                perfilId = 'master';
            }
        }
        var permissoes = this._permissoes[perfilId] || this._permissoes['visitante'];
        return permissoes[permissao] === true;
    },

    // ================================================================
    // OBTER PERFIL DO USUÁRIO
    // ================================================================
    _getPerfilUsuario: function() {
        var perfilId = 'visitante';
        var perfilNome = '👤 Visitante';
        
        if (GR.Modules && GR.Modules.Perfis && GR.Modules.Perfis.perfilAtual) {
            perfilId = GR.Modules.Perfis.perfilAtual.id;
            perfilNome = GR.Modules.Perfis.perfilAtual.nome || perfilId;
        }
        
        if (!perfilId || perfilId === 'visitante') {
            var user = firebase.auth().currentUser;
            if (user && user.email === 'roqueep@gmail.com') {
                perfilId = 'master';
                perfilNome = '👑 Master';
            }
        }
        return { id: perfilId, nome: perfilNome };
    },

    // ================================================================
    // RENDER PRINCIPAL - INTERFACE MODERNA COM PROPRIEDADE GLOBAL
    // ================================================================
    render: function() {
        var div = document.getElementById('viveiro-content');
        if (!div) return;

        var propViveiro = this.getPropriedadeAtiva();

        var podeVerProducao = this._temPermissao('producao');
        var podeVerVendas = this._temPermissao('vendas');
        var podeVerCaixa = this._temPermissao('caixa');
        var podeVerRelatorios = this._temPermissao('relatorios');
        var podeExportar = this._temPermissao('exportar');
        var podeCriar = this._temPermissao('criar');
        var podeEditar = this._temPermissao('editar');
        var podeExcluir = this._temPermissao('excluir');
        var podeAlterarProp = this._temPermissao('alterar_propriedade');

        var permissoesGranulares = {
            verProducao: podeVerProducao,
            criarMuda: podeCriar,
            editarMuda: podeEditar,
            excluirMuda: podeExcluir,
            criarInsumo: podeCriar,
            editarInsumo: podeEditar,
            excluirInsumo: podeExcluir,
            criarServico: podeCriar,
            editarServico: podeEditar,
            excluirServico: podeExcluir,
            criarTrabalhador: podeCriar,
            editarTrabalhador: podeEditar,
            excluirTrabalhador: podeExcluir,
            verVendas: podeVerVendas,
            criarVenda: podeCriar && podeVerVendas,
            editarVenda: podeEditar && podeVerVendas,
            excluirVenda: podeExcluir && podeVerVendas,
            emitirNFProdutor: podeVerVendas,
            verCaixa: podeVerCaixa,
            criarLancamento: podeCriar && podeVerCaixa,
            editarLancamento: podeEditar && podeVerCaixa,
            excluirLancamento: podeExcluir && podeVerCaixa,
            verRelatorios: podeVerRelatorios,
            exportarDados: podeExportar,
            gerenciarPermissoes: false,
            alterarPropriedade: podeAlterarProp
        };

        var perfil = this._getPerfilUsuario();

        var mudas = (GR.State.data.viveiroMudas || []).filter(function(item) {
            return propViveiro === 'todas' || item.propriedade === propViveiro;
        });
        var insumos = (GR.State.data.viveiroInsumos || []).filter(function(item) {
            return propViveiro === 'todas' || item.propriedade === propViveiro;
        });
        var servicos = (GR.State.data.viveiroServicos || []).filter(function(item) {
            return propViveiro === 'todas' || item.propriedade === propViveiro;
        });
        var trabalhadores = (GR.State.data.viveiroTrabalhadores || []).filter(function(item) {
            return propViveiro === 'todas' || item.propriedade === propViveiro;
        });
        var vendas = (GR.State.data.viveiroVendas || []).filter(function(item) {
            return propViveiro === 'todas' || item.propriedade === propViveiro;
        });
        var caixa = (GR.State.data.viveiroCaixa || []).filter(function(item) {
            return propViveiro === 'todas' || item.propriedade === propViveiro;
        });
        var pedidos = (GR.State.data.viveiroPedidos || []).filter(function(item) {
            return propViveiro === 'todas' || item.propriedade === propViveiro;
        });
        var variedades = (GR.State.data.viveiroVariedades || []).filter(function(item) {
            return propViveiro === 'todas' || item.propriedade === propViveiro;
        });

        var totalMudas = mudas.length;
        var totalMudasQtd = mudas.reduce(function(sum, m) { return sum + (m.quantidade || 0); }, 0);
        var mudasProntas = mudas.filter(function(m) { return m.status === 'Pronta'; });
        var mudasProducao = mudas.filter(function(m) { return m.status === 'Produção'; });
        var mudasDescartadas = mudas.filter(function(m) { return m.status === 'Descartada'; });
        var mudasVendidas = mudas.filter(function(m) { return m.status === 'Vendida'; });
        var totalInsumos = insumos.length;
        var totalServicos = servicos.length;
        var totalTrabalhadores = trabalhadores.length;
        var totalVendas = vendas.length;
        var totalVendasQtd = vendas.reduce(function(sum, v) { return sum + (v.quantidade || 0); }, 0);
        var totalReceitas = vendas.reduce(function(sum, v) { return sum + (v.valorTotal || 0); }, 0);
        var totalDespesas = caixa.reduce(function(sum, c) { return c.tipo === 'despesa' ? sum + (c.valor || 0) : sum; }, 0);
        var saldo = totalReceitas - totalDespesas;
        var totalPedidos = pedidos.length;
        var totalVariedades = variedades.length;

        // Gera botões de produção
        var botoesProducao = '';
        if (permissoesGranulares.criarMuda) {
            botoesProducao += `<button class="btn btn-sm btn-success" onclick="GR.Modules.Viveiro.abrirModalMuda()" style="font-size:10px;padding:4px 10px;">🌱 Nova Muda</button>`;
        }
        if (permissoesGranulares.criarInsumo) {
            botoesProducao += `<button class="btn btn-sm btn-info" onclick="GR.Modules.Viveiro.abrirModalInsumo()" style="font-size:10px;padding:4px 10px;">📦 Insumo</button>`;
        }
        if (permissoesGranulares.criarServico) {
            botoesProducao += `<button class="btn btn-sm btn-warning" onclick="GR.Modules.Viveiro.abrirModalServico()" style="font-size:10px;padding:4px 10px;">🔧 Serviço</button>`;
        }
        if (permissoesGranulares.criarTrabalhador) {
            botoesProducao += `<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro.abrirModalTrabalhador()" style="font-size:10px;padding:4px 10px;">👨‍🌾 Mão de Obra</button>`;
        }
        if (permissoesGranulares.criarMuda) {
            botoesProducao += `<button class="btn btn-sm btn-info" onclick="GR.Modules.Viveiro.abrirModalVariedade()" style="font-size:10px;padding:4px 10px;">🌱 Variedade</button>`;
        }

        if (!botoesProducao) {
            botoesProducao = `<span style="font-size:10px;color:var(--text-light);">👁️ Visualização apenas</span>`;
        }

        // Gera botões comerciais
        var botoesComerciais = '';
        if (permissoesGranulares.criarVenda) {
            botoesComerciais += `<button class="btn btn-sm btn-primary" onclick="GR.Modules.Viveiro.abrirModalVenda()" style="font-size:10px;padding:4px 10px;">💰 Nova Venda</button>`;
        }
        if (permissoesGranulares.criarMuda) {
            botoesComerciais += `<button class="btn btn-sm btn-success" onclick="GR.Modules.Viveiro.abrirModalPedido()" style="font-size:10px;padding:4px 10px;">📋 Novo Pedido</button>`;
        }
        if (permissoesGranulares.emitirNFProdutor) {
            botoesComerciais += `<button class="btn btn-sm btn-info" onclick="GR.Modules.Viveiro._gerarNFProdutor()" style="font-size:10px;padding:4px 10px;">📄 NF Produtor</button>`;
        }
        if (permissoesGranulares.verVendas) {
            botoesComerciais += `<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro._mostrarSubAba('viveiro-vendas')" style="font-size:10px;padding:4px 10px;">📋 Ver Vendas</button>`;
        }

        if (!botoesComerciais) {
            botoesComerciais = `<span style="font-size:10px;color:var(--text-light);">👁️ Visualização apenas</span>`;
        }

        // BOTÕES FINANCEIROS
        var botoesFinanceiros = '';
        if (permissoesGranulares.criarLancamento) {
            botoesFinanceiros += `<button class="btn btn-sm btn-primary" onclick="GR.Modules.Viveiro.abrirModalLancamento()" style="font-size:10px;padding:3px 10px;">➕ Lançar</button>`;
        }
        if (permissoesGranulares.verCaixa) {
            botoesFinanceiros += `<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro._mostrarSubAba('viveiro-caixa')" style="font-size:10px;padding:3px 10px;">📋 Ver todos</button>`;
        }

        // Dashboard de mudas por variedade
        var variedadesMudas = {};
        var totalPorVariedade = {};
        mudas.forEach(function(m) {
            var key = m.variedade || 'Não especificada';
            if (!variedadesMudas[key]) {
                variedadesMudas[key] = [];
            }
            variedadesMudas[key].push(m);
            totalPorVariedade[key] = (totalPorVariedade[key] || 0) + (m.quantidade || 0);
        });

        var dashboardMudasHtml = '';
        if (Object.keys(variedadesMudas).length > 0) {
            dashboardMudasHtml = `
                <div class="card" style="padding:12px;margin-bottom:16px;border-left:4px solid #4CAF50;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                        <h5 style="font-size:13px;margin:0;">📊 Mudas por Variedade e Idade</h5>
                        <span style="font-size:10px;color:var(--text-light);">${Object.keys(variedadesMudas).length} variedades ativas</span>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;">
                        ${Object.keys(variedadesMudas).map(function(variedade) {
                            var mudasDaVariedade = variedadesMudas[variedade];
                            var total = totalPorVariedade[variedade] || 0;
                            var prontas = mudasDaVariedade.filter(function(m) { return m.status === 'Pronta'; }).reduce(function(s, m) { return s + (m.quantidade || 0); }, 0);
                            var emProducao = mudasDaVariedade.filter(function(m) { return m.status === 'Produção'; }).reduce(function(s, m) { return s + (m.quantidade || 0); }, 0);
                            var vendidas = mudasDaVariedade.filter(function(m) { return m.status === 'Vendida'; }).reduce(function(s, m) { return s + (m.quantidade || 0); }, 0);
                            var descartadas = mudasDaVariedade.filter(function(m) { return m.status === 'Descartada'; }).reduce(function(s, m) { return s + (m.quantidade || 0); }, 0);
                            
                            var idadeMedia = 0;
                            var contagem = 0;
                            mudasDaVariedade.forEach(function(m) {
                                if (m.dataProducao) {
                                    var dias = Math.floor((new Date() - new Date(m.dataProducao)) / (1000 * 60 * 60 * 24));
                                    idadeMedia += dias;
                                    contagem++;
                                }
                            });
                            idadeMedia = contagem > 0 ? Math.round(idadeMedia / contagem) : 0;
                            
                            var statusHtml = '';
                            if (prontas > 0) {
                                statusHtml += `<span style="color:#4CAF50;font-weight:600;">✅ ${prontas} prontas</span>`;
                            }
                            if (emProducao > 0) {
                                if (statusHtml) statusHtml += ' | ';
                                statusHtml += `<span style="color:#FF9800;font-weight:600;">⏳ ${emProducao} em produção</span>`;
                            }
                            if (vendidas > 0) {
                                if (statusHtml) statusHtml += ' | ';
                                statusHtml += `<span style="color:#2196F3;font-weight:600;">💰 ${vendidas} vendidas</span>`;
                            }
                            if (descartadas > 0) {
                                if (statusHtml) statusHtml += ' | ';
                                statusHtml += `<span style="color:#f44336;font-weight:600;">🗑️ ${descartadas} descartadas</span>`;
                            }
                            if (!statusHtml) {
                                statusHtml = '<span style="color:#999;">Nenhuma muda ativa</span>';
                            }
                            
                            var botaoProntas = '';
                            if (emProducao > 0 && permissoesGranulares.editarMuda) {
                                botaoProntas = `
                                    <button class="btn btn-sm btn-success" onclick="GR.Modules.Viveiro._marcarTodasProntas('${GR.Utils.escapeHtml(variedade)}')" style="font-size:8px;padding:2px 8px;margin-top:4px;" title="Marcar todas as mudas desta variedade como prontas">
                                        ✅ Marcar todas como Prontas
                                    </button>
                                `;
                            }
                            
                            return `
                                <div style="background:var(--bg);padding:10px;border-radius:6px;border:1px solid var(--border-light);">
                                    <div style="font-weight:700;font-size:14px;color:#2e7d32;">${GR.Utils.escapeHtml(variedade)}</div>
                                    <div style="font-size:11px;color:var(--text-light);">
                                        <div>🌱 Total: <strong>${total}</strong> mudas</div>
                                        <div>📅 Idade média: <strong>${idadeMedia} dias</strong></div>
                                        <div>${statusHtml}</div>
                                        ${botaoProntas}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else {
            dashboardMudasHtml = `
                <div class="card" style="padding:12px;margin-bottom:16px;border-left:4px solid #FF9800;">
                    <h5 style="font-size:13px;margin:0 0 8px 0;">📊 Mudas por Variedade</h5>
                    <div style="font-size:11px;color:var(--text-light);text-align:center;padding:10px;">
                        🌱 Nenhuma muda cadastrada. Cadastre mudas para ver o dashboard.
                    </div>
                </div>
            `;
        }

        // Dashboard de pedidos
        var dashboardPedidosHtml = '';
        var pedidosPendentes = pedidos.filter(function(p) { return p.status === 'Pendente' || p.status === 'Confirmado'; });
        if (pedidosPendentes.length > 0 && permissoesGranulares.verVendas) {
            dashboardPedidosHtml = `
                <div class="card" style="padding:12px;margin-bottom:16px;border-left:4px solid #2196F3;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                        <h5 style="font-size:13px;margin:0;">📋 Pedidos Pendentes</h5>
                        <span style="font-size:10px;color:var(--text-light);">${pedidosPendentes.length} aguardando</span>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:6px;">
                        ${pedidosPendentes.slice(0, 5).map(function(p) {
                            return `
                                <div style="background:var(--bg);padding:8px;border-radius:4px;border-left:3px solid #2196F3;font-size:10px;">
                                    <div style="font-weight:600;">${GR.Utils.escapeHtml(p.cliente)}</div>
                                    <div>${GR.Utils.escapeHtml(p.variedade)} - ${p.quantidade} un</div>
                                    <div style="color:var(--text-light);font-size:9px;">Status: ${p.status}</div>
                                    <div style="margin-top:4px;">
                                        <button class="btn btn-sm btn-success" onclick="GR.Modules.Viveiro.abrirConverterPedido('${p.id}')" style="font-size:8px;padding:2px 6px;">🔄 Converter</button>
                                        <button class="btn btn-sm btn-primary" onclick="GR.Modules.Viveiro.abrirModalPedido('${p.id}')" style="font-size:8px;padding:2px 6px;">✏️</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        ${pedidosPendentes.length > 5 ? `<div style="font-size:10px;color:var(--text-light);padding:8px;">+ ${pedidosPendentes.length - 5} mais...</div>` : ''}
                    </div>
                </div>
            `;
        }

        var html = `
            <!-- TOPO -->
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px;padding:10px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:20px;">🌱</span>
                    <span style="font-size:15px;font-weight:700;">Viveiro</span>
                    ${this._gerarSelectPropriedades()}
                </div>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                    <span style="font-size:10px;background:var(--primary);color:#fff;padding:3px 12px;border-radius:12px;font-weight:600;">${perfil.nome}</span>
                    <button class="btn btn-sm btn-info" onclick="GR.Modules.Viveiro._atualizarDados()" style="font-size:10px;padding:4px 12px;" title="Atualizar dados">
                        🔄
                    </button>
                </div>
            </div>

            <!-- STATS -->
            <div class="stats-grid" style="margin-bottom:16px;">
                <div class="stats-card" style="border-left-color:var(--success);">
                    <div class="number" style="font-size:18px;">${totalMudasQtd}</div>
                    <div class="label" style="font-size:10px;">🌱 Mudas (${totalMudas} lotes)</div>
                </div>
                <div class="stats-card" style="border-left-color:#4CAF50;">
                    <div class="number" style="font-size:18px;color:#4CAF50;">${mudasProntas.length}</div>
                    <div class="label" style="font-size:10px;">✅ Prontas</div>
                </div>
                <div class="stats-card" style="border-left-color:var(--warning);">
                    <div class="number" style="font-size:18px;color:var(--warning);">${mudasProducao.length}</div>
                    <div class="label" style="font-size:10px;">⏳ Produção</div>
                </div>
                <div class="stats-card" style="border-left-color:var(--danger);">
                    <div class="number" style="font-size:18px;color:var(--danger);">${mudasDescartadas.length}</div>
                    <div class="label" style="font-size:10px;">🗑️ Descartadas</div>
                </div>
                <div class="stats-card" style="border-left-color:var(--info);">
                    <div class="number" style="font-size:18px;color:var(--info);">${mudasVendidas.length}</div>
                    <div class="label" style="font-size:10px;">💰 Vendidas</div>
                </div>
                <div class="stats-card" style="border-left-color:var(--primary);">
                    <div class="number" style="font-size:18px;color:var(--primary);">${GR.Utils.formatarMoedaBR(saldo)}</div>
                    <div class="label" style="font-size:10px;">💰 Saldo</div>
                </div>
            </div>

            ${dashboardMudasHtml}
            ${dashboardPedidosHtml}

            <!-- CARDS PRODUÇÃO E COMERCIAL -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                <div class="card" style="padding:0;overflow:hidden;border-top:4px solid #4CAF50;">
                    <div style="padding:12px 16px;background:linear-gradient(135deg, #e8f5e9, #c8e6c9);border-bottom:1px solid var(--border);">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-size:15px;font-weight:700;color:#2e7d32;">🌱 Produção</span>
                            <span style="font-size:11px;color:#555;">${totalMudasQtd} mudas</span>
                        </div>
                    </div>
                    <div style="padding:12px 16px;">
                        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;">
                            ${botoesProducao}
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;">
                            <div style="background:var(--bg);padding:6px 10px;border-radius:4px;border-left:3px solid #4CAF50;">
                                <span style="color:var(--text-light);">Total Mudas</span>
                                <div style="font-weight:700;font-size:14px;">${totalMudasQtd}</div>
                            </div>
                            <div style="background:var(--bg);padding:6px 10px;border-radius:4px;border-left:3px solid #FF9800;">
                                <span style="color:var(--text-light);">Insumos</span>
                                <div style="font-weight:700;font-size:14px;">${totalInsumos}</div>
                            </div>
                            <div style="background:var(--bg);padding:6px 10px;border-radius:4px;border-left:3px solid #9C27B0;">
                                <span style="color:var(--text-light);">Mão de Obra</span>
                                <div style="font-weight:700;font-size:14px;">${totalTrabalhadores}</div>
                            </div>
                            <div style="background:var(--bg);padding:6px 10px;border-radius:4px;border-left:3px solid #f44336;">
                                <span style="color:var(--text-light);">Descartadas</span>
                                <div style="font-weight:700;font-size:14px;color:#f44336;">${mudasDescartadas.length}</div>
                            </div>
                        </div>
                        <div style="margin-top:10px;border-top:1px solid var(--border-light);padding-top:8px;">
                            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-light);margin-bottom:4px;">
                                <span>📋 Últimas mudas</span>
                                <button class="btn btn-link btn-sm" onclick="GR.Modules.Viveiro._mostrarSubAba('viveiro-producao')" style="font-size:9px;padding:0;color:var(--primary);">Ver todas →</button>
                            </div>
                            <div style="max-height:80px;overflow-y:auto;font-size:10px;">
                                ${mudas.slice(0, 3).map(function(m) {
                                    return `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid var(--border-light);">
                                        <span>${GR.Utils.escapeHtml(m.especie)} ${m.variedade ? '- ' + GR.Utils.escapeHtml(m.variedade) : ''}</span>
                                        <span style="font-weight:600;">${m.quantidade || 0} un</span>
                                    </div>`;
                                }).join('') || '<span style="color:var(--text-light);">Nenhuma muda cadastrada</span>'}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card" style="padding:0;overflow:hidden;border-top:4px solid #2196F3;">
                    <div style="padding:12px 16px;background:linear-gradient(135deg, #e3f2fd, #bbdefb);border-bottom:1px solid var(--border);">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-size:15px;font-weight:700;color:#0d47a1;">💰 Comercial</span>
                            <span style="font-size:11px;color:#555;">${totalVendasQtd} vendidas | ${totalPedidos} pedidos</span>
                        </div>
                    </div>
                    <div style="padding:12px 16px;">
                        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;">
                            ${botoesComerciais}
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;">
                            <div style="background:var(--bg);padding:6px 10px;border-radius:4px;border-left:3px solid #2196F3;">
                                <span style="color:var(--text-light);">Vendas</span>
                                <div style="font-weight:700;font-size:14px;">${totalVendas}</div>
                            </div>
                            <div style="background:var(--bg);padding:6px 10px;border-radius:4px;border-left:3px solid #4CAF50;">
                                <span style="color:var(--text-light);">Receita Total</span>
                                <div style="font-weight:700;font-size:14px;color:#2e7d32;">${GR.Utils.formatarMoedaBR(totalReceitas)}</div>
                            </div>
                            <div style="background:var(--bg);padding:6px 10px;border-radius:4px;border-left:3px solid #FF9800;">
                                <span style="color:var(--text-light);">Pedidos</span>
                                <div style="font-weight:700;font-size:14px;">${totalPedidos}</div>
                            </div>
                            <div style="background:var(--bg);padding:6px 10px;border-radius:4px;border-left:3px solid #9C27B0;">
                                <span style="color:var(--text-light);">Variedades</span>
                                <div style="font-weight:700;font-size:14px;">${totalVariedades}</div>
                            </div>
                        </div>
                        <div style="margin-top:10px;border-top:1px solid var(--border-light);padding-top:8px;">
                            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-light);margin-bottom:4px;">
                                <span>📋 Últimas vendas</span>
                                <button class="btn btn-link btn-sm" onclick="GR.Modules.Viveiro._mostrarSubAba('viveiro-vendas')" style="font-size:9px;padding:0;color:var(--primary);">Ver todas →</button>
                            </div>
                            <div style="max-height:80px;overflow-y:auto;font-size:10px;">
                                ${vendas.slice(0, 3).map(function(v) {
                                    return `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid var(--border-light);">
                                        <span>${GR.Utils.escapeHtml(v.comprador || 'N/A')} - ${v.variedade || '-'}</span>
                                        <span style="font-weight:600;">${v.quantidade || 0} un - ${GR.Utils.formatarMoedaBR(v.valorTotal)}</span>
                                    </div>`;
                                }).join('') || '<span style="color:var(--text-light);">Nenhuma venda registrada</span>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // CARD FINANCEIRO (só se tiver permissão)
        if (podeVerCaixa) {
            html += `
            <div class="card" style="padding:0;overflow:hidden;border-top:4px solid #FF9800;margin-bottom:16px;">
                <div style="padding:12px 16px;background:linear-gradient(135deg, #fff3e0, #ffe0b2);border-bottom:1px solid var(--border);">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:18px;">📊</span>
                            <span style="font-size:15px;font-weight:700;color:#e65100;">Controle Financeiro</span>
                            <span style="font-size:11px;color:#555;">Integrado automaticamente</span>
                        </div>
                        <div style="display:flex;gap:6px;align-items:center;">
                            <span style="font-size:12px;font-weight:600;color:${saldo >= 0 ? '#2e7d32' : '#c62828'};">
                                Saldo: ${GR.Utils.formatarMoedaBR(saldo)}
                            </span>
                            ${botoesFinanceiros}
                        </div>
                    </div>
                </div>
                <div style="padding:12px 16px;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px;">
                        <div style="background:#e8f5e9;padding:10px 14px;border-radius:6px;border-left:4px solid #4CAF50;">
                            <div style="font-size:10px;color:#555;">💰 Receitas</div>
                            <div style="font-size:20px;font-weight:700;color:#2e7d32;">${GR.Utils.formatarMoedaBR(totalReceitas)}</div>
                            <div style="font-size:9px;color:#777;">${vendas.length} vendas realizadas</div>
                        </div>
                        <div style="background:#ffebee;padding:10px 14px;border-radius:6px;border-left:4px solid #f44336;">
                            <div style="font-size:10px;color:#555;">💸 Despesas</div>
                            <div style="font-size:20px;font-weight:700;color:#c62828;">${GR.Utils.formatarMoedaBR(totalDespesas)}</div>
                            <div style="font-size:9px;color:#777;">${caixa.filter(function(c) { return c.tipo === 'despesa'; }).length} lançamentos</div>
                        </div>
                        <div style="background:${saldo >= 0 ? '#e3f2fd' : '#ffebee'};padding:10px 14px;border-radius:6px;border-left:4px solid ${saldo >= 0 ? '#2196F3' : '#f44336'};">
                            <div style="font-size:10px;color:#555;">📊 Saldo</div>
                            <div style="font-size:20px;font-weight:700;color:${saldo >= 0 ? '#0d47a1' : '#c62828'};">${GR.Utils.formatarMoedaBR(saldo)}</div>
                            <div style="font-size:9px;color:#777;">${saldo >= 0 ? '📈 Positivo' : '📉 Negativo'}</div>
                        </div>
                        <div style="background:#f3e5f5;padding:10px 14px;border-radius:6px;border-left:4px solid #9C27B0;">
                            <div style="font-size:10px;color:#555;">📋 Lançamentos</div>
                            <div style="font-size:20px;font-weight:700;color:#6a1b9a;">${caixa.length}</div>
                            <div style="font-size:9px;color:#777;">${caixa.filter(function(c) { return c.tipo === 'receita'; }).length} receitas, ${caixa.filter(function(c) { return c.tipo === 'despesa'; }).length} despesas</div>
                        </div>
                    </div>
                    <div style="border-top:1px solid var(--border-light);padding-top:10px;">
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-light);margin-bottom:4px;">
                            <span>📋 Últimos lançamentos</span>
                            <button class="btn btn-link btn-sm" onclick="GR.Modules.Viveiro._mostrarSubAba('viveiro-caixa')" style="font-size:9px;padding:0;color:var(--primary);">Ver todos →</button>
                        </div>
                        <div style="max-height:120px;overflow-y:auto;font-size:10px;">
                            ${caixa.slice(0, 5).sort(function(a, b) { return new Date(b.data) - new Date(a.data); }).map(function(c) {
                                return `<div style="display:flex;justify-content:space-between;padding:4px 8px;border-bottom:1px solid var(--border-light);border-left:3px solid ${c.tipo === 'receita' ? '#4CAF50' : '#f44336'};background:${c.tipo === 'receita' ? 'rgba(76,175,80,0.05)' : 'rgba(244,67,54,0.05)'};border-radius:2px;">
                                    <div>
                                        <span>${GR.Utils.escapeHtml(c.descricao)}</span>
                                        <span style="color:var(--text-light);font-size:9px;margin-left:6px;">${c.data ? GR.Utils.formatarDataBR(c.data) : '-'}</span>
                                    </div>
                                    <span style="font-weight:600;color:${c.tipo === 'receita' ? '#2e7d32' : '#c62828'};">${c.tipo === 'receita' ? '+' : '-'} ${GR.Utils.formatarMoedaBR(c.valor)}</span>
                                </div>`;
                            }).join('') || '<span style="color:var(--text-light);">Nenhum lançamento registrado</span>'}
                        </div>
                    </div>
                    <div style="margin-top:10px;padding:8px 12px;background:#e8f5e9;border-radius:6px;border:1px solid #a5d6a7;font-size:10px;color:#2e7d32;display:flex;align-items:center;gap:8px;">
                        <span>✅</span>
                        <span><strong>Integração automática ativa:</strong> Os custos da produção são lançados como despesas e as vendas como receitas automaticamente.</span>
                    </div>
                </div>
            </div>`;
        }

        // SUB-ABAS
        html += `
            <div style="margin-top:0;">
                <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;border-bottom:2px solid var(--border);padding-bottom:8px;">
                    <button class="btn btn-sm btn-primary" onclick="GR.Modules.Viveiro._mostrarSubAba('viveiro-dashboard')" id="tab-viveiro-dashboard" style="font-size:11px;">📊 Dashboard</button>
                    ${podeVerProducao ? `<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro._mostrarSubAba('viveiro-producao')" id="tab-viveiro-producao" style="font-size:11px;">🌱 Produção</button>` : ''}
                    ${podeVerVendas ? `<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro._mostrarSubAba('viveiro-vendas')" id="tab-viveiro-vendas" style="font-size:11px;">💰 Vendas</button>` : ''}
                    ${podeVerCaixa ? `<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro._mostrarSubAba('viveiro-caixa')" id="tab-viveiro-caixa" style="font-size:11px;">📒 Livro Caixa</button>` : ''}
                    ${podeVerRelatorios ? `<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro._mostrarSubAba('viveiro-relatorios')" id="tab-viveiro-relatorios" style="font-size:11px;">📊 Relatórios</button>` : ''}
                </div>

                <div id="viveiro-dashboard" class="sub-aba-content">
                    ${this._renderDashboard(mudas, insumos, servicos, trabalhadores, vendas, caixa)}
                </div>
                <div id="viveiro-producao" class="sub-aba-content" style="display:none;">
                    ${podeVerProducao ? this._renderProducao(mudas, insumos, servicos, trabalhadores, podeCriar, podeEditar, podeExcluir) : this._renderAcessoNegado('Produção')}
                </div>
                <div id="viveiro-vendas" class="sub-aba-content" style="display:none;">
                    ${podeVerVendas ? this._renderVendas(vendas, podeCriar, podeEditar, podeExcluir) : this._renderAcessoNegado('Vendas')}
                </div>
                <div id="viveiro-caixa" class="sub-aba-content" style="display:none;">
                    ${podeVerCaixa ? this._renderCaixa(caixa, totalReceitas, totalDespesas, saldo, podeCriar, podeEditar, podeExcluir) : this._renderAcessoNegado('Livro Caixa')}
                </div>
                <div id="viveiro-relatorios" class="sub-aba-content" style="display:none;">
                    ${podeVerRelatorios ? this._renderRelatorios(mudas, vendas, caixa, podeExportar) : this._renderAcessoNegado('Relatórios')}
                </div>
            </div>
        `;

        div.innerHTML = html;

        var totalMudasEl = document.getElementById('total-mudas');
        if (totalMudasEl) totalMudasEl.textContent = totalMudas;
        var totalInsumosEl = document.getElementById('total-insumos-viveiro');
        if (totalInsumosEl) totalInsumosEl.textContent = totalInsumos;
        var totalServicosEl = document.getElementById('total-servicos-viveiro');
        if (totalServicosEl) totalServicosEl.textContent = totalServicos;

        console.log('📊 Viveiro renderizado com propriedade global:', propViveiro);
        console.log('👤 Perfil:', perfil.nome);
    },
    // ================================================================
    // FUNÇÕES DE POPULAR SELECTS
    // ================================================================
    
    _popularSelectVariedades: function(selectId) {
        var select = document.getElementById(selectId);
        if (!select) return;
        
        var propViveiro = this.getPropriedadeAtiva();
        var variedades = GR.State.data.viveiroVariedades || [];
        
        if (propViveiro !== 'todas') {
            variedades = variedades.filter(function(v) { return v.propriedade === propViveiro; });
        }
        
        select.innerHTML = '<option value="">Selecione uma variedade</option>';
        variedades.forEach(function(v) {
            var opt = document.createElement('option');
            opt.value = v.nome;
            opt.textContent = v.nome + ' (' + (v.especie || '') + ')';
            select.appendChild(opt);
        });
    },

    _popularSelectTrabalhadores: function() {
        var select = document.getElementById('viveiro-servico-trabalhador');
        if (!select) return;
        
        var propViveiro = this.getPropriedadeAtiva();
        var trabalhadores = GR.State.data.viveiroTrabalhadores || [];
        
        if (propViveiro !== 'todas') {
            trabalhadores = trabalhadores.filter(function(t) { return t.propriedade === propViveiro; });
        }
        
        select.innerHTML = '<option value="">Selecione um trabalhador</option>';
        trabalhadores.forEach(function(t) {
            var opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.nome + (t.funcao ? ' (' + t.funcao + ')' : '');
            select.appendChild(opt);
        });
    },

    _popularSelectPedidos: function() {
        var select = document.getElementById('viveiro-venda-pedido-select');
        if (!select) return;
        
        var propViveiro = this.getPropriedadeAtiva();
        var pedidos = GR.State.data.viveiroPedidos || [];
        
        if (propViveiro !== 'todas') {
            pedidos = pedidos.filter(function(p) { return p.propriedade === propViveiro; });
        }
        
        pedidos = pedidos.filter(function(p) {
            return p.status !== 'Entregue' && p.status !== 'Cancelado';
        });
        
        select.innerHTML = '<option value="">Selecione um pedido</option>';
        pedidos.forEach(function(p) {
            var opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.cliente + ' - ' + p.variedade + ' (' + p.quantidade + ' un) - ' + p.status;
            select.appendChild(opt);
        });
    },

    // ================================================================
    // FUNÇÕES DE VENDA COM PEDIDO
    // ================================================================
    
    _onTipoVendaChange: function() {
        var tipo = document.getElementById('viveiro-venda-tipo');
        if (!tipo) return;
        
        var container = document.getElementById('viveiro-venda-pedido-container');
        var pedidoSelect = document.getElementById('viveiro-venda-pedido-select');
        
        if (tipo.value === 'pedido') {
            if (container) container.style.display = 'block';
            this._popularSelectPedidos();
        } else {
            if (container) container.style.display = 'none';
            if (pedidoSelect) pedidoSelect.value = '';
            var compradorEl = document.getElementById('viveiro-venda-comprador');
            if (compradorEl) compradorEl.value = '';
            var variedadeEl = document.getElementById('viveiro-venda-variedade');
            if (variedadeEl) variedadeEl.value = '';
            var qtdEl = document.getElementById('viveiro-venda-qtd');
            if (qtdEl) qtdEl.value = 0;
            var valorUnitarioEl = document.getElementById('viveiro-venda-valor-unitario');
            if (valorUnitarioEl) valorUnitarioEl.value = '0,00';
            var adiantamentoContainer = document.getElementById('viveiro-venda-adiantamento-container');
            if (adiantamentoContainer) adiantamentoContainer.style.display = 'none';
        }
    },

    _carregarPedidoVenda: function() {
        var pedidoId = document.getElementById('viveiro-venda-pedido-select');
        if (!pedidoId || !pedidoId.value) return;
        
        var pedido = (GR.State.data.viveiroPedidos || []).find(function(p) { return p.id === pedidoId.value; });
        if (!pedido) {
            GR.Toast.error('Pedido não encontrado!');
            return;
        }
        
        var compradorEl = document.getElementById('viveiro-venda-comprador');
        if (compradorEl) compradorEl.value = pedido.cliente || '';
        
        var variedadeEl = document.getElementById('viveiro-venda-variedade');
        if (variedadeEl) variedadeEl.value = pedido.variedade || '';
        
        var qtdEl = document.getElementById('viveiro-venda-qtd');
        if (qtdEl) qtdEl.value = pedido.quantidade || 0;
        
        var valorUnitarioEl = document.getElementById('viveiro-venda-valor-unitario');
        if (valorUnitarioEl) {
            var valor = pedido.valorUnitario || 0;
            valorUnitarioEl.value = GR.Utils.formatarMoedaSemSimbolo(valor);
        }
        
        var adiantamentoContainer = document.getElementById('viveiro-venda-adiantamento-container');
        var adiantamentoEl = document.getElementById('viveiro-venda-adiantamento');
        if (adiantamentoContainer) adiantamentoContainer.style.display = 'block';
        if (adiantamentoEl) {
            adiantamentoEl.value = GR.Utils.formatarMoedaSemSimbolo(pedido.adiantamento || 0);
        }
        
        GR.State.ui.viveiroVendaPedidoId = pedido.id;
        
        GR.Toast.info('📋 Pedido carregado: ' + pedido.cliente + ' - ' + pedido.variedade);
    },

    // ================================================================
    // MARCAR TODAS AS MUDAS DE UMA VARIEDADE COMO PRONTAS
    // ================================================================
    _marcarTodasProntas: function(variedade) {
        if (!variedade) {
            GR.Toast.error('Variedade não informada!');
            return;
        }

        if (!confirm('Marcar TODAS as mudas da variedade "' + variedade + '" como PRONTAS?')) {
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var propViveiro = this.getPropriedadeAtiva();

        var mudas = GR.State.data.viveiroMudas || [];
        if (propViveiro !== 'todas') {
            mudas = mudas.filter(function(m) { return m.propriedade === propViveiro; });
        }

        var mudasParaAtualizar = mudas.filter(function(m) {
            return m.variedade === variedade && m.status === 'Produção';
        });

        if (mudasParaAtualizar.length === 0) {
            GR.Toast.warning('⚠️ Nenhuma muda em produção para esta variedade.');
            return;
        }

        var promises = mudasParaAtualizar.map(function(m) {
            return db.collection('users').doc(uid).collection('viveiroMudas').doc(m.id).update({
                status: 'Pronta',
                dataPronta: new Date().toISOString().split('T')[0]
            });
        });

        Promise.all(promises).then(function() {
            GR.Toast.success('✅ ' + mudasParaAtualizar.length + ' lotes marcados como Prontos!');
            GR.Modules.Viveiro.render();
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro ao atualizar: ' + err.message);
        });
    },

    // ================================================================
    // MARCAR MUDA INDIVIDUAL COMO PRONTA
    // ================================================================
    marcarMudaPronta: function(id) {
        if (!id) {
            GR.Toast.error('ID da muda não informado!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;

        db.collection('users').doc(uid).collection('viveiroMudas').doc(id).update({
            status: 'Pronta',
            dataPronta: new Date().toISOString().split('T')[0]
        }).then(function() {
            GR.Toast.success('✅ Muda marcada como Pronta!');
            GR.Modules.Viveiro.render();
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro ao atualizar: ' + err.message);
        });
    },

    // ================================================================
    // ATUALIZAR DADOS
    // ================================================================
    _atualizarDados: function() {
        GR.Toast.info('🔄 Atualizando dados do viveiro...');
        var self = this;
        GR.State.carregarDados().then(function() {
            GR.Toast.success('✅ Dados atualizados!');
            try {
                var saved = localStorage.getItem('viveiro_propriedade_ativa');
                if (saved && saved !== 'null' && saved !== 'undefined') {
                    self._propriedadeAtiva = saved;
                }
            } catch(e) {}
            self.render();
            if (GR.UI && typeof GR.UI._atualizarDashboard === 'function') {
                GR.UI._atualizarDashboard();
            }
        }).catch(function(err) {
            GR.Toast.error('❌ Erro ao atualizar: ' + err.message);
        });
    },

    // ================================================================
    // GERAR NF DE PRODUTOR RURAL
    // ================================================================
    _gerarNFProdutor: function() {
        if (!this._temPermissao('vendas')) {
            GR.Toast.error('❌ Você não tem permissão para emitir NF!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        var vendas = GR.State.data.viveiroVendas || [];
        
        if (propViveiro !== 'todas') {
            vendas = vendas.filter(function(v) { return v.propriedade === propViveiro; });
        }

        if (!vendas.length) {
            GR.Toast.warning('⚠️ Nenhuma venda registrada para emitir NF.');
            return;
        }

        var html = `
            <div style="padding:16px;">
                <h4 style="margin:0 0 12px 0;">📄 Emissão de NF de Produtor Rural</h4>
                <p style="font-size:12px;color:var(--text-light);">Selecione o período para emissão da nota fiscal</p>
                <div style="display:grid;gap:8px;">
                    <div>
                        <label style="font-size:11px;">Data Início</label>
                        <input type="date" id="nf-produtor-inicio" class="form-control" value="${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]}">
                    </div>
                    <div>
                        <label style="font-size:11px;">Data Fim</label>
                        <input type="date" id="nf-produtor-fim" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div style="display:flex;gap:6px;margin-top:4px;">
                        <button class="btn btn-success" onclick="GR.Modules.Viveiro._gerarPDFNFProdutor()">📄 Gerar NF</button>
                        <button class="btn btn-secondary" onclick="GR.Modal.close('modal-nf-produtor')">Cancelar</button>
                    </div>
                </div>
            </div>
        `;

        var modalId = 'modal-nf-produtor';
        var modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            modal.innerHTML = `<div class="modal-content" style="max-width:450px;">${html}</div>`;
            document.body.appendChild(modal);
        } else {
            modal.querySelector('.modal-content').innerHTML = html;
        }
        GR.Modal.open(modalId);
    },

    // ================================================================
    // GERAR PDF DA NF DE PRODUTOR RURAL
    // ================================================================
    _gerarPDFNFProdutor: function() {
        var inicio = document.getElementById('nf-produtor-inicio').value;
        var fim = document.getElementById('nf-produtor-fim').value;

        if (!inicio || !fim) {
            GR.Toast.error('Selecione o período!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        var vendas = GR.State.data.viveiroVendas || [];
        
        if (propViveiro !== 'todas') {
            vendas = vendas.filter(function(v) { return v.propriedade === propViveiro; });
        }

        vendas = vendas.filter(function(v) {
            return v.data >= inicio && v.data <= fim;
        });

        if (!vendas.length) {
            GR.Toast.warning('⚠️ Nenhuma venda no período selecionado.');
            return;
        }

        var totalVendas = vendas.length;
        var totalQtd = vendas.reduce(function(sum, v) { return sum + (v.quantidade || 0); }, 0);
        var totalValor = vendas.reduce(function(sum, v) { return sum + (v.valorTotal || 0); }, 0);

        var html = `
            <div style="padding:20px;font-family:monospace;font-size:12px;">
                <h2 style="text-align:center;font-size:16px;">NOTA FISCAL DE PRODUTOR RURAL</h2>
                <div style="text-align:center;font-size:11px;color:#555;margin-bottom:16px;">
                    Período: ${GR.Utils.formatarDataBR(inicio)} a ${GR.Utils.formatarDataBR(fim)}
                </div>
                <hr>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:8px 0;">
                    <div><strong>Total de Vendas:</strong> ${totalVendas}</div>
                    <div><strong>Total de Mudas:</strong> ${totalQtd}</div>
                    <div><strong>Valor Total:</strong> ${GR.Utils.formatarMoedaBR(totalValor)}</div>
                    <div><strong>Propriedade:</strong> ${propViveiro === 'todas' ? 'Todas' : propViveiro}</div>
                </div>
                <hr>
                <table style="width:100%;font-size:11px;border-collapse:collapse;margin-top:8px;">
                    <thead>
                        <tr style="background:#f5f5f5;">
                            <th style="border:1px solid #ddd;padding:4px;text-align:left;">Data</th>
                            <th style="border:1px solid #ddd;padding:4px;text-align:left;">Comprador</th>
                            <th style="border:1px solid #ddd;padding:4px;text-align:left;">Variedade</th>
                            <th style="border:1px solid #ddd;padding:4px;text-align:right;">Qtd</th>
                            <th style="border:1px solid #ddd;padding:4px;text-align:right;">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vendas.map(function(v) {
                            return `<tr>
                                <td style="border:1px solid #ddd;padding:4px;">${GR.Utils.formatarDataBR(v.data)}</td>
                                <td style="border:1px solid #ddd;padding:4px;">${GR.Utils.escapeHtml(v.comprador || '-')}</td>
                                <td style="border:1px solid #ddd;padding:4px;">${GR.Utils.escapeHtml(v.variedade || '-')}</td>
                                <td style="border:1px solid #ddd;padding:4px;text-align:right;">${v.quantidade || 0}</td>
                                <td style="border:1px solid #ddd;padding:4px;text-align:right;">${GR.Utils.formatarMoedaBR(v.valorTotal)}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background:#f5f5f5;font-weight:700;">
                            <td colspan="3" style="border:1px solid #ddd;padding:4px;text-align:right;">TOTAL</td>
                            <td style="border:1px solid #ddd;padding:4px;text-align:right;">${totalQtd}</td>
                            <td style="border:1px solid #ddd;padding:4px;text-align:right;">${GR.Utils.formatarMoedaBR(totalValor)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style="margin-top:16px;text-align:center;font-size:10px;color:#999;">
                    Documento gerado pelo Sistema Gestão Rural em ${new Date().toLocaleString('pt-BR')}
                </div>
            </div>
        `;

        var win = window.open('', '_blank', 'width=800,height=600');
        win.document.write(`
            <html>
                <head>
                    <title>NF Produtor Rural</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        @media print {
                            body { padding: 10px; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${html}
                    <div style="text-align:center;margin-top:16px;" class="no-print">
                        <button onclick="window.print()" style="padding:8px 20px;background:#4CAF50;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;">🖨️ Imprimir</button>
                        <button onclick="window.close()" style="padding:8px 20px;background:#f44336;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;margin-left:8px;">Fechar</button>
                    </div>
                </body>
            </html>
        `);
        win.document.close();

        GR.Modal.close('modal-nf-produtor');
        GR.Toast.success('✅ NF gerada com sucesso!');
    },

    // ================================================================
    // RENDER ACESSO NEGADO
    // ================================================================
    _renderAcessoNegado: function(modulo) {
        var perfil = this._getPerfilUsuario();
        return `
            <div class="card" style="padding:30px;text-align:center;">
                <div style="font-size:48px;margin-bottom:12px;">🔒</div>
                <div style="font-size:16px;font-weight:600;color:var(--danger);">Acesso Negado</div>
                <div style="font-size:13px;color:var(--text-light);margin-top:8px;">
                    Você não tem permissão para acessar a aba <strong>${modulo}</strong>
                </div>
                <div style="font-size:11px;color:var(--text-light);margin-top:4px;">
                    Seu perfil: <strong>${perfil.nome}</strong>
                </div>
                <div style="font-size:10px;color:var(--text-light);margin-top:8px;padding:8px;background:var(--bg);border-radius:4px;">
                    💡 Entre em contato com o administrador para solicitar acesso
                </div>
            </div>
        `;
    },

    // ================================================================
    // RENDER DASHBOARD
    // ================================================================
    _renderDashboard: function(mudas, insumos, servicos, trabalhadores, vendas, caixa) {
        var totalMudasQtd = mudas.reduce(function(sum, m) { return sum + (m.quantidade || 0); }, 0);
        var mudasProntas = mudas.filter(function(m) { return m.status === 'Pronta'; }).length;
        var mudasProducao = mudas.filter(function(m) { return m.status === 'Produção'; }).length;
        var mudasDescartadas = mudas.filter(function(m) { return m.status === 'Descartada'; }).length;
        var mudasVendidas = mudas.filter(function(m) { return m.status === 'Vendida'; }).length;
        var totalVendas = vendas.reduce(function(sum, v) { return sum + (v.quantidade || 0); }, 0);
        var totalReceitas = vendas.reduce(function(sum, v) { return sum + (v.valorTotal || 0); }, 0);
        var totalDespesas = caixa.reduce(function(sum, c) { return c.tipo === 'despesa' ? sum + (c.valor || 0) : sum; }, 0);
        var saldo = totalReceitas - totalDespesas;

        var variedades = {};
        mudas.forEach(function(m) {
            var key = m.variedade || 'Não especificada';
            variedades[key] = (variedades[key] || 0) + (m.quantidade || 0);
        });

        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:12px;">
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--success);">
                    <div style="font-size:24px;font-weight:700;color:var(--success);">${totalMudasQtd}</div>
                    <div style="font-size:11px;color:var(--text-light);">🌱 Total de Mudas</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid #4CAF50;">
                    <div style="font-size:24px;font-weight:700;color:#4CAF50;">${mudasProntas}</div>
                    <div style="font-size:11px;color:var(--text-light);">✅ Prontas para Venda</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--warning);">
                    <div style="font-size:24px;font-weight:700;color:var(--warning);">${mudasProducao}</div>
                    <div style="font-size:11px;color:var(--text-light);">⏳ Em Produção</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--danger);">
                    <div style="font-size:24px;font-weight:700;color:var(--danger);">${mudasDescartadas}</div>
                    <div style="font-size:11px;color:var(--text-light);">🗑️ Descartadas</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--info);">
                    <div style="font-size:24px;font-weight:700;color:var(--info);">${mudasVendidas}</div>
                    <div style="font-size:11px;color:var(--text-light);">💰 Vendidas</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--primary);">
                    <div style="font-size:20px;font-weight:700;color:var(--primary);">${GR.Utils.formatarMoedaBR(saldo)}</div>
                    <div style="font-size:11px;color:var(--text-light);">💰 Saldo do Viveiro</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">
                <div class="card" style="padding:12px;">
                    <h5 style="font-size:12px;margin:0 0 8px 0;">📦 Insumos (${insumos.length})</h5>
                    <div style="font-size:11px;color:var(--text-light);">${insumos.reduce(function(sum, i) { return sum + (i.quantidade || 0); }, 0)} unidades</div>
                    <div style="font-size:10px;color:var(--text-light);">Valor: ${GR.Utils.formatarMoedaBR(insumos.reduce(function(sum, i) { return sum + ((i.quantidade || 0) * (i.preco || 0)); }, 0))}</div>
                </div>
                <div class="card" style="padding:12px;">
                    <h5 style="font-size:12px;margin:0 0 8px 0;">🔧 Serviços (${servicos.length})</h5>
                    <div style="font-size:11px;color:var(--text-light);">${servicos.filter(function(s) { return s.status !== 'Concluído'; }).length} pendentes</div>
                    <div style="font-size:10px;color:var(--text-light);">Custo: ${GR.Utils.formatarMoedaBR(servicos.reduce(function(sum, s) { return sum + (s.custo || 0); }, 0))}</div>
                </div>
                <div class="card" style="padding:12px;">
                    <h5 style="font-size:12px;margin:0 0 8px 0;">👨‍🌾 Trabalhadores (${trabalhadores.length})</h5>
                    <div style="font-size:11px;color:var(--text-light);">${trabalhadores.length} pessoas</div>
                </div>
                <div class="card" style="padding:12px;">
                    <h5 style="font-size:12px;margin:0 0 8px 0;">💰 Vendas (${vendas.length})</h5>
                    <div style="font-size:11px;color:var(--text-light);">${totalVendas} mudas vendidas</div>
                    <div style="font-size:10px;color:var(--text-light);">Receita: ${GR.Utils.formatarMoedaBR(totalReceitas)}</div>
                </div>
            </div>

            <div class="card" style="margin-top:12px;padding:12px;">
                <h5 style="font-size:12px;margin:0 0 8px 0;">📊 Variedades em Produção</h5>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${Object.entries(variedades).map(function(v) {
                        return `<span style="background:var(--bg);padding:4px 12px;border-radius:12px;font-size:11px;">${v[0]}: <strong>${v[1]}</strong></span>`;
                    }).join('') || '<span style="font-size:11px;color:var(--text-light);">Nenhuma variedade cadastrada</span>'}
                </div>
            </div>
        `;
    },
    // ================================================================
    // RENDER PRODUÇÃO
    // ================================================================
    _renderProducao: function(mudas, insumos, servicos, trabalhadores, podeCriar, podeEditar, podeExcluir) {
        var totalMudasQtd = mudas.reduce(function(sum, m) { return sum + (m.quantidade || 0); }, 0);

        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:12px;">
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--success);">
                    <div style="font-size:22px;font-weight:700;color:var(--success);">${totalMudasQtd}</div>
                    <div style="font-size:11px;color:var(--text-light);">🌱 Mudas Produzidas</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--warning);">
                    <div style="font-size:22px;font-weight:700;color:var(--warning);">${mudas.filter(function(m) { return m.status === 'Produção'; }).length}</div>
                    <div style="font-size:11px;color:var(--text-light);">⏳ Em Produção</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid #4CAF50;">
                    <div style="font-size:22px;font-weight:700;color:#4CAF50;">${mudas.filter(function(m) { return m.status === 'Pronta'; }).length}</div>
                    <div style="font-size:11px;color:var(--text-light);">✅ Prontas</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--danger);">
                    <div style="font-size:22px;font-weight:700;color:var(--danger);">${mudas.filter(function(m) { return m.status === 'Descartada'; }).length}</div>
                    <div style="font-size:11px;color:var(--text-light);">🗑️ Descartadas</div>
                </div>
            </div>

            <div class="card" style="padding:12px;margin-bottom:10px;">
                <div class="card-header" style="margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                    <div class="card-title" style="font-size:14px;">🌱 Mudas</div>
                    ${podeCriar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalMuda()" style="font-size:10px;">➕ Nova Muda</button>` : ''}
                </div>
                ${!mudas.length ? `
                    <div class="empty-state" style="padding:20px;">
                        <span class="icon" style="font-size:32px;">🌱</span>
                        <div class="message" style="font-size:13px;">Nenhuma muda cadastrada</div>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table style="font-size:11px;">
                            <thead>
                                <tr>
                                    <th>Espécie</th>
                                    <th>Variedade</th>
                                    <th>Qtd</th>
                                    <th>Status</th>
                                    <th>Produção</th>
                                    <th style="text-align:center;">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mudas.map(function(m) {
                                    var statusBadge = m.status === 'Pronta' ? '<span class="badge badge-success">Pronta</span>' :
                                        m.status === 'Produção' ? '<span class="badge badge-warning">Produção</span>' :
                                        m.status === 'Descartada' ? '<span class="badge badge-danger">Descartada</span>' :
                                        m.status === 'Vendida' ? '<span class="badge badge-info">Vendida</span>' :
                                        '<span class="badge badge-secondary">' + m.status + '</span>';
                                    var botaoProntas = (m.status === 'Produção' && podeEditar) ? 
                                        `<button class="btn btn-sm btn-success" onclick="GR.Modules.Viveiro.marcarMudaPronta('${m.id}')" style="font-size:8px;padding:2px 6px;" title="Marcar como Pronta">✅</button>` : '';
                                    return `
                                        <tr>
                                            <td><strong>${GR.Utils.escapeHtml(m.especie)}</strong></td>
                                            <td>${GR.Utils.escapeHtml(m.variedade || '-')}</td>
                                            <td>${m.quantidade || 0}</td>
                                            <td>${statusBadge}</td>
                                            <td>${m.dataProducao ? GR.Utils.formatarDataBR(m.dataProducao) : '-'}</td>
                                            <td style="text-align:center;white-space:nowrap;">
                                                ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalMuda('${m.id}')" style="font-size:8px;padding:2px 6px;">✏️</button>` : ''}
                                                ${podeExcluir ? `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir('muda','${m.id}')" style="font-size:8px;padding:2px 6px;">🗑️</button>` : ''}
                                                ${botaoProntas}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>

            <div class="card" style="padding:12px;margin-bottom:10px;">
                <div class="card-header" style="margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                    <div class="card-title" style="font-size:14px;">📦 Insumos</div>
                    ${podeCriar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalInsumo()" style="font-size:10px;">➕ Novo Insumo</button>` : ''}
                </div>
                ${!insumos.length ? `
                    <div class="empty-state" style="padding:20px;">
                        <span class="icon" style="font-size:32px;">📦</span>
                        <div class="message" style="font-size:13px;">Nenhum insumo cadastrado</div>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table style="font-size:11px;">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th>Qtd</th>
                                    <th>Estoque Mín</th>
                                    <th>Status</th>
                                    <th style="text-align:center;">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${insumos.map(function(i) {
                                    var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
                                    var min = typeof i.estoqueMinimo === 'number' ? i.estoqueMinimo : parseFloat(i.estoqueMinimo) || 5;
                                    var statusEstoque = qtd < min ? '🔴 Baixo' : '🟢 OK';
                                    var alertClass = qtd < min ? 'style="background:#ffebee;"' : '';
                                    return `
                                        <tr ${alertClass}>
                                            <td><strong>${GR.Utils.escapeHtml(i.nome)}</strong></td>
                                            <td>${GR.Utils.escapeHtml(i.tipo)}</td>
                                            <td>${qtd} ${i.unidade || ''}</td>
                                            <td>${min}</td>
                                            <td>${statusEstoque}</td>
                                            <td style="text-align:center;white-space:nowrap;">
                                                ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalInsumo('${i.id}')" style="font-size:8px;padding:2px 6px;">✏️</button>` : ''}
                                                ${podeExcluir ? `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir('insumo','${i.id}')" style="font-size:8px;padding:2px 6px;">🗑️</button>` : ''}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>

            <div class="card" style="padding:12px;margin-bottom:10px;">
                <div class="card-header" style="margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                    <div class="card-title" style="font-size:14px;">🔧 Serviços</div>
                    ${podeCriar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalServico()" style="font-size:10px;">➕ Novo Serviço</button>` : ''}
                </div>
                ${!servicos.length ? `
                    <div class="empty-state" style="padding:20px;">
                        <span class="icon" style="font-size:32px;">🔧</span>
                        <div class="message" style="font-size:13px;">Nenhum serviço cadastrado</div>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table style="font-size:11px;">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Responsável</th>
                                    <th>Data</th>
                                    <th>Custo</th>
                                    <th>Status</th>
                                    <th style="text-align:center;">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${servicos.map(function(s) {
                                    var statusBadge = s.status === 'Concluído' ? '<span class="badge badge-success">✅</span>' :
                                        s.status === 'Em andamento' ? '<span class="badge badge-warning">⏳</span>' :
                                        '<span class="badge badge-info">📋</span>';
                                    return `
                                        <tr>
                                            <td>${GR.Utils.escapeHtml(s.descricao)}</td>
                                            <td>${GR.Utils.escapeHtml(s.responsavel || '-')}</td>
                                            <td>${s.data ? GR.Utils.formatarDataBR(s.data) : '-'}</td>
                                            <td>${GR.Utils.formatarMoedaBR(s.custo)}</td>
                                            <td>${statusBadge}</td>
                                            <td style="text-align:center;white-space:nowrap;">
                                                ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalServico('${s.id}')" style="font-size:8px;padding:2px 6px;">✏️</button>` : ''}
                                                ${podeExcluir ? `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir('servico','${s.id}')" style="font-size:8px;padding:2px 6px;">🗑️</button>` : ''}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>

            <div class="card" style="padding:12px;">
                <div class="card-header" style="margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                    <div class="card-title" style="font-size:14px;">👨‍🌾 Trabalhadores</div>
                    ${podeCriar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalTrabalhador()" style="font-size:10px;">➕ Novo Trabalhador</button>` : ''}
                </div>
                ${!trabalhadores.length ? `
                    <div class="empty-state" style="padding:20px;">
                        <span class="icon" style="font-size:32px;">👨‍🌾</span>
                        <div class="message" style="font-size:13px;">Nenhum trabalhador cadastrado</div>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table style="font-size:11px;">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Função</th>
                                    <th>Telefone</th>
                                    <th>Admissão</th>
                                    <th style="text-align:center;">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${trabalhadores.map(function(t) {
                                    return `
                                        <tr>
                                            <td><strong>${GR.Utils.escapeHtml(t.nome)}</strong></td>
                                            <td>${GR.Utils.escapeHtml(t.funcao || '-')}</td>
                                            <td>${t.telefone ? GR.Utils.formatarTelefone(t.telefone.ddd, t.telefone.numero) : '-'}</td>
                                            <td>${t.admissao ? GR.Utils.formatarDataBR(t.admissao) : '-'}</td>
                                            <td style="text-align:center;white-space:nowrap;">
                                                ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalTrabalhador('${t.id}')" style="font-size:8px;padding:2px 6px;">✏️</button>` : ''}
                                                ${podeExcluir ? `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir('trabalhador','${t.id}')" style="font-size:8px;padding:2px 6px;">🗑️</button>` : ''}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },

    // ================================================================
    // RENDER VENDAS
    // ================================================================
    _renderVendas: function(vendas, podeCriar, podeEditar, podeExcluir) {
        var totalVendasQtd = vendas.reduce(function(sum, v) { return sum + (v.quantidade || 0); }, 0);
        var totalReceitas = vendas.reduce(function(sum, v) { return sum + (v.valorTotal || 0); }, 0);

        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:12px;">
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--success);">
                    <div style="font-size:22px;font-weight:700;color:var(--success);">${vendas.length}</div>
                    <div style="font-size:11px;color:var(--text-light);">📄 Notas Fiscais</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--info);">
                    <div style="font-size:22px;font-weight:700;color:var(--info);">${totalVendasQtd}</div>
                    <div style="font-size:11px;color:var(--text-light);">🌱 Mudas Vendidas</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--primary);">
                    <div style="font-size:18px;font-weight:700;color:var(--primary);">${GR.Utils.formatarMoedaBR(totalReceitas)}</div>
                    <div style="font-size:11px;color:var(--text-light);">💰 Receita Total</div>
                </div>
            </div>

            <div class="card" style="padding:12px;">
                <div class="card-header" style="margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                    <div class="card-title" style="font-size:14px;">💰 Vendas de Mudas</div>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        ${podeCriar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalVenda()" style="font-size:10px;">➕ Nova Venda</button>` : ''}
                        ${podeCriar ? `<button class="btn btn-success btn-sm" onclick="GR.Modules.Viveiro.abrirModalPedido()" style="font-size:10px;">📋 Novo Pedido</button>` : ''}
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Viveiro._gerarNFProdutor()" style="font-size:10px;">📄 NF Produtor</button>
                    </div>
                </div>
                ${!vendas.length ? `
                    <div class="empty-state" style="padding:20px;">
                        <span class="icon" style="font-size:32px;">💰</span>
                        <div class="message" style="font-size:13px;">Nenhuma venda registrada</div>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table style="font-size:11px;">
                            <thead>
                                <tr>
                                    <th>Nº Nota</th>
                                    <th>Data</th>
                                    <th>Comprador</th>
                                    <th>Variedade</th>
                                    <th>Qtd</th>
                                    <th>Valor Unit.</th>
                                    <th>Valor Total</th>
                                    <th style="text-align:center;">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${vendas.map(function(v) {
                                    return `
                                        <tr>
                                            <td><strong>${GR.Utils.escapeHtml(v.numeroNota || '-')}</strong></td>
                                            <td>${v.data ? GR.Utils.formatarDataBR(v.data) : '-'}</td>
                                            <td>${GR.Utils.escapeHtml(v.comprador || '-')}</td>
                                            <td>${GR.Utils.escapeHtml(v.variedade || '-')}</td>
                                            <td>${v.quantidade || 0}</td>
                                            <td>${GR.Utils.formatarMoedaBR(v.valorUnitario)}</td>
                                            <td><strong>${GR.Utils.formatarMoedaBR(v.valorTotal)}</strong></td>
                                            <td style="text-align:center;white-space:nowrap;">
                                                ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalVenda('${v.id}')" style="font-size:8px;padding:2px 6px;">✏️</button>` : ''}
                                                ${podeExcluir ? `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluirVenda('${v.id}')" style="font-size:8px;padding:2px 6px;">🗑️</button>` : ''}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },
    // ================================================================
    // RENDER LIVRO CAIXA
    // ================================================================
    _renderCaixa: function(caixa, totalReceitas, totalDespesas, saldo, podeCriar, podeEditar, podeExcluir) {
        var saldoAcumulado = 0;
        var lancamentosComSaldo = caixa.sort(function(a, b) { 
            return new Date(a.data) - new Date(b.data); 
        }).map(function(c) {
            saldoAcumulado += (c.tipo === 'receita' ? 1 : -1) * (c.valor || 0);
            return { ...c, saldoAcumulado: saldoAcumulado };
        });

        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:12px;">
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--success);">
                    <div style="font-size:22px;font-weight:700;color:var(--success);">${GR.Utils.formatarMoedaBR(totalReceitas)}</div>
                    <div style="font-size:11px;color:var(--text-light);">💰 Receitas</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--danger);">
                    <div style="font-size:22px;font-weight:700;color:var(--danger);">${GR.Utils.formatarMoedaBR(totalDespesas)}</div>
                    <div style="font-size:11px;color:var(--text-light);">💸 Despesas</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid ${saldo >= 0 ? 'var(--success)' : 'var(--danger)'};">
                    <div style="font-size:22px;font-weight:700;color:${saldo >= 0 ? 'var(--success)' : 'var(--danger)'};">${GR.Utils.formatarMoedaBR(saldo)}</div>
                    <div style="font-size:11px;color:var(--text-light);">${saldo >= 0 ? '📈' : '📉'} Saldo</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--info);">
                    <div style="font-size:22px;font-weight:700;color:var(--info);">${caixa.length}</div>
                    <div style="font-size:11px;color:var(--text-light);">📋 Lançamentos</div>
                </div>
            </div>

            <div class="card" style="padding:12px;">
                <div class="card-header" style="margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                    <div class="card-title" style="font-size:14px;">📒 Lançamentos</div>
                    ${podeCriar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalLancamento()" style="font-size:10px;">➕ Novo Lançamento</button>` : ''}
                </div>
                ${!caixa.length ? `
                    <div class="empty-state" style="padding:20px;">
                        <span class="icon" style="font-size:32px;">📒</span>
                        <div class="message" style="font-size:13px;">Nenhum lançamento registrado</div>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table style="font-size:11px;">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Tipo</th>
                                    <th>Valor</th>
                                    <th>Saldo</th>
                                    <th style="text-align:center;">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${lancamentosComSaldo.map(function(c) {
                                    return `
                                        <tr style="${c.tipo === 'receita' ? 'background:rgba(76,175,80,0.05);' : 'background:rgba(244,67,54,0.05);'}">
                                            <td>${c.data ? GR.Utils.formatarDataBR(c.data) : '-'}</td>
                                            <td>${GR.Utils.escapeHtml(c.descricao)}</td>
                                            <td>${GR.Utils.escapeHtml(c.categoria || '-')}</td>
                                            <td><span class="badge ${c.tipo === 'receita' ? 'badge-success' : 'badge-danger'}">${c.tipo === 'receita' ? '💰 Receita' : '💸 Despesa'}</span></td>
                                            <td style="font-weight:600;color:${c.tipo === 'receita' ? 'var(--success)' : 'var(--danger)'};">${GR.Utils.formatarMoedaBR(c.valor)}</td>
                                            <td style="font-weight:700;">${GR.Utils.formatarMoedaBR(c.saldoAcumulado)}</td>
                                            <td style="text-align:center;white-space:nowrap;">
                                                ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalLancamento('${c.id}')" style="font-size:8px;padding:2px 6px;">✏️</button>` : ''}
                                                ${podeExcluir ? `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluirLancamento('${c.id}')" style="font-size:8px;padding:2px 6px;">🗑️</button>` : ''}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },

    // ================================================================
    // RENDER RELATÓRIOS
    // ================================================================
    _renderRelatorios: function(mudas, vendas, caixa, podeExportar) {
        var totalReceitas = vendas.reduce(function(sum, v) { return sum + (v.valorTotal || 0); }, 0);
        var totalDespesas = caixa.reduce(function(sum, c) { return c.tipo === 'despesa' ? sum + (c.valor || 0) : sum; }, 0);
        var lucro = totalReceitas - totalDespesas;
        var variedadesVendidas = {};
        vendas.forEach(function(v) {
            var key = v.variedade || 'Não especificada';
            variedadesVendidas[key] = (variedadesVendidas[key] || 0) + (v.quantidade || 0);
        });

        return `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:12px;">
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--primary);">
                    <div style="font-size:20px;font-weight:700;color:var(--primary);">${GR.Utils.formatarMoedaBR(totalReceitas)}</div>
                    <div style="font-size:11px;color:var(--text-light);">💰 Receita Total</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid var(--danger);">
                    <div style="font-size:20px;font-weight:700;color:var(--danger);">${GR.Utils.formatarMoedaBR(totalDespesas)}</div>
                    <div style="font-size:11px;color:var(--text-light);">💸 Despesa Total</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:3px solid ${lucro >= 0 ? 'var(--success)' : 'var(--danger)'};">
                    <div style="font-size:20px;font-weight:700;color:${lucro >= 0 ? 'var(--success)' : 'var(--danger)'};">${GR.Utils.formatarMoedaBR(lucro)}</div>
                    <div style="font-size:11px;color:var(--text-light);">${lucro >= 0 ? '📈' : '📉'} Lucro/Prejuízo</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="card" style="padding:12px;">
                    <h5 style="font-size:12px;margin:0 0 8px 0;">📊 Variedades Vendidas</h5>
                    ${Object.entries(variedadesVendidas).length ? `
                        <div style="display:flex;flex-direction:column;gap:4px;">
                            ${Object.entries(variedadesVendidas).map(function(v) {
                                return `
                                    <div style="display:flex;justify-content:space-between;padding:4px 8px;background:var(--bg);border-radius:4px;font-size:11px;">
                                        <span>${v[0]}</span>
                                        <span><strong>${v[1]}</strong> mudas</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : '<span style="font-size:11px;color:var(--text-light);">Nenhuma venda registrada</span>'}
                </div>
                <div class="card" style="padding:12px;">
                    <h5 style="font-size:12px;margin:0 0 8px 0;">📈 Resumo do Viveiro</h5>
                    <div style="font-size:11px;color:var(--text-light);">
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-light);">
                            <span>🌱 Total de Mudas</span>
                            <span><strong>${mudas.reduce(function(sum, m) { return sum + (m.quantidade || 0); }, 0)}</strong></span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-light);">
                            <span>💰 Vendas Realizadas</span>
                            <span><strong>${vendas.length}</strong></span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-light);">
                            <span>📄 Lançamentos</span>
                            <span><strong>${caixa.length}</strong></span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:4px 0;">
                            <span>📊 Margem de Lucro</span>
                            <span><strong>${totalReceitas > 0 ? ((lucro / totalReceitas) * 100).toFixed(1) + '%' : '0%'}</strong></span>
                        </div>
                    </div>
                    ${podeExportar ? `
                        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);display:flex;gap:6px;flex-wrap:wrap;">
                            <button class="btn btn-info btn-sm" onclick="GR.Modules.Viveiro.exportarDados()" style="font-size:10px;">📤 Exportar Dados</button>
                            <button class="btn btn-secondary btn-sm" onclick="window.print()" style="font-size:10px;">🖨️ Imprimir</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // ================================================================
    // FUNÇÕES DE SUB-ABAS
    // ================================================================
    _subAbaAtual: 'viveiro-dashboard',

    _mostrarSubAba: function(abaId) {
        document.querySelectorAll('.sub-aba-content').forEach(function(el) {
            el.style.display = 'none';
        });
        
        var content = document.getElementById(abaId);
        if (content) {
            content.style.display = 'block';
        }
        
        document.querySelectorAll('[id^="tab-viveiro-"]').forEach(function(btn) {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
        
        var btn = document.getElementById('tab-' + abaId);
        if (btn) {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        }
        
        this._subAbaAtual = abaId;
    },

    // ================================================================
    // ALTERNAR PROPRIEDADE (COMPATIBILIDADE)
    // ================================================================
    _alternarPropriedade: function() {
        GR.Toast.info('📍 Use o seletor de propriedade no topo do módulo Viveiro');
    },

    // ================================================================
    // MODAL: VENDA
    // ================================================================
    abrirModalVenda: function(editId) {
        if (!this._temPermissao('vendas')) {
            GR.Toast.error('❌ Você não tem permissão para acessar Vendas!');
            return;
        }
        if (editId && !this._temPermissao('editar')) {
            GR.Toast.error('❌ Você não tem permissão para editar!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        if (!propViveiro || propViveiro === 'todas') {
            GR.Toast.warning('⚠️ Selecione uma propriedade específica no seletor do topo para fazer vendas!');
            return;
        }

        GR.State.ui.viveiroVendaEditando = editId || null;
        
        this._popularSelectVariedades('viveiro-venda-variedade');

        var propSelect = document.getElementById('viveiro-venda-propriedade');
        if (propSelect) {
            propSelect.value = propViveiro;
            propSelect.disabled = true;
            propSelect.style.color = 'var(--text)';
            propSelect.style.fontWeight = '600';
        }

        var titleEl = document.getElementById('modal-viveiro-venda-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Venda' : '💰 Nova Venda';
        
        var notaEl = document.getElementById('viveiro-venda-nota');
        if (notaEl) notaEl.value = editId ? '' : 'VEN-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        
        var dataEl = document.getElementById('viveiro-venda-data');
        if (dataEl) dataEl.value = new Date().toISOString().split('T')[0];
        
        var compradorEl = document.getElementById('viveiro-venda-comprador');
        if (compradorEl) compradorEl.value = '';
        
        var variedadeEl = document.getElementById('viveiro-venda-variedade');
        if (variedadeEl) variedadeEl.value = '';
        
        var qtdEl = document.getElementById('viveiro-venda-qtd');
        if (qtdEl) qtdEl.value = 0;
        
        var valorUnitarioEl = document.getElementById('viveiro-venda-valor-unitario');
        if (valorUnitarioEl) valorUnitarioEl.value = '0,00';

        var tipoEl = document.getElementById('viveiro-venda-tipo');
        if (tipoEl) tipoEl.value = 'direta';
        this._onTipoVendaChange();

        if (editId) {
            var item = (GR.State.data.viveiroVendas || []).find(function(v) { return v.id === editId; });
            if (item) {
                if (notaEl) notaEl.value = item.numeroNota || '';
                if (dataEl) dataEl.value = item.data || '';
                if (compradorEl) compradorEl.value = item.comprador || '';
                if (variedadeEl) variedadeEl.value = item.variedade || '';
                if (qtdEl) qtdEl.value = item.quantidade || 0;
                if (valorUnitarioEl) valorUnitarioEl.value = GR.Utils.formatarMoedaSemSimbolo(item.valorUnitario || 0);
                if (propSelect) propSelect.value = item.propriedade || propViveiro;
            }
        }
        GR.Modal.open('modal-viveiro-venda');
    },

    // ================================================================
    // SALVAR VENDA
    // ================================================================
    salvarVenda: function() {
        if (!this._temPermissao('vendas') || !this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar vendas!');
            return;
        }

        var notaEl = document.getElementById('viveiro-venda-nota');
        var dataEl = document.getElementById('viveiro-venda-data');
        var compradorEl = document.getElementById('viveiro-venda-comprador');
        var variedadeEl = document.getElementById('viveiro-venda-variedade');
        var qtdEl = document.getElementById('viveiro-venda-qtd');
        var valorUnitarioEl = document.getElementById('viveiro-venda-valor-unitario');

        if (!notaEl || !dataEl || !compradorEl) {
            GR.Toast.error('Elementos do formulário não encontrados!');
            return;
        }

        var nota = notaEl.value.trim();
        var data = dataEl.value;
        var comprador = compradorEl.value.trim();
        var variedade = variedadeEl ? variedadeEl.value.trim() : '';
        var quantidade = parseFloat(qtdEl ? qtdEl.value : 0) || 0;
        var valorUnitario = GR.Utils.parseMoedaBR(valorUnitarioEl ? valorUnitarioEl.value : '0,00');
        var propriedade = this.getPropriedadeAtiva();

        if (!nota || !data || !comprador || quantidade <= 0) {
            GR.Toast.error('Preencha todos os campos obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var valorTotal = quantidade * valorUnitario;
        var dados = {
            numeroNota: GR.Utils.escapeHtml(nota),
            data: data,
            comprador: GR.Utils.escapeHtml(comprador),
            variedade: GR.Utils.escapeHtml(variedade),
            quantidade: quantidade,
            valorUnitario: valorUnitario,
            valorTotal: valorTotal,
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataCriacao: GR.Utils.now()
        };

        var pedidoId = GR.State.ui.viveiroVendaPedidoId || null;
        if (pedidoId) {
            dados.pedidoId = pedidoId;
            var pedidoRef = db.collection('users').doc(uid).collection('viveiroPedidos').doc(pedidoId);
            pedidoRef.update({
                status: 'Entregue',
                dataEntrega: data
            }).catch(function(err) {
                console.warn('Erro ao atualizar pedido:', err);
            });
        }

        var ref = db.collection('users').doc(uid).collection('viveiroVendas');
        var editId = GR.State.ui.viveiroVendaEditando;

        var self = this;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-venda');
                GR.Toast.success('Venda atualizada!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function(docRef) {
                GR.Modal.close('modal-viveiro-venda');
                GR.Toast.success('Venda registrada!');
                
                var caixaRef = db.collection('users').doc(uid).collection('viveiroCaixa');
                caixaRef.add({
                    descricao: 'Venda de mudas - Nota ' + nota + (pedidoId ? ' (Pedido ' + pedidoId.substring(0, 6) + ')' : ''),
                    data: data,
                    tipo: 'receita',
                    categoria: 'Venda de Mudas',
                    valor: valorTotal,
                    propriedade: GR.Utils.escapeHtml(propriedade),
                    dataCriacao: GR.Utils.now(),
                    vendaId: docRef.id
                }).catch(function(err) {
                    console.warn('Erro ao registrar no caixa:', err);
                });
                
                if (variedade) {
                    var mudas = GR.State.data.viveiroMudas || [];
                    if (propriedade !== 'todas') {
                        mudas = mudas.filter(function(m) { return m.propriedade === propriedade; });
                    }
                    
                    var qtdRestante = quantidade;
                    var mudasProntas = mudas.filter(function(m) { 
                        return m.variedade === variedade && m.status === 'Pronta' && qtdRestante > 0;
                    });
                    
                    var promises = [];
                    for (var i = 0; i < mudasProntas.length && qtdRestante > 0; i++) {
                        var m = mudasProntas[i];
                        var qtdBaixar = Math.min(m.quantidade || 0, qtdRestante);
                        if (qtdBaixar > 0) {
                            var novaQtd = (m.quantidade || 0) - qtdBaixar;
                            if (novaQtd <= 0) {
                                promises.push(db.collection('users').doc(uid).collection('viveiroMudas').doc(m.id).update({
                                    status: 'Vendida',
                                    quantidade: 0
                                }));
                            } else {
                                promises.push(db.collection('users').doc(uid).collection('viveiroMudas').doc(m.id).update({
                                    quantidade: novaQtd
                                }));
                            }
                            qtdRestante -= qtdBaixar;
                        }
                    }
                    
                    if (promises.length > 0) {
                        Promise.all(promises).catch(function(err) {
                            console.warn('Erro ao baixar estoque:', err);
                        });
                    }
                }
                
                GR.State.ui.viveiroVendaPedidoId = null;
                self.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    // ================================================================
    // EXCLUIR VENDA
    // ================================================================
    excluirVenda: function(id) {
        if (!this._temPermissao('excluir')) {
            GR.Toast.error('❌ Você não tem permissão para excluir!');
            return;
        }
        if (!confirm('Excluir esta venda?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        
        var venda = (GR.State.data.viveiroVendas || []).find(function(v) { return v.id === id; });
        
        db.collection('users').doc(uid).collection('viveiroVendas').doc(id).delete()
            .then(function() {
                if (venda) {
                    db.collection('users').doc(uid).collection('viveiroCaixa')
                        .where('vendaId', '==', id)
                        .get().then(function(snapshot) {
                            snapshot.forEach(function(doc) {
                                doc.ref.delete();
                            });
                        }).catch(function(err) {
                            console.warn('Erro ao remover do caixa:', err);
                        });
                }
                GR.Toast.success('Venda excluída!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // MODAL: LANÇAMENTO (CAIXA)
    // ================================================================
    abrirModalLancamento: function(editId) {
        if (!this._temPermissao('caixa')) {
            GR.Toast.error('❌ Você não tem permissão para acessar o Livro Caixa!');
            return;
        }
        if (editId && !this._temPermissao('editar')) {
            GR.Toast.error('❌ Você não tem permissão para editar!');
            return;
        }

        GR.State.ui.viveiroLancamentoEditando = editId || null;

        var titleEl = document.getElementById('modal-viveiro-lancamento-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Lançamento' : '📒 Novo Lançamento';
        
        var descEl = document.getElementById('viveiro-lancamento-desc');
        if (descEl) descEl.value = '';
        
        var dataEl = document.getElementById('viveiro-lancamento-data');
        if (dataEl) dataEl.value = new Date().toISOString().split('T')[0];
        
        var tipoEl = document.getElementById('viveiro-lancamento-tipo');
        if (tipoEl) tipoEl.value = 'despesa';
        
        var categoriaEl = document.getElementById('viveiro-lancamento-categoria');
        if (categoriaEl) categoriaEl.value = 'Insumos';
        
        var valorEl = document.getElementById('viveiro-lancamento-valor');
        if (valorEl) valorEl.value = '0,00';

        if (editId) {
            var item = (GR.State.data.viveiroCaixa || []).find(function(l) { return l.id === editId; });
            if (item) {
                if (descEl) descEl.value = item.descricao || '';
                if (dataEl) dataEl.value = item.data || '';
                if (tipoEl) tipoEl.value = item.tipo || 'despesa';
                if (categoriaEl) categoriaEl.value = item.categoria || 'Insumos';
                if (valorEl) valorEl.value = GR.Utils.formatarMoedaSemSimbolo(item.valor || 0);
            }
        }
        GR.Modal.open('modal-viveiro-lancamento');
    },

    // ================================================================
    // SALVAR LANÇAMENTO
    // ================================================================
    salvarLancamento: function() {
        if (!this._temPermissao('caixa') || !this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar lançamentos!');
            return;
        }

        var descEl = document.getElementById('viveiro-lancamento-desc');
        var dataEl = document.getElementById('viveiro-lancamento-data');
        var tipoEl = document.getElementById('viveiro-lancamento-tipo');
        var categoriaEl = document.getElementById('viveiro-lancamento-categoria');
        var valorEl = document.getElementById('viveiro-lancamento-valor');

        if (!descEl || !dataEl || !valorEl) {
            GR.Toast.error('Elementos do formulário não encontrados!');
            return;
        }

        var descricao = descEl.value.trim();
        var data = dataEl.value;
        var tipo = tipoEl ? tipoEl.value : 'despesa';
        var categoria = categoriaEl ? categoriaEl.value : 'Insumos';
        var valor = GR.Utils.parseMoedaBR(valorEl.value);
        var propriedade = this.getPropriedadeAtiva();

        if (!descricao || !data || !valor) {
            GR.Toast.error('Preencha todos os campos obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            descricao: GR.Utils.escapeHtml(descricao),
            data: data,
            tipo: tipo,
            categoria: categoria,
            valor: valor,
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroCaixa');
        var editId = GR.State.ui.viveiroLancamentoEditando;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-lancamento');
                GR.Toast.success('Lançamento atualizado!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-lancamento');
                GR.Toast.success('Lançamento registrado!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    // ================================================================
    // EXCLUIR LANÇAMENTO
    // ================================================================
    excluirLancamento: function(id) {
        if (!this._temPermissao('excluir')) {
            GR.Toast.error('❌ Você não tem permissão para excluir!');
            return;
        }
        if (!confirm('Excluir este lançamento?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        
        db.collection('users').doc(uid).collection('viveiroCaixa').doc(id).delete()
            .then(function() {
                GR.Toast.success('Lançamento excluído!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // FUNÇÕES DE VARIEDADES
    // ================================================================
    abrirModalVariedade: function(editId) {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar variedades!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        if (!propViveiro || propViveiro === 'todas') {
            GR.Toast.warning('⚠️ Selecione uma propriedade específica no seletor do topo para criar variedades!');
            return;
        }

        GR.State.ui.viveiroVariedadeEditando = editId || null;

        var propSelect = document.getElementById('viveiro-variedade-propriedade');
        if (propSelect) {
            propSelect.value = propViveiro;
            propSelect.disabled = true;
            propSelect.style.color = 'var(--text)';
            propSelect.style.fontWeight = '600';
        }

        var titleEl = document.getElementById('modal-viveiro-variedade-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Variedade' : '🌱 Nova Variedade';
        
        var nomeEl = document.getElementById('viveiro-variedade-nome');
        if (nomeEl) nomeEl.value = '';
        
        var especieEl = document.getElementById('viveiro-variedade-especie');
        if (especieEl) especieEl.value = '';
        
        var precoEl = document.getElementById('viveiro-variedade-preco');
        if (precoEl) precoEl.value = '0,00';
        
        var estoqueMinEl = document.getElementById('viveiro-variedade-estoque-min');
        if (estoqueMinEl) estoqueMinEl.value = 10;
        
        var tempoProducaoEl = document.getElementById('viveiro-variedade-tempo-producao');
        if (tempoProducaoEl) tempoProducaoEl.value = 90;

        if (editId) {
            var item = (GR.State.data.viveiroVariedades || []).find(function(v) { return v.id === editId; });
            if (item) {
                if (nomeEl) nomeEl.value = item.nome || '';
                if (especieEl) especieEl.value = item.especie || '';
                if (precoEl) precoEl.value = GR.Utils.formatarMoedaSemSimbolo(item.preco || 0);
                if (estoqueMinEl) estoqueMinEl.value = item.estoqueMin || 10;
                if (tempoProducaoEl) tempoProducaoEl.value = item.tempoProducao || 90;
                if (propSelect) propSelect.value = item.propriedade || propViveiro;
            }
        }
        GR.Modal.open('modal-viveiro-variedade');
    },

    // ================================================================
    // SALVAR VARIEDADE
    // ================================================================
    salvarVariedade: function() {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar variedades!');
            return;
        }

        var nomeEl = document.getElementById('viveiro-variedade-nome');
        var especieEl = document.getElementById('viveiro-variedade-especie');
        var precoEl = document.getElementById('viveiro-variedade-preco');
        var estoqueMinEl = document.getElementById('viveiro-variedade-estoque-min');
        var tempoProducaoEl = document.getElementById('viveiro-variedade-tempo-producao');

        if (!nomeEl) {
            GR.Toast.error('Elementos do formulário não encontrados!');
            return;
        }

        var nome = nomeEl.value.trim();
        var especie = especieEl ? especieEl.value.trim() : '';
        var preco = precoEl ? GR.Utils.parseMoedaBR(precoEl.value) : 0;
        var estoqueMin = estoqueMinEl ? parseInt(estoqueMinEl.value) || 10 : 10;
        var tempoProducao = tempoProducaoEl ? parseInt(tempoProducaoEl.value) || 90 : 90;
        var propriedade = this.getPropriedadeAtiva();

        if (!nome || !especie) {
            GR.Toast.error('Nome e Espécie são obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            especie: GR.Utils.escapeHtml(especie),
            preco: preco,
            estoqueMin: estoqueMin,
            tempoProducao: tempoProducao,
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroVariedades');
        var editId = GR.State.ui.viveiroVariedadeEditando;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-variedade');
                GR.Toast.success('Variedade atualizada!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-variedade');
                GR.Toast.success('Variedade registrada!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    // ================================================================
    // EXCLUIR VARIEDADE
    // ================================================================
    excluirVariedade: function(id) {
        if (!this._temPermissao('excluir')) {
            GR.Toast.error('❌ Você não tem permissão para excluir!');
            return;
        }

        if (!confirm('Excluir esta variedade?')) return;

        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('viveiroVariedades').doc(id).delete()
            .then(function() {
                GR.Toast.success('Variedade excluída!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // FUNÇÕES DE PEDIDOS
    // ================================================================
    abrirModalPedido: function(editId) {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar pedidos!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        if (!propViveiro || propViveiro === 'todas') {
            GR.Toast.warning('⚠️ Selecione uma propriedade específica no seletor do topo para criar pedidos!');
            return;
        }

        GR.State.ui.viveiroPedidoEditando = editId || null;
        
        this._popularSelectVariedades('viveiro-pedido-variedade');

        var propSelect = document.getElementById('viveiro-pedido-propriedade');
        if (propSelect) {
            propSelect.value = propViveiro;
            propSelect.disabled = true;
            propSelect.style.color = 'var(--text)';
            propSelect.style.fontWeight = '600';
        }

        var titleEl = document.getElementById('modal-viveiro-pedido-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Pedido' : '📋 Novo Pedido';
        
        var clienteEl = document.getElementById('viveiro-pedido-cliente');
        if (clienteEl) clienteEl.value = '';
        
        var variedadeEl = document.getElementById('viveiro-pedido-variedade');
        if (variedadeEl) variedadeEl.value = '';
        
        var qtdEl = document.getElementById('viveiro-pedido-qtd');
        if (qtdEl) qtdEl.value = 0;
        
        var dataPrevistaEl = document.getElementById('viveiro-pedido-data-prevista');
        if (dataPrevistaEl) dataPrevistaEl.value = '';
        
        var adiantamentoEl = document.getElementById('viveiro-pedido-adiantamento');
        if (adiantamentoEl) adiantamentoEl.value = '0,00';
        
        var valorUnitarioEl = document.getElementById('viveiro-pedido-valor-unitario');
        if (valorUnitarioEl) valorUnitarioEl.value = '0,00';
        
        var statusEl = document.getElementById('viveiro-pedido-status');
        if (statusEl) statusEl.value = 'Pendente';
        
        var obsEl = document.getElementById('viveiro-pedido-obs');
        if (obsEl) obsEl.value = '';

        if (editId) {
            var item = (GR.State.data.viveiroPedidos || []).find(function(p) { return p.id === editId; });
            if (item) {
                if (clienteEl) clienteEl.value = item.cliente || '';
                if (variedadeEl) variedadeEl.value = item.variedade || '';
                if (qtdEl) qtdEl.value = item.quantidade || 0;
                if (dataPrevistaEl) dataPrevistaEl.value = item.dataPrevista || '';
                if (adiantamentoEl) adiantamentoEl.value = GR.Utils.formatarMoedaSemSimbolo(item.adiantamento || 0);
                if (valorUnitarioEl) valorUnitarioEl.value = GR.Utils.formatarMoedaSemSimbolo(item.valorUnitario || 0);
                if (statusEl) statusEl.value = item.status || 'Pendente';
                if (obsEl) obsEl.value = item.obs || '';
                if (propSelect) propSelect.value = item.propriedade || propViveiro;
            }
        }
        GR.Modal.open('modal-viveiro-pedido');
    },

    // ================================================================
    // SALVAR PEDIDO
    // ================================================================
    salvarPedido: function() {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar pedidos!');
            return;
        }

        var clienteEl = document.getElementById('viveiro-pedido-cliente');
        var variedadeEl = document.getElementById('viveiro-pedido-variedade');
        var qtdEl = document.getElementById('viveiro-pedido-qtd');
        var dataPrevistaEl = document.getElementById('viveiro-pedido-data-prevista');
        var adiantamentoEl = document.getElementById('viveiro-pedido-adiantamento');
        var valorUnitarioEl = document.getElementById('viveiro-pedido-valor-unitario');
        var statusEl = document.getElementById('viveiro-pedido-status');
        var obsEl = document.getElementById('viveiro-pedido-obs');

        if (!clienteEl || !variedadeEl || !qtdEl) {
            GR.Toast.error('Elementos do formulário não encontrados!');
            return;
        }

        var cliente = clienteEl.value.trim();
        var variedade = variedadeEl.value;
        var quantidade = parseFloat(qtdEl.value) || 0;
        var dataPrevista = dataPrevistaEl ? dataPrevistaEl.value : '';
        var adiantamento = adiantamentoEl ? GR.Utils.parseMoedaBR(adiantamentoEl.value) : 0;
        var valorUnitario = valorUnitarioEl ? GR.Utils.parseMoedaBR(valorUnitarioEl.value) : 0;
        var status = statusEl ? statusEl.value : 'Pendente';
        var obs = obsEl ? obsEl.value.trim() : '';
        var propriedade = this.getPropriedadeAtiva();

        if (!cliente || !variedade || quantidade <= 0) {
            GR.Toast.error('Preencha todos os campos obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            cliente: GR.Utils.escapeHtml(cliente),
            variedade: GR.Utils.escapeHtml(variedade),
            quantidade: quantidade,
            dataPrevista: dataPrevista,
            adiantamento: adiantamento,
            valorUnitario: valorUnitario,
            status: status,
            obs: GR.Utils.escapeHtml(obs),
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroPedidos');
        var editId = GR.State.ui.viveiroPedidoEditando;

        var self = this;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-pedido');
                GR.Toast.success('Pedido atualizado!');
                self.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-pedido');
                GR.Toast.success('Pedido registrado!');
                
                if (adiantamento > 0) {
                    var caixaRef = db.collection('users').doc(uid).collection('viveiroCaixa');
                    caixaRef.add({
                        descricao: 'Adiantamento pedido - ' + cliente + ' (' + variedade + ')',
                        data: new Date().toISOString().split('T')[0],
                        tipo: 'receita',
                        categoria: 'Adiantamento',
                        valor: adiantamento,
                        propriedade: GR.Utils.escapeHtml(propriedade),
                        dataCriacao: GR.Utils.now(),
                        pedidoId: 'auto'
                    }).catch(function(err) {
                        console.warn('Erro ao registrar adiantamento no caixa:', err);
                    });
                }
                
                self.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    // ================================================================
    // EXCLUIR PEDIDO
    // ================================================================
    excluirPedido: function(id) {
        if (!this._temPermissao('excluir')) {
            GR.Toast.error('❌ Você não tem permissão para excluir!');
            return;
        }

        if (!confirm('Excluir este pedido?')) return;

        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('viveiroPedidos').doc(id).delete()
            .then(function() {
                GR.Toast.success('Pedido excluído!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // CONVERTER PEDIDO EM VENDA
    // ================================================================
    abrirConverterPedido: function(pedidoId) {
        if (!pedidoId) {
            GR.Toast.error('ID do pedido não informado!');
            return;
        }

        var pedido = (GR.State.data.viveiroPedidos || []).find(function(p) { return p.id === pedidoId; });
        if (!pedido) {
            GR.Toast.error('Pedido não encontrado!');
            return;
        }

        GR.State.ui.viveiroPedidoConvertendo = pedidoId;
        
        var content = document.getElementById('converter-pedido-content');
        if (!content) return;
        
        var propViveiro = this.getPropriedadeAtiva();
        var mudas = GR.State.data.viveiroMudas || [];
        
        if (propViveiro !== 'todas') {
            mudas = mudas.filter(function(m) { return m.propriedade === propViveiro; });
        }
        
        var estoqueDisponivel = 0;
        mudas.forEach(function(m) {
            if (m.variedade === pedido.variedade && m.status === 'Pronta') {
                estoqueDisponivel += (m.quantidade || 0);
            }
        });
        
        content.innerHTML = `
            <div style="background:#f5f5f5;padding:12px;border-radius:6px;margin-bottom:12px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">
                    <div><strong>Cliente:</strong> ${GR.Utils.escapeHtml(pedido.cliente)}</div>
                    <div><strong>Variedade:</strong> ${GR.Utils.escapeHtml(pedido.variedade)}</div>
                    <div><strong>Quantidade Pedida:</strong> ${pedido.quantidade || 0}</div>
                    <div><strong>Estoque Disponível:</strong> <span style="color:${estoqueDisponivel >= pedido.quantidade ? '#4CAF50' : '#f44336'};font-weight:700;">${estoqueDisponivel}</span></div>
                    <div><strong>Adiantamento:</strong> ${GR.Utils.formatarMoedaBR(pedido.adiantamento || 0)}</div>
                    <div><strong>Status:</strong> ${pedido.status}</div>
                </div>
            </div>
            <div style="margin-top:8px;padding:8px;background:#fff3e0;border-radius:4px;border-left:4px solid #FF9800;font-size:11px;">
                <strong>⚠️ Atenção:</strong> Ao converter este pedido em venda, o estoque será baixado automaticamente.
                ${estoqueDisponivel < pedido.quantidade ? '<br><span style="color:#f44336;">⚠️ Estoque insuficiente para atender o pedido!</span>' : ''}
            </div>
            <div style="margin-top:8px;">
                <label style="font-size:11px;">Quantidade a vender:</label>
                <input type="number" id="converter-qtd-venda" class="form-control" value="${pedido.quantidade}" min="1" max="${estoqueDisponivel}" style="max-width:150px;">
            </div>
            <div style="margin-top:8px;">
                <label style="font-size:11px;">Valor Unitário:</label>
                <input type="text" id="converter-valor-unitario" class="form-control" oninput="GR.Utils.formatarMoedaInput(this)" placeholder="0,00" value="${GR.Utils.formatarMoedaSemSimbolo(pedido.valorUnitario || 0)}" style="max-width:150px;">
            </div>
        `;
        
        GR.Modal.open('modal-viveiro-converter-pedido');
    },

    // ================================================================
    // CONFIRMAR CONVERTER PEDIDO
    // ================================================================
    confirmarConverterPedido: function() {
        var pedidoId = GR.State.ui.viveiroPedidoConvertendo;
        if (!pedidoId) {
            GR.Toast.error('Nenhum pedido selecionado!');
            return;
        }

        var pedido = (GR.State.data.viveiroPedidos || []).find(function(p) { return p.id === pedidoId; });
        if (!pedido) {
            GR.Toast.error('Pedido não encontrado!');
            return;
        }

        var qtdVenda = parseInt(document.getElementById('converter-qtd-venda').value) || pedido.quantidade;
        var valorUnitario = GR.Utils.parseMoedaBR(document.getElementById('converter-valor-unitario').value);
        
        if (qtdVenda <= 0) {
            GR.Toast.error('Quantidade inválida!');
            return;
        }

        if (valorUnitario <= 0) {
            GR.Toast.error('Valor unitário inválido!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        var mudas = GR.State.data.viveiroMudas || [];
        
        if (propViveiro !== 'todas') {
            mudas = mudas.filter(function(m) { return m.propriedade === propViveiro; });
        }
        
        var estoqueDisponivel = 0;
        mudas.forEach(function(m) {
            if (m.variedade === pedido.variedade && m.status === 'Pronta') {
                estoqueDisponivel += (m.quantidade || 0);
            }
        });
        
        if (qtdVenda > estoqueDisponivel) {
            GR.Toast.error('⚠️ Estoque insuficiente! Disponível: ' + estoqueDisponivel);
            return;
        }

        if (!confirm('Confirmar venda de ' + qtdVenda + ' mudas de ' + pedido.variedade + ' para ' + pedido.cliente + '?')) {
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var valorTotal = qtdVenda * valorUnitario;

        var vendaData = {
            numeroNota: 'PED-' + pedidoId.substring(0, 6),
            data: new Date().toISOString().split('T')[0],
            comprador: pedido.cliente,
            variedade: pedido.variedade,
            quantidade: qtdVenda,
            valorUnitario: valorUnitario,
            valorTotal: valorTotal,
            pedidoId: pedidoId,
            propriedade: propViveiro,
            dataCriacao: GR.Utils.now()
        };

        var vendaRef = db.collection('users').doc(uid).collection('viveiroVendas');
        var self = this;

        vendaRef.add(vendaData).then(function() {
            var mudasProntas = mudas.filter(function(m) { 
                return m.variedade === pedido.variedade && m.status === 'Pronta';
            });
            
            var qtdRestante = qtdVenda;
            var promises = [];
            
            for (var i = 0; i < mudasProntas.length && qtdRestante > 0; i++) {
                var m = mudasProntas[i];
                var qtdBaixar = Math.min(m.quantidade || 0, qtdRestante);
                if (qtdBaixar > 0) {
                    var novaQtd = (m.quantidade || 0) - qtdBaixar;
                    if (novaQtd <= 0) {
                        promises.push(db.collection('users').doc(uid).collection('viveiroMudas').doc(m.id).update({
                            status: 'Vendida',
                            quantidade: 0
                        }));
                    } else {
                        promises.push(db.collection('users').doc(uid).collection('viveiroMudas').doc(m.id).update({
                            quantidade: novaQtd
                        }));
                    }
                    qtdRestante -= qtdBaixar;
                }
            }

            promises.push(db.collection('users').doc(uid).collection('viveiroPedidos').doc(pedidoId).update({
                status: 'Entregue',
                dataEntrega: new Date().toISOString().split('T')[0]
            }));

            var caixaRef = db.collection('users').doc(uid).collection('viveiroCaixa');
            promises.push(caixaRef.add({
                descricao: 'Venda convertida do pedido - ' + pedido.cliente + ' (' + pedido.variedade + ')',
                data: new Date().toISOString().split('T')[0],
                tipo: 'receita',
                categoria: 'Venda de Mudas',
                valor: valorTotal,
                propriedade: propViveiro,
                dataCriacao: GR.Utils.now(),
                vendaId: 'auto',
                pedidoId: pedidoId
            }).catch(function(err) {
                console.warn('Erro ao registrar no caixa:', err);
            }));

            Promise.all(promises).then(function() {
                GR.Modal.close('modal-viveiro-converter-pedido');
                GR.Toast.success('✅ Pedido convertido em venda com sucesso!');
                self.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao processar venda: ' + err.message);
            });

        }).catch(function(err) {
            GR.Toast.error('Erro ao registrar venda: ' + err.message);
        });
    },

    // ================================================================
    // FUNÇÕES CRUD - MANTIDAS COMPLETAS
    // ================================================================
    abrirModalMuda: function(editId) {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar mudas!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        if (!propViveiro || propViveiro === 'todas') {
            GR.Toast.warning('⚠️ Selecione uma propriedade específica no seletor do topo para criar mudas!');
            return;
        }

        GR.State.ui.viveiroMudaEditando = editId || null;
        
        this._popularSelectVariedades('viveiro-muda-variedade');

        var propSelect = document.getElementById('viveiro-muda-propriedade');
        if (propSelect) {
            propSelect.value = propViveiro;
            propSelect.disabled = true;
            propSelect.style.color = 'var(--text)';
            propSelect.style.fontWeight = '600';
        }

        var titleEl = document.getElementById('modal-viveiro-muda-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Muda' : '🌱 Nova Muda';
        
        var especieEl = document.getElementById('viveiro-muda-especie');
        if (especieEl) especieEl.value = '';
        
        var variedadeEl = document.getElementById('viveiro-muda-variedade');
        if (variedadeEl) variedadeEl.value = '';
        
        var qtdEl = document.getElementById('viveiro-muda-qtd');
        if (qtdEl) qtdEl.value = 0;
        
        var dataEl = document.getElementById('viveiro-muda-data-producao');
        if (dataEl) dataEl.value = new Date().toISOString().split('T')[0];
        
        var statusEl = document.getElementById('viveiro-muda-status');
        if (statusEl) statusEl.value = 'Produção';
        
        var obsEl = document.getElementById('viveiro-muda-obs');
        if (obsEl) obsEl.value = '';

        if (editId) {
            var item = (GR.State.data.viveiroMudas || []).find(function(m) { return m.id === editId; });
            if (item) {
                if (especieEl) especieEl.value = item.especie || '';
                if (variedadeEl) variedadeEl.value = item.variedade || '';
                if (qtdEl) qtdEl.value = item.quantidade || 0;
                if (dataEl) dataEl.value = item.dataProducao || '';
                if (statusEl) statusEl.value = item.status || 'Produção';
                if (obsEl) obsEl.value = item.obs || '';
                if (propSelect) propSelect.value = item.propriedade || propViveiro;
            }
        }
        GR.Modal.open('modal-viveiro-muda');
    },

    salvarMuda: function() {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar mudas!');
            return;
        }

        var especieEl = document.getElementById('viveiro-muda-especie');
        var qtdEl = document.getElementById('viveiro-muda-qtd');
        var dataEl = document.getElementById('viveiro-muda-data-producao');
        var statusEl = document.getElementById('viveiro-muda-status');
        var obsEl = document.getElementById('viveiro-muda-obs');
        var variedadeEl = document.getElementById('viveiro-muda-variedade');

        if (!especieEl || !qtdEl) {
            GR.Toast.error('Elementos do formulário não encontrados!');
            return;
        }

        var especie = especieEl.value.trim();
        var quantidade = parseFloat(qtdEl.value) || 0;
        var dataProducao = dataEl ? dataEl.value : '';
        var status = statusEl ? statusEl.value : 'Produção';
        var obs = obsEl ? obsEl.value.trim() : '';
        var variedade = variedadeEl ? variedadeEl.value.trim() : '';
        var propriedade = this.getPropriedadeAtiva();

        if (!especie || quantidade <= 0) {
            GR.Toast.error('Preencha todos os campos obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            especie: GR.Utils.escapeHtml(especie),
            variedade: GR.Utils.escapeHtml(variedade),
            quantidade: quantidade,
            dataProducao: dataProducao,
            status: status,
            propriedade: GR.Utils.escapeHtml(propriedade),
            obs: GR.Utils.escapeHtml(obs),
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroMudas');
        var editId = GR.State.ui.viveiroMudaEditando;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-muda');
                GR.Toast.success('Muda atualizada!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-muda');
                GR.Toast.success('Muda registrada!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    abrirModalInsumo: function(editId) {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar insumos!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        if (!propViveiro || propViveiro === 'todas') {
            GR.Toast.warning('⚠️ Selecione uma propriedade específica no seletor do topo para criar insumos!');
            return;
        }

        GR.State.ui.viveiroInsumoEditando = editId || null;

        var propSelect = document.getElementById('viveiro-insumo-propriedade');
        if (propSelect) {
            propSelect.value = propViveiro;
            propSelect.disabled = true;
            propSelect.style.color = 'var(--text)';
            propSelect.style.fontWeight = '600';
        }

        var titleEl = document.getElementById('modal-viveiro-insumo-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Insumo' : '📦 Novo Insumo';
        
        var nomeEl = document.getElementById('viveiro-insumo-nome');
        if (nomeEl) nomeEl.value = '';
        
        var tipoEl = document.getElementById('viveiro-insumo-tipo');
        if (tipoEl) tipoEl.value = 'Substrato';
        
        var qtdEl = document.getElementById('viveiro-insumo-qtd');
        if (qtdEl) qtdEl.value = 0;
        
        var unidadeEl = document.getElementById('viveiro-insumo-unidade');
        if (unidadeEl) unidadeEl.value = 'kg';
        
        var precoEl = document.getElementById('viveiro-insumo-preco');
        if (precoEl) precoEl.value = '0,00';
        
        var fornecedorEl = document.getElementById('viveiro-insumo-fornecedor-id');
        if (fornecedorEl) fornecedorEl.value = '';
        
        var validadeEl = document.getElementById('viveiro-insumo-validade');
        if (validadeEl) validadeEl.value = '';

        if (editId) {
            var item = (GR.State.data.viveiroInsumos || []).find(function(i) { return i.id === editId; });
            if (item) {
                if (nomeEl) nomeEl.value = item.nome || '';
                if (tipoEl) tipoEl.value = item.tipo || 'Substrato';
                if (qtdEl) qtdEl.value = item.quantidade || 0;
                if (unidadeEl) unidadeEl.value = item.unidade || 'kg';
                if (precoEl) precoEl.value = GR.Utils.formatarMoedaSemSimbolo(item.preco || 0);
                if (fornecedorEl) fornecedorEl.value = item.fornecedorId || '';
                if (validadeEl) validadeEl.value = item.validade || '';
                if (propSelect) propSelect.value = item.propriedade || propViveiro;
            }
        }
        GR.Modal.open('modal-viveiro-insumo');
    },

    salvarInsumo: function() {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar insumos!');
            return;
        }

        var nomeEl = document.getElementById('viveiro-insumo-nome');
        var qtdEl = document.getElementById('viveiro-insumo-qtd');
        var unidadeEl = document.getElementById('viveiro-insumo-unidade');
        var precoEl = document.getElementById('viveiro-insumo-preco');
        var tipoEl = document.getElementById('viveiro-insumo-tipo');
        var fornecedorEl = document.getElementById('viveiro-insumo-fornecedor-id');
        var validadeEl = document.getElementById('viveiro-insumo-validade');

        if (!nomeEl || !qtdEl) {
            GR.Toast.error('Elementos do formulário não encontrados!');
            return;
        }

        var nome = nomeEl.value.trim();
        var quantidade = parseFloat(qtdEl.value) || 0;
        var unidade = unidadeEl ? unidadeEl.value : 'kg';
        var preco = precoEl ? GR.Utils.parseMoedaBR(precoEl.value) : 0;
        var tipo = tipoEl ? tipoEl.value : 'Substrato';
        var fornecedorId = fornecedorEl ? fornecedorEl.value : '';
        var validade = validadeEl ? validadeEl.value : '';
        var propriedade = this.getPropriedadeAtiva();

        if (!nome || quantidade <= 0) {
            GR.Toast.error('Preencha todos os campos obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            tipo: tipo,
            quantidade: quantidade,
            unidade: unidade,
            preco: preco,
            fornecedorId: fornecedorId,
            validade: validade,
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroInsumos');
        var editId = GR.State.ui.viveiroInsumoEditando;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-insumo');
                GR.Toast.success('Insumo atualizado!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-insumo');
                GR.Toast.success('Insumo registrado!');
                var caixaRef = db.collection('users').doc(uid).collection('viveiroCaixa');
                caixaRef.add({
                    descricao: 'Compra de insumo: ' + nome,
                    data: new Date().toISOString().split('T')[0],
                    tipo: 'despesa',
                    categoria: 'Insumos',
                    valor: preco * quantidade,
                    propriedade: GR.Utils.escapeHtml(propriedade),
                    dataCriacao: GR.Utils.now()
                }).catch(function(err) {
                    console.warn('Erro ao registrar no caixa:', err);
                });
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    abrirModalServico: function(editId) {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar serviços!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        if (!propViveiro || propViveiro === 'todas') {
            GR.Toast.warning('⚠️ Selecione uma propriedade específica no seletor do topo para criar serviços!');
            return;
        }

        GR.State.ui.viveiroServicoEditando = editId || null;
        
        this._popularSelectTrabalhadores();
        this._popularSelectVariedades('viveiro-servico-variedade');

        var propSelect = document.getElementById('viveiro-servico-propriedade');
        if (propSelect) {
            propSelect.value = propViveiro;
            propSelect.disabled = true;
            propSelect.style.color = 'var(--text)';
            propSelect.style.fontWeight = '600';
        }

        var titleEl = document.getElementById('modal-viveiro-servico-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Serviço' : '🔧 Novo Serviço';
        
        var descEl = document.getElementById('viveiro-servico-desc');
        if (descEl) descEl.value = '';
        
        var dataEl = document.getElementById('viveiro-servico-data');
        if (dataEl) dataEl.value = new Date().toISOString().split('T')[0];
        
        var periodoEl = document.getElementById('viveiro-servico-periodo');
        if (periodoEl) periodoEl.value = 'Germinação';
        
        var trabalhadorEl = document.getElementById('viveiro-servico-trabalhador');
        if (trabalhadorEl) trabalhadorEl.value = '';
        
        var variedadeServicoEl = document.getElementById('viveiro-servico-variedade');
        if (variedadeServicoEl) variedadeServicoEl.value = '';
        
        var custoEl = document.getElementById('viveiro-servico-custo');
        if (custoEl) custoEl.value = '0,00';
        
        var obsEl = document.getElementById('viveiro-servico-obs');
        if (obsEl) obsEl.value = '';

        if (editId) {
            var item = (GR.State.data.viveiroServicos || []).find(function(s) { return s.id === editId; });
            if (item) {
                if (descEl) descEl.value = item.descricao || '';
                if (dataEl) dataEl.value = item.data || '';
                if (periodoEl) periodoEl.value = item.periodo || 'Germinação';
                if (trabalhadorEl) trabalhadorEl.value = item.trabalhadorId || '';
                if (variedadeServicoEl) variedadeServicoEl.value = item.variedade || '';
                if (custoEl) custoEl.value = GR.Utils.formatarMoedaSemSimbolo(item.custo || 0);
                if (obsEl) obsEl.value = item.obs || '';
                if (propSelect) propSelect.value = item.propriedade || propViveiro;
            }
        }
        GR.Modal.open('modal-viveiro-servico');
    },

    salvarServico: function() {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar serviços!');
            return;
        }

        var descEl = document.getElementById('viveiro-servico-desc');
        var dataEl = document.getElementById('viveiro-servico-data');
        var periodoEl = document.getElementById('viveiro-servico-periodo');
        var trabalhadorEl = document.getElementById('viveiro-servico-trabalhador');
        var variedadeServicoEl = document.getElementById('viveiro-servico-variedade');
        var custoEl = document.getElementById('viveiro-servico-custo');
        var obsEl = document.getElementById('viveiro-servico-obs');

        if (!descEl || !dataEl) {
            GR.Toast.error('Elementos do formulário não encontrados!');
            return;
        }

        var descricao = descEl.value.trim();
        var data = dataEl.value;
        var periodo = periodoEl ? periodoEl.value : 'Germinação';
        var trabalhadorId = trabalhadorEl ? trabalhadorEl.value : '';
        var variedade = variedadeServicoEl ? variedadeServicoEl.value : '';
        var custo = custoEl ? GR.Utils.parseMoedaBR(custoEl.value) : 0;
        var obs = obsEl ? obsEl.value.trim() : '';
        var propriedade = this.getPropriedadeAtiva();

        if (!descricao || !data) {
            GR.Toast.error('Preencha todos os campos obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            descricao: GR.Utils.escapeHtml(descricao),
            data: data,
            periodo: periodo,
            trabalhadorId: trabalhadorId,
            variedade: GR.Utils.escapeHtml(variedade),
            custo: custo,
            propriedade: GR.Utils.escapeHtml(propriedade),
            obs: GR.Utils.escapeHtml(obs),
            status: 'Concluído',
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroServicos');
        var editId = GR.State.ui.viveiroServicoEditando;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-servico');
                GR.Toast.success('Serviço atualizado!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-servico');
                GR.Toast.success('Serviço registrado!');
                if (custo > 0) {
                    var caixaRef = db.collection('users').doc(uid).collection('viveiroCaixa');
                    caixaRef.add({
                        descricao: 'Serviço: ' + descricao + (variedade ? ' (' + variedade + ')' : ''),
                        data: data,
                        tipo: 'despesa',
                        categoria: 'Serviços',
                        valor: custo,
                        propriedade: GR.Utils.escapeHtml(propriedade),
                        dataCriacao: GR.Utils.now()
                    }).catch(function(err) {
                        console.warn('Erro ao registrar no caixa:', err);
                    });
                }
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    abrirModalTrabalhador: function(editId) {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar trabalhadores!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        if (!propViveiro || propViveiro === 'todas') {
            GR.Toast.warning('⚠️ Selecione uma propriedade específica no seletor do topo para criar trabalhadores!');
            return;
        }

        GR.State.ui.viveiroTrabalhadorEditando = editId || null;

        var propSelect = document.getElementById('viveiro-trabalhador-propriedade');
        if (propSelect) {
            propSelect.value = propViveiro;
            propSelect.disabled = true;
            propSelect.style.color = 'var(--text)';
            propSelect.style.fontWeight = '600';
        }

        var titleEl = document.getElementById('modal-viveiro-trabalhador-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Trabalhador' : '👤 Novo Trabalhador';
        
        var nomeEl = document.getElementById('viveiro-trabalhador-nome');
        if (nomeEl) nomeEl.value = '';
        
        var cpfEl = document.getElementById('viveiro-trabalhador-cpf');
        if (cpfEl) cpfEl.value = '';
        
        var funcaoEl = document.getElementById('viveiro-trabalhador-funcao');
        if (funcaoEl) funcaoEl.value = '';
        
        var dddEl = document.getElementById('viveiro-trabalhador-ddd');
        if (dddEl) dddEl.value = '';
        
        var telEl = document.getElementById('viveiro-trabalhador-tel');
        if (telEl) telEl.value = '';
        
        var admissaoEl = document.getElementById('viveiro-trabalhador-admissao');
        if (admissaoEl) admissaoEl.value = '';

        if (editId) {
            var item = (GR.State.data.viveiroTrabalhadores || []).find(function(t) { return t.id === editId; });
            if (item) {
                if (nomeEl) nomeEl.value = item.nome || '';
                if (cpfEl) cpfEl.value = item.cpf || '';
                if (funcaoEl) funcaoEl.value = item.funcao || '';
                if (item.telefone) {
                    if (dddEl) dddEl.value = item.telefone.ddd || '';
                    if (telEl) telEl.value = item.telefone.numero || '';
                }
                if (admissaoEl) admissaoEl.value = item.admissao || '';
                if (propSelect) propSelect.value = item.propriedade || propViveiro;
            }
        }
        GR.Modal.open('modal-viveiro-trabalhador');
    },

    salvarTrabalhador: function() {
        if (!this._temPermissao('criar')) {
            GR.Toast.error('❌ Você não tem permissão para criar trabalhadores!');
            return;
        }

        var nomeEl = document.getElementById('viveiro-trabalhador-nome');
        var cpfEl = document.getElementById('viveiro-trabalhador-cpf');
        var funcaoEl = document.getElementById('viveiro-trabalhador-funcao');
        var dddEl = document.getElementById('viveiro-trabalhador-ddd');
        var telEl = document.getElementById('viveiro-trabalhador-tel');
        var admissaoEl = document.getElementById('viveiro-trabalhador-admissao');

        if (!nomeEl) {
            GR.Toast.error('Elementos do formulário não encontrados!');
            return;
        }

        var nome = nomeEl.value.trim();
        var cpf = cpfEl ? cpfEl.value.trim() : '';
        var funcao = funcaoEl ? funcaoEl.value.trim() : '';
        var ddd = dddEl ? dddEl.value.trim() : '';
        var telefone = telEl ? telEl.value.trim() : '';
        var admissao = admissaoEl ? admissaoEl.value : '';
        var propriedade = this.getPropriedadeAtiva();

        if (!nome) {
            GR.Toast.error('Nome é obrigatório!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            cpf: GR.Utils.escapeHtml(cpf),
            funcao: GR.Utils.escapeHtml(funcao),
            telefone: { ddd: ddd, numero: telefone },
            admissao: admissao,
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroTrabalhadores');
        var editId = GR.State.ui.viveiroTrabalhadorEditando;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-trabalhador');
                GR.Toast.success('Trabalhador atualizado!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-trabalhador');
                GR.Toast.success('Trabalhador registrado!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    // ================================================================
    // EXCLUIR (GENÉRICO)
    // ================================================================
    excluir: function(tipo, id) {
        if (!this._temPermissao('excluir')) {
            GR.Toast.error('❌ Você não tem permissão para excluir!');
            return;
        }

        if (!confirm('Excluir este ' + tipo + '?')) return;

        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        var colecoes = {
            'muda': 'viveiroMudas',
            'insumo': 'viveiroInsumos',
            'servico': 'viveiroServicos',
            'trabalhador': 'viveiroTrabalhadores',
            'variedade': 'viveiroVariedades',
            'pedido': 'viveiroPedidos'
        };

        var col = colecoes[tipo];
        if (!col) {
            GR.Toast.error('Tipo inválido!');
            return;
        }

        db.collection('users').doc(uid).collection(col).doc(id).delete()
            .then(function() {
                GR.Toast.success(tipo.charAt(0).toUpperCase() + tipo.slice(1) + ' excluído!');
                GR.Modules.Viveiro.render();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // EXPORTAR DADOS
    // ================================================================
    exportarDados: function() {
        if (!this._temPermissao('exportar')) {
            GR.Toast.error('❌ Você não tem permissão para exportar!');
            return;
        }

        var propViveiro = this.getPropriedadeAtiva();
        var dados = {
            mudas: GR.State.data.viveiroMudas || [],
            insumos: GR.State.data.viveiroInsumos || [],
            servicos: GR.State.data.viveiroServicos || [],
            trabalhadores: GR.State.data.viveiroTrabalhadores || [],
            vendas: GR.State.data.viveiroVendas || [],
            caixa: GR.State.data.viveiroCaixa || [],
            variedades: GR.State.data.viveiroVariedades || [],
            pedidos: GR.State.data.viveiroPedidos || [],
            exportadoEm: new Date().toLocaleString('pt-BR'),
            propriedadeAtiva: propViveiro
        };

        var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'viveiro_export_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        GR.Toast.success('✅ Dados exportados!');
    },

    // ================================================================
    // ON FORNECEDOR SELECIONADO (PARA MODAIS)
    // ================================================================
    _onFornecedorSelecionado: function() {
        // Função para preencher dados do fornecedor quando selecionado
    }
};

console.log('✅ Módulo Viveiro carregado com propriedade GLOBAL e vendas corrigidas!');
console.log('📌 Melhorias aplicadas:');
console.log('   - 🏠 Propriedade GLOBAL do módulo (selecionada no topo)');
console.log('   - 🔒 Seletor de propriedade com permissão (Master/Admin podem alterar)');
console.log('   - 🚫 Propriedade removida de TODOS os cadastros (usa a global)');
console.log('   - ✅ Correção do botão "Nova Venda" (agora funciona)');
console.log('   - ✅ Correção do modal de venda (todos os campos)');
console.log('   - ✅ Correção do modal de pedido');
console.log('   - ✅ Todas as funções CRUD mantidas');
console.log('   - 📊 Dashboard de variedades e idade');
console.log('   - 🔄 Sistema de pedidos (reservas)');
console.log('   - 📄 NF de Produtor Rural');
console.log('   - 💰 Integração automática com caixa');
console.log('   - 🔄 Persistência da propriedade no localStorage');