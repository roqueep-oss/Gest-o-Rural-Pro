// ================================================================
// FIREBASE CONFIG - VERSÃO COMPLETA COM MELHORIAS E CORREÇÕES
// ================================================================

// ================================================================
// CONFIGURAÇÃO DO FIREBASE (SUAS CREDENCIAIS ORIGINAIS)
// ================================================================
const firebaseConfig = {
    apiKey: "AIzaSyChuaGrBbiTXSgJaH127GOroFfFSX_Uj4s",
    authDomain: "gestao-rural-1f1e3.firebaseapp.com",
    projectId: "gestao-rural-1f1e3",
    storageBucket: "gestao-rural-1f1e3.firebasestorage.app",
    messagingSenderId: "1024304603397",
    appId: "1:1024304603397:web:795ac7ce9a5ad607a6576c",
    measurementId: "G-5K8PB64QE8"
};

// ================================================================
// INICIALIZA O FIREBASE (APENAS UMA VEZ)
// ================================================================
try {
    // Verifica se o Firebase já foi inicializado
    if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
        console.log('🔥 Firebase inicializado com sucesso!');
    } else {
        console.log('⚠️ Firebase já estava inicializado, reutilizando...');
        // Atualiza a configuração se necessário
        if (firebase.apps[0].options.projectId !== firebaseConfig.projectId) {
            console.warn('⚠️ Projeto diferente, reinicializando...');
            firebase.apps[0].delete().then(function() {
                firebase.initializeApp(firebaseConfig);
                console.log('🔥 Firebase reinicializado!');
            }).catch(function(err) {
                console.warn('⚠️ Erro ao reinicializar Firebase:', err);
            });
        }
    }
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    // Tenta inicializar novamente
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('🔥 Firebase inicializado (fallback)');
    } catch(e) {
        console.error('❌ Falha crítica ao inicializar Firebase:', e);
    }
}

// ================================================================
// VARIÁVEL DE CONTROLE PARA EVITAR REINICIALIZAÇÃO
// ================================================================
var __firestoreInitialized = false;
var __persistenceEnabled = false;

// ================================================================
// CRIAR REFERÊNCIAS GLOBAIS (COM VERIFICAÇÃO E PERSISTÊNCIA)
// ================================================================
try {
    var auth = firebase.auth();
    var db = firebase.firestore();
    var storage = firebase.storage();
    console.log('✅ Auth, Firestore e Storage criados');
} catch (error) {
    console.error('❌ Erro ao criar referências do Firebase:', error);
    // Fallback: cria referências vazias para não quebrar
    var auth = { 
        currentUser: null, 
        onAuthStateChanged: function() {}, 
        signInWithEmailAndPassword: function() { return Promise.reject('Firebase não disponível'); } 
    };
    var db = { 
        collection: function() { 
            return { 
                doc: function() { 
                    return { 
                        get: function() { return Promise.reject('Firebase não disponível'); }, 
                        set: function() { return Promise.reject('Firebase não disponível'); },
                        update: function() { return Promise.reject('Firebase não disponível'); },
                        delete: function() { return Promise.reject('Firebase não disponível'); }
                    } 
                },
                add: function() { return Promise.reject('Firebase não disponível'); },
                where: function() { return this; },
                get: function() { return Promise.reject('Firebase não disponível'); },
                onSnapshot: function() {}
            } 
        },
        enablePersistence: function() { return Promise.resolve(); },
        settings: function() {}
    };
    var storage = { 
        ref: function() { 
            return { 
                put: function() { return Promise.reject('Firebase não disponível'); }, 
                getDownloadURL: function() { return Promise.reject('Firebase não disponível'); },
                delete: function() { return Promise.reject('Firebase não disponível'); }
            } 
        } 
    };
}

// ================================================================
// 🆕 HABILITAR PERSISTÊNCIA DO FIRESTORE (CORRIGIDO)
// ================================================================
function habilitarPersistence() {
    // Evita habilitar mais de uma vez
    if (__persistenceEnabled) {
        console.log('ℹ️ Persistência já ativada');
        return Promise.resolve();
    }
    
    // Evita habilitar se o Firestore já tiver sido usado
    if (__firestoreInitialized) {
        console.log('ℹ️ Firestore já inicializado, persistência não pode ser ativada');
        return Promise.resolve();
    }
    
    console.log('📦 Ativando persistência offline do Firestore...');
    
    // Tenta habilitar persistência com sincronização de abas
    return db.enablePersistence({
        synchronizeTabs: true
    }).then(function() {
        __persistenceEnabled = true;
        console.log('✅ Persistência offline ativada com sucesso!');
        return true;
    }).catch(function(err) {
        if (err.code === 'failed-precondition') {
            // Múltiplas abas abertas, persistência já ativa
            console.log('ℹ️ Persistência já ativa (múltiplas abas)');
            __persistenceEnabled = true;
            return true;
        } else if (err.code === 'unimplemented') {
            // Navegador não suporta persistência
            console.log('ℹ️ Persistência não suportada pelo navegador');
            return false;
        } else {
            console.warn('⚠️ Erro ao ativar persistência:', err);
            return false;
        }
    });
}

// ================================================================
// 🆕 INICIALIZAR FIRESTORE COM CONFIGURAÇÕES
// ================================================================
function inicializarFirestore() {
    if (__firestoreInitialized) {
        console.log('ℹ️ Firestore já inicializado');
        return db;
    }
    
    try {
        // Primeiro, habilita persistência (se possível)
        habilitarPersistence().then(function() {
            // Aplica configurações
            db.settings({ 
                cache: true, 
                merge: true,
                ignoreUndefinedProperties: true
            });
            
            __firestoreInitialized = true;
            console.log('✅ Firestore configurado com cache e persistência');
            
            // Marca como inicializado globalmente
            window.__firestoreInitialized = true;
            window.db = db;
        }).catch(function(err) {
            console.warn('⚠️ Erro ao configurar Firestore:', err);
            // Tenta configurar mesmo sem persistência
            try {
                db.settings({ 
                    merge: true,
                    ignoreUndefinedProperties: true
                });
                __firestoreInitialized = true;
                window.__firestoreInitialized = true;
                window.db = db;
                console.log('✅ Firestore configurado (sem persistência)');
            } catch(e) {
                console.error('❌ Erro crítico ao configurar Firestore:', e);
            }
        });
    } catch (error) {
        console.warn('⚠️ Erro ao configurar Firestore:', error);
    }
    
    return db;
}

// ================================================================
// EXECUTA INICIALIZAÇÃO ASSÍNCRONA
// ================================================================
// Aguarda o próximo tick para não bloquear o carregamento
setTimeout(function() {
    inicializarFirestore();
}, 100);

// ================================================================
// VARIÁVEL GLOBAL DO USUÁRIO ATUAL
// ================================================================
var currentUser = null;

// ================================================================
// 🆕 MONITORAMENTO DE AUTENTICAÇÃO (MELHORADO)
// ================================================================
var authListenerAtivo = false;
var authTimeout = null;
var authResolveCallbacks = [];

function monitorarAutenticacao() {
    if (authListenerAtivo) {
        console.log('⚠️ Monitoramento de autenticação já ativo');
        return;
    }
    
    authListenerAtivo = true;
    console.log('🔐 Iniciando monitoramento de autenticação...');
    
    // Listener principal
    var unsubscribe = auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            window.currentUser = user;
            console.log('✅ Usuário autenticado:', user.email);
            
            // Atualiza elementos da UI
            atualizarElementosUsuario(user);
            
            // Dispara evento de login
            if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('user-logged-in', { 
                    detail: { user: user } 
                }));
            }
            
            // Resolve promessas pendentes
            authResolveCallbacks.forEach(function(cb) { cb(user); });
            authResolveCallbacks = [];
            
        } else {
            currentUser = null;
            window.currentUser = null;
            console.log('🔓 Usuário deslogado');
            
            // Dispara evento de logout
            if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('user-logged-out'));
            }
            
            // Mostra tela de login
            mostrarTelaLogin();
        }
    });
    
    // 🆕 TIMEOUT DE SEGURANÇA (5 segundos)
    authTimeout = setTimeout(function() {
        if (!currentUser) {
            console.log('⏰ Timeout de autenticação - verificando novamente...');
            // Tenta verificar novamente
            var user = auth.currentUser;
            if (user) {
                currentUser = user;
                window.currentUser = user;
                console.log('✅ Usuário recuperado via currentUser:', user.email);
                atualizarElementosUsuario(user);
                
                if (window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('user-logged-in', { 
                        detail: { user: user } 
                    }));
                }
                
                // Resolve promessas pendentes
                authResolveCallbacks.forEach(function(cb) { cb(user); });
                authResolveCallbacks = [];
            } else {
                console.log('⚠️ Nenhum usuário logado após timeout');
                mostrarTelaLogin();
            }
        }
    }, 5000);
    
    // Retorna função para cancelar listener se necessário
    return unsubscribe;
}

// ================================================================
// 🆕 FUNÇÃO PARA MOSTRAR TELA DE LOGIN
// ================================================================
function mostrarTelaLogin() {
    var loginSection = document.getElementById('loginSection');
    if (loginSection) {
        loginSection.style.display = 'flex';
        loginSection.classList.add('show');
    }
    var appContent = document.getElementById('appContent');
    if (appContent) {
        appContent.style.display = 'none';
    }
    var loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
}

// ================================================================
// 🆕 ATUALIZAR ELEMENTOS DA UI COM DADOS DO USUÁRIO
// ================================================================
function atualizarElementosUsuario(user) {
    if (!user) return;
    
    // Atualiza nome do usuário
    var userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = user.displayName || user.email || 'Usuário';
    }
    
    // Atualiza email
    var userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) {
        userEmailEl.textContent = user.email || '';
    }
    
    // Atualiza footer
    var footerUser = document.getElementById('footer-user-name');
    if (footerUser) {
        footerUser.textContent = user.displayName || user.email || 'Usuário';
    }
    
    // Atualiza perfil
    var userLevelEl = document.getElementById('userLevel');
    if (userLevelEl) {
        // Tenta buscar o perfil do usuário
        if (GR.Modules && GR.Modules.Perfis) {
            var perfil = GR.Modules.Perfis.getPerfilUsuario ? GR.Modules.Perfis.getPerfilUsuario() : null;
            if (perfil) {
                userLevelEl.textContent = perfil.nome || 'Usuário';
            }
        }
    }
    
    // Atualiza avatar
    var avatarEl = document.getElementById('user-avatar');
    if (avatarEl) {
        var inicial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
        avatarEl.textContent = inicial;
        avatarEl.style.display = 'flex';
    }
    
    // Mostra conteúdo, esconde login
    var loginSection = document.getElementById('loginSection');
    if (loginSection) {
        loginSection.style.display = 'none';
        loginSection.classList.remove('show');
    }
    var appContent = document.getElementById('appContent');
    if (appContent) {
        appContent.style.display = 'block';
    }
    var loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
}

// ================================================================
// 🆕 FUNÇÃO PARA FORÇAR VERIFICAÇÃO DE AUTENTICAÇÃO
// ================================================================
function verificarAutenticacao() {
    return new Promise(function(resolve) {
        var user = auth.currentUser;
        if (user) {
            currentUser = user;
            window.currentUser = user;
            console.log('✅ Usuário verificado:', user.email);
            resolve(user);
        } else {
            console.log('⏳ Aguardando autenticação...');
            // Adiciona callback para ser chamado quando autenticar
            authResolveCallbacks.push(resolve);
            
            // Timeout de segurança
            setTimeout(function() {
                // Remove callback se não foi resolvido
                var index = authResolveCallbacks.indexOf(resolve);
                if (index > -1) {
                    authResolveCallbacks.splice(index, 1);
                    resolve(null);
                }
            }, 5000);
        }
    });
}

// ================================================================
// 🆕 FUNÇÃO DE LOGIN ANÔNIMO (MODO VISITANTE)
// ================================================================
function loginAnonimo() {
    return auth.signInAnonymously().then(function(result) {
        console.log('👤 Modo visitante ativado');
        return result.user;
    }).catch(function(error) {
        console.error('❌ Erro ao entrar como visitante:', error);
        showToast('Erro ao entrar como visitante', 'error');
        throw error;
    });
}

// ================================================================
// NAMESPACE PRINCIPAL - CRIADO ANTES DE TUDO
// ================================================================
var GR = GR || {};

// Garante que Modules existe
if (!GR.Modules) {
    GR.Modules = {};
    console.log('📦 GR.Modules criado!');
}

// ================================================================
// 🆕 FUNÇÕES DE TOAST MELHORADAS
// ================================================================
function showToast(msg, type) {
    var container = document.getElementById('toastContainer');
    if (!container) {
        console.warn('⚠️ Toast container não encontrado');
        return;
    }
    
    // Remove toasts antigos
    var oldToasts = container.querySelectorAll('.toast');
    if (oldToasts.length > 5) {
        oldToasts[0].remove();
    }
    
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    
    // Ícone conforme tipo
    var icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    var icon = icons[type] || 'ℹ️';
    
    toast.innerHTML = '<span>' + icon + ' ' + msg + '</span>';
    container.appendChild(toast);
    
    // Remove automaticamente após 3 segundos
    setTimeout(function() { 
        if (toast.parentNode) {
            toast.style.opacity = '0';
            setTimeout(function() {
                if (toast.parentNode) toast.remove();
            }, 300);
        }
    }, 3000);
}

// ================================================================
// 🆕 FUNÇÃO DE LOG MELHORADA
// ================================================================
function log(level, message, data) {
    var prefix = '[GR]';
    var timestamp = new Date().toLocaleTimeString();
    var fullMessage = prefix + ' ' + timestamp + ' - ' + message;
    
    switch(level) {
        case 'error':
            console.error(fullMessage, data || '');
            break;
        case 'warn':
            console.warn(fullMessage, data || '');
            break;
        case 'info':
            console.info(fullMessage, data || '');
            break;
        default:
            console.log(fullMessage, data || '');
    }
}

// ================================================================
// 🆕 FUNÇÕES DE LOGIN MELHORADAS
// ================================================================
function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password).then(function(result) {
        console.log('✅ Login realizado com sucesso:', email);
        return result.user;
    }).catch(function(error) {
        console.error('❌ Erro ao fazer login:', error);
        var msg = 'Erro ao fazer login. Verifique suas credenciais.';
        if (error.code === 'auth/user-not-found') {
            msg = 'Usuário não encontrado. Verifique seu e-mail.';
        } else if (error.code === 'auth/wrong-password') {
            msg = 'Senha incorreta. Tente novamente.';
        } else if (error.code === 'auth/too-many-requests') {
            msg = 'Muitas tentativas. Aguarde um momento e tente novamente.';
        }
        showToast(msg, 'error');
        throw error;
    });
}

function register(email, password) {
    return auth.createUserWithEmailAndPassword(email, password).then(function(result) {
        console.log('✅ Cadastro realizado com sucesso:', email);
        showToast('Conta criada com sucesso!', 'success');
        return result.user;
    }).catch(function(error) {
        console.error('❌ Erro ao cadastrar:', error);
        var msg = 'Erro ao criar conta. Tente novamente.';
        if (error.code === 'auth/email-already-in-use') {
            msg = 'E-mail já está em uso. Faça login ou use outro e-mail.';
        } else if (error.code === 'auth/weak-password') {
            msg = 'Senha fraca. Use pelo menos 6 caracteres.';
        }
        showToast(msg, 'error');
        throw error;
    });
}

function logout() {
    return auth.signOut().then(function() {
        console.log('🔓 Logout realizado');
        currentUser = null;
        window.currentUser = null;
        showToast('Logout realizado com sucesso', 'info');
        mostrarTelaLogin();
    }).catch(function(error) {
        console.error('❌ Erro ao fazer logout:', error);
        showToast('Erro ao fazer logout', 'error');
        throw error;
    });
}

// ================================================================
// EXPORTA FUNÇÕES PARA USO GLOBAL
// ================================================================
window.verificarAutenticacao = verificarAutenticacao;
window.monitorarAutenticacao = monitorarAutenticacao;
window.mostrarTelaLogin = mostrarTelaLogin;
window.atualizarElementosUsuario = atualizarElementosUsuario;
window.loginAnonimo = loginAnonimo;
window.login = login;
window.register = register;
window.logout = logout;
window.showToast = showToast;
window.log = log;
window.habilitarPersistence = habilitarPersistence;
window.inicializarFirestore = inicializarFirestore;

// ================================================================
// 🆕 INICIALIZAÇÃO AUTOMÁTICA DO MONITORAMENTO
// ================================================================
// Aguarda o DOM estar pronto antes de iniciar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM carregado, iniciando monitoramento...');
        // Primeiro inicializa Firestore, depois monitora autenticação
        setTimeout(function() {
            inicializarFirestore();
            monitorarAutenticacao();
        }, 50);
    });
} else {
    console.log('📄 DOM já carregado, iniciando monitoramento...');
    setTimeout(function() {
        inicializarFirestore();
        monitorarAutenticacao();
    }, 50);
}

// ================================================================
// STATUS FINAL
// ================================================================
console.log('🔥 Firebase conectado!');
console.log('📁 Projeto:', firebaseConfig.projectId);
console.log('📦 GR.Modules:', Object.keys(GR.Modules).length > 0 ? '✅ criado' : '⚠️ vazio');
console.log('🔐 Monitoramento de autenticação:', authListenerAtivo ? '✅ ativo' : '⏳ iniciando...');
console.log('📌 Melhorias ativas:');
console.log('   - 🔐 Monitoramento de autenticação com timeout');
console.log('   - 🔄 Verificação forçada de autenticação');
console.log('   - 📡 Eventos dispatch (user-logged-in / user-logged-out)');
console.log('   - 🆕 Função log() com timestamp');
console.log('   - 🆕 Toast com ícones e auto-remoção');
console.log('   - 🆕 Prevenção de inicialização duplicada do Firebase');
console.log('   - 🆕 Fallback seguro para erros');
console.log('   - 🆕 Atualização automática da UI ao logar');
console.log('   - 🆕 Persistência offline com sincronização de abas');
console.log('   - 🆕 Controle de inicialização única do Firestore');
console.log('   - 🆕 Login anônimo (modo visitante)');
console.log('   - 🆕 Funções login(), register(), logout()');
console.log('   - 🆕 Promessa de autenticação com timeout');