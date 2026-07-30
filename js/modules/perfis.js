// ================================================================
// PERFIS - SISTEMA DE PERFIS DE USUÁRIOS (FIREBASE)
// ================================================================
// Versão: 3.1 - COMPLETO COM GERENCIAMENTO DE PERFIS FUNCIONANDO
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
        { id: 'relatorios', nome: '📈 Relatórios', icon: '📈' },
        { id: 'configuracoes', nome: '⚙️ Config.', icon: '⚙️' },
        { id: 'historico', nome: '📜 Histórico', icon: '📜' },
        { id: 'nfe', nome: '📄 NF-e', icon: '📄' },
        { id: 'notificacoes', nome: '🔔 Notificações', icon: '🔔' }
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
            propriedadesPermitidas: null,
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
                viveiro_producao: true,
                viveiro_vendas: true,
                viveiro_caixa: true,
                viveiro_relatorios: true,
                viveiro_exportar: true,
                viveiro_alterar_propriedade: true,
                funcionario_ponto: true,
                funcionario_documentos: true,
                funcionario_contracheques: true,
                funcionario_contratos: true,
                funcionario_criar_perfil: true
            }
        },
        admin: {
            id: 'admin',
            nome: '👨‍💼 Administrador',
            nivel: 90,
            descricao: 'Gerenciamento geral do sistema',
            cor: '#1976d2',
            fixo: true,
            propriedadesPermitidas: null,
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
                viveiro_producao: true,
                viveiro_vendas: true,
                viveiro_caixa: true,
                viveiro_relatorios: true,
                viveiro_exportar: true,
                viveiro_alterar_propriedade: true,
                funcionario_ponto: true,
                funcionario_documentos: true,
                funcionario_contracheques: true,
                funcionario_contratos: true,
                funcionario_criar_perfil: true
            }
        },
        gerente: {
            id: 'gerente',
            nome: '👨‍🌾 Gerente',
            nivel: 70,
            descricao: 'Operações do dia a dia',
            cor: '#388e3c',
            fixo: true,
            propriedadesPermitidas: null,
            permissoes: {
                ver: ['*'],
                criar: ['acoes', 'orcamentos', 'insumos', 'funcionarios', 'documentos', 'viveiro'],
                editar: ['acoes', 'orcamentos', 'insumos', 'funcionarios', 'documentos', 'viveiro'],
                excluir: [],
                exportar: ['relatorios'],
                imprimir: ['relatorios'],
                zerarBanco: false,
                gerenciarUsuarios: false,
                gerenciarPerfis: false,
                viveiro_producao: true,
                viveiro_vendas: true,
                viveiro_caixa: true,
                viveiro_relatorios: true,
                viveiro_exportar: true,
                viveiro_alterar_propriedade: false,
                funcionario_ponto: true,
                funcionario_documentos: true,
                funcionario_contracheques: true,
                funcionario_contratos: true,
                funcionario_criar_perfil: false
            }
        },
        operador: {
            id: 'operador',
            nome: '👷 Operador',
            nivel: 50,
            descricao: 'Operador - Acesso à produção e vendas',
            cor: '#f57c00',
            fixo: true,
            propriedadesPermitidas: null,
            permissoes: {
                ver: ['dashboard', 'acoes', 'insumos', 'pecuaria', 'viveiro'],
                criar: [],
                editar: [],
                excluir: [],
                exportar: [],
                imprimir: [],
                zerarBanco: false,
                gerenciarUsuarios: false,
                gerenciarPerfis: false,
                viveiro_producao: true,
                viveiro_vendas: true,
                viveiro_caixa: false,
                viveiro_relatorios: false,
                viveiro_exportar: false,
                viveiro_alterar_propriedade: false,
                funcionario_ponto: false,
                funcionario_documentos: false,
                funcionario_contracheques: false,
                funcionario_contratos: false,
                funcionario_criar_perfil: false
            }
        },
        visitante: {
            id: 'visitante',
            nome: '👀 Visitante',
            nivel: 30,
            descricao: 'Acesso limitado - apenas visualização',
            cor: '#78909c',
            fixo: true,
            propriedadesPermitidas: null,
            permissoes: {
                ver: ['dashboard', 'viveiro'],
                criar: [],
                editar: [],
                excluir: [],
                exportar: [],
                imprimir: [],
                zerarBanco: false,
                gerenciarUsuarios: false,
                gerenciarPerfis: false,
                viveiro_producao: true,
                viveiro_vendas: false,
                viveiro_caixa: false,
                viveiro_relatorios: false,
                viveiro_exportar: false,
                viveiro_alterar_propriedade: false,
                funcionario_ponto: false,
                funcionario_documentos: false,
                funcionario_contracheques: false,
                funcionario_contratos: false,
                funcionario_criar_perfil: false
            }
        },
        funcionario: {
            id: 'funcionario',
            nome: '👨‍🌾 Funcionário',
            nivel: 40,
            descricao: 'Acesso restrito para funcionários (ponto, documentos, contracheques, contratos)',
            cor: '#4CAF50',
            fixo: true,
            propriedadesPermitidas: null,
            permissoes: {
                ver: ['funcionarios'],
                criar: [],
                editar: [],
                excluir: [],
                exportar: [],
                imprimir: [],
                zerarBanco: false,
                gerenciarUsuarios: false,
                gerenciarPerfis: false,
                viveiro_producao: false,
                viveiro_vendas: false,
                viveiro_caixa: false,
                viveiro_relatorios: false,
                viveiro_exportar: false,
                viveiro_alterar_propriedade: false,
                funcionario_ponto: true,
                funcionario_documentos: true,
                funcionario_contracheques: true,
                funcionario_contratos: true,
                funcionario_criar_perfil: false
            }
        }
    },

    // ================================================================
    // PERFIL ATUAL DO USUÁRIO
    // ================================================================
    perfilAtual: null,
    perfis: null,
    perfisPersonalizados: {},
    _ultimoPerfilId: null,
    _ultimoFiltroHash: null,
    _filtroTimeout: null,
    _cronometroInterval: null,

    // ================================================================
    // CONTROLE PARA FUNCIONÁRIO
    // ================================================================
    _funcionarioLogado: null,
    _funcionarioDados: null,

    // ================================================================
    // INICIALIZAÇÃO
    // ================================================================
    init: function() {
        console.log('🔄 Inicializando módulo de perfis...');
        this._forcarCarregamentoPerfil();
        this._carregarPerfisDoFirestore();
        this._configurarEventos();
        this.filtrarMenu();
    },

    // ================================================================
    // CARREGAR PERFIS DO FIRESTORE
    // ================================================================
    _carregarPerfisDoFirestore: function() {
        try {
            var user = firebase.auth().currentUser;
            if (!user) return;
            
            var self = this;
            db.collection('users').doc(user.uid).collection('config').doc('perfis').get()
                .then(function(doc) {
                    if (doc.exists) {
                        var data = doc.data();
                        if (data && data.perfis) {
                            self.perfis = data.perfis;
                            self.perfisPersonalizados = data.perfisPersonalizados || {};
                            console.log('📋 Perfis carregados do Firestore:', Object.keys(self.perfis).length);
                        } else {
                            self.perfis = JSON.parse(JSON.stringify(self.perfisPadrao));
                            self.perfisPersonalizados = {};
                            console.log('📋 Usando perfis padrão');
                        }
                    } else {
                        self.perfis = JSON.parse(JSON.stringify(self.perfisPadrao));
                        self.perfisPersonalizados = {};
                        db.collection('users').doc(user.uid).collection('config').doc('perfis').set({
                            perfis: self.perfis,
                            perfisPersonalizados: {},
                            atualizadoEm: new Date().toISOString()
                        });
                        console.log('📋 Perfis padrão criados no Firestore');
                    }
                })
                .catch(function(err) {
                    console.warn('⚠️ Erro ao carregar perfis do Firestore:', err);
                    self.perfis = JSON.parse(JSON.stringify(self.perfisPadrao));
                });
        } catch(e) {
            console.warn('⚠️ Erro ao carregar perfis:', e);
            this.perfis = JSON.parse(JSON.stringify(this.perfisPadrao));
        }
    },

    // ================================================================
    // CONFIGURAR EVENTOS
    // ================================================================
    _configurarEventos: function() {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                this._forcarCarregamentoPerfil();
                this.filtrarMenu();
            }
        }.bind(this));
        
        document.addEventListener('perfil-atualizado', function(e) {
            if (e.detail) {
                this.perfilAtual = e.detail;
                this.filtrarMenu();
                if (GR.UI && typeof GR.UI.refreshCurrentView === 'function') {
                    GR.UI.refreshCurrentView();
                }
            }
        }.bind(this));
    },

    // ================================================================
    // ABRIR GERENCIAMENTO DE PERFIS
    // ================================================================
    abrirGerenciamentoPerfis: function() {
        if (!this.podeGerenciarPerfis()) {
            GR.Toast.error('❌ Você não tem permissão para gerenciar perfis!');
            return;
        }
        
        this._carregarPerfisDoFirestore();
        
        var self = this;
        setTimeout(function() {
            self._renderModalPerfis();
        }, 300);
    },

    // ================================================================
    // FILTRAR MENU POR PERFIL
    // ================================================================
    filtrarMenu: function() {
        try {
            var perfil = this.getPerfilAtual();
            if (!perfil) {
                console.warn('⚠️ Nenhum perfil para filtrar menu');
                return;
            }
            
            var permissoes = perfil.permissoes;
            if (!permissoes) {
                console.warn('⚠️ Perfil sem permissões');
                return;
            }
            
            var modulosPermitidos = permissoes.ver || [];
            var isMaster = this.isMaster() || this.isMasterOrAdmin();
            
            if (isMaster) {
                console.log('👑 Modo administrador aplicado - menu completo');
                document.querySelectorAll('.nav-btn').forEach(function(btn) {
                    btn.style.display = '';
                });
                return;
            }
            
            if (this.isFuncionario()) {
                document.querySelectorAll('.nav-btn').forEach(function(btn) {
                    var section = btn.dataset.section;
                    if (section === 'funcionarios') {
                        btn.style.display = '';
                    } else {
                        btn.style.display = 'none';
                    }
                });
                return;
            }
            
            document.querySelectorAll('.nav-btn').forEach(function(btn) {
                var section = btn.dataset.section;
                if (modulosPermitidos.includes('*') || modulosPermitidos.includes(section)) {
                    btn.style.display = '';
                } else {
                    btn.style.display = 'none';
                }
            });
            
            console.log('📋 Menu filtrado por perfil:', perfil.nome);
        } catch(e) {
            console.warn('⚠️ Erro ao filtrar menu:', e);
        }
    },

    // ================================================================
    // FORÇAR CARREGAMENTO DO PERFIL
    // ================================================================
    _forcarCarregamentoPerfil: function() {
        try {
            var user = firebase.auth().currentUser;
            
            if (user && user.email === 'roqueep@gmail.com') {
                this.perfilAtual = {
                    id: 'master',
                    nome: '👑 Master',
                    nivel: 100,
                    descricao: 'Controle total do sistema (forçado por email)',
                    cor: '#d32f2f',
                    fixo: true,
                    propriedadesPermitidas: null,
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
                        viveiro_producao: true,
                        viveiro_vendas: true,
                        viveiro_caixa: true,
                        viveiro_relatorios: true,
                        viveiro_exportar: true,
                        viveiro_alterar_propriedade: true,
                        funcionario_ponto: true,
                        funcionario_documentos: true,
                        funcionario_contracheques: true,
                        funcionario_contratos: true,
                        funcionario_criar_perfil: true
                    }
                };
                try { localStorage.setItem('gr_perfil_atual', JSON.stringify(this.perfilAtual)); } catch(e) {}
                console.log('👑 Perfil Master forçado por email');
                window.perfilAtual = this.perfilAtual;
                GR.Modules.Perfis.perfilAtual = this.perfilAtual;
                return this.perfilAtual;
            }

            if (user && (user.email === 'admin@gestaorural.com' || user.email === 'adm@gestaorural.com')) {
                this.perfilAtual = {
                    id: 'admin',
                    nome: '👨‍💼 Administrador',
                    nivel: 90,
                    descricao: 'Gerenciamento geral do sistema (forçado por email)',
                    cor: '#1976d2',
                    fixo: true,
                    propriedadesPermitidas: null,
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
                        viveiro_producao: true,
                        viveiro_vendas: true,
                        viveiro_caixa: true,
                        viveiro_relatorios: true,
                        viveiro_exportar: true,
                        viveiro_alterar_propriedade: true,
                        funcionario_ponto: true,
                        funcionario_documentos: true,
                        funcionario_contracheques: true,
                        funcionario_contratos: true,
                        funcionario_criar_perfil: true
                    }
                };
                try { localStorage.setItem('gr_perfil_atual', JSON.stringify(this.perfilAtual)); } catch(e) {}
                console.log('👨‍💼 Perfil Admin forçado por email');
                window.perfilAtual = this.perfilAtual;
                GR.Modules.Perfis.perfilAtual = this.perfilAtual;
                return this.perfilAtual;
            }

            if (user && user.email && user.email.endsWith('@gestaorural.app')) {
                var cpf = user.email.replace('@gestaorural.app', '');
                var funcionario = this._buscarFuncionarioPorCPF(cpf);
                if (funcionario) {
                    this._funcionarioLogado = funcionario.id;
                    this._funcionarioDados = funcionario;
                    this.perfilAtual = {
                        id: 'funcionario',
                        nome: '👨‍🌾 ' + funcionario.nome,
                        nivel: 40,
                        descricao: 'Funcionário: ' + funcionario.nome,
                        cor: '#4CAF50',
                        fixo: true,
                        funcionarioId: funcionario.id,
                        propriedadesPermitidas: [funcionario.propriedade || ''],
                        permissoes: {
                            ver: ['funcionarios'],
                            criar: [],
                            editar: [],
                            excluir: [],
                            exportar: [],
                            imprimir: [],
                            zerarBanco: false,
                            gerenciarUsuarios: false,
                            gerenciarPerfis: false,
                            viveiro_producao: false,
                            viveiro_vendas: false,
                            viveiro_caixa: false,
                            viveiro_relatorios: false,
                            viveiro_exportar: false,
                            viveiro_alterar_propriedade: false,
                            funcionario_ponto: true,
                            funcionario_documentos: true,
                            funcionario_contracheques: true,
                            funcionario_contratos: true,
                            funcionario_criar_perfil: false
                        }
                    };
                    try { localStorage.setItem('gr_perfil_atual', JSON.stringify(this.perfilAtual)); } catch(e) {}
                    console.log('👨‍🌾 Perfil Funcionário carregado:', funcionario.nome);
                    window.perfilAtual = this.perfilAtual;
                    GR.Modules.Perfis.perfilAtual = this.perfilAtual;
                    return this.perfilAtual;
                }
            }

            try {
                var saved = localStorage.getItem('gr_perfil_atual');
                if (saved) {
                    var perfil = JSON.parse(saved);
                    if (perfil && perfil.id) {
                        this.perfilAtual = perfil;
                        console.log('📋 Perfil carregado do localStorage:', perfil.nome);
                        window.perfilAtual = this.perfilAtual;
                        GR.Modules.Perfis.perfilAtual = this.perfilAtual;
                        return this.perfilAtual;
                    }
                }
            } catch(e) {}

            if (!this.perfilAtual) {
                this.perfilAtual = {
                    id: 'admin',
                    nome: '👨‍💼 Administrador (Fallback)',
                    nivel: 90,
                    descricao: 'Perfil de fallback com todas as permissões',
                    cor: '#1976d2',
                    fixo: true,
                    propriedadesPermitidas: null,
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
                        viveiro_producao: true,
                        viveiro_vendas: true,
                        viveiro_caixa: true,
                        viveiro_relatorios: true,
                        viveiro_exportar: true,
                        viveiro_alterar_propriedade: true,
                        funcionario_ponto: true,
                        funcionario_documentos: true,
                        funcionario_contracheques: true,
                        funcionario_contratos: true,
                        funcionario_criar_perfil: true
                    }
                };
                try { localStorage.setItem('gr_perfil_atual', JSON.stringify(this.perfilAtual)); } catch(e) {}
                console.log('📋 Perfil fallback ADMIN criado');
                window.perfilAtual = this.perfilAtual;
                GR.Modules.Perfis.perfilAtual = this.perfilAtual;
            }

            return this.perfilAtual;
        } catch(e) {
            console.warn('⚠️ Erro ao forçar carregamento do perfil:', e);
            this.perfilAtual = {
                id: 'admin',
                nome: 'Administrador (Emergency)',
                nivel: 90,
                descricao: 'Perfil de emergência',
                cor: '#1976d2',
                fixo: true,
                propriedadesPermitidas: null,
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
                    viveiro_producao: true,
                    viveiro_vendas: true,
                    viveiro_caixa: true,
                    viveiro_relatorios: true,
                    viveiro_exportar: true,
                    viveiro_alterar_propriedade: true,
                    funcionario_ponto: true,
                    funcionario_documentos: true,
                    funcionario_contracheques: true,
                    funcionario_contratos: true,
                    funcionario_criar_perfil: true
                }
            };
            window.perfilAtual = this.perfilAtual;
            GR.Modules.Perfis.perfilAtual = this.perfilAtual;
            return this.perfilAtual;
        }
    },

    // ================================================================
    // BUSCAR FUNCIONÁRIO POR CPF
    // ================================================================
    _buscarFuncionarioPorCPF: function(cpf) {
        var funcionarios = GR.State.data.funcionarios || [];
        cpf = cpf.replace(/\D/g, '');
        return funcionarios.find(function(f) {
            var fCpf = f.cpf ? f.cpf.replace(/\D/g, '') : '';
            return fCpf === cpf;
        });
    },

    // ================================================================
    // VERIFICAR SE É FUNCIONÁRIO
    // ================================================================
    isFuncionario: function() {
        if (!this.perfilAtual) {
            this._forcarCarregamentoPerfil();
        }
        if (!this.perfilAtual) return false;
        return this.perfilAtual.id === 'funcionario' || this.perfilAtual.funcionarioId !== undefined;
    },

    // ================================================================
    // VERIFICAR SE É MASTER
    // ================================================================
    isMaster: function() {
        if (!this.perfilAtual) {
            this._forcarCarregamentoPerfil();
        }
        if (!this.perfilAtual) return false;
        return this.perfilAtual.id === 'master' || this.perfilAtual.nivel === 100;
    },

    // ================================================================
    // VERIFICAR SE É MASTER OU ADMIN
    // ================================================================
    isMasterOrAdmin: function() {
        if (!this.perfilAtual) {
            this._forcarCarregamentoPerfil();
        }
        if (!this.perfilAtual) return false;
        return this.perfilAtual.id === 'master' || this.perfilAtual.id === 'admin' || 
               this.perfilAtual.nivel >= 90;
    },

    // ================================================================
    // OBTER DADOS DO FUNCIONÁRIO LOGADO
    // ================================================================
    getFuncionarioLogado: function() {
        if (this._funcionarioDados) return this._funcionarioDados;
        if (this.isFuncionario() && this.perfilAtual && this.perfilAtual.funcionarioId) {
            var funcionarios = GR.State.data.funcionarios || [];
            this._funcionarioDados = funcionarios.find(function(f) {
                return f.id === GR.Modules.Perfis.perfilAtual.funcionarioId;
            });
            return this._funcionarioDados;
        }
        return null;
    },

    // ================================================================
    // OBTER PERFIL ATUAL
    // ================================================================
    getPerfilAtual: function() {
        if (!this.perfilAtual) {
            this._forcarCarregamentoPerfil();
        }
        return this.perfilAtual;
    },

    // ================================================================
    // PERMISSÕES ESPECÍFICAS PARA FUNCIONÁRIOS
    // ================================================================
    podeFuncionarioPonto: function() {
        if (!this.perfilAtual) this._forcarCarregamentoPerfil();
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.funcionario_ponto === true;
    },

    podeFuncionarioDocumentos: function() {
        if (!this.perfilAtual) this._forcarCarregamentoPerfil();
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.funcionario_documentos === true;
    },

    podeFuncionarioContracheques: function() {
        if (!this.perfilAtual) this._forcarCarregamentoPerfil();
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.funcionario_contracheques === true;
    },

    podeFuncionarioContratos: function() {
        if (!this.perfilAtual) this._forcarCarregamentoPerfil();
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.funcionario_contratos === true;
    },

    podeCriarPerfilFuncionario: function() {
        if (!this.perfilAtual) this._forcarCarregamentoPerfil();
        if (!this.perfilAtual) return false;
        return this.perfilAtual.permissoes.funcionario_criar_perfil === true;
    },

    // ================================================================
    // VERIFICAR SE PODE GERENCIAR PERFIS
    // ================================================================
    podeGerenciarPerfis: function() {
        try {
            if (this.isMaster()) {
                console.log('👑 Master pode gerenciar perfis');
                return true;
            }
            
            if (!this.perfilAtual) this._forcarCarregamentoPerfil();
            if (!this.perfilAtual) return false;
            
            if (this.perfilAtual.permissoes && this.perfilAtual.permissoes.gerenciarPerfis === true) {
                return true;
            }
            
            var user = firebase.auth().currentUser;
            if (user && user.email) {
                if (user.email === 'roqueep@gmail.com' || 
                    user.email === 'admin@gestaorural.com' ||
                    user.email === 'master@gestaorural.com') {
                    console.log('👑 Email Master reconhecido, pode gerenciar perfis');
                    return true;
                }
            }
            
            return false;
        } catch (e) {
            console.warn('⚠️ Erro ao verificar permissão de gerenciar perfis:', e);
            return false;
        }
    },

    // ================================================================
    // VERIFICAR OUTRAS PERMISSÕES
    // ================================================================
    podeVisualizar: function(modulo) {
        try {
            var perfil = this.getPerfilAtual();
            if (!perfil || !perfil.permissoes) return false;
            
            if (this.isMaster()) return true;
            
            var permissao = 'visualizar' + modulo.charAt(0).toUpperCase() + modulo.slice(1);
            return perfil.permissoes[permissao] === true;
        } catch (e) {
            return false;
        }
    },

    podeCriar: function(modulo) {
        try {
            var perfil = this.getPerfilAtual();
            if (!perfil || !perfil.permissoes) return false;
            
            if (this.isMaster()) return true;
            
            var permissao = 'gerenciar' + modulo.charAt(0).toUpperCase() + modulo.slice(1);
            return perfil.permissoes[permissao] === true;
        } catch (e) {
            return false;
        }
    },

    podeEditar: function(modulo) {
        return this.podeCriar(modulo);
    },

    podeExcluir: function(modulo) {
        try {
            var perfil = this.getPerfilAtual();
            if (!perfil || !perfil.permissoes) return false;
            
            if (this.isMaster()) return true;
            
            if (perfil.permissoes.excluirDados === true) {
                return true;
            }
            
            var permissao = 'gerenciar' + modulo.charAt(0).toUpperCase() + modulo.slice(1);
            return perfil.permissoes[permissao] === true;
        } catch (e) {
            return false;
        }
    },

    podeZerarBanco: function() {
        try {
            var perfil = this.getPerfilAtual();
            if (!perfil || !perfil.permissoes) return false;
            
            if (this.isMaster()) return true;
            
            return perfil.permissoes.zerarBanco === true;
        } catch (e) {
            return false;
        }
    },

    podeVer: function(modulo) {
        return this.podeVisualizar(modulo);
    },

    // ================================================================
    // CRIAR PERFIL PARA FUNCIONÁRIO
    // ================================================================
    criarPerfilFuncionario: function(funcionarioId, senha) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var user = firebase.auth().currentUser;
            if (!user) {
                reject('Usuário não autenticado');
                return;
            }

            if (!self.podeCriarPerfilFuncionario()) {
                reject('Você não tem permissão para criar perfis de funcionário!');
                return;
            }

            var funcionario = GR.State.data.funcionarios.find(function(f) {
                return f.id === funcionarioId;
            });

            if (!funcionario) {
                reject('Funcionário não encontrado');
                return;
            }

            var perfis = GR.State.data.perfis || {};
            var perfilExistente = Object.keys(perfis).find(function(key) {
                return perfis[key].funcionarioId === funcionarioId;
            });

            if (perfilExistente) {
                reject('Este funcionário já possui um perfil de acesso!');
                return;
            }

            var email = funcionario.cpf ? funcionario.cpf.replace(/\D/g, '') + '@gestaorural.app' : funcionarioId + '@gestaorural.app';

            firebase.auth().createUserWithEmailAndPassword(email, senha)
                .then(function(userCredential) {
                    var uid = userCredential.user.uid;
                    
                    var dadosPerfil = {
                        tipo: 'funcionario',
                        funcionarioId: funcionarioId,
                        nome: funcionario.nome,
                        cpf: funcionario.cpf,
                        cargo: funcionario.cargo || '',
                        propriedade: funcionario.propriedade || '',
                        dataCriacao: GR.Utils.now(),
                        criadoPor: user.uid
                    };

                    return db.collection('users').doc(user.uid).collection('perfis').doc(uid).set(dadosPerfil);
                })
                .then(function() {
                    if (!GR.State.data.perfis) GR.State.data.perfis = {};
                    resolve('✅ Perfil de funcionário criado com sucesso! CPF: ' + funcionario.cpf + ' | Senha: ' + senha);
                })
                .catch(function(err) {
                    if (err.code === 'auth/email-already-in-use') {
                        reject('❌ Este CPF já possui um perfil de acesso!');
                    } else {
                        reject('❌ Erro ao criar perfil: ' + err.message);
                    }
                });
        });
    },

    // ================================================================
    // LOGIN DO FUNCIONÁRIO
    // ================================================================
    loginFuncionario: function() {
        var cpf = document.getElementById('login-func-cpf').value.trim();
        var senha = document.getElementById('login-func-senha').value;

        if (!cpf) { GR.Toast.error('Digite o CPF!'); return; }
        if (!senha) { GR.Toast.error('Digite a senha!'); return; }

        cpf = cpf.replace(/\D/g, '');
        var email = cpf + '@gestaorural.app';

        firebase.auth().signInWithEmailAndPassword(email, senha)
            .then(function(userCredential) {
                var user = userCredential.user;
                
                var perfis = GR.State.data.perfis || {};
                var perfil = perfis[user.uid];

                if (!perfil || perfil.tipo !== 'funcionario') {
                    GR.Toast.error('Acesso negado. Perfil não encontrado.');
                    firebase.auth().signOut();
                    return;
                }

                var funcionario = GR.State.data.funcionarios.find(function(f) {
                    return f.id === perfil.funcionarioId;
                });

                if (!funcionario) {
                    GR.Toast.error('Dados do funcionário não encontrados!');
                    firebase.auth().signOut();
                    return;
                }

                GR.Modal.close('modal-login-funcionario');
                GR.Toast.success('✅ Bem-vindo, ' + perfil.nome + '!');
                
                GR.Modules.Perfis._funcionarioLogado = perfil.funcionarioId;
                GR.Modules.Perfis._funcionarioDados = funcionario;
                
                GR.Modules.Perfis._forcarCarregamentoPerfil();
                GR.Modules.Perfis.renderAreaFuncionario();
                
                document.getElementById('mainNav').querySelectorAll('.nav-btn').forEach(function(btn) {
                    if (btn.dataset.section !== 'funcionarios') {
                        btn.style.display = 'none';
                    }
                });
                
                var footerUser = document.getElementById('footer-user-name');
                if (footerUser) {
                    footerUser.textContent = '👨‍🌾 ' + funcionario.nome + ' (Funcionário)';
                }
            })
            .catch(function(err) {
                if (err.code === 'auth/user-not-found') {
                    GR.Toast.error('❌ CPF não encontrado! Verifique com o administrador.');
                } else if (err.code === 'auth/wrong-password') {
                    GR.Toast.error('❌ Senha incorreta! Tente novamente.');
                } else {
                    GR.Toast.error('❌ Erro ao fazer login: ' + err.message);
                }
                console.error(err);
            });
    },

    // ================================================================
    // LOGOUT DO FUNCIONÁRIO
    // ================================================================
    logoutFuncionario: function() {
        var self = this;
        firebase.auth().signOut().then(function() {
            self._funcionarioLogado = null;
            self._funcionarioDados = null;
            self.perfilAtual = null;
            self._ultimoPerfilId = null;
            
            GR.Toast.success('Deslogado com sucesso!');
            
            document.getElementById('mainNav').querySelectorAll('.nav-btn').forEach(function(btn) {
                btn.style.display = '';
            });
            
            setTimeout(function() {
                self._forcarCarregamentoPerfil();
                self.filtrarMenu();
                location.reload();
            }, 500);
        }).catch(function(err) {
            GR.Toast.error('Erro ao deslogar: ' + err.message);
        });
    },

    // ================================================================
    // RENDERIZAR ÁREA DO FUNCIONÁRIO
    // ================================================================
    renderAreaFuncionario: function() {
        var div = document.getElementById('area-funcionario');
        if (!div) {
            var container = document.getElementById('section-funcionarios');
            if (container) {
                div = document.createElement('div');
                div.id = 'area-funcionario';
                container.appendChild(div);
            }
        }
        if (!div) {
            setTimeout(function() {
                GR.Modules.Perfis.renderAreaFuncionario();
            }, 500);
            return;
        }

        var perfil = this.getPerfilAtual();
        if (!perfil || perfil.id !== 'funcionario') {
            div.innerHTML = `
                <div class="empty-state" style="padding:40px;">
                    <span class="icon" style="font-size:48px;">🔒</span>
                    <div class="message" style="font-size:16px;">Acesso restrito a funcionários</div>
                    <div style="margin-top:12px;">
                        <button class="btn btn-primary" onclick="GR.Modules.Perfis.abrirLoginFuncionario()">
                            👨‍🌾 Sou Funcionário
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        var funcionario = this.getFuncionarioLogado();
        if (!funcionario) {
            div.innerHTML = '<div class="empty-state"><span class="icon">👨‍🌾</span><div class="message">Dados do funcionário não encontrados</div></div>';
            return;
        }

        var html = this._renderizarCabecalho(funcionario);
        html += this._renderizarAbas(funcionario);
        div.innerHTML = html;

        this._carregarAba('ponto', funcionario.id);
    },

    // ================================================================
    // ABRIR LOGIN DO FUNCIONÁRIO
    // ================================================================
    abrirLoginFuncionario: function() {
        if (this.isMaster() || this.isMasterOrAdmin()) {
            GR.Toast.info('👑 Você já está logado como ' + (this.isMaster() ? 'Master' : 'Administrador'));
            return;
        }
        
        var modalId = 'modal-login-funcionario';
        var modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }

        var html = `
        <div id="${modalId}" class="modal" role="dialog" aria-modal="true">
            <div class="modal-content" style="max-width:400px;">
                <div class="modal-header">
                    <h2 class="modal-title">👨‍🌾 Acesso do Funcionário</h2>
                    <button class="close-btn" onclick="GR.Modal.close('${modalId}')">×</button>
                </div>
                <div style="padding:16px;">
                    <div style="text-align:center;margin-bottom:16px;">
                        <span style="font-size:48px;">👤</span>
                        <p style="font-size:13px;color:var(--text-light);">Digite seu CPF e senha para acessar sua área exclusiva</p>
                    </div>
                    <div class="form-group">
                        <label>CPF</label>
                        <input type="text" id="login-func-cpf" class="form-control" placeholder="000.000.000-00" maxlength="14" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*?)\\..*/g, '$1').replace(/^(\\d{3})(\\d{3})(\\d{3})(\\d{2})$/, '$1.$2.$3-$4')">
                    </div>
                    <div class="form-group">
                        <label>Senha</label>
                        <input type="password" id="login-func-senha" class="form-control" placeholder="••••••••">
                    </div>
                    <button class="btn btn-primary" onclick="GR.Modules.Perfis.loginFuncionario()" style="width:100%;padding:10px;font-size:16px;">
                        🔓 Entrar
                    </button>
                    <div style="margin-top:12px;text-align:center;font-size:12px;color:var(--text-light);">
                        <a href="#" onclick="GR.Modal.close('${modalId}')">Voltar</a>
                        &nbsp;|&nbsp;
                        <a href="#" onclick="GR.Toast.info('Entre em contato com o administrador para criar seu acesso.');">Esqueceu a senha?</a>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        GR.Modal.open(modalId);
    },

    // ================================================================
    // RENDERIZAR CABEÇALHO DO FUNCIONÁRIO
    // ================================================================
    _renderizarCabecalho: function(funcionario) {
        var fotoHtml = funcionario.foto ?
            `<img src="${funcionario.foto}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--border);">` :
            '<span style="font-size:60px;">👤</span>';

        var statusBadge = funcionario.status === 'Ativo' ? 'badge-success' :
            funcionario.status === 'Férias' ? 'badge-warning' : 'badge-danger';

        return `
            <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:16px;background:var(--surface);border-radius:8px;border:1px solid var(--border);margin-bottom:16px;">
                ${fotoHtml}
                <div style="flex:1;">
                    <h2 style="margin:0;">${GR.Utils.escapeHtml(funcionario.nome)}</h2>
                    <div style="font-size:14px;color:var(--text-light);">
                        ${GR.Utils.escapeHtml(funcionario.cargo || 'Sem cargo')}
                        <span class="${statusBadge}" style="margin-left:8px;">${funcionario.status || 'Ativo'}</span>
                    </div>
                    <div style="font-size:12px;color:var(--text-light);margin-top:4px;">
                        🏠 ${GR.Utils.escapeHtml(funcionario.propriedade || 'Propriedade não definida')}
                        ${funcionario.admissao ? ' | 📅 Admissão: ' + GR.Utils.formatarDataBR(funcionario.admissao) : ''}
                    </div>
                </div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <button class="btn btn-danger btn-sm" onclick="GR.Modules.Perfis.logoutFuncionario()" title="Sair da área do funcionário">
                        🚪 Sair
                    </button>
                </div>
            </div>
        `;
    },

    // ================================================================
    // RENDERIZAR ABAS
    // ================================================================
    _renderizarAbas: function(funcionario) {
        var abas = [];
        if (this.podeFuncionarioPonto()) abas.push({ id: 'ponto', nome: '🕐 Ponto', icon: '🕐' });
        if (this.podeFuncionarioDocumentos()) abas.push({ id: 'documentos', nome: '📁 Documentos', icon: '📁' });
        if (this.podeFuncionarioContracheques()) abas.push({ id: 'contracheques', nome: '📄 Contracheques', icon: '📄' });
        if (this.podeFuncionarioContratos()) abas.push({ id: 'contratos', nome: '📋 Contratos', icon: '📋' });

        if (!abas.length) {
            return '<div style="text-align:center;padding:20px;color:var(--text-light);">Você não tem permissão para acessar nenhuma funcionalidade.</div>';
        }

        var html = `
            <div style="margin-top:12px;">
                <div style="display:flex;gap:4px;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:4px;">
                    ${abas.map(function(aba, index) {
                        var active = index === 0 ? 'btn-primary' : 'btn-secondary';
                        return `<button class="btn btn-sm ${active}" onclick="GR.Modules.Perfis._carregarAba('${aba.id}','${funcionario.id}')">${aba.nome}</button>`;
                    }).join('')}
                </div>
                <div id="area-funcionario-aba" style="margin-top:12px;min-height:300px;">
                    <div style="text-align:center;padding:30px;color:var(--text-light);">
                        <div style="font-size:32px;margin-bottom:8px;">⏳</div>
                        <div>Carregando...</div>
                    </div>
                </div>
            </div>
        `;

        return html;
    },

    // ================================================================
    // CARREGAR ABA
    // ================================================================
    _carregarAba: function(aba, funcionarioId) {
        var content = document.getElementById('area-funcionario-aba');
        if (!content) return;

        var funcionario = GR.State.data.funcionarios.find(function(f) {
            return f.id === funcionarioId;
        });
        if (!funcionario) {
            content.innerHTML = '<div style="color:var(--danger);">Funcionário não encontrado</div>';
            return;
        }

        var html = '';
        switch(aba) {
            case 'ponto':
                html = this._renderizarAbaPonto(funcionario);
                break;
            case 'documentos':
                html = this._renderizarAbaDocumentos(funcionario);
                break;
            case 'contracheques':
                html = this._renderizarAbaContracheques(funcionario);
                break;
            case 'contratos':
                html = this._renderizarAbaContratos(funcionario);
                break;
        }

        content.innerHTML = html;

        var botoes = content.parentElement.querySelectorAll('.btn');
        botoes.forEach(function(btn) {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
        var botaoAtivo = content.parentElement.querySelector('[onclick*="' + aba + '"]');
        if (botaoAtivo) {
            botaoAtivo.classList.remove('btn-secondary');
            botaoAtivo.classList.add('btn-primary');
        }
    },

    // ================================================================
    // ABA: PONTO
    // ================================================================
    _renderizarAbaPonto: function(funcionario) {
        var hoje = GR.Utils.now().slice(0, 10);
        var pontos = GR.State.data.pontos || [];
        var pontosFunc = pontos.filter(function(p) {
            return p.funcionarioId === funcionario.id;
        });
        var pontosHoje = pontosFunc.filter(function(p) {
            return p.data === hoje;
        });
        var pontoAberto = pontosHoje.find(function(p) {
            return p.saida === null;
        });

        var html = `
            <div style="background:var(--surface);border-radius:8px;padding:16px;border:1px solid var(--border);">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div>
                        <div style="font-size:14px;font-weight:600;">📅 ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div style="font-size:12px;color:var(--text-light);margin-top:4px;">
                            ${pontoAberto ? '🟢 Turno em andamento' : '⏸️ Turno não iniciado'}
                            ${pontoAberto ? ' | Entrada: ' + pontoAberto.entrada : ''}
                            ${pontoAberto && pontoAberto.talhao ? ' | 📍 ' + pontoAberto.talhao : ''}
                        </div>
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        ${pontoAberto ?
                            `<button class="btn btn-danger" onclick="GR.Modules.Perfis._finalizarPontoFuncionario('${funcionario.id}')">⏹️ Finalizar Turno</button>` :
                            `<button class="btn btn-success" onclick="GR.Modules.Perfis._baterPontoFuncionario('${funcionario.id}')">🕐 Bater Ponto</button>`
                        }
                    </div>
                </div>

                ${pontoAberto ? `
                    <div style="margin-top:12px;background:var(--bg);padding:12px;border-radius:6px;border:1px solid var(--border-light);">
                        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;">
                            <span>⏱️ <strong id="cronometro-funcionario">00:00:00</strong></span>
                            <span>📍 Talhão: ${pontoAberto.talhao || '-'}</span>
                            <span>📅 ${GR.Utils.formatarDataBR(pontoAberto.data)}</span>
                        </div>
                    </div>
                ` : ''}

                ${pontosFunc.length > 0 ? `
                    <div style="margin-top:12px;border-top:1px solid var(--border-light);padding-top:12px;">
                        <div style="font-size:13px;font-weight:600;margin-bottom:6px;">📋 Histórico de Ponto</div>
                        <div class="table-responsive">
                            <table style="font-size:12px;">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Entrada</th>
                                        <th>Saída</th>
                                        <th>Talhão</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pontosFunc.slice(-10).reverse().map(function(p) {
                                        var status = p.saida ? '✅ Finalizado' : '🟢 Em andamento';
                                        var badge = p.saida ? 'badge-success' : 'badge-warning';
                                        return `<tr>
                                            <td>${GR.Utils.formatarDataBR(p.data)}</td>
                                            <td>${p.entrada || '-'}</td>
                                            <td>${p.saida || '⏳'}</td>
                                            <td>${p.talhao || '-'}</td>
                                            <td><span class="${badge}">${status}</span></td>
                                        </tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : `
                    <div style="margin-top:12px;text-align:center;color:var(--text-light);font-size:13px;">
                        Nenhum registro de ponto encontrado.
                    </div>
                `}
            </div>
        `;

        if (pontoAberto && pontoAberto.entrada) {
            setTimeout(function() {
                GR.Modules.Perfis._iniciarCronometroFuncionario(pontoAberto.entrada);
            }, 100);
        }

        return html;
    },

    _baterPontoFuncionario: function(funcionarioId) {
        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        if (!f) { GR.Toast.error('Funcionário não encontrado!'); return; }

        var talhao = prompt('📍 Talhão onde está trabalhando:', 'Geral');
        if (talhao === null) return;
        if (!talhao.trim()) talhao = 'Geral';

        var hoje = GR.Utils.now().slice(0, 10);
        var agora = GR.Utils.now().slice(11, 16);

        var ref = db.collection('users').doc(user.uid).collection('pontos');
        ref.add({
            funcionarioId: funcionarioId,
            funcionarioNome: f.nome,
            data: hoje,
            entrada: agora,
            saida: null,
            talhao: talhao.trim(),
            propriedade: f.propriedade || GR.State.ui.propriedadeAtiva || 'todas',
            status: 'aberto',
            origem: 'funcionario_app',
            dataCriacao: GR.Utils.now()
        }).then(function() {
            GR.Toast.success('✅ Ponto registrado!');
            GR.State.adicionarHistorico('bateu ponto', 'Ponto', 'Funcionário: ' + f.nome);
            GR.Modules.Perfis._carregarAba('ponto', funcionarioId);
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro: ' + err.message);
        });
    },

    _finalizarPontoFuncionario: function(funcionarioId) {
        if (!confirm('Finalizar o turno de hoje?')) return;

        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var hoje = GR.Utils.now().slice(0, 10);
        var agora = GR.Utils.now().slice(11, 16);

        var pontos = GR.State.data.pontos || [];
        var pontoAberto = pontos.find(function(p) {
            return p.funcionarioId === funcionarioId && p.data === hoje && p.saida === null;
        });

        if (!pontoAberto) {
            GR.Toast.warning('Nenhum ponto aberto para finalizar.');
            return;
        }

        db.collection('users').doc(user.uid).collection('pontos').doc(pontoAberto.id).update({
            saida: agora,
            status: 'finalizado'
        }).then(function() {
            GR.Toast.success('✅ Turno finalizado!');
            GR.State.adicionarHistorico('finalizou turno', 'Ponto', 'Funcionário: ' + (pontoAberto.funcionarioNome || ''));
            GR.Modules.Perfis._carregarAba('ponto', funcionarioId);
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro: ' + err.message);
        });
    },

    _iniciarCronometroFuncionario: function(entrada) {
        var el = document.getElementById('cronometro-funcionario');
        if (!el) return;

        if (this._cronometroInterval) {
            clearInterval(this._cronometroInterval);
        }

        var entradaDate = new Date();
        var partes = entrada.split(':');
        entradaDate.setHours(parseInt(partes[0]) || 0, parseInt(partes[1]) || 0, 0, 0);

        var agora = new Date();
        if (entradaDate > agora) {
            entradaDate.setDate(entradaDate.getDate() - 1);
        }

        this._cronometroInterval = setInterval(function() {
            var agora = new Date();
            var diff = agora - entradaDate;
            var horas = Math.floor(diff / 3600000);
            var minutos = Math.floor((diff % 3600000) / 60000);
            var segundos = Math.floor((diff % 60000) / 1000);

            el.textContent = String(horas).padStart(2, '0') + ':' +
                String(minutos).padStart(2, '0') + ':' +
                String(segundos).padStart(2, '0');
        }, 1000);
    },

    // ================================================================
    // ABA: DOCUMENTOS
    // ================================================================
    _renderizarAbaDocumentos: function(funcionario) {
        var docs = funcionario.documentos || {};

        var tipos = {
            rg: { label: '🪪 RG / CNH', icon: '🪪' },
            ctps: { label: '📋 Carteira de Trabalho', icon: '📋' },
            contrato: { label: '📄 Contrato de Trabalho', icon: '📄' },
            outros: { label: '📎 Outros Documentos', icon: '📎' }
        };

        var html = `
            <div style="background:var(--surface);border-radius:8px;padding:16px;border:1px solid var(--border);">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        `;

        for (var key in tipos) {
            var doc = docs[key];
            html += `
                <div style="background:var(--bg);border-radius:6px;padding:12px;border:1px solid var(--border-light);">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">
                        <h4 style="margin:0;font-size:13px;">${tipos[key].label}</h4>
                        ${doc ? `<span class="badge-success">✅ Anexado</span>` : `<span class="badge-secondary">⏳ Pendente</span>`}
                    </div>
                    ${doc ? `
                        <div style="margin-top:6px;font-size:12px;color:var(--text-light);">
                            <div>📄 ${GR.Utils.escapeHtml(doc.nome || 'Documento')}</div>
                            <div>📅 ${doc.data ? GR.Utils.formatarDataBR(doc.data.slice(0,10)) : ''}</div>
                            <div style="margin-top:4px;display:flex;gap:4px;">
                                <button class="btn btn-info btn-sm" onclick="GR.Modules.Perfis._visualizarDocumentoFuncionario('${funcionario.id}','${key}')" style="font-size:10px;padding:2px 6px;">👁️ Visualizar</button>
                            </div>
                        </div>
                    ` : `
                        <div style="margin-top:6px;font-size:12px;color:var(--text-light);">
                            Nenhum documento anexado
                        </div>
                    `}
                </div>
            `;
        }

        html += `
                </div>
                <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light);font-size:11px;color:var(--text-light);">
                    💡 Para anexar documentos, entre em contato com o administrador.
                </div>
            </div>
        `;

        return html;
    },

    _visualizarDocumentoFuncionario: function(funcionarioId, tipo) {
        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        if (!f) { GR.Toast.error('Funcionário não encontrado!'); return; }

        var doc = f.documentos && f.documentos[tipo];
        if (!doc || !doc.conteudo) {
            GR.Toast.warning('Documento sem conteúdo.');
            return;
        }

        var conteudo = doc.conteudo;
        var win = window.open('', '_blank');

        if (conteudo.startsWith('data:image')) {
            win.document.write(`
                <html>
                    <head><title>${doc.nome || 'Documento'}</title></head>
                    <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f0f0;">
                        <img src="${conteudo}" style="max-width:95%;max-height:95%;object-fit:contain;">
                    </body>
                </html>
            `);
        } else if (conteudo.startsWith('data:application/pdf')) {
            win.document.write(`
                <html>
                    <head><title>${doc.nome || 'Documento'}</title></head>
                    <body style="margin:0;height:100vh;">
                        <embed src="${conteudo}" type="application/pdf" width="100%" height="100%">
                    </body>
                </html>
            `);
        } else {
            win.document.write(`
                <html>
                    <head><title>${doc.nome || 'Documento'}</title></head>
                    <body style="padding:20px;font-family:monospace;white-space:pre-wrap;max-width:800px;margin:0 auto;">
                        ${conteudo}
                    </body>
                </html>
            `);
        }
        win.document.close();
    },

    // ================================================================
    // ABA: CONTRACHEQUES
    // ================================================================
    _renderizarAbaContracheques: function(funcionario) {
        var recibos = GR.State.data.recibos || [];
        var recibosFunc = recibos.filter(function(r) {
            return r.funcionarioId === funcionario.id;
        });

        if (!recibosFunc.length) {
            return `
                <div style="background:var(--surface);border-radius:8px;padding:16px;border:1px solid var(--border);text-align:center;color:var(--text-light);">
                    <div style="font-size:32px;margin-bottom:8px;">📄</div>
                    <div>Nenhum contracheque disponível.</div>
                    <div style="font-size:12px;margin-top:4px;">Os contracheques são gerados pelo administrador.</div>
                </div>
            `;
        }

        var html = `
            <div style="background:var(--surface);border-radius:8px;padding:16px;border:1px solid var(--border);">
                <div style="font-size:14px;font-weight:600;margin-bottom:12px;">📄 Meus Contracheques</div>
                <div class="table-responsive">
                    <table style="font-size:12px;">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Mês/Ano</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recibosFunc.slice(-12).reverse().map(function(r) {
                                return `<tr>
                                    <td>${r.data ? GR.Utils.formatarDataBR(r.data) : '-'}</td>
                                    <td>${r.mesAno || '-'}</td>
                                    <td>${r.valor ? GR.Utils.formatarMoedaBR(r.valor) : '-'}</td>
                                    <td>
                                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Perfis._visualizarContracheque('${r.id}')" style="font-size:10px;padding:2px 6px;">👁️ Ver</button>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return html;
    },

    _visualizarContracheque: function(reciboId) {
        var recibo = (GR.State.data.recibos || []).find(function(r) { return r.id === reciboId; });
        if (!recibo) { GR.Toast.error('Contracheque não encontrado!'); return; }

        var win = window.open('', '_blank');
        var conteudo = recibo.conteudo || 'Contracheque sem conteúdo.';

        win.document.write(`
            <html>
                <head>
                    <title>Contracheque</title>
                    <style>
                        body { font-family: monospace; padding: 40px; max-width: 700px; margin: 0 auto; line-height: 1.6; }
                        .recibo { white-space: pre-wrap; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="recibo">${conteudo.replace(/\n/g, '<br>')}</div>
                    <div class="no-print" style="margin-top:20px;text-align:center;">
                        <button onclick="window.print()">🖨️ Imprimir</button>
                        <button onclick="window.close()">Fechar</button>
                    </div>
                </body>
            </html>
        `);
        win.document.close();
    },

    // ================================================================
    // ABA: CONTRATOS
    // ================================================================
    _renderizarAbaContratos: function(funcionario) {
        var html = `
            <div style="background:var(--surface);border-radius:8px;padding:16px;border:1px solid var(--border);">
                <div style="font-size:14px;font-weight:600;margin-bottom:12px;">📋 Meus Contratos</div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="background:var(--bg);border-radius:6px;padding:12px;border:1px solid var(--border-light);">
                        <h4 style="margin:0;font-size:13px;">📄 Tipo de Contrato</h4>
                        <div style="margin-top:6px;font-size:14px;font-weight:600;">${funcionario.tipoContrato || 'CLT'}</div>
                        <div style="font-size:12px;color:var(--text-light);margin-top:4px;">
                            ${funcionario.admissao ? 'Admissão: ' + GR.Utils.formatarDataBR(funcionario.admissao) : ''}
                            ${funcionario.dataTermino ? ' | Término: ' + GR.Utils.formatarDataBR(funcionario.dataTermino) : ''}
                        </div>
                    </div>

                    <div style="background:var(--bg);border-radius:6px;padding:12px;border:1px solid var(--border-light);">
                        <h4 style="margin:0;font-size:13px;">💰 Salário</h4>
                        <div style="margin-top:6px;font-size:18px;font-weight:700;color:var(--primary);">
                            ${GR.Utils.formatarMoedaBR(funcionario.salario || 0)}
                        </div>
                        <div style="font-size:12px;color:var(--text-light);margin-top:4px;">
                            ${funcionario.cargo ? 'Cargo: ' + funcionario.cargo : ''}
                        </div>
                    </div>
                </div>

                <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light);">
                    <div style="font-size:13px;font-weight:600;margin-bottom:6px;">📋 Detalhes do Contrato</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
                        <div><strong>Status:</strong> ${funcionario.status || 'Ativo'}</div>
                        <div><strong>Propriedade:</strong> ${funcionario.propriedade || '-'}</div>
                        ${funcionario.obs ? `<div style="grid-column:span 2;"><strong>Observações:</strong> ${funcionario.obs}</div>` : ''}
                    </div>
                </div>

                ${funcionario.documentos && funcionario.documentos.contrato ? `
                    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light);">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">
                            <span style="font-size:13px;font-weight:600;">📄 Contrato em PDF</span>
                            <button class="btn btn-info btn-sm" onclick="GR.Modules.Perfis._visualizarDocumentoFuncionario('${funcionario.id}','contrato')">👁️ Visualizar Contrato</button>
                        </div>
                        <div style="font-size:11px;color:var(--text-light);margin-top:4px;">
                            ${funcionario.documentos.contrato.nome ? 'Arquivo: ' + funcionario.documentos.contrato.nome : ''}
                            ${funcionario.documentos.contrato.data ? ' | Data: ' + GR.Utils.formatarDataBR(funcionario.documentos.contrato.data.slice(0,10)) : ''}
                        </div>
                    </div>
                ` : `
                    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light);font-size:12px;color:var(--text-light);">
                        📄 Nenhum contrato em PDF anexado.
                    </div>
                `}
            </div>
        `;

        return html;
    },

    // ================================================================
    // RENDER MODAL DE GERENCIAMENTO DE PERFIS
    // ================================================================
    _renderModalPerfis: function() {
        if (!this.podeGerenciarPerfis()) {
            GR.Toast.error('❌ Você não tem permissão para gerenciar perfis!');
            return;
        }

        var modalId = 'modal-gerenciar-perfis';
        var modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }
        
        this.perfis = this.perfis || JSON.parse(JSON.stringify(this.perfisPadrao));
        var modulos = this.modulos;
        var acoes = this.acoes;
        var self = this;
        var perfisKeys = Object.keys(this.perfis);
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
                                var p = self.perfis[key];
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
                            <span><strong>Perfil:</strong> <span id="perfil-nome-exibicao">${self.perfis[primeiroPerfil].nome}</span></span>
                            <span><strong>Nível:</strong> <span id="perfil-nivel-exibicao">${self.perfis[primeiroPerfil].nivel}</span></span>
                            <span><strong>Descrição:</strong> <span id="perfil-descricao-exibicao">${self.perfis[primeiroPerfil].descricao}</span></span>
                            <span><strong>Status:</strong> <span id="perfil-fixo-exibicao">${self.perfis[primeiroPerfil].fixo ? '🔒 Fixo' : '📝 Personalizado'}</span></span>
                            <span><strong>🏠 Propriedades:</strong> <span id="perfil-propriedades-exibicao">${self.perfis[primeiroPerfil].propriedadesPermitidas ? self.perfis[primeiroPerfil].propriedadesPermitidas.length + ' selecionadas' : 'Todas'}</span></span>
                        </div>
                    </div>
                    
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
                        <button class="btn btn-success btn-sm" onclick="GR.Modules.Perfis._marcarTodasPermissoes(true)">✅ Marcar Todas</button>
                        <button class="btn btn-danger btn-sm" onclick="GR.Modules.Perfis._marcarTodasPermissoes(false)">❌ Desmarcar Todas</button>
                        <button class="btn btn-warning btn-sm" onclick="GR.Modules.Perfis._restaurarPadraoPerfil()">🔄 Restaurar Padrão</button>
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Perfis._clonarPerfil()">📋 Clonar Perfil</button>
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
                                    return `
                                    <tr style="border-bottom:1px solid var(--border-light);">
                                        <td style="padding:4px 8px;font-weight:500;">
                                            <span style="font-size:14px;">${modulo.icon}</span> ${modulo.nome}
                                        </td>
                                        ${acoes.map(function(acao) {
                                            var perfilId = primeiroPerfil;
                                            var checked = self._hasPermissao(perfilId, modulo.id, acao.id) ? 'checked' : '';
                                            return `
                                            <td style="text-align:center;padding:4px 2px;">
                                                <input type="checkbox" class="permissao-check" 
                                                       data-perfil="${perfilId}" 
                                                       data-modulo="${modulo.id}" 
                                                       data-acao="${acao.id}"
                                                       ${checked}
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
        if (!perfil) {
            if (this.perfisPadrao[perfilId]) {
                this.perfis[perfilId] = JSON.parse(JSON.stringify(this.perfisPadrao[perfilId]));
                perfil = this.perfis[perfilId];
            } else {
                return;
            }
        }
        
        document.querySelectorAll('.perfil-btn').forEach(function(btn) {
            btn.className = 'btn btn-secondary btn-sm perfil-btn';
            if (btn.dataset.perfil === perfilId) {
                btn.className = 'btn btn-primary btn-sm perfil-btn';
            }
        });
        
        var nomeEl = document.getElementById('perfil-nome-exibicao');
        if (nomeEl) nomeEl.textContent = perfil.nome;
        
        var nivelEl = document.getElementById('perfil-nivel-exibicao');
        if (nivelEl) nivelEl.textContent = perfil.nivel;
        
        var descEl = document.getElementById('perfil-descricao-exibicao');
        if (descEl) descEl.textContent = perfil.descricao;
        
        var fixoEl = document.getElementById('perfil-fixo-exibicao');
        if (fixoEl) fixoEl.textContent = perfil.fixo ? '🔒 Fixo' : '📝 Personalizado';
        
        var propEl = document.getElementById('perfil-propriedades-exibicao');
        if (propEl) {
            if (perfil.propriedadesPermitidas && perfil.propriedadesPermitidas.length > 0) {
                propEl.textContent = perfil.propriedadesPermitidas.length + ' selecionadas';
                propEl.style.color = 'var(--info)';
            } else {
                propEl.textContent = 'Todas';
                propEl.style.color = 'var(--success)';
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
        if (!perfil) {
            if (this.perfisPadrao[perfilId]) {
                perfil = this.perfisPadrao[perfilId];
            } else {
                return false;
            }
        }
        var permissoes = perfil.permissoes;
        if (!permissoes[acao]) return false;
        if (permissoes[acao].includes('*')) return true;
        return permissoes[acao].includes(modulo);
    },

    _hasPermissaoEspecial: function(perfilId, acao) {
        var perfil = this.perfis[perfilId];
        if (!perfil) {
            if (this.perfisPadrao[perfilId]) {
                perfil = this.perfisPadrao[perfilId];
            } else {
                return false;
            }
        }
        return perfil.permissoes[acao] === true;
    },

    // ================================================================
    // ALTERNAR PERMISSÃO
    // ================================================================
    _togglePermissao: function(checkbox, perfilId, modulo, acao) {
        var perfil = this.perfis[perfilId];
        if (!perfil) {
            if (this.perfisPadrao[perfilId]) {
                this.perfis[perfilId] = JSON.parse(JSON.stringify(this.perfisPadrao[perfilId]));
                perfil = this.perfis[perfilId];
            } else {
                return;
            }
        }
        
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
    },

    _togglePermissaoEspecial: function(checkbox, perfilId, acao) {
        var perfil = this.perfis[perfilId];
        if (!perfil) {
            if (this.perfisPadrao[perfilId]) {
                this.perfis[perfilId] = JSON.parse(JSON.stringify(this.perfisPadrao[perfilId]));
                perfil = this.perfis[perfilId];
            } else {
                return;
            }
        }
        perfil.permissoes[acao] = checkbox.checked;
    },

    // ================================================================
    // AÇÕES RÁPIDAS
    // ================================================================
    _marcarTodasPermissoes: function(checked) {
        var perfilId = this._getPerfilSelecionado();
        var perfil = this.perfis[perfilId];
        if (!perfil) {
            if (this.perfisPadrao[perfilId]) {
                this.perfis[perfilId] = JSON.parse(JSON.stringify(this.perfisPadrao[perfilId]));
                perfil = this.perfis[perfilId];
            } else {
                return;
            }
        }
        
        var acoes = ['ver', 'criar', 'editar', 'excluir', 'exportar', 'imprimir'];
        var modulos = this.modulos.map(function(m) { return m.id; });
        
        acoes.forEach(function(acao) {
            perfil.permissoes[acao] = checked ? modulos.slice() : [];
        });
        
        this._selecionarPerfil(perfilId);
    },

    _restaurarPadraoPerfil: function() {
        var perfilId = this._getPerfilSelecionado();
        var perfil = this.perfis[perfilId];
        if (!perfil) {
            if (this.perfisPadrao[perfilId]) {
                this.perfis[perfilId] = JSON.parse(JSON.stringify(this.perfisPadrao[perfilId]));
                perfil = this.perfis[perfilId];
            } else {
                return;
            }
        }
        
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
                viveiro_producao: false,
                viveiro_vendas: false,
                viveiro_caixa: false,
                viveiro_relatorios: false,
                viveiro_exportar: false,
                viveiro_alterar_propriedade: false
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
        if (!perfil) {
            if (this.perfisPadrao[perfilId]) {
                perfil = this.perfisPadrao[perfilId];
            } else {
                return;
            }
        }
        
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
        var keys = Object.keys(this.perfis || {});
        return keys.length > 0 ? keys[0] : 'operador';
    },

    // ================================================================
    // GERENCIAR PROPRIEDADES PERMITIDAS
    // ================================================================
    _gerenciarPropriedadesPermitidas: function(perfilId) {
        var perfil = this.perfis[perfilId];
        if (!perfil) {
            if (this.perfisPadrao[perfilId]) {
                this.perfis[perfilId] = JSON.parse(JSON.stringify(this.perfisPadrao[perfilId]));
                perfil = this.perfis[perfilId];
            } else {
                GR.Toast.error('Perfil não encontrado!');
                return;
            }
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
        
        var isMaster = perfilId === 'master' || perfilId === 'admin';
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
                                        var disabled = isMaster ? 'disabled' : '';
                                        var checkedAttr = isChecked ? 'checked' : '';
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
                                                       ${checkedAttr}
                                                       ${disabled}
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

    // ================================================================
    // TOGGLE PROPRIEDADE PERMITIDA
    // ================================================================
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

    // ================================================================
    // MARCAR TODAS PROPRIEDADES
    // ================================================================
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
        
        var propEl = document.getElementById('perfil-propriedades-exibicao');
        if (propEl) {
            if (perfil.propriedadesPermitidas && perfil.propriedadesPermitidas.length > 0) {
                propEl.textContent = perfil.propriedadesPermitidas.length + ' selecionadas';
                propEl.style.color = 'var(--info)';
            } else {
                propEl.textContent = 'Todas';
                propEl.style.color = 'var(--success)';
            }
        }
    },

    // ================================================================
    // SALVAR PROPRIEDADES PERMITIDAS
    // ================================================================
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
    // CARREGAR PERFIL USUÁRIO
    // ================================================================
    _carregarPerfilUsuario: function(uid) {
        if (!uid) return;
        var self = this;
        db.collection('users').doc(uid).collection('config').doc('perfis').get()
            .then(function(doc) {
                if (doc.exists) {
                    var data = doc.data();
                    if (data && data.perfis) {
                        self.perfis = data.perfis;
                        self.perfisPersonalizados = data.perfisPersonalizados || {};
                    }
                }
            })
            .catch(function(err) {
                console.warn('⚠️ Erro ao carregar perfis do usuário:', err);
            });
    },

    // ================================================================
    // ZERAR BANCO DE DADOS
    // ================================================================
    zerarBancoDeDados: function() {
        console.log('💣 Função zerarBancoDeDados disponível');
    },

    // ================================================================
    // EXPORTA FUNÇÕES PARA DEBUG
    // ================================================================
    _debug: function() {
        console.log('📊 DEBUG - Perfil Atual:', this.perfilAtual);
        console.log('📊 DEBUG - Funcionário Logado:', this._funcionarioLogado);
        console.log('📊 DEBUG - Dados do Funcionário:', this._funcionarioDados);
        return {
            perfil: this.perfilAtual,
            funcionarioId: this._funcionarioLogado,
            funcionarioDados: this._funcionarioDados
        };
    },

    // ================================================================
    // RECARREGAR PERFIL
    // ================================================================
    recarregar: function() {
        this.perfilAtual = null;
        this._forcarCarregamentoPerfil();
        this.filtrarMenu();
        return this.perfilAtual;
    }
};

// ================================================================
// INICIALIZAÇÃO AUTOMÁTICA
// ================================================================
function inicializarPerfis() {
    console.log('🔄 Inicializando módulo de perfis...');
    
    if (GR.Modules && GR.Modules.Perfis) {
        GR.Modules.Perfis._forcarCarregamentoPerfil();
        GR.Modules.Perfis._carregarPerfisDoFirestore();
    }
    
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(user) {
            console.log('👤 Auth state changed - inicializando perfis');
            if (GR.Modules && GR.Modules.Perfis) {
                GR.Modules.Perfis.init();
                
                if (GR.Modules.Perfis.isFuncionario()) {
                    setTimeout(function() {
                        GR.Modules.Perfis.renderAreaFuncionario();
                    }, 500);
                }
                
                setTimeout(function() {
                    if (GR.Modules.Viveiro && typeof GR.Modules.Viveiro.render === 'function') {
                        console.log('🔄 Forçando render do Viveiro após carregar perfil');
                        GR.Modules.Viveiro.render();
                    }
                    if (GR.UI && typeof GR.UI._atualizarDashboard === 'function') {
                        GR.UI._atualizarDashboard();
                    }
                }, 500);
            }
        });
    } else {
        setTimeout(function() {
            console.log('⏳ Inicializando perfis por timeout (Firebase não detectado)');
            if (GR.Modules && GR.Modules.Perfis) {
                GR.Modules.Perfis.init();
            }
        }, 1000);
    }
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarPerfis);
} else {
    inicializarPerfis();
}

