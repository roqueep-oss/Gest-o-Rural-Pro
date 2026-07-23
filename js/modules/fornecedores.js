// ================================================================
// MÓDULO: FORNECEDORES - COM MELHORIAS (CALLBACK E INTEGRAÇÃO)
// ================================================================
// Gerencia o cadastro de fornecedores (pessoas físicas e jurídicas)
// com CPF/CNPJ, razão social, contatos e endereço
// Integrado com Orçamentos, Insumos e outras abas
// ================================================================

GR.Modules.Fornecedores = {
    // ================================================================
    // CALLBACK PARA QUANDO UM FORNECEDOR É SALVO
    // ================================================================
    _callback: null,

    // ================================================================
    // RENDER - LISTA DE FORNECEDORES
    // ================================================================
    render: function() {
        var container = document.getElementById('lista-fornecedores');
        if (!container) return;

        var items = GR.State.data.fornecedores || [];
        
        // Ordena por nome
        items.sort(function(a, b) {
            return (a.nome || a.razaoSocial || '').localeCompare(b.nome || b.razaoSocial || '');
        });

        if (!items.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="icon">🏢</span>
                    <div class="message">Nenhum fornecedor cadastrado</div>
                    <div style="font-size:12px;color:var(--text-light);margin-top:8px;">
                        Clique em "➕ Novo Fornecedor" para começar
                    </div>
                </div>
            `;
            return;
        }

        // Estatísticas
        var total = items.length;
        var ativos = items.filter(function(f) { return f.ativo !== false; }).length;
        var inativos = total - ativos;
        var pj = items.filter(function(f) { return f.tipo === 'pj'; }).length;
        var pf = items.filter(function(f) { return f.tipo === 'pf'; }).length;

        // 🆕 Calcula fornecedores com pendências
        var comOrcamentos = 0;
        var comInsumos = 0;
        var orcamentos = GR.State.data.orcamentos || [];
        var insumos = GR.State.data.insumos || [];
        
        items.forEach(function(f) {
            var temOrc = orcamentos.some(function(o) { return o.fornecedorId === f.id; });
            var temIns = insumos.some(function(i) { return i.fornecedorId === f.id; });
            if (temOrc) comOrcamentos++;
            if (temIns) comInsumos++;
        });

        var html = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:12px;">
                <div class="stats-card" style="padding:10px;border-top:3px solid var(--primary);">
                    <div class="number" style="font-size:20px;color:var(--primary-dark);">${total}</div>
                    <div class="label" style="font-size:11px;">🏢 Total</div>
                </div>
                <div class="stats-card" style="padding:10px;border-top:3px solid var(--success);">
                    <div class="number" style="font-size:20px;color:var(--success);">${ativos}</div>
                    <div class="label" style="font-size:11px;">✅ Ativos</div>
                </div>
                <div class="stats-card" style="padding:10px;border-top:3px solid var(--danger);">
                    <div class="number" style="font-size:20px;color:var(--danger);">${inativos}</div>
                    <div class="label" style="font-size:11px;">⛔ Inativos</div>
                </div>
                <div class="stats-card" style="padding:10px;border-top:3px solid var(--info);">
                    <div class="number" style="font-size:20px;color:var(--info);">${pj}</div>
                    <div class="label" style="font-size:11px;">🏛️ PJ</div>
                </div>
                <div class="stats-card" style="padding:10px;border-top:3px solid var(--warning);">
                    <div class="number" style="font-size:20px;color:var(--warning);">${pf}</div>
                    <div class="label" style="font-size:11px;">👤 PF</div>
                </div>
                <div class="stats-card" style="padding:10px;border-top:3px solid var(--primary);">
                    <div class="number" style="font-size:20px;color:var(--primary);">${comOrcamentos}</div>
                    <div class="label" style="font-size:11px;">📄 Cotações</div>
                </div>
            </div>

            <!-- Barra de busca -->
            <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
                <input type="text" id="busca-fornecedor" placeholder="🔍 Buscar fornecedor..." 
                       style="flex:1;min-width:200px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;"
                       oninput="GR.Modules.Fornecedores._filtrar()">
                <select id="filtro-tipo-fornecedor" onchange="GR.Modules.Fornecedores._filtrar()"
                        style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;">
                    <option value="todos">📋 Todos</option>
                    <option value="pj">🏛️ PJ</option>
                    <option value="pf">👤 PF</option>
                    <option value="ativos">✅ Ativos</option>
                    <option value="inativos">⛔ Inativos</option>
                </select>
                <button class="btn btn-secondary" onclick="GR.Modules.Fornecedores._filtrar()" title="Limpar filtros">🔄 Limpar</button>
            </div>
        `;

        html += '<div class="table-responsive"><table><thead><tr>' +
            '<th>Nome/Razão Social</th>' +
            '<th>CPF/CNPJ</th>' +
            '<th>Tipo</th>' +
            '<th>Contato</th>' +
            '<th>Telefone</th>' +
            '<th>Status</th>' +
            '<th style="text-align:center;">Ações</th>' +
            '</tr></thead><tbody id="fornecedores-tbody">';

        items.forEach(function(f) {
            var tipoLabel = f.tipo === 'pj' ? '<span class="badge badge-primary">🏛️ PJ</span>' : '<span class="badge badge-info">👤 PF</span>';
            var statusBadge = f.ativo !== false ? 
                '<span class="badge badge-success">✅ Ativo</span>' : 
                '<span class="badge badge-danger">⛔ Inativo</span>';

            // 🆕 Verifica se tem pendências
            var temPendencia = orcamentos.some(function(o) { return o.fornecedorId === f.id && o.status === 'Pendente'; });
            var pendenciaBadge = temPendencia ? ' <span class="badge badge-warning" style="font-size:8px;">📌 pendente</span>' : '';

            var podeEditar = GR.Modules.Perfis ? GR.Modules.Perfis.podeEditar('configuracoes') : true;
            var podeExcluir = GR.Modules.Perfis ? GR.Modules.Perfis.podeExcluir('configuracoes') : true;

            html += '<tr data-id="' + f.id + '" data-nome="' + (f.nome || f.razaoSocial || '').toLowerCase() + '" data-tipo="' + (f.tipo || '') + '" data-ativo="' + (f.ativo !== false) + '">' +
                '<td><strong>' + GR.Utils.escapeHtml(f.nome || f.razaoSocial || 'N/A') + '</strong>' + pendenciaBadge + '</td>' +
                '<td>' + GR.Utils.escapeHtml(f.cpfcnpj || '-') + '</td>' +
                '<td>' + tipoLabel + '</td>' +
                '<td>' + GR.Utils.escapeHtml(f.contato || '-') + '</td>' +
                '<td>' + GR.Utils.escapeHtml(f.telefone || '-') + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td style="text-align:center;white-space:nowrap;">' +
                (podeEditar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Fornecedores.editar('${f.id}')" title="Editar fornecedor" style="font-size:9px;padding:2px 6px;">✏️</button> ` : '') +
                (podeExcluir ? `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Fornecedores.excluir('${f.id}')" title="Excluir fornecedor" style="font-size:9px;padding:2px 6px;">🗑️</button> ` : '') +
                `<button class="btn btn-sm ${f.ativo !== false ? 'btn-warning' : 'btn-success'}" onclick="GR.Modules.Fornecedores.ativarDesativar('${f.id}')" title="${f.ativo !== false ? 'Desativar' : 'Ativar'}" style="font-size:9px;padding:2px 6px;">
                    ${f.ativo !== false ? '⛔' : '✅'}
                </button>` +
                '</td></tr>';
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    },

    // ================================================================
    // FILTRAR FORNECEDORES
    // ================================================================
    _filtrar: function() {
        var busca = document.getElementById('busca-fornecedor');
        var filtroTipo = document.getElementById('filtro-tipo-fornecedor');
        
        var termo = busca ? busca.value.toLowerCase().trim() : '';
        var tipo = filtroTipo ? filtroTipo.value : 'todos';
        
        var rows = document.querySelectorAll('#fornecedores-tbody tr');
        var visiveis = 0;
        
        rows.forEach(function(row) {
            var nome = row.dataset.nome || '';
            var rowTipo = row.dataset.tipo || '';
            var ativo = row.dataset.ativo === 'true';
            
            var matchBusca = !termo || nome.includes(termo);
            var matchTipo = tipo === 'todos' || 
                           (tipo === 'ativos' && ativo) ||
                           (tipo === 'inativos' && !ativo) ||
                           (tipo === 'pj' && rowTipo === 'pj') ||
                           (tipo === 'pf' && rowTipo === 'pf');
            
            if (matchBusca && matchTipo) {
                row.style.display = '';
                visiveis++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Atualiza contador
        var contador = document.getElementById('fornecedores-contador');
        if (contador) {
            contador.textContent = visiveis + ' fornecedor(es) encontrado(s)';
        }
    },

    // ================================================================
    // ABRIR MODAL (COM CALLBACK)
    // ================================================================
    abrirModal: function(id, callback) {
        // 🆕 Guarda o callback para ser chamado após salvar
        this._callback = callback || null;
        
        var modalId = 'modal-fornecedor';
        
        if (id) {
            // Modo edição
            var items = GR.State.data.fornecedores || [];
            var fornecedor = items.find(function(f) { return f.id === id; });
            if (!fornecedor) {
                GR.Toast.error('Fornecedor não encontrado!');
                return;
            }
            
            setTimeout(function() {
                document.getElementById('forn-id-edit').value = id;
                document.getElementById('forn-tipo').value = fornecedor.tipo || 'pj';
                document.getElementById('forn-nome').value = fornecedor.nome || fornecedor.razaoSocial || '';
                document.getElementById('forn-cpfcnpj').value = fornecedor.cpfcnpj || '';
                document.getElementById('forn-nome-fantasia').value = fornecedor.nomeFantasia || '';
                document.getElementById('forn-inscricao-estadual').value = fornecedor.inscricaoEstadual || '';
                document.getElementById('forn-contato').value = fornecedor.contato || '';
                document.getElementById('forn-telefone').value = fornecedor.telefone || '';
                document.getElementById('forn-email').value = fornecedor.email || '';
                document.getElementById('forn-site').value = fornecedor.site || '';
                document.getElementById('forn-endereco').value = fornecedor.endereco || '';
                document.getElementById('forn-cidade').value = fornecedor.cidade || '';
                document.getElementById('forn-estado').value = fornecedor.estado || '';
                document.getElementById('forn-cep').value = fornecedor.cep || '';
                document.getElementById('forn-observacoes').value = fornecedor.observacoes || '';
                document.getElementById('forn-ativo').checked = fornecedor.ativo !== false;
                
                var title = document.querySelector('#modal-fornecedor .modal-title');
                if (title) title.textContent = '✏️ Editar Fornecedor - ' + (fornecedor.nome || fornecedor.razaoSocial);
                
                // Atualizar campos de endereço com base no CEP se disponível
                if (fornecedor.cep) {
                    GR.Modules.Fornecedores._buscarEnderecoPorCep(fornecedor.cep);
                }
            }, 100);
        } else {
            // Modo criação
            setTimeout(function() {
                document.getElementById('forn-id-edit').value = '';
                document.getElementById('forn-tipo').value = 'pj';
                document.getElementById('forn-nome').value = '';
                document.getElementById('forn-cpfcnpj').value = '';
                document.getElementById('forn-nome-fantasia').value = '';
                document.getElementById('forn-inscricao-estadual').value = '';
                document.getElementById('forn-contato').value = '';
                document.getElementById('forn-telefone').value = '';
                document.getElementById('forn-email').value = '';
                document.getElementById('forn-site').value = '';
                document.getElementById('forn-endereco').value = '';
                document.getElementById('forn-cidade').value = '';
                document.getElementById('forn-estado').value = '';
                document.getElementById('forn-cep').value = '';
                document.getElementById('forn-observacoes').value = '';
                document.getElementById('forn-ativo').checked = true;
                
                var title = document.querySelector('#modal-fornecedor .modal-title');
                if (title) title.textContent = '🏢 Novo Fornecedor';
            }, 100);
        }
        
        GR.Modal.open(modalId);
    },

    // ================================================================
    // SALVAR FORNECEDOR (COM CALLBACK)
    // ================================================================
    salvar: function() {
        var id = document.getElementById('forn-id-edit').value;
        var tipo = document.getElementById('forn-tipo').value;
        var nome = document.getElementById('forn-nome').value.trim();
        var cpfcnpj = document.getElementById('forn-cpfcnpj').value.trim();
        var nomeFantasia = document.getElementById('forn-nome-fantasia').value.trim();
        var inscricaoEstadual = document.getElementById('forn-inscricao-estadual').value.trim();
        var contato = document.getElementById('forn-contato').value.trim();
        var telefone = document.getElementById('forn-telefone').value.trim();
        var email = document.getElementById('forn-email').value.trim();
        var site = document.getElementById('forn-site').value.trim();
        var endereco = document.getElementById('forn-endereco').value.trim();
        var cidade = document.getElementById('forn-cidade').value.trim();
        var estado = document.getElementById('forn-estado').value.trim();
        var cep = document.getElementById('forn-cep').value.trim();
        var observacoes = document.getElementById('forn-observacoes').value.trim();
        var ativo = document.getElementById('forn-ativo').checked;

        if (!nome || !cpfcnpj) {
            GR.Toast.error('❌ Nome/Razão Social e CPF/CNPJ são obrigatórios!');
            return;
        }

        // Valida CPF/CNPJ
        var cpfcnpjLimpo = cpfcnpj.replace(/[^0-9]/g, '');
        if (cpfcnpjLimpo.length !== 11 && cpfcnpjLimpo.length !== 14) {
            GR.Toast.error('❌ CPF deve ter 11 dígitos ou CNPJ 14 dígitos!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            tipo: tipo,
            nome: GR.Utils.escapeHtml(nome),
            cpfcnpj: cpfcnpj,
            nomeFantasia: GR.Utils.escapeHtml(nomeFantasia),
            inscricaoEstadual: inscricaoEstadual,
            contato: GR.Utils.escapeHtml(contato),
            telefone: telefone,
            email: email,
            site: site,
            endereco: GR.Utils.escapeHtml(endereco),
            cidade: GR.Utils.escapeHtml(cidade),
            estado: estado,
            cep: cep,
            observacoes: GR.Utils.escapeHtml(observacoes),
            ativo: ativo,
            dataAtualizacao: GR.Utils.now()
        };

        // Verifica duplicidade de CPF/CNPJ
        var items = GR.State.data.fornecedores || [];
        var duplicado = items.find(function(f) {
            if (f.id === id) return false;
            return f.cpfcnpj === cpfcnpj;
        });

        if (duplicado) {
            GR.Toast.error('❌ Este CPF/CNPJ já está cadastrado para: ' + (duplicado.nome || duplicado.razaoSocial));
            return;
        }

        var collection = db.collection('users').doc(uid).collection('fornecedores');
        var self = this;

        function finalizar(fornecedorId) {
            GR.Modal.close('modal-fornecedor');
            GR.Toast.success('✅ Fornecedor salvo!');
            GR.State.adicionarHistorico('salvou fornecedor', 'Fornecedores', 'Nome: ' + nome);
            
            // 🆕 CHAMA O CALLBACK SE EXISTIR
            if (self._callback) {
                var callback = self._callback;
                self._callback = null;
                callback(fornecedorId);
            }
            
            // 🆕 DISPARA EVENTO PARA ATUALIZAR UI
            if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('fornecedor-salvo', {
                    detail: { id: fornecedorId, nome: nome }
                }));
            }
            
            GR.State.carregarDados().then(function() {
                GR.UI.refreshCurrentView();
                GR.Modules.Fornecedores.render();
            });
        }

        if (id) {
            // Atualiza
            collection.doc(id).update(dados)
                .then(function() {
                    finalizar(id);
                }).catch(function(err) {
                    GR.Toast.error('Erro ao atualizar: ' + err.message);
                });
        } else {
            // Cria novo
            dados.dataCriacao = GR.Utils.now();
            collection.add(dados)
                .then(function(docRef) {
                    finalizar(docRef.id);
                }).catch(function(err) {
                    GR.Toast.error('Erro ao salvar: ' + err.message);
                });
        }
    },

    // ================================================================
    // EDIÇÃO
    // ================================================================
    editar: function(id) {
        this.abrirModal(id);
    },

    // ================================================================
    // EXCLUIR (COM VERIFICAÇÃO DE USO)
    // ================================================================
    excluir: function(id) {
        if (GR.Modules.Perfis && !GR.Modules.Perfis.podeExcluir('configuracoes')) {
            GR.Toast.error('❌ Você não tem permissão para excluir!');
            return;
        }

        // Verifica se o fornecedor está sendo usado em orçamentos ou insumos
        var orcamentos = GR.State.data.orcamentos || [];
        var insumos = GR.State.data.insumos || [];
        
        var emUso = false;
        var locais = [];
        
        orcamentos.forEach(function(o) {
            if (o.fornecedorId === id || o.cnpj === id) {
                emUso = true;
                locais.push('Orçamento: ' + (o.numero || o.id));
            }
        });
        
        insumos.forEach(function(i) {
            if (i.fornecedorId === id) {
                emUso = true;
                locais.push('Insumo: ' + (i.nome || i.id));
            }
        });

        if (emUso) {
            if (!confirm('⚠️ Este fornecedor está sendo usado em:\n' + locais.join('\n') + 
                        '\n\nDeseja excluir mesmo assim? (Os dados permanecerão nos registros)')) {
                return;
            }
        } else {
            if (!confirm('⚠️ Tem certeza que deseja excluir este fornecedor?\nEsta ação não pode ser desfeita!')) {
                return;
            }
        }
        
        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }
        
        var uid = user.uid;
        db.collection('users').doc(uid).collection('fornecedores').doc(id).delete()
            .then(function() {
                GR.Toast.success('🗑️ Fornecedor excluído!');
                GR.State.adicionarHistorico('excluiu fornecedor', 'Fornecedores', 'ID: ' + id);
                GR.State.carregarDados().then(function() {
                    GR.UI.refreshCurrentView();
                    GR.Modules.Fornecedores.render();
                });
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // ATIVAR/DESATIVAR FORNECEDOR
    // ================================================================
    ativarDesativar: function(id) {
        var items = GR.State.data.fornecedores || [];
        var fornecedor = items.find(function(f) { return f.id === id; });
        if (!fornecedor) {
            GR.Toast.error('Fornecedor não encontrado!');
            return;
        }

        var novoStatus = fornecedor.ativo !== false ? false : true;
        var statusTexto = novoStatus ? 'ativar' : 'desativar';
        
        if (!confirm('⚠️ Deseja ' + statusTexto + ' o fornecedor ' + (fornecedor.nome || fornecedor.razaoSocial) + '?')) {
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        db.collection('users').doc(uid).collection('fornecedores').doc(id).update({
            ativo: novoStatus,
            dataAtualizacao: GR.Utils.now()
        }).then(function() {
            GR.Toast.success('✅ Fornecedor ' + (novoStatus ? 'ativado' : 'desativado') + '!');
            GR.State.carregarDados().then(function() {
                GR.UI.refreshCurrentView();
                GR.Modules.Fornecedores.render();
            });
        }).catch(function(err) {
            GR.Toast.error('Erro ao atualizar: ' + err.message);
        });
    },

    // ================================================================
    // BUSCAR ENDEREÇO POR CEP (VIA CORREIOS/VIACEP)
    // ================================================================
    _buscarEnderecoPorCep: function(cep) {
        var cepLimpo = cep.replace(/[^0-9]/g, '');
        if (cepLimpo.length !== 8) return;

        // Mostra loading
        var enderecoEl = document.getElementById('forn-endereco');
        if (enderecoEl) enderecoEl.placeholder = '⏳ Buscando endereço...';

        var url = 'https://viacep.com.br/ws/' + cepLimpo + '/json/';
        
        fetch(url)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.erro) {
                    GR.Toast.warning('CEP não encontrado!');
                    if (enderecoEl) enderecoEl.placeholder = 'Endereço';
                    return;
                }

                if (data.logradouro) {
                    var endereco = data.logradouro;
                    if (data.bairro) endereco += ', ' + data.bairro;
                    document.getElementById('forn-endereco').value = endereco;
                }
                if (data.localidade) {
                    document.getElementById('forn-cidade').value = data.localidade;
                }
                if (data.uf) {
                    document.getElementById('forn-estado').value = data.uf;
                }
                
                GR.Toast.success('✅ Endereço encontrado!');
                if (enderecoEl) enderecoEl.placeholder = 'Endereço';
            })
            .catch(function() {
                GR.Toast.warning('Erro ao buscar CEP');
                if (enderecoEl) enderecoEl.placeholder = 'Endereço';
            });
    },

    // ================================================================
    // LISTAR FORNECEDORES PARA SELECT
    // ================================================================
    listarParaSelect: function(selectId, selectedValue) {
        var select = document.getElementById(selectId);
        if (!select) return;

        var items = GR.State.data.fornecedores || [];
        var ativos = items.filter(function(f) { return f.ativo !== false; });
        
        // Ordena por nome
        ativos.sort(function(a, b) {
            return (a.nome || a.razaoSocial || '').localeCompare(b.nome || b.razaoSocial || '');
        });

        select.innerHTML = '<option value="">Selecione um fornecedor</option>';
        
        ativos.forEach(function(f) {
            var opt = document.createElement('option');
            opt.value = f.id;
            var nomeExibicao = f.nome || f.razaoSocial || 'N/A';
            var doc = f.cpfcnpj ? ' (' + f.cpfcnpj + ')' : '';
            opt.textContent = nomeExibicao + doc;
            select.appendChild(opt);
        });

        if (selectedValue) {
            select.value = selectedValue;
        }
    },

    // ================================================================
    // BUSCAR DADOS DO FORNECEDOR POR ID
    // ================================================================
    buscarPorId: function(id) {
        var items = GR.State.data.fornecedores || [];
        return items.find(function(f) { return f.id === id; });
    },

    // ================================================================
    // BUSCAR FORNECEDOR POR CPF/CNPJ
    // ================================================================
    buscarPorCpfCnpj: function(cpfcnpj) {
        var items = GR.State.data.fornecedores || [];
        return items.find(function(f) { return f.cpfcnpj === cpfcnpj; });
    },

    // ================================================================
    // SUGERIR FORNECEDOR AO DIGITAR (AUTOCOMPLETE)
    // ================================================================
    sugerir: function(inputId, containerId) {
        var input = document.getElementById(inputId);
        var container = document.getElementById(containerId);
        if (!input || !container) return;

        input.addEventListener('input', function() {
            var termo = this.value.toLowerCase().trim();
            if (!termo || termo.length < 2) {
                container.style.display = 'none';
                return;
            }

            var items = GR.State.data.fornecedores || [];
            var ativos = items.filter(function(f) { return f.ativo !== false; });
            var matches = ativos.filter(function(f) {
                var nome = (f.nome || f.razaoSocial || '').toLowerCase();
                var doc = (f.cpfcnpj || '').toLowerCase();
                return nome.includes(termo) || doc.includes(termo);
            });

            if (!matches.length) {
                container.style.display = 'none';
                return;
            }

            var html = '<div style="border:1px solid var(--border);border-radius:8px;background:var(--surface);max-height:200px;overflow-y:auto;position:absolute;z-index:1000;width:100%;">';
            matches.slice(0, 10).forEach(function(f) {
                html += '<div style="padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border-light);hover:background:var(--bg);" ' +
                        'onclick="GR.Modules.Fornecedores._selecionarSugestao(\'' + f.id + '\', \'' + inputId + '\', \'' + containerId + '\')">' +
                        '<strong>' + GR.Utils.escapeHtml(f.nome || f.razaoSocial) + '</strong>' +
                        ' <span style="color:var(--text-light);font-size:12px;">' + GR.Utils.escapeHtml(f.cpfcnpj) + '</span>' +
                        '</div>';
            });
            html += '</div>';
            container.innerHTML = html;
            container.style.display = 'block';
        });

        input.addEventListener('blur', function() {
            setTimeout(function() {
                container.style.display = 'none';
            }, 300);
        });
    },

    _selecionarSugestao: function(id, inputId, containerId) {
        var items = GR.State.data.fornecedores || [];
        var fornecedor = items.find(function(f) { return f.id === id; });
        if (!fornecedor) return;

        var input = document.getElementById(inputId);
        if (input) {
            input.value = fornecedor.nome || fornecedor.razaoSocial || '';
            // Dispara evento para preencher outros campos
            var event = new Event('change');
            input.dispatchEvent(event);
        }

        var container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }

        // Preenche dados automáticos se existirem campos relacionados
        this._preencherDadosFornecedor(fornecedor);
    },

    _preencherDadosFornecedor: function(fornecedor) {
        // Tenta preencher campos relacionados
        var campos = {
            'forn-cpfcnpj': fornecedor.cpfcnpj,
            'forn-contato': fornecedor.contato,
            'forn-telefone': fornecedor.telefone,
            'forn-email': fornecedor.email,
            'forn-endereco': fornecedor.endereco,
            'forn-cidade': fornecedor.cidade,
            'forn-estado': fornecedor.estado,
            'forn-cep': fornecedor.cep
        };

        Object.keys(campos).forEach(function(id) {
            var el = document.getElementById(id);
            if (el && campos[id]) {
                el.value = campos[id];
            }
        });
    }
};

console.log('✅ Módulo Fornecedores carregado com melhorias!');
console.log('📌 Melhorias ativas:');
console.log('   - 🆕 Callback após salvar (integração com Insumos/Orçamentos)');
console.log('   - 🆕 Evento "fornecedor-salvo" para atualizar UI');
console.log('   - 🆕 Card de cotações por fornecedor');
console.log('   - 🆕 Badge de pendências');
console.log('   - 🆕 Filtro "Inativos"');
console.log('   - 🆕 Estatísticas mais completas');