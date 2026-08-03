// ================================================================
// APP - PONTO DE ENTRADA PRINCIPAL DO SISTEMA
// ================================================================
// Versão: 3.1 - CORRIGIDO com verificação segura de perfis
// ================================================================

(function() {
    'use strict';

    // ================================================================
    // CONFIGURAÇÕES
    // ================================================================
    var CONFIG = {
        versao: '3.1',
        nomeApp: 'Gestão Rural',
        debug: true,
        timeoutCarregamento: 30000,
        timeoutAutenticacao: 5000,
        debounceInicializacao: 200,
        viveiro: {
            renderDelay: 300,
            maxRenderAttempts: 3
        }
    };

    // ================================================================
    // ESTADO DA APLICAÇÃO
    // ================================================================
    var APP = {
        inicializado: false,
        autenticado: false,
        usuario: null,
        tempoInicio: null,
        modulosCarregados: [],
        modulosFalhas: [],
        ready: false,
        authListenerAtivo: false,
        _inicializando: false,
        _inicializacaoTimeout: null,
        _initialized: false,
        _carregandoDados: false,
        _modulosInicializados: false,
        _viveiroRenderAttempts: 0,
        _viveiroRenderTimeout: null,
        _secaoAtual: 'dashboard',
        _navegando: false,
        _perfilCarregado: false,
        _isFuncionario: false
    };

    // ================================================================
    // FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO
    // ================================================================
    function init() {
        if (APP._initialized) {
            console.log('⏳ App já inicializado, ignorando chamada duplicada');
            return;
        }
        
        if (APP._inicializando) {
            console.log('⏳ App já está sendo inicializado, aguarde...');
            return;
        }
        
        APP._inicializando = true;
        APP.tempoInicio = performance.now();
        
        log('🚀 Iniciando ' + CONFIG.nomeApp + ' v' + CONFIG.versao);
        log('📅 ' + new Date().toLocaleString('pt-BR'));

        try {
            if (!verificarDependencias()) {
                APP._inicializando = false;
                return;
            }

            configurarFirebase();
            inicializarAutenticacao();
            configurarListeners();
            configurarNavegacao();
            mostrarVersao();
            verificarConexao();
            configurarScrollTop();
            
            // 🆕 Inicializa sistema de perfis (com verificação segura)
            inicializarSistemaPerfis();

            APP._initialized = true;
            APP._inicializando = false;

            log('✅ ' + CONFIG.nomeApp + ' iniciado com sucesso!');
            log('⏱️ Tempo: ' + Math.round(performance.now() - APP.tempoInicio) + 'ms');

            if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('app-ready'));
            }

        } catch (error) {
            APP._inicializando = false;
            log('❌ Erro fatal:', error);
            mostrarErroCritico('Falha ao iniciar o sistema: ' + error.message);
        }
    }

    // ================================================================
    // 🆕 INICIALIZAR SISTEMA DE PERFIS (CORRIGIDO)
    // ================================================================
    function inicializarSistemaPerfis() {
        log('🔐 Inicializando sistema de perfis...');

        if (typeof GR.Modules.Perfis === 'undefined') {
            log('⚠️ Módulo de perfis não disponível!');
            return;
        }

        // Aguarda o usuário estar logado
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    log('👤 Usuário logado, carregando perfil...');
                    
                    // 🔧 VERIFICA SE A FUNÇÃO init EXISTE ANTES DE CHAMAR
                    if (typeof GR.Modules.Perfis.init === 'function') {
                        GR.Modules.Perfis.init();
                    } else if (typeof GR.Modules.Perfis._forcarCarregamentoPerfil === 'function') {
                        // Fallback: tenta carregar diretamente
                        log('⚠️ init() não encontrada, usando _forcarCarregamentoPerfil()');
                        GR.Modules.Perfis._forcarCarregamentoPerfil();
                        if (typeof GR.Modules.Perfis.filtrarMenu === 'function') {
                            GR.Modules.Perfis.filtrarMenu();
                        }
                    } else {
                        log('⚠️ Nenhuma função de inicialização de perfis encontrada');
                    }
                    
                    // Verifica se é funcionário
                    setTimeout(function() {
                        verificarPerfilUsuario();
                    }, 500);
                }
            });
        }

        // Listener para quando o perfil for carregado
        window.addEventListener('perfil-carregado', function(e) {
            log('📡 Evento perfil-carregado recebido');
            verificarPerfilUsuario();
        });
    }

    // ================================================================
    // 🆕 VERIFICAR PERFIL DO USUÁRIO (CORRIGIDO)
    // ================================================================
    function verificarPerfilUsuario() {
        try {
            if (typeof GR.Modules.Perfis === 'undefined') {
                log('⚠️ Módulo de perfis não disponível para verificação');
                return;
            }

            // 🔧 VERIFICA SE A FUNÇÃO isFuncionario EXISTE
            var isFuncionario = false;
            if (typeof GR.Modules.Perfis.isFuncionario === 'function') {
                isFuncionario = GR.Modules.Perfis.isFuncionario();
            } else {
                // Fallback: verifica pelo perfilAtual
                var perfil = GR.Modules.Perfis.perfilAtual;
                if (!perfil && typeof GR.Modules.Perfis._forcarCarregamentoPerfil === 'function') {
                    perfil = GR.Modules.Perfis._forcarCarregamentoPerfil();
                }
                isFuncionario = perfil && (perfil.id === 'funcionario' || perfil.funcionarioId !== undefined);
            }
            
            APP._isFuncionario = isFuncionario;
            APP._perfilCarregado = true;

            if (isFuncionario) {
                log('👨‍🌾 Usuário é FUNCIONÁRIO, aplicando restrições...');
                aplicarModoFuncionario();
                
                setTimeout(function() {
                    if (typeof GR.Modules.Perfis.renderAreaFuncionario === 'function') {
                        GR.Modules.Perfis.renderAreaFuncionario();
                        log('✅ Área do funcionário renderizada');
                    }
                }, 300);
            } else {
                log('👑 Usuário é ADMINISTRADOR, menu completo.');
                aplicarModoAdministrador();
            }

            atualizarMenuPorPerfil();
            atualizarFooterPerfil();

        } catch (e) {
            log('❌ Erro ao verificar perfil:', e.message);
        }
    }

    // ================================================================
    // 🆕 APLICAR MODO FUNCIONÁRIO
    // ================================================================
    function aplicarModoFuncionario() {
        document.querySelectorAll('.nav-btn').forEach(function(btn) {
            if (btn.dataset.section !== 'funcionarios') {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'flex';
                setTimeout(function() {
                    btn.click();
                }, 200);
            }
        });

        document.querySelectorAll('.header-right .config-btn').forEach(function(btn) {
            var text = btn.textContent || btn.innerText || '';
            if (text.includes('💾') || text.includes('⚙️') || text.includes('🔔')) {
                btn.style.display = 'none';
            }
        });

        adicionarBotaoLogoutFuncionario();

        document.querySelectorAll('.prop-tabs-container').forEach(function(el) {
            el.style.display = 'none';
        });

        log('👨‍🌾 Modo funcionário aplicado');
    }

    // ================================================================
    // 🆕 APLICAR MODO ADMINISTRADOR
    // ================================================================
    function aplicarModoAdministrador() {
        document.querySelectorAll('.nav-btn').forEach(function(btn) {
            btn.style.display = 'flex';
        });

        document.querySelectorAll('.header-right .config-btn').forEach(function(btn) {
            btn.style.display = '';
        });

        document.querySelectorAll('.prop-tabs-container').forEach(function(el) {
            el.style.display = '';
        });

        var btnLogout = document.getElementById('btn-logout-funcionario');
        if (btnLogout) {
            btnLogout.remove();
        }

        log('👑 Modo administrador aplicado');
    }

    // ================================================================
    // 🆕 ADICIONAR BOTÃO DE LOGOUT DO FUNCIONÁRIO
    // ================================================================
    function adicionarBotaoLogoutFuncionario() {
        var btnExistente = document.getElementById('btn-logout-funcionario');
        if (btnExistente) return;

        var headerRight = document.querySelector('.header-right');
        if (!headerRight) return;

        var btn = document.createElement('button');
        btn.id = 'btn-logout-funcionario';
        btn.className = 'config-btn';
        btn.innerHTML = '🚪 Sair';
        btn.title = 'Sair da área do funcionário';
        btn.style.color = 'var(--danger)';
        btn.onclick = function() {
            if (typeof GR.Modules.Perfis !== 'undefined' && typeof GR.Modules.Perfis.logoutFuncionario === 'function') {
                GR.Modules.Perfis.logoutFuncionario();
            } else {
                firebase.auth().signOut().then(function() {
                    location.reload();
                });
            }
        };

        headerRight.appendChild(btn);
        log('✅ Botão de logout do funcionário adicionado');
    }

    // ================================================================
    // 🆕 ATUALIZAR MENU POR PERFIL (CORRIGIDO)
    // ================================================================
    function atualizarMenuPorPerfil() {
        if (typeof GR.Modules.Perfis === 'undefined') return;
        
        var isFuncionario = APP._isFuncionario;
        var perfil = null;
        
        if (typeof GR.Modules.Perfis.getPerfilAtual === 'function') {
            perfil = GR.Modules.Perfis.getPerfilAtual();
        } else {
            perfil = GR.Modules.Perfis.perfilAtual || null;
        }

        document.querySelectorAll('.nav-btn').forEach(function(btn) {
            if (isFuncionario) {
                if (btn.dataset.section !== 'funcionarios') {
                    btn.style.display = 'none';
                } else {
                    btn.style.display = 'flex';
                }
            } else {
                if (perfil && perfil.permissoes && perfil.permissoes.ver) {
                    var section = btn.dataset.section;
                    if (perfil.permissoes.ver.includes('*') || perfil.permissoes.ver.includes(section)) {
                        btn.style.display = 'flex';
                    } else {
                        btn.style.display = 'none';
                    }
                } else {
                    btn.style.display = 'flex';
                }
            }
        });

        log('📋 Menu atualizado por perfil');
    }

    // ================================================================
    // 🆕 ATUALIZAR FOOTER COM PERFIL (CORRIGIDO)
    // ================================================================
    function atualizarFooterPerfil() {
        try {
            if (typeof GR.Modules.Perfis === 'undefined') return;

            var perfil = null;
            if (typeof GR.Modules.Perfis.getPerfilAtual === 'function') {
                perfil = GR.Modules.Perfis.getPerfilAtual();
            } else {
                perfil = GR.Modules.Perfis.perfilAtual || null;
            }
            
            var footerLevel = document.getElementById('footer-user-level');
            if (footerLevel && perfil) {
                footerLevel.textContent = perfil.nome || '-';
            }

            if (APP._isFuncionario) {
                var funcionario = null;
                if (typeof GR.Modules.Perfis.getFuncionarioLogado === 'function') {
                    funcionario = GR.Modules.Perfis.getFuncionarioLogado();
                }
                var footerUser = document.getElementById('footer-user-name');
                if (footerUser && funcionario) {
                    footerUser.textContent = '👨‍🌾 ' + funcionario.nome;
                }
            }
        } catch(e) {
            log('⚠️ Erro ao atualizar footer com perfil:', e.message);
        }
    }

    // ================================================================
    // VERIFICAR DEPENDÊNCIAS
    // ================================================================
    function verificarDependencias() {
        var dependencias = [
            { nome: 'Firebase', obj: typeof firebase !== 'undefined' },
            { nome: 'Firestore', obj: typeof firebase !== 'undefined' && firebase.firestore },
            { nome: 'Storage', obj: typeof firebase !== 'undefined' && firebase.storage },
            { nome: 'GR', obj: typeof GR !== 'undefined' },
            { nome: 'GR.State', obj: typeof GR !== 'undefined' && GR.State },
            { nome: 'GR.UI', obj: typeof GR !== 'undefined' && GR.UI },
            { nome: 'GR.Utils', obj: typeof GR !== 'undefined' && GR.Utils },
            { nome: 'GR.Modal', obj: typeof GR !== 'undefined' && GR.Modal },
            { nome: 'GR.Toast', obj: typeof GR !== 'undefined' && GR.Toast },
            { nome: 'GR.Modules', obj: typeof GR !== 'undefined' && GR.Modules }
        ];

        var todasOk = true;
        var faltando = [];

        dependencias.forEach(function(dep) {
            if (!dep.obj) {
                log('❌ Dependência faltando:', dep.nome);
                faltando.push(dep.nome);
                todasOk = false;
            } else {
                log('✅ ' + dep.nome + ' carregado');
            }
        });

        if (!todasOk) {
            log('⚠️ Dependências faltando: ' + faltando.join(', '));
            return true;
        }

        return true;
    }

    // ================================================================
    // CONFIGURAR FIREBASE
    // ================================================================
    function configurarFirebase() {
        try {
            if (firebase.apps && firebase.apps.length > 0) {
                log('✅ Firebase já inicializado');
                return;
            }

            var firebaseConfig = null;
            
            if (typeof GR !== 'undefined' && GR.Config && GR.Config.firebase) {
                firebaseConfig = GR.Config.firebase;
                log('✅ Configuração do Firebase carregada do GR.Config');
            }

            if (!firebaseConfig) {
                var configEl = document.getElementById('firebase-config');
                if (configEl) {
                    try {
                        firebaseConfig = JSON.parse(configEl.textContent);
                        log('✅ Configuração do Firebase carregada do HTML');
                    } catch(e) {
                        log('⚠️ Erro ao ler config do HTML');
                    }
                }
            }

            if (!firebaseConfig) {
                log('⚠️ Usando configuração padrão do Firebase');
                firebaseConfig = {
                    apiKey: "AIzaSyChuaGrBbiTXSgJaH127GOroFfFSX_Uj4s",
                    authDomain: "gestao-rural-1f1e3.firebaseapp.com",
                    projectId: "gestao-rural-1f1e3",
                    storageBucket: "gestao-rural-1f1e3.firebasestorage.app",
                    messagingSenderId: "1024304603397",
                    appId: "1:1024304603397:web:795ac7ce9a5ad607a6576c"
                };
            }

            firebase.initializeApp(firebaseConfig);
            log('✅ Firebase inicializado');

        } catch (error) {
            log('❌ Erro ao configurar Firebase:', error);
            throw error;
        }
    }

    // ================================================================
    // INICIALIZAR AUTENTICAÇÃO
    // ================================================================
    function inicializarAutenticacao() {
        log('🔐 Inicializando autenticação...');

        if (APP.authListenerAtivo) {
            log('⚠️ Listener de autenticação já ativo');
            return;
        }

        APP.authListenerAtivo = true;

        var timeoutId = setTimeout(function() {
            log('⏰ Timeout de autenticação (' + CONFIG.timeoutAutenticacao + 'ms)');
            
            var user = firebase.auth().currentUser;
            if (user) {
                log('✅ Usuário recuperado via currentUser:', user.email);
                autenticarUsuario(user);
                return;
            }
            
            if (!APP.autenticado && !APP.inicializado) {
                log('👤 Forçando modo visitante / tela de login');
                APP.autenticado = false;
                APP.usuario = null;
                
                mostrarTelaLogin();
                APP.ready = true;
                APP.inicializado = true;
                removerLoading();
                
                if (GR.UI && typeof GR.UI.init === 'function') {
                    GR.UI.init();
                }
            }
        }, CONFIG.timeoutAutenticacao);

        var unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
            clearTimeout(timeoutId);
            log('📡 onAuthStateChanged disparado');
            
            if (user) {
                autenticarUsuario(user);
            } else {
                APP.autenticado = false;
                APP.usuario = null;
                APP._isFuncionario = false;
                APP._perfilCarregado = false;
                log('🔓 Usuário não autenticado');
                
                mostrarTelaLogin();
                APP.ready = true;
                APP.inicializado = true;
                removerLoading();
                
                if (GR.UI && typeof GR.UI.init === 'function') {
                    GR.UI.init();
                }
            }
        });

        firebase.auth().onIdTokenChanged(function(user) {
            if (user) {
                log('🔄 Token atualizado');
            }
        });

        return unsubscribe;
    }

    // ================================================================
    // AUTENTICAR USUÁRIO
    // ================================================================
    function autenticarUsuario(user) {
        if (APP.autenticado && APP.usuario && APP.usuario.uid === user.uid) {
            log('⏳ Usuário já autenticado:', user.email);
            return;
        }

        APP.autenticado = true;
        APP.usuario = {
            uid: user.uid,
            email: user.email,
            nome: user.displayName || localStorage.getItem('gr_nome_usuario') || user.email || 'Usuário',
            telefone: user.phoneNumber || ''
        };
        log('✅ Usuário autenticado:', APP.usuario.email);
        
        currentUser = user;
        window.currentUser = user;
        
        inicializarSistema();
        
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('user-logged-in', { 
                detail: { user: user } 
            }));
        }
    }

    // ================================================================
    // INICIALIZAR SISTEMA (APÓS AUTENTICAÇÃO)
    // ================================================================
    function inicializarSistema() {
        if (APP.inicializado) {
            log('⏳ Sistema já inicializado');
            return;
        }

        log('📦 Inicializando sistema...');

        if (GR.State && typeof GR.State.inicializar === 'function') {
            GR.State.inicializar();
        }

        carregarDados();
        inicializarModulos();
        marcarComoInicializado();

        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('app-ready', {
                detail: { 
                    versao: CONFIG.versao,
                    usuario: APP.usuario 
                }
            }));
        }

        log('✅ Sistema inicializado!');
    }

    // ================================================================
    // MARCAR COMO INICIALIZADO
    // ================================================================
    function marcarComoInicializado() {
        APP.ready = true;
        APP.inicializado = true;
        log('✅ APP.ready = ' + APP.ready + ', APP.inicializado = ' + APP.inicializado);
    }

    // ================================================================
    // CARREGAR DADOS
    // ================================================================
    function carregarDados() {
        log('📥 Carregando dados do usuário...');

        if (APP._carregandoDados) {
            log('⏳ Dados já estão sendo carregados');
            return;
        }
        APP._carregandoDados = true;

        if (GR.State && typeof GR.State.carregarDados === 'function') {
            GR.State.carregarDados()
                .then(function() {
                    log('✅ Dados carregados!');
                    APP._carregandoDados = false;
                    
                    if (GR.UI && typeof GR.UI.init === 'function') {
                        GR.UI.init();
                    }
                    
                    removerLoading();
                    atualizarInfoUsuario();
                    marcarComoInicializado();
                    
                    inicializarViveiro();
                    
                    setTimeout(function() {
                        verificarPerfilUsuario();
                    }, 300);
                    
                    setTimeout(function() {
                        if (GR.UI && typeof GR.UI._atualizarDashboard === 'function') {
                            GR.UI._atualizarDashboard();
                        }
                    }, 1000);
                    
                })
                .catch(function(err) {
                    APP._carregandoDados = false;
                    log('❌ Erro ao carregar dados:', err);
                    mostrarErro('Erro ao carregar dados: ' + err.message);
                    marcarComoInicializado();
                    removerLoading();
                    inicializarViveiro();
                    verificarPerfilUsuario();
                });
        } else {
            APP._carregandoDados = false;
            log('⚠️ GR.State não disponível');
            if (GR.UI && typeof GR.UI.init === 'function') {
                GR.UI.init();
            }
            removerLoading();
            marcarComoInicializado();
            inicializarViveiro();
            verificarPerfilUsuario();
        }
    }

    // ================================================================
    // INICIALIZAR VIVEIRO
    // ================================================================
    function inicializarViveiro() {
        log('🌱 Inicializando módulo Viveiro...');

        if (APP._viveiroRenderTimeout) {
            clearTimeout(APP._viveiroRenderTimeout);
            APP._viveiroRenderTimeout = null;
        }

        function tentarRenderizarViveiro() {
            try {
                if (GR.Modules && GR.Modules.Viveiro) {
                    if (typeof GR.Modules.Viveiro.inicializar === 'function') {
                        GR.Modules.Viveiro.inicializar();
                        log('✅ Viveiro.inicializar() executado');
                    }
                    
                    if (typeof GR.Modules.Viveiro.render === 'function') {
                        var container = document.getElementById('viveiro-content');
                        if (container) {
                            GR.Modules.Viveiro.render();
                            log('✅ Viveiro.render() executado com sucesso');
                            APP._viveiroRenderAttempts = 0;
                            return true;
                        } else {
                            log('⚠️ Container #viveiro-content não encontrado, aguardando...');
                            return false;
                        }
                    } else {
                        log('⚠️ Viveiro.render() não é uma função');
                        return false;
                    }
                } else {
                    log('⚠️ GR.Modules.Viveiro não está disponível');
                    return false;
                }
            } catch (e) {
                log('❌ Erro ao renderizar Viveiro:', e.message);
                return false;
            }
        }

        var sucesso = tentarRenderizarViveiro();
        
        if (!sucesso) {
            var delays = [300, 600, 1200, 2000];
            var tentativas = 0;
            var maxTentativas = Math.min(delays.length, CONFIG.viveiro.maxRenderAttempts || 3);

            function tentarNovamente() {
                if (tentativas >= maxTentativas) {
                    log('⚠️ Máximo de tentativas atingido para o Viveiro');
                    return;
                }
                
                tentativas++;
                var delay = delays[tentativas - 1] || 1500;
                
                APP._viveiroRenderTimeout = setTimeout(function() {
                    log('🔄 Tentativa ' + tentativas + ' de renderizar Viveiro...');
                    var ok = tentarRenderizarViveiro();
                    if (!ok && tentativas < maxTentativas) {
                        tentarNovamente();
                    } else if (ok) {
                        log('✅ Viveiro renderizado na tentativa ' + tentativas);
                    }
                }, delay);
            }

            tentarNovamente();
        }
    }

    // ================================================================
    // INICIALIZAR MÓDULOS
    // ================================================================
    function inicializarModulos() {
        if (APP._modulosInicializados) {
            log('⏳ Módulos já inicializados');
            return;
        }

        log('📦 Inicializando módulos...');
        APP._modulosInicializados = true;

        var modulos = [
            { nome: 'Perfis', obj: GR.Modules.Perfis },
            { nome: 'Tarefas', obj: GR.Modules.Tarefas },
            { nome: 'Orcamentos', obj: GR.Modules.Orcamentos },
            { nome: 'Contratos', obj: GR.Modules.Contratos },
            { nome: 'Vencimentos', obj: GR.Modules.Vencimentos },
            { nome: 'Insumos', obj: GR.Modules.Insumos },
            { nome: 'Pecuaria', obj: GR.Modules.Pecuaria },
            { nome: 'Funcionarios', obj: GR.Modules.Funcionarios },
            { nome: 'Parceiros', obj: GR.Modules.Parceiros },
            { nome: 'Producao', obj: GR.Modules.Producao },
            { nome: 'PartesRelacionadas', obj: GR.Modules.PartesRelacionadas },
            { nome: 'Contabilidade', obj: GR.Modules.Contabilidade },
            { nome: 'Documentos', obj: GR.Modules.Documentos },
            { nome: 'Analises', obj: GR.Analises },
            { nome: 'Relatorios', obj: GR.Modules.Relatorios },
            { nome: 'Historico', obj: GR.Modules.Historico },
            { nome: 'Notificacoes', obj: GR.Modules.Notificacoes },
            { nome: 'NFe', obj: GR.Modules.NFe },
            { nome: 'Fornecedores', obj: GR.Modules.Fornecedores },
            { nome: 'Backup', obj: GR.Backup },
            { nome: 'Scanner', obj: GR.Scanner },
            { nome: 'PDFImport', obj: GR.PDFImport },
            { nome: 'Voice', obj: GR.Voice },
            { nome: 'IA', obj: GR.Modules.IA }
        ];

        modulos.forEach(function(mod) {
            if (mod.obj) {
                try {
                    if (typeof mod.obj.init === 'function') {
                        mod.obj.init();
                    } else if (typeof mod.obj.inicializar === 'function') {
                        mod.obj.inicializar();
                    }
                    APP.modulosCarregados.push(mod.nome);
                    log('✅ ' + mod.nome + ' inicializado');
                } catch (err) {
                    log('⚠️ Erro em ' + mod.nome + ':', err);
                    APP.modulosFalhas.push(mod.nome);
                }
            } else {
                log('⚠️ Módulo não encontrado:', mod.nome);
                APP.modulosFalhas.push(mod.nome);
            }
        });

        log('📊 Módulos carregados:', APP.modulosCarregados.length);
        if (APP.modulosFalhas.length > 0) {
            log('⚠️ Módulos com falha:', APP.modulosFalhas);
        }
    }

    // ================================================================
    // CONFIGURAR NAVEGAÇÃO
    // ================================================================
    function configurarNavegacao() {
        log('🧭 Configurando navegação...');

        var navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var secao = this.dataset.section;
                if (secao) {
                    navegarPara(secao);
                }
            });
        });

        document.addEventListener('click', function(e) {
            var target = e.target.closest('.prop-tab');
            if (target) {
                var prop = target.dataset.prop;
                if (prop) {
                    log('🏠 Mudando propriedade para:', prop);
                    if (GR.UI && typeof GR.UI.mudarPropriedade === 'function') {
                        GR.UI.mudarPropriedade(prop);
                    }
                }
            }
        });

        log('✅ Navegação configurada');
    }

    // ================================================================
    // NAVEGAR PARA SEÇÃO
    // ================================================================
    function navegarPara(secao) {
        if (APP._navegando) {
            log('⏳ Já navegando, aguarde...');
            return;
        }

        if (APP._isFuncionario && secao !== 'funcionarios') {
            log('⚠️ Funcionário tentando acessar: ' + secao + ' (negado)');
            if (GR.Toast) GR.Toast.warning('⚠️ Você só tem acesso à área do funcionário!');
            return;
        }

        APP._navegando = true;
        log('📌 Navegando para:', secao);

        try {
            document.querySelectorAll('.nav-btn').forEach(function(btn) {
                btn.classList.remove('active');
                if (btn.dataset.section === secao) {
                    btn.classList.add('active');
                }
            });

            document.querySelectorAll('.section').forEach(function(s) {
                s.classList.add('hidden');
            });

            var target = document.getElementById('section-' + secao);
            if (target) {
                target.classList.remove('hidden');

                if (secao === 'funcionarios') {
                    setTimeout(function() {
                        if (APP._isFuncionario) {
                            if (typeof GR.Modules.Perfis !== 'undefined' && typeof GR.Modules.Perfis.renderAreaFuncionario === 'function') {
                                GR.Modules.Perfis.renderAreaFuncionario();
                                log('✅ Área do funcionário renderizada na navegação');
                            }
                        } else {
                            if (typeof GR.Modules.Funcionarios !== 'undefined' && typeof GR.Modules.Funcionarios.render === 'function') {
                                GR.Modules.Funcionarios.render();
                                log('✅ Lista de funcionários renderizada na navegação');
                            }
                        }
                    }, 100);
                }

                if (secao === 'viveiro' && GR.Modules && GR.Modules.Viveiro) {
                    setTimeout(function() {
                        if (typeof GR.Modules.Viveiro.render === 'function') {
                            GR.Modules.Viveiro.render();
                            log('✅ Viveiro renderizado na navegação');
                        }
                    }, 100);
                }

                if (secao === 'dashboard' && GR.UI && typeof GR.UI._atualizarDashboard === 'function') {
                    setTimeout(function() {
                        GR.UI._atualizarDashboard();
                        log('✅ Dashboard atualizado na navegação');
                    }, 100);
                }

                if (secao === 'relatorios' && GR.Modules && GR.Modules.Relatorios) {
                    setTimeout(function() {
                        if (typeof GR.Modules.Relatorios.render === 'function') {
                            GR.Modules.Relatorios.render();
                        }
                    }, 100);
                }

                if (secao === 'producao' && GR.Modules && GR.Modules.Producao) {
                    setTimeout(function() {
                        if (typeof GR.Modules.Producao.render === 'function') {
                            GR.Modules.Producao.render();
                        }
                    }, 100);
                }

                APP._secaoAtual = secao;
            } else {
                log('⚠️ Seção não encontrada:', secao);
            }

        } catch (e) {
            log('❌ Erro ao navegar:', e.message);
        }

        APP._navegando = false;
    }

    // ================================================================
    // CONFIGURAR LISTENERS GLOBAIS
    // ================================================================
    function configurarListeners() {
        log('🔊 Configurando listeners globais...');

        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'w') {
                var modal = document.querySelector('.modal.active');
                if (modal) {
                    e.preventDefault();
                    var closeBtn = modal.querySelector('.close-btn');
                    if (closeBtn) closeBtn.click();
                }
            }
        });

        document.addEventListener('visibilitychange', function() {
            if (!document.hidden && APP.ready) {
                log('👁️ Página visível, atualizando...');
                if (GR.UI && typeof GR.UI._atualizarDashboard === 'function') {
                    GR.UI._atualizarDashboard();
                }
                if (GR.State && typeof GR.State.verificarVencimentos === 'function') {
                    GR.State.verificarVencimentos();
                }
                if (GR.Modules && GR.Modules.Viveiro && typeof GR.Modules.Viveiro.render === 'function') {
                    setTimeout(function() {
                        GR.Modules.Viveiro.render();
                    }, 300);
                }
                verificarPerfilUsuario();
            }
        });

        window.addEventListener('user-logged-in', function(e) {
            log('📡 Evento user-logged-in recebido');
            if (e.detail && e.detail.user) {
                autenticarUsuario(e.detail.user);
            }
        });

        window.addEventListener('user-logged-out', function() {
            log('📡 Evento user-logged-out recebido');
            APP.autenticado = false;
            APP.usuario = null;
            APP._isFuncionario = false;
            APP._perfilCarregado = false;
            mostrarTelaLogin();
        });

        window.addEventListener('viveiro-render-request', function() {
            log('📡 Evento viveiro-render-request recebido');
            if (GR.Modules && GR.Modules.Viveiro && typeof GR.Modules.Viveiro.render === 'function') {
                setTimeout(function() {
                    GR.Modules.Viveiro.render();
                }, 100);
            }
        });

        window.addEventListener('perfil-carregado', function(e) {
            log('📡 Evento perfil-carregado recebido');
            verificarPerfilUsuario();
        });

        window.addEventListener('error', function(e) {
            log('❌ Erro não capturado:', e.message);
        });

        window.addEventListener('unhandledrejection', function(e) {
            log('❌ Promise rejeitada:', e.reason);
        });

        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var addedNodes = mutations[i].addedNodes;
                    for (var j = 0; j < addedNodes.length; j++) {
                        var node = addedNodes[j];
                        if (node.nodeType === 1 && node.id === 'viveiro-content') {
                            log('🔍 Container #viveiro-content detectado no DOM');
                            if (GR.Modules && GR.Modules.Viveiro && typeof GR.Modules.Viveiro.render === 'function') {
                                setTimeout(function() {
                                    GR.Modules.Viveiro.render();
                                }, 100);
                            }
                            break;
                        }
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        log('✅ Listeners configurados');
    }

    // ================================================================
    // CONFIGURAR SCROLL TOP
    // ================================================================
    function configurarScrollTop() {
        window.addEventListener('scroll', function() {
            var btn = document.getElementById('scroll-top');
            if (btn) {
                btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
            }
        });

        document.getElementById('scroll-top')?.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ================================================================
    // MOSTRAR TELA DE LOGIN
    // ================================================================
    function mostrarTelaLogin() {
        log('👤 Mostrando tela de login');
        
        var loginSection = document.getElementById('loginSection');
        if (loginSection) {
            loginSection.style.display = 'flex';
            loginSection.classList.add('show');
        }
        var appContent = document.getElementById('appContent');
        if (appContent) {
            appContent.style.display = 'none';
        }
        removerLoading();
    }

    // ================================================================
    // ATUALIZAR INFORMAÇÕES DO USUÁRIO
    // ================================================================
    function atualizarInfoUsuario() {
        var user = APP.usuario;
        if (!user) return;

        log('👤 Atualizando informações do usuário:', user.email);

        var loginSection = document.getElementById('loginSection');
        if (loginSection) {
            loginSection.style.display = 'none';
            loginSection.classList.remove('show');
        }

        var appContent = document.getElementById('appContent');
        if (appContent) {
            appContent.style.display = 'block';
        }

        var userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = user.nome;
        }

        var userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) {
            userEmailEl.textContent = user.email || '';
        }

        var footerUser = document.getElementById('footer-user-name');
        if (footerUser) {
            footerUser.textContent = user.nome;
        }

        var avatarEl = document.getElementById('user-avatar');
        if (avatarEl) {
            var inicial = (user.nome || 'U').charAt(0).toUpperCase();
            avatarEl.textContent = inicial;
            avatarEl.style.display = 'flex';
        }

        var nivelEl = document.getElementById('userLevel');
        if (nivelEl) {
            try {
                var perfil = localStorage.getItem('gr_perfil_atual');
                if (perfil) {
                    var p = JSON.parse(perfil);
                    nivelEl.textContent = p.nome || 'usuário';
                }
            } catch(e) {}
        }

        var footerLevel = document.getElementById('footer-user-level');
        if (footerLevel) {
            try {
                var perfil = localStorage.getItem('gr_perfil_atual');
                if (perfil) {
                    var p = JSON.parse(perfil);
                    footerLevel.textContent = p.nome || '-';
                }
            } catch(e) {}
        }
    }

    // ================================================================
    // REMOVER LOADING
    // ================================================================
    function removerLoading() {
        var loading = document.getElementById('loading-overlay');
        if (loading) {
            loading.style.transition = 'opacity 0.5s';
            loading.style.opacity = '0';
            setTimeout(function() {
                loading.style.display = 'none';
            }, 500);
        }
    }

    // ================================================================
    // MOSTRAR VERSÃO
    // ================================================================
    function mostrarVersao() {
        var footer = document.getElementById('app-footer');
        if (footer) {
            var span = document.createElement('span');
            span.textContent = ' v' + CONFIG.versao;
            span.style.fontSize = '10px';
            span.style.color = 'var(--text-light)';
            span.style.marginLeft = '4px';
            footer.appendChild(span);
        }
    }

    // ================================================================
    // VERIFICAR CONEXÃO
    // ================================================================
    function verificarConexao() {
        function atualizarStatus() {
            var statusEl = document.getElementById('footer-online');
            if (!statusEl) return;
            
            if (navigator.onLine) {
                statusEl.textContent = '🟢 Online';
                statusEl.style.color = 'var(--success)';
            } else {
                statusEl.textContent = '🔴 Offline';
                statusEl.style.color = 'var(--danger)';
            }
        }

        atualizarStatus();
        window.addEventListener('online', atualizarStatus);
        window.addEventListener('offline', atualizarStatus);
        setInterval(atualizarStatus, 30000);
    }

    // ================================================================
    // MOSTRAR ERRO CRÍTICO
    // ================================================================
    function mostrarErroCritico(mensagem) {
        var container = document.getElementById('app-container') || document.body;
        container.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#f5f5f5;flex-direction:column;padding:20px;text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">❌</div>
                <h2 style="color:#d32f2f;font-size:20px;margin-bottom:8px;">Erro Crítico</h2>
                <p style="color:#666;font-size:14px;max-width:500px;">${mensagem}</p>
                <button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;background:#1976d2;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">
                    🔄 Recarregar Página
                </button>
                <p style="color:#999;font-size:11px;margin-top:12px;">
                    Se o problema persistir, contate o suporte.
                </p>
            </div>
        `;
    }

    // ================================================================
    // MOSTRAR ERRO SIMPLES
    // ================================================================
    function mostrarErro(mensagem) {
        if (GR.Toast) {
            GR.Toast.error(mensagem);
        } else {
            alert('❌ ' + mensagem);
        }
    }

    // ================================================================
    // LOG
    // ================================================================
    function log() {
        if (CONFIG.debug) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('[APP]');
            console.log.apply(console, args);
        }
    }

    // ================================================================
    // EXPORTA API PÚBLICA
    // ================================================================
    window.GRApp = {
        versao: CONFIG.versao,
        config: CONFIG,
        status: function() {
            return {
                inicializado: APP.inicializado,
                autenticado: APP.autenticado,
                usuario: APP.usuario,
                ready: APP.ready,
                modulosCarregados: APP.modulosCarregados,
                modulosFalhas: APP.modulosFalhas,
                tempoExecucao: Math.round(performance.now() - APP.tempoInicio) + 'ms',
                secaoAtual: APP._secaoAtual,
                isFuncionario: APP._isFuncionario,
                perfilCarregado: APP._perfilCarregado,
                viveiro: {
                    disponivel: typeof GR.Modules !== 'undefined' && typeof GR.Modules.Viveiro !== 'undefined',
                    renderAttempts: APP._viveiroRenderAttempts
                }
            };
        },
        reiniciar: function() {
            location.reload();
        },
        getUsuario: function() {
            return APP.usuario;
        },
        isAutenticado: function() {
            return APP.autenticado;
        },
        isReady: function() {
            return APP.ready;
        },
        isFuncionario: function() {
            return APP._isFuncionario;
        },
        refresh: function() {
            if (APP.ready) {
                log('🔄 Forçando atualização...');
                if (GR.UI && typeof GR.UI._atualizarDashboard === 'function') {
                    GR.UI._atualizarDashboard();
                }
                if (GR.State && typeof GR.State.carregarDados === 'function') {
                    GR.State.carregarDados();
                }
                if (GR.Modules && GR.Modules.Viveiro && typeof GR.Modules.Viveiro.render === 'function') {
                    setTimeout(function() {
                        GR.Modules.Viveiro.render();
                    }, 200);
                }
                verificarPerfilUsuario();
            }
        },
        renderViveiro: function() {
            if (GR.Modules && GR.Modules.Viveiro && typeof GR.Modules.Viveiro.render === 'function') {
                GR.Modules.Viveiro.render();
                log('🔄 Viveiro renderizado via GRApp.renderViveiro()');
                return true;
            }
            log('⚠️ Não foi possível renderizar o Viveiro');
            return false;
        },
        navegarPara: function(secao) {
            navegarPara(secao);
        },
        getPerfil: function() {
            if (typeof GR.Modules.Perfis !== 'undefined') {
                if (typeof GR.Modules.Perfis.getPerfilAtual === 'function') {
                    return GR.Modules.Perfis.getPerfilAtual();
                }
                return GR.Modules.Perfis.perfilAtual || null;
            }
            return null;
        },
        getFuncionarioLogado: function() {
            if (typeof GR.Modules.Perfis !== 'undefined') {
                if (typeof GR.Modules.Perfis.getFuncionarioLogado === 'function') {
                    return GR.Modules.Perfis.getFuncionarioLogado();
                }
                return GR.Modules.Perfis._funcionarioDados || null;
            }
            return null;
        },
        logoutFuncionario: function() {
            if (typeof GR.Modules.Perfis !== 'undefined' && typeof GR.Modules.Perfis.logoutFuncionario === 'function') {
                GR.Modules.Perfis.logoutFuncionario();
            } else {
                firebase.auth().signOut().then(function() {
                    location.reload();
                });
            }
        }
    };

    // ================================================================
    // INICIAR AUTOMATICAMENTE (COM DEBOUNCE)
    // ================================================================
    var initTimeout = null;

    function iniciarApp() {
        if (initTimeout) {
            clearTimeout(initTimeout);
        }
        initTimeout = setTimeout(function() {
            init();
        }, CONFIG.debounceInicializacao);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarApp);
    } else {
        iniciarApp();
    }

    // ================================================================
    // FALLBACK DE SEGURANÇA
    // ================================================================
    setTimeout(function() {
        if (!APP.inicializado && !APP.autenticado) {
            log('⚠️ Timeout de inicialização - usuário não autenticado');
            mostrarTelaLogin();
            removerLoading();
            APP.ready = true;
        } else if (!APP.inicializado && APP.autenticado) {
            log('⚠️ Timeout de inicialização - sistema não concluiu');
            marcarComoInicializado();
            removerLoading();
            if (GR.UI && typeof GR.UI.init === 'function') {
                GR.UI.init();
            }
            inicializarViveiro();
            verificarPerfilUsuario();
        } else if (APP.inicializado) {
            log('✅ Sistema já inicializado');
            if (!APP._perfilCarregado) {
                verificarPerfilUsuario();
            }
        }
    }, CONFIG.timeoutCarregamento);

    // VERIFICAÇÃO ADICIONAL
    setTimeout(function() {
        if (!APP.inicializado) {
            log('⚠️ App não inicializado após 5s, forçando...');
            if (GR.UI && typeof GR.UI.init === 'function') {
                GR.UI.init();
            }
            removerLoading();
            APP.ready = true;
            APP.inicializado = true;
            inicializarViveiro();
            verificarPerfilUsuario();
        }
    }, 5000);

    // VERIFICAÇÃO ESPECÍFICA PARA O VIVEIRO
    setTimeout(function() {
        if (APP.inicializado && GR.Modules && GR.Modules.Viveiro) {
            var container = document.getElementById('viveiro-content');
            if (!container || container.innerHTML.trim() === '' || container.innerHTML.includes('Nenhum dado')) {
                log('⚠️ Viveiro parece vazio, forçando render...');
                if (typeof GR.Modules.Viveiro.render === 'function') {
                    GR.Modules.Viveiro.render();
                }
            }
        }
    }, 3000);

    // VERIFICAÇÃO DE PERFIL ADICIONAL
    setTimeout(function() {
        if (APP.inicializado && !APP._perfilCarregado) {
            log('⏳ Verificando perfil após 4s...');
            verificarPerfilUsuario();
        }
    }, 4000);

    log('📄 app.js v' + CONFIG.versao + ' carregado, aguardando inicialização...');

})();

// ================================================================
// EXPORTA FUNÇÕES GLOBAIS PARA USO NO HTML
// ================================================================

window.navegarPara = function(section) {
    if (typeof GRApp !== 'undefined' && GRApp.navegarPara) {
        GRApp.navegarPara(section);
    } else {
        document.querySelectorAll('.nav-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        var navBtn = document.querySelector('.nav-btn[data-section="' + section + '"]');
        if (navBtn) navBtn.classList.add('active');
        document.querySelectorAll('.section').forEach(function(s) {
            s.classList.add('hidden');
        });
        var target = document.getElementById('section-' + section);
        if (target) target.classList.remove('hidden');
    }
};

window.isFuncionario = function() {
    if (typeof GRApp !== 'undefined' && GRApp.isFuncionario) {
        return GRApp.isFuncionario();
    }
    return false;
};

window.getFuncionarioLogado = function() {
    if (typeof GRApp !== 'undefined' && GRApp.getFuncionarioLogado) {
        return GRApp.getFuncionarioLogado();
    }
    return null;
};

console.log('✅ app.js v3.1 carregado com CORREÇÕES de perfis!');
console.log('📌 CORREÇÕES APLICADAS:');
console.log('   - 🔧 Verificação segura de GR.Modules.Perfis.init()');
console.log('   - 🔧 Fallback para _forcarCarregamentoPerfil()');
console.log('   - 🔧 Verificação segura de isFuncionario()');
console.log('   - 🔧 Verificação segura de getPerfilAtual()');
console.log('   - 🔧 Verificação segura de getFuncionarioLogado()');
console.log('📌 NOVAS FUNCIONALIDADES:');
console.log('   - 🔐 Sistema de perfis integrado');
console.log('   - 👨‍🌾 Modo funcionário com restrições');
console.log('   - 👑 Modo administrador com menu completo');
console.log('   - 🚪 Logout específico para funcionários');
console.log('   - 📋 Navegação com verificação de perfil');
console.log('📌 FUNÇÕES GLOBAIS DISPONÍVEIS:');
console.log('   - window.navegarPara("secao") - Navegar para seção');
console.log('   - window.isFuncionario() - Verificar se é funcionário');
console.log('   - window.getFuncionarioLogado() - Obter dados do funcionário');