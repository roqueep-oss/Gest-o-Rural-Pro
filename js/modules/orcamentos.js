// ================================================================
// MÓDULO: ORÇAMENTOS DE FORNECEDORES (COMPRAS) - VERSÃO COMPLETA
// ================================================================
// Gerencia orçamentos recebidos de terceiros para aquisição de
// insumos, materiais e serviços para as propriedades
// ================================================================

GR.Modules.Orcamentos = {
    // ================================================================
    // CONFIGURAÇÃO
    // ================================================================
    filtroStatus: 'todos',
    filtroFornecedor: '',
    filtroDataInicio: '',
    filtroDataFim: '',
    itensCotados: [],  // Itens do orçamento atual
    modoTexto: false,  // true = modo texto, false = modo visual
    orcamentoEditandoId: null,

    // ================================================================
    // FUNÇÕES DE PERMISSÃO SEGURAS
    // ================================================================
    _podeExcluir: function() {
        try {
            if (typeof GR.Modules.Perfis !== 'undefined' && 
                typeof GR.Modules.Perfis.podeExcluir === 'function') {
                return GR.Modules.Perfis.podeExcluir('orcamentos');
            }
            return true;
        } catch(e) {
            return true;
        }
    },

    _podeEditar: function() {
        try {
            if (typeof GR.Modules.Perfis !== 'undefined' && 
                typeof GR.Modules.Perfis.podeEditar === 'function') {
                return GR.Modules.Perfis.podeEditar('orcamentos');
            }
            return true;
        } catch(e) {
            return true;
        }
    },

    _podeCriar: function() {
        try {
            if (typeof GR.Modules.Perfis !== 'undefined' && 
                typeof GR.Modules.Perfis.podeCriar === 'function') {
                return GR.Modules.Perfis.podeCriar('orcamentos');
            }
            return true;
        } catch(e) {
            return true;
        }
    },

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

        // Aplica filtros adicionais
        items = this._aplicarFiltros(items);

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
            <!-- STATS CARDS -->
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
                    <div class="label" style="font-size:11px;">💰 Valor Total</div>
                </div>
            </div>

            <!-- FILTROS -->
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;padding:10px;background:var(--bg);border-radius:6px;border:1px solid var(--border);">
                <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:12px;">📌</span>
                    <select id="orcamento-filtro-status" onchange="GR.Modules.Orcamentos._aplicarFiltroStatus(this.value)" 
                            style="padding:4px 8px;border-radius:4px;border:1px solid var(--border);font-size:11px;background:var(--bg);">
                        <option value="todos">Todos os status</option>
                        <option value="Pendente">⏳ Pendente</option>
                        <option value="Em análise">🔍 Em análise</option>
                        <option value="Aprovado">✅ Aprovado</option>
                        <option value="Recusado">❌ Recusado</option>
                    </select>
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:12px;">🏢</span>
                    <input type="text" id="orcamento-filtro-fornecedor" placeholder="Buscar fornecedor..." 
                           oninput="GR.Modules.Orcamentos._aplicarFiltroFornecedor(this.value)"
                           style="padding:4px 8px;border-radius:4px;border:1px solid var(--border);font-size:11px;width:150px;">
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:12px;">📅</span>
                    <input type="date" id="orcamento-filtro-inicio" onchange="GR.Modules.Orcamentos._aplicarFiltroData()"
                           style="padding:4px 8px;border-radius:4px;border:1px solid var(--border);font-size:11px;width:120px;">
                    <span style="font-size:11px;">a</span>
                    <input type="date" id="orcamento-filtro-fim" onchange="GR.Modules.Orcamentos._aplicarFiltroData()"
                           style="padding:4px 8px;border-radius:4px;border:1px solid var(--border);font-size:11px;width:120px;">
                </div>
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Orcamentos.limparFiltros()" 
                        style="font-size:10px;padding:2px 10px;">
                    🧹 Limpar
                </button>
            </div>

            <!-- BOTÕES RÁPIDOS -->
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Orcamentos._filtrarPorStatus('todos')" style="font-size:11px;">📋 Todos</button>
                <button class="btn btn-sm btn-warning" onclick="GR.Modules.Orcamentos._filtrarPorStatus('Pendente')" style="font-size:11px;">⏳ Pendentes</button>
                <button class="btn btn-sm btn-success" onclick="GR.Modules.Orcamentos._filtrarPorStatus('Aprovado')" style="font-size:11px;">✅ Aprovados</button>
                <button class="btn btn-sm btn-danger" onclick="GR.Modules.Orcamentos._filtrarPorStatus('Recusado')" style="font-size:11px;">❌ Recusados</button>
                <button class="btn btn-sm btn-info" onclick="GR.Modules.Orcamentos._filtrarPorFornecedor()" style="font-size:11px;">🏢 Por Fornecedor</button>
            </div>
        `;

        // 🔥 CORREÇÃO: Usa funções seguras de permissão
        var podeExcluir = this._podeExcluir();
        var podeEditar = this._podeEditar();

        html += '<div class="table-responsive"><table><thead><tr>' +
            '<th>Nº Cotação</th>' +
            '<th>Fornecedor</th>' +
            '<th>Data</th>' +
            '<th>Valor Total</th>' +
            '<th>Itens</th>' +
            '<th>Status</th>' +
            '<th>Propriedade</th>' +
            '<th style="text-align:center;">Ações</th>' +
            '</tr></thead><tbody>';

        items.forEach(function(o) {
            var statusBadge = this._getStatusBadge(o.status);
            var resumoItens = this._getResumoItens(o.itens);

            html += '<tr>' +
                '<td><strong>' + GR.Utils.escapeHtml(o.numero || o.id.substring(0, 8)) + '</strong></td>' +
                '<td>' + GR.Utils.escapeHtml(o.fornecedor || o.nome || 'N/A') + '</td>' +
                '<td>' + GR.Utils.formatarDataBR(o.dataRecebimento || o.data) + '</td>' +
                '<td><strong>' + GR.Utils.formatarMoedaBR(o.valorTotal || o.valor || 0) + '</strong></td>' +
                '<td style="font-size:11px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + GR.Utils.escapeHtml(resumoItens) + '">' + resumoItens + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + GR.Utils.escapeHtml(o.propriedade || '-') + '</td>' +
                '<td style="text-align:center;white-space:nowrap;">' +
                (podeEditar ? `<button class="btn btn-primary btn-sm" onclick="GR.Modules.Orcamentos.abrirModal('${o.id}')" title="Editar">✏️</button> ` : '') +
                (podeExcluir ? `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Orcamentos.excluir('${o.id}')" title="Excluir">🗑️</button> ` : '') +
                `<button class="btn btn-info btn-sm" onclick="GR.Modules.Orcamentos.gerarPDF('${o.id}')" title="Gerar PDF">📄</button> ` +
                `<button class="btn btn-success btn-sm" onclick="GR.Modules.Orcamentos.aprovar('${o.id}')" title="Aprovar">✅</button> ` +
                `<button class="btn btn-danger btn-sm" onclick="GR.Modules.Orcamentos.recusar('${o.id}')" title="Recusar">❌</button>` +
                '</td></tr>';
        }.bind(this));

        html += '</tbody></table></div>';
        div.innerHTML = html;
        
        console.log('📊 Orçamentos filtrados:', items.length, 'de', (GR.State.data.orcamentos || []).length);
    },

    // ================================================================
    // FUNÇÕES AUXILIARES
    // ================================================================
    _getStatusBadge: function(status) {
        var badges = {
            'Aprovado': '<span class="badge badge-success">✅ Aprovado</span>',
            'Recusado': '<span class="badge badge-danger">❌ Recusado</span>',
            'Em análise': '<span class="badge badge-info">🔍 Em análise</span>',
            'Pendente': '<span class="badge badge-warning">⏳ Pendente</span>'
        };
        return badges[status] || '<span class="badge badge-secondary">' + (status || 'Pendente') + '</span>';
    },

    _getResumoItens: function(itens) {
        if (!itens) return '-';
        
        if (Array.isArray(itens) && itens.length > 0) {
            var nomes = itens.map(function(item) { 
                return item.produto || item.descricao || item.nome || 'Item'; 
            });
            var resumo = nomes.slice(0, 3).join(', ');
            if (nomes.length > 3) resumo += ' +' + (nomes.length - 3) + '...';
            return resumo;
        } else if (typeof itens === 'string') {
            try {
                var parsed = JSON.parse(itens);
                if (Array.isArray(parsed)) {
                    return this._getResumoItens(parsed);
                }
                return itens.substring(0, 30) + (itens.length > 30 ? '...' : '');
            } catch (e) {
                return itens.substring(0, 30) + (itens.length > 30 ? '...' : '');
            }
        }
        return '-';
    },

    // ================================================================
    // FILTROS
    // ================================================================
    _aplicarFiltros: function(items) {
        var self = this;
        return items.filter(function(item) {
            if (self.filtroStatus !== 'todos' && item.status !== self.filtroStatus) {
                return false;
            }
            if (self.filtroFornecedor) {
                var nomeFornecedor = (item.fornecedor || item.nome || '').toLowerCase();
                if (!nomeFornecedor.includes(self.filtroFornecedor.toLowerCase())) {
                    return false;
                }
            }
            if (self.filtroDataInicio && item.dataRecebimento && item.dataRecebimento < self.filtroDataInicio) {
                return false;
            }
            if (self.filtroDataFim && item.dataRecebimento && item.dataRecebimento > self.filtroDataFim) {
                return false;
            }
            return true;
        });
    },

    _aplicarFiltroStatus: function(valor) {
        this.filtroStatus = valor;
        this.render();
    },

    _aplicarFiltroFornecedor: function(valor) {
        this.filtroFornecedor = valor;
        this.render();
    },

    _aplicarFiltroData: function() {
        this.filtroDataInicio = document.getElementById('orcamento-filtro-inicio').value;
        this.filtroDataFim = document.getElementById('orcamento-filtro-fim').value;
        this.render();
    },

    limparFiltros: function() {
        this.filtroStatus = 'todos';
        this.filtroFornecedor = '';
        this.filtroDataInicio = '';
        this.filtroDataFim = '';
        document.getElementById('orcamento-filtro-status').value = 'todos';
        document.getElementById('orcamento-filtro-fornecedor').value = '';
        document.getElementById('orcamento-filtro-inicio').value = '';
        document.getElementById('orcamento-filtro-fim').value = '';
        this.render();
    },

    _filtrarPorStatus: function(status) {
        this.filtroStatus = status;
        document.getElementById('orcamento-filtro-status').value = status;
        this.render();
    },

    _filtrarPorFornecedor: function() {
        var fornecedor = prompt('Digite o nome do fornecedor para filtrar:');
        if (fornecedor && fornecedor.trim()) {
            this.filtroFornecedor = fornecedor.trim();
            document.getElementById('orcamento-filtro-fornecedor').value = fornecedor.trim();
            this.render();
            GR.Toast.info('🔍 Filtrando por: ' + fornecedor.trim());
        }
    },

    // ================================================================
    // ABRIR MODAL - COM ITENS COTADOS
    // ================================================================
    abrirModal: function(id) {
        var modalId = 'modal-orcamento';
        
        if (GR.UI && GR.UI._atualizarSelectsPropriedade) {
            GR.UI._atualizarSelectsPropriedade();
        }
        
        this.itensCotados = [];
        this.modoTexto = false;
        this.orcamentoEditandoId = null;
        
        if (id) {
            var items = GR.State.data.orcamentos || [];
            var orcamento = items.find(function(o) { return o.id === id; });
            if (!orcamento) {
                GR.Toast.error('Orçamento não encontrado!');
                return;
            }
            
            this.orcamentoEditandoId = id;
            
            if (orcamento.itens_cotados) {
                this.itensCotados = JSON.parse(JSON.stringify(orcamento.itens_cotados));
            } else if (orcamento.itens) {
                if (Array.isArray(orcamento.itens)) {
                    this.itensCotados = JSON.parse(JSON.stringify(orcamento.itens));
                } else if (typeof orcamento.itens === 'string') {
                    try {
                        var parsed = JSON.parse(orcamento.itens);
                        if (Array.isArray(parsed)) {
                            this.itensCotados = parsed;
                        }
                    } catch (e) {
                        this.itensCotados = this._textoParaItens(orcamento.itens);
                    }
                }
            }
            
            setTimeout(function() {
                document.getElementById('orc-numero').value = orcamento.numero || '';
                document.getElementById('orc-data').value = orcamento.dataRecebimento || orcamento.data || '';
                document.getElementById('orc-fornecedor').value = orcamento.fornecedor || orcamento.nome || '';
                document.getElementById('orc-cnpj').value = orcamento.cnpj || orcamento.cpfcnpj || '';
                document.getElementById('orc-contato').value = orcamento.contato || '';
                document.getElementById('orc-telefone').value = orcamento.telefone || '';
                document.getElementById('orc-email').value = orcamento.email || '';
                document.getElementById('orc-status').value = orcamento.status || 'Pendente';
                document.getElementById('orc-propriedade').value = orcamento.propriedade || '';
                document.getElementById('orc-prazo-entrega').value = orcamento.prazoEntrega || '';
                document.getElementById('orc-forma-pagamento').value = orcamento.formaPagamento || '';
                document.getElementById('orc-condicoes').value = orcamento.condicoes || '';
                document.getElementById('orc-observacoes').value = orcamento.observacoes || '';
                document.getElementById('orc-id-edit').value = id;
                
                GR.Modules.Orcamentos._renderizarItens();
                
                var title = document.querySelector('#modal-orcamento .modal-title');
                if (title) title.textContent = '✏️ Editar Cotação - ' + (orcamento.fornecedor || orcamento.nome);
            }.bind(this), 100);
        } else {
            setTimeout(function() {
                document.getElementById('orc-numero').value = 'COT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
                document.getElementById('orc-data').value = new Date().toISOString().split('T')[0];
                document.getElementById('orc-fornecedor').value = '';
                document.getElementById('orc-cnpj').value = '';
                document.getElementById('orc-contato').value = '';
                document.getElementById('orc-telefone').value = '';
                document.getElementById('orc-email').value = '';
                document.getElementById('orc-status').value = 'Pendente';
                document.getElementById('orc-propriedade').value = GR.State.ui.propriedadeAtiva || '';
                document.getElementById('orc-prazo-entrega').value = '';
                document.getElementById('orc-forma-pagamento').value = '';
                document.getElementById('orc-condicoes').value = '';
                document.getElementById('orc-observacoes').value = '';
                document.getElementById('orc-id-edit').value = '';
                
                GR.Modules.Orcamentos.itensCotados = [];
                GR.Modules.Orcamentos._renderizarItens();
                
                var title = document.querySelector('#modal-orcamento .modal-title');
                if (title) title.textContent = '📄 Nova Cotação de Fornecedor';
            }.bind(this), 100);
        }
        
        GR.Modal.open(modalId);
    },

    // ================================================================
    // RENDERIZAR ITENS COTADOS NO MODAL
    // ================================================================
    _renderizarItens: function() {
        var container = document.getElementById('orcamento-itens-container');
        if (!container) return;
        
        var totalGeral = 0;
        var totalItens = this.itensCotados.length;
        
        if (this.modoTexto) {
            var textarea = document.getElementById('orcamento-itens-textarea');
            if (textarea) {
                textarea.value = this._itensParaTexto(this.itensCotados);
                textarea.style.display = 'block';
            }
            var tabela = document.getElementById('orcamento-itens-tabela');
            if (tabela) tabela.style.display = 'none';
            
            container.innerHTML = `
                <div style="margin-bottom:8px;">
                    <p style="font-size:10px;color:var(--text-light);margin-bottom:4px;">
                        Digite um item por linha no formato: <strong>Produto - R$ 0,00 (Fornecedor)</strong>
                    </p>
                    <textarea id="orcamento-itens-textarea" rows="6" style="width:100%;padding:8px;border-radius:4px;border:1px solid var(--border);font-family:monospace;font-size:12px;background:var(--bg);" 
                              placeholder="Exemplo:
Cimento CP-40 50kg - R$ 25,90 (Construtora X)
Areia fina 100kg - R$ 12,50 (Areal Sul)
Caminhão de entrega - R$ 150,00 (Transportadora Y)">${this._itensParaTexto(this.itensCotados)}</textarea>
                    <div style="margin-top:6px;display:flex;gap:6px;">
                        <button class="btn btn-sm btn-primary" onclick="GR.Modules.Orcamentos._aplicarTexto()">🔄 Aplicar Texto</button>
                        <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Orcamentos._alternarModoEdicao()">📊 Voltar para Tabela</button>
                    </div>
                </div>
            `;
            return;
        }
        
        var html = `
            <div style="overflow-x:auto;margin-bottom:8px;">
                <table style="width:100%;font-size:12px;border-collapse:collapse;">
                    <thead style="background:var(--primary-dark);color:#fff;">
                        <tr>
                            <th style="padding:4px 6px;text-align:left;min-width:120px;">Produto/Serviço</th>
                            <th style="padding:4px 6px;text-align:center;width:60px;">Qtde</th>
                            <th style="padding:4px 6px;text-align:center;width:50px;">Un.</th>
                            <th style="padding:4px 6px;text-align:center;width:90px;">Preço Unit.</th>
                            <th style="padding:4px 6px;text-align:center;width:90px;">Total</th>
                            <th style="padding:4px 6px;text-align:left;min-width:100px;">Fornecedor</th>
                            <th style="padding:4px 6px;text-align:center;width:35px;">🗑️</th>
                        </tr>
                    </thead>
                    <tbody id="orcamento-itens-tbody">
        `;
        
        if (this.itensCotados.length === 0) {
            html += `
                <tr>
                    <td colspan="7" style="text-align:center;padding:20px;color:var(--text-light);">
                        Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                    </td>
                </tr>
            `;
        } else {
            this.itensCotados.forEach(function(item, index) {
                var totalItem = (item.quantidade || 0) * (item.preco_unitario || 0);
                totalGeral += totalItem;
                
                html += `
                    <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:3px 4px;">
                            <input type="text" value="${GR.Utils.escapeHtml(item.produto || '')}" 
                                   onchange="GR.Modules.Orcamentos._atualizarItem(${index}, 'produto', this.value)"
                                   style="width:100%;padding:3px 5px;border:1px solid var(--border);border-radius:3px;font-size:11px;background:var(--bg);">
                        </td>
                        <td style="padding:3px 4px;text-align:center;">
                            <input type="number" value="${item.quantidade || 1}" min="0.01" step="0.01"
                                   onchange="GR.Modules.Orcamentos._atualizarItem(${index}, 'quantidade', parseFloat(this.value) || 0)"
                                   style="width:50px;padding:3px 4px;border:1px solid var(--border);border-radius:3px;font-size:11px;text-align:center;background:var(--bg);">
                        </td>
                        <td style="padding:3px 4px;text-align:center;">
                            <input type="text" value="${GR.Utils.escapeHtml(item.unidade || 'un')}" 
                                   onchange="GR.Modules.Orcamentos._atualizarItem(${index}, 'unidade', this.value)"
                                   style="width:40px;padding:3px 4px;border:1px solid var(--border);border-radius:3px;font-size:11px;text-align:center;background:var(--bg);">
                        </td>
                        <td style="padding:3px 4px;text-align:center;">
                            <input type="number" value="${item.preco_unitario || 0}" min="0" step="0.01"
                                   onchange="GR.Modules.Orcamentos._atualizarItem(${index}, 'preco_unitario', parseFloat(this.value) || 0)"
                                   style="width:75px;padding:3px 4px;border:1px solid var(--border);border-radius:3px;font-size:11px;text-align:right;background:var(--bg);">
                        </td>
                        <td style="padding:3px 4px;text-align:center;font-weight:600;color:var(--primary);font-size:11px;">
                            ${GR.Utils.formatarMoedaBR(totalItem)}
                        </td>
                        <td style="padding:3px 4px;">
                            <input type="text" value="${GR.Utils.escapeHtml(item.fornecedor || '')}" 
                                   onchange="GR.Modules.Orcamentos._atualizarItem(${index}, 'fornecedor', this.value)"
                                   placeholder="Fornecedor"
                                   style="width:100%;padding:3px 5px;border:1px solid var(--border);border-radius:3px;font-size:11px;background:var(--bg);">
                        </td>
                        <td style="padding:3px 4px;text-align:center;">
                            <button onclick="GR.Modules.Orcamentos._removerItem(${index})" 
                                    style="background:none;border:none;color:#f44336;cursor:pointer;font-size:14px;"
                                    title="Remover item">✕</button>
                        </td>
                    </tr>
                `;
            });
        }
        
        html += `
                    </tbody>
                    <tfoot ${this.itensCotados.length === 0 ? 'style="display:none;"' : ''} style="background:var(--bg);font-weight:600;">
                        <tr>
                            <td colspan="4" style="text-align:right;padding:6px 12px;font-size:12px;">TOTAL GERAL:</td>
                            <td style="text-align:center;padding:6px 8px;color:var(--primary);font-size:15px;" id="orcamento-total-geral">
                                ${GR.Utils.formatarMoedaBR(totalGeral)}
                            </td>
                            <td colspan="2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        html += `
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                <button class="btn btn-sm btn-success" onclick="GR.Modules.Orcamentos._adicionarItem()" style="font-size:10px;padding:2px 10px;">
                    ➕ Adicionar Item
                </button>
                <button class="btn btn-sm btn-info" onclick="GR.Modules.Orcamentos._alternarModoEdicao()" style="font-size:10px;padding:2px 10px;" id="btn-modo-edicao">
                    📝 Editar em Texto
                </button>
                <span style="font-size:11px;color:var(--text-light);margin-left:8px;">
                    📊 Total: <strong>${totalItens}</strong> item${totalItens !== 1 ? 's' : ''}
                </span>
            </div>
        `;
        
        container.innerHTML = html;
        
        var valorTotalInput = document.getElementById('orc-valor-total');
        if (valorTotalInput) {
            valorTotalInput.value = GR.Utils.formatarMoedaBR(totalGeral);
        }
    },

    // ================================================================
    // MANIPULAÇÃO DE ITENS
    // ================================================================
    _adicionarItem: function(item) {
        if (item) {
            this.itensCotados.push({
                id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                produto: item.produto || '',
                quantidade: item.quantidade || 1,
                unidade: item.unidade || 'un',
                preco_unitario: item.preco_unitario || 0,
                fornecedor: item.fornecedor || '',
                observacao: item.observacao || ''
            });
        } else {
            this.itensCotados.push({
                id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                produto: '',
                quantidade: 1,
                unidade: 'un',
                preco_unitario: 0,
                fornecedor: '',
                observacao: ''
            });
        }
        this._renderizarItens();
    },

    _atualizarItem: function(index, campo, valor) {
        if (this.itensCotados[index]) {
            this.itensCotados[index][campo] = valor;
            this._renderizarItens();
        }
    },

    _removerItem: function(index) {
        if (this.itensCotados.length === 1) {
            if (!confirm('Remover o último item?')) return;
        }
        this.itensCotados.splice(index, 1);
        this._renderizarItens();
    },

    // ================================================================
    // MODO TEXTO
    // ================================================================
    _alternarModoEdicao: function() {
        this.modoTexto = !this.modoTexto;
        this._renderizarItens();
    },

    _itensParaTexto: function(itens) {
        if (!itens || itens.length === 0) return '';
        return itens.map(function(item) {
            var partes = [];
            if (item.produto) partes.push(item.produto);
            if (item.quantidade > 1 || item.unidade) {
                partes.push(item.quantidade + (item.unidade ? ' ' + item.unidade : ''));
            }
            var linha = partes.join(' ');
            if (item.preco_unitario > 0) {
                linha += ' - R$ ' + item.preco_unitario.toFixed(2);
            }
            if (item.fornecedor) {
                linha += ' (' + item.fornecedor + ')';
            }
            return linha;
        }).join('\n');
    },

    _textoParaItens: function(texto) {
        if (!texto) return [];
        var linhas = texto.split('\n').filter(function(l) { return l.trim(); });
        
        return linhas.map(function(linha) {
            var item = {
                id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                produto: '',
                quantidade: 1,
                unidade: 'un',
                preco_unitario: 0,
                fornecedor: '',
                observacao: ''
            };
            
            var fornecedorMatch = linha.match(/\(([^)]+)\)/);
            if (fornecedorMatch) {
                item.fornecedor = fornecedorMatch[1].trim();
                linha = linha.replace(/\([^)]+\)/, '').trim();
            }
            
            var precoMatch = linha.match(/[-–]\s*R?\$?\s*([\d,.]+)/);
            if (precoMatch) {
                var precoStr = precoMatch[1].replace(/\./g, '').replace(',', '.');
                item.preco_unitario = parseFloat(precoStr) || 0;
                linha = linha.replace(precoMatch[0], '').trim();
            }
            
            var qtdeMatch = linha.match(/^([\d,.]+)\s*([a-zA-Z]+)/);
            if (qtdeMatch) {
                item.quantidade = parseFloat(qtdeMatch[1].replace(',', '.')) || 1;
                item.unidade = qtdeMatch[2] || 'un';
                linha = linha.replace(qtdeMatch[0], '').trim();
            } else {
                var qtdeMatch2 = linha.match(/(\d+)\s*([a-zA-Z]+)/);
                if (qtdeMatch2) {
                    item.quantidade = parseInt(qtdeMatch2[1]) || 1;
                    item.unidade = qtdeMatch2[2] || 'un';
                    linha = linha.replace(qtdeMatch2[0], '').trim();
                }
            }
            
            item.produto = linha.trim() || 'Item sem descrição';
            return item;
        });
    },

    _aplicarTexto: function() {
        var textarea = document.getElementById('orcamento-itens-textarea');
        if (!textarea) return;
        
        var linhas = textarea.value.split('\n').filter(function(l) { return l.trim(); });
        
        if (linhas.length === 0) {
            GR.Toast.warning('⚠️ Nenhum item encontrado no texto!');
            return;
        }
        
        var novosItens = this._textoParaItens(textarea.value);
        
        if (novosItens.length > 0) {
            this.itensCotados = novosItens;
            this.modoTexto = false;
            this._renderizarItens();
            GR.Toast.success('✅ ' + novosItens.length + ' itens importados do texto!');
        } else {
            GR.Toast.error('❌ Nenhum item válido encontrado!');
        }
    },

    // ================================================================
    // SALVAR ORÇAMENTO - COM ITENS COTADOS
    // ================================================================
    salvar: function() {
        var numero = document.getElementById('orc-numero').value.trim();
        var data = document.getElementById('orc-data').value;
        var fornecedor = document.getElementById('orc-fornecedor').value.trim();
        var cnpj = document.getElementById('orc-cnpj').value.trim();
        var contato = document.getElementById('orc-contato').value.trim();
        var telefone = document.getElementById('orc-telefone').value.trim();
        var email = document.getElementById('orc-email').value.trim();
        var status = document.getElementById('orc-status').value;
        var propriedade = document.getElementById('orc-propriedade').value;
        var prazoEntrega = document.getElementById('orc-prazo-entrega').value;
        var formaPagamento = document.getElementById('orc-forma-pagamento').value;
        var condicoes = document.getElementById('orc-condicoes').value.trim();
        var observacoes = document.getElementById('orc-observacoes').value.trim();
        var editId = document.getElementById('orc-id-edit').value;

        if (!numero || !data || !fornecedor) {
            GR.Toast.error('❌ Preencha: Nº Cotação, Data e Fornecedor!');
            return;
        }

        if (this.itensCotados.length === 0) {
            GR.Toast.warning('⚠️ Adicione pelo menos um item ao orçamento!');
            return;
        }

        var valorTotal = this.itensCotados.reduce(function(sum, item) {
            return sum + ((item.quantidade || 0) * (item.preco_unitario || 0));
        }, 0);

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
            itens_cotados: this.itensCotados,
            itens: this.itensCotados,
            observacoes: GR.Utils.escapeHtml(observacoes),
            dataAtualizacao: GR.Utils.now(),
            tipo: 'compra'
        };

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var collection = db.collection('users').doc(uid).collection('orcamentos');

        if (editId) {
            collection.doc(editId).update(dados)
                .then(function() {
                    GR.Modal.close('modal-orcamento');
                    GR.Toast.success('✅ Cotação atualizada!');
                    GR.State.adicionarHistorico('atualizou cotação', 'Orçamentos', 'Fornecedor: ' + fornecedor);
                    GR.State.atualizarNoCache('orcamentos', editId, dados);
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao atualizar: ' + err.message);
                });
        } else {
            dados.dataCriacao = GR.Utils.now();
            collection.add(dados)
                .then(function(docRef) {
                    GR.Modal.close('modal-orcamento');
                    GR.Toast.success('✅ Cotação salva!');
                    dados.id = docRef.id;
                    GR.State.inserirNoCache('orcamentos', dados);
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
    // EXCLUIR - COM VERIFICAÇÃO DE PERMISSÃO SEGURA
    // ================================================================
    excluir: function(id) {
        // 🔥 CORREÇÃO: Usa função segura
        if (!this._podeExcluir()) {
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
                GR.State.removerDoCache('orcamentos', id);
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

            var itensArray = orcamento.itens_cotados || orcamento.itens || [];
            if (typeof itensArray === 'string') {
                try {
                    var parsed = JSON.parse(itensArray);
                    itensArray = Array.isArray(parsed) ? parsed : [{ descricao: itensArray }];
                } catch (e) {
                    itensArray = [{ descricao: itensArray }];
                }
            }

            if (itensArray.length > 0) {
                var tableData = itensArray.map(function(item) {
                    var desc = item.produto || item.descricao || item.nome || 'Item';
                    var qtd = item.quantidade || item.qtd || 1;
                    var un = item.unidade || 'UN';
                    var valorUnit = item.preco_unitario || item.valorUnitario || item.valor || 0;
                    return [desc, qtd, un, 'R$ ' + valorUnit.toFixed(2), 'R$ ' + (qtd * valorUnit).toFixed(2)];
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

console.log('✅ Módulo Orçamentos de Fornecedores carregado com Itens Cotados!');
console.log('📌 Funcionalidades:');
console.log('   - 📋 Listagem com filtros por status, fornecedor e data');
console.log('   - 📦 Itens Cotados em JSON (estruturado)');
console.log('   - 📝 Modo texto para importação rápida');
console.log('   - 📊 Cálculo automático de totais');
console.log('   - 📄 Geração de PDF');
console.log('   - ✅ Aprovação e ❌ Recusa de cotações');