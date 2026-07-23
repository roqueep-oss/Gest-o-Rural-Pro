// ================================================================
// MÓDULO: ORÇAMENTOS DE FORNECEDORES (COMPRAS) - COM FILTRO
// ================================================================
// Gerencia orçamentos recebidos de terceiros para aquisição de
// insumos, materiais e serviços para as propriedades
// ================================================================

GR.Modules.Orcamentos = {
    // ================================================================
    // RENDER PRINCIPAL - COM FILTRO DE PROPRIEDADE
    // ================================================================
    render: function() {
        var div = document.getElementById('lista-orcamentos');
        if (!div) return;
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.orcamentos || [], 'propriedade');
        
        // 🔥 APLICA O FILTRO DA ABA ATIVA (SE NÃO FOR "TODAS")
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }

        // Ordena por data (mais recentes primeiro)
        items.sort(function(a, b) {
            return new Date(b.dataRecebimento || b.data) - new Date(a.dataRecebimento || a.data);
        });

        if (!items.length) {
            div.innerHTML = `
                <div class="empty-state">
                    <span class="icon">📄</span>
                    <div class="message">Nenhum orçamento de fornecedor cadastrado</div>
                    <div style="font-size:12px;color:var(--text-light);margin-top:8px;">
                        Clique em "➕ Novo Orçamento" para registrar uma cotação recebida
                    </div>
                </div>
            `;
            return;
        }

        // Estatísticas
        var total = items.reduce(function(s, o) { return s + (o.valorTotal || 0); }, 0);
        var aprovados = items.filter(function(o) { return o.status === 'Aprovado'; });
        var pendentes = items.filter(function(o) { return o.status === 'Pendente' || o.status === 'Em análise'; });
        var recusados = items.filter(function(o) { return o.status === 'Recusado'; });
        var totalAprovados = aprovados.reduce(function(s, o) { return s + (o.valorTotal || 0); }, 0);

        var html = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:12px;">
                <div class="stats-card" style="padding:10px;">
                    <div class="number" style="font-size:18px;">${items.length}</div>
                    <div class="label" style="font-size:11px;">📋 Total de Cotações</div>
                </div>
                <div class="stats-card" style="padding:10px;border-left-color:var(--warning);">
                    <div class="number" style="font-size:18px;color:var(--warning);">${pendentes.length}</div>
                    <div class="label" style="font-size:11px;">⏳ Em Análise</div>
                </div>
                <div class="stats-card" style="padding:10px;border-left-color:var(--success);">
                    <div class="number" style="font-size:18px;color:var(--success);">${aprovados.length}</div>
                    <div class="label" style="font-size:11px;">✅ Aprovados</div>
                </div>
                <div class="stats-card" style="padding:10px;border-left-color:var(--danger);">
                    <div class="number" style="font-size:18px;color:var(--danger);">${recusados.length}</div>
                    <div class="label" style="font-size:11px;">❌ Recusados</div>
                </div>
                <div class="stats-card" style="padding:10px;border-left-color:var(--primary);">
                    <div class="number" style="font-size:18px;color:var(--primary);">${GR.Utils.formatarMoedaBR(total)}</div>
                    <div class="label" style="font-size:11px;">💰 Valor Total Cotações</div>
                </div>
            </div>

            <!-- Filtros rápidos -->
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Orcamentos._filtrarPorStatus('todos')" style="font-size:11px;">📋 Todos</button>
                <button class="btn btn-sm btn-warning" onclick="GR.Modules.Orcamentos._filtrarPorStatus('Pendente')" style="font-size:11px;">⏳ Pendentes</button>
                <button class="btn btn-sm btn-success" onclick="GR.Modules.Orcamentos._filtrarPorStatus('Aprovado')" style="font-size:11px;">✅ Aprovados</button>
                <button class="btn btn-sm btn-danger" onclick="GR.Modules.Orcamentos._filtrarPorStatus('Recusado')" style="font-size:11px;">❌ Recusados</button>
                <button class="btn btn-sm btn-info" onclick="GR.Modules.Orcamentos._filtrarPorFornecedor()" style="font-size:11px;">🏢 Por Fornecedor</button>
            </div>
        `;

        html += '<div class="table-responsive"><table><thead><tr>' +
            '<th>Nº Cotação</th>' +
            '<th>Fornecedor</th>' +
            '<th>Data Recebimento</th>' +
            '<th>Valor Total</th>' +
            '<th>Insumos/Materiais</th>' +
            '<th>Status</th>' +
            '<th>Propriedade</th>' +
            '<th style="text-align:center;">Ações</th>' +
            '</tr></thead><tbody>';

        items.forEach(function(o) {
            var statusBadge = o.status === 'Aprovado' ? 
                '<span class="badge badge-success">✅ Aprovado</span>' :
                o.status === 'Recusado' ? 
                '<span class="badge badge-danger">❌ Recusado</span>' :
                o.status === 'Em análise' ?
                '<span class="badge badge-info">🔍 Em análise</span>' :
                '<span class="badge badge-warning">⏳ Pendente</span>';

            var podeExcluir = GR.Modules.Perfis ? GR.Modules.Perfis.podeExcluir('orcamentos') : true;
            var podeEditar = GR.Modules.Perfis ? GR.Modules.Perfis.podeEditar('orcamentos') : true;

            // Resumo dos itens
            var resumoItens = '';
            if (o.itens && Array.isArray(o.itens) && o.itens.length > 0) {
                var nomes = o.itens.map(function(item) { return item.nome || item.descricao || 'Item'; });
                resumoItens = nomes.slice(0, 3).join(', ');
                if (nomes.length > 3) resumoItens += ' +' + (nomes.length - 3) + '...';
            } else if (o.itens && typeof o.itens === 'string') {
                resumoItens = o.itens.substring(0, 30) + (o.itens.length > 30 ? '...' : '');
            } else {
                resumoItens = '-';
            }

            html += '<tr>' +
                '<td><strong>' + GR.Utils.escapeHtml(o.numero || o.id.substring(0, 8)) + '</strong></td>' +
                '<td>' + GR.Utils.escapeHtml(o.fornecedor || o.nome || 'N/A') + '</td>' +
                '<td>' + GR.Utils.formatarDataBR(o.dataRecebimento || o.data) + '</td>' +
                '<td><strong>' + GR.Utils.formatarMoedaBR(o.valorTotal || o.valor || 0) + '</strong></td>' +
                '<td style="font-size:12px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + GR.Utils.escapeHtml(resumoItens) + '">' + resumoItens + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + GR.Utils.escapeHtml(o.propriedade || '-') + '</td>' +
                '<td style="text-align:center;white-space:nowrap;">' +
                (podeEditar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Orcamentos.editar('${o.id}')" title="Editar orçamento">✏️</button> ` : '') +
                (podeExcluir ? `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Orcamentos.excluir('${o.id}')" title="Excluir orçamento">🗑️</button> ` : '') +
                `<button class="btn btn-info btn-sm" onclick="GR.Modules.Orcamentos.gerarPDF('${o.id}')" title="Gerar PDF do orçamento">📄 PDF</button> ` +
                `<button class="btn btn-success btn-sm" onclick="GR.Modules.Orcamentos.aprovar('${o.id}')" title="Aprovar orçamento">✅</button> ` +
                `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Orcamentos.recusar('${o.id}')" title="Recusar orçamento">❌</button>` +
                '</td></tr>';
        });

        html += '</tbody></table></div>';
        div.innerHTML = html;
        
        console.log('📊 Orçamentos filtrados:', items.length, 'de', (GR.State.data.orcamentos || []).length);
    },

    // ================================================================
    // 🆕 FILTROS - COM FILTRO DE PROPRIEDADE
    // ================================================================
    _filtroStatusAtual: 'todos',

    _filtrarPorStatus: function(status) {
        this._filtroStatusAtual = status;
        var div = document.getElementById('lista-orcamentos');
        if (!div) return;
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.orcamentos || [], 'propriedade');
        
        // 🔥 APLICA O FILTRO DA ABA ATIVA
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        
        if (status !== 'todos') {
            items = items.filter(function(item) {
                return item.status === status;
            });
        }

        this._renderListaFiltrada(div, items);
    },

    _filtrarPorFornecedor: function() {
        var fornecedor = prompt('Digite o nome do fornecedor para filtrar:');
        if (!fornecedor || !fornecedor.trim()) return;
        
        var div = document.getElementById('lista-orcamentos');
        if (!div) return;
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.orcamentos || [], 'propriedade');
        
        // 🔥 APLICA O FILTRO DA ABA ATIVA
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        
        items = items.filter(function(item) {
            var nomeFornecedor = (item.fornecedor || item.nome || '').toLowerCase();
            return nomeFornecedor.includes(fornecedor.toLowerCase().trim());
        });

        this._renderListaFiltrada(div, items);
        GR.Toast.info('🔍 Filtrando por: ' + fornecedor);
    },

    _renderListaFiltrada: function(div, filtrados) {
        if (!filtrados.length) {
            div.innerHTML = `
                <div class="empty-state">
                    <span class="icon">🔍</span>
                    <div class="message">Nenhum orçamento encontrado com este filtro</div>
                    <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Orcamentos._filtrarPorStatus('todos')" style="margin-top:8px;">
                        🔄 Limpar filtros
                    </button>
                </div>
            `;
            return;
        }

        var html = this._gerarTabelaOrcamentos(filtrados);
        div.innerHTML = html;
    },

    _gerarTabelaOrcamentos: function(items) {
        var html = '<div class="table-responsive"><table><thead><tr>' +
            '<th>Nº Cotação</th><th>Fornecedor</th><th>Data</th><th>Valor Total</th>' +
            '<th>Insumos</th><th>Status</th><th>Propriedade</th><th style="text-align:center;">Ações</th>' +
            '</tr></thead><tbody>';

        items.forEach(function(o) {
            var statusBadge = o.status === 'Aprovado' ? 
                '<span class="badge badge-success">✅ Aprovado</span>' :
                o.status === 'Recusado' ? 
                '<span class="badge badge-danger">❌ Recusado</span>' :
                o.status === 'Em análise' ?
                '<span class="badge badge-info">🔍 Em análise</span>' :
                '<span class="badge badge-warning">⏳ Pendente</span>';

            var podeExcluir = GR.Modules.Perfis ? GR.Modules.Perfis.podeExcluir('orcamentos') : true;
            var podeEditar = GR.Modules.Perfis ? GR.Modules.Perfis.podeEditar('orcamentos') : true;

            var resumoItens = '';
            if (o.itens && Array.isArray(o.itens) && o.itens.length > 0) {
                var nomes = o.itens.map(function(item) { return item.nome || item.descricao || 'Item'; });
                resumoItens = nomes.slice(0, 3).join(', ');
                if (nomes.length > 3) resumoItens += ' +' + (nomes.length - 3) + '...';
            } else if (o.itens && typeof o.itens === 'string') {
                resumoItens = o.itens.substring(0, 30) + (o.itens.length > 30 ? '...' : '');
            } else {
                resumoItens = '-';
            }

            html += '<tr>' +
                '<td><strong>' + GR.Utils.escapeHtml(o.numero || o.id.substring(0, 8)) + '</strong></td>' +
                '<td>' + GR.Utils.escapeHtml(o.fornecedor || o.nome || 'N/A') + '</td>' +
                '<td>' + GR.Utils.formatarDataBR(o.dataRecebimento || o.data) + '</td>' +
                '<td><strong>' + GR.Utils.formatarMoedaBR(o.valorTotal || o.valor || 0) + '</strong></td>' +
                '<td style="font-size:12px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + resumoItens + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + GR.Utils.escapeHtml(o.propriedade || '-') + '</td>' +
                '<td style="text-align:center;white-space:nowrap;">' +
                (podeEditar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Orcamentos.editar('${o.id}')" title="Editar">✏️</button> ` : '') +
                (podeExcluir ? `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Orcamentos.excluir('${o.id}')" title="Excluir">🗑️</button> ` : '') +
                `<button class="btn btn-info btn-sm" onclick="GR.Modules.Orcamentos.gerarPDF('${o.id}')" title="Gerar PDF">📄</button> ` +
                `<button class="btn btn-success btn-sm" onclick="GR.Modules.Orcamentos.aprovar('${o.id}')" title="Aprovar">✅</button> ` +
                `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Orcamentos.recusar('${o.id}')" title="Recusar">❌</button>` +
                '</td></tr>';
        });

        html += '</tbody></table></div>';
        return html;
    },

    // ================================================================
    // ABRIR MODAL - COM FILTRO DE PROPRIEDADE NO SELECT
    // ================================================================
    abrirModal: function(id) {
        var modalId = 'modal-orcamento';
        
        // 🔥 ATUALIZA O SELECT DE PROPRIEDADE COM AS PERMITIDAS
        GR.UI._atualizarSelectsPropriedade();
        
        if (id) {
            var items = GR.State.data.orcamentos || [];
            var orcamento = items.find(function(o) { return o.id === id; });
            if (!orcamento) {
                GR.Toast.error('Orçamento não encontrado!');
                return;
            }
            
            setTimeout(function() {
                document.getElementById('orc-numero').value = orcamento.numero || '';
                document.getElementById('orc-data').value = orcamento.dataRecebimento || orcamento.data || '';
                document.getElementById('orc-fornecedor').value = orcamento.fornecedor || orcamento.nome || '';
                document.getElementById('orc-cnpj').value = orcamento.cnpj || orcamento.cpfcnpj || '';
                document.getElementById('orc-contato').value = orcamento.contato || '';
                document.getElementById('orc-telefone').value = orcamento.telefone || '';
                document.getElementById('orc-email').value = orcamento.email || '';
                document.getElementById('orc-valor-total').value = GR.Utils.formatarMoedaBR(orcamento.valorTotal || orcamento.valor || 0);
                document.getElementById('orc-status').value = orcamento.status || 'Pendente';
                document.getElementById('orc-propriedade').value = orcamento.propriedade || '';
                document.getElementById('orc-prazo-entrega').value = orcamento.prazoEntrega || '';
                document.getElementById('orc-forma-pagamento').value = orcamento.formaPagamento || '';
                document.getElementById('orc-condicoes').value = orcamento.condicoes || '';
                document.getElementById('orc-itens-json').value = orcamento.itens ? JSON.stringify(orcamento.itens, null, 2) : '';
                document.getElementById('orc-observacoes').value = orcamento.observacoes || '';
                document.getElementById('orc-id-edit').value = id;
                
                var title = document.querySelector('#modal-orcamento .modal-title');
                if (title) title.textContent = '✏️ Editar Cotação - ' + (orcamento.fornecedor || orcamento.nome);
            }, 100);
        } else {
            setTimeout(function() {
                document.getElementById('orc-numero').value = 'COT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
                document.getElementById('orc-data').value = new Date().toISOString().split('T')[0];
                document.getElementById('orc-fornecedor').value = '';
                document.getElementById('orc-cnpj').value = '';
                document.getElementById('orc-contato').value = '';
                document.getElementById('orc-telefone').value = '';
                document.getElementById('orc-email').value = '';
                document.getElementById('orc-valor-total').value = 'R$ 0,00';
                document.getElementById('orc-status').value = 'Pendente';
                document.getElementById('orc-propriedade').value = GR.State.ui.propriedadeAtiva || '';
                document.getElementById('orc-prazo-entrega').value = '';
                document.getElementById('orc-forma-pagamento').value = '';
                document.getElementById('orc-condicoes').value = '';
                document.getElementById('orc-itens-json').value = '';
                document.getElementById('orc-observacoes').value = '';
                document.getElementById('orc-id-edit').value = '';
                
                var title = document.querySelector('#modal-orcamento .modal-title');
                if (title) title.textContent = '📄 Nova Cotação de Fornecedor';
            }, 100);
        }
        
        GR.Modal.open(modalId);
    },

    // ================================================================
    // SALVAR ORÇAMENTO
    // ================================================================
    salvar: function() {
        var numero = document.getElementById('orc-numero').value.trim();
        var data = document.getElementById('orc-data').value;
        var fornecedor = document.getElementById('orc-fornecedor').value.trim();
        var cnpj = document.getElementById('orc-cnpj').value.trim();
        var contato = document.getElementById('orc-contato').value.trim();
        var telefone = document.getElementById('orc-telefone').value.trim();
        var email = document.getElementById('orc-email').value.trim();
        var valorTotal = GR.Utils.parseMoedaBR(document.getElementById('orc-valor-total').value);
        var status = document.getElementById('orc-status').value;
        var propriedade = document.getElementById('orc-propriedade').value;
        var prazoEntrega = document.getElementById('orc-prazo-entrega').value;
        var formaPagamento = document.getElementById('orc-forma-pagamento').value;
        var condicoes = document.getElementById('orc-condicoes').value.trim();
        var itensJson = document.getElementById('orc-itens-json').value.trim();
        var observacoes = document.getElementById('orc-observacoes').value.trim();
        var editId = document.getElementById('orc-id-edit').value;

        if (!numero || !data || !fornecedor || !valorTotal) {
            GR.Toast.error('❌ Preencha: Nº Cotação, Data, Fornecedor e Valor Total!');
            return;
        }

        // Parse dos itens se for JSON
        var itens = [];
        if (itensJson) {
            try {
                itens = JSON.parse(itensJson);
                if (!Array.isArray(itens)) {
                    itens = [itens];
                }
            } catch (e) {
                var linhas = itensJson.split('\n').filter(function(l) { return l.trim(); });
                itens = linhas.map(function(l) { 
                    return { descricao: l, quantidade: 1, valor: 0 };
                });
            }
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            numero: GR.Utils.escapeHtml(numero),
            dataRecebimento: data,
            fornecedor: GR.Utils.escapeHtml(fornecedor),
            cnpj: cnpj,
            contato: GR.Utils.escapeHtml(contato),
            telefone: telefone,
            email: email,
            valorTotal: valorTotal || 0,
            status: status || 'Pendente',
            propriedade: GR.Utils.escapeHtml(propriedade),
            prazoEntrega: prazoEntrega,
            formaPagamento: formaPagamento,
            condicoes: GR.Utils.escapeHtml(condicoes),
            itens: itens,
            observacoes: GR.Utils.escapeHtml(observacoes),
            dataAtualizacao: GR.Utils.now(),
            tipo: 'compra'
        };

        var collection = db.collection('users').doc(uid).collection('orcamentos');

        if (editId) {
            collection.doc(editId).update(dados)
                .then(function() {
                    GR.Modal.close('modal-orcamento');
                    GR.Toast.success('✅ Cotação atualizada!');
                    GR.State.adicionarHistorico('atualizou cotação', 'Orçamentos', 'Fornecedor: ' + fornecedor);
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao atualizar: ' + err.message);
                });
        } else {
            dados.dataCriacao = GR.Utils.now();
            collection.add(dados)
                .then(function() {
                    GR.Modal.close('modal-orcamento');
                    GR.Toast.success('✅ Cotação salva!');
                    GR.State.adicionarHistorico('criou cotação', 'Orçamentos', 'Fornecedor: ' + fornecedor);
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao salvar: ' + err.message);
                });
        }
    },

    // ================================================================
    // APROVAR ORÇAMENTO
    // ================================================================
    aprovar: function(id) {
        if (!confirm('✅ Confirmar aprovação deste orçamento?\n\nIsso registrará uma aprovação para compra.')) return;
        
        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        db.collection('users').doc(uid).collection('orcamentos').doc(id).update({
            status: 'Aprovado',
            dataAprovacao: GR.Utils.now(),
            aprovadoPor: user.displayName || user.email
        }).then(function() {
            GR.Toast.success('✅ Orçamento aprovado!');
            GR.State.adicionarHistorico('aprovou orçamento', 'Orçamentos', 'ID: ' + id);
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro ao aprovar: ' + err.message);
        });
    },

    // ================================================================
    // RECUSAR ORÇAMENTO
    // ================================================================
    recusar: function(id) {
        var motivo = prompt('❌ Motivo da recusa:');
        if (motivo === null) return;
        
        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        db.collection('users').doc(uid).collection('orcamentos').doc(id).update({
            status: 'Recusado',
            dataRecusa: GR.Utils.now(),
            motivoRecusa: motivo || 'Não informado',
            recusadoPor: user.displayName || user.email
        }).then(function() {
            GR.Toast.info('❌ Orçamento recusado');
            GR.State.adicionarHistorico('recusou orçamento', 'Orçamentos', 'ID: ' + id);
            GR.UI.refreshCurrentView();
        }).catch(function(err) {
            GR.Toast.error('Erro ao recusar: ' + err.message);
        });
    },

    // ================================================================
    // EXCLUIR
    // ================================================================
    excluir: function(id) {
        if (GR.Modules.Perfis && !GR.Modules.Perfis.podeExcluir('orcamentos')) {
            GR.Toast.error('❌ Você não tem permissão para excluir!');
            return;
        }
        
        if (!confirm('⚠️ Tem certeza que deseja excluir esta cotação?\nEsta ação não pode ser desfeita!')) return;
        
        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }
        
        var uid = user.uid;
        db.collection('users').doc(uid).collection('orcamentos').doc(id).delete()
            .then(function() {
                GR.Toast.success('🗑️ Cotação excluída!');
                GR.State.adicionarHistorico('excluiu cotação', 'Orçamentos', 'ID: ' + id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // EDIÇÃO
    // ================================================================
    editar: function(id) {
        this.abrirModal(id);
    },

    // ================================================================
    // GERAR PDF
    // ================================================================
    gerarPDF: function(id) {
        var items = GR.State.data.orcamentos || [];
        var orcamento = items.find(function(o) { return o.id === id; });
        if (!orcamento) {
            GR.Toast.error('Orçamento não encontrado!');
            return;
        }

        GR.Toast.info('📄 Gerando PDF...');

        if (typeof window.jspdf === 'undefined') {
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = function() {
                var script2 = document.createElement('script');
                script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
                script2.onload = function() {
                    GR.Modules.Orcamentos._gerarPDFFornecedor(orcamento);
                };
                document.head.appendChild(script2);
            };
            document.head.appendChild(script);
        } else {
            this._gerarPDFFornecedor(orcamento);
        }
    },

    // ================================================================
    // GERAR PDF - COTAÇÃO DE FORNECEDOR
    // ================================================================
    _gerarPDFFornecedor: function(orcamento) {
        try {
            var { jsPDF } = window.jspdf;
            var doc = new jsPDF('p', 'mm', 'a4');
            var pageWidth = doc.internal.pageSize.getWidth();
            var margin = 15;
            var y = margin;

            doc.setFontSize(20);
            doc.setTextColor(46, 125, 50);
            doc.setFont('helvetica', 'bold');
            doc.text('📄 COTAÇÃO DE FORNECEDOR', pageWidth / 2, y, { align: 'center' });
            y += 6;

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text('Documento para análise de compra de insumos/materiais', pageWidth / 2, y, { align: 'center' });
            y += 8;

            doc.setDrawColor(46, 125, 50);
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);

            var infoLinhas = [
                ['Nº da Cotação:', orcamento.numero || 'N/A'],
                ['Data de Recebimento:', GR.Utils.formatarDataBR(orcamento.dataRecebimento || orcamento.data) || 'N/A'],
                ['Status:', orcamento.status || 'Pendente'],
                ['Propriedade:', orcamento.propriedade || 'N/A']
            ];

            if (orcamento.dataAprovacao) {
                infoLinhas.push(['Data de Aprovação:', GR.Utils.formatarDataBR(orcamento.dataAprovacao)]);
            }

            infoLinhas.forEach(function(info) {
                doc.setFont('helvetica', 'bold');
                doc.text(info[0], margin, y);
                doc.setFont('helvetica', 'normal');
                doc.text(info[1], margin + 50, y);
                y += 6;
            });

            y += 4;

            doc.setFontSize(12);
            doc.setTextColor(46, 125, 50);
            doc.setFont('helvetica', 'bold');
            doc.text('🏢 Dados do Fornecedor', margin, y);
            y += 6;

            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            doc.setFont('helvetica', 'normal');

            var fornecedorLinhas = [
                ['Fornecedor:', orcamento.fornecedor || orcamento.nome || 'N/A'],
                ['CNPJ:', orcamento.cnpj || 'N/A'],
                ['Contato:', orcamento.contato || 'N/A'],
                ['Telefone:', orcamento.telefone || 'N/A'],
                ['E-mail:', orcamento.email || 'N/A']
            ];

            fornecedorLinhas.forEach(function(info) {
                doc.setFont('helvetica', 'bold');
                doc.text(info[0], margin + 5, y);
                doc.setFont('helvetica', 'normal');
                doc.text(info[1], margin + 40, y);
                y += 6;
            });

            y += 4;

            doc.setFontSize(12);
            doc.setTextColor(46, 125, 50);
            doc.setFont('helvetica', 'bold');
            doc.text('📦 Itens Cotados', margin, y);
            y += 6;

            var itensArray = [];
            if (orcamento.itens && Array.isArray(orcamento.itens)) {
                itensArray = orcamento.itens;
            } else if (orcamento.itens && typeof orcamento.itens === 'string') {
                try {
                    var parsed = JSON.parse(orcamento.itens);
                    itensArray = Array.isArray(parsed) ? parsed : [{ descricao: orcamento.itens }];
                } catch (e) {
                    itensArray = [{ descricao: orcamento.itens }];
                }
            }

            if (itensArray.length > 0) {
                var tableData = itensArray.map(function(item) {
                    return [
                        item.descricao || item.nome || 'Item',
                        item.quantidade || item.qtd || 1,
                        item.unidade || 'UN',
                        'R$ ' + (item.valorUnitario || item.valor || 0).toFixed(2),
                        'R$ ' + ((item.valorUnitario || item.valor || 0) * (item.quantidade || 1)).toFixed(2)
                    ];
                });

                doc.autoTable({
                    startY: y,
                    head: [['Descrição', 'Qtd', 'Un', 'Valor Unit.', 'Total']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: {
                        fillColor: [46, 125, 50],
                        textColor: [255, 255, 255],
                        fontSize: 9,
                        fontStyle: 'bold'
                    },
                    bodyStyles: {
                        fontSize: 8
                    },
                    columnStyles: {
                        0: { cellWidth: 60 },
                        1: { cellWidth: 15, halign: 'center' },
                        2: { cellWidth: 15, halign: 'center' },
                        3: { cellWidth: 25, halign: 'right' },
                        4: { cellWidth: 25, halign: 'right' }
                    },
                    margin: { left: margin + 5, right: margin + 5 }
                });

                y = doc.lastAutoTable.finalY + 8;
            } else {
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.setFont('helvetica', 'italic');
                doc.text('Nenhum item detalhado', margin + 5, y);
                y += 8;
            }

            doc.setFontSize(14);
            doc.setTextColor(46, 125, 50);
            doc.setFont('helvetica', 'bold');
            doc.text('💰 Valor Total da Cotação:', margin, y);
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(GR.Utils.formatarMoedaBR(orcamento.valorTotal || orcamento.valor || 0), 
                pageWidth - margin - 50, y, { align: 'right' });
            y += 10;

            if (orcamento.prazoEntrega || orcamento.formaPagamento || orcamento.condicoes) {
                doc.setFontSize(10);
                doc.setTextColor(50, 50, 50);
                doc.setFont('helvetica', 'bold');
                doc.text('📋 Condições Comerciais', margin, y);
                y += 6;

                doc.setFont('helvetica', 'normal');
                if (orcamento.prazoEntrega) {
                    doc.text('Prazo de Entrega: ' + orcamento.prazoEntrega, margin + 5, y);
                    y += 5;
                }
                if (orcamento.formaPagamento) {
                    doc.text('Forma de Pagamento: ' + orcamento.formaPagamento, margin + 5, y);
                    y += 5;
                }
                if (orcamento.condicoes) {
                    var condLines = doc.splitTextToSize('Condições: ' + orcamento.condicoes, pageWidth - margin * 2 - 10);
                    doc.text(condLines, margin + 5, y);
                    y += condLines.length * 5 + 4;
                }
                y += 4;
            }

            if (orcamento.observacoes) {
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.setFont('helvetica', 'italic');
                var obsLines = doc.splitTextToSize('📝 Observações: ' + orcamento.observacoes, pageWidth - margin * 2);
                doc.text(obsLines, margin, y);
                y += obsLines.length * 5 + 8;
            }

            var dataGeracao = new Date().toLocaleString('pt-BR');
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'italic');
            
            var docY = doc.internal.pageSize.getHeight() - 15;
            doc.text('📄 Documento gerado em: ' + dataGeracao, margin, docY);
            doc.text('🌾 Gestão Rural v2.2', pageWidth - margin, docY, { align: 'right' });

            if (orcamento.status === 'Aprovado') {
                docY -= 10;
                doc.setDrawColor(46, 125, 50);
                doc.setLineWidth(0.3);
                doc.line(margin + 20, docY, margin + 70, docY);
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text('Assinatura do Responsável', margin + 25, docY + 4);
                doc.text('Data: ' + GR.Utils.formatarDataBR(orcamento.dataAprovacao || new Date()), margin + 25, docY + 8);
            }

            var nomeArquivo = 'cotacao_' + (orcamento.numero || orcamento.id).replace(/\s/g, '_') + '.pdf';
            doc.save(nomeArquivo);
            GR.Toast.success('✅ PDF gerado com sucesso!');
            GR.State.adicionarHistorico('gerou PDF da cotação', 'Orçamentos', 'PDF: ' + (orcamento.numero || orcamento.id));

        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            GR.Toast.error('Erro ao gerar PDF: ' + error.message);
        }
    }
};

console.log('✅ Módulo Orçamentos de Fornecedores carregado com filtro de propriedade!');