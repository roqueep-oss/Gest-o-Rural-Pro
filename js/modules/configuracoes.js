// ================================================================
// MÓDULO: CONFIGURAÇÕES - COM INJEÇÃO AUTOMÁTICA DO BOTÃO PROPRIEDADES
// ================================================================

GR.Modules.Configuracoes = {
    _secaoAtiva: 'gerais',
    _tentativasInjecao: 0,
    _maxTentativas: 10,

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    render: function() {
        var div = document.getElementById('configuracoes-content');
        if (!div) {
            console.warn('⚠️ Container #configuracoes-content não encontrado. Recriando...');
            var section = document.getElementById('section-configuracoes');
            if (section) {
                div = document.createElement('div');
                div.id = 'configuracoes-content';
                section.innerHTML = '';
                section.appendChild(div);
            } else {
                console.error('❌ Seção #section-configuracoes não encontrada!');
                return;
            }
        }

        var user = GR.State.data.usuario || {};
        var propriedades = GR.State.data.propriedades || [];
        var perfis = GR.State.data.perfis || [];
        var fornecedores = GR.State.data.fornecedores || [];

        var theme = localStorage.getItem('gr_theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);

        var html = '<div style="max-width:900px;margin:0 auto;padding:10px;">';
        html += '<h3 style="font-size:18px;margin-bottom:15px;">⚙️ Configurações</h3>';

        // ===== MENU DE BOTÕES (gerado por este módulo) =====
        // Nota: se o menu for gerado por outro código, ele será sobrescrito.
        // Para evitar duplicação, vamos primeiro remover o menu antigo se existir.
        var existingMenu = document.querySelector('.config-menu-custom');
        if (existingMenu) existingMenu.remove();

        html += '<div class="config-menu-custom" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;padding:10px;background:var(--bg-light,#f5f5f5);border-radius:8px;border:1px solid var(--border,#ddd);">';
        html += this._botao('gerais', '📋 Gerais');
        html += this._botao('perfis', '👥 Perfis');
        html += this._botao('partesRelacionadas', '👤 Partes Relacionadas');
        html += this._botao('fornecedores', '🚚 Fornecedores');
        html += this._botao('backup', '💾 Backup');
        html += this._botao('aparencia', '🎨 Aparência');
        // Botão Propriedades (abre modal)
        html += '<button class="btn-propriedades" onclick="GR.Modules.Configuracoes.abrirModalPropriedades()" style="padding:6px 16px;border:2px solid #4CAF50;background:#4CAF50;color:#fff;border-radius:4px;cursor:pointer;font-weight:bold;">🏠 Propriedades</button>';
        html += '</div>';

        // ===== CONTEÚDO DINÂMICO =====
        html += '<div id="config-secao-container">';
        html += this._renderGerais(user);
        html += '</div>';

        // ===== SISTEMA E ZONA DE RISCO (fixos) =====
        html += this._renderSistema(user, propriedades);
        html += this._renderZonaRisco();

        html += '</div>';
        div.innerHTML = html;

        // Inicializar eventos dos botões
        this._inicializarBotoes();

        // Relógio
        this._atualizarRelogio();
        if (this._relogioInterval) {
            clearInterval(this._relogioInterval);
        }
        this._relogioInterval = setInterval(function() {
            GR.Modules.Configuracoes._atualizarRelogio();
        }, 1000);

        this.tema(theme);

        // Tentar injetar o botão no menu existente (se houver)
        this._injetarBotaoPropriedades();

        console.log('✅ Configurações carregadas com botão Propriedades!');
    },

    // ============================================================
    // BOTÃO COM ESTILO
    // ============================================================
    _botao: function(secao, label) {
        var ativo = this._secaoAtiva === secao ? 'ativo' : '';
        return '<button class="btn-config" data-secao="' + secao + '" style="padding:6px 16px;border:1px solid var(--primary,#2196F3);background:' + (ativo ? 'var(--primary,#2196F3)' : 'transparent') + ';color:' + (ativo ? '#fff' : 'var(--primary,#2196F3)') + ';border-radius:4px;cursor:pointer;font-weight:bold;">' + label + '</button>';
    },

    // ============================================================
    // INICIALIZAR CLIQUE DOS BOTÕES
    // ============================================================
    _inicializarBotoes: function() {
        var self = this;
        document.querySelectorAll('.btn-config').forEach(function(btn) {
            btn.removeEventListener('click', self._handlerBotao);
            btn.addEventListener('click', self._handlerBotao);
        });
    },

    _handlerBotao: function(e) {
        var secao = this.dataset.secao;
        var self = GR.Modules.Configuracoes;
        self._secaoAtiva = secao;

        document.querySelectorAll('.btn-config').forEach(function(b) {
            var isActive = b.dataset.secao === secao;
            b.style.background = isActive ? 'var(--primary,#2196F3)' : 'transparent';
            b.style.color = isActive ? '#fff' : 'var(--primary,#2196F3)';
        });

        var container = document.getElementById('config-secao-container');
        if (!container) return;

        switch(secao) {
            case 'gerais':
                container.innerHTML = self._renderGerais(GR.State.data.usuario || {});
                break;
            case 'perfis':
                container.innerHTML = self._renderPerfis(GR.State.data.perfis || []);
                break;
            case 'partesRelacionadas':
                container.innerHTML = self._renderPartesRelacionadas(GR.State.data.partesRelacionadas || []);
                break;
            case 'fornecedores':
                container.innerHTML = self._renderFornecedores(GR.State.data.fornecedores || []);
                break;
            case 'backup':
                container.innerHTML = self._renderBackup();
                break;
            case 'aparencia':
                container.innerHTML = self._renderAparencia();
                break;
            default:
                container.innerHTML = '<p>Seção não encontrada.</p>';
        }
    },

    // ============================================================
    // INJETAR BOTÃO PROPRIEDADES NO MENU EXISTENTE (FALLBACK)
    // ============================================================
    _injetarBotaoPropriedades: function() {
        var self = this;
        this._tentativasInjecao = 0;

        function tentarInjetar() {
            // Tenta encontrar o container dos botões "Gerais", "Perfis", etc.
            var container = null;

            // 1. Tenta pelo ID ou classe conhecida
            container = document.querySelector('.config-tabs, .config-menu, .sub-menu, .nav-sub, .config-nav, .config-buttons');

            // 2. Se não encontrar, tenta encontrar o pai de um botão que contenha "Gerais" (texto exato ou parcial)
            if (!container) {
                var all = document.querySelectorAll('button, a, div, span');
                for (var i = 0; i < all.length; i++) {
                    var txt = all[i].textContent.trim();
                    if (txt === 'Gerais' || txt.includes('Gerais')) {
                        container = all[i].parentElement;
                        break;
                    }
                }
            }

            // 3. Se ainda não encontrou, tenta procurar por um container com flex-wrap e gap (estilo típico)
            if (!container) {
                var candidates = document.querySelectorAll('div[style*="flex-wrap"], div[style*="gap"]');
                for (var j = 0; j < candidates.length; j++) {
                    if (candidates[j].children.length >= 2) {
                        container = candidates[j];
                        break;
                    }
                }
            }

            if (!container) {
                self._tentativasInjecao++;
                if (self._tentativasInjecao < self._maxTentativas) {
                    console.log(`⏳ Tentativa ${self._tentativasInjecao} para encontrar o container...`);
                    setTimeout(tentarInjetar, 300);
                } else {
                    console.warn('⚠️ Não foi possível encontrar o container do menu. O botão Propriedades não foi injetado.');
                }
                return;
            }

            // Verifica se o botão já existe
            if (container.querySelector('[data-propriedades]')) {
                console.log('✅ Botão Propriedades já existe.');
                return;
            }

            // Cria o botão
            var btn = document.createElement('button');
            btn.setAttribute('data-propriedades', 'true');
            btn.textContent = '🏠 Propriedades';
            btn.style.cssText = 'padding:6px 16px;border:2px solid #4CAF50;background:#4CAF50;color:#fff;border-radius:4px;cursor:pointer;font-weight:bold;margin-left:4px;';
            btn.onclick = function() {
                GR.Modules.Configuracoes.abrirModalPropriedades();
            };
            container.appendChild(btn);
            console.log('✅ Botão "Propriedades" injetado com sucesso!');
        }

        // Aguarda um pequeno delay para o DOM ser atualizado
        setTimeout(tentarInjetar, 200);
    },

    // ================================================================
    // RENDERIZAÇÃO DAS SEÇÕES
    // ================================================================

    _renderGerais: function(user) {
        return '<div class="card" style="padding:16px;border-radius:8px;background:var(--card-bg,#fff);border:1px solid var(--border,#ddd);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">👤 Perfil do Usuário</h4>' +
            '<div style="display:grid;gap:10px;">' +
            '<div><label style="font-size:12px;color:var(--text-light);">Nome</label><input type="text" id="config-nome" value="' + GR.Utils.escapeHtml(user.nome || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">E-mail</label><input type="email" id="config-email" value="' + GR.Utils.escapeHtml(user.email || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);" disabled></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">Telefone</label><input type="text" id="config-telefone" value="' + GR.Utils.escapeHtml(user.telefone || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">CPF/CNPJ</label><input type="text" id="config-documento" value="' + GR.Utils.escapeHtml(user.documento || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);" placeholder="Ex: 123.456.789-00"></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">Endereço</label><input type="text" id="config-endereco" value="' + GR.Utils.escapeHtml(user.endereco || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<div><label style="font-size:12px;color:var(--text-light);">Cidade/UF</label><input type="text" id="config-cidade" value="' + GR.Utils.escapeHtml(user.cidade || '') + '" class="form-control" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);"></div>' +
            '<button class="btn btn-primary" onclick="GR.Modules.Configuracoes.salvarPerfil()" style="padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;background:#2196F3;color:#fff;">💾 Salvar Perfil</button>' +
            '</div></div>';
    },

    _renderPerfis: function(perfis) {
        var html = '<div class="card" style="padding:16px;border-radius:8px;background:var(--card-bg,#fff);border:1px solid var(--border,#ddd);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">👥 Perfis</h4>' +
            '<div style="margin-bottom:10px;">';
        if (perfis && perfis.length) {
            html += '<div style="max-height:250px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;">';
            perfis.forEach(function(p) {
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid var(--border);background:var(--bg-light);">' +
                    '<span><strong>' + GR.Utils.escapeHtml(p.nome || p.name || 'Sem nome') + '</strong> ' +
                    (p.nivel || p.level ? '🎯 Nível: ' + (p.nivel || p.level) : '') +
                    '</span>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Configuracoes.excluirPerfil(\'' + p.id + '\')" style="padding:2px 6px;border:none;border-radius:4px;cursor:pointer;background:#f44336;color:#fff;font-size:10px;">🗑️</button>' +
                    '</div>';
            });
            html += '</div>';
        } else {
            html += '<div style="color:#999;padding:10px;text-align:center;">Nenhum perfil cadastrado</div>';
        }
        html += '</div>' +
            '<div style="display:flex;gap:8px;">' +
            '<input type="text" id="config-novo-perfil" class="form-control" placeholder="Nome do perfil" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);">' +
            '<input type="number" id="config-novo-perfil-nivel" class="form-control" placeholder="Nível" style="width:80px;padding:8px;border-radius:6px;border:1px solid var(--border);" value="1">' +
            '<button class="btn btn-success" onclick="GR.Modules.Configuracoes.adicionarPerfil()" title="Adicionar perfil" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#4CAF50;color:#fff;">➕</button>' +
            '</div>' +
            '</div>';
        return html;
    },

    _renderPartesRelacionadas: function(partes) {
        var html = '<div class="card" style="padding:16px;border-radius:8px;background:var(--card-bg,#fff);border:1px solid var(--border,#ddd);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">👤 Partes Relacionadas</h4>' +
            '<div style="margin-bottom:10px;">';
        if (partes && partes.length) {
            html += '<div style="max-height:250px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;">';
            partes.forEach(function(p) {
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid var(--border);background:var(--bg-light);">' +
                    '<span><strong>' + GR.Utils.escapeHtml(p.nome || 'Sem nome') + '</strong> ' +
                    (p.cpf ? '📄 ' + p.cpf : '') +
                    (p.telefone ? ' 📱 ' + (p.telefone.ddd || '') + (p.telefone.numero || '') : '') +
                    '</span>' +
                    '<div style="display:flex;gap:4px;">' +
                    '<button class="btn btn-info btn-sm" onclick="GR.Modules.PartesRelacionadas.editar(\'' + p.id + '\')" title="Editar" style="padding:2px 6px;border:none;border-radius:4px;cursor:pointer;background:#2196F3;color:#fff;font-size:10px;">✏️</button>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.PartesRelacionadas.excluir(\'' + p.id + '\')" title="Excluir" style="padding:2px 6px;border:none;border-radius:4px;cursor:pointer;background:#f44336;color:#fff;font-size:10px;">🗑️</button>' +
                    '</div>' +
                    '</div>';
            });
            html += '</div>';
        } else {
            html += '<div style="color:#999;padding:10px;text-align:center;">Nenhuma parte relacionada cadastrada</div>';
        }
        html += '</div>' +
            '<button class="btn btn-success" onclick="GR.Modules.PartesRelacionadas.abrirModal()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#4CAF50;color:#fff;">👤 Nova Parte Relacionada</button>' +
            '</div>';
        return html;
    },

    _renderFornecedores: function(fornecedores) {
        var html = '<div class="card" style="padding:16px;border-radius:8px;background:var(--card-bg,#fff);border:1px solid var(--border,#ddd);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">🚚 Fornecedores</h4>' +
            '<div style="margin-bottom:10px;">';
        if (fornecedores && fornecedores.length) {
            html += '<div style="max-height:250px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;">';
            fornecedores.forEach(function(f) {
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid var(--border);background:var(--bg-light);">' +
                    '<span><strong>' + GR.Utils.escapeHtml(f.nome || f.razaoSocial || 'Sem nome') + '</strong> ' +
                    (f.cpfcnpj ? '📄 ' + f.cpfcnpj : '') +
                    '</span>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Configuracoes.excluirFornecedor(\'' + f.id + '\')" title="Excluir fornecedor" style="padding:2px 6px;border:none;border-radius:4px;cursor:pointer;background:#f44336;color:#fff;font-size:10px;">🗑️</button>' +
                    '</div>';
            });
            html += '</div>';
        } else {
            html += '<div style="color:#999;padding:10px;text-align:center;">Nenhum fornecedor cadastrado</div>';
        }
        html += '</div>' +
            '<div style="display:flex;gap:8px;">' +
            '<input type="text" id="config-novo-fornecedor" class="form-control" placeholder="Nome do fornecedor" style="flex:1;padding:8px;border-radius:6px;border:1px solid var(--border);">' +
            '<input type="text" id="config-novo-fornecedor-cnpj" class="form-control" placeholder="CNPJ/CPF" style="width:120px;padding:8px;border-radius:6px;border:1px solid var(--border);">' +
            '<button class="btn btn-success" onclick="GR.Modules.Configuracoes.adicionarFornecedor()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#4CAF50;color:#fff;">➕</button>' +
            '</div>' +
            '</div>';
        return html;
    },

    _renderBackup: function() {
        return '<div class="card" style="padding:16px;border-radius:8px;background:var(--card-bg,#fff);border:1px solid var(--border,#ddd);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">💾 Backup</h4>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" onclick="GR.Modules.Configuracoes.fazerBackup()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#2196F3;color:#fff;">📤 Fazer Backup</button>' +
            '<button class="btn btn-info" onclick="GR.Modules.Configuracoes.exportarDados()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#2196F3;color:#fff;">📥 Exportar</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modules.Configuracoes.importarDados()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#9E9E9E;color:#fff;">📤 Importar</button>' +
            '</div></div>';
    },

    _renderAparencia: function() {
        var currentTheme = localStorage.getItem('gr_theme') || 'light';
        return '<div class="card" style="padding:16px;border-radius:8px;background:var(--card-bg,#fff);border:1px solid var(--border,#ddd);">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">🎨 Aparência</h4>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" onclick="GR.Modules.Configuracoes.tema(\'light\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#2196F3;color:#fff;' + (currentTheme === 'light' ? 'border:2px solid #000;' : '') + '">☀️ Claro</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modules.Configuracoes.tema(\'dark\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#666;color:#fff;' + (currentTheme === 'dark' ? 'border:2px solid #000;' : '') + '">🌙 Escuro</button>' +
            '<button class="btn btn-info" onclick="GR.Modules.Configuracoes.tema(\'azul\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#0D47A1;color:#fff;' + (currentTheme === 'azul' ? 'border:2px solid #000;' : '') + '">🔵 Azul</button>' +
            '<button class="btn btn-success" onclick="GR.Modules.Configuracoes.tema(\'verde\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#2E7D32;color:#fff;' + (currentTheme === 'verde' ? 'border:2px solid #000;' : '') + '">🟢 Verde</button>' +
            '<button class="btn btn-warning" onclick="GR.Modules.Configuracoes.tema(\'laranja\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#E65100;color:#fff;' + (currentTheme === 'laranja' ? 'border:2px solid #000;' : '') + '">🟠 Laranja</button>' +
            '<button class="btn btn-danger" onclick="GR.Modules.Configuracoes.tema(\'roxo\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#4A148C;color:#fff;' + (currentTheme === 'roxo' ? 'border:2px solid #000;' : '') + '">🟣 Roxo</button>' +
            '</div></div>';
    },

    _renderSistema: function(user, propriedades) {
        return '<div style="margin-top:20px;padding:16px;border-radius:8px;background:#f5f5f5;border:1px solid #ddd;">' +
            '<h4 style="font-size:14px;margin-bottom:12px;">ℹ️ Sistema</h4>' +
            '<div style="font-size:13px;color:var(--text-light);display:grid;gap:4px;">' +
            '<div><strong>Versão:</strong> 3.1</div>' +
            '<div><strong>Usuário:</strong> ' + GR.Utils.escapeHtml(user.email || 'Não logado') + '</div>' +
            '<div><strong>Perfil:</strong> ' + GR.Utils.escapeHtml(user.perfil || 'Master') + '</div>' +
            '<div><strong>Total de Propriedades:</strong> ' + (propriedades ? propriedades.length : 0) + '</div>' +
            '<div><strong>Data/Hora:</strong> <span id="sistema-data-hora"></span></div>' +
            '</div></div>';
    },

    _renderZonaRisco: function() {
        return '<div style="margin-top:10px;padding:16px;border-radius:8px;background:#fff3e0;border:2px solid #ff9800;">' +
            '<h4 style="font-size:14px;color:#e65100;margin-bottom:12px;">⚠️ Zona de Risco</h4>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="btn btn-danger" onclick="GR.Modules.Configuracoes.redefinirDados()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#f44336;color:#fff;">🗑️ Redefinir Todos os Dados</button>' +
            '<button class="btn btn-danger" onclick="GR.Modules.Configuracoes.excluirConta()" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#f44336;color:#fff;">❌ Excluir Conta</button>' +
            '</div></div>';
    },

    // ================================================================
    // MODAL PARA PROPRIEDADES (CRUD completo)
    // ================================================================
    abrirModalPropriedades: function() {
        var existing = document.getElementById('modal-propriedades');
        if (existing) existing.remove();

        var propriedades = GR.State.data.propriedades || [];
        var html = '<div id="modal-propriedades" class="modal active" style="display:flex;">' +
            '<div class="modal-content" style="max-width:700px;width:95%;">' +
            '<div class="modal-header"><h2 class="modal-title">🏠 Gerenciar Propriedades</h2><button class="close-btn" onclick="GR.Modal.close(\'propriedades\')">×</button></div>' +
            '<div style="margin-bottom:15px;">' +
            '<div style="font-size:12px;color:var(--text-light);margin-bottom:6px;">📋 <strong>Propriedades cadastradas:</strong> ' + (propriedades ? propriedades.length : 0) + '</div>' +
            '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;">';

        if (propriedades && propriedades.length) {
            propriedades.forEach(function(p) {
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #eee;background:#f8f9fa;">' +
                    '<div style="flex:1;"><strong>' + GR.Utils.escapeHtml(p.nome) + '</strong>' +
                    (p.localizacao ? ' <span style="font-size:11px;color:#666;">📍 ' + GR.Utils.escapeHtml(p.localizacao) + '</span>' : '') +
                    (p.area && p.area !== '0' ? ' <span style="font-size:11px;color:#666;">📐 ' + GR.Utils.escapeHtml(p.area) + ' ha</span>' : '') +
                    '</div>' +
                    '<div style="display:flex;gap:4px;">' +
                    '<button class="btn btn-info btn-sm" onclick="GR.Modules.Configuracoes.editarPropriedade(\'' + p.id + '\')" title="Editar propriedade" style="padding:4px 8px;border:none;border-radius:4px;cursor:pointer;background:#2196F3;color:#fff;">✏️</button> ' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Configuracoes.excluirPropriedade(\'' + p.id + '\')" title="Excluir propriedade" style="padding:4px 8px;border:none;border-radius:4px;cursor:pointer;background:#f44336;color:#fff;">🗑️</button>' +
                    '</div>' +
                    '</div>';
            });
        } else {
            html += '<div style="color:#999;padding:15px;text-align:center;">Nenhuma propriedade cadastrada</div>';
        }

        html += '</div></div>' +
            '<div style="background:#e8f5e9;padding:15px;border-radius:8px;margin-top:10px;border:1px solid #a5d6a7;">' +
            '<div style="font-size:13px;color:#2E7D32;margin-bottom:10px;">📝 <strong>Nova Propriedade</strong></div>' +
            '<div style="display:grid;gap:8px;">' +
            '<input type="text" id="modal-prop-nome" class="form-control" placeholder="* Nome da propriedade (obrigatório)" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ddd;">' +
            '<div style="display:flex;gap:8px;">' +
            '<input type="text" id="modal-prop-localizacao" class="form-control" placeholder="📍 Localização" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ddd;">' +
            '<input type="number" id="modal-prop-area" class="form-control" placeholder="📐 Área (ha)" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ddd;">' +
            '</div>' +
            '<div style="display:flex;gap:8px;">' +
            '<select id="modal-prop-tipo" class="form-control" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ddd;">' +
            '<option value="">🏷️ Tipo</option>' +
            '<option value="Agricultura">🌾 Agricultura</option>' +
            '<option value="Pecuária">🐄 Pecuária</option>' +
            '<option value="Mista">🌾🐄 Mista</option>' +
            '<option value="Floresta">🌳 Floresta</option>' +
            '<option value="Viveiro">🌱 Viveiro</option>' +
            '<option value="Outro">📌 Outro</option>' +
            '</select>' +
            '<select id="modal-prop-status" class="form-control" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ddd;">' +
            '<option value="Ativa">✅ Ativa</option>' +
            '<option value="Inativa">⛔ Inativa</option>' +
            '<option value="Em desenvolvimento">🚧 Em desenvolvimento</option>' +
            '</select>' +
            '</div>' +
            '<div style="margin-top:8px;">' +
            '<div style="font-size:12px;color:#2E7D32;margin-bottom:4px;font-weight:600;">🔧 Módulos ativos para esta propriedade:</div>' +
            '<div style="font-size:11px;color:#666;margin-bottom:6px;">Marque os módulos que esta propriedade utiliza. Os não marcados ficarão ocultos no menu.</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:4px;" id="modal-prop-modulos">' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="acoes" checked> 📋 Ações</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="orcamentos" checked> 💰 Orçamentos</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="credito" checked> 💳 Crédito</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="insumos" checked> 🧪 Insumos</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="pecuaria" checked> 🐄 Pecuária</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="funcionarios" checked> 👨‍🌾 Funcionários</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="parceiros" checked> 👥 Parceiros</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="contabilidade" checked> 🧾 Contabilidade</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="documentos" checked> 📁 Documentos</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="analises" checked> 🔬 Análises</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="viveiro" checked> 🌱 Viveiro</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="relatorios" checked> 📈 Relatórios</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="producao" checked> 🌾 Produção</label>' +
            '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="prop-modulos" value="nfe" checked> 📄 NF-e</label>' +
            '</div></div>' +
            '<textarea id="modal-prop-observacao" class="form-control" placeholder="📝 Observações" style="width:100%;height:60px;resize:vertical;padding:8px;border-radius:6px;border:1px solid #ddd;"></textarea>' +
            '<button class="btn btn-success" onclick="GR.Modules.Configuracoes.salvarPropriedadeModal()" style="padding:10px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;background:#4CAF50;color:#fff;">➕ Adicionar Propriedade</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.body.insertAdjacentHTML('beforeend', html);
        GR.Modal.open('propriedades');
    },

    salvarPropriedadeModal: function() {
        var nome = document.getElementById('modal-prop-nome').value.trim();
        var localizacao = document.getElementById('modal-prop-localizacao').value.trim();
        var area = document.getElementById('modal-prop-area').value.trim();
        var tipo = document.getElementById('modal-prop-tipo').value;
        var status = document.getElementById('modal-prop-status').value;
        var observacao = document.getElementById('modal-prop-observacao').value.trim();

        if (!nome) {
            GR.Toast.error('⚠️ Nome da propriedade é obrigatório!');
            document.getElementById('modal-prop-nome').focus();
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var modulos = [];
        document.querySelectorAll('#modal-propriedades input[type="checkbox"][name="prop-modulos"]').forEach(function(cb) {
            if (cb.checked) modulos.push(cb.value);
        });

        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            localizacao: GR.Utils.escapeHtml(localizacao) || '',
            area: area ? parseFloat(area) : 0,
            tipo: tipo || 'Não definido',
            status: status || 'Ativa',
            observacao: GR.Utils.escapeHtml(observacao) || '',
            modulos: modulos,
            dataCriacao: GR.Utils.now()
        };

        var btn = document.querySelector('#modal-propriedades .btn-success');
        var originalText = btn ? btn.textContent : '';
        if (btn) {
            btn.textContent = '⏳ Salvando...';
            btn.disabled = true;
        }

        db.collection('users').doc(uid).collection('propriedades').add(dados)
            .then(function(docRef) {
                dados.id = docRef.id;
                GR.State.inserirNoCache('propriedades', dados);
                GR.Toast.success('✅ Propriedade "' + nome + '" adicionada!');
                GR.Modal.close('propriedades');
                GR.UI.atualizarPropTabs();
                GR.UI._atualizarSelectsPropriedade();
                GR.UI.refreshCurrentView();
                GR.Toast.success('🏠 Propriedade vinculada a todos os módulos!');
                GR.State.carregarDados().then(function() {
                    GR.Modules.Configuracoes.abrirModalPropriedades();
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

    // ================================================================
    // FUNÇÕES CRUD (mantidas do seu código original)
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

    adicionarPerfil: function() {
        var nome = document.getElementById('config-novo-perfil').value.trim();
        var nivel = document.getElementById('config-novo-perfil-nivel').value.trim();

        if (!nome) {
            GR.Toast.error('Nome do perfil é obrigatório!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) return;

        var uid = user.uid;
        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            nivel: nivel || '1',
            dataCriacao: GR.Utils.now()
        };

        db.collection('users').doc(uid).collection('perfis').add(dados)
            .then(function() {
                GR.Toast.success('Perfil adicionado!');
                document.getElementById('config-novo-perfil').value = '';
                document.getElementById('config-novo-perfil-nivel').value = '1';
                GR.State.carregarDados().then(function() {
                    GR.Modules.Configuracoes.render();
                });
            }).catch(function(err) {
                GR.Toast.error('Erro ao adicionar: ' + err.message);
            });
    },

    excluirPerfil: function(id) {
        if (!confirm('Excluir este perfil?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;

        db.collection('users').doc(user.uid).collection('perfis').doc(id).delete()
            .then(function() {
                GR.Toast.success('Perfil excluído!');
                GR.State.carregarDados().then(function() {
                    GR.Modules.Configuracoes.render();
                });
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    adicionarFornecedor: function() {
        var nome = document.getElementById('config-novo-fornecedor').value.trim();
        var cnpj = document.getElementById('config-novo-fornecedor-cnpj').value.trim();

        if (!nome) {
            GR.Toast.error('Nome do fornecedor é obrigatório!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) return;

        var uid = user.uid;
        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            cpfcnpj: GR.Utils.escapeHtml(cnpj) || '',
            dataCriacao: GR.Utils.now()
        };

        db.collection('users').doc(uid).collection('fornecedores').add(dados)
            .then(function() {
                GR.Toast.success('Fornecedor adicionado!');
                document.getElementById('config-novo-fornecedor').value = '';
                document.getElementById('config-novo-fornecedor-cnpj').value = '';
                GR.State.carregarDados().then(function() {
                    GR.Modules.Configuracoes.render();
                });
            }).catch(function(err) {
                GR.Toast.error('Erro ao adicionar: ' + err.message);
            });
    },

    excluirFornecedor: function(id) {
        if (!confirm('Excluir este fornecedor?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;

        db.collection('users').doc(user.uid).collection('fornecedores').doc(id).delete()
            .then(function() {
                GR.Toast.success('Fornecedor excluído!');
                GR.State.carregarDados().then(function() {
                    GR.Modules.Configuracoes.render();
                });
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    editarPropriedade: function(id) {
        var propriedade = GR.State.data.propriedades.find(function(p) { return p.id === id; });
        if (!propriedade) {
            GR.Toast.error('Propriedade não encontrada!');
            return;
        }

        var modalHtml = 
            '<div id="modal-editar-propriedade" class="modal active" style="display:flex;">' +
            '<div class="modal-content" style="max-width:500px;width:90%;">' +
            '<div class="modal-header"><h2 class="modal-title">✏️ Editar Propriedade</h2><button class="close-btn" onclick="GR.Modal.close(\'editar-propriedade\')">×</button></div>' +
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
            '<div style="margin-top:8px;">' +
            '<div style="font-size:12px;color:#2E7D32;margin-bottom:4px;font-weight:600;">🔧 Módulos ativos para esta propriedade:</div>' +
            '<div style="font-size:11px;color:#666;margin-bottom:6px;">Desmarque os módulos que esta propriedade NÃO utiliza.</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:4px;">' +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'acoes', '📋 Ações', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'orcamentos', '💰 Orçamentos', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'credito', '💳 Crédito', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'insumos', '🧪 Insumos', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'pecuaria', '🐄 Pecuária', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'funcionarios', '👨‍🌾 Funcionários', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'parceiros', '👥 Parceiros', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'contabilidade', '🧾 Contabilidade', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'documentos', '📁 Documentos', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'analises', '🔬 Análises', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'viveiro', '🌱 Viveiro', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'relatorios', '📈 Relatórios', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'producao', '🌾 Produção', propriedade) +
            GR.Modules.Configuracoes._htmlCheckboxModulo('edit', 'nfe', '📄 NF-e', propriedade) +
            '</div></div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;margin-top:12px;">' +
            '<button class="btn btn-success" onclick="GR.Modules.Configuracoes._salvarEdicaoPropriedade(\'' + id + '\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#4CAF50;color:#fff;">💾 Salvar</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modal.close(\'editar-propriedade\')" style="padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:#9E9E9E;color:#fff;">❌ Cancelar</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        var existing = document.getElementById('modal-editar-propriedade');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        GR.Modal.open('editar-propriedade');
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

        var modulos = [];
        document.querySelectorAll('#modal-editar-propriedade input[type="checkbox"][name="edit-prop-modulos"]').forEach(function(cb) {
            if (cb.checked) modulos.push(cb.value);
        });

        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            localizacao: GR.Utils.escapeHtml(localizacao),
            area: area ? parseFloat(area) : 0,
            tipo: tipo || 'Não definido',
            status: status || 'Ativa',
            observacao: GR.Utils.escapeHtml(observacao),
            modulos: modulos,
            dataAtualizacao: GR.Utils.now()
        };

        db.collection('users').doc(user.uid).collection('propriedades').doc(id).update(dados)
            .then(function() {
                GR.State.atualizarNoCache('propriedades', id, dados);
                GR.Toast.success('✅ Propriedade atualizada!');
                GR.Modal.close('editar-propriedade');
                GR.UI.atualizarPropTabs();
                GR.UI._atualizarSelectsPropriedade();
                GR.UI.refreshCurrentView();
                GR.State.carregarDados().then(function() {
                    if (document.getElementById('modal-propriedades')) {
                        GR.Modules.Configuracoes.abrirModalPropriedades();
                    }
                });
            })
            .catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
    },

    _htmlCheckboxModulo: function(prefix, valor, label, propriedade) {
        var modulos = propriedade.modulos || ['acoes','orcamentos','credito','insumos','pecuaria','funcionarios','parceiros','contabilidade','documentos','analises','viveiro','relatorios','producao','nfe'];
        var checked = modulos.indexOf(valor) !== -1 ? ' checked' : '';
        return '<label style="display:flex;align-items:center;gap:3px;padding:3px 8px;background:#f0f0f0;border-radius:4px;font-size:12px;cursor:pointer;"><input type="checkbox" name="' + prefix + '-prop-modulos" value="' + valor + '"' + checked + '> ' + label + '</label>';
    },

    _fecharModalEdicao: function() {
        GR.Modal.close('editar-propriedade');
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
            '<button class="btn btn-danger" onclick="GR.Modules.Configuracoes._confirmarExclusaoPropriedade(\'' + id + '\')" style="flex:1;padding:8px;border:none;border-radius:6px;cursor:pointer;background:#f44336;color:#fff;">🗑️ Excluir</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modules.Configuracoes._fecharModalConfirmacao()" style="flex:1;padding:8px;border:none;border-radius:6px;cursor:pointer;background:#9E9E9E;color:#fff;">❌ Cancelar</button>' +
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
                GR.State.removerDoCache('propriedades', id);
                GR.Toast.success('Propriedade excluída!');
                GR.Modules.Configuracoes._fecharModalConfirmacao();
                GR.UI.atualizarPropTabs();
                GR.UI._atualizarSelectsPropriedade();
                GR.UI.refreshCurrentView();
                GR.State.carregarDados().then(function() {
                    if (document.getElementById('modal-propriedades')) {
                        GR.Modules.Configuracoes.abrirModalPropriedades();
                    }
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

    fazerBackup: function() {
        GR.Toast.info('📤 Fazendo backup...');
        this.exportarDados();
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
                GR.Modules.Configuracoes.render();
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

    tema: function(modo) {
        document.documentElement.setAttribute('data-theme', modo);
        localStorage.setItem('gr_theme', modo);

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
    },

    _atualizarRelogio: function() {
        var el = document.getElementById('sistema-data-hora');
        if (el) {
            el.textContent = new Date().toLocaleString('pt-BR');
        }
    },

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
    }
};

console.log('✅ Módulo Configurações (versão final com injeção automática) carregado!');