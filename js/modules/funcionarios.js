// ================================================================
// MÓDULO: FUNCIONÁRIOS - VERSÃO COMPLETA COM PERFIS
// ================================================================
// Funcionalidades:
//   1. CRUD de Funcionários com Foto
//   2. Upload de Documentos (Carteira de Trabalho, RG/CNH, Contratos)
//   3. Ponto Eletrônico Individual (para funcionários)
//   4. Emissão de Recibos de Pagamento (modelo padrão e customizado)
//   5. Dashboard Individual
//   6. Gestão de Férias, Afastados, Desligados
//   7. Relatórios e Exportações
//   8. 🆕 Integração com Perfis (criar/gerenciar perfil de funcionário)
// ================================================================

GR.Modules.Funcionarios = {

    // ================================================================
    // 1. RENDER PRINCIPAL
    // ================================================================
    render: function() {
        var div = document.getElementById('lista-funcionarios');
        if (!div) return;

        var items = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }

        var stats = this._calcularEstatisticas(items);
        var html = this._gerarStatsHTML(stats);
        html += this._gerarStatusActions(items);
        html += this._gerarTabelaFuncionarios(items);
        html += `
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
                <button class="btn btn-success" onclick="GR.Modules.Funcionarios.abrirModal()">➕ Novo Funcionário</button>
                <button class="btn btn-info" onclick="GR.Modules.Funcionarios.exportarLista()">📤 Exportar</button>
                <button class="btn btn-warning" onclick="GR.Modules.Funcionarios.abrirPontoColetivo()">📍 Ponto Coletivo</button>
                <button class="btn btn-secondary" onclick="GR.Modules.Funcionarios.abrirRelatorio()">📊 Relatório</button>
                <button class="btn btn-primary" onclick="GR.Modules.Funcionarios.abrirGerenciarStatus()">📋 Gerenciar Status</button>
                <button class="btn btn-purple" onclick="GR.Modules.Funcionarios.abrirModelosRecibo()">📄 Modelos de Recibo</button>
            </div>
        `;

        div.innerHTML = html;
        this._removerBotoesDuplicados();
    },

    // ================================================================
    // 2. ESTATÍSTICAS
    // ================================================================
    _calcularEstatisticas: function(items) {
        var stats = { 
            total: items.length, 
            ativos: 0, 
            ferias: 0, 
            afastados: 0, 
            desligados: 0, 
            somaSalarios: 0,
            comFoto: 0,
            comDocumentos: 0,
            comPerfil: 0
        };
        items.forEach(function(f) {
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

    _gerarStatsHTML: function(stats) {
        return `
            <div class="funcionario-stats-grid">
                <div class="funcionario-stats-card"><div class="number" style="color:#4CAF50;">${stats.ativos}</div><div class="label">✅ Ativos</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#FF9800;">${stats.ferias}</div><div class="label">🏖️ Férias</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#f44336;">${stats.afastados}</div><div class="label">⚠️ Afastados</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#9E9E9E;">${stats.desligados}</div><div class="label">🚫 Desligados</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#2196F3;">${stats.total}</div><div class="label">👨‍🌾 Total</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#1B5E20;">${GR.Utils.formatarMoedaBR(stats.somaSalarios)}</div><div class="label">💰 Folha Salarial</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#9C27B0;">${stats.comFoto}</div><div class="label">📸 Com Foto</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#00BCD4;">${stats.comDocumentos}</div><div class="label">📁 Com Docs</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#FF6F00;">${stats.comPerfil}</div><div class="label">🔑 Com Perfil</div></div>
            </div>
        `;
    },

    // ================================================================
    // 3. AÇÕES RÁPIDAS
    // ================================================================
    _gerarStatusActions: function(items) {
        var ativos = items.filter(function(f) { return f.status === 'Ativo'; }).length;
        var ferias = items.filter(function(f) { return f.status === 'Férias'; }).length;
        var afastados = items.filter(function(f) { return f.status === 'Afastado'; }).length;
        var desligados = items.filter(function(f) { return f.status === 'Desligado'; }).length;

        return `
            <div class="status-actions">
                <span style="font-weight:600;font-size:12px;margin-right:4px;">⚡ Ações Rápidas:</span>
                <button class="btn btn-success btn-sm" onclick="GR.Modules.Funcionarios.abrirGerenciarStatus('Ativo')">✅ Ativos (${ativos})</button>
                <button class="btn btn-warning btn-sm" onclick="GR.Modules.Funcionarios.abrirGerenciarStatus('Férias')">🏖️ Férias (${ferias})</button>
                <button class="btn btn-danger btn-sm" onclick="GR.Modules.Funcionarios.abrirGerenciarStatus('Afastado')">⚠️ Afastados (${afastados})</button>
                <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Funcionarios.abrirGerenciarStatus('Desligado')">🚫 Desligados (${desligados})</button>
                <button class="btn btn-info btn-sm" onclick="GR.Modules.Funcionarios.abrirModalFerias()">📅 Agendar Férias</button>
                <button class="btn btn-purple btn-sm" onclick="GR.Modules.Funcionarios.abrirPontoIndividual()">🕐 Ponto Individual</button>
            </div>
        `;
    },

    // ================================================================
    // 4. TABELA DE FUNCIONÁRIOS (COM BOTÃO 🔑)
    // ================================================================
    _gerarTabelaFuncionarios: function(items) {
        if (!items.length) {
            return '<div class="empty-state"><span class="icon">👨‍🌾</span><div class="message">Nenhum funcionário cadastrado</div></div>';
        }

        var rows = items.map(function(f) {
            var tel = f.telefone ? GR.Utils.formatarTelefone(f.telefone.ddd, f.telefone.numero) : '-';
            var statusBadge = f.status === 'Ativo' ? '<span class="badge-success">✅ Ativo</span>' :
                f.status === 'Férias' ? '<span class="badge-warning">🏖️ Férias</span>' :
                f.status === 'Afastado' ? '<span class="badge-danger">⚠️ Afastado</span>' :
                '<span class="badge-secondary">🚫 Desligado</span>';

            var fotoHtml = f.foto ? 
                `<img src="${f.foto}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid var(--border);" alt="Foto">` :
                '<span style="font-size:20px;">👤</span>';

            // Verifica se tem perfil
            var temPerfil = this.funcionarioTemPerfil(f.id);
            var perfilBtn = temPerfil ? 
                `<button class="btn btn-warning btn-sm" onclick="GR.Modules.Funcionarios.gerenciarPerfilFuncionario('${f.id}')" title="Gerenciar perfil de acesso">🔑</button>` :
                `<button class="btn btn-secondary btn-sm" onclick="GR.Modules.Funcionarios.criarPerfilFuncionario('${f.id}')" title="Criar perfil de acesso">🔑</button>`;

            var statusActions = `
                <div style="display:flex;gap:2px;flex-wrap:wrap;margin-top:2px;">
                    <button class="btn btn-success btn-sm" onclick="GR.Modules.Funcionarios.alterarStatus('${f.id}','Ativo')" title="Ativo" style="font-size:8px;padding:1px 4px;">✅</button>
                    <button class="btn btn-warning btn-sm" onclick="GR.Modules.Funcionarios.alterarStatus('${f.id}','Férias')" title="Férias" style="font-size:8px;padding:1px 4px;">🏖️</button>
                    <button class="btn btn-danger btn-sm" onclick="GR.Modules.Funcionarios.alterarStatus('${f.id}','Afastado')" title="Afastado" style="font-size:8px;padding:1px 4px;">⚠️</button>
                    <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Funcionarios.alterarStatus('${f.id}','Desligado')" title="Desligado" style="font-size:8px;padding:1px 4px;">🚫</button>
                </div>
            `;

            return '<tr>' +
                '<td>' + fotoHtml + '</td>' +
                '<td><strong>' + GR.Utils.escapeHtml(f.nome) + '</strong></td>' +
                '<td>' + GR.Utils.escapeHtml(f.cargo || '-') + '</td>' +
                '<td>' + (f.cpf ? GR.Utils.formatarCPF(f.cpf) : '-') + '</td>' +
                '<td>' + tel + '</td>' +
                '<td>' + GR.Utils.formatarMoedaBR(f.salario) + '</td>' +
                '<td>' + (f.admissao ? GR.Utils.formatarDataBR(f.admissao) : '-') + '</td>' +
                '<td>' + statusBadge + statusActions + '</td>' +
                '<td>' + GR.Utils.escapeHtml(f.propriedade || '-') + '</td>' +
                '<td>' +
                '<div class="funcionario-actions">' +
                '<button class="btn btn-info btn-sm" onclick="GR.Modules.Funcionarios.abrirDashboard(\'' + f.id + '\')" title="Dashboard">📊</button>' +
                '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Funcionarios.editar(\'' + f.id + '\')" title="Editar">✏️</button>' +
                '<button class="btn btn-success btn-sm" onclick="GR.Modules.Funcionarios.baterPontoIndividual(\'' + f.id + '\')" title="Bater Ponto">🕐</button>' +
                '<button class="btn btn-purple btn-sm" onclick="GR.Modules.Funcionarios.abrirDocumentos(\'' + f.id + '\')" title="Documentos">📁</button>' +
                '<button class="btn btn-warning btn-sm" onclick="GR.Modules.Funcionarios.emitirRecibo(\'' + f.id + '\')" title="Emitir Recibo">📄</button>' +
                perfilBtn +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Funcionarios.excluir(\'' + f.id + '\')" title="Excluir">🗑️</button>' +
                '</div>' +
                '</td>' +
                '</tr>';
        }).join('');

        return '<div class="table-responsive"><table><thead><tr><th>📸</th><th>Nome</th><th>Cargo</th><th>CPF</th><th>Telefone</th><th>Salário</th><th>Admissão</th><th>Status</th><th>Propriedade</th><th>Ações</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    },

    // ================================================================
    // 5. CRUD COMPLETO COM FOTO
    // ================================================================
    abrirModal: function(editId) {
        GR.State.ui.funcionarioEditando = editId || null;
        document.getElementById('modal-funcionario-title').textContent = editId ? '✏️ Editar Funcionário' : '👨‍🌾 Novo Funcionário';
        
        // Limpa campos
        document.getElementById('func-nome').value = '';
        document.getElementById('func-cpf').value = '';
        document.getElementById('func-ddd').value = '';
        document.getElementById('func-telefone').value = '';
        document.getElementById('func-cargo').value = '';
        document.getElementById('func-salario').value = '0,00';
        document.getElementById('func-admissao').value = '';
        document.getElementById('func-status').value = 'Ativo';
        document.getElementById('func-foto-preview').innerHTML = '';
        document.getElementById('func-foto-url').value = '';
        document.getElementById('func-tipo-contrato').value = 'CLT';
        document.getElementById('func-data-termino').value = '';
        document.getElementById('func-obs').value = '';
        
        if (GR.UI && typeof GR.UI._atualizarSelectsPropriedade === 'function') {
            GR.UI._atualizarSelectsPropriedade();
        }

        if (editId) {
            var item = GR.State.data.funcionarios.find(function(f) { return f.id === editId; });
            if (item) {
                document.getElementById('func-nome').value = item.nome || '';
                document.getElementById('func-cpf').value = item.cpf || '';
                document.getElementById('func-ddd').value = item.telefone?.ddd || '';
                document.getElementById('func-telefone').value = item.telefone?.numero || '';
                document.getElementById('func-cargo').value = item.cargo || '';
                document.getElementById('func-salario').value = GR.Utils.formatarMoedaSemSimbolo(item.salario || 0);
                document.getElementById('func-admissao').value = item.admissao || '';
                document.getElementById('func-status').value = item.status || 'Ativo';
                document.getElementById('func-propriedade').value = item.propriedade || '';
                document.getElementById('func-tipo-contrato').value = item.tipoContrato || 'CLT';
                document.getElementById('func-data-termino').value = item.dataTermino || '';
                document.getElementById('func-obs').value = item.obs || '';
                if (item.foto) {
                    document.getElementById('func-foto-preview').innerHTML = `<img src="${item.foto}" style="max-width:100px;max-height:100px;border-radius:8px;border:1px solid var(--border);">`;
                    document.getElementById('func-foto-url').value = item.foto;
                }
            }
        }
        GR.Modal.open('modal-funcionario');
    },

    salvar: function() {
        var nome = document.getElementById('func-nome').value.trim();
        var cpf = document.getElementById('func-cpf').value.trim();
        var ddd = document.getElementById('func-ddd').value.trim();
        var telefone = document.getElementById('func-telefone').value.trim();
        var cargo = document.getElementById('func-cargo').value.trim();
        var salario = GR.Utils.parseMoedaBR(document.getElementById('func-salario').value);
        var admissao = document.getElementById('func-admissao').value;
        var status = document.getElementById('func-status').value;
        var propriedade = document.getElementById('func-propriedade').value;
        var foto = document.getElementById('func-foto-url').value.trim();
        var tipoContrato = document.getElementById('func-tipo-contrato').value;
        var dataTermino = document.getElementById('func-data-termino').value;
        var obs = document.getElementById('func-obs').value.trim();

        if (!nome) { GR.Toast.error('Nome é obrigatório!'); return; }
        if (cpf && !GR.Utils.validarCPF(cpf)) { GR.Toast.error('CPF inválido!'); return; }

        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            cpf: cpf || '',
            telefone: (ddd || telefone) ? { ddd: ddd, numero: telefone } : null,
            cargo: GR.Utils.escapeHtml(cargo),
            salario: salario || 0,
            admissao: admissao || '',
            status: status,
            propriedade: GR.Utils.escapeHtml(propriedade),
            foto: foto || null,
            tipoContrato: tipoContrato || 'CLT',
            dataTermino: dataTermino || '',
            obs: GR.Utils.escapeHtml(obs),
            dataAtualizacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(user.uid).collection('funcionarios');
        var editId = GR.State.ui.funcionarioEditando;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-funcionario');
                GR.Toast.success('Funcionário atualizado!');
                GR.State.adicionarHistorico('editou funcionário', 'Funcionários', 'Funcionário: ' + nome);
                GR.State.atualizarNoCache('funcionarios', editId, dados);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            dados.dataCriacao = GR.Utils.now();
            ref.add(dados).then(function(docRef) {
                dados.id = docRef.id;
                GR.State.inserirNoCache('funcionarios', dados);
                GR.Modal.close('modal-funcionario');
                GR.Toast.success('Funcionário salvo!');
                GR.State.adicionarHistorico('criou funcionário', 'Funcionários', 'Funcionário: ' + nome);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    // Upload de foto
    uploadFoto: function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            
            var reader = new FileReader();
            reader.onload = function(ev) {
                var dataUrl = ev.target.result;
                document.getElementById('func-foto-preview').innerHTML = 
                    `<img src="${dataUrl}" style="max-width:100px;max-height:100px;border-radius:8px;border:1px solid var(--border);">`;
                document.getElementById('func-foto-url').value = dataUrl;
                GR.Toast.success('Foto carregada!');
            };
            reader.readAsDataURL(file);
        };
        input.click();
    },

    editar: function(id) { this.abrirModal(id); },

    excluir: function(id) {
        if (!confirm('Excluir este funcionário?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        db.collection('users').doc(user.uid).collection('funcionarios').doc(id).delete()
            .then(function() {
                GR.Toast.success('Funcionário excluído!');
                GR.State.adicionarHistorico('excluiu funcionário', 'Funcionários', 'Funcionário ID: ' + id);
                GR.State.removerDoCache('funcionarios', id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // 6. DOCUMENTOS DO FUNCIONÁRIO
    // ================================================================
    abrirDocumentos: function(funcionarioId) {
        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        if (!f) { GR.Toast.error('Funcionário não encontrado!'); return; }

        var modal = document.createElement('div');
        modal.id = 'modal-documentos-funcionario';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal-content" style="max-width:700px;max-height:95vh;overflow-y:auto;">
                <div class="modal-header">
                    <h2 class="modal-title">📁 Documentos - ${GR.Utils.escapeHtml(f.nome)}</h2>
                    <button class="close-btn" onclick="GR.Modal.close('modal-documentos-funcionario')">×</button>
                </div>
                <div id="documentos-funcionario-content"></div>
            </div>
        `;
        document.body.appendChild(modal);
        GR.Modal.open('modal-documentos-funcionario');
        
        this._renderizarDocumentos(funcionarioId);
    },

    _renderizarDocumentos: function(funcionarioId) {
        var content = document.getElementById('documentos-funcionario-content');
        if (!content) return;

        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        if (!f) { content.innerHTML = '<div class="empty-state"><span class="icon">📁</span><div class="message">Funcionário não encontrado</div></div>'; return; }

        var docs = f.documentos || {};

        var html = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                <div style="background:var(--surface);border-radius:6px;padding:12px;border:1px solid var(--border);">
                    <h4 style="margin:0 0 8px 0;">🪪 Documento Oficial</h4>
                    ${this._renderizarDocUpload('rg', 'RG / CNH', funcionarioId)}
                    ${docs.rg ? `<div style="margin-top:4px;font-size:11px;color:var(--success);">✅ Documento anexado</div>` : ''}
                </div>
                <div style="background:var(--surface);border-radius:6px;padding:12px;border:1px solid var(--border);">
                    <h4 style="margin:0 0 8px 0;">📋 Carteira de Trabalho</h4>
                    ${this._renderizarDocUpload('ctps', 'CTPS', funcionarioId)}
                    ${docs.ctps ? `<div style="margin-top:4px;font-size:11px;color:var(--success);">✅ Documento anexado</div>` : ''}
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                <div style="background:var(--surface);border-radius:6px;padding:12px;border:1px solid var(--border);">
                    <h4 style="margin:0 0 8px 0;">📄 Contrato de Trabalho</h4>
                    ${this._renderizarDocUpload('contrato', 'Contrato', funcionarioId)}
                    ${docs.contrato ? `<div style="margin-top:4px;font-size:11px;color:var(--success);">✅ Documento anexado</div>` : ''}
                </div>
                <div style="background:var(--surface);border-radius:6px;padding:12px;border:1px solid var(--border);">
                    <h4 style="margin:0 0 8px 0;">📎 Outros Documentos</h4>
                    ${this._renderizarDocUpload('outros', 'Outros', funcionarioId)}
                    ${docs.outros ? `<div style="margin-top:4px;font-size:11px;color:var(--success);">✅ Documento anexado</div>` : ''}
                </div>
            </div>
            <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
                <button class="btn btn-secondary" onclick="GR.Modal.close('modal-documentos-funcionario')">Fechar</button>
            </div>
        `;

        content.innerHTML = html;
    },

    _renderizarDocUpload: function(tipo, label, funcionarioId) {
        return `
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
                <button class="btn btn-primary btn-sm" onclick="GR.Modules.Funcionarios._uploadDocumento('${funcionarioId}','${tipo}','${label}')">
                    📤 Upload
                </button>
                <button class="btn btn-danger btn-sm" onclick="GR.Modules.Funcionarios._removerDocumento('${funcionarioId}','${tipo}')">
                    🗑️ Remover
                </button>
            </div>
        `;
    },

    _uploadDocumento: function(funcionarioId, tipo, label) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            
            var reader = new FileReader();
            reader.onload = function(ev) {
                var dataUrl = ev.target.result;
                var user = firebase.auth().currentUser;
                if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

                var ref = db.collection('users').doc(user.uid).collection('funcionarios').doc(funcionarioId);
                var update = {};
                update['documentos.' + tipo] = {
                    nome: file.name,
                    tipo: tipo,
                    data: GR.Utils.now(),
                    conteudo: dataUrl,
                    tamanho: file.size
                };
                
                ref.update(update).then(function() {
                    GR.Toast.success('📁 ' + label + ' anexado com sucesso!');
                    GR.State.adicionarHistorico('anexou documento', 'Funcionários', tipo + ' - ' + file.name);
                    GR.Modules.Funcionarios._renderizarDocumentos(funcionarioId);
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao anexar: ' + err.message);
                });
            };
            reader.readAsDataURL(file);
        };
        input.click();
    },

    _removerDocumento: function(funcionarioId, tipo) {
        if (!confirm('Remover este documento?')) return;
        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var ref = db.collection('users').doc(user.uid).collection('funcionarios').doc(funcionarioId);
        var update = {};
        update['documentos.' + tipo] = firebase.firestore.FieldValue.delete();
        
        ref.update(update).then(function() {
            GR.Toast.success('Documento removido!');
            GR.Modules.Funcionarios._renderizarDocumentos(funcionarioId);
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro ao remover: ' + err.message);
        });
    },

    // ================================================================
    // 7. PONTO INDIVIDUAL (PARA FUNCIONÁRIOS)
    // ================================================================
    abrirPontoIndividual: function() {
        var modal = document.createElement('div');
        modal.id = 'modal-ponto-individual';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal-content" style="max-width:500px;max-height:95vh;overflow-y:auto;">
                <div class="modal-header">
                    <h2 class="modal-title">🕐 Ponto Individual</h2>
                    <button class="close-btn" onclick="GR.Modal.close('modal-ponto-individual')">×</button>
                </div>
                <div id="ponto-individual-content"></div>
            </div>
        `;
        document.body.appendChild(modal);
        GR.Modal.open('modal-ponto-individual');
        this._renderizarPontoIndividual();
    },

    _renderizarPontoIndividual: function() {
        var content = document.getElementById('ponto-individual-content');
        if (!content) return;

        var funcionarios = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            funcionarios = funcionarios.filter(function(f) { return f.propriedade === propAtiva; });
        }

        var hoje = GR.Utils.now().slice(0, 10);
        var pontos = GR.State.data.pontos || [];

        var html = `
            <div style="margin-bottom:12px;">
                <label style="font-weight:600;font-size:13px;">Selecione o funcionário:</label>
                <select id="ponto-individual-select" class="form-control" onchange="GR.Modules.Funcionarios._carregarPontoIndividual()">
                    <option value="">Selecione...</option>
                    ${funcionarios.map(function(f) {
                        return `<option value="${f.id}">${GR.Utils.escapeHtml(f.nome)} (${f.cargo || 'Sem cargo'})</option>`;
                    }).join('')}
                </select>
            </div>
            <div id="ponto-individual-dados">
                <div style="text-align:center;padding:20px;color:var(--text-light);">
                    Selecione um funcionário para bater ponto
                </div>
            </div>
        `;

        content.innerHTML = html;
    },

    _carregarPontoIndividual: function() {
        var select = document.getElementById('ponto-individual-select');
        var div = document.getElementById('ponto-individual-dados');
        if (!select || !div) return;

        var funcionarioId = select.value;
        if (!funcionarioId) {
            div.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-light);">Selecione um funcionário</div>';
            return;
        }

        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        if (!f) { div.innerHTML = '<div style="color:var(--danger);">Funcionário não encontrado</div>'; return; }

        var hoje = GR.Utils.now().slice(0, 10);
        var pontos = GR.State.data.pontos || [];
        var pontosHoje = pontos.filter(function(p) { 
            return p.funcionarioId === funcionarioId && p.data === hoje; 
        });
        var pontoAberto = pontosHoje.find(function(p) { return p.saida === null; });

        var html = `
            <div style="background:var(--surface);border-radius:6px;padding:12px;border:1px solid var(--border);">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">
                    <div>
                        <strong>${GR.Utils.escapeHtml(f.nome)}</strong>
                        <span style="font-size:12px;color:var(--text-light);margin-left:4px;">${f.cargo || ''}</span>
                    </div>
                    <div style="display:flex;gap:4px;">
                        ${pontoAberto ? 
                            `<button class="btn btn-danger" onclick="GR.Modules.Funcionarios._finalizarPontoIndividual('${funcionarioId}')">⏹️ Finalizar Ponto</button>` :
                            `<button class="btn btn-success" onclick="GR.Modules.Funcionarios._baterPontoIndividual('${funcionarioId}')">🕐 Bater Ponto</button>`
                        }
                    </div>
                </div>
                ${pontoAberto ? `
                    <div style="margin-top:8px;display:flex;gap:12px;flex-wrap:wrap;font-size:12px;">
                        <span>📅 ${GR.Utils.formatarDataBR(hoje)}</span>
                        <span>⏰ Entrada: ${pontoAberto.entrada || '-'}</span>
                        <span>📍 Talhão: ${pontoAberto.talhao || '-'}</span>
                        <span style="color:var(--success);">🟢 Em andamento</span>
                    </div>
                ` : pontosHoje.length ? `
                    <div style="margin-top:8px;font-size:12px;color:var(--text-light);">
                        ✅ Ponto finalizado hoje às ${pontosHoje[0].saida || '-'}
                    </div>
                ` : `
                    <div style="margin-top:8px;font-size:12px;color:var(--text-light);">
                        ⏳ Nenhum ponto registrado hoje
                    </div>
                `}

                ${pontosHoje.length ? `
                    <div style="margin-top:8px;border-top:1px solid var(--border-light);padding-top:8px;font-size:11px;color:var(--text-light);">
                        📋 Últimos registros:
                        ${pontosHoje.slice(-5).map(function(p) {
                            return `<div>• ${p.entrada || '-'} → ${p.saida || '⏳'} ${p.talhao ? '| 📍 ' + p.talhao : ''}</div>`;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        div.innerHTML = html;
    },

    _baterPontoIndividual: function(funcionarioId) {
        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        if (!f) { GR.Toast.error('Funcionário não encontrado!'); return; }

        var talhao = prompt('📍 Talhão: (opcional)') || 'Geral';
        var hoje = GR.Utils.now().slice(0, 10);
        var agora = GR.Utils.now().slice(11, 16);

        db.collection('users').doc(user.uid).collection('pontos').add({
            funcionarioId: funcionarioId,
            funcionarioNome: f.nome,
            data: hoje,
            entrada: agora,
            saida: null,
            talhao: talhao,
            propriedade: f.propriedade || GR.State.ui.propriedadeAtiva || 'todas',
            status: 'aberto',
            origem: 'ponto_individual',
            dataCriacao: GR.Utils.now()
        }).then(function() {
            GR.Toast.success('✅ Ponto registrado para ' + f.nome + '!');
            GR.State.adicionarHistorico('bateu ponto individual', 'Ponto', 'Funcionário: ' + f.nome);
            GR.Modules.Funcionarios._carregarPontoIndividual();
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro: ' + err.message);
        });
    },

    _finalizarPontoIndividual: function(funcionarioId) {
        if (!confirm('Finalizar o ponto deste funcionário?')) return;
        
        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var hoje = GR.Utils.now().slice(0, 10);
        var agora = GR.Utils.now().slice(11, 16);
        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        
        var pontos = GR.State.data.pontos || [];
        var pontoAberto = pontos.find(function(p) { 
            return p.funcionarioId === funcionarioId && p.data === hoje && p.saida === null; 
        });

        if (!pontoAberto) {
            GR.Toast.warning('Nenhum ponto aberto para este funcionário.');
            return;
        }

        db.collection('users').doc(user.uid).collection('pontos').doc(pontoAberto.id).update({
            saida: agora,
            status: 'finalizado'
        }).then(function() {
            GR.Toast.success('✅ Ponto finalizado para ' + (f ? f.nome : '') + '!');
            GR.Modules.Funcionarios._carregarPontoIndividual();
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro: ' + err.message);
        });
    },

    // ================================================================
    // 8. PONTO COLETIVO
    // ================================================================
    abrirPontoColetivo: function() {
        var content = document.getElementById('ponto-coletivo-content');
        if (!content) {
            var modal = document.createElement('div');
            modal.id = 'modal-ponto-coletivo';
            modal.className = 'modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.innerHTML = `
                <div class="modal-content" style="max-width:1000px;max-height:95vh;overflow-y:auto;">
                    <div class="modal-header">
                        <h2 class="modal-title">📍 Ponto Coletivo</h2>
                        <button class="close-btn" onclick="GR.Modal.close('modal-ponto-coletivo')">×</button>
                    </div>
                    <div id="ponto-coletivo-content"></div>
                </div>
            `;
            document.body.appendChild(modal);
            GR.Modal.open('modal-ponto-coletivo');
            content = document.getElementById('ponto-coletivo-content');
        }
        if (!content) { 
            GR.Toast.error('Ponto Coletivo não disponível.');
            return;
        }

        var funcionarios = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            funcionarios = funcionarios.filter(function(f) { return f.propriedade === propAtiva; });
        }

        var hoje = GR.Utils.now().slice(0, 10);
        var pontos = GR.State.data.pontos || [];
        var pontosHoje = pontos.filter(function(p) { return p.data === hoje; });

        var html = `
            <div style="margin-bottom:12px;">
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    <div style="font-weight:600;">📅 ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <button class="btn btn-success btn-sm" onclick="GR.Modules.Funcionarios._baterPontoEmLote()">🕐 Bater Ponto em Lote</button>
                    <button class="btn btn-info btn-sm" onclick="GR.Modules.Funcionarios._gerarRelatorioPontoDia()">📊 Relatório do Dia</button>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="background:var(--surface);border-radius:6px;padding:8px;border:1px solid var(--border);">
                    <h4 style="margin:0 0 6px 0;">✅ Presentes (${pontosHoje.filter(p => p.saida === null).length})</h4>
                    ${this._renderizarPresentes(pontosHoje, funcionarios)}
                </div>
                <div style="background:var(--surface);border-radius:6px;padding:8px;border:1px solid var(--border);">
                    <h4 style="margin:0 0 6px 0;">⏳ Ausentes</h4>
                    ${this._renderizarAusentes(pontosHoje, funcionarios)}
                </div>
            </div>

            <div style="margin-top:12px;">
                <h4 style="margin:0 0 6px 0;">📋 Todos os Registros de Hoje</h4>
                ${this._renderizarTabelaPontoHoje(pontosHoje, funcionarios)}
            </div>
        `;

        content.innerHTML = html;
    },

    _renderizarPresentes: function(pontos, funcionarios) {
        var presentes = pontos.filter(function(p) { return p.saida === null; });
        if (!presentes.length) {
            return '<div style="color:var(--text-light);font-size:13px;">Nenhum funcionário presente hoje.</div>';
        }
        return '<div style="display:flex;flex-wrap:wrap;gap:4px;">' +
            presentes.map(function(p) {
                var f = funcionarios.find(function(func) { return func.id === p.funcionarioId; });
                var nome = f ? f.nome : p.funcionarioNome || 'Desconhecido';
                return '<span class="badge-success" style="padding:4px 8px;font-size:12px;border-radius:12px;">' +
                    '👤 ' + GR.Utils.escapeHtml(nome) +
                    (p.talhao ? ' 📍 ' + GR.Utils.escapeHtml(p.talhao) : '') +
                    ' ⌚ ' + p.entrada +
                    '</span>';
            }).join('') +
        '</div>';
    },

    _renderizarAusentes: function(pontos, funcionarios) {
        var idsPresentes = new Set(pontos.map(function(p) { return p.funcionarioId; }));
        var ausentes = funcionarios.filter(function(f) {
            return f.status === 'Ativo' && !idsPresentes.has(f.id);
        });
        if (!ausentes.length) {
            return '<div style="color:var(--text-light);font-size:13px;">Todos os funcionários estão presentes!</div>';
        }
        return '<div style="display:flex;flex-wrap:wrap;gap:4px;">' +
            ausentes.map(function(f) {
                return '<span class="badge-danger" style="padding:4px 8px;font-size:12px;border-radius:12px;">' +
                    '👤 ' + GR.Utils.escapeHtml(f.nome) +
                    '</span>';
            }).join('') +
        '</div>';
    },

    _renderizarTabelaPontoHoje: function(pontos, funcionarios) {
        if (!pontos.length) {
            return '<div class="empty-state"><span class="icon">📍</span><div class="message">Nenhum registro de ponto hoje</div></div>';
        }
        var rows = pontos.sort(function(a, b) {
            return (a.entrada || '').localeCompare(b.entrada || '');
        }).map(function(p) {
            var f = funcionarios.find(function(func) { return func.id === p.funcionarioId; });
            var nome = f ? f.nome : p.funcionarioNome || 'Desconhecido';
            var status = p.saida ? '✅ Finalizado' : '🟢 Em andamento';
            var badge = p.saida ? 'badge-success' : 'badge-warning';
            return '<tr><td>' + GR.Utils.escapeHtml(nome) + '</td><td>' + (p.entrada || '-') + '</td><td>' + (p.saida || '⏳') + '</td><td>' + (p.talhao || '-') + '</td><td><span class="' + badge + '">' + status + '</span></td><td>' + (p.saida ? '' : '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Funcionarios._finalizarPonto(\'' + p.id + '\')">⏹️</button>') + '</td></tr>';
        }).join('');
        return '<div class="table-responsive"><table><thead><tr><th>Funcionário</th><th>Entrada</th><th>Saída</th><th>Talhão</th><th>Status</th><th>Ações</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    },

    _baterPontoEmLote: function() {
        var funcionarios = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            funcionarios = funcionarios.filter(function(f) { return f.propriedade === propAtiva; });
        }
        var ativos = funcionarios.filter(function(f) { return f.status === 'Ativo'; });
        if (!ativos.length) {
            GR.Toast.warning('Nenhum funcionário ativo para bater ponto.');
            return;
        }

        var talhao = prompt('Qual o talhão de hoje? (opcional)') || 'Geral';
        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var hoje = GR.Utils.now().slice(0, 10);
        var agora = GR.Utils.now().slice(11, 16);
        var ref = db.collection('users').doc(user.uid).collection('pontos');

        var promises = ativos.map(function(f) {
            var jaTem = (GR.State.data.pontos || []).some(function(p) {
                return p.funcionarioId === f.id && p.data === hoje && p.saida === null;
            });
            if (jaTem) return Promise.resolve();
            return ref.add({
                funcionarioId: f.id,
                funcionarioNome: f.nome,
                data: hoje,
                entrada: agora,
                saida: null,
                talhao: talhao,
                propriedade: f.propriedade || propAtiva,
                status: 'aberto',
                origem: 'ponto_coletivo',
                dataCriacao: GR.Utils.now()
            });
        });

        Promise.all(promises).then(function() {
            GR.Toast.success('✅ Ponto batido para ' + ativos.length + ' funcionários!');
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro: ' + err.message);
        });
    },

    _finalizarPonto: function(docId) {
        if (!confirm('Finalizar este ponto?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var agora = GR.Utils.now().slice(11, 16);
        db.collection('users').doc(user.uid).collection('pontos').doc(docId).update({
            saida: agora,
            status: 'finalizado'
        }).then(function() {
            GR.Toast.success('✅ Ponto finalizado!');
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro: ' + err.message);
        });
    },

    _gerarRelatorioPontoDia: function() {
        var hoje = GR.Utils.now().slice(0, 10);
        var pontos = GR.State.data.pontos || [];
        var pontosHoje = pontos.filter(function(p) { return p.data === hoje; });
        if (!pontosHoje.length) {
            GR.Toast.warning('Nenhum ponto registrado hoje.');
            return;
        }
        var presentes = pontosHoje.filter(function(p) { return p.saida === null; }).length;
        var finalizados = pontosHoje.filter(function(p) { return p.saida !== null; }).length;
        alert('📊 RELATÓRIO DO DIA\n' +
            '📅 ' + new Date().toLocaleDateString('pt-BR') + '\n' +
            '━━━━━━━━━━━━━━━━━━━\n' +
            '👥 Total: ' + pontosHoje.length + '\n' +
            '🟢 Presentes: ' + presentes + '\n' +
            '✅ Finalizados: ' + finalizados);
    },

    // ================================================================
    // 9. RECIBOS DE PAGAMENTO
    // ================================================================
    abrirModelosRecibo: function() {
        var modal = document.createElement('div');
        modal.id = 'modal-modelos-recibo';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal-content" style="max-width:800px;max-height:95vh;overflow-y:auto;">
                <div class="modal-header">
                    <h2 class="modal-title">📄 Modelos de Recibo</h2>
                    <button class="close-btn" onclick="GR.Modal.close('modal-modelos-recibo')">×</button>
                </div>
                <div id="modelos-recibo-content"></div>
            </div>
        `;
        document.body.appendChild(modal);
        GR.Modal.open('modal-modelos-recibo');
        this._renderizarModelosRecibo();
    },

    _renderizarModelosRecibo: function() {
        var content = document.getElementById('modelos-recibo-content');
        if (!content) return;

        var modelos = GR.State.data.modelosRecibo || [];
        var modeloPadrao = GR.State.data.modeloReciboPadrao || null;

        var html = `
            <div style="margin-bottom:12px;">
                <h4 style="margin:0 0 8px 0;">📋 Modelo Padrão</h4>
                <div style="background:var(--surface);border-radius:6px;padding:12px;border:1px solid var(--border);">
                    ${modeloPadrao ? `
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">
                            <div>
                                <strong>${GR.Utils.escapeHtml(modeloPadrao.nome)}</strong>
                                <span style="font-size:11px;color:var(--text-light);margin-left:8px;">${modeloPadrao.dataCriacao ? GR.Utils.formatarDataBR(modeloPadrao.dataCriacao) : ''}</span>
                            </div>
                            <div style="display:flex;gap:4px;">
                                <button class="btn btn-primary btn-sm" onclick="GR.Modules.Funcionarios.editarModeloRecibo('${modeloPadrao.id}')">✏️ Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="GR.Modules.Funcionarios.excluirModeloRecibo('${modeloPadrao.id}')">🗑️ Excluir</button>
                            </div>
                        </div>
                        <div style="margin-top:4px;font-size:11px;color:var(--text-light);border-top:1px solid var(--border-light);padding-top:4px;">
                            <pre style="white-space:pre-wrap;font-size:10px;max-height:100px;overflow-y:auto;background:var(--bg);padding:4px;border-radius:4px;">${GR.Utils.escapeHtml(modeloPadrao.conteudo || '')}</pre>
                        </div>
                    ` : `
                        <div style="text-align:center;padding:16px;color:var(--text-light);">
                            Nenhum modelo padrão definido.
                            <button class="btn btn-success btn-sm" onclick="GR.Modules.Funcionarios.novoModeloRecibo()" style="display:block;margin:8px auto 0;">➕ Criar Modelo Padrão</button>
                        </div>
                    `}
                </div>
            </div>

            <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">
                    <h4 style="margin:0;">📁 Modelos Customizados</h4>
                    <button class="btn btn-success btn-sm" onclick="GR.Modules.Funcionarios.novoModeloRecibo()">➕ Novo Modelo</button>
                </div>
                ${modelos.filter(m => !m.padrao).length ? `
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
                        ${modelos.filter(m => !m.padrao).map(function(m) {
                            return `
                                <div style="background:var(--surface);border-radius:6px;padding:10px;border:1px solid var(--border);">
                                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">
                                        <strong>${GR.Utils.escapeHtml(m.nome)}</strong>
                                        <div style="display:flex;gap:2px;">
                                            <button class="btn btn-primary btn-sm" onclick="GR.Modules.Funcionarios.editarModeloRecibo('${m.id}')">✏️</button>
                                            <button class="btn btn-danger btn-sm" onclick="GR.Modules.Funcionarios.excluirModeloRecibo('${m.id}')">🗑️</button>
                                        </div>
                                    </div>
                                    <div style="margin-top:4px;font-size:10px;color:var(--text-light);">
                                        ${m.dataCriacao ? 'Criado: ' + GR.Utils.formatarDataBR(m.dataCriacao) : ''}
                                        ${m.tamanho ? ' | ' + m.tamanho + ' caracteres' : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div style="text-align:center;padding:16px;color:var(--text-light);font-size:13px;">
                        Nenhum modelo customizado criado.
                    </div>
                `}
            </div>
        `;

        content.innerHTML = html;
    },

    novoModeloRecibo: function(editId) {
        var modal = document.createElement('div');
        modal.id = 'modal-editar-modelo-recibo';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal-content" style="max-width:700px;max-height:95vh;overflow-y:auto;">
                <div class="modal-header">
                    <h2 class="modal-title">${editId ? '✏️ Editar Modelo' : '📄 Novo Modelo de Recibo'}</h2>
                    <button class="close-btn" onclick="GR.Modal.close('modal-editar-modelo-recibo')">×</button>
                </div>
                <div id="editar-modelo-recibo-content"></div>
            </div>
        `;
        document.body.appendChild(modal);
        GR.Modal.open('modal-editar-modelo-recibo');
        this._renderizarFormModeloRecibo(editId);
    },

    _renderizarFormModeloRecibo: function(editId) {
        var content = document.getElementById('editar-modelo-recibo-content');
        if (!content) return;

        var modelo = null;
        if (editId) {
            modelo = (GR.State.data.modelosRecibo || []).find(function(m) { return m.id === editId; });
        }

        var html = `
            <div class="form-group">
                <label class="required">Nome do Modelo</label>
                <input type="text" id="modelo-recibo-nome" class="form-control" value="${modelo ? GR.Utils.escapeHtml(modelo.nome) : ''}" placeholder="Ex: Recibo Padrão, Recibo CLT...">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="modelo-recibo-padrao" ${modelo && modelo.padrao ? 'checked' : (editId ? '' : 'checked')}>
                    Definir como modelo padrão
                </label>
            </div>
            <div class="form-group">
                <label class="required">Conteúdo do Recibo</label>
                <textarea id="modelo-recibo-conteudo" class="form-control" rows="12" placeholder="Digite o modelo do recibo...">${modelo ? modelo.conteudo : ''}</textarea>
                <small style="color:var(--text-light);font-size:10px;">
                    💡 Use as variáveis: {{nome}}, {{cpf}}, {{cargo}}, {{salario}}, {{mes}}, {{ano}}, {{data}}, {{dias}}, {{valor}}
                </small>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
                <button class="btn btn-success" onclick="GR.Modules.Funcionarios._salvarModeloRecibo('${editId || ''}')">💾 Salvar</button>
                <button class="btn btn-secondary" onclick="GR.Modal.close('modal-editar-modelo-recibo')">Cancelar</button>
            </div>
        `;

        content.innerHTML = html;
    },

    _salvarModeloRecibo: function(editId) {
        var nome = document.getElementById('modelo-recibo-nome').value.trim();
        var conteudo = document.getElementById('modelo-recibo-conteudo').value.trim();
        var padrao = document.getElementById('modelo-recibo-padrao').checked;

        if (!nome) { GR.Toast.error('Nome do modelo é obrigatório!'); return; }
        if (!conteudo) { GR.Toast.error('Conteúdo do modelo é obrigatório!'); return; }

        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var ref = db.collection('users').doc(user.uid).collection('modelosRecibo');
        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            conteudo: conteudo,
            padrao: padrao,
            dataAtualizacao: GR.Utils.now()
        };

        if (padrao) {
            ref.where('padrao', '==', true).get().then(function(snapshot) {
                var batch = db.batch();
                snapshot.forEach(function(doc) {
                    if (doc.id !== editId) {
                        batch.update(doc.ref, { padrao: false });
                    }
                });
                return batch.commit();
            }).then(function() {
                if (editId) {
                    ref.doc(editId).update(dados).then(function() {
                        GR.Modal.close('modal-editar-modelo-recibo');
                        GR.Toast.success('Modelo atualizado!');
                        GR.Modules.Funcionarios._renderizarModelosRecibo();
                    });
                } else {
                    dados.dataCriacao = GR.Utils.now();
                    ref.add(dados).then(function() {
                        GR.Modal.close('modal-editar-modelo-recibo');
                        GR.Toast.success('Modelo criado!');
                        GR.Modules.Funcionarios._renderizarModelosRecibo();
                    });
                }
            });
        } else {
            if (editId) {
                ref.doc(editId).update(dados).then(function() {
                    GR.Modal.close('modal-editar-modelo-recibo');
                    GR.Toast.success('Modelo atualizado!');
                    GR.Modules.Funcionarios._renderizarModelosRecibo();
                });
            } else {
                dados.dataCriacao = GR.Utils.now();
                ref.add(dados).then(function() {
                    GR.Modal.close('modal-editar-modelo-recibo');
                    GR.Toast.success('Modelo criado!');
                    GR.Modules.Funcionarios._renderizarModelosRecibo();
                });
            }
        }
    },

    editarModeloRecibo: function(id) {
        this.novoModeloRecibo(id);
    },

    excluirModeloRecibo: function(id) {
        if (!confirm('Excluir este modelo de recibo?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        
        db.collection('users').doc(user.uid).collection('modelosRecibo').doc(id).delete()
            .then(function() {
                GR.Toast.success('Modelo excluído!');
                GR.Modules.Funcionarios._renderizarModelosRecibo();
            }).catch(function(err) {
                GR.Toast.error('Erro: ' + err.message);
            });
    },

    // ================================================================
    // 10. EMITIR RECIBO
    // ================================================================
    emitirRecibo: function(funcionarioId) {
        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        if (!f) { GR.Toast.error('Funcionário não encontrado!'); return; }

        var modelos = GR.State.data.modelosRecibo || [];
        var modeloPadrao = modelos.find(function(m) { return m.padrao === true; });

        var mes = prompt('📅 Mês/Ano de referência: (ex: 01/2024)') || new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
        var dias = prompt('📆 Dias trabalhados:') || '22';
        var valor = prompt('💰 Valor a pagar: (ex: 1500,00)') || f.salario || '0';

        var partes = mes.split('/');
        var mesNum = partes[0] || '01';
        var anoNum = partes[1] || new Date().getFullYear();

        var usarModelo = null;
        if (modelos.length > 0) {
            var opcoes = modelos.map(function(m, i) {
                return (i+1) + '. ' + m.nome + (m.padrao ? ' (Padrão)' : '');
            }).join('\n');
            var escolha = prompt('📄 Escolha o modelo:\n' + opcoes + '\n\nDigite o número (1-' + modelos.length + '):') || '1';
            var idx = parseInt(escolha) - 1;
            if (idx >= 0 && idx < modelos.length) {
                usarModelo = modelos[idx];
            }
        }

        if (!usarModelo) {
            usarModelo = modeloPadrao || { conteudo: this._getModeloPadraoRecibo() };
        }

        var conteudo = usarModelo.conteudo || this._getModeloPadraoRecibo();
        
        var mesExtenso = this._getMesExtenso(parseInt(mesNum));
        var dataAtual = new Date().toLocaleDateString('pt-BR');
        
        conteudo = conteudo
            .replace(/\{\{nome\}\}/g, f.nome || '')
            .replace(/\{\{cpf\}\}/g, f.cpf ? GR.Utils.formatarCPF(f.cpf) : '')
            .replace(/\{\{cargo\}\}/g, f.cargo || '')
            .replace(/\{\{salario\}\}/g, GR.Utils.formatarMoedaBR(parseFloat(valor)))
            .replace(/\{\{mes\}\}/g, mesExtenso)
            .replace(/\{\{ano\}\}/g, anoNum)
            .replace(/\{\{data\}\}/g, dataAtual)
            .replace(/\{\{dias\}\}/g, dias)
            .replace(/\{\{valor\}\}/g, GR.Utils.formatarMoedaBR(parseFloat(valor)));

        var modal = document.createElement('div');
        modal.id = 'modal-visualizar-recibo';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal-content" style="max-width:800px;max-height:95vh;overflow-y:auto;">
                <div class="modal-header">
                    <h2 class="modal-title">📄 Recibo de Pagamento</h2>
                    <button class="close-btn" onclick="GR.Modal.close('modal-visualizar-recibo')">×</button>
                </div>
                <div id="visualizar-recibo-content">
                    <div style="background:var(--surface);padding:20px;border:1px solid var(--border);border-radius:6px;white-space:pre-wrap;font-family:monospace;font-size:13px;line-height:1.6;">
                        ${conteudo}
                    </div>
                    <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn btn-success" onclick="GR.Modules.Funcionarios._imprimirRecibo()">🖨️ Imprimir</button>
                        <button class="btn btn-primary" onclick="GR.Modules.Funcionarios._salvarRecibo('${funcionarioId}')">💾 Salvar</button>
                        <button class="btn btn-secondary" onclick="GR.Modal.close('modal-visualizar-recibo')">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        GR.Modal.open('modal-visualizar-recibo');

        this._reciboAtual = conteudo;
        this._reciboFuncionarioId = funcionarioId;
    },

    _imprimirRecibo: function() {
        if (!this._reciboAtual) return;
        var win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Recibo de Pagamento</title>
            <style>
                body { font-family: monospace; padding: 40px; max-width: 700px; margin: 0 auto; line-height: 1.6; }
                .recibo { white-space: pre-wrap; }
                @media print { .no-print { display: none; } }
            </style>
            </head>
            <body>
                <div class="recibo">${this._reciboAtual.replace(/\n/g, '<br>')}</div>
                <div class="no-print" style="margin-top:20px;text-align:center;">
                    <button onclick="window.print()">🖨️ Imprimir</button>
                    <button onclick="window.close()">Fechar</button>
                </div>
            </body></html>
        `);
        win.document.close();
    },

    _salvarRecibo: function(funcionarioId) {
        if (!this._reciboAtual) return;
        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        var dados = {
            funcionarioId: funcionarioId,
            funcionarioNome: f ? f.nome : 'Desconhecido',
            conteudo: this._reciboAtual,
            data: GR.Utils.now().slice(0, 10),
            dataCriacao: GR.Utils.now()
        };

        db.collection('users').doc(user.uid).collection('recibos').add(dados)
            .then(function() {
                GR.Toast.success('✅ Recibo salvo com sucesso!');
                GR.State.adicionarHistorico('salvou recibo', 'Recibos', 'Funcionário: ' + (f ? f.nome : ''));
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
    },

    _getModeloPadraoRecibo: function() {
        return `RECIBO DE PAGAMENTO DE MÃO DE OBRA

        Eu, {{nome}}, portador(a) do CPF {{cpf}}, 
        residente e domiciliado na cidade de ______________,

        DECLARO ter recebido do(a) Sr(a). ______________, 
        proprietário(a) da propriedade rural ______________,

        a importância de R$ {{valor}} ({{porExtenso}}),

        referente ao pagamento referente ao mês de {{mes}}/{{ano}},
        pelos serviços prestados na função de {{cargo}}.

        Declaro ainda que estou quite com todas as obrigações 
        trabalhistas referentes ao período mencionado.

        ___________________________________
        Local: ________________, {{data}}

        ___________________________________
        Assinatura do(a) Funcionário(a)`;
    },

    _getMesExtenso: function(mes) {
        var meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return meses[mes - 1] || mes;
    },

    // ================================================================
    // 11. GERENCIAR STATUS
    // ================================================================
    abrirGerenciarStatus: function(filtroStatus) {
        var content = document.getElementById('gerenciar-status-content');
        if (!content) {
            var modal = document.createElement('div');
            modal.id = 'modal-gerenciar-status';
            modal.className = 'modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.innerHTML = `
                <div class="modal-content" style="max-width:1000px;max-height:95vh;overflow-y:auto;">
                    <div class="modal-header">
                        <h2 class="modal-title">📋 Gerenciar Status</h2>
                        <button class="close-btn" onclick="GR.Modal.close('modal-gerenciar-status')">×</button>
                    </div>
                    <div id="gerenciar-status-content"></div>
                </div>
            `;
            document.body.appendChild(modal);
            GR.Modal.open('modal-gerenciar-status');
            content = document.getElementById('gerenciar-status-content');
        }
        if (!content) { 
            GR.Toast.error('Gerenciar Status não disponível.');
            return;
        }

        var items = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }

        if (filtroStatus) {
            items = items.filter(function(f) { return f.status === filtroStatus; });
        }

        var titulo = filtroStatus ? '📋 ' + filtroStatus : '📋 Todos os Funcionários';
        
        var html = `
            <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <h3 style="margin:0;">${titulo}</h3>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        <button class="btn btn-success btn-sm" onclick="GR.Modules.Funcionarios.abrirGerenciarStatus()">📋 Todos</button>
                        <button class="btn btn-success btn-sm" onclick="GR.Modules.Funcionarios.abrirGerenciarStatus('Ativo')">✅ Ativos</button>
                        <button class="btn btn-warning btn-sm" onclick="GR.Modules.Funcionarios.abrirGerenciarStatus('Férias')">🏖️ Férias</button>
                        <button class="btn btn-danger btn-sm" onclick="GR.Modules.Funcionarios.abrirGerenciarStatus('Afastado')">⚠️ Afastados</button>
                        <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Funcionarios.abrirGerenciarStatus('Desligado')">🚫 Desligados</button>
                    </div>
                </div>
                <div style="font-size:12px;color:var(--text-light);margin-top:4px;">
                    Total: ${items.length} funcionários
                </div>
            </div>
            ${this._gerarTabelaFuncionarios(items)}
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;">
                <button class="btn btn-primary" onclick="GR.Modules.Funcionarios.abrirModal()">➕ Novo Funcionário</button>
                <button class="btn btn-secondary" onclick="GR.Modal.close('modal-gerenciar-status')">Fechar</button>
            </div>
        `;

        content.innerHTML = html;
    },

    // ================================================================
    // 12. ALTERAR STATUS
    // ================================================================
    alterarStatus: function(funcionarioId, novoStatus) {
        if (!confirm('Alterar status deste funcionário para "' + novoStatus + '"?')) return;
        
        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var ref = db.collection('users').doc(user.uid).collection('funcionarios').doc(funcionarioId);
        ref.update({ status: novoStatus }).then(function() {
            var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
            GR.Toast.success('✅ Status atualizado para: ' + novoStatus);
            GR.State.adicionarHistorico('alterou status', 'Funcionários', 
                (f ? f.nome : '') + ' → ' + novoStatus);
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro: ' + err.message);
        });
    },

    // ================================================================
    // 13. FÉRIAS EM LOTE
    // ================================================================
    abrirModalFerias: function() {
        var funcionarios = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            funcionarios = funcionarios.filter(function(f) { return f.propriedade === propAtiva; });
        }
        var ativos = funcionarios.filter(function(f) { return f.status === 'Ativo'; });

        if (!ativos.length) {
            GR.Toast.warning('Nenhum funcionário ativo para agendar férias.');
            return;
        }

        var lista = ativos.map(function(f, i) {
            return (i+1) + '. ' + f.nome + ' (' + (f.cargo || 'Sem cargo') + ')';
        }).join('\n');

        var selecionados = prompt(
            '📅 AGENDAR FÉRIAS EM LOTE\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            'Funcionários disponíveis:\n' +
            lista + '\n\n' +
            'Digite os números separados por vírgula\n' +
            'Ex: 1,3,5 (ou "todos")'
        );

        if (!selecionados) return;

        var ids = [];
        if (selecionados.toLowerCase() === 'todos') {
            ids = ativos.map(function(f) { return f.id; });
        } else {
            var numeros = selecionados.split(',').map(function(n) { return parseInt(n.trim()); });
            ids = numeros.map(function(n) {
                if (n > 0 && n <= ativos.length) {
                    return ativos[n-1].id;
                }
                return null;
            }).filter(function(id) { return id !== null; });
        }

        if (!ids.length) {
            GR.Toast.warning('Nenhum funcionário selecionado.');
            return;
        }

        var dataInicio = prompt('📅 Data de início (DD/MM/AAAA):');
        if (!dataInicio) return;
        var dataFim = prompt('📅 Data de retorno (DD/MM/AAAA):');
        if (!dataFim) return;

        try {
            var partesInicio = dataInicio.split('/');
            var partesFim = dataFim.split('/');
            var inicio = partesInicio[2] + '-' + partesInicio[1] + '-' + partesInicio[0];
            var fim = partesFim[2] + '-' + partesFim[1] + '-' + partesFim[0];
        } catch(e) {
            GR.Toast.error('Formato de data inválido! Use DD/MM/AAAA');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) { GR.Toast.error('Usuário não autenticado!'); return; }

        var refFerias = db.collection('users').doc(user.uid).collection('ferias');
        var refFunc = db.collection('users').doc(user.uid).collection('funcionarios');

        var promises = ids.map(function(id) {
            var f = GR.State.data.funcionarios.find(function(func) { return func.id === id; });
            if (!f) return Promise.resolve();

            return refFerias.add({
                funcionarioId: id,
                funcionarioNome: f.nome,
                dataInicio: inicio,
                dataFim: fim,
                status: 'Agendada',
                propriedade: f.propriedade || propAtiva,
                dataCriacao: GR.Utils.now()
            }).then(function() {
                return refFunc.doc(id).update({ status: 'Férias' });
            });
        });

        Promise.all(promises).then(function() {
            GR.Toast.success('✅ Férias agendadas para ' + ids.length + ' funcionários!');
            GR.State.adicionarHistorico('agendou férias em lote', 'Férias', ids.length + ' funcionários');
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro: ' + err.message);
        });
    },

    // ================================================================
    // 14. DASHBOARD
    // ================================================================
    abrirDashboard: function(funcionarioId) {
        var content = document.getElementById('dashboard-funcionario-content');
        if (!content) {
            var modal = document.createElement('div');
            modal.id = 'modal-dashboard-funcionario';
            modal.className = 'modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.innerHTML = `
                <div class="modal-content" style="max-width:950px;max-height:95vh;overflow-y:auto;">
                    <div class="modal-header">
                        <h2 class="modal-title">📊 Dashboard do Funcionário</h2>
                        <button class="close-btn" onclick="GR.Modal.close('modal-dashboard-funcionario')">×</button>
                    </div>
                    <div id="dashboard-funcionario-content"></div>
                </div>
            `;
            document.body.appendChild(modal);
            GR.Modal.open('modal-dashboard-funcionario');
            content = document.getElementById('dashboard-funcionario-content');
        }
        if (!content) { 
            GR.Toast.error('Dashboard não disponível.');
            return;
        }

        var funcionario = GR.State.data.funcionarios.find(function(f) { return f.id === funcionarioId; });
        if (!funcionario) {
            content.innerHTML = '<div class="empty-state"><span class="icon">👨‍🌾</span><div class="message">Funcionário não encontrado</div></div>';
            return;
        }

        var pontos = GR.State.data.pontos || [];
        var producoes = GR.State.data.producoes || [];
        var ferias = GR.State.data.ferias || [];

        var pontosFunc = pontos.filter(function(p) { return p.funcionarioId === funcionarioId; });
        var producoesFunc = producoes.filter(function(p) { return p.funcionarioId === funcionarioId; });
        var feriasFunc = ferias.filter(function(f) { return f.funcionarioId === funcionarioId; });

        var totalProduzido = producoesFunc.reduce(function(sum, p) { return sum + (p.quantidade || 0); }, 0);
        var horasTrabalhadas = this._calcularHorasTrabalhadas(pontosFunc);
        var produtividade = horasTrabalhadas > 0 ? (totalProduzido / horasTrabalhadas) : 0;
        var diasTrabalhados = pontosFunc.filter(function(p) { return p.saida !== null; }).length;

        var fotoHtml = funcionario.foto ? 
            `<img src="${funcionario.foto}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--border);">` :
            '<span style="font-size:60px;">👤</span>';

        var html = `
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px;">
                ${fotoHtml}
                <div>
                    <h3 style="margin:0;">${GR.Utils.escapeHtml(funcionario.nome)}</h3>
                    <div style="font-size:13px;color:var(--text-light);">
                        ${funcionario.cargo || 'Sem cargo definido'} 
                        ${funcionario.propriedade ? '| 🏠 ' + GR.Utils.escapeHtml(funcionario.propriedade) : ''}
                        <span class="${funcionario.status === 'Ativo' ? 'badge-success' : funcionario.status === 'Férias' ? 'badge-warning' : 'badge-danger'}">
                            ${funcionario.status || 'Desligado'}
                        </span>
                    </div>
                    <div style="font-size:12px;color:var(--text-light);">
                        ${funcionario.tipoContrato ? '📄 ' + funcionario.tipoContrato : ''}
                        ${funcionario.dataTermino ? ' | ⏳ Término: ' + GR.Utils.formatarDataBR(funcionario.dataTermino) : ''}
                    </div>
                </div>
                <div style="margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;">
                    <button class="btn btn-primary btn-sm" onclick="GR.Modules.Funcionarios.editar('${funcionario.id}')">✏️ Editar</button>
                    <button class="btn btn-info btn-sm" onclick="GR.Modules.Funcionarios.registrarProducao('${funcionario.id}')">📦 Produção</button>
                    <button class="btn btn-success btn-sm" onclick="GR.Modules.Funcionarios.baterPontoIndividual('${funcionario.id}')">🕐 Ponto</button>
                    <button class="btn btn-purple btn-sm" onclick="GR.Modules.Funcionarios.emitirRecibo('${funcionario.id}')">📄 Recibo</button>
                    <button class="btn btn-secondary btn-sm" onclick="GR.Modal.close('modal-dashboard-funcionario')">Fechar</button>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:12px;">
                <div class="funcionario-stats-card"><div class="number" style="color:#2196F3;">${diasTrabalhados}</div><div class="label">📅 Dias</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#4CAF50;">${totalProduzido.toFixed(0)}</div><div class="label">📦 Produção</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#FF9800;">${produtividade.toFixed(2)}</div><div class="label">📊 Prod/h</div></div>
                <div class="funcionario-stats-card"><div class="number" style="color:#f44336;">${horasTrabalhadas.toFixed(1)}h</div><div class="label">⏱️ Horas</div></div>
            </div>

            <div style="margin-top:12px;">
                <div style="display:flex;gap:4px;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:4px;">
                    <button class="btn btn-sm btn-primary" onclick="GR.Modules.Funcionarios._mostrarAba('producao', '${funcionario.id}')">📦 Produção</button>
                    <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Funcionarios._mostrarAba('ponto', '${funcionario.id}')">📍 Ponto</button>
                    <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Funcionarios._mostrarAba('ferias', '${funcionario.id}')">🏖️ Férias</button>
                    <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Funcionarios._mostrarAba('documentos', '${funcionario.id}')">📁 Documentos</button>
                    <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Funcionarios._mostrarAba('recibos', '${funcionario.id}')">📄 Recibos</button>
                </div>
                <div id="dashboard-aba-content" style="margin-top:8px;max-height:400px;overflow-y:auto;">
                    ${this._renderizarAbaProducao(producoesFunc)}
                </div>
            </div>
        `;

        content.innerHTML = html;
        this._dashboardFuncionarioId = funcionarioId;
    },

    _calcularHorasTrabalhadas: function(pontos) {
        return pontos.filter(function(p) {
            return p.saida && p.entrada;
        }).reduce(function(sum, p) {
            try {
                var entrada = new Date(p.data + 'T' + p.entrada);
                var saida = new Date(p.data + 'T' + p.saida);
                var diff = (saida - entrada) / 3600000;
                return sum + diff;
            } catch(e) { return sum; }
        }, 0);
    },

    _mostrarAba: function(aba, funcionarioId) {
        var content = document.getElementById('dashboard-aba-content');
        if (!content) return;

        var funcionario = GR.State.data.funcionarios.find(function(f) { return f.id === funcionarioId; });
        if (!funcionario) return;

        var dados = {
            producoes: (GR.State.data.producoes || []).filter(function(p) { return p.funcionarioId === funcionarioId; }),
            pontos: (GR.State.data.pontos || []).filter(function(p) { return p.funcionarioId === funcionarioId; }),
            ferias: (GR.State.data.ferias || []).filter(function(f) { return f.funcionarioId === funcionarioId; }),
            documentos: funcionario.documentos || {},
            recibos: (GR.State.data.recibos || []).filter(function(r) { return r.funcionarioId === funcionarioId; })
        };

        var html = '';
        switch(aba) {
            case 'producao': html = this._renderizarAbaProducao(dados.producoes); break;
            case 'ponto': html = this._renderizarAbaPonto(dados.pontos); break;
            case 'ferias': html = this._renderizarAbaFerias(dados.ferias); break;
            case 'documentos': html = this._renderizarAbaDocumentos(dados.documentos); break;
            case 'recibos': html = this._renderizarAbaRecibos(dados.recibos); break;
        }
        content.innerHTML = html;
    },

    _renderizarAbaProducao: function(producoes) {
        if (!producoes.length) {
            return '<div style="color:var(--text-light);padding:12px;">Nenhuma produção registrada.</div>';
        }

        var total = producoes.reduce(function(sum, p) { return sum + (p.quantidade || 0); }, 0);
        var rows = producoes.slice(-10).reverse().map(function(p) {
            return '<tr>' +
                '<td>' + GR.Utils.formatarDataBR(p.data || '') + '</td>' +
                '<td>' + GR.Utils.escapeHtml(p.produto || 'Produto') + '</td>' +
                '<td>' + (p.quantidade || 0).toFixed(2) + '</td>' +
                '<td>' + (p.unidade || 'un') + '</td>' +
                '</tr>';
        }).join('');

        return `
            <div style="font-size:13px;margin-bottom:6px;">📦 Total produzido: <strong>${total.toFixed(2)}</strong></div>
            <div class="table-responsive">
                <table style="font-size:12px;">
                    <thead><tr><th>Data</th><th>Produto</th><th>Qtd</th><th>Un</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    _renderizarAbaPonto: function(pontos) {
        if (!pontos.length) {
            return '<div style="color:var(--text-light);padding:12px;">Nenhum ponto registrado.</div>';
        }
        var rows = pontos.slice(-10).reverse().map(function(p) {
            var status = p.saida ? '✅ Finalizado' : '🟢 Em andamento';
            return '<tr><td>' + GR.Utils.formatarDataBR(p.data || '') + '</td><td>' + (p.entrada || '-') + '</td><td>' + (p.saida || '⏳') + '</td><td>' + (p.talhao || '-') + '</td><td>' + status + '</td></tr>';
        }).join('');
        return '<div class="table-responsive"><table style="font-size:12px;"><thead><tr><th>Data</th><th>Entrada</th><th>Saída</th><th>Talhão</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    },

    _renderizarAbaFerias: function(ferias) {
        if (!ferias.length) {
            return '<div style="color:var(--text-light);padding:12px;">Nenhum registro de férias.</div>';
        }
        var rows = ferias.map(function(f) {
            var status = f.status || 'Agendada';
            var badge = status === 'Agendada' ? 'badge-warning' : 'badge-success';
            return '<tr><td>' + GR.Utils.formatarDataBR(f.dataInicio || '') + '</td><td>' + GR.Utils.formatarDataBR(f.dataFim || '') + '</td><td><span class="' + badge + '">' + status + '</span></td></tr>';
        }).join('');
        return '<div class="table-responsive"><table style="font-size:12px;"><thead><tr><th>Início</th><th>Fim</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    },

    _renderizarAbaDocumentos: function(documentos) {
        var tipos = {
            rg: '🪪 RG / CNH',
            ctps: '📋 CTPS',
            contrato: '📄 Contrato',
            outros: '📎 Outros'
        };

        var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        for (var key in tipos) {
            var doc = documentos[key];
            html += `
                <div style="background:var(--surface);border-radius:6px;padding:8px;border:1px solid var(--border);">
                    <div style="font-weight:600;font-size:12px;">${tipos[key]}</div>
                    ${doc ? `
                        <div style="font-size:11px;color:var(--success);margin-top:2px;">✅ Anexado: ${doc.nome || ''}</div>
                        <div style="font-size:10px;color:var(--text-light);">📅 ${doc.data ? GR.Utils.formatarDataBR(doc.data.slice(0,10)) : ''}</div>
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Funcionarios._visualizarDocumento('${key}','${doc.conteudo || ''}')" style="font-size:10px;padding:1px 6px;margin-top:2px;">👁️ Visualizar</button>
                    ` : `
                        <div style="font-size:11px;color:var(--text-light);margin-top:2px;">⏳ Não anexado</div>
                    `}
                </div>
            `;
        }
        html += '</div>';
        return html;
    },

    _visualizarDocumento: function(tipo, conteudo) {
        if (!conteudo) {
            GR.Toast.warning('Documento sem conteúdo.');
            return;
        }

        var win = window.open('', '_blank');
        if (conteudo.startsWith('data:image')) {
            win.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f0f0;"><img src="${conteudo}" style="max-width:95%;max-height:95%;object-fit:contain;"></body></html>`);
        } else if (conteudo.startsWith('data:application/pdf')) {
            win.document.write(`<html><body style="margin:0;height:100vh;"><embed src="${conteudo}" type="application/pdf" width="100%" height="100%"></body></html>`);
        } else {
            win.document.write(`<html><body style="padding:20px;font-family:monospace;white-space:pre-wrap;">${conteudo}</body></html>`);
        }
        win.document.close();
    },

    _renderizarAbaRecibos: function(recibos) {
        if (!recibos.length) {
            return '<div style="color:var(--text-light);padding:12px;">Nenhum recibo emitido.</div>';
        }

        var rows = recibos.slice(-5).reverse().map(function(r) {
            return '<tr>' +
                '<td>' + GR.Utils.formatarDataBR(r.data || '') + '</td>' +
                '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (r.conteudo ? r.conteudo.slice(0,50) + '...' : '') + '</td>' +
                '<td><button class="btn btn-info btn-sm" onclick="GR.Modules.Funcionarios._visualizarRecibo(\'' + r.id + '\')">👁️ Ver</button></td>' +
                '</tr>';
        }).join('');

        return '<div class="table-responsive"><table style="font-size:12px;"><thead><tr><th>Data</th><th>Conteúdo</th><th>Ação</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    },

    _visualizarRecibo: function(reciboId) {
        var recibo = (GR.State.data.recibos || []).find(function(r) { return r.id === reciboId; });
        if (!recibo) { GR.Toast.error('Recibo não encontrado!'); return; }

        var win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Recibo de Pagamento</title>
            <style>
                body { font-family: monospace; padding: 40px; max-width: 700px; margin: 0 auto; line-height: 1.6; }
                .recibo { white-space: pre-wrap; }
                @media print { .no-print { display: none; } }
            </style>
            </head>
            <body>
                <div class="recibo">${(recibo.conteudo || '').replace(/\n/g, '<br>')}</div>
                <div class="no-print" style="margin-top:20px;text-align:center;">
                    <button onclick="window.print()">🖨️ Imprimir</button>
                    <button onclick="window.close()">Fechar</button>
                </div>
            </body></html>
        `);
        win.document.close();
    },

    // ================================================================
    // 15. RELATÓRIOS E EXPORTAÇÃO
    // ================================================================
    abrirRelatorio: function() {
        var funcionarios = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            funcionarios = funcionarios.filter(function(f) { return f.propriedade === propAtiva; });
        }
        var stats = this._calcularEstatisticas(funcionarios);
        
        var msg = '📊 RELATÓRIO DE FUNCIONÁRIOS\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '🏠 Propriedade: ' + (propAtiva === 'todas' ? 'Todas' : propAtiva) + '\n' +
            '📅 ' + new Date().toLocaleString('pt-BR') + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '👥 Total: ' + stats.total + '\n' +
            '✅ Ativos: ' + stats.ativos + '\n' +
            '🏖️ Férias: ' + stats.ferias + '\n' +
            '⚠️ Afastados: ' + stats.afastados + '\n' +
            '🚫 Desligados: ' + stats.desligados + '\n' +
            '📸 Com Foto: ' + stats.comFoto + '\n' +
            '📁 Com Docs: ' + stats.comDocumentos + '\n' +
            '🔑 Com Perfil: ' + stats.comPerfil + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '💰 Folha: ' + GR.Utils.formatarMoedaBR(stats.somaSalarios) + '\n';

        msg += '\n📋 LISTA DE FUNCIONÁRIOS:\n';
        msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        funcionarios.forEach(function(f) {
            msg += '• ' + f.nome + ' | ' + (f.cargo || 'Sem cargo') + ' | ' + (f.status || 'Desligado') + '\n';
        });

        alert(msg);
    },

    exportarLista: function() {
        try {
            var items = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
            var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
            if (propAtiva !== 'todas') {
                items = items.filter(function(item) { return item.propriedade === propAtiva; });
            }

            var dados = {
                exportadoEm: new Date().toLocaleString('pt-BR'),
                propriedadeAtiva: propAtiva,
                total: items.length,
                totalFolhaSalarial: items.reduce(function(sum, f) { return sum + (f.salario || 0); }, 0),
                funcionarios: items.map(function(f) {
                    return {
                        nome: f.nome,
                        cpf: f.cpf,
                        cargo: f.cargo,
                        telefone: f.telefone ? GR.Utils.formatarTelefone(f.telefone.ddd, f.telefone.numero) : null,
                        salario: f.salario,
                        admissao: f.admissao,
                        status: f.status,
                        propriedade: f.propriedade,
                        tipoContrato: f.tipoContrato || 'CLT',
                        dataTermino: f.dataTermino || '',
                        temFoto: !!f.foto,
                        temDocumentos: !!f.documentos && Object.keys(f.documentos).length > 0,
                        temPerfil: this.funcionarioTemPerfil(f.id)
                    };
                }, this)
            };

            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'funcionarios_export_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);

            GR.Toast.success('✅ Lista de funcionários exportada!');
        } catch (e) {
            GR.Toast.error('Erro ao exportar: ' + e.message);
        }
    },

    // ================================================================
    // 16. UTILITÁRIOS
    // ================================================================
    _removerBotoesDuplicados: function() {
        var botoes = document.querySelectorAll('button');
        var contador = 0;
        botoes.forEach(function(btn) {
            var text = btn.textContent || btn.innerText || '';
            if ((text.includes('Novo Funcionário') || text.includes('➕ Novo Funcionário')) && 
                !btn.closest('#lista-funcionarios') && 
                !btn.closest('#modal-funcionario') &&
                !btn.closest('#gerenciar-status-content')) {
                if (btn.parentElement) {
                    btn.parentElement.removeChild(btn);
                    contador++;
                }
            }
        });
        if (contador > 0) {
            console.log('🗑️ ' + contador + ' botões duplicados removidos');
        }
    },

    baterPontoIndividual: function(funcionarioId) {
        this._baterPontoIndividual(funcionarioId);
    },

    // ================================================================
    // 17. 🆕 INTEGRAÇÃO COM PERFIS DE FUNCIONÁRIOS
    // ================================================================

    // Verificar se funcionário tem perfil
    funcionarioTemPerfil: function(funcionarioId) {
        var perfis = GR.State.data.perfis || {};
        for (var key in perfis) {
            if (perfis[key].funcionarioId === funcionarioId) {
                return true;
            }
        }
        return false;
    },

    // Obter perfil do funcionário
    getPerfilFuncionario: function(funcionarioId) {
        var perfis = GR.State.data.perfis || {};
        for (var key in perfis) {
            if (perfis[key].funcionarioId === funcionarioId) {
                return { id: key, dados: perfis[key] };
            }
        }
        return null;
    },

    // Criar perfil de funcionário
    criarPerfilFuncionario: function(funcionarioId) {
        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        if (!f) {
            GR.Toast.error('Funcionário não encontrado!');
            return;
        }

        if (typeof GR.Modules.Perfis === 'undefined') {
            GR.Toast.error('❌ Módulo de perfis não disponível!');
            return;
        }

        if (!GR.Modules.Perfis.podeCriarPerfilFuncionario()) {
            GR.Toast.error('❌ Você não tem permissão para criar perfis de funcionário!');
            return;
        }

        // Verifica se já tem perfil
        if (this.funcionarioTemPerfil(funcionarioId)) {
            GR.Toast.warning('⚠️ Este funcionário já possui um perfil de acesso!');
            var perfilInfo = this.getPerfilFuncionario(funcionarioId);
            if (perfilInfo && confirm('Deseja visualizar as informações do perfil existente?')) {
                var perfil = perfilInfo.dados;
                alert(
                    '📋 INFORMAÇÕES DO PERFIL\n' +
                    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
                    '👤 Funcionário: ' + f.nome + '\n' +
                    '📧 Usuário: ' + (f.cpf ? f.cpf + '@gestaorural.app' : 'N/A') + '\n' +
                    '📅 Criado em: ' + (perfil.dataCriacao ? GR.Utils.formatarDataBR(perfil.dataCriacao.slice(0,10)) : 'N/A') + '\n' +
                    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
                    '💡 Use o CPF do funcionário como usuário.\n' +
                    '🔑 A senha foi definida no momento da criação.'
                );
            }
            return;
        }

        if (!f.cpf) {
            GR.Toast.warning('⚠️ Funcionário sem CPF! É necessário cadastrar o CPF primeiro.');
            if (confirm('Deseja editar o funcionário para adicionar o CPF?')) {
                this.editar(funcionarioId);
            }
            return;
        }

        var senha = prompt(
            '🔑 CRIAR PERFIL DE ACESSO\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '👤 Funcionário: ' + f.nome + '\n' +
            '📧 Usuário (CPF): ' + f.cpf + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            'Digite uma senha para o funcionário (mínimo 6 caracteres):'
        );

        if (!senha) {
            GR.Toast.info('Operação cancelada.');
            return;
        }

        if (senha.length < 6) {
            GR.Toast.warning('⚠️ Senha deve ter no mínimo 6 caracteres!');
            return;
        }

        GR.Toast.info('⏳ Criando perfil...');

        GR.Modules.Perfis.criarPerfilFuncionario(funcionarioId, senha)
            .then(function(msg) {
                GR.Toast.success(msg);
                GR.State.adicionarHistorico('criou perfil de funcionário', 'Perfis', 'Funcionário: ' + f.nome);
                GR.UI.refreshCurrentView();
            })
            .catch(function(err) {
                GR.Toast.error(err);
            });
    },

    // Gerenciar perfil de funcionário
    gerenciarPerfilFuncionario: function(funcionarioId) {
        var f = GR.State.data.funcionarios.find(function(func) { return func.id === funcionarioId; });
        if (!f) {
            GR.Toast.error('Funcionário não encontrado!');
            return;
        }

        if (typeof GR.Modules.Perfis === 'undefined') {
            GR.Toast.error('❌ Módulo de perfis não disponível!');
            return;
        }

        if (!GR.Modules.Perfis.podeGerenciarPerfis()) {
            GR.Toast.error('❌ Você não tem permissão para gerenciar perfis!');
            return;
        }

        var perfilInfo = this.getPerfilFuncionario(funcionarioId);
        if (!perfilInfo) {
            GR.Toast.warning('⚠️ Este funcionário não possui perfil de acesso.');
            if (confirm('Deseja criar um perfil agora?')) {
                this.criarPerfilFuncionario(funcionarioId);
            }
            return;
        }

        var perfil = perfilInfo.dados;
        var perfilId = perfilInfo.id;

        var opcao = prompt(
            '🔐 GERENCIAR PERFIL DE ACESSO\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '👤 Funcionário: ' + f.nome + '\n' +
            '📧 Usuário: ' + (f.cpf ? f.cpf + '@gestaorural.app' : 'N/A') + '\n' +
            '📅 Criado em: ' + (perfil.dataCriacao ? GR.Utils.formatarDataBR(perfil.dataCriacao.slice(0,10)) : 'N/A') + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            'Opções disponíveis:\n' +
            '1 - Redefinir Senha (envia email)\n' +
            '2 - Remover Perfil\n' +
            '3 - Ver Informações\n\n' +
            'Digite o número da opção:'
        );

        if (!opcao) return;

        switch(opcao.trim()) {
            case '1':
                this._redefinirSenhaFuncionario(perfilId, f);
                break;
            case '2':
                this._removerPerfilFuncionario(perfilId, f);
                break;
            case '3':
                this._verInformacoesPerfil(perfil, f);
                break;
            default:
                GR.Toast.warning('Opção inválida!');
        }
    },

    _redefinirSenhaFuncionario: function(perfilId, funcionario) {
        var novaSenha = prompt(
            '🔑 REDEFINIR SENHA\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '👤 Funcionário: ' + funcionario.nome + '\n' +
            '📧 Usuário: ' + (funcionario.cpf ? funcionario.cpf + '@gestaorural.app' : 'N/A') + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            'Digite a nova senha (mínimo 6 caracteres):'
        );

        if (!novaSenha) {
            GR.Toast.info('Operação cancelada.');
            return;
        }

        if (novaSenha.length < 6) {
            GR.Toast.warning('⚠️ Senha deve ter no mínimo 6 caracteres!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('❌ Usuário não autenticado!');
            return;
        }

        var email = (funcionario.cpf ? funcionario.cpf.replace(/\D/g, '') : '') + '@gestaorural.app';
        
        GR.Toast.info('⏳ Enviando email de redefinição...');
        
        firebase.auth().sendPasswordResetEmail(email)
            .then(function() {
                GR.Toast.success('✅ Email de redefinição enviado para ' + email);
                GR.Toast.info('💡 O funcionário receberá um link para redefinir a senha.');
                GR.State.adicionarHistorico('redefiniu senha de funcionário', 'Perfis', 'Funcionário: ' + funcionario.nome);
            })
            .catch(function(err) {
                if (err.code === 'auth/user-not-found') {
                    GR.Toast.error('❌ Usuário não encontrado!');
                } else {
                    GR.Toast.error('❌ Erro ao enviar email: ' + err.message);
                }
            });
    },

    _removerPerfilFuncionario: function(perfilId, funcionario) {
        if (!confirm(
            '⚠️ ATENÇÃO!\n\n' +
            'Você está prestes a REMOVER o perfil de acesso de:\n' +
            '👤 ' + funcionario.nome + '\n' +
            '📧 ' + (funcionario.cpf ? funcionario.cpf + '@gestaorural.app' : 'N/A') + '\n\n' +
            'O funcionário não poderá mais acessar o sistema.\n\n' +
            'Tem certeza?'
        )) {
            return;
        }

        if (!confirm('🔄 ÚLTIMA CONFIRMAÇÃO: Remover permanentemente este perfil?')) {
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('❌ Usuário não autenticado!');
            return;
        }

        var ref = db.collection('users').doc(user.uid).collection('perfis').doc(perfilId);
        
        GR.Toast.info('⏳ Removendo perfil...');
        
        ref.delete()
            .then(function() {
                if (GR.State.data.perfis) {
                    delete GR.State.data.perfis[perfilId];
                }
                GR.Toast.success('✅ Perfil removido com sucesso!');
                GR.State.adicionarHistorico('removeu perfil de funcionário', 'Perfis', 'Funcionário: ' + funcionario.nome);
                GR.UI.refreshCurrentView();
            })
            .catch(function(err) {
                GR.Toast.error('❌ Erro ao remover perfil: ' + err.message);
            });
    },

    _verInformacoesPerfil: function(perfil, funcionario) {
        alert(
            '📋 INFORMAÇÕES DO PERFIL\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '👤 Funcionário: ' + funcionario.nome + '\n' +
            '📧 Usuário: ' + (funcionario.cpf ? funcionario.cpf + '@gestaorural.app' : 'N/A') + '\n' +
            '📄 CPF: ' + (funcionario.cpf || 'N/A') + '\n' +
            '📋 Cargo: ' + (funcionario.cargo || 'N/A') + '\n' +
            '🏠 Propriedade: ' + (funcionario.propriedade || 'N/A') + '\n' +
            '📅 Criado em: ' + (perfil.dataCriacao ? GR.Utils.formatarDataBR(perfil.dataCriacao.slice(0,10)) : 'N/A') + '\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            '💡 O funcionário acessa com:\n' +
            '   📧 Usuário: CPF sem pontos/traços\n' +
            '   🔑 Senha: definida no cadastro'
        );
    },

    // ================================================================
    // 18. INICIALIZAÇÃO
    // ================================================================
    init: function() {
        console.log('✅ Módulo Funcionários (Completo com Perfis) carregado!');
        console.log('📋 Funcionalidades disponíveis:');
        console.log('  • CRUD com foto');
        console.log('  • Upload de documentos (RG, CTPS, Contratos)');
        console.log('  • Ponto individual e coletivo');
        console.log('  • Recibos de pagamento (modelos customizáveis)');
        console.log('  • Dashboard individual');
        console.log('  • Gestão de férias e status');
        console.log('  • Relatórios e exportação');
        console.log('  • 🔑 Integração com Perfis (criar/gerenciar perfil)');
    }
};

// Inicializa o módulo
GR.Modules.Funcionarios.init();

console.log('✅ Módulo Funcionários (Completo com Perfis) carregado!');