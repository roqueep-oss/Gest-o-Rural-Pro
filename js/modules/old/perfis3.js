// ================================================================
// PERFIS - SISTEMA DE PERFIS DE USUÁRIOS (FIREBASE)
// ================================================================
// Versão: 2.2 - Com permissões para Viveiro (produção, vendas, caixa)
// ================================================================

if (typeof GR === 'undefined') {
    var GR = {};
}

if (typeof GR.Modules === 'undefined') {
    GR.Modules = {};
}

GR.Modules.Perfis = {
    // ================================================================
    // LISTA DE MÓDULOS/ABAS DO SISTEMA
    // ================================================================
    modulos: [
        { id: 'dashboard', nome: '📊 Painel', icon: '📊' },
        { id: 'acoes', nome: '📋 Ações', icon: '📋' },
        { id: 'orcamentos', nome: '💰 Orçamentos', icon: '💰' },
        { id: 'credito', nome: '💳 Crédito', icon: '💳' },
        { id: 'insumos', nome: '🧪 Insumos', icon: '🧪' },
        { id: 'pecuaria', nome: '🐄 Pecuária', icon: '🐄' },
        { id: 'funcionarios', nome: '👨‍🌾 Funcionários', icon: '👨‍🌾' },
        { id: 'parceiros', nome: '👥 Parceiros', icon: '👥' },
        { id: 'contabilidade', nome: '🧾 Contabilidade', icon: '🧾' },
        { id: 'documentos', nome: '📁 Documentos', icon: '📁' },
        { id: 'analises', nome: '🧪 Análises', icon: '🧪' },
        { id: 'viveiro', nome: '🌱 Viveiro', icon: '🌱' },
        { id: 'relatorios', nome: '📊 Relatórios', icon: '📊' },
        { id: 'configuracoes', nome: '⚙️ Config.', icon: '⚙️' },
        { id: 'historico', nome: '📜 Histórico', icon: '📜' },
        { id: 'nfe', nome: '📄 NF-e', icon: '📄' }
    ],

    // ================================================================
    // AÇÕES DISPONÍVEIS PARA CADA MÓDULO
    // ================================================================
    acoes: [
        { id: 'ver', nome: '👁️ Ver', icon: '👁️' },
        { id: 'criar', nome: '➕ Criar', icon: '➕' },
        { id: 'editar', nome: '✏️ Editar', icon: '✏️' },
        { id: 'excluir', nome: '🗑️ Excluir', icon: '🗑️' },
        { id: 'exportar', nome: '📤 Exportar', icon: '📤' },
        { id: 'imprimir', nome: '🖨️ Imprimir', icon: '🖨️' }
    ],

    // ================================================================
    // PERFIS PADRÃO (COM PERMISSÕES DO VIVEIRO)
    // ================================================================
    perfisPadrao: {
        master: {
            id: 'master',
            nome: '👑 Master',
            nivel: 100,
            descricao: 'Controle total do sistema',
            cor: '#d32f2f',
            fixo: true,
            propriedadesPermitidas: null, // null = todas as propriedades
            permissoes: {
                ver: ['*'],
                criar: ['*'],
                editar: ['*'],
                excluir: ['*'],
                exportar: ['*'],
                imprimir: ['*'],
                zerarBanco: true,
                gerenciarUsuarios: true,
                gerenciarPerfis: true,
                // 🆕 PERMISSÕES DO VIVEIRO
                viveiro_producao: true,
                viveiro_vendas: true,
                viveiro_caixa: true,
                viveiro_relatorios: true,
                viveiro_exportar: true
            }
        },
        admin: {
            id: 'admin',
            nome: '👨‍💼 Administrador',
            nivel: 90,
            descricao: 'Gerenciamento geral do sistema',
            cor: '#1976d2',
            fixo: true,
            propriedadesPermitidas: null, // null = todas as propriedades
            permissoes: {
                ver: ['*'],
                criar: ['*'],
                editar: ['*'],
                excluir: ['*'],
                exportar: ['*'],
                imprimir: ['*'],
                zerarBanco: false,
                gerenciarUsuarios: true,
                gerenciarPerfis: true,
                // 🆕 PERMISSÕES DO VIVEIRO
                viveiro_producao: true,
                viveiro_vendas: true,
                viveiro_caixa: true,
                viveiro_relatorios: true,
                viveiro_exportar: true
            }
        },
        gerente: {
            id: 'gerente',
            nome: '👨‍🌾 Gerente',
            nivel: 70,
            descricao: 'Operações do dia a dia',
            cor: '#388e3c',
            fixo: true,
            propriedadesPermitidas: null, // null = todas as propriedades
            permissoes: {
                ver: ['*'],
                criar: ['acoes', 'orcamentos', 'insumos', 'funcionarios', 'documentos'],
                editar: ['acoes', 'orcamentos', 'insumos', 'funcionarios', 'documentos'],
                excluir: [],
                exportar: ['relatorios'],
                imprimir: ['relatorios'],
                zerarBanco: false,
                gerenciarUsuarios: false,
                gerenciarPerfis: false,
                // 🆕 PERMISSÕES DO VIVEIRO
                viveiro_producao: true,
                viveiro_vendas: true,
                viveiro_caixa: true,
                viveiro_relatorios: true,
                viveiro_exportar: true
            }
        },
        operador: {
            id: 'operador',
            nome: '👷 Operador',
            nivel: 50,
            descricao: 'Operador - Acesso personalizado',
            cor: '#f57c00',
            fixo: true,
            propriedadesPermitidas: null, // null = todas as propriedades
            permissoes: {
                ver: ['dashboard', 'acoes', 'insumos', 'pecuaria'],
                criar: [],
                editar: [],
                excluir: [],
                exportar: [],
                imprimir: [],
                zerarBanco: false,
                gerenciarUsuarios: false,
                gerenciarPerfis: false,
                // 🆕 PERMISSÕES DO VIVEIRO
                viveiro_producao: true,
                viveiro_vendas: false,
                viveiro_caixa: false,
                viveiro_relatorios: false,
                viveiro_exportar: false
            }
        },
        visitante: {
            id: 'visitante',
            nome: '👀 Visitante',
            nivel: 30,
            descricao: 'Acesso limitado - apenas visualização',
            cor: '#78909c',
            fixo: true,
            propriedadesPermitidas: null, // null = todas as propriedades
            permissoes: {
                ver: ['dashboard'],
                criar: [],
                editar: [],
                excluir: [],
                exportar: [],
                imprimir: [],
                zerarBanco: false,
                gerenciarUsuarios: false,
                gerenciarPerfis: false,
                // 🆕 PERMISSÕES DO VIVEIRO
                viveiro_producao: true,
                viveiro_vendas: false,
                viveiro_caixa: false,
                viveiro_relatorios: false,
                viveiro_exportar: false
            }
        }
    },

    // ================================================================
    // PERFIL ATUAL DO USUÁRIO
    // ================================================================
    perfilAtual: null,
    perfis: null,
    perfisPersonalizados: {},

    // ================================================================
    // INICIALIZAR PERFIS (COM FIREBASE)
    // ================================================================
    init: function() {
        console.log('🔐 Inicializando sistema de perfis...');
        var self = this;
        
        var user = firebase.auth().currentUser;
        if (!user) {
            console.log('⚠️ Usuário não logado, usando perfis padrão');
            this.perfis = JSON.parse(JSON.stringify(this.perfisPadrao));
            this.perfilAtual = this.perfis.visitante;
            return;
        }
        
        // Tenta carregar perfis do Firestore
        var ref = db.collection('users').doc(user.uid).collection('config').doc('perfis');
        
        ref.get()
            .then(function(doc) {
                if (doc.exists) {
                    var data = doc.data();
                    self.perfis = data.perfis || JSON.parse(JSON.stringify(self.perfisPadrao));
                    self.perfisPersonalizados = data.perfisPersonalizados || {};
                    console.log('📋 Perfis carregados do Firestore');
                } else {
                    // Primeira vez: salva os perfis padrão
                    self.perfis = JSON.parse(JSON.stringify(self.perfisPadrao));
                    self.perfisPersonalizados = {};
                    return ref.set({ 
                        perfis: self.perfis,
                        perfisPersonalizados: self.perfisPersonalizados,
                        atualizadoEm: new Date().toISOString()
                    });
                }
            })
            .then(function() {
                // Carrega o perfil do usuário
                return self._carregarPerfilUsuario(user.uid);
            })
            .catch(function(err) {
                console.error('❌ Erro ao carregar perfis:', err);
                self.perfis = JSON.parse(JSON.stringify(self.perfisPadrao));
                self.perfilAtual = self.perfis.operador;
            });
    },

    // ================================================================
    // CARREGAR PERFIL DO USUÁRIO (FIREBASE)
    // ================================================================
    _carregarPerfilUsuario: function(uid) {
        var self = this;
        
        return db.collection('users').doc(uid).get()
            .then(function(doc) {
                if (doc.exists) {
                    var userData = doc.data();
                    var perfilId = userData.perfil || 'operador';
                    self.perfilAtual = self.perfis[perfilId] || self.perfis.operador;
                    console.log('👤 Perfil do usuário:', self.perfilAtual.nome);
                    console.log('📋 Permissões:', self.perfilAtual.permissoes);
                    console.log('🏠 Propriedades permitidas:', self.perfilAtual.propriedadesPermitidas || 'Todas');
                } else {
                    self.perfilAtual = self.perfis.operador;
                    console.log('👤 Usuário sem perfil, usando operador');
                }
                return self.perfilAtual;
            })
            .catch(function(err) {
                console.error('❌ Erro ao carregar perfil:', err);
                self.perfilAtual = self.perfis.operador;
                return self.perfilAtual;
            });
    },

    // ================================================================
    // VERIFICAR PERMISSÕES
    // ================================================================
    podeVer: function(modulo) {
        if (!this.perfilAtual) return false;
        var permissoes = this.perfilAtual.permissoes;
        if (permissoes.ver.includes('*')) return true;
        return permissoes.ver.includes(modulo);
    },

    podeCriar: function(modulo) {
        if (!this.perfilAtual) return false;
        var permissoes = this.perfilAtual.permissoes;
        if (permissoes.criar.includes('*')) return true;
        return permissoes.criar.includes(modulo);
    },

    podeEditar: function(modulo) {
        if (!this.perfilAtual) return false;
        var permissoes = this.perfilAtual.permissoes;
        if (permissoes.editar.includes('*')) return true;
        return permissoes.editar.includes(modulo);
    },

    podeExcluir: function(modulo) {
        if (!this.perfilAtual) return false;
        var permissoes = this.perfilAtual.permissoes;
        if (permissoes.excluir.includes('*')) return true;
        return permissoes.excluir.includes(modulo);
    },

    podeExportar: function(modulo) {
        if (!this.perfilAtual) return false;
        var permissoes = this.perfilAtual.permissoes;
        if (permissoes.exportar && permissoes.exportar.includes('*')) return true;
        return permissoes.exportar && permissoes.exportar.includes(modulo);
    },

    podeImprimir: function(modulo) {
        if (!this.perfilAtual) return false;
        var permissoes = this.perfilAtual.permissoes;
        if (permissoes.imprimir && permissoes.imprimir.includes('*')) return true;
        return permissoes.imprimir && permissoes.imprimir.includes(modulo);
    },

    podeZerarBanco: function() {
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.zerarBanco === true;
    },

    podeGerenciarUsuarios: function() {
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.gerenciarUsuarios === true;
    },

    podeGerenciarPerfis: function() {
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.gerenciarPerfis === true;
    },

    // ================================================================
    // 🆕 PERMISSÕES ESPECÍFICAS DO VIVEIRO
    // ================================================================
    podeVerProducaoViveiro: function() {
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.viveiro_producao === true;
    },

    podeVerVendasViveiro: function() {
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.viveiro_vendas === true;
    },

    podeVerCaixaViveiro: function() {
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.viveiro_caixa === true;
    },

    podeVerRelatoriosViveiro: function() {
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.viveiro_relatorios === true;
    },

    podeExportarViveiro: function() {
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.viveiro_exportar === true;
    },

    // ================================================================
    // 🏠 PERMISSÃO POR PROPRIEDADE - NOVAS FUNÇÕES
    // ================================================================
    podeAcessarPropriedade: function(perfilId, propriedade) {
        var perfil = this.perfis[perfilId];
        if (!perfil) return true;
        
        if (!perfil.propriedadesPermitidas || perfil.propriedadesPermitidas.length === 0) {
            return true;
        }
        
        return perfil.propriedadesPermitidas.includes(propriedade);
    },

    getPropriedadesPermitidas: function(perfilId) {
        var perfil = this.perfis[perfilId];
        if (!perfil) return null;
        
        if (!perfil.propriedadesPermitidas || perfil.propriedadesPermitidas.length === 0) {
            return null;
        }
        
        return perfil.propriedadesPermitidas;
    },

    filtrarPropriedadesUsuario: function() {
        if (!this.perfilAtual) return;
        
        var propriedadesPermitidas = this.perfilAtual.propriedadesPermitidas;
        
        if (!propriedadesPermitidas || propriedadesPermitidas.length === 0) {
            return;
        }
        
        var tabs = document.querySelectorAll('.prop-tab');
        tabs.forEach(function(tab) {
            var nome = tab.textContent.trim();
            if (nome === '🏠 Todas') return;
            
            if (propriedadesPermitidas.includes(nome)) {
                tab.style.display = 'inline-block';
            } else {
                tab.style.display = 'none';
            }
        });
        
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas' && !propriedadesPermitidas.includes(propAtiva)) {
            GR.UI.setPropriedadeAtiva('todas');
        }
    },

    _gerenciarPropriedadesPermitidas: function(perfilId) {
        var perfil = this.perfis[perfilId];
        if (!perfil) {
            GR.Toast.error('Perfil não encontrado!');
            return;
        }
        
        if (!perfil.propriedadesPermitidas) {
            perfil.propriedadesPermitidas = [];
        }
        
        var propriedades = GR.State.data.propriedades || [];
        var modalId = 'modal-propriedades-permitidas';
        
        var modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }
        
        var html = `
        <div id="${modalId}" class="modal" role="dialog" aria-modal="true">
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <h2 class="modal-title">🏠 Propriedades Permitidas para "${perfil.nome}"</h2>
                    <button class="close-btn" onclick="GR.Modal.close('${modalId}')">×</button>
                </div>
                <div style="padding:10px 0;">
                    <p style="font-size:12px;color:var(--text-light);margin-bottom:12px;">
                        Selecione as propriedades que os usuários com este perfil poderão acessar.
                        <br><strong>💡 Dica:</strong> Deixe todas desmarcadas para permitir acesso a todas as propriedades.
                    </p>
                    
                    <div style="margin-bottom:12px;">
                        <button class="btn btn-sm btn-success" onclick="GR.Modules.Perfis._marcarTodasPropriedades('${perfilId}', true)">
                            ✅ Marcar Todas
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="GR.Modules.Perfis._marcarTodasPropriedades('${perfilId}', false)">
                            ❌ Desmarcar Todas
                        </button>
                        <button class="btn btn-sm btn-info" onclick="GR.Modules.Perfis._marcarTodasPropriedades('${perfilId}', null)">
                            🔄 Acesso Total
                        </button>
                    </div>
                    
                    <div style="max-height:400px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;">
                        ${propriedades.length === 0 ? `
                            <div style="text-align:center;padding:20px;color:var(--text-light);">
                                Nenhuma propriedade cadastrada.
                                <br><small>Cadastre propriedades na aba de configurações primeiro.</small>
                            </div>
                        ` : `
                            <table style="width:100%;font-size:13px;">
                                <thead>
                                    <tr>
                                        <th style="text-align:left;padding:6px 8px;">🏠 Propriedade</th>
                                        <th style="text-align:center;padding:6px 8px;width:80px;">Permitir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${propriedades.map(function(prop) {
                                        var isChecked = perfil.propriedadesPermitidas === null || 
                                                       perfil.propriedadesPermitidas.length === 0 ||
                                                       perfil.propriedadesPermitidas.includes(prop.nome);
                                        return `
                                        <tr style="border-bottom:1px solid var(--border-light);">
                                            <td style="padding:6px 8px;">
                                                <span style="font-size:16px;">🏠</span> ${GR.Utils.escapeHtml(prop.nome)}
                                                ${prop.cidade ? `<span style="font-size:10px;color:var(--text-light);"> - ${GR.Utils.escapeHtml(prop.cidade)}</span>` : ''}
                                            </td>
                                            <td style="text-align:center;padding:6px 8px;">
                                                <input type="checkbox" 
                                                       class="prop-permissao-check" 
                                                       data-perfil="${perfilId}" 
                                                       data-propriedade="${GR.Utils.escapeHtml(prop.nome)}"
                                                       ${isChecked ? 'checked' : ''}
                                                       onchange="GR.Modules.Perfis._togglePropriedadePermitida('${perfilId}', '${GR.Utils.escapeHtml(prop.nome)}', this.checked)">
                                            </td>
                                        </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        `}
                    </div>
                    
                    <div style="margin-top:12px;padding:8px;background:var(--bg);border-radius:4px;font-size:11px;color:var(--text-light);">
                        <strong>📌 Status atual:</strong>
                        ${perfil.propriedadesPermitidas === null || perfil.propriedadesPermitidas.length === 0 ? 
                            '<span style="color:var(--success);">✅ Acesso a TODAS as propriedades</span>' : 
                            `<span style="color:var(--info);">📋 Apenas ${perfil.propriedadesPermitidas.length} propriedade(s) selecionada(s)</span>`
                        }
                    </div>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;border-top:1px solid var(--border);padding-top:12px;">
                    <button class="btn btn-success" onclick="GR.Modules.Perfis._salvarPropriedadesPermitidas('${perfilId}')">
                        💾 Salvar
                    </button>
                    <button class="btn btn-secondary" onclick="GR.Modal.close('${modalId}')">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        GR.Modal.open(modalId);
    },

    _togglePropriedadePermitida: function(perfilId, propriedade, checked) {
        var perfil = this.perfis[perfilId];
        if (!perfil) return;
        
        if (!perfil.propriedadesPermitidas) {
            perfil.propriedadesPermitidas = [];
        }
        
        if (checked) {
            if (!perfil.propriedadesPermitidas.includes(propriedade)) {
                perfil.propriedadesPermitidas.push(propriedade);
            }
        } else {
            var index = perfil.propriedadesPermitidas.indexOf(propriedade);
            if (index > -1) {
                perfil.propriedadesPermitidas.splice(index, 1);
            }
        }
        
        if (perfil.propriedadesPermitidas.length === 0) {
            perfil.propriedadesPermitidas = null;
        }
    },

    _marcarTodasPropriedades: function(perfilId, marcar) {
        var perfil = this.perfis[perfilId];
        if (!perfil) return;
        
        var propriedades = GR.State.data.propriedades || [];
        
        if (marcar === null) {
            perfil.propriedadesPermitidas = null;
        } else if (marcar) {
            perfil.propriedadesPermitidas = propriedades.map(function(p) { return p.nome; });
        } else {
            perfil.propriedadesPermitidas = [];
        }
        
        var checkboxes = document.querySelectorAll('.prop-permissao-check');
        checkboxes.forEach(function(chk) {
            if (marcar === null) {
                chk.checked = true;
                chk.disabled = false;
            } else {
                chk.checked = marcar;
            }
        });
        
        GR.Toast.info(marcar === null ? '🔄 Acesso total a todas as propriedades' : 
                      marcar ? '✅ Todas as propriedades marcadas' : 
                      '❌ Todas as propriedades desmarcadas');
    },

    _salvarPropriedadesPermitidas: function(perfilId) {
        var perfil = this.perfis[perfilId];
        if (!perfil) {
            GR.Toast.error('Perfil não encontrado!');
            return;
        }
        
        if (perfil.propriedadesPermitidas && perfil.propriedadesPermitidas.length === 0) {
            perfil.propriedadesPermitidas = null;
        }
        
        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }
        
        var ref = db.collection('users').doc(user.uid).collection('config').doc('perfis');
        ref.set({
            perfis: this.perfis,
            perfisPersonalizados: this.perfisPersonalizados,
            atualizadoEm: new Date().toISOString()
        })
        .then(function() {
            GR.Toast.success('✅ Permissões de propriedade salvas!');
            GR.Modal.close('modal-propriedades-permitidas');
            GR.Modules.Perfis._carregarPerfilUsuario(user.uid);
            GR.Modules.Perfis.filtrarMenu();
            GR.UI.refreshCurrentView();
            GR.UI.atualizarPropTabs();
        })
        .catch(function(err) {
            GR.Toast.error('❌ Erro ao salvar: ' + err.message);
        });
    },

    // ================================================================
    // OBTER MÓDULOS VISÍVEIS
    // ================================================================
    getModulosVisiveis: function() {
        if (!this.perfilAtual) return [];
        var permissoes = this.perfilAtual.permissoes;
        if (permissoes.ver.includes('*')) {
            return this.modulos.map(function(m) { return m.id; });
        }
        return permissoes.ver;
    },

    // ================================================================
    // FILTRAR MENU
    // ================================================================
    filtrarMenu: function() {
        var modulosVisiveis = this.getModulosVisiveis();
        var botoes = document.querySelectorAll('.nav-btn');
        
        botoes.forEach(function(btn) {
            var section = btn.dataset.section;
            if (section === 'dashboard') {
                btn.style.display = 'flex';
                return;
            }
            if (modulosVisiveis.includes(section) || modulosVisiveis.includes('*')) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });
        
        this.filtrarPropriedadesUsuario();
    },

    // ================================================================
    // ABRIR GERENCIAMENTO DE PERFIS
    // ================================================================
    abrirGerenciamentoPerfis: function() {
        if (!this.podeGerenciarPerfis()) {
            GR.Toast.error('❌ Você não tem permissão para gerenciar perfis!');
            return;
        }
        
        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('❌ Usuário não autenticado!');
            return;
        }
        
        console.log('🔐 Abrindo gerenciamento de perfis...');
        this._renderModalPerfis();
    },

    // ================================================================
    // RENDER MODAL DE GERENCIAMENTO DE PERFIS
    // ================================================================
    _renderModalPerfis: function() {
        var modalId = 'modal-gerenciar-perfis';
        var modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }
        
        var perfis = this.perfis;
        var modulos = this.modulos;
        var acoes = this.acoes;
        var self = this;
        var perfisKeys = Object.keys(perfis);
        var primeiroPerfil = perfisKeys.length > 0 ? perfisKeys[0] : 'operador';
        
        var html = `
        <div id="${modalId}" class="modal" role="dialog" aria-modal="true">
            <div class="modal-content" style="max-width:1200px;max-height:95vh;">
                <div class="modal-header">
                    <h2 class="modal-title">🔐 Gerenciar Perfis e Permissões</h2>
                    <button class="close-btn" onclick="GR.Modal.close('${modalId}')">×</button>
                </div>
                <div style="padding:10px 0;">
                    <p style="font-size:12px;color:var(--text-light);margin-bottom:10px;">
                        Selecione um perfil para editar as permissões. Perfis com <strong>🔒</strong> são fixos do sistema.
                        Perfis sem 🔒 foram criados pelo usuário e podem ser excluídos.
                    </p>
                    
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;align-items:center;">
                        <div style="display:flex;gap:4px;flex-wrap:wrap;">
                            ${perfisKeys.map(function(key) {
                                var p = perfis[key];
                                var isFixo = p.fixo === true;
                                return `
                                <button class="btn ${key === primeiroPerfil ? 'btn-primary' : 'btn-secondary'} btn-sm perfil-btn" 
                                        data-perfil="${key}"
                                        onclick="GR.Modules.Perfis._selecionarPerfil('${key}')"
                                        style="${key === primeiroPerfil ? 'background:var(--primary);' : ''}">
                                    ${p.nome} ${isFixo ? '🔒' : ''}
                                </button>
                                `;
                            }).join('')}
                        </div>
                        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-left:auto;">
                            <button class="btn btn-success btn-sm" onclick="GR.Modules.Perfis._criarNovoPerfil()" title="Criar um novo perfil personalizado">
                                ➕ Novo Perfil
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="GR.Modules.Perfis._excluirPerfil()" title="Excluir o perfil selecionado">
                                🗑️ Excluir Perfil
                            </button>
                            <button class="btn btn-info btn-sm" onclick="GR.Modules.Perfis._gerenciarPropriedadesPermitidas('${primeiroPerfil}')" title="Gerenciar propriedades permitidas">
                                🏠 Propriedades
                            </button>
                        </div>
                    </div>
                    
                    <div id="perfil-info" style="background:var(--bg);padding:8px 12px;border-radius:4px;margin-bottom:10px;">
                        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;">
                            <span><strong>Perfil:</strong> <span id="perfil-nome-exibicao">${perfis[primeiroPerfil].nome}</span></span>
                            <span><strong>Nível:</strong> <span id="perfil-nivel-exibicao">${perfis[primeiroPerfil].nivel}</span></span>
                            <span><strong>Descrição:</strong> <span id="perfil-descricao-exibicao">${perfis[primeiroPerfil].descricao}</span></span>
                            <span><strong>Status:</strong> <span id="perfil-fixo-exibicao">${perfis[primeiroPerfil].fixo ? '🔒 Fixo' : '📝 Personalizado'}</span></span>
                            <span><strong>🏠 Propriedades:</strong> <span id="perfil-propriedades-exibicao">${perfis[primeiroPerfil].propriedadesPermitidas ? perfis[primeiroPerfil].propriedadesPermitidas.length + ' selecionadas' : 'Todas'}</span></span>
                        </div>
                    </div>
                    
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
                        <button class="btn btn-success btn-sm" onclick="GR.Modules.Perfis._marcarTodasPermissoes(true)">✅ Marcar Todas</button>
                        <button class="btn btn-danger btn-sm" onclick="GR.Modules.Perfis._marcarTodasPermissoes(false)">❌ Desmarcar Todas</button>
                        <button class="btn btn-warning btn-sm" onclick="GR.Modules.Perfis._restaurarPadraoPerfil()">🔄 Restaurar Padrão</button>
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Perfis._clonarPerfil()">📋 Clonar Perfil</button>
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Perfis._gerenciarPropriedadesPermitidas(GR.Modules.Perfis._getPerfilSelecionado())" title="Gerenciar propriedades permitidas">
                            🏠 Propriedades
                        </button>
                    </div>
                    
                    <div class="table-responsive" style="max-height:400px;overflow-y:auto;border:1px solid var(--border);border-radius:4px;">
                        <table style="font-size:12px;width:100%;">
                            <thead style="position:sticky;top:0;z-index:10;">
                                <tr style="background:var(--primary-dark);color:#fff;">
                                    <th style="padding:6px 8px;min-width:160px;text-align:left;">Módulo</th>
                                    ${acoes.map(function(acao) {
                                        return `<th style="padding:6px 4px;text-align:center;min-width:45px;" title="${acao.nome}">${acao.icon}</th>`;
                                    }).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${modulos.map(function(modulo) {
                                    var perfilId = primeiroPerfil;
                                    return `
                                    <tr style="border-bottom:1px solid var(--border-light);">
                                        <td style="padding:4px 8px;font-weight:500;">
                                            <span style="font-size:14px;">${modulo.icon}</span> ${modulo.nome}
                                        </td>
                                        ${acoes.map(function(acao) {
                                            return `
                                            <td style="text-align:center;padding:4px 2px;">
                                                <input type="checkbox" class="permissao-check" 
                                                       data-perfil="${perfilId}" 
                                                       data-modulo="${modulo.id}" 
                                                       data-acao="${acao.id}"
                                                       ${self._hasPermissao(perfilId, modulo.id, acao.id) ? 'checked' : ''}
                                                       onchange="GR.Modules.Perfis._togglePermissao(this, '${perfilId}', '${modulo.id}', '${acao.id}')">
                                            </td>
                                            `;
                                        }).join('')}
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="margin-top:10px;padding:10px;background:var(--bg);border-radius:4px;border:1px solid var(--border);">
                        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
                            <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer;">
                                <input type="checkbox" id="permissao-zerar-banco" 
                                       ${self._hasPermissaoEspecial(primeiroPerfil, 'zerarBanco') ? 'checked' : ''}
                                       onchange="GR.Modules.Perfis._togglePermissaoEspecial(this, '${primeiroPerfil}', 'zerarBanco')">
                                💣 Pode Zerar Banco de Dados
                            </label>
                            <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer;">
                                <input type="checkbox" id="permissao-gerenciar-usuarios" 
                                       ${self._hasPermissaoEspecial(primeiroPerfil, 'gerenciarUsuarios') ? 'checked' : ''}
                                       onchange="GR.Modules.Perfis._togglePermissaoEspecial(this, '${primeiroPerfil}', 'gerenciarUsuarios')">
                                👤 Gerenciar Usuários
                            </label>
                            <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer;">
                                <input type="checkbox" id="permissao-gerenciar-perfis" 
                                       ${self._hasPermissaoEspecial(primeiroPerfil, 'gerenciarPerfis') ? 'checked' : ''}
                                       onchange="GR.Modules.Perfis._togglePermissaoEspecial(this, '${primeiroPerfil}', 'gerenciarPerfis')">
                                🔐 Gerenciar Perfis
                            </label>
                        </div>
                    </div>
                    
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;">
                        <button class="btn btn-success" onclick="GR.Modules.Perfis._salvarPerfis()">💾 Salvar Permissões</button>
                        <button class="btn btn-warning" onclick="GR.Modules.Perfis._resetarTodosPerfis()">🔄 Resetar Todos</button>
                        <button class="btn btn-secondary" onclick="GR.Modal.close('${modalId}')">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        GR.Modal.open(modalId);
        
        this._selecionarPerfil(primeiroPerfil);
    },

    // ================================================================
    // SELECIONAR PERFIL PARA EDIÇÃO
    // ================================================================
    _selecionarPerfil: function(perfilId) {
        var perfil = this.perfis[perfilId];
        if (!perfil) return;
        
        document.querySelectorAll('.perfil-btn').forEach(function(btn) {
            btn.className = 'btn btn-secondary btn-sm perfil-btn';
            if (btn.dataset.perfil === perfilId) {
                btn.className = 'btn btn-primary btn-sm perfil-btn';
            }
        });
        
        document.getElementById('perfil-nome-exibicao').textContent = perfil.nome;
        document.getElementById('perfil-nivel-exibicao').textContent = perfil.nivel;
        document.getElementById('perfil-descricao-exibicao').textContent = perfil.descricao;
        document.getElementById('perfil-fixo-exibicao').textContent = perfil.fixo ? '🔒 Fixo' : '📝 Personalizado';
        
        var propExibicao = document.getElementById('perfil-propriedades-exibicao');
        if (propExibicao) {
            if (perfil.propriedadesPermitidas && perfil.propriedadesPermitidas.length > 0) {
                propExibicao.textContent = perfil.propriedadesPermitidas.length + ' selecionadas';
                propExibicao.style.color = 'var(--info)';
            } else {
                propExibicao.textContent = 'Todas';
                propExibicao.style.color = 'var(--success)';
            }
        }
        
        var checkboxes = document.querySelectorAll('.permissao-check');
        checkboxes.forEach(function(chk) {
            var modulo = chk.dataset.modulo;
            var acao = chk.dataset.acao;
            chk.checked = GR.Modules.Perfis._hasPermissao(perfilId, modulo, acao);
            chk.dataset.perfil = perfilId;
        });
        
        var chkZerar = document.getElementById('permissao-zerar-banco');
        var chkGerenciarUsuarios = document.getElementById('permissao-gerenciar-usuarios');
        var chkGerenciarPerfis = document.getElementById('permissao-gerenciar-perfis');
        if (chkZerar) {
            chkZerar.checked = GR.Modules.Perfis._hasPermissaoEspecial(perfilId, 'zerarBanco');
        }
        if (chkGerenciarUsuarios) {
            chkGerenciarUsuarios.checked = GR.Modules.Perfis._hasPermissaoEspecial(perfilId, 'gerenciarUsuarios');
        }
        if (chkGerenciarPerfis) {
            chkGerenciarPerfis.checked = GR.Modules.Perfis._hasPermissaoEspecial(perfilId, 'gerenciarPerfis');
        }
    },

    // ================================================================
    // VERIFICAR SE TEM PERMISSÃO
    // ================================================================
    _hasPermissao: function(perfilId, modulo, acao) {
        var perfil = this.perfis[perfilId];
        if (!perfil) return false;
        var permissoes = perfil.permissoes;
        if (!permissoes[acao]) return false;
        if (permissoes[acao].includes('*')) return true;
        return permissoes[acao].includes(modulo);
    },

    _hasPermissaoEspecial: function(perfilId, acao) {
        var perfil = this.perfis[perfilId];
        if (!perfil) return false;
        return perfil.permissoes[acao] === true;
    },

    // ================================================================
    // ALTERNAR PERMISSÃO
    // ================================================================
    _togglePermissao: function(checkbox, perfilId, modulo, acao) {
        var perfil = this.perfis[perfilId];
        if (!perfil) return;
        
        if (!perfil.permissoes[acao]) {
            perfil.permissoes[acao] = [];
        }
        
        var lista = perfil.permissoes[acao];
        if (checkbox.checked) {
            if (!lista.includes(modulo)) {
                lista.push(modulo);
            }
        } else {
            var index = lista.indexOf(modulo);
            if (index > -1) {
                lista.splice(index, 1);
            }
        }
        console.log('📋 Permissão atualizada:', perfilId, modulo, acao, checkbox.checked);
    },

    _togglePermissaoEspecial: function(checkbox, perfilId, acao) {
        var perfil = this.perfis[perfilId];
        if (!perfil) return;
        perfil.permissoes[acao] = checkbox.checked;
        console.log('📋 Permissão especial atualizada:', perfilId, acao, checkbox.checked);
    },

    // ================================================================
    // AÇÕES RÁPIDAS
    // ================================================================
    _marcarTodasPermissoes: function(checked) {
        var perfilId = this._getPerfilSelecionado();
        var perfil = this.perfis[perfilId];
        if (!perfil) return;
        
        var acoes = ['ver', 'criar', 'editar', 'excluir', 'exportar', 'imprimir'];
        var modulos = this.modulos.map(function(m) { return m.id; });
        
        acoes.forEach(function(acao) {
            perfil.permissoes[acao] = checked ? modulos.slice() : [];
        });
        
        this._selecionarPerfil(perfilId);
        GR.Toast.info(checked ? '✅ Todas as permissões marcadas!' : '❌ Todas as permissões desmarcadas!');
    },

    _restaurarPadraoPerfil: function() {
        var perfilId = this._getPerfilSelecionado();
        var perfil = this.perfis[perfilId];
        if (!perfil) return;
        
        if (!confirm('🔄 Restaurar permissões de "' + perfil.nome + '" para o padrão?')) return;
        
        if (this.perfisPadrao[perfilId]) {
            this.perfis[perfilId].permissoes = JSON.parse(JSON.stringify(this.perfisPadrao[perfilId].permissoes));
            this.perfis[perfilId].propriedadesPermitidas = this.perfisPadrao[perfilId].propriedadesPermitidas || null;
            this._selecionarPerfil(perfilId);
            GR.Toast.success('✅ Permissões restauradas para o padrão!');
        } else {
            GR.Toast.error('❌ Perfil não tem padrão definido!');
        }
    },

    _resetarTodosPerfis: function() {
        if (!confirm('⚠️ Tem certeza que deseja resetar TODOS os perfis para o padrão?')) return;
        if (!confirm('🔄 Isso irá sobrescrever todas as permissões personalizadas!')) return;
        
        this.perfis = JSON.parse(JSON.stringify(this.perfisPadrao));
        this.perfisPersonalizados = {};
        GR.Toast.success('🔄 Todos os perfis resetados para o padrão!');
        this._renderModalPerfis();
    },

    // ================================================================
    // CRIAR NOVO PERFIL PERSONALIZADO
    // ================================================================
    _criarNovoPerfil: function() {
        var nome = prompt('📝 Digite o nome do novo perfil:', 'Meu Perfil');
        if (!nome) return;
        
        var id = nome.toLowerCase().replace(/[^a-z0-9]/g, '_');
        if (this.perfis[id]) {
            GR.Toast.error('❌ Já existe um perfil com este nome!');
            return;
        }
        
        var nivel = parseInt(prompt('📊 Digite o nível do perfil (1-100):', '50')) || 50;
        var descricao = prompt('📝 Digite uma descrição para o perfil:', 'Perfil personalizado');
        
        this.perfis[id] = {
            id: id,
            nome: '👤 ' + nome,
            nivel: Math.min(100, Math.max(1, nivel)),
            descricao: descricao || 'Perfil personalizado',
            cor: '#9c27b0',
            fixo: false,
            propriedadesPermitidas: null,
            permissoes: {
                ver: [],
                criar: [],
                editar: [],
                excluir: [],
                exportar: [],
                imprimir: [],
                zerarBanco: false,
                gerenciarUsuarios: false,
                gerenciarPerfis: false,
                // 🆕 PERMISSÕES DO VIVEIRO
                viveiro_producao: false,
                viveiro_vendas: false,
                viveiro_caixa: false,
                viveiro_relatorios: false,
                viveiro_exportar: false
            }
        };
        
        this.perfisPersonalizados[id] = true;
        GR.Toast.success('✅ Perfil "' + nome + '" criado com sucesso!');
        this._renderModalPerfis();
        this._selecionarPerfil(id);
    },

    // ================================================================
    // EXCLUIR PERFIL
    // ================================================================
    _excluirPerfil: function() {
        var perfilId = this._getPerfilSelecionado();
        var perfil = this.perfis[perfilId];
        if (!perfil) return;
        
        if (perfil.fixo) {
            GR.Toast.error('❌ Perfis fixos não podem ser excluídos!');
            return;
        }
        
        if (!confirm('🗑️ Tem certeza que deseja excluir o perfil "' + perfil.nome + '"?')) return;
        
        delete this.perfis[perfilId];
        delete this.perfisPersonalizados[perfilId];
        
        GR.Toast.success('✅ Perfil excluído com sucesso!');
        var keys = Object.keys(this.perfis);
        this._renderModalPerfis();
        if (keys.length > 0) {
            this._selecionarPerfil(keys[0]);
        }
    },

    // ================================================================
    // CLONAR PERFIL
    // ================================================================
    _clonarPerfil: function() {
        var perfilId = this._getPerfilSelecionado();
        var perfil = this.perfis[perfilId];
        if (!perfil) return;
        
        var nome = prompt('📝 Digite o nome do novo perfil (clone de ' + perfil.nome + '):', perfil.nome + ' (Clone)');
        if (!nome) return;
        
        var id = nome.toLowerCase().replace(/[^a-z0-9]/g, '_');
        if (this.perfis[id]) {
            GR.Toast.error('❌ Já existe um perfil com este nome!');
            return;
        }
        
        this.perfis[id] = JSON.parse(JSON.stringify(perfil));
        this.perfis[id].id = id;
        this.perfis[id].nome = '👤 ' + nome;
        this.perfis[id].fixo = false;
        this.perfis[id].propriedadesPermitidas = perfil.propriedadesPermitidas || null;
        this.perfisPersonalizados[id] = true;
        
        GR.Toast.success('✅ Perfil clonado com sucesso!');
        this._renderModalPerfis();
        this._selecionarPerfil(id);
    },

    // ================================================================
    // OBTER PERFIL SELECIONADO
    // ================================================================
    _getPerfilSelecionado: function() {
        var btnAtivo = document.querySelector('.perfil-btn.btn-primary');
        if (btnAtivo) {
            return btnAtivo.dataset.perfil;
        }
        var keys = Object.keys(this.perfis);
        return keys.length > 0 ? keys[0] : 'operador';
    },

    // ================================================================
    // SALVAR PERFIS NO FIRESTORE
    // ================================================================
    _salvarPerfis: function() {
        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }
        
        GR.State.data.perfis = this.perfis;
        
        var ref = db.collection('users').doc(user.uid).collection('config').doc('perfis');
        ref.set({
            perfis: this.perfis,
            perfisPersonalizados: this.perfisPersonalizados,
            atualizadoEm: new Date().toISOString()
        })
        .then(function() {
            GR.Toast.success('✅ Permissões salvas com sucesso!');
            GR.Modal.close('modal-gerenciar-perfis');
            GR.Modules.Perfis._carregarPerfilUsuario(user.uid);
            GR.Modules.Perfis.filtrarMenu();
            GR.UI.refreshCurrentView();
            GR.UI.atualizarPropTabs();
        })
        .catch(function(err) {
            GR.Toast.error('❌ Erro ao salvar: ' + err.message);
        });
    },

    // ================================================================
    // ZERAR BANCO DE DADOS (APENAS MASTER)
    // ================================================================
    zerarBancoDeDados: function() {
        if (!this.podeZerarBanco()) {
            GR.Toast.error('❌ Você não tem permissão para zerar o banco de dados!');
            return;
        }
        
        if (!confirm('💣 ATENÇÃO! Isso irá APAGAR TODOS OS DADOS do sistema!\n\nDeseja continuar?')) return;
        if (!confirm('⚠️ ÚLTIMO AVISO! Todos os dados serão perdidos permanentemente!\n\nTem certeza?')) return;
        
        var senha = prompt('🔑 Digite sua senha para confirmar a exclusão de todos os dados:');
        if (!senha) {
            GR.Toast.info('Operação cancelada.');
            return;
        }
        
        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }
        
        var credential = firebase.auth.EmailAuthProvider.credential(user.email, senha);
        user.reauthenticateWithCredential(credential)
            .then(function() {
                return GR.Modules.Perfis._executarZerarBanco(user.uid);
            })
            .catch(function(err) {
                if (err.code === 'auth/wrong-password') {
                    GR.Toast.error('❌ Senha incorreta! Operação cancelada.');
                } else {
                    GR.Toast.error('❌ Erro ao verificar senha: ' + err.message);
                }
            });
    },

    _executarZerarBanco: function(uid) {
        if (!confirm('💣 ÚLTIMA CONFIRMAÇÃO! Isso irá APAGAR TODOS OS DADOS do usuário!\n\nContinuar?')) return;
        
        var ref = db.collection('users').doc(uid);
        var collections = [
            'contratos', 'tarefas', 'orcamentos', 'insumos', 'animais', 
            'funcionarios', 'parceiros', 'despesas', 'receitas', 
            'documentos', 'analises', 'viveiroMudas', 'viveiroInsumos',
            'viveiroServicos', 'viveiroTrabalhadores', 'historico',
            'notificacoes', 'nfes', 'partesRelacionadas', 'vencimentos'
        ];
        
        var promises = collections.map(function(col) {
            return ref.collection(col).get()
                .then(function(snapshot) {
                    var batch = db.batch();
                    snapshot.docs.forEach(function(doc) {
                        batch.delete(doc.ref);
                    });
                    return batch.commit();
                })
                .catch(function(err) {
                    console.warn('⚠️ Erro ao limpar ' + col + ':', err);
                    return Promise.resolve();
                });
        });
        
        GR.Toast.info('⏳ Apagando todos os dados...');
        
        return Promise.all(promises)
            .then(function() {
                var dataKeys = [
                    'contratos', 'tarefas', 'orcamentos', 'insumos', 'animais',
                    'funcionarios', 'parceiros', 'despesas', 'receitas',
                    'documentos', 'analises', 'viveiroMudas', 'viveiroInsumos',
                    'viveiroServicos', 'viveiroTrabalhadores', 'historico',
                    'notificacoes', 'nfes', 'partesRelacionadas', 'vencimentos'
                ];
                dataKeys.forEach(function(key) {
                    GR.State.data[key] = [];
                });
                
                return ref.update({
                    dadosZerados: true,
                    dataZeramento: new Date().toISOString()
                });
            })
            .then(function() {
                GR.Toast.success('💣 Banco de dados zerado com sucesso!');
                GR.UI.refreshCurrentView();
                GR.UI.atualizarPropTabs();
                GR.State.adicionarHistorico('zerou banco de dados', 'Sistema', 'Todos os dados foram apagados');
                return Promise.resolve();
            })
            .catch(function(err) {
                GR.Toast.error('❌ Erro ao zerar banco: ' + err.message);
                return Promise.reject(err);
            });
    }
};

console.log('✅ Módulo Perfis carregado com Firebase!');
console.log('📌 Funcionalidades:');
console.log('   - 🔐 Gerenciamento completo de perfis');
console.log('   - ➕ Criar novos perfis personalizados');
console.log('   - 🗑️ Excluir perfis personalizados');
console.log('   - 📋 Clonar perfis existentes');
console.log('   - 🔄 Restaurar perfis para o padrão');
console.log('   - 💾 Salvar no Firebase');
console.log('   - 🏠 Permissão por propriedade');
console.log('   - 🌱 Permissões específicas do Viveiro:');
console.log('      - produção, vendas, caixa, relatórios, exportar');