// ================================================================
// EXPOSIÇÃO GLOBAL PARA DEBUG
// ================================================================
window.GRPerfis = {
    get: function() { 
        if (GR.Modules && GR.Modules.Perfis) {
            return GR.Modules.Perfis.getPerfilAtual();
        }
        return null;
    },
    reload: function() { 
        if (GR.Modules && GR.Modules.Perfis) {
            return GR.Modules.Perfis.recarregar();
        }
        return null;
    },
    isMaster: function() {
        if (GR.Modules && GR.Modules.Perfis) {
            return GR.Modules.Perfis.isMaster();
        }
        return false;
    },
    isAdmin: function() {
        if (GR.Modules && GR.Modules.Perfis) {
            return GR.Modules.Perfis.isMasterOrAdmin();
        }
        return false;
    },
    isFuncionario: function() {
        if (GR.Modules && GR.Modules.Perfis) {
            return GR.Modules.Perfis.isFuncionario();
        }
        return false;
    },
    getFuncionario: function() {
        if (GR.Modules && GR.Modules.Perfis) {
            return GR.Modules.Perfis.getFuncionarioLogado();
        }
        return null;
    },
    podeGerenciarPerfis: function() {
        if (GR.Modules && GR.Modules.Perfis) {
            return GR.Modules.Perfis.podeGerenciarPerfis();
        }
        return false;
    },
    debug: function() {
        if (GR.Modules && GR.Modules.Perfis) {
            return GR.Modules.Perfis._debug();
        }
        return null;
    }
};

console.log('✅ Módulo Perfis v3.1 carregado com GERENCIAMENTO DE PERFIS COMPLETO!');
console.log('📌 FUNÇÕES DE DEBUG DISPONÍVEIS:');
console.log('   - window.GRPerfis.get() - Obter perfil atual');
console.log('   - window.GRPerfis.reload() - Recarregar perfil');
console.log('   - window.GRPerfis.isFuncionario() - Verificar se é funcionário');
console.log('   - window.GRPerfis.getFuncionario() - Obter dados do funcionário');
console.log('   - window.GRPerfis.debug() - Debug completo');