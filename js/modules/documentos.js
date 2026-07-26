// ================================================================
// MÓDULO: DOCUMENTOS - COM DESIGN IGUAL AOS RELATÓRIOS
// ================================================================

GR.Modules.Documentos = {
    // ================================================================
    // CONFIGURAÇÃO DOS TIPOS DE DOCUMENTO
    // ================================================================
    _tiposConfig: {
        'Escritura': { icon: '📜', cor: '#4CAF50', grupo: 'Propriedade' },
        'Matricula': { icon: '📋', cor: '#2196F3', grupo: 'Propriedade' },
        'ITR': { icon: '🧾', cor: '#FF9800', grupo: 'Propriedade' },
        'CCIR': { icon: '🏷️', cor: '#9C27B0', grupo: 'Propriedade' },
        'CAR': { icon: '🌳', cor: '#4CAF50', grupo: 'Propriedade' },
        'Georreferenciamento': { icon: '🗺️', cor: '#00BCD4', grupo: 'Propriedade' },
        'InscricaoEstadual': { icon: '🏛️', cor: '#3F51B5', grupo: 'Fiscal' },
        'NotaFiscal': { icon: '🧾', cor: '#F44336', grupo: 'Fiscal' },
        'Alvara': { icon: '📜', cor: '#8BC34A', grupo: 'Fiscal' },
        'CertidaoNegativa': { icon: '📑', cor: '#4CAF50', grupo: 'Fiscal' },
        'CertidaoPositiva': { icon: '📑', cor: '#F44336', grupo: 'Fiscal' },
        'Contrato': { icon: '📄', cor: '#00BCD4', grupo: 'Contratos' },
        'Licenca': { icon: '✅', cor: '#4CAF50', grupo: 'Contratos' },
        'Certidao': { icon: '📑', cor: '#3F51B5', grupo: 'Contratos' },
        'Laudo': { icon: '📋', cor: '#FF9800', grupo: 'Contratos' },
        'Projeto': { icon: '📐', cor: '#9C27B0', grupo: 'Contratos' },
        'Outros': { icon: '📎', cor: '#78909C', grupo: 'Outros' },
        'Comprovante': { icon: '💳', cor: '#4CAF50', grupo: 'Outros' },
        'Declaracao': { icon: '📄', cor: '#2196F3', grupo: 'Outros' },
        'Oficio': { icon: '📨', cor: '#FF9800', grupo: 'Outros' },
        'Memorial': { icon: '📝', cor: '#9C27B0', grupo: 'Outros' }
    },

    // ================================================================
    // RENDER PRINCIPAL
    // ================================================================
    render: function() {
        var div = document.getElementById('lista-documentos');
        if (!div) return;
        
        var items = GR.State.filtrarPorPropriedade(GR.State.data.documentos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }

        var totalDocs = items.length;
        var comArquivo = items.filter(function(d) { return d.arquivoUrl; }).length;
        var semArquivo = totalDocs - comArquivo;
        var tipos = {};
        items.forEach(function(d) {
            var tipo = d.tipo || 'Outros';
            tipos[tipo] = (tipos[tipo] || 0) + 1;
        });

        var html = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:16px;">
                <div class="card" style="padding:16px;text-align:center;cursor:default;border-top:4px solid var(--primary);">
                    <div style="font-size:28px;font-weight:700;color:var(--primary-dark);">${totalDocs}</div>
                    <div style="font-size:12px;color:var(--text-light);">📄 Total de Documentos</div>
                </div>
                <div class="card" style="padding:16px;text-align:center;cursor:default;border-top:4px solid var(--success);">
                    <div style="font-size:28px;font-weight:700;color:var(--success);">${comArquivo}</div>
                    <div style="font-size:12px;color:var(--text-light);">📎 Com Arquivo</div>
                </div>
                <div class="card" style="padding:16px;text-align:center;cursor:default;border-top:4px solid var(--warning);">
                    <div style="font-size:28px;font-weight:700;color:var(--warning);">${semArquivo}</div>
                    <div style="font-size:12px;color:var(--text-light);">📋 Sem Arquivo</div>
                </div>
                <div class="card" style="padding:16px;text-align:center;cursor:default;border-top:4px solid var(--info);">
                    <div style="font-size:28px;font-weight:700;color:var(--info);">${Object.keys(tipos).length}</div>
                    <div style="font-size:12px;color:var(--text-light);">🏷️ Tipos Diferentes</div>
                </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Documentos._filtrarPorTipo('todos')" style="font-size:11px;">📋 Todos</button>
                <button class="btn btn-sm btn-success" onclick="GR.Modules.Documentos._filtrarComArquivo(true)" style="font-size:11px;">📎 Com Arquivo</button>
                <button class="btn btn-sm btn-warning" onclick="GR.Modules.Documentos._filtrarComArquivo(false)" style="font-size:11px;">📋 Sem Arquivo</button>
                <button class="btn btn-sm btn-info" onclick="GR.Modules.Documentos._filtrarPorGrupo('Propriedade')" style="font-size:11px;">🏠 Propriedade</button>
                <button class="btn btn-sm btn-primary" onclick="GR.Modules.Documentos._filtrarPorGrupo('Fiscal')" style="font-size:11px;">💰 Fiscal</button>
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Documentos._filtrarPorGrupo('Contratos')" style="font-size:11px;">📄 Contratos</button>
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Documentos._filtrarPorGrupo('Outros')" style="font-size:11px;">📎 Outros</button>
            </div>
            <div class="card" style="padding:16px;">
                <div class="card-header" style="margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                    <div class="card-title" style="font-size:16px;font-weight:700;color:var(--primary-dark);">
                        <span class="emoji">📁</span> Documentos
                        <span style="font-size:12px;font-weight:400;color:var(--text-light);">(${totalDocs} documentos)</span>
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn btn-primary" onclick="GR.Modules.Documentos.abrirModal()" title="Adicionar novo documento">
                            ➕ Novo Documento
                        </button>
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Documentos.exportarLista()" title="Exportar lista de documentos">
                            📤 Exportar
                        </button>
                    </div>
                </div>
        `;

        if (!items.length) {
            html += `
                <div class="empty-state" style="padding:40px 20px;text-align:center;color:var(--text-light);">
                    <span class="icon" style="font-size:48px;display:block;margin-bottom:12px;">📁</span>
                    <div class="message" style="font-size:16px;font-weight:500;">Nenhum documento cadastrado</div>
                    <div style="font-size:12px;color:var(--text-light);margin-top:8px;">
                        Clique em "➕ Novo Documento" para adicionar
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Número</th>
                                <th>Propriedade</th>
                                <th>Descrição</th>
                                <th>Data</th>
                                <th>Arquivo</th>
                                <th style="text-align:center;">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            items.forEach(function(d) {
                var config = GR.Modules.Documentos._tiposConfig[d.tipo] || { icon: '📄', cor: '#78909C' };
                var icon = config.icon;
                var cor = config.cor;
                var dataExibicao = d.dataDocumento ? GR.Utils.formatarDataBR(d.dataDocumento) : 
                                   (d.dataCriacao ? GR.Utils.formatarDataBR(d.dataCriacao) : '-');

                var fileBadge = d.arquivoUrl ? 
                    '<span class="badge badge-success" style="font-size:9px;">📎 Anexado</span>' : 
                    '<span class="badge badge-secondary" style="font-size:9px;">📋 Sem arquivo</span>';

                var fileBtn = d.arquivoUrl ? 
                    `<button class="btn btn-info btn-sm" onclick="GR.Modules.Documentos.visualizarArquivo('${d.id}')" title="Visualizar arquivo" style="font-size:9px;padding:2px 6px;">👁️</button>` : 
                    `<span style="font-size:10px;color:var(--text-light);">—</span>`;

                html += `
                    <tr>
                        <td>
                            <span style="background:${cor};color:#fff;padding:2px 10px;border-radius:4px;font-size:10px;font-weight:600;display:inline-block;white-space:nowrap;">
                                ${icon} ${GR.Utils.escapeHtml(d.tipo)}
                            </span>
                        </td>
                        <td><strong>${GR.Utils.escapeHtml(d.numero || '-')}</strong></td>
                        <td>${GR.Utils.escapeHtml(d.propriedade || '-')}</td>
                        <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${GR.Utils.escapeHtml(d.descricao || '')}">
                            ${GR.Utils.escapeHtml(d.descricao || '-')}
                        </td>
                        <td>${dataExibicao}</td>
                        <td>${fileBadge}</td>
                        <td style="text-align:center;white-space:nowrap;">
                            ${fileBtn}
                            <button class="btn btn-primary btn-sm" onclick="GR.Modules.Documentos.editar('${d.id}')" title="Editar documento" style="font-size:9px;padding:2px 6px;">✏️</button>
                            <button class="btn btn-danger btn-sm" onclick="GR.Modules.Documentos.excluir('${d.id}')" title="Excluir documento" style="font-size:9px;padding:2px 6px;">🗑️</button>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            html += `
                <div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                    <span style="font-size:11px;color:var(--text-light);font-weight:600;">📊 Resumo por tipo:</span>
            `;

            var tiposOrdenados = Object.keys(tipos).sort();
            tiposOrdenados.forEach(function(tipo) {
                var config = GR.Modules.Documentos._tiposConfig[tipo] || { icon: '📄', cor: '#78909C' };
                var icon = config.icon;
                var cor = config.cor;
                html += `
                    <span style="font-size:10px;background:${cor};color:#fff;padding:2px 12px;border-radius:12px;display:inline-flex;align-items:center;gap:4px;">
                        ${icon} ${tipo}: <strong>${tipos[tipo]}</strong>
                    </span>
                `;
            });

            html += `
                </div>
            `;
        }

        html += `
            </div>
        `;

        div.innerHTML = html;
        
        console.log('📊 Documentos filtrados:', items.length, 'de', (GR.State.data.documentos || []).length);
    },

    // ================================================================
    // FILTROS
    // ================================================================
    _filtroTipoAtual: 'todos',
    _filtroGrupoAtual: null,

    _filtrarPorTipo: function(tipo) {
        this._filtroTipoAtual = tipo;
        this._filtroGrupoAtual = null;
        this._aplicarFiltros();
    },

    _filtrarPorGrupo: function(grupo) {
        this._filtroGrupoAtual = grupo;
        this._filtroTipoAtual = 'todos';
        this._aplicarFiltros();
    },

    _filtrarComArquivo: function(comArquivo) {
        this._filtroComArquivo = comArquivo;
        this._aplicarFiltros();
    },

    _aplicarFiltros: function() {
        var div = document.getElementById('lista-documentos');
        if (!div) return;
        
        var items = GR.State.filtrarPorPropriedade(GR.State.data.documentos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        
        if (this._filtroTipoAtual && this._filtroTipoAtual !== 'todos') {
            items = items.filter(function(item) {
                return item.tipo === this._filtroTipoAtual;
            }.bind(this));
        }
        
        if (this._filtroGrupoAtual) {
            items = items.filter(function(item) {
                var config = GR.Modules.Documentos._tiposConfig[item.tipo] || { grupo: 'Outros' };
                return config.grupo === this._filtroGrupoAtual;
            }.bind(this));
        }
        
        if (this._filtroComArquivo !== undefined) {
            items = items.filter(function(item) {
                return this._filtroComArquivo ? !!item.arquivoUrl : !item.arquivoUrl;
            }.bind(this));
        }
        
        this._renderListaFiltrada(div, items);
    },

    _renderListaFiltrada: function(div, filtrados) {
        if (!filtrados.length) {
            div.innerHTML = `
                <div class="empty-state" style="padding:40px 20px;text-align:center;color:var(--text-light);">
                    <span class="icon" style="font-size:48px;display:block;margin-bottom:12px;">🔍</span>
                    <div class="message" style="font-size:16px;font-weight:500;">Nenhum documento encontrado</div>
                    <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Documentos.render()" style="margin-top:12px;">
                        🔄 Limpar filtros
                    </button>
                </div>
            `;
            return;
        }
        
        this._renderDadosFiltrados(div, filtrados);
    },

    _renderDadosFiltrados: function(div, items) {
        var totalDocs = items.length;
        var comArquivo = items.filter(function(d) { return d.arquivoUrl; }).length;
        var semArquivo = totalDocs - comArquivo;
        var tipos = {};
        items.forEach(function(d) {
            var tipo = d.tipo || 'Outros';
            tipos[tipo] = (tipos[tipo] || 0) + 1;
        });

        var html = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px;">
                <div class="card" style="padding:12px;text-align:center;border-top:4px solid var(--primary);">
                    <div style="font-size:24px;font-weight:700;color:var(--primary-dark);">${totalDocs}</div>
                    <div style="font-size:11px;color:var(--text-light);">📄 Total</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:4px solid var(--success);">
                    <div style="font-size:24px;font-weight:700;color:var(--success);">${comArquivo}</div>
                    <div style="font-size:11px;color:var(--text-light);">📎 Com Arquivo</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:4px solid var(--warning);">
                    <div style="font-size:24px;font-weight:700;color:var(--warning);">${semArquivo}</div>
                    <div style="font-size:11px;color:var(--text-light);">📋 Sem Arquivo</div>
                </div>
                <div class="card" style="padding:12px;text-align:center;border-top:4px solid var(--info);">
                    <div style="font-size:24px;font-weight:700;color:var(--info);">${Object.keys(tipos).length}</div>
                    <div style="font-size:11px;color:var(--text-light);">🏷️ Tipos</div>
                </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Documentos.render()" style="font-size:10px;">🔙 Limpar</button>
                <span style="font-size:11px;color:var(--text-light);padding:4px 8px;">
                    Filtro aplicado: <strong>${this._filtroTipoAtual !== 'todos' ? this._filtroTipoAtual : (this._filtroGrupoAtual || 'Todos')}</strong>
                </span>
            </div>
            <div class="card" style="padding:16px;">
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Número</th>
                                <th>Propriedade</th>
                                <th>Descrição</th>
                                <th>Data</th>
                                <th>Arquivo</th>
                                <th style="text-align:center;">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        items.forEach(function(d) {
            var config = GR.Modules.Documentos._tiposConfig[d.tipo] || { icon: '📄', cor: '#78909C' };
            var icon = config.icon;
            var cor = config.cor;
            var dataExibicao = d.dataDocumento ? GR.Utils.formatarDataBR(d.dataDocumento) : 
                               (d.dataCriacao ? GR.Utils.formatarDataBR(d.dataCriacao) : '-');

            var fileBadge = d.arquivoUrl ? 
                '<span class="badge badge-success" style="font-size:9px;">📎 Anexado</span>' : 
                '<span class="badge badge-secondary" style="font-size:9px;">📋 Sem arquivo</span>';

            var fileBtn = d.arquivoUrl ? 
                `<button class="btn btn-info btn-sm" onclick="GR.Modules.Documentos.visualizarArquivo('${d.id}')" title="Visualizar arquivo" style="font-size:9px;padding:2px 6px;">👁️</button>` : 
                `<span style="font-size:10px;color:var(--text-light);">—</span>`;

            html += `
                <tr>
                    <td><span style="background:${cor};color:#fff;padding:2px 10px;border-radius:4px;font-size:10px;font-weight:600;display:inline-block;white-space:nowrap;">${icon} ${GR.Utils.escapeHtml(d.tipo)}</span></td>
                    <td><strong>${GR.Utils.escapeHtml(d.numero || '-')}</strong></td>
                    <td>${GR.Utils.escapeHtml(d.propriedade || '-')}</td>
                    <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${GR.Utils.escapeHtml(d.descricao || '')}">${GR.Utils.escapeHtml(d.descricao || '-')}</td>
                    <td>${dataExibicao}</td>
                    <td>${fileBadge}</td>
                    <td style="text-align:center;white-space:nowrap;">
                        ${fileBtn}
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Documentos.editar('${d.id}')" title="Editar" style="font-size:9px;padding:2px 6px;">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="GR.Modules.Documentos.excluir('${d.id}')" title="Excluir" style="font-size:9px;padding:2px 6px;">🗑️</button>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        div.innerHTML = html;
    },

    // ================================================================
    // ABRIR MODAL
    // ================================================================
    abrirModal: function(editId) {
        GR.State.ui.documentoEditando = editId || null;
        
        var titleEl = document.getElementById('modal-documento-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Documento' : '📁 Novo Documento';
        
        // Limpa os campos
        var tipoEl = document.getElementById('documento-tipo');
        if (tipoEl) tipoEl.value = 'Outros';
        
        var numeroEl = document.getElementById('documento-numero');
        if (numeroEl) numeroEl.value = '';
        
        var propEl = document.getElementById('doc-propriedade');
        if (propEl) propEl.value = '';
        
        var descEl = document.getElementById('doc-descricao');
        if (descEl) descEl.value = '';
        
        var dataEl = document.getElementById('doc-data');
        if (dataEl) dataEl.value = '';
        
        var arquivoEl = document.getElementById('doc-arquivo');
        if (arquivoEl) arquivoEl.value = '';
        
        GR.UI._atualizarSelectsPropriedade();

        if (editId) {
            var item = GR.State.data.documentos.find(function(d) { return d.id === editId; });
            if (item) {
                if (tipoEl) tipoEl.value = item.tipo || 'Outros';
                if (numeroEl) numeroEl.value = item.numero || '';
                if (propEl) propEl.value = item.propriedade || '';
                if (descEl) descEl.value = item.descricao || '';
                if (dataEl) dataEl.value = item.dataDocumento || '';
            }
        }
        
        GR.Modal.open('modal-documento');
    },

    editar: function(id) {
        this.abrirModal(id);
    },

    // ================================================================
    // SALVAR DOCUMENTO
    // ================================================================
    salvar: function() {
        console.log('📁 Iniciando salvamento de documento...');
        
        var tipoEl = document.getElementById('documento-tipo');
        var numeroEl = document.getElementById('documento-numero');
        var propEl = document.getElementById('doc-propriedade');
        var descEl = document.getElementById('doc-descricao');
        var dataEl = document.getElementById('doc-data');
        var arquivoEl = document.getElementById('doc-arquivo');

        // Verifica se os elementos existem
        if (!tipoEl || !propEl) {
            console.error('❌ Elementos do formulário não encontrados');
            GR.Toast.error('Erro ao carregar formulário. Recarregue a página.');
            return;
        }

        var tipo = tipoEl.value;
        var numero = numeroEl ? numeroEl.value.trim() : '';
        var propriedade = propEl.value;
        var descricao = descEl ? descEl.value.trim() : '';
        var dataDocumento = dataEl ? dataEl.value : '';

        if (!propriedade) {
            GR.Toast.error('Propriedade é obrigatória!');
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
            numero: GR.Utils.escapeHtml(numero),
            propriedade: GR.Utils.escapeHtml(propriedade),
            descricao: GR.Utils.escapeHtml(descricao),
            dataDocumento: dataDocumento || '',
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('documentos');
        var editId = GR.State.ui.documentoEditando;

        console.log('📁 Dados a serem salvos:', dados);

        // Função para salvar no banco
        function salvarNoBanco(dadosParaSalvar) {
            if (editId) {
                return ref.doc(editId).update(dadosParaSalvar).then(function() {
                    GR.Modal.close('modal-documento');
                    GR.Toast.success('Documento atualizado!');
                    GR.State.atualizarNoCache('documentos', editId, dadosParaSalvar);
                    GR.State.adicionarHistorico('editou documento', 'Documentos', 'Documento: ' + dadosParaSalvar.tipo);
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    console.error('❌ Erro ao atualizar:', err);
                    GR.Toast.error('Erro ao atualizar: ' + err.message);
                });
            } else {
                return ref.add(dadosParaSalvar).then(function(docRef) {
                    dadosParaSalvar.id = docRef.id;
                    GR.State.inserirNoCache('documentos', dadosParaSalvar);
                    GR.Modal.close('modal-documento');
                    GR.Toast.success('Documento salvo!');
                    GR.State.adicionarHistorico('criou documento', 'Documentos', 'Documento: ' + dadosParaSalvar.tipo);
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    console.error('❌ Erro ao salvar:', err);
                    GR.Toast.error('Erro ao salvar: ' + err.message);
                });
            }
        }

        // Verifica se tem arquivo para upload
        if (arquivoEl && arquivoEl.files && arquivoEl.files[0]) {
            var file = arquivoEl.files[0];
            
            if (file.size > 10 * 1024 * 1024) {
                GR.Toast.error('Arquivo muito grande! Máximo 10MB.');
                return;
            }
            
            var filePath = 'documentos/' + uid + '/' + Date.now() + '_' + file.name;
            var uploadTask = storage.ref(filePath).put(file);

            GR.Toast.info('📤 Fazendo upload do arquivo...');

            uploadTask.then(function(snapshot) {
                return snapshot.ref.getDownloadURL();
            }).then(function(downloadURL) {
                dados.arquivoUrl = downloadURL;
                dados.arquivoNome = file.name;
                dados.arquivoPath = filePath;
                console.log('📎 Arquivo enviado:', downloadURL);
                return salvarNoBanco(dados);
            }).catch(function(err) {
                console.error('❌ Erro no upload:', err);
                GR.Toast.error('Erro no upload: ' + err.message);
                // Tenta salvar sem o arquivo
                salvarNoBanco(dados);
            });
        } else if (editId) {
            // Edição sem novo arquivo - mantém o existente
            var item = GR.State.data.documentos.find(function(d) { return d.id === editId; });
            if (item) {
                if (item.arquivoUrl) {
                    dados.arquivoUrl = item.arquivoUrl;
                    dados.arquivoNome = item.arquivoNome;
                    dados.arquivoPath = item.arquivoPath;
                }
            }
            salvarNoBanco(dados);
        } else {
            // Novo documento sem arquivo
            salvarNoBanco(dados);
        }
    },

    visualizarArquivo: function(id) {
        var item = GR.State.data.documentos.find(function(d) { return d.id === id; });
        if (!item || !item.arquivoUrl) {
            GR.Toast.error('Arquivo não encontrado!');
            return;
        }
        window.open(item.arquivoUrl, '_blank');
    },

    excluir: function(id) {
        if (!confirm('Excluir este documento?')) return;
        
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        var item = GR.State.data.documentos.find(function(d) { return d.id === id; });
        
        db.collection('users').doc(uid).collection('documentos').doc(id).delete()
            .then(function() {
                if (item && item.arquivoPath) {
                    storage.ref(item.arquivoPath).delete().catch(function(err) {
                        console.warn('Erro ao excluir arquivo:', err);
                    });
                }
                GR.Toast.success('Documento excluído!');
                GR.State.removerDoCache('documentos', id);
                GR.State.adicionarHistorico('excluiu documento', 'Documentos', 'Documento ID: ' + id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },
    
    // ================================================================
    // EXPORTAR LISTA
    // ================================================================
    exportarLista: function() {
        try {
            var items = GR.State.filtrarPorPropriedade(GR.State.data.documentos || [], 'propriedade');
            var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
            if (propAtiva !== 'todas') {
                items = items.filter(function(item) {
                    return item.propriedade === propAtiva;
                });
            }
            
            var dados = {
                exportadoEm: new Date().toLocaleString('pt-BR'),
                propriedadeAtiva: propAtiva,
                total: items.length,
                documentos: items.map(function(d) {
                    return {
                        tipo: d.tipo,
                        numero: d.numero,
                        propriedade: d.propriedade,
                        descricao: d.descricao,
                        dataDocumento: d.dataDocumento,
                        dataCriacao: d.dataCriacao,
                        temArquivo: !!d.arquivoUrl
                    };
                })
            };
            
            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'documentos_export_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            
            GR.Toast.success('✅ Lista de documentos exportada!');
        } catch (e) {
            GR.Toast.error('Erro ao exportar: ' + e.message);
        }
    }
};

console.log('✅ Módulo Documentos carregado com design igual ao Relatórios!');