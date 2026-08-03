// ================================================================
// LOGIN - FIREBASE AUTH
// ================================================================

GR.Login = {
    usuarioAtual: null,
    nivelAtual: null,

    mostrarAba: function(aba) {
        document.querySelectorAll('.login-tabs button').forEach(function(b) { b.classList.remove('active'); });
        if (aba === 'login') {
            document.querySelector('.login-tabs button:first-child').classList.add('active');
            document.getElementById('loginPanel').style.display = 'block';
            document.getElementById('registerPanel').style.display = 'none';
        } else {
            document.querySelector('.login-tabs button:last-child').classList.add('active');
            document.getElementById('loginPanel').style.display = 'none';
            document.getElementById('registerPanel').style.display = 'block';
        }
    },

    fazerLogin: function() {
        var email = document.getElementById('loginEmail').value.trim();
        var senha = document.getElementById('loginPassword').value;
        if (!email || !senha) {
            document.getElementById('loginError').textContent = 'Preencha todos os campos.';
            document.getElementById('loginError').style.display = 'block';
            return;
        }
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('loginLoading').style.display = 'block';
        document.getElementById('loginBtn').disabled = true;

        auth.signInWithEmailAndPassword(email, senha)
            .then(function(userCredential) {
                GR.Login.usuarioAtual = userCredential.user.email;
                GR.Login.nivelAtual = 'usuario';
                localStorage.setItem('gr_usuario_logado', GR.Login.usuarioAtual);
                localStorage.setItem('gr_nivel_logado', 'usuario');
                
                // ============================================================
                // 🆕 CARREGA O PERFIL DO USUÁRIO APÓS O LOGIN
                // ============================================================
                var user = userCredential.user;
                return GR.Login._carregarPerfilUsuario(user.uid);
            })
            .then(function() {
                GR.Login._entrarNoSistema();
                document.getElementById('loginLoading').style.display = 'none';
                document.getElementById('loginBtn').disabled = false;
            })
            .catch(function(error) {
                document.getElementById('loginError').textContent = error.message;
                document.getElementById('loginError').style.display = 'block';
                document.getElementById('loginLoading').style.display = 'none';
                document.getElementById('loginBtn').disabled = false;
            });
    },

    cadastrar: function() {
        var email = document.getElementById('registerEmail').value.trim();
        var senha = document.getElementById('registerPassword').value;
        if (!email || !senha) {
            document.getElementById('registerError').textContent = 'Preencha todos os campos.';
            document.getElementById('registerError').style.display = 'block';
            return;
        }
        if (senha.length < 6) {
            document.getElementById('registerError').textContent = 'A senha deve ter no mínimo 6 caracteres.';
            document.getElementById('registerError').style.display = 'block';
            return;
        }
        document.getElementById('registerError').style.display = 'none';
        document.getElementById('registerLoading').style.display = 'block';
        document.getElementById('registerBtn').disabled = true;

        auth.createUserWithEmailAndPassword(email, senha)
            .then(function(userCredential) {
                var user = userCredential.user;
                var nome = prompt('📝 Digite seu nome completo:', user.email.split('@')[0]);
                
                // ============================================================
                // 🆕 SALVA O PERFIL DO USUÁRIO NO CADASTRO
                // ============================================================
                return db.collection('users').doc(user.uid).set({
                    email: user.email,
                    nome: nome || user.email,
                    perfil: 'operador',  // Perfil padrão para novos usuários
                    criadoEm: new Date().toISOString()
                }).then(function() {
                    return userCredential;
                });
            })
            .then(function(userCredential) {
                GR.Login.usuarioAtual = userCredential.user.email;
                GR.Login.nivelAtual = 'usuario';
                localStorage.setItem('gr_usuario_logado', GR.Login.usuarioAtual);
                localStorage.setItem('gr_nivel_logado', 'usuario');
                
                // ============================================================
                // 🆕 CARREGA O PERFIL DO USUÁRIO APÓS O CADASTRO
                // ============================================================
                var user = userCredential.user;
                return GR.Login._carregarPerfilUsuario(user.uid);
            })
            .then(function() {
                GR.Login._entrarNoSistema();
                document.getElementById('registerLoading').style.display = 'none';
                document.getElementById('registerBtn').disabled = false;
            })
            .catch(function(error) {
                document.getElementById('registerError').textContent = error.message;
                document.getElementById('registerError').style.display = 'block';
                document.getElementById('registerLoading').style.display = 'none';
                document.getElementById('registerBtn').disabled = false;
            });
    },

    // ================================================================
    // 🆕 CARREGAR PERFIL DO USUÁRIO DO FIREBASE
    // ================================================================
    _carregarPerfilUsuario: function(uid) {
        return db.collection('users').doc(uid).get()
            .then(function(doc) {
                if (doc.exists) {
                    var userData = doc.data();
                    var perfilId = userData.perfil || 'operador';
                    
                    // Armazena o perfil no State
                    if (GR.State && GR.State.data) {
                        GR.State.data.perfilUsuario = perfilId;
                        GR.State.data.usuario = {
                            nome: userData.nome || userData.email,
                            email: userData.email,
                            perfil: perfilId
                        };
                    }
                    
                    console.log('👤 Perfil do usuário carregado:', perfilId);
                    
                    // Se o módulo de perfis já estiver carregado, atualiza
                    if (GR.Modules.Perfis) {
                        return GR.Modules.Perfis._carregarPerfilUsuario(uid);
                    }
                } else {
                    // Usuário sem perfil, cria um padrão
                    return db.collection('users').doc(uid).set({
                        email: firebase.auth().currentUser.email,
                        nome: firebase.auth().currentUser.email,
                        perfil: 'operador',
                        criadoEm: new Date().toISOString()
                    });
                }
                return Promise.resolve();
            })
            .catch(function(err) {
                console.warn('⚠️ Erro ao carregar perfil:', err);
                return Promise.resolve();
            });
    },

    _entrarNoSistema: function() {
        document.getElementById('loginSection').classList.remove('show');
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('appContent').style.display = 'block';
        document.getElementById('userName').textContent = this.usuarioAtual;

        var nivelEl = document.getElementById('userLevel');
        if (nivelEl) {
            // ============================================================
            // 🆕 MOSTRA O PERFIL DO USUÁRIO NO HEADER
            // ============================================================
            var perfilAtual = GR.Modules.Perfis ? GR.Modules.Perfis.perfilAtual : null;
            var label = '👤 Usuário';
            if (perfilAtual) {
                label = perfilAtual.nome;
            } else if (this.nivelAtual === 'master') {
                label = '👑 Master';
            } else if (this.nivelAtual === 'administrador') {
                label = '🔑 Admin';
            } else {
                label = '👤 Usuário';
            }
            nivelEl.textContent = label;
            var menuUserLevel = document.getElementById('menuUserLevel');
            if (menuUserLevel) menuUserLevel.textContent = label;
        }

        GR.Toast.success('Bem-vindo, ' + this.usuarioAtual + '!');
        
        // ============================================================
        // 🆕 INICIALIZA PERFIS E FILTRA MENU
        // ============================================================
        if (GR.Modules.Perfis) {
            GR.Modules.Perfis.init();
            setTimeout(function() {
                GR.Modules.Perfis.filtrarMenu();
            }, 500);
        }
        
        // Se já estiver logado, carregar dados e iniciar UI
        if (currentUser && currentUser.uid) {
            GR.State.carregarDados().then(function() {
                if (typeof GR.UI !== 'undefined') {
                    if (typeof GR.UI.init === 'function') {
                        GR.UI.init();
                    } else if (typeof GR.UI.mudarView === 'function') {
                        GR.UI.mudarView('dashboard');
                    }
                    if (typeof GR.UI.atualizarPropTabs === 'function') {
                        GR.UI.atualizarPropTabs();
                    }
                    if (typeof GR.UI.atualizarBadgeNotificacoes === 'function') {
                        GR.UI.atualizarBadgeNotificacoes();
                    }
                }
            });
        } else {
            // Aguardar autenticação
            setTimeout(function() {
                if (currentUser && currentUser.uid) {
                    GR.State.carregarDados().then(function() {
                        if (typeof GR.UI !== 'undefined') {
                            if (typeof GR.UI.init === 'function') {
                                GR.UI.init();
                            }
                        }
                    });
                }
            }, 500);
        }
    },

    logout: function() {
        auth.signOut().then(function() {
            GR.Login.usuarioAtual = null;
            GR.Login.nivelAtual = null;
            localStorage.removeItem('gr_usuario_logado');
            localStorage.removeItem('gr_nivel_logado');
            
            // ============================================================
            // 🆕 LIMPA O PERFIL ATUAL
            // ============================================================
            if (GR.Modules.Perfis) {
                GR.Modules.Perfis.perfilAtual = null;
            }
            
            document.getElementById('appContent').style.display = 'none';
            document.getElementById('loginSection').style.display = 'flex';
            document.getElementById('loginSection').classList.add('show');
            document.getElementById('loginPassword').value = '';
            document.getElementById('loginEmail').focus();
            GR.Toast.info('Desconectado!');
        });
    },

    init: function() {
        document.getElementById('loginBtn').onclick = function() { GR.Login.fazerLogin(); };
        document.getElementById('registerBtn').onclick = function() { GR.Login.cadastrar(); };
        document.getElementById('loginPassword').onkeydown = function(e) { if (e.key === 'Enter') GR.Login.fazerLogin(); };
        document.getElementById('registerPassword').onkeydown = function(e) { if (e.key === 'Enter') GR.Login.cadastrar(); };
        document.getElementById('toggleToRegister').onclick = function() { GR.Login.mostrarAba('cadastro'); };
        document.getElementById('toggleToLogin').onclick = function() { GR.Login.mostrarAba('login'); };
        document.getElementById('tabLoginBtn').onclick = function() { GR.Login.mostrarAba('login'); };
        document.getElementById('tabRegisterBtn').onclick = function() { GR.Login.mostrarAba('cadastro'); };
    }
};

console.log('✅ GR.Login carregado com melhorias!');
console.log('📌 Melhorias ativas:');
console.log('   - 🆕 Carregamento automático do perfil ao logar');
console.log('   - 🆕 Salvamento do perfil ao cadastrar');
console.log('   - 🆕 Integração com sistema de perfis');
console.log('   - 🆕 Filtro de menu baseado no perfil');