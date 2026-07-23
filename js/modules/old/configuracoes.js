// ================================================================
// MÓDULO: CONFIGURAÇÕES - VERSÃO COMPLETA
// ================================================================

GR.Modules.Configuracoes = {
    render: function() {
        var div = document.getElementById('configuracoes-content');
        if (!div) return;

        var user = GR.State.data.usuario || {};
        var propriedades = GR.State.data.propriedades || [];
        var usuarios = GR.State.data.usuarios || [];

        // Carregar tema salvo
        var theme = localStorage.getItem('gr_theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);

        var html = '<div style="max-width:800px;margin:0 auto;padding:10px;">' +
            '<h3 style="font-size:18px;margin-bottom:15px;">⚙️ Configurações</h3>';

        // ===== PERFIL =====
        html += this._renderPerfil(user);

        // ===== SEGURANÇA =====
        html += this._renderSeguranca();

        // ===== PROPRIEDADES =====
        html += this._renderPropriedades(propriedades);

        // ===== CADASTROS =====
        html += this._renderCadastros();

        // ===== SINCRONIZAÇÃO =====
        html += this._renderSincronizacao();

        // ===== TEMA =====
        html += this._renderTema();

        // ===== SISTEMA =====
        html += this._renderSistema(user, propriedades);

        // ===== ZONA DE RISCO =====
        html += this._renderZonaRisco();

        html += '</div>';
        div.innerHTML = html;

        // Inicializar eventos
        this._atualizarRelogio();
        setInterval(function() {
            GR.Modules.Configuracoes._atualizarRelogio();
        }, 1000);

        // Aplicar tema atual
        this.tema(theme);
    },

    // ================================================================
    // RENDERIZAÇÃO DAS SEÇÕES
    // ================================================================

    _renderPerfil: function(user) {
        return '<div class="card" style="padding:16px;margin-top:10px;border-radius:8px;background:var(--card-bg);border:1px solid var(--border);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">👤 Perfil do Usuário</h4>' +
            '<div style="display:grid;gap:10px;">' +
            '<div><label style="font-size:12px;color:var(--text-light);">Nome</label><input type="text" id="config-nome" value="' + GR.Utils.escapeHtml(user.nome || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">E-mail</label><input type="email" id="config-email" value="' + GR.Utils.escapeHtml(user.email || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);" disabled></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">Telefone</label><input type="text" id="config-telefone" value="' + GR.Utils.escapeHtml(user.telefone || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">CPF/CNPJ</label><input type="text" id="config-documento" value="' + GR.Utils.escapeHtml(user.documento || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);" placeholder="Ex: 123.456.789-00"></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">Endereço</label><input type="text" id="config-endereco" value="' + GR.Utils.escapeHtml(user.endereco || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">Cidade/UF</label><input type="text" id="config-cidade" value="' + GR.Utils.escapeHtml(user.cidade || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<div>' +
            '<label style="font-size:12px;color:var(--text-light);">Foto de Perfil</label>' +
            '<div class="file-upload" onclick="document.getElementById(\'config-foto\').click()" style="padding:10px;text-align:center;border:2px dashed var(--border);border-radius:8px;cursor:pointer;background:var(--bg-light);">' +
            '<span>📷 Clique para selecionar uma foto</span>' +
            '<input type="file" id="config-foto" accept="image/*" style="display:none" onchange="GR.Modules.Configuracoes.uploadFoto(this)">' +
            '</div>' +
            '</div>' +
            '<button class="btn btn-primary" onclick="GR.Modules.Configuracoes.salvarPerfil()" style="padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">💾 Salvar Perfil</button>' +
            '</div></div>';
    },

    _renderSeguranca: function() {
        return '<div class="card" style="padding:16px;margin-top:10px;border-radius:8px;background:var(--card-bg);border:1px solid var(--border);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">🔐 Segurança</h4>' +
            '<div style="display:grid;gap:10px;">' +
            '<div><label style="font-size:12px;color:var(--text-light);">Senha Atual</label><input type="password" id="config-senha-atual" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">Nova Senha</label><input type="password" id="config-senha-nova" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">Confirmar Nova Senha</label><input type="password" id="config-senha-confirm" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<button class="btn btn-warning" onclick="GR.Modules.Configuracoes.alterarSenha()" style="padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">🔑 Alterar Senha</button>' +
            '</div></div>';
    },

    _renderPropriedades: function(propriedades) {
        var html = '<div class="card" style="padding:16px;margin-top:10px;border-radius:8px;background:var(--card-bg);border:2px solid #4CAF50;">' +
            '<h4 style="font-size:14px;margin-bottom:12px;color:#2E7D32;">🏠 Propriedades</h4>' +
            '<div style="margin-bottom:10px;">' +
            '<div style="font-size:12px;color:var(--text-light);margin-bottom:6px;">📋 <strong>Propriedades cadastradas:</strong> ' + (propriedades ? propriedades.length : 0) + '</div>' +
            '<div id="lista-propriedades-config" style="max-height:250px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;">';

        if (propriedades && propriedades.length) {
            propriedades.forEach(function(p) {
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border);background:var(--bg-light);">' +
                    '<div style="flex:1;">' +
                    '<strong>' + GR.Utils.escapeHtml(p.nome) + '</strong>' +
                    (p.localizacao ? ' <span style="font-size:11px;color:var(--text-light);">📍 ' + GR.Utils.escapeHtml(p.localizacao) + '</span>' : '') +
                    (p.area && p.area !== '0' ? ' <span style="font-size:11px;color:var(--text-light);">📐 ' + GR.Utils.escapeHtml(p.area) + ' ha</span>' : '') +
                    (p.tipo && p.tipo !== 'Não definido' ? ' <span style="font-size:11px;color:var(--text-light);">🏷️ ' + GR.Utils.escapeHtml(p.tipo) + '</span>' : '') +
                    (p.status && p.status !== 'Ativa' ? ' <span style="font-size:11px;color:var(--text-light);">📌 ' + GR.Utils.escapeHtml(p.status) + '</span>' : '') +
                    '</div>' +
                    '<div style="display:flex;gap:4px;">' +
                    '<button class="btn btn-info btn-sm" onclick="GR.Modules.Configuracoes.editarPropriedade(\'' + p.id + '\')" style="padding:4px 8px;border:none;border-radius:4px;cursor:pointer;">✏️</button> ' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Configuracoes.excluirPropriedade(\'' + p.id + '\')" style="padding:4px 8px;border:none;border-radius:4px;cursor:pointer;">🗑️</button>' +
                    '</div>' +
                    '</div>';
            });
        } else {
            html += '<div style="color:#999;padding:20px;text-align:center;">🏠 Nenhuma propriedade cadastrada<br><span style="font-size:12px;">Clique em "Adicionar Propriedade" abaixo para começar</span></div>';
        }

        html += '</div></div>' +

            // Formulário de cadastro de propriedade
            '<div style="background:#e8f5e9;padding:15px;border-radius:8px;margin-top:10px;border:1px solid #a5d6a7;">' +
            '<div style="font-size:13px;color:#2E7D32;margin-bottom:10px;">📝 <strong>Nova Propriedade</strong></div>' +
            '<div style="display:grid;gap:8px;">' +
            '<input type="text" id="config-nova-propriedade" class="form-control" placeholder="* Nome da propriedade (obrigatório)" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);">' +
            '<div style="display:flex;gap:8px;">' +
            '<input type="text" id="config-propriedade-localizacao" class="form-control" placeholder="📍 Localização" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);">' +
            '<input type="number" id="config-propriedade-area" class="form-control" placeholder="📐 Área (ha)" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);">' +
            '</div>' +
            '<div style="display:flex;gap:8px;">' +
            '<select id="config-propriedade-tipo" class="form-control" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);">' +
            '<option value="">🏷️ Tipo de propriedade</option>' +
            '<option value="Agricultura">🌾 Agricultura</option>' +
            '<option value="Pecuária">🐄 Pecuária</option>' +
            '<option value="Mista">🌾🐄 Mista</option>' +
            '<option value="Floresta">🌳 Floresta</option>' +
            '<option value="Viveiro">🌱 Viveiro</option>' +
            '<option value="Aquicultura">🐟 Aquicultura</option>' +
            '<option value="Outro">📌 Outro</option>' +
            '</select>' +
            '<select id="config-propriedade-status" class="form-control" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);">' +
            '<option value="Ativa">✅ Ativa</option>' +
            '<option value="Inativa">⛔ Inativa</option>' +
            '<option value="Em desenvolvimento">🚧 Em desenvolvimento</option>' +
            '</select>' +
            '</div>' +
            '<textarea id="config-propriedade-observacao" class="form-control" placeholder="📝 Observações sobre a propriedade" style="width:100%;height:60px;resize:vertical;padding:8px;border-radius:6px;border:1px solid var(--border);"></textarea>' +
            '<button class="btn btn-success" onclick="GR.Modules.Configuracoes.adicionarPropriedade()" style="padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px;">➕ Adicionar Propriedade</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        return html;
    },

    _renderCadastros: function() {
        var cadastros = [
            { id: 'insumos', nome: '🧪 Insumos' },
            { id: 'funcionarios', nome: '👨‍🌾 Funcionários' },
            { id: 'animais', nome: '🐄 Animais' },
            { id: 'parceiros', nome: '🤝 Parceiros' },
            { id: 'contratos', nome: '📄 Contratos' },
            { id: 'orcamentos', nome: '💰 Orçamentos' },
            { id: 'fornecedores', nome: '🚚 Fornecedores' },
            { id: 'clientes', nome: '👥 Clientes' },
            { id: 'categorias', nome: '📂 Categorias' }
        ];

        var html = '<div class="card" style="padding:16px;margin-top:10px;border-radius:8px;background:var(--card-bg);border:1px solid var(--border);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">📋 Cadastros</h4>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">';

        cadastros.forEach(function(c) {
            var count = 0;
            if (GR.State.data[c.id]) {
                count = Array.isArray(GR.State.data[c.id]) ? GR.State.data[c.id].length : 0;
            }
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--bg-light);border-radius:6px;">' +
                '<span style="font-size:13px;">' + c.nome + '</span>' +
                '<span style="font-size:12px;color:var(--text-light);">' + count + ' itens</span>' +
                '</div>';
        });

        html += '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button class="btn btn-success btn-sm" onclick="GR.Modules.Configuracoes.gerenciarCadastro(\'insumos\')">🧪 Insumos</button>' +
            '<button class="btn btn-success btn-sm" onclick="GR.Modules.Configuracoes.gerenciarCadastro(\'funcionarios\')">👨‍🌾 Funcionários</button>' +
            '<button class="btn btn-success btn-sm" onclick="GR.Modules.Configuracoes.gerenciarCadastro(\'animais\')">🐄 Animais</button>' +
            '<button class="btn btn-success btn-sm" onclick="GR.Modules.Configuracoes.gerenciarCadastro(\'parceiros\')">🤝 Parceiros</button>' +
            '<button class="btn btn-success btn-sm" onclick="GR.Modules.Configuracoes.gerenciarCadastro(\'contratos\')">📄 Contratos</button>' +
            '<button class="btn btn-success btn-sm" onclick="GR.Modules.Configuracoes.gerenciarCadastro(\'orcamentos\')">💰 Orçamentos</button>' +
            '<button class="btn btn-success btn-sm" onclick="GR.Modules.Configuracoes.gerenciarCadastro(\'fornecedores\')">🚚 Fornecedores</button>' +
            '<button class="btn btn-success btn-sm" onclick="GR.Modules.Configuracoes.gerenciarCadastro(\'clientes\')">👥 Clientes</button>' +
            '<button class="btn btn-success btn-sm" onclick="GR.Modules.Configuracoes.gerenciarCadastro(\'categorias\')">📂 Categorias</button>' +
            '</div>' +
            '</div>';

        return html;
    },

    _renderSincronizacao: function() {
        return '<div class="card" style="padding:16px;margin-top:10px;border-radius:8px;background:var(--card-bg);border:1px solid var(--border);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">📱 Sincronização</h4>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" onclick="GR.Modules.Configuracoes.sincronizar()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">🔄 Sincronizar Agora</button>' +
            '<button class="btn btn-info" onclick="GR.Modules.Configuracoes.exportarDados()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">📤 Exportar Dados</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modules.Configuracoes.importarDados()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">📥 Importar Dados</button>' +
            '<button class="btn btn-danger" onclick="GR.Modules.Configuracoes.limparCache()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">🗑️ Limpar Cache</button>' +
            '</div></div>';
    },

    _renderTema: function() {
        var currentTheme = localStorage.getItem('gr_theme') || 'light';
        
        return '<div class="card" style="padding:16px;margin-top:10px;border-radius:8px;background:var(--card-bg);border:1px solid var(--border);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">🎨 Tema</h4>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" onclick="GR.Modules.Configuracoes.tema(\'light\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;' + (currentTheme === 'light' ? 'border:2px solid #000;' : '') + '">☀️ Claro</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modules.Configuracoes.tema(\'dark\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;' + (currentTheme === 'dark' ? 'border:2px solid #000;' : '') + '">🌙 Escuro</button>' +
            '<button class="btn btn-info" onclick="GR.Modules.Configuracoes.tema(\'azul\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;' + (currentTheme === 'azul' ? 'border:2px solid #000;' : '') + '">🔵 Azul</button>' +
            '<button class="btn btn-success" onclick="GR.Modules.Configuracoes.tema(\'verde\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;' + (currentTheme === 'verde' ? 'border:2px solid #000;' : '') + '">🟢 Verde</button>' +
            '<button class="btn btn-warning" onclick="GR.Modules.Configuracoes.tema(\'laranja\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;' + (currentTheme === 'laranja' ? 'border:2px solid #000;' : '') + '">🟠 Laranja</button>' +
            '<button class="btn btn-danger" onclick="GR.Modules.Configuracoes.tema(\'roxo\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;' + (currentTheme === 'roxo' ? 'border:2px solid #000;' : '') + '">🟣 Roxo</button>' +
            '</div></div>';
    },

    _renderSistema: function(user, propriedades) {
        return '<div class="card" style="padding:16px;margin-top:10px;border-radius:8px;background:#f5f5f5;border:1px solid #ddd;">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">ℹ️ Sistema</h4>' +
            '<div style="font-size:13px;color:var(--text-light);display:grid;gap:4px;">' +
            '<div><strong>Versão:</strong> 3.1</div>' +
            '<div><strong>Usuário:</strong> ' + GR.Utils.escapeHtml(user.email || 'Não logado') + '</div>' +
            '<div><strong>Perfil:</strong> ' + GR.Utils.escapeHtml(user.perfil || 'Master') + '</div>' +
            '<div><strong>Total de Propriedades:</strong> ' + (propriedades ? propriedades.length : 0) + '</div>' +
            '<div><strong>Total de Cadastros:</strong> ' + this._contarCadastros() + '</div>' +
            '<div><strong>Data/Hora:</strong> <span id="sistema-data-hora"></span></div>' +
            '</div></div>';
    },

    _renderZonaRisco: function() {
        return '<div class="card" style="padding:16px;margin-top:10px;border-radius:8px;background:#fff3e0;border:2px solid #ff9800;">' +
            '<h4 style="font-size:14px;color:#e65100;margin-bottom:12px;">⚠️ Zona de Risco</h4>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="btn btn-danger" onclick="GR.Modules.Configuracoes.redefinirDados()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">🗑️ Redefinir Todos os Dados</button>' +
            '<button class="btn btn-danger" onclick="GR.Modules.Configuracoes.excluirConta()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">❌ Excluir Conta</button>' +
            '</div></div>';
    },

    // ================================================================
    // UTILITÁRIOS
    // ================================================================

    _contarCadastros: function() {
        var tipos = ['insumos', 'funcionarios', 'animais', 'parceiros', 
                     'contratos', 'orcamentos', 'fornecedores', 'clientes', 'categorias'];
        var total = 0;
        tipos.forEach(function(t) {
            if (GR.State.data[t]) {
                total += Array.isArray(GR.State.data[t]) ? GR.State.data[t].length : 0;
            }
        });
        return total;
    },

    _atualizarRelogio: function() {
        var el = document.getElementById('sistema-data-hora');
        if (el) {
            el.textContent = new Date().toLocaleString('pt-BR');
        }
    },

    // ================================================================
    // PERFIL
    // ================================================================

    salvarPerfil: function() {
        var nome = document.getElementById('config-nome').value.trim();
        var telefone = document.getElementById('config-telefone').value.trim();
        var documento = document.getElementById('config-documento').value.trim();
        var endereco = document.getElementById('config-endereco').value.trim();
        var cidade = document.getElementById('config-cidade').value.trim();
        
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
        db.collection('users').doc(uid).update({
            nome: nome,
            telefone: telefone,
            documento: documento,
            endereco: endereco,
            cidade: cidade,
            updatedAt: GR.Utils.now()
        }).then(function() {
            GR.Toast.success('Perfil atualizado!');
            GR.State.data.usuario.nome = nome;
            GR.State.data.usuario.telefone = telefone;
            GR.State.data.usuario.documento = documento;
            GR.State.data.usuario.endereco = endereco;
            GR.State.data.usuario.cidade = cidade;
            GR.UI.updateUserInfo();
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro ao atualizar: ' + err.message);
        });
    },

    uploadFoto: function(input) {
        if (!input.files || !input.files[0]) return;
        var file = input.files[0];
        var user = firebase.auth().currentUser;
        if (!user) return;

        var uid = user.uid;
        var filePath = 'fotos/' + uid + '/perfil_' + Date.now() + '.jpg';
        
        GR.Toast.info('📤 Enviando foto...');
        
        storage.ref(filePath).put(file).then(function(snapshot) {
            return snapshot.ref.getDownloadURL();
        }).then(function(url) {
            return db.collection('users').doc(uid).update({ fotoUrl: url });
        }).then(function() {
            GR.Toast.success('Foto atualizada!');
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro ao enviar foto: ' + err.message);
        });
    },

    // ================================================================
    // SEGURANÇA
    // ================================================================

    alterarSenha: function() {
        var senhaAtual = document.getElementById('config-senha-atual').value;
        var senhaNova = document.getElementById('config-senha-nova').value;
        var senhaConfirm = document.getElementById('config-senha-confirm').value;

        if (!senhaAtual || !senhaNova || !senhaConfirm) {
            GR.Toast.error('Preencha todos os campos de senha!');
            return;
        }
        if (senhaNova.length < 6) {
            GR.Toast.error('Nova senha deve ter pelo menos 6 caracteres!');
            return;
        }
        if (senhaNova !== senhaConfirm) {
            GR.Toast.error('As senhas não coincidem!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var cred = firebase.auth.EmailAuthProvider.credential(user.email, senhaAtual);
        user.reauthenticateWithCredential(cred).then(function() {
            return user.updatePassword(senhaNova);
        }).then(function() {
            GR.Toast.success('Senha alterada com sucesso!');
            document.getElementById('config-senha-atual').value = '';
            document.getElementById('config-senha-nova').value = '';
            document.getElementById('config-senha-confirm').value = '';
        }).catch(function(err) {
            GR.Toast.error('Erro ao alterar senha: ' + err.message);
        });
    },

    // ================================================================
    // PROPRIEDADES
    // ================================================================

    adicionarPropriedade: function() {
        var nome = document.getElementById('config-nova-propriedade').value.trim();
        var localizacao = document.getElementById('config-propriedade-localizacao').value.trim();
        var area = document.getElementById('config-propriedade-area').value.trim();
        var tipo = document.getElementById('config-propriedade-tipo').value;
        var status = document.getElementById('config-propriedade-status').value;
        var observacao = document.getElementById('config-propriedade-observacao').value.trim();

        if (!nome) {
            GR.Toast.error('⚠️ Nome da propriedade é obrigatório!');
            document.getElementById('config-nova-propriedade').focus();
            document.getElementById('config-nova-propriedade').style.borderColor = '#ff4444';
            setTimeout(function() {
                document.getElementById('config-nova-propriedade').style.borderColor = '';
            }, 3000);
            return;
        }

        // Verificar duplicidade
        var propriedadesExistentes = GR.State.data.propriedades || [];
        var duplicado = propriedadesExistentes.some(function(p) {
            return p.nome && p.nome.toLowerCase() === nome.toLowerCase();
        });

        if (duplicado) {
            GR.Toast.error('⚠️ Já existe uma propriedade com este nome!');
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
            localizacao: GR.Utils.escapeHtml(localizacao) || '',
            area: area ? parseFloat(area) : 0,
            tipo: tipo || 'Não definido',
            status: status || 'Ativa',
            observacao: GR.Utils.escapeHtml(observacao) || '',
            dataCriacao: GR.Utils.now(),
            dataAtualizacao: GR.Utils.now()
        };

        // Mostrar loading
        var btn = document.querySelector('[onclick="GR.Modules.Configuracoes.adicionarPropriedade()"]');
        var originalText = btn ? btn.textContent : '';
        if (btn) {
            btn.textContent = '⏳ Salvando...';
            btn.disabled = true;
        }

        db.collection('users').doc(uid).collection('propriedades').add(dados)
            .then(function() {
                GR.Toast.success('✅ Propriedade "' + nome + '" adicionada com sucesso!');
                
                // Limpar campos
                document.getElementById('config-nova-propriedade').value = '';
                document.getElementById('config-propriedade-localizacao').value = '';
                document.getElementById('config-propriedade-area').value = '';
                document.getElementById('config-propriedade-tipo').value = '';
                document.getElementById('config-propriedade-status').value = 'Ativa';
                document.getElementById('config-propriedade-observacao').value = '';
                
                GR.State.carregarDados().then(function() {
                    GR.UI.atualizarPropTabs();
                    GR.UI.refreshCurrentView();
                });
            })
            .catch(function(err) {
                GR.Toast.error('❌ Erro ao adicionar: ' + err.message);
            })
            .finally(function() {
                if (btn) {
                    btn.textContent = originalText || '➕ Adicionar Propriedade';
                    btn.disabled = false;
                }
            });
    },

    editarPropriedade: function(id) {
        var propriedade = GR.State.data.propriedades.find(function(p) { return p.id === id; });
        if (!propriedade) {
            GR.Toast.error('Propriedade não encontrada!');
            return;
        }

        var modalHtml = 
            '<div id="modal-editar-propriedade" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">' +
            '<div style="background:#fff;border-radius:12px;padding:24px;max-width:500px;width:90%;max-height:90vh;overflow-y:auto;">' +
            '<h4 style="margin-top:0;">✏️ Editar Propriedade</h4>' +
            '<div style="display:grid;gap:8px;">' +
            '<div><label>Nome *</label><input type="text" id="edit-prop-nome" class="form-control" value="' + GR.Utils.escapeHtml(propriedade.nome || '') + '" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;"></div>' +
            '<div><label>Localização</label><input type="text" id="edit-prop-localizacao" class="form-control" value="' + GR.Utils.escapeHtml(propriedade.localizacao || '') + '" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;"></div>' +
            '<div style="display:flex;gap:8px;">' +
            '<div style="flex:1;"><label>Área (ha)</label><input type="number" id="edit-prop-area" class="form-control" value="' + (propriedade.area || 0) + '" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;"></div>' +
            '<div style="flex:1;"><label>Tipo</label>' +
            '<select id="edit-prop-tipo" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;">' +
            '<option value="Agricultura"' + (propriedade.tipo === 'Agricultura' ? ' selected' : '') + '>🌾 Agricultura</option>' +
            '<option value="Pecuária"' + (propriedade.tipo === 'Pecuária' ? ' selected' : '') + '>🐄 Pecuária</option>' +
            '<option value="Mista"' + (propriedade.tipo === 'Mista' ? ' selected' : '') + '>🌾🐄 Mista</option>' +
            '<option value="Floresta"' + (propriedade.tipo === 'Floresta' ? ' selected' : '') + '>🌳 Floresta</option>' +
            '<option value="Viveiro"' + (propriedade.tipo === 'Viveiro' ? ' selected' : '') + '>🌱 Viveiro</option>' +
            '<option value="Aquicultura"' + (propriedade.tipo === 'Aquicultura' ? ' selected' : '') + '>🐟 Aquicultura</option>' +
            '<option value="Outro"' + (propriedade.tipo === 'Outro' ? ' selected' : '') + '>📌 Outro</option>' +
            '</select></div>' +
            '</div>' +
            '<div><label>Status</label>' +
            '<select id="edit-prop-status" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;">' +
            '<option value="Ativa"' + (propriedade.status === 'Ativa' ? ' selected' : '') + '>✅ Ativa</option>' +
            '<option value="Inativa"' + (propriedade.status === 'Inativa' ? ' selected' : '') + '>⛔ Inativa</option>' +
            '<option value="Em desenvolvimento"' + (propriedade.status === 'Em desenvolvimento' ? ' selected' : '') + '>🚧 Em desenvolvimento</option>' +
            '</select></div>' +
            '<div><label>Observações</label><textarea id="edit-prop-observacao" class="form-control" style="width:100%;height:60px;resize:vertical;padding:8px;border-radius:6px;border:1px solid #ddd;">' + GR.Utils.escapeHtml(propriedade.observacao || '') + '</textarea></div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;margin-top:12px;">' +
            '<button class="btn btn-success" onclick="GR.Modules.Configuracoes._salvarEdicaoPropriedade(\'' + id + '\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">💾 Salvar</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modules.Configuracoes._fecharModalEdicao()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">❌ Cancelar</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        var existing = document.getElementById('modal-editar-propriedade');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    _salvarEdicaoPropriedade: function(id) {
        var nome = document.getElementById('edit-prop-nome').value.trim();
        var localizacao = document.getElementById('edit-prop-localizacao').value.trim();
        var area = document.getElementById('edit-prop-area').value.trim();
        var tipo = document.getElementById('edit-prop-tipo').value;
        var status = document.getElementById('edit-prop-status').value;
        var observacao = document.getElementById('edit-prop-observacao').value.trim();

        if (!nome) {
            GR.Toast.error('Nome é obrigatório!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) return;

        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            localizacao: GR.Utils.escapeHtml(localizacao),
            area: area ? parseFloat(area) : 0,
            tipo: tipo || 'Não definido',
            status: status || 'Ativa',
            observacao: GR.Utils.escapeHtml(observacao),
            dataAtualizacao: GR.Utils.now()
        };

        db.collection('users').doc(user.uid).collection('propriedades').doc(id).update(dados)
            .then(function() {
                GR.Toast.success('✅ Propriedade atualizada!');
                GR.Modules.Configuracoes._fecharModalEdicao();
                GR.State.carregarDados().then(function() {
                    GR.UI.atualizarPropTabs();
                    GR.UI.refreshCurrentView();
                });
            })
            .catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
    },

    _fecharModalEdicao: function() {
        var modal = document.getElementById('modal-editar-propriedade');
        if (modal) modal.remove();
    },

    excluirPropriedade: function(id) {
        var propriedade = GR.State.data.propriedades.find(function(p) { return p.id === id; });
        var nome = propriedade ? propriedade.nome : 'esta propriedade';

        var confirmHtml = 
            '<div id="modal-confirmar-exclusao" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">' +
            '<div style="background:#fff;border-radius:12px;padding:24px;max-width:400px;width:90%;">' +
            '<div style="text-align:center;">' +
            '<div style="font-size:48px;">⚠️</div>' +
            '<h4 style="margin:8px 0;">Confirmar Exclusão</h4>' +
            '<p style="color:#666;margin:8px 0;">Deseja realmente excluir a propriedade <strong>"' + GR.Utils.escapeHtml(nome) + '"</strong>?</p>' +
            '<p style="font-size:12px;color:#999;">Esta ação não pode ser desfeita.</p>' +
            '<div style="display:flex;gap:8px;margin-top:16px;">' +
            '<button class="btn btn-danger" onclick="GR.Modules.Configuracoes._confirmarExclusaoPropriedade(\'' + id + '\')" style="flex:1;padding:8px;border:none;border-radius:6px;cursor:pointer;">🗑️ Excluir</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modules.Configuracoes._fecharModalConfirmacao()" style="flex:1;padding:8px;border:none;border-radius:6px;cursor:pointer;">❌ Cancelar</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        var existing = document.getElementById('modal-confirmar-exclusao');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', confirmHtml);
    },

    _confirmarExclusaoPropriedade: function(id) {
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        db.collection('users').doc(uid).collection('propriedades').doc(id).delete()
            .then(function() {
                GR.Toast.success('Propriedade excluída!');
                GR.Modules.Configuracoes._fecharModalConfirmacao();
                GR.State.carregarDados().then(function() {
                    GR.UI.atualizarPropTabs();
                    GR.UI.refreshCurrentView();
                });
            })
            .catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    _fecharModalConfirmacao: function() {
        var modal = document.getElementById('modal-confirmar-exclusao');
        if (modal) modal.remove();
    },

    // ================================================================
    // CADASTROS
    // ================================================================

    gerenciarCadastro: function(tipo) {
        var viewMap = {
            'insumos': 'insumos',
            'funcionarios': 'funcionarios',
            'animais': 'animais',
            'parceiros': 'parceiros',
            'contratos': 'contratos',
            'orcamentos': 'orcamentos',
            'fornecedores': 'fornecedores',
            'clientes': 'clientes',
            'categorias': 'categorias'
        };

        var view = viewMap[tipo] || tipo;
        if (GR.Modules[view] && GR.Modules[view].render) {
            GR.Modules[view].render();
        } else {
            this._abrirModalCadastro(tipo);
        }
    },

    _abrirModalCadastro: function(tipo) {
        var nomeExibicao = {
            'insumos': 'Insumo',
            'funcionarios': 'Funcionário',
            'animais': 'Animal',
            'parceiros': 'Parceiro',
            'contratos': 'Contrato',
            'orcamentos': 'Orçamento',
            'fornecedores': 'Fornecedor',
            'clientes': 'Cliente',
            'categorias': 'Categoria'
        };

        var label = nomeExibicao[tipo] || tipo;
        
        var modalHtml = 
            '<div id="modal-cadastro" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">' +
            '<div style="background:#fff;border-radius:12px;padding:24px;max-width:400px;width:90%;">' +
            '<h4 style="margin-top:0;">➕ Novo ' + label + '</h4>' +
            '<input type="text" id="modal-cadastro-nome" class="form-control" placeholder="Nome do ' + label + '" style="width:100%;margin-bottom:8px;padding:8px;border-radius:6px;border:1px solid #ddd;">' +
            '<input type="text" id="modal-cadastro-descricao" class="form-control" placeholder="Descrição (opcional)" style="width:100%;margin-bottom:8px;padding:8px;border-radius:6px;border:1px solid #ddd;">' +
            '<div style="display:flex;gap:8px;margin-top:12px;">' +
            '<button class="btn btn-success" onclick="GR.Modules.Configuracoes._salvarModalCadastro(\'' + tipo + '\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">💾 Salvar</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modules.Configuracoes._fecharModal()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">❌ Cancelar</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        var existing = document.getElementById('modal-cadastro');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    _salvarModalCadastro: function(tipo) {
        var nome = document.getElementById('modal-cadastro-nome').value.trim();
        var descricao = document.getElementById('modal-cadastro-descricao').value.trim();

        if (!nome) {
            GR.Toast.error('Nome é obrigatório!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) return;

        var uid = user.uid;
        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            descricao: GR.Utils.escapeHtml(descricao),
            dataCriacao: GR.Utils.now()
        };

        var collectionMap = {
            'insumos': 'insumos',
            'funcionarios': 'funcionarios',
            'animais': 'animais',
            'parceiros': 'parceiros',
            'contratos': 'contratos',
            'orcamentos': 'orcamentos',
            'fornecedores': 'fornecedores',
            'clientes': 'clientes',
            'categorias': 'categorias'
        };

        var col = collectionMap[tipo] || tipo;

        db.collection('users').doc(uid).collection(col).add(dados)
            .then(function() {
                GR.Toast.success('Cadastro adicionado!');
                GR.Modules.Configuracoes._fecharModal();
                GR.State.carregarDados().then(function() {
                    GR.UI.refreshCurrentView();
                });
            }).catch(function(err) {
                GR.Toast.error('Erro ao adicionar: ' + err.message);
            });
    },

    _fecharModal: function() {
        var modal = document.getElementById('modal-cadastro');
        if (modal) modal.remove();
    },

    // ================================================================
    // SINCRONIZAÇÃO
    // ================================================================

    sincronizar: function() {
        GR.Toast.info('🔄 Sincronizando dados...');
        GR.State.carregarDados().then(function() {
            GR.Toast.success('Sincronização concluída!');
            GR.UI.refreshCurrentView();
            GR.UI.atualizarPropTabs();
        }).catch(function(err) {
            GR.Toast.error('Erro na sincronização: ' + err.message);
        });
    },

    exportarDados: function() {
        var dados = {
            usuario: GR.State.data.usuario,
            propriedades: GR.State.data.propriedades,
            tarefas: GR.State.data.tarefas,
            documentos: GR.State.data.documentos,
            analises: GR.State.data.analises,
            receitas: GR.State.data.receitas,
            despesas: GR.State.data.despesas,
            insumos: GR.State.data.insumos,
            funcionarios: GR.State.data.funcionarios,
            animais: GR.State.data.animais,
            parceiros: GR.State.data.parceiros,
            contratos: GR.State.data.contratos,
            orcamentos: GR.State.data.orcamentos,
            fornecedores: GR.State.data.fornecedores,
            clientes: GR.State.data.clientes,
            categorias: GR.State.data.categorias,
            viveiroMudas: GR.State.data.viveiroMudas,
            viveiroInsumos: GR.State.data.viveiroInsumos,
            viveiroServicos: GR.State.data.viveiroServicos,
            viveiroTrabalhadores: GR.State.data.viveiroTrabalhadores,
            exportadoEm: new Date().toISOString()
        };

        var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'gestao_rural_backup_' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
        URL.revokeObjectURL(link.href);
        GR.Toast.success('Dados exportados!');
    },

    importarDados: function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = function(e) {
            if (!e.target.files || !e.target.files[0]) return;
            var reader = new FileReader();
            reader.onload = function(event) {
                try {
                    var dados = JSON.parse(event.target.result);
                    GR.Modules.Configuracoes._processarImportacao(dados);
                } catch(err) {
                    GR.Toast.error('Erro ao ler arquivo: ' + err.message);
                }
            };
            reader.readAsText(e.target.files[0]);
        };
        input.click();
    },

    _processarImportacao: function(dados) {
        if (!confirm('⚠️ Isso substituirá todos os dados atuais. Deseja continuar?')) return;

        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        var colecoes = [
            'propriedades', 'tarefas', 'documentos', 'analises',
            'receitas', 'despesas', 'insumos', 'funcionarios',
            'animais', 'parceiros', 'contratos', 'orcamentos',
            'fornecedores', 'clientes', 'categorias',
            'viveiroMudas', 'viveiroInsumos', 'viveiroServicos', 'viveiroTrabalhadores'
        ];

        var promises = colecoes.map(function(col) {
            if (!dados[col]) return Promise.resolve();
            
            return db.collection('users').doc(uid).collection(col).get().then(function(snapshot) {
                var batch = db.batch();
                snapshot.forEach(function(doc) { batch.delete(doc.ref); });
                return batch.commit();
            }).then(function() {
                var items = dados[col];
                if (!items || !items.length) return;
                
                var batch = db.batch();
                items.forEach(function(item) {
                    var ref = db.collection('users').doc(uid).collection(col).doc();
                    batch.set(ref, item);
                });
                return batch.commit();
            });
        });

        Promise.all(promises).then(function() {
            GR.Toast.success('Dados importados com sucesso!');
            GR.State.carregarDados().then(function() {
                GR.UI.refreshCurrentView();
            });
        }).catch(function(err) {
            GR.Toast.error('Erro ao importar: ' + err.message);
        });
    },

    limparCache: function() {
        if (!confirm('Limpar cache local? Os dados serão recarregados do servidor.')) return;
        localStorage.clear();
        GR.Toast.success('Cache limpo! Recarregando...');
        setTimeout(function() { location.reload(); }, 1000);
    },

    // ================================================================
    // TEMA
    // ================================================================

    tema: function(modo) {
        document.documentElement.setAttribute('data-theme', modo);
        localStorage.setItem('gr_theme', modo);
        
        // Atualizar botões de tema
        var botoes = document.querySelectorAll('[onclick^="GR.Modules.Configuracoes.tema"]');
        botoes.forEach(function(btn) {
            btn.style.border = 'none';
            var tema = btn.getAttribute('onclick').match(/'([^']+)'/);
            if (tema && tema[1] === modo) {
                btn.style.border = '2px solid #000';
            }
        });
        
        GR.Toast.success('Tema alterado para ' + modo + '!');
    },

    // ================================================================
    // ZONA DE RISCO
    // ================================================================

    redefinirDados: function() {
        if (!confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os seus dados permanentemente. Continue?')) return;
        if (!confirm('Última chance: Tem certeza?')) return;

        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        var colecoes = [
            'propriedades', 'tarefas', 'documentos', 'analises',
            'receitas', 'despesas', 'insumos', 'funcionarios',
            'animais', 'parceiros', 'contratos', 'orcamentos',
            'fornecedores', 'clientes', 'categorias',
            'viveiroMudas', 'viveiroInsumos', 'viveiroServicos', 'viveiroTrabalhadores'
        ];

        var promises = colecoes.map(function(col) {
            return db.collection('users').doc(uid).collection(col).get().then(function(snapshot) {
                var batch = db.batch();
                snapshot.forEach(function(doc) { batch.delete(doc.ref); });
                return batch.commit();
            });
        });

        Promise.all(promises).then(function() {
            GR.Toast.success('Todos os dados foram removidos!');
            GR.State.data = {};
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro ao redefinir dados: ' + err.message);
        });
    },

    excluirConta: function() {
        if (!confirm('⚠️ ATENÇÃO: Isso irá excluir sua conta permanentemente. Continue?')) return;
        if (!confirm('Última confirmação: Digite "EXCLUIR" no campo abaixo.')) return;

        var input = prompt('Digite "EXCLUIR" para confirmar:');
        if (input !== 'EXCLUIR') {
            GR.Toast.error('Confirmação incorreta.');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var colecoes = [
            'propriedades', 'tarefas', 'documentos', 'analises',
            'receitas', 'despesas', 'insumos', 'funcionarios',
            'animais', 'parceiros', 'contratos', 'orcamentos',
            'fornecedores', 'clientes', 'categorias',
            'viveiroMudas', 'viveiroInsumos', 'viveiroServicos', 'viveiroTrabalhadores'
        ];

        var promises = colecoes.map(function(col) {
            return db.collection('users').doc(uid).collection(col).get().then(function(snapshot) {
                var batch = db.batch();
                snapshot.forEach(function(doc) { batch.delete(doc.ref); });
                return batch.commit();
            });
        });

        Promise.all(promises).then(function() {
            return db.collection('users').doc(uid).delete();
        }).then(function() {
            return user.delete();
        }).then(function() {
            GR.Toast.success('Conta excluída permanentemente.');
            setTimeout(function() {
                firebase.auth().signOut();
                location.reload();
            }, 1000);
        }).catch(function(err) {
            GR.Toast.error('Erro ao excluir conta: ' + err.message);
        });
    }
};

// ================================================================
// INICIALIZAÇÃO
// ================================================================

console.log('✅ Módulo Configurações completo carregado!');