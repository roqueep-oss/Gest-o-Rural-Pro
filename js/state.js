// ================================================================
// STATE - GERENCIAMENTO DE ESTADO GLOBAL (VERSÃO COMPLETA CORRIGIDA)
// ================================================================
// Versão: 3.0 - COM SUPORTE A PERFIS E FUNCIONÁRIOS
// ================================================================

GR.State = {
    data: {
        usuario: null,
        propriedades: [],
        tarefas: [],
        documentos: [],
        analises: [],
        receitas: [],
        despesas: [],
        insumos: [],
        funcionarios: [],
        animais: [],
        parceiros: [],
        contratos: [],
        orcamentos: [],
        vencimentos: [],
        safras: [],
        // Coleções do Viveiro
        viveiroMudas: [],
        viveiroInsumos: [],
        viveiroServicos: [],
        viveiroTrabalhadores: [],
        viveiroVendas: [],
        viveiroCaixa: [],
        viveiroVariedades: [],
        viveiroPedidos: [],
        // 🆕 Coleções para Funcionários
        perfis: {},
        modelosRecibo: [],
        recibos: [],
        pontos: [],
        producoes: [],
        ferias: [],
        epi: [],
        // Outras coleções
        historico: [],
        notificacoes: [],
        nfes: [],
        partesRelacionadas: [],
        fornecedores: [],
        padroesExtracao: [],
        // Coleções da Produção
        culturas: [],
        colheitas: [],
        // Configurações
        configuracoes: {
            notificacoes: true,
            backupAutomatico: false,
            intervaloBackup: 24,
            tema: 'claro'
        },
        permissoes: {}
    },

    ui: {
        viewAtual: 'dashboard',
        propriedadeAtiva: 'todas',
        darkMode: false,
        tarefaEditando: null,
        documentoEditando: null,
        analiseEditando: null,
        viveiroEditando: null,
        viveiroVendaEditando: null,
        viveiroLancamentoEditando: null,
        viveiroVariedadeEditando: null,
        viveiroPedidoEditando: null,
        viveiroPedidoConvertendo: null,
        nfeEditando: null,
        insumoEditando: null,
        animalEditando: null,
        funcionarioEditando: null,
        parceiroEditando: null,
        contratoEditando: null,
        docArquivoSelecionadoId: null,
        fornecedorEditando: null,
        lastRefresh: null,
        filtrosAtivos: {},
        ordenacaoAtual: { campo: 'data', ordem: 'desc' },
        paginacao: { pagina: 1, itensPorPagina: 20 }
    },

    // CONTROLE DE INICIALIZAÇÃO
    _inicializado: false,
    _listenersAtivos: false,
    _cacheInterval: null,

    // CONTROLE PARA VENCIMENTOS
    _ultimaVerificacaoVencimentos: null,
    _verificandoVencimentos: false,
    _insumosIgnorados: ['Potácio', 'fogo', 'Ureia'],

    // ================================================================
    // INICIALIZAÇÃO
    // ================================================================
    inicializar: function() {
        if (this._inicializado) {
            console.log('ℹ️ State já inicializado');
            return this;
        }

        console.log('📊 Inicializando State v3.0...');
        var tema = localStorage.getItem('gr-tema');
        if (tema === 'dark') {
            this.ui.darkMode = true;
            document.body.classList.add('dark-mode');
        }
        var propriedade = GR.Store.getPreference('propriedadeAtiva', 'todas');
        if (propriedade) this.ui.propriedadeAtiva = propriedade;
        
        this._loadConfiguracoes();
        this._loadCache();
        
        var user = firebase.auth().currentUser;
        if (user) {
            this._initListeners();
            this._carregarPerfis();
        }
        
        this._inicializado = true;
        console.log('✅ State inicializado com sucesso!');
        return this;
    },

    // ================================================================
    // 🆕 CARREGAR PERFIS
    // ================================================================
    _carregarPerfis: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;

        var self = this;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('perfis')
            .onSnapshot(function(snapshot) {
                var perfis = {};
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    perfis[doc.id] = data;
                });
                self.data.perfis = perfis;
                self._saveCache();
                console.log('🔄 Perfis atualizados:', Object.keys(perfis).length);
                
                if (window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('perfis-atualizados', {
                        detail: { perfis: perfis }
                    }));
                }
            }, function(err) {
                console.warn('⚠️ Erro no listener de perfis:', err);
            });
    },

    // ================================================================
    // 🆕 CARREGAR RECIBOS
    // ================================================================
    _carregarRecibos: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;

        var self = this;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('recibos')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.recibos = items;
                self._saveCache();
                console.log('🔄 Recibos atualizados:', items.length);
            }, function(err) {
                console.warn('⚠️ Erro no listener de recibos:', err);
            });
    },

    // ================================================================
    // 🆕 CARREGAR MODELOS DE RECIBO
    // ================================================================
    _carregarModelosRecibo: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;

        var self = this;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('modelosRecibo')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.modelosRecibo = items;
                self._saveCache();
                console.log('🔄 Modelos de recibo atualizados:', items.length);
            }, function(err) {
                console.warn('⚠️ Erro no listener de modelos de recibo:', err);
            });
    },

    // ================================================================
    // 🆕 CARREGAR PONTOS
    // ================================================================
    _carregarPontos: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;

        var self = this;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('pontos')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.pontos = items;
                self._saveCache();
                console.log('🔄 Pontos atualizados:', items.length);
            }, function(err) {
                console.warn('⚠️ Erro no listener de pontos:', err);
            });
    },

    // ================================================================
    // 🆕 CARREGAR PRODUÇÕES
    // ================================================================
    _carregarProducoes: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;

        var self = this;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('producoes')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.producoes = items;
                self._saveCache();
                console.log('🔄 Produções atualizadas:', items.length);
            }, function(err) {
                console.warn('⚠️ Erro no listener de produções:', err);
            });
    },

    // ================================================================
    // 🆕 CARREGAR FÉRIAS
    // ================================================================
    _carregarFerias: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;

        var self = this;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('ferias')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.ferias = items;
                self._saveCache();
                console.log('🔄 Férias atualizadas:', items.length);
            }, function(err) {
                console.warn('⚠️ Erro no listener de férias:', err);
            });
    },

    // ================================================================
    // 🆕 CARREGAR EPI
    // ================================================================
    _carregarEPI: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;

        var self = this;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('epi')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.epi = items;
                self._saveCache();
                console.log('🔄 EPI atualizados:', items.length);
            }, function(err) {
                console.warn('⚠️ Erro no listener de EPI:', err);
            });
    },

    // ================================================================
    // 🆕 CARREGAR CULTURAS
    // ================================================================
    _carregarCulturas: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;
        var self = this;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('culturas')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.culturas = items;
                self._saveCache();
                console.log('🔄 Culturas atualizadas:', items.length);
            }, function(err) {
                console.warn('⚠️ Erro no listener de culturas:', err);
            });
    },

    // ================================================================
    // 🆕 CARREGAR COLHEITAS
    // ================================================================
    _carregarColheitas: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;
        var self = this;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('colheitas')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.colheitas = items;
                self._saveCache();
                console.log('🔄 Colheitas atualizadas:', items.length);
            }, function(err) {
                console.warn('⚠️ Erro no listener de colheitas:', err);
            });
    },

    // ================================================================
    // CONFIGURAÇÕES
    // ================================================================
    _loadConfiguracoes: function() {
        try {
            var config = localStorage.getItem('gr_configuracoes');
            if (config) {
                var parsed = JSON.parse(config);
                for (var key in parsed) {
                    if (this.data.configuracoes.hasOwnProperty(key)) {
                        this.data.configuracoes[key] = parsed[key];
                    }
                }
                console.log('✅ Configurações carregadas');
            }
        } catch (e) {
            console.warn('⚠️ Erro ao carregar configurações:', e);
        }
    },

    _saveConfiguracoes: function() {
        try {
            localStorage.setItem('gr_configuracoes', JSON.stringify(this.data.configuracoes));
        } catch (e) {
            console.warn('⚠️ Erro ao salvar configurações:', e);
        }
    },

    setConfiguracao: function(chave, valor) {
        if (this.data.configuracoes.hasOwnProperty(chave)) {
            this.data.configuracoes[chave] = valor;
            this._saveConfiguracoes();
            console.log('⚙️ Configuração atualizada:', chave, '=', valor);
            return true;
        }
        return false;
    },

    getConfiguracao: function(chave, padrao) {
        if (this.data.configuracoes.hasOwnProperty(chave)) {
            return this.data.configuracoes[chave];
        }
        return padrao;
    },

    // ================================================================
    // CACHE
    // ================================================================
    _loadCache: function() {
        try {
            var cached = localStorage.getItem('gr_state_cache');
            if (cached) {
                var parsed = JSON.parse(cached);
                for (var key in parsed) {
                    if (this.data.hasOwnProperty(key) && !Array.isArray(this.data[key]) && typeof this.data[key] === 'object') {
                        for (var subKey in parsed[key]) {
                            if (this.data[key].hasOwnProperty(subKey)) {
                                this.data[key][subKey] = parsed[key][subKey];
                            }
                        }
                    } else if (this.data.hasOwnProperty(key) && Array.isArray(this.data[key])) {
                        this.data[key] = parsed[key];
                    }
                }
                console.log('✅ Dados do cache restaurados');
                console.log('🏢 Fornecedores no cache:', (this.data.fornecedores || []).length);
                console.log('🌱 Variedades no cache:', (this.data.viveiroVariedades || []).length);
                console.log('📋 Pedidos no cache:', (this.data.viveiroPedidos || []).length);
                console.log('👨‍🌾 Funcionários no cache:', (this.data.funcionarios || []).length);
                console.log('🔐 Perfis no cache:', Object.keys(this.data.perfis || {}).length);
            }
        } catch (e) { console.warn('⚠️ Erro ao restaurar cache:', e); }
    },

    _saveCache: function() {
        try { 
            var dadosParaCache = {};
            for (var key in this.data) {
                if (key !== 'usuario' && key !== 'configuracoes') {
                    dadosParaCache[key] = this.data[key];
                }
            }
            localStorage.setItem('gr_state_cache', JSON.stringify(dadosParaCache)); 
        } catch (e) {}
    },

    // ================================================================
    // LISTENERS (COMPLETO)
    // ================================================================
    _initListeners: function() {
        if (this._listenersAtivos) {
            console.log('ℹ️ Listeners já ativos');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            console.log('⚠️ Nenhum usuário autenticado para iniciar listeners');
            return;
        }

        var uid = user.uid;
        console.log('📡 Iniciando listeners para:', uid);
        this._listenersAtivos = true;

        var self = this;

        // 🆕 LISTENER PARA PERFIS
        this._carregarPerfis();

        // 🆕 LISTENER PARA RECIBOS
        this._carregarRecibos();

        // 🆕 LISTENER PARA MODELOS DE RECIBO
        this._carregarModelosRecibo();

        // 🆕 LISTENER PARA PONTOS
        this._carregarPontos();

        // 🆕 LISTENER PARA PRODUÇÕES
        this._carregarProducoes();

        // 🆕 LISTENER PARA FÉRIAS
        this._carregarFerias();

        // 🆕 LISTENER PARA EPI
        this._carregarEPI();

        // 🆕 LISTENER PARA CULTURAS
        this._carregarCulturas();

        // 🆕 LISTENER PARA COLHEITAS
        this._carregarColheitas();

        // Listener para fornecedores
        db.collection('users').doc(uid).collection('fornecedores')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.fornecedores = items;
                self._saveCache();
                console.log('🔄 Fornecedores atualizados:', items.length);
                if (window.dispatchEvent) {
                    window.dispatchEvent(new Event('fornecedores-atualizados'));
                }
            }, function(err) {
                console.warn('⚠️ Erro no listener de fornecedores:', err);
            });

        // Listener para vendas do viveiro
        db.collection('users').doc(uid).collection('viveiroVendas')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.viveiroVendas = items;
                self._saveCache();
                console.log('🔄 Vendas do viveiro atualizadas:', items.length);
                if (window.dispatchEvent) {
                    window.dispatchEvent(new Event('viveiro-vendas-atualizadas'));
                }
            }, function(err) {
                console.warn('⚠️ Erro no listener de vendas:', err);
            });

        // Listener para caixa do viveiro
        db.collection('users').doc(uid).collection('viveiroCaixa')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.viveiroCaixa = items;
                self._saveCache();
                console.log('🔄 Lançamentos do caixa atualizados:', items.length);
                if (window.dispatchEvent) {
                    window.dispatchEvent(new Event('viveiro-caixa-atualizados'));
                }
            }, function(err) {
                console.warn('⚠️ Erro no listener do caixa:', err);
            });

        // Listener para variedades do viveiro
        db.collection('users').doc(uid).collection('viveiroVariedades')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.viveiroVariedades = items;
                self._saveCache();
                console.log('🔄 Variedades do viveiro atualizadas:', items.length);
                if (window.dispatchEvent) {
                    window.dispatchEvent(new Event('viveiro-variedades-atualizadas'));
                }
            }, function(err) {
                console.warn('⚠️ Erro no listener de variedades:', err);
            });

        // Listener para pedidos do viveiro
        db.collection('users').doc(uid).collection('viveiroPedidos')
            .onSnapshot(function(snapshot) {
                var items = [];
                snapshot.forEach(function(doc) {
                    var data = doc.data();
                    data.id = doc.id;
                    items.push(data);
                });
                self.data.viveiroPedidos = items;
                self._saveCache();
                console.log('🔄 Pedidos do viveiro atualizados:', items.length);
                if (window.dispatchEvent) {
                    window.dispatchEvent(new Event('viveiro-pedidos-atualizados'));
                }
            }, function(err) {
                console.warn('⚠️ Erro no listener de pedidos:', err);
            });

        // Listener para configurações
        db.collection('users').doc(uid).collection('configuracoes').doc('geral')
            .onSnapshot(function(doc) {
                if (doc.exists) {
                    var config = doc.data();
                    for (var key in config) {
                        if (self.data.configuracoes.hasOwnProperty(key)) {
                            self.data.configuracoes[key] = config[key];
                        }
                    }
                    self._saveConfiguracoes();
                    console.log('🔄 Configurações atualizadas');
                }
            }, function(err) {
                console.warn('⚠️ Erro no listener de configurações:', err);
            });

        // Listener para mudanças no usuário
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                self.data.usuario = { 
                    uid: user.uid, 
                    email: user.email, 
                    nome: user.displayName || user.email || 'Usuário', 
                    telefone: user.phoneNumber || '' 
                };
                self._carregarPermissoesUsuario(user.uid);
            } else {
                self.data.usuario = null;
                self.data.permissoes = {};
                self._listenersAtivos = false;
            }
        });
    },

    // ================================================================
    // CARREGAR PERMISSÕES DO USUÁRIO
    // ================================================================
    _carregarPermissoesUsuario: function(uid) {
        var self = this;
        db.collection('users').doc(uid).collection('permissoes').doc('geral')
            .get()
            .then(function(doc) {
                if (doc.exists) {
                    self.data.permissoes = doc.data();
                    console.log('✅ Permissões carregadas:', Object.keys(self.data.permissoes).length);
                }
            })
            .catch(function(err) {
                console.warn('⚠️ Erro ao carregar permissões:', err);
            });
    },

    temPermissao: function(modulo, acao) {
        var permissoes = this.data.permissoes;
        if (!permissoes || Object.keys(permissoes).length === 0) {
            return true;
        }
        var chave = modulo + '.' + acao;
        if (permissoes[chave] !== undefined) {
            return permissoes[chave] === true;
        }
        if (permissoes[modulo] !== undefined) {
            return permissoes[modulo] === true;
        }
        return true;
    },

    // ================================================================
    // CARREGAR DADOS - COM TODAS AS COLEÇÕES
    // ================================================================
    carregarDados: function() {
        var self = this;
        var user = firebase.auth().currentUser;
        if (!user) return Promise.reject('Usuário não autenticado');

        var uid = user.uid;
        console.log('📥 Carregando dados do Firebase para:', uid);

        var colecoes = [
            'propriedades', 
            'tarefas', 
            'documentos', 
            'analises', 
            'receitas', 
            'despesas', 
            'insumos',
            'funcionarios', 
            'animais', 
            'parceiros', 
            'contratos', 
            'orcamentos', 
            'vencimentos', 
            'safras',
            'viveiroMudas', 
            'viveiroInsumos', 
            'viveiroServicos', 
            'viveiroTrabalhadores',
            'viveiroVendas',
            'viveiroCaixa',
            'viveiroVariedades',
            'viveiroPedidos',
            'historico',
            'notificacoes', 
            'nfes', 
            'partesRelacionadas',
            'fornecedores',
            'padroesExtracao',
            // 🆕 Coleções de funcionários
            'recibos',
            'modelosRecibo',
            'pontos',
            'producoes',
            'ferias',
            'epi'
        ];

        var promises = colecoes.map(function(col) {
            return db.collection('users').doc(uid).collection(col).get()
                .then(function(snapshot) {
                    var items = [];
                    snapshot.forEach(function(doc) {
                        var data = doc.data();
                        data.id = doc.id;
                        items.push(data);
                    });
                    self.data[col] = items;
                    console.log('✅ ' + col + ': ' + items.length + ' itens');
                    return items;
                })
                .catch(function(err) {
                    console.warn('⚠️ Erro ao carregar ' + col + ':', err);
                    self.data[col] = [];
                    return [];
                });
        });

        // 🆕 Carrega perfis
        promises.push(
            db.collection('users').doc(uid).collection('perfis').get()
                .then(function(snapshot) {
                    var perfis = {};
                    snapshot.forEach(function(doc) {
                        var data = doc.data();
                        data.id = doc.id;
                        perfis[doc.id] = data;
                    });
                    self.data.perfis = perfis;
                    console.log('✅ perfis: ' + Object.keys(perfis).length + ' perfis');
                    return perfis;
                })
                .catch(function(err) {
                    console.warn('⚠️ Erro ao carregar perfis:', err);
                    self.data.perfis = {};
                    return {};
                })
        );

        // Carrega configurações
        promises.push(
            db.collection('users').doc(uid).collection('configuracoes').doc('geral').get()
                .then(function(doc) {
                    if (doc.exists) {
                        var config = doc.data();
                        for (var key in config) {
                            if (self.data.configuracoes.hasOwnProperty(key)) {
                                self.data.configuracoes[key] = config[key];
                            }
                        }
                        self._saveConfiguracoes();
                        console.log('✅ Configurações carregadas');
                    }
                    return self.data.configuracoes;
                })
                .catch(function(err) {
                    console.warn('⚠️ Erro ao carregar configurações:', err);
                    return self.data.configuracoes;
                })
        );

        return Promise.all(promises).then(function() {
            self._saveCache();
            self.ui.lastRefresh = new Date().toISOString();
            console.log('✅ Todos os dados carregados!');
            console.log('🏢 Fornecedores:', (self.data.fornecedores || []).length);
            console.log('📋 Padrões de extração:', (self.data.padroesExtracao || []).length);
            console.log('💰 Vendas do viveiro:', (self.data.viveiroVendas || []).length);
            console.log('📒 Lançamentos do caixa:', (self.data.viveiroCaixa || []).length);
            console.log('🌱 Variedades do viveiro:', (self.data.viveiroVariedades || []).length);
            console.log('📋 Pedidos do viveiro:', (self.data.viveiroPedidos || []).length);
            console.log('👨‍🌾 Funcionários:', (self.data.funcionarios || []).length);
            console.log('🔐 Perfis:', Object.keys(self.data.perfis || {}).length);
            console.log('📄 Recibos:', (self.data.recibos || []).length);
            console.log('📍 Pontos:', (self.data.pontos || []).length);
            console.log('📦 Produções:', (self.data.producoes || []).length);
            console.log('🏖️ Férias:', (self.data.ferias || []).length);
            console.log('🛡️ EPI:', (self.data.epi || []).length);
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('dados-carregados'));
                window.dispatchEvent(new Event('fornecedores-atualizados'));
                window.dispatchEvent(new Event('viveiro-vendas-atualizadas'));
                window.dispatchEvent(new Event('viveiro-caixa-atualizados'));
                window.dispatchEvent(new Event('viveiro-variedades-atualizadas'));
                window.dispatchEvent(new Event('viveiro-pedidos-atualizados'));
                // 🆕 Eventos para funcionários
                window.dispatchEvent(new Event('funcionarios-atualizados'));
                window.dispatchEvent(new Event('perfis-atualizados'));
                window.dispatchEvent(new Event('pontos-atualizados'));
            }
            
            return self.data;
        });
    },

    // ================================================================
    // 🆕 FUNÇÕES PARA PERFIS
    // ================================================================
    getPerfil: function(uid) {
        var perfis = this.data.perfis || {};
        return perfis[uid] || null;
    },

    getPerfilPorFuncionarioId: function(funcionarioId) {
        var perfis = this.data.perfis || {};
        for (var key in perfis) {
            if (perfis[key].funcionarioId === funcionarioId) {
                return { id: key, dados: perfis[key] };
            }
        }
        return null;
    },

    funcionarioTemPerfil: function(funcionarioId) {
        var perfis = this.data.perfis || {};
        for (var key in perfis) {
            if (perfis[key].funcionarioId === funcionarioId) {
                return true;
            }
        }
        return false;
    },

    // ================================================================
    // 🆕 FUNÇÕES PARA RECIBOS
    // ================================================================
    getRecibosPorFuncionario: function(funcionarioId) {
        var recibos = this.data.recibos || [];
        return recibos.filter(function(r) {
            return r.funcionarioId === funcionarioId;
        });
    },

    getUltimosRecibos: function(limite) {
        var recibos = this.data.recibos || [];
        return recibos.slice(-(limite || 10)).reverse();
    },

    // ================================================================
    // 🆕 FUNÇÕES PARA PONTOS
    // ================================================================
    getPontosPorFuncionario: function(funcionarioId) {
        var pontos = this.data.pontos || [];
        return pontos.filter(function(p) {
            return p.funcionarioId === funcionarioId;
        });
    },

    getPontosHoje: function(funcionarioId) {
        var hoje = GR.Utils.now().slice(0, 10);
        var pontos = this.getPontosPorFuncionario(funcionarioId);
        return pontos.filter(function(p) {
            return p.data === hoje;
        });
    },

    getPontoAberto: function(funcionarioId) {
        var hoje = GR.Utils.now().slice(0, 10);
        var pontos = this.getPontosPorFuncionario(funcionarioId);
        return pontos.find(function(p) {
            return p.data === hoje && p.saida === null;
        });
    },

    getTotalHorasTrabalhadas: function(funcionarioId, dataInicio, dataFim) {
        var pontos = this.getPontosPorFuncionario(funcionarioId);
        if (dataInicio) {
            pontos = pontos.filter(function(p) { return p.data >= dataInicio; });
        }
        if (dataFim) {
            pontos = pontos.filter(function(p) { return p.data <= dataFim; });
        }
        
        var totalHoras = 0;
        pontos.forEach(function(p) {
            if (p.entrada && p.saida) {
                try {
                    var entrada = new Date(p.data + 'T' + p.entrada);
                    var saida = new Date(p.data + 'T' + p.saida);
                    var diff = (saida - entrada) / 3600000;
                    totalHoras += diff;
                } catch(e) {}
            }
        });
        return totalHoras;
    },

    // ================================================================
    // 🆕 FUNÇÕES PARA PRODUÇÕES
    // ================================================================
    getProducoesPorFuncionario: function(funcionarioId) {
        var producoes = this.data.producoes || [];
        return producoes.filter(function(p) {
            return p.funcionarioId === funcionarioId;
        });
    },

    getTotalProducaoPorFuncionario: function(funcionarioId, produto) {
        var producoes = this.getProducoesPorFuncionario(funcionarioId);
        if (produto) {
            producoes = producoes.filter(function(p) {
                return p.produto === produto;
            });
        }
        return producoes.reduce(function(sum, p) {
            return sum + (p.quantidade || 0);
        }, 0);
    },

    // ================================================================
    // 🆕 FUNÇÕES PARA FÉRIAS
    // ================================================================
    getFeriasPorFuncionario: function(funcionarioId) {
        var ferias = this.data.ferias || [];
        return ferias.filter(function(f) {
            return f.funcionarioId === funcionarioId;
        });
    },

    getFeriasAtivas: function() {
        var hoje = GR.Utils.now().slice(0, 10);
        var ferias = this.data.ferias || [];
        return ferias.filter(function(f) {
            return f.dataInicio <= hoje && f.dataFim >= hoje && f.status !== 'Finalizada';
        });
    },

    // ================================================================
    // 🆕 FUNÇÕES PARA EPI
    // ================================================================
    getEPIPorFuncionario: function(funcionarioId) {
        var epi = this.data.epi || [];
        return epi.filter(function(e) {
            return e.funcionarioId === funcionarioId;
        });
    },

    getUltimosEPI: function(limite) {
        var epi = this.data.epi || [];
        return epi.slice(-(limite || 10)).reverse();
    },

    // ================================================================
    // FUNÇÕES DE FORNECEDORES
    // ================================================================
    buscarFornecedorPorId: function(id) {
        if (!id) return null;
        var fornecedores = this.data.fornecedores || [];
        return fornecedores.find(function(f) { return f.id === id; });
    },

    buscarFornecedorPorCpfCnpj: function(cpfcnpj) {
        if (!cpfcnpj) return null;
        var fornecedores = this.data.fornecedores || [];
        var limpo = cpfcnpj.replace(/[^0-9]/g, '');
        return fornecedores.find(function(f) {
            var doc = (f.cpfcnpj || '').replace(/[^0-9]/g, '');
            return doc === limpo;
        });
    },

    listarFornecedoresAtivos: function() {
        var fornecedores = this.data.fornecedores || [];
        return fornecedores.filter(function(f) { return f.ativo !== false; });
    },

    // ================================================================
    // FUNÇÕES DO VIVEIRO - VARIEDADES
    // ================================================================
    getVariedadesViveiro: function(filtros) {
        var variedades = this.data.viveiroVariedades || [];
        filtros = filtros || {};
        
        if (filtros.propriedade && filtros.propriedade !== 'todas') {
            variedades = variedades.filter(function(v) { return v.propriedade === filtros.propriedade; });
        }
        
        if (filtros.especie) {
            variedades = variedades.filter(function(v) { return v.especie === filtros.especie; });
        }
        
        return variedades;
    },

    getVariedadePorNome: function(nome, propriedade) {
        var variedades = this.data.viveiroVariedades || [];
        if (propriedade && propriedade !== 'todas') {
            variedades = variedades.filter(function(v) { return v.propriedade === propriedade; });
        }
        return variedades.find(function(v) { return v.nome === nome; });
    },

    // ================================================================
    // FUNÇÕES DO VIVEIRO - PEDIDOS
    // ================================================================
    getPedidosViveiro: function(filtros) {
        var pedidos = this.data.viveiroPedidos || [];
        filtros = filtros || {};
        
        if (filtros.propriedade && filtros.propriedade !== 'todas') {
            pedidos = pedidos.filter(function(p) { return p.propriedade === filtros.propriedade; });
        }
        
        if (filtros.status) {
            pedidos = pedidos.filter(function(p) { return p.status === filtros.status; });
        }
        
        if (filtros.cliente) {
            var termo = filtros.cliente.toLowerCase();
            pedidos = pedidos.filter(function(p) { 
                return (p.cliente || '').toLowerCase().includes(termo); 
            });
        }
        
        if (filtros.variedade) {
            pedidos = pedidos.filter(function(p) { return p.variedade === filtros.variedade; });
        }
        
        return pedidos;
    },

    getPedidosPendentes: function(filtros) {
        var pedidos = this.getPedidosViveiro(filtros);
        return pedidos.filter(function(p) { 
            return p.status === 'Pendente' || p.status === 'Confirmado'; 
        });
    },

    // ================================================================
    // FUNÇÕES DO VIVEIRO - VENDAS
    // ================================================================
    getVendasViveiro: function(filtros) {
        var vendas = this.data.viveiroVendas || [];
        filtros = filtros || {};
        
        if (filtros.propriedade && filtros.propriedade !== 'todas') {
            vendas = vendas.filter(function(v) { return v.propriedade === filtros.propriedade; });
        }
        
        if (filtros.dataInicio) {
            vendas = vendas.filter(function(v) { return v.data >= filtros.dataInicio; });
        }
        if (filtros.dataFim) {
            vendas = vendas.filter(function(v) { return v.data <= filtros.dataFim; });
        }
        
        if (filtros.comprador) {
            var termo = filtros.comprador.toLowerCase();
            vendas = vendas.filter(function(v) { 
                return (v.comprador || '').toLowerCase().includes(termo); 
            });
        }
        
        if (filtros.variedade) {
            vendas = vendas.filter(function(v) { return v.variedade === filtros.variedade; });
        }
        
        return vendas;
    },

    getTotalVendasViveiro: function(filtros) {
        var vendas = this.getVendasViveiro(filtros);
        return vendas.reduce(function(sum, v) { return sum + (v.valorTotal || 0); }, 0);
    },

    getTotalMudasVendidas: function(filtros) {
        var vendas = this.getVendasViveiro(filtros);
        return vendas.reduce(function(sum, v) { return sum + (v.quantidade || 0); }, 0);
    },

    // ================================================================
    // FUNÇÕES DO VIVEIRO - CAIXA
    // ================================================================
    getLancamentosCaixa: function(filtros) {
        var lancamentos = this.data.viveiroCaixa || [];
        filtros = filtros || {};
        
        if (filtros.propriedade && filtros.propriedade !== 'todas') {
            lancamentos = lancamentos.filter(function(l) { return l.propriedade === filtros.propriedade; });
        }
        
        if (filtros.tipo) {
            lancamentos = lancamentos.filter(function(l) { return l.tipo === filtros.tipo; });
        }
        
        if (filtros.dataInicio) {
            lancamentos = lancamentos.filter(function(l) { return l.data >= filtros.dataInicio; });
        }
        if (filtros.dataFim) {
            lancamentos = lancamentos.filter(function(l) { return l.data <= filtros.dataFim; });
        }
        
        if (filtros.categoria) {
            lancamentos = lancamentos.filter(function(l) { return l.categoria === filtros.categoria; });
        }
        
        return lancamentos;
    },

    getTotalReceitasCaixa: function(filtros) {
        var lancamentos = this.getLancamentosCaixa(filtros);
        return lancamentos.reduce(function(sum, l) { 
            return l.tipo === 'receita' ? sum + (l.valor || 0) : sum; 
        }, 0);
    },

    getTotalDespesasCaixa: function(filtros) {
        var lancamentos = this.getLancamentosCaixa(filtros);
        return lancamentos.reduce(function(sum, l) { 
            return l.tipo === 'despesa' ? sum + (l.valor || 0) : sum; 
        }, 0);
    },

    getSaldoCaixa: function(filtros) {
        var receitas = this.getTotalReceitasCaixa(filtros);
        var despesas = this.getTotalDespesasCaixa(filtros);
        return receitas - despesas;
    },

    getSaldoAcumuladoCaixa: function(filtros) {
        var lancamentos = this.getLancamentosCaixa(filtros);
        var saldo = 0;
        return lancamentos.sort(function(a, b) { 
            return new Date(a.data) - new Date(b.data); 
        }).map(function(l) {
            saldo += (l.tipo === 'receita' ? 1 : -1) * (l.valor || 0);
            return { ...l, saldoAcumulado: saldo };
        });
    },

    // ================================================================
    // FUNÇÕES DO VIVEIRO - RESUMO GERAL
    // ================================================================
    getResumoViveiro: function(filtros) {
        var vendas = this.getVendasViveiro(filtros);
        var lancamentos = this.getLancamentosCaixa(filtros);
        var pedidos = this.getPedidosViveiro(filtros);
        var variedades = this.getVariedadesViveiro(filtros);
        
        var totalVendas = vendas.length;
        var totalMudasVendidas = vendas.reduce(function(sum, v) { return sum + (v.quantidade || 0); }, 0);
        var totalReceitas = vendas.reduce(function(sum, v) { return sum + (v.valorTotal || 0); }, 0);
        var totalDespesas = lancamentos.reduce(function(sum, l) { 
            return l.tipo === 'despesa' ? sum + (l.valor || 0) : sum; 
        }, 0);
        var saldo = totalReceitas - totalDespesas;
        
        var pedidosPendentes = pedidos.filter(function(p) { 
            return p.status === 'Pendente' || p.status === 'Confirmado'; 
        });
        
        return {
            totalVendas: totalVendas,
            totalMudasVendidas: totalMudasVendidas,
            totalReceitas: totalReceitas,
            totalDespesas: totalDespesas,
            saldo: saldo,
            totalPedidos: pedidos.length,
            pedidosPendentes: pedidosPendentes.length,
            totalVariedades: variedades.length,
            vendas: vendas,
            lancamentos: lancamentos,
            pedidos: pedidos,
            variedades: variedades
        };
    },

    // ================================================================
    // 🆕 RESUMO DE FUNCIONÁRIOS
    // ================================================================
    getResumoFuncionarios: function(filtros) {
        var funcionarios = this.filtrarPorPropriedade(this.data.funcionarios || [], 'propriedade');
        var propAtiva = filtros && filtros.propriedade ? filtros.propriedade : this.ui.propriedadeAtiva || 'todas';
        
        if (propAtiva !== 'todas') {
            funcionarios = funcionarios.filter(function(f) { return f.propriedade === propAtiva; });
        }
        
        var stats = {
            total: funcionarios.length,
            ativos: 0,
            ferias: 0,
            afastados: 0,
            desligados: 0,
            somaSalarios: 0,
            comFoto: 0,
            comDocumentos: 0,
            comPerfil: 0
        };
        
        funcionarios.forEach(function(f) {
            var status = f.status || 'Desligado';
            if (status === 'Ativo') stats.ativos++;
            else if (status === 'Férias') stats.ferias++;
            else if (status === 'Afastado') stats.afastados++;
            else stats.desligados++;
            stats.somaSalarios += (f.salario || 0);
            if (f.foto) stats.comFoto++;
            if (f.documentos && Object.keys(f.documentos).length > 0) stats.comDocumentos++;
            if (this.funcionarioTemPerfil(f.id)) stats.comPerfil++;
        }, this);
        
        return stats;
    },

    // ================================================================
    // PADRÕES DE EXTRAÇÃO
    // ================================================================
    salvarPadraoExtracao: function(nome, padrao) {
        var user = firebase.auth().currentUser;
        if (!user) return Promise.reject('Usuário não autenticado');
        
        var uid = user.uid;
        var dados = {
            nome: nome,
            padrao: padrao,
            dataAtualizacao: new Date().toISOString()
        };
        
        var existente = (this.data.padroesExtracao || []).find(function(p) { return p.nome === nome; });
        
        if (existente) {
            return db.collection('users').doc(uid).collection('padroesExtracao').doc(existente.id).update(dados)
                .then(function() {
                    console.log('✅ Padrão de extração atualizado:', nome);
                    return GR.State.carregarDados();
                });
        } else {
            return db.collection('users').doc(uid).collection('padroesExtracao').add(dados)
                .then(function() {
                    console.log('✅ Padrão de extração salvo:', nome);
                    return GR.State.carregarDados();
                });
        }
    },

    buscarPadraoExtracao: function(nome) {
        var padroes = this.data.padroesExtracao || [];
        return padroes.find(function(p) { return p.nome === nome; });
    },

    // ================================================================
    // HISTÓRICO
    // ================================================================
    adicionarHistorico: function(acao, modulo, detalhes) {
        var user = firebase.auth().currentUser;
        if (!user) return;
        var entry = { 
            acao: acao, 
            modulo: modulo, 
            detalhes: detalhes || '', 
            timestamp: new Date().toISOString(), 
            usuario: user.email || user.uid,
            propriedade: this.ui.propriedadeAtiva || 'todas'
        };
        if (this.data.historico) { 
            this.data.historico.push(entry);
            this._saveCache(); 
        }
        db.collection('users').doc(user.uid).collection('historico').add(entry)
            .catch(function(err) { console.error('❌ Erro ao registrar histórico:', err); });
    },

    buscarHistorico: function(filtros) {
        var historico = this.data.historico || [];
        filtros = filtros || {};
        
        return historico.filter(function(entry) {
            if (filtros.modulo && entry.modulo !== filtros.modulo) return false;
            if (filtros.propriedade && filtros.propriedade !== 'todas') {
                if (entry.propriedade && entry.propriedade !== filtros.propriedade) return false;
            }
            if (filtros.dataInicio && entry.timestamp < filtros.dataInicio) return false;
            if (filtros.dataFim && entry.timestamp > filtros.dataFim) return false;
            if (filtros.texto) {
                var texto = (entry.acao + ' ' + entry.modulo + ' ' + entry.detalhes).toLowerCase();
                if (!texto.includes(filtros.texto.toLowerCase())) return false;
            }
            return true;
        });
    },

    // ================================================================
    // VERIFICAR VENCIMENTOS
    // ================================================================
    verificarVencimentos: function() {
        var agora = Date.now();
        if (this._ultimaVerificacaoVencimentos && (agora - this._ultimaVerificacaoVencimentos) < 30000) {
            console.log('⏳ Verificação de vencimentos já executada recentemente (throttle)');
            return [];
        }
        
        if (this._verificandoVencimentos) {
            console.log('⏳ Verificação de vencimentos já em andamento');
            return [];
        }
        
        this._verificandoVencimentos = true;
        this._ultimaVerificacaoVencimentos = agora;
        
        console.log('🔍 Verificando vencimentos...');
        var alertas = [];
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        var self = this;
        var mensagensVistas = {};

        function adicionarAlerta(tipo, mensagem, id, prioridade) {
            var chave = mensagem + '_' + (id || '');
            if (mensagensVistas[chave]) {
                return;
            }
            mensagensVistas[chave] = true;
            alertas.push({
                tipo: tipo,
                mensagem: mensagem,
                id: id,
                prioridade: prioridade
            });
        }

        // Verifica contratos
        (this.data.contratos || []).forEach(function(contrato) {
            if (contrato.parcelas && Array.isArray(contrato.parcelas)) {
                contrato.parcelas.forEach(function(p) {
                    if (p.status === 'Pendente' && p.vencimento) {
                        var venc = new Date(p.vencimento);
                        venc.setHours(0, 0, 0, 0);
                        var diff = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
                        if (diff >= 0 && diff <= 3) {
                            adicionarAlerta(
                                'vencimento',
                                '📅 Parcela de ' + contrato.numero + ' vence em ' + diff + ' dias!',
                                contrato.id,
                                diff <= 0 ? 'alta' : 'media'
                            );
                        }
                    }
                });
            }
        });

        // Verifica insumos
        (this.data.insumos || []).forEach(function(insumo) {
            if (self._insumosIgnorados.includes(insumo.nome)) {
                return;
            }
            
            if (insumo.validade) {
                var venc = new Date(insumo.validade);
                venc.setHours(0, 0, 0, 0);
                var diff = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
                if (diff < 0) {
                    adicionarAlerta(
                        'vencido',
                        '⚠️ Insumo "' + insumo.nome + '" está vencido!',
                        insumo.id,
                        'alta'
                    );
                } else if (diff <= 3) {
                    adicionarAlerta(
                        'alerta',
                        '⚠️ Insumo "' + insumo.nome + '" vence em ' + diff + ' dias!',
                        insumo.id,
                        'alta'
                    );
                } else if (diff <= 7) {
                    adicionarAlerta(
                        'alerta',
                        '📅 Insumo "' + insumo.nome + '" vence em ' + diff + ' dias',
                        insumo.id,
                        'media'
                    );
                }
            }
        });

        // Verifica parceiros
        (this.data.parceiros || []).forEach(function(parceiro) {
            if (parceiro.dataFim) {
                var venc = new Date(parceiro.dataFim);
                venc.setHours(0, 0, 0, 0);
                var diff = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
                if (diff < 0) {
                    adicionarAlerta(
                        'vencido',
                        '⚠️ Contrato do parceiro "' + (parceiro.nome || 'N/A') + '" venceu!',
                        parceiro.id,
                        'alta'
                    );
                } else if (diff <= 15) {
                    adicionarAlerta(
                        'alerta',
                        '📅 Contrato do parceiro "' + (parceiro.nome || 'N/A') + '" vence em ' + diff + ' dias!',
                        parceiro.id,
                        'media'
                    );
                }
            }
        });

        // Verifica fornecedores inativos com cotações pendentes
        var fornecedores = this.data.fornecedores || [];
        var orcamentos = this.data.orcamentos || [];
        
        orcamentos.forEach(function(orcamento) {
            if (orcamento.fornecedorId && orcamento.status === 'Pendente') {
                var fornecedor = fornecedores.find(function(f) { return f.id === orcamento.fornecedorId; });
                if (fornecedor && fornecedor.ativo === false) {
                    adicionarAlerta(
                        'alerta',
                        '⚠️ Fornecedor "' + (fornecedor.nome || fornecedor.razaoSocial) + '" está inativo com cotação pendente!',
                        orcamento.id,
                        'media'
                    );
                }
            }
        });

        // Verifica tarefas atrasadas
        (this.data.tarefas || []).forEach(function(tarefa) {
            if (tarefa.status !== 'Concluída' && tarefa.dataLimite) {
                var limite = new Date(tarefa.dataLimite);
                limite.setHours(0, 0, 0, 0);
                if (limite < hoje) {
                    adicionarAlerta(
                        'alerta',
                        '⏰ Tarefa "' + (tarefa.titulo || 'N/A') + '" está atrasada!',
                        tarefa.id,
                        'alta'
                    );
                }
            }
        });

        if (alertas.length > 0) {
            console.log('🔔 ' + alertas.length + ' alerta(s) de vencimento encontrado(s)');
            alertas.forEach(function(alerta) {
                if (alerta.prioridade === 'alta' || alerta.prioridade === 'media') {
                    if (GR.Notificacoes && typeof GR.Notificacoes.adicionar === 'function') {
                        var titulo = alerta.tipo === 'vencimento' ? '📅 Vencimento' : 
                                     alerta.tipo === 'vencido' ? '⚠️ Vencido' : '⚠️ Alerta';
                        GR.Notificacoes.adicionar(titulo, alerta.mensagem);
                    }
                }
                console.log('🔔 Alerta:', alerta.mensagem);
            });
        } else {
            console.log('✅ Nenhum alerta de vencimento encontrado');
        }
        
        this._verificandoVencimentos = false;
        return alertas;
    },

    // ================================================================
    // FUNÇÃO PARA ADICIONAR/REMOVER INSUMOS IGNORADOS
    // ================================================================
    adicionarInsumoIgnorado: function(nome) {
        if (!this._insumosIgnorados.includes(nome)) {
            this._insumosIgnorados.push(nome);
            console.log('🔇 Insumo "' + nome + '" adicionado à lista de ignorados');
            return true;
        }
        return false;
    },

    removerInsumoIgnorado: function(nome) {
        var index = this._insumosIgnorados.indexOf(nome);
        if (index > -1) {
            this._insumosIgnorados.splice(index, 1);
            console.log('🔊 Insumo "' + nome + '" removido da lista de ignorados');
            return true;
        }
        return false;
    },

    getInsumosIgnorados: function() {
        return this._insumosIgnorados.slice();
    },

    // ================================================================
    // GERAR RESUMO DO SISTEMA
    // ================================================================
    gerarResumo: function() {
        var resumo = {
            propriedades: (this.data.propriedades || []).length,
            tarefas: (this.data.tarefas || []).length,
            documentos: (this.data.documentos || []).length,
            analises: (this.data.analises || []).length,
            receitas: (this.data.receitas || []).length,
            despesas: (this.data.despesas || []).length,
            insumos: (this.data.insumos || []).length,
            funcionarios: (this.data.funcionarios || []).length,
            animais: (this.data.animais || []).length,
            parceiros: (this.data.parceiros || []).length,
            contratos: (this.data.contratos || []).length,
            orcamentos: (this.data.orcamentos || []).length,
            fornecedores: (this.data.fornecedores || []).length,
            viveiroMudas: (this.data.viveiroMudas || []).length,
            viveiroInsumos: (this.data.viveiroInsumos || []).length,
            viveiroServicos: (this.data.viveiroServicos || []).length,
            viveiroTrabalhadores: (this.data.viveiroTrabalhadores || []).length,
            viveiroVendas: (this.data.viveiroVendas || []).length,
            viveiroCaixa: (this.data.viveiroCaixa || []).length,
            viveiroVariedades: (this.data.viveiroVariedades || []).length,
            viveiroPedidos: (this.data.viveiroPedidos || []).length,
            nfes: (this.data.nfes || []).length,
            perfis: Object.keys(this.data.perfis || {}).length,
            recibos: (this.data.recibos || []).length,
            pontos: (this.data.pontos || []).length,
            producoes: (this.data.producoes || []).length,
            ferias: (this.data.ferias || []).length,
            epi: (this.data.epi || []).length,
            totalItems: 0
        };
        
        for (var key in resumo) {
            if (key !== 'totalItems') {
                resumo.totalItems += resumo[key];
            }
        }
        
        return resumo;
    },

    // ================================================================
    // ORDENAR DADOS
    // ================================================================
    ordenarDados: function(dados, campo, ordem) {
        if (!dados || !Array.isArray(dados)) return [];
        ordem = ordem || 'asc';
        
        return dados.slice().sort(function(a, b) {
            var valA = a[campo] || '';
            var valB = b[campo] || '';
            
            if (campo === 'data' || campo === 'dataCriacao' || campo === 'timestamp') {
                valA = new Date(valA).getTime() || 0;
                valB = new Date(valB).getTime() || 0;
                return ordem === 'asc' ? valA - valB : valB - valA;
            }
            
            if (typeof valA === 'number' && typeof valB === 'number') {
                return ordem === 'asc' ? valA - valB : valB - valA;
            }
            
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
            return ordem === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
    },

    // ================================================================
    // PAGINAR DADOS
    // ================================================================
    paginarDados: function(dados, pagina, itensPorPagina) {
        if (!dados || !Array.isArray(dados)) return [];
        pagina = pagina || 1;
        itensPorPagina = itensPorPagina || 20;
        
        var inicio = (pagina - 1) * itensPorPagina;
        var fim = inicio + itensPorPagina;
        return dados.slice(inicio, fim);
    },

    // ================================================================
    // FUNÇÕES DE PROPRIEDADE
    // ================================================================
    setPropriedadeAtiva: function(propriedade) {
        this.ui.propriedadeAtiva = propriedade || 'todas';
        GR.Store.setPreference('propriedadeAtiva', this.ui.propriedadeAtiva);
        console.log('📌 Propriedade ativa:', this.ui.propriedadeAtiva);
        
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('propriedade-alterada', {
                detail: { propriedade: this.ui.propriedadeAtiva }
            }));
        }
    },

    limpar: function() {
        for (var key in this.data) {
            if (Array.isArray(this.data[key])) this.data[key] = [];
            else if (key === 'usuario') this.data[key] = null;
            else if (key === 'configuracoes') {
                this.data.configuracoes = {
                    notificacoes: true,
                    backupAutomatico: false,
                    intervaloBackup: 24,
                    tema: 'claro'
                };
            } else if (key === 'perfis') {
                this.data.perfis = {};
            }
        }
        try { localStorage.removeItem('gr_state_cache'); } catch (e) {}
        try { localStorage.removeItem('gr_configuracoes'); } catch (e) {}
        console.log('🧹 State limpo');
    },

    // ================================================================
    // FILTRO GLOBAL POR PROPRIEDADE
    // ================================================================
    getPropriedadesPermitidas: function() {
        if (!GR.Modules || !GR.Modules.Perfis || !GR.Modules.Perfis.perfilAtual) {
            return null;
        }
        
        var perfil = GR.Modules.Perfis.perfilAtual;
        
        if (perfil.id === 'master' || perfil.id === 'admin') {
            return null;
        }
        
        return perfil.propriedadesPermitidas || null;
    },

    podeAcessarPropriedade: function(nomePropriedade) {
        var propsPermitidas = this.getPropriedadesPermitidas();
        
        if (!propsPermitidas || propsPermitidas.length === 0) {
            return true;
        }
        
        return propsPermitidas.includes(nomePropriedade);
    },

    filtrarPorPropriedade: function(dados, campoPropriedade) {
        if (!dados || !Array.isArray(dados)) return [];
        if (dados.length === 0) return [];
        
        var propsPermitidas = this.getPropriedadesPermitidas();
        
        if (!propsPermitidas || propsPermitidas.length === 0) {
            return dados;
        }
        
        if (GR.Modules && GR.Modules.Perfis && GR.Modules.Perfis.perfilAtual) {
            var perfil = GR.Modules.Perfis.perfilAtual;
            if (perfil.id === 'master' || perfil.id === 'admin') {
                return dados;
            }
        }
        
        var campo = campoPropriedade || 'propriedade';
        
        return dados.filter(function(item) {
            var valor = item[campo] || '';
            if (!valor) return true;
            return propsPermitidas.includes(valor);
        });
    },

    getDadosFiltrados: function(tipo, campoPropriedade) {
        var dados = this.data[tipo] || [];
        return this.filtrarPorPropriedade(dados, campoPropriedade);
    },

    getPropriedadesVisiveis: function() {
        var todasProps = this.data.propriedades || [];
        var propsPermitidas = this.getPropriedadesPermitidas();
        
        if (!propsPermitidas || propsPermitidas.length === 0) {
            return todasProps.map(function(p) { return p.nome; });
        }
        
        var nomesProps = todasProps.map(function(p) { return p.nome; });
        return propsPermitidas.filter(function(nome) {
            return nomesProps.includes(nome);
        });
    },

    validarPropriedadeAtiva: function() {
        var propAtiva = this.ui.propriedadeAtiva || 'todas';
        if (propAtiva === 'todas') return true;
        return this.podeAcessarPropriedade(propAtiva);
    },

    forcarPropriedadeValida: function() {
        var propAtiva = this.ui.propriedadeAtiva || 'todas';
        if (propAtiva === 'todas') return 'todas';
        
        if (this.podeAcessarPropriedade(propAtiva)) {
            return propAtiva;
        }
        
        this.ui.propriedadeAtiva = 'todas';
        GR.Store.setPreference('propriedadeAtiva', 'todas');
        console.log('📌 Propriedade ativa alterada para "todas" (permissão negada)');
        return 'todas';
    },

    itemPermitido: function(item, campoPropriedade) {
        if (!item) return false;
        var propsPermitidas = this.getPropriedadesPermitidas();
        
        if (!propsPermitidas || propsPermitidas.length === 0) {
            return true;
        }
        
        var campo = campoPropriedade || 'propriedade';
        var valor = item[campo] || '';
        
        if (!valor) return true;
        
        return propsPermitidas.includes(valor);
    },

    contarPorPropriedade: function(tipo, campoPropriedade) {
        var dados = this.data[tipo] || [];
        var filtrados = this.filtrarPorPropriedade(dados, campoPropriedade);
        return filtrados.length;
    },

    getPropriedadeAtivaValida: function() {
        var propAtiva = this.ui.propriedadeAtiva || 'todas';
        if (propAtiva === 'todas') return 'todas';
        
        if (this.podeAcessarPropriedade(propAtiva)) {
            return propAtiva;
        }
        
        return 'todas';
    },

    filtrarPorPropriedadeAtiva: function(dados, campoPropriedade) {
        var propAtiva = this.getPropriedadeAtivaValida();
        
        if (propAtiva === 'todas') {
            return this.filtrarPorPropriedade(dados, campoPropriedade);
        }
        
        var permitidos = this.filtrarPorPropriedade(dados, campoPropriedade);
        var campo = campoPropriedade || 'propriedade';
        
        return permitidos.filter(function(item) {
            return (item[campo] || '') === propAtiva;
        });
    },

    // ================================================================
    // PESQUISA GLOBAL
    // ================================================================
    pesquisaGlobal: function(termo) {
        if (!termo || termo.length < 2) return [];
        termo = termo.toLowerCase();
        var resultados = [];
        
        var colecoes = {
            tarefas: ['titulo', 'descricao'],
            documentos: ['numero', 'descricao', 'tipo'],
            analises: ['propriedade', 'cultura', 'talhao'],
            insumos: ['nome', 'categoria', 'fornecedor'],
            funcionarios: ['nome', 'cargo', 'cpf'],
            animais: ['nome', 'brinco', 'raca', 'especie'],
            parceiros: ['nome', 'cpf', 'tipo'],
            contratos: ['numero', 'descricao'],
            orcamentos: ['numero', 'fornecedor', 'descricao'],
            fornecedores: ['nome', 'razaoSocial', 'cpfcnpj', 'email'],
            viveiroMudas: ['especie', 'variedade'],
            viveiroInsumos: ['nome', 'tipo', 'fornecedor'],
            viveiroServicos: ['descricao', 'responsavel'],
            viveiroTrabalhadores: ['nome', 'funcao', 'cpf'],
            viveiroVendas: ['numeroNota', 'comprador', 'variedade'],
            viveiroCaixa: ['descricao', 'categoria'],
            viveiroVariedades: ['nome', 'especie'],
            viveiroPedidos: ['cliente', 'variedade', 'obs']
        };
        
        for (var colecao in colecoes) {
            var items = this.data[colecao] || [];
            items.forEach(function(item) {
                var campos = colecoes[colecao];
                var encontrado = false;
                for (var i = 0; i < campos.length; i++) {
                    var valor = item[campos[i]] || '';
                    if (String(valor).toLowerCase().includes(termo)) {
                        encontrado = true;
                        break;
                    }
                }
                if (encontrado) {
                    resultados.push({
                        modulo: colecao,
                        item: item,
                        termo: termo
                    });
                }
            });
        }
        
        return resultados;
    },

    // ================================================================
    // EXPORTAR DADOS COMPLETOS
    // ================================================================
    exportarDadosCompletos: function() {
        var dados = {
            exportadoEm: new Date().toISOString(),
            usuario: this.data.usuario ? this.data.usuario.email : 'N/A',
            versao: '3.0',
            dados: {}
        };
        
        var colecoes = [
            'propriedades', 'tarefas', 'documentos', 'analises',
            'receitas', 'despesas', 'insumos', 'funcionarios',
            'animais', 'parceiros', 'contratos', 'orcamentos',
            'viveiroMudas', 'viveiroInsumos', 'viveiroServicos',
            'viveiroTrabalhadores',
            'viveiroVendas', 'viveiroCaixa',
            'viveiroVariedades',
            'viveiroPedidos',
            'fornecedores', 'nfes',
            'partesRelacionadas', 'historico', 'notificacoes',
            'padroesExtracao',
            'perfis', 'recibos', 'modelosRecibo',
            'pontos', 'producoes', 'ferias', 'epi',
            'culturas', 'colheitas'
        ];
        
        colecoes.forEach(function(col) {
            dados.dados[col] = this.data[col] || [];
        }, this);
        
        return dados;
    },

    // ================================================================
    // FUNÇÕES DE UTILIDADE PARA LIMPAR DADOS (TESTE)
    // ================================================================
    limparDadosViveiro: function() {
        this.data.viveiroVendas = [];
        this.data.viveiroCaixa = [];
        this.data.viveiroVariedades = [];
        this.data.viveiroPedidos = [];
        this._saveCache();
        console.log('🧹 Dados do viveiro limpos');
    },

    // ================================================================
    // 🆕 LIMPAR DADOS DE FUNCIONÁRIOS
    // ================================================================
    limparDadosFuncionarios: function() {
        this.data.perfis = {};
        this.data.recibos = [];
        this.data.modelosRecibo = [];
        this.data.pontos = [];
        this.data.producoes = [];
        this.data.ferias = [];
        this.data.epi = [];
        this._saveCache();
        console.log('🧹 Dados de funcionários limpos');
    },

    // ================================================================
    // FUNÇÃO PARA RECARREGAR DADOS
    // ================================================================
    recarregar: function() {
        console.log('🔄 Recarregando dados...');
        return this.carregarDados();
    },

    // ================================================================
    // ATUALIZAÇÃO INSTANTÂNEA DO CACHE LOCAL APÓS CRUD
    // ================================================================
    inserirNoCache: function(colecao, dados) {
        if (!this.data[colecao]) this.data[colecao] = [];
        this.data[colecao].push(dados);
        this._saveCache();
    },

    atualizarNoCache: function(colecao, id, dados) {
        var arr = this.data[colecao];
        if (!arr) return;
        var idx = arr.findIndex(function(item) { return item.id === id; });
        if (idx >= 0) {
            arr[idx] = Object.assign({}, arr[idx], dados);
            this._saveCache();
        }
    },

    removerDoCache: function(colecao, id) {
        var arr = this.data[colecao];
        if (!arr) return;
        this.data[colecao] = arr.filter(function(item) { return item.id !== id; });
        this._saveCache();
    }
};

console.log('✅ GR.State v3.0 carregado com melhorias!');
console.log('📌 Melhorias ativas:');
console.log('   - 🆕 Coleções: perfis, recibos, modelosRecibo, pontos, producoes, ferias, epi');
console.log('   - 🆕 Funções para perfis: getPerfil, getPerfilPorFuncionarioId, funcionarioTemPerfil');
console.log('   - 🆕 Funções para recibos: getRecibosPorFuncionario, getUltimosRecibos');
console.log('   - 🆕 Funções para pontos: getPontosPorFuncionario, getPontosHoje, getPontoAberto, getTotalHorasTrabalhadas');
console.log('   - 🆕 Funções para produções: getProducoesPorFuncionario, getTotalProducaoPorFuncionario');
console.log('   - 🆕 Funções para férias: getFeriasPorFuncionario, getFeriasAtivas');
console.log('   - 🆕 Funções para EPI: getEPIPorFuncionario, getUltimosEPI');
console.log('   - 🆕 Resumo de funcionários: getResumoFuncionarios');
console.log('   - 🆕 Listeners em tempo real para perfis, recibos, modelosRecibo, pontos, producoes, ferias, epi');
console.log('   - 🆕 Função limparDadosFuncionarios');
console.log('   - 🆕 Eventos: funcionarios-atualizados, perfis-atualizados, pontos-atualizados');
console.log('   - 🏠 Filtro global por propriedade (completo)');
console.log('   - 🏠 getPropriedadesPermitidas()');
console.log('   - 🏠 podeAcessarPropriedade()');
console.log('   - 🏠 filtrarPorPropriedade()');
console.log('   - 🏠 getDadosFiltrados()');
console.log('   - 🏠 getPropriedadesVisiveis()');
console.log('   - 🏠 validarPropriedadeAtiva()');
console.log('   - 🏠 forcarPropriedadeValida()');
console.log('   - 🏠 itemPermitido()');
console.log('   - 🏠 contarPorPropriedade()');
console.log('   - 🏠 getPropriedadeAtivaValida()');
console.log('   - 🏠 filtrarPorPropriedadeAtiva()');
console.log('   - 🆕 Controle de inicialização (evita duplicidade)');
console.log('   - 🆕 Listeners ativados apenas com usuário logado');
console.log('   - 🆕 Removido enablePersistence() (já ativado no config.js)');
console.log('   - 🆕 Função recarregar() para recarga manual');
console.log('   - 🆕 padroesExtracao como array');
console.log('   - 🆕 THROTTLE na verificação de vencimentos (30s)');
console.log('   - 🆕 Cache de mensagens para evitar duplicidade');
console.log('   - 🆕 Lista de insumos ignorados (Potácio, fogo, Ureia)');
console.log('   - 🆕 Funções para gerenciar insumos ignorados');