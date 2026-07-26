// ================================================================
// MÓDULO: INSUMOS - COM DESIGN IGUAL AOS RELATÓRIOS
// ================================================================

GR.Modules.Insumos = {
    // ================================================================
    // RENDER PRINCIPAL - COM FILTRO DE PROPRIEDADE
    // ================================================================
    render: function() {
        var div = document.getElementById('lista-insumos');
        if (!div) return;
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        
        // 🔥 APLICA O FILTRO DA ABA ATIVA (SE NÃO FOR "TODAS")
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }

        // ============================================================
        // 🆕 CALCULA ESTATÍSTICAS
        // ============================================================
        var total = items.length;
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        var vencidos = items.filter(function(i) { 
            return i.validade && new Date(i.validade) < hoje; 
        });
        
        var vencendo7dias = items.filter(function(i) {
            if (!i.validade) return false;
            var diff = GR.Utils.calcularDiasParaVencimento(i.validade);
            return diff !== null && diff >= 0 && diff <= 7;
        });
        
        // 🆕 ESTOQUE BAIXO - USA O CAMPO 'estoqueMinimo' DE CADA INSUMO
        var estoqueBaixo = items.filter(function(i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            var min = typeof i.estoqueMinimo === 'number' ? i.estoqueMinimo : parseFloat(i.estoqueMinimo) || 5;
            return qtd <= min && qtd > 0;
        });
        
        // 🆕 ESGOTADOS (quantidade = 0)
        var esgotados = items.filter(function(i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            return qtd === 0;
        });
        
        var valorTotal = items.reduce(function(acc, i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            var preco = typeof i.preco === 'number' ? i.preco : parseFloat(i.preco) || 0;
            return acc + (qtd * preco);
        }, 0);

        // ============================================================
        // 🆕 CARDS DE ESTATÍSTICAS (IGUAL RELATÓRIOS)
        // ============================================================
        var html = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:16px;">
                <div class="card" style="padding:16px;text-align:center;cursor:default;border-top:4px solid var(--primary);">
                    <div style="font-size:28px;font-weight:700;color:var(--primary-dark);">${total}</div>
                    <div style="font-size:12px;color:var(--text-light);">🧪 Total de Insumos</div>
                </div>
                <div class="card" style="padding:16px;text-align:center;cursor:default;border-top:4px solid var(--danger);">
                    <div style="font-size:28px;font-weight:700;color:var(--danger);">${vencidos.length}</div>
                    <div style="font-size:12px;color:var(--text-light);">⚠️ Vencidos</div>
                </div>
                <div class="card" style="padding:16px;text-align:center;cursor:default;border-top:4px solid var(--warning);">
                    <div style="font-size:28px;font-weight:700;color:var(--warning);">${vencendo7dias.length}</div>
                    <div style="font-size:12px;color:var(--text-light);">📅 Vencem em 7 dias</div>
                </div>
                <div class="card" style="padding:16px;text-align:center;cursor:default;border-top:4px solid var(--info);">
                    <div style="font-size:28px;font-weight:700;color:var(--info);">${estoqueBaixo.length}</div>
                    <div style="font-size:12px;color:var(--text-light);">📦 Estoque Baixo</div>
                </div>
                <div class="card" style="padding:16px;text-align:center;cursor:default;border-top:4px solid var(--success);">
                    <div style="font-size:20px;font-weight:700;color:var(--success);">${GR.Utils.formatarMoedaBR(valorTotal)}</div>
                    <div style="font-size:12px;color:var(--text-light);">💰 Valor em Estoque</div>
                </div>
            </div>
        `;

        // ============================================================
        // 🆕 FILTROS RÁPIDOS
        // ============================================================
        html += `
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Insumos._filtrarTodos()" style="font-size:11px;">📋 Todos</button>
                <button class="btn btn-sm btn-danger" onclick="GR.Modules.Insumos._filtrarVencidos()" style="font-size:11px;">⚠️ Vencidos</button>
                <button class="btn btn-sm btn-warning" onclick="GR.Modules.Insumos._filtrarVencendo()" style="font-size:11px;">📅 Vencem em 7 dias</button>
                <button class="btn btn-sm btn-info" onclick="GR.Modules.Insumos._filtrarEstoqueBaixo()" style="font-size:11px;">📦 Estoque Baixo</button>
                <button class="btn btn-sm btn-success" onclick="GR.Modules.Insumos._filtrarComEstoque()" style="font-size:11px;">✅ Com Estoque</button>
            </div>
        `;

        // ============================================================
        // 🆕 CONTEÚDO PRINCIPAL (CARD COM TABELA)
        // ============================================================
        html += `
            <div class="card" style="padding:16px;">
                <div class="card-header" style="margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                    <div class="card-title" style="font-size:16px;font-weight:700;color:var(--primary-dark);">
                        <span class="emoji">🧪</span> Insumos
                        <span style="font-size:12px;font-weight:400;color:var(--text-light);">(${total} insumos)</span>
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn btn-primary" onclick="GR.Modules.Insumos.abrirModal()" title="Adicionar novo insumo">
                            ➕ Novo Insumo
                        </button>
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Insumos.exportarLista()" title="Exportar lista de insumos">
                            📤 Exportar
                        </button>
                    </div>
                </div>
        `;

        // ============================================================
        // 🆕 TABELA OU EMPTY STATE
        // ============================================================
        if (!items.length) {
            html += `
                <div class="empty-state" style="padding:40px 20px;text-align:center;color:var(--text-light);">
                    <span class="icon" style="font-size:48px;display:block;margin-bottom:12px;">🧪</span>
                    <div class="message" style="font-size:16px;font-weight:500;">Nenhum insumo cadastrado</div>
                    <div style="font-size:12px;color:var(--text-light);margin-top:8px;">
                        Clique em "➕ Novo Insumo" para adicionar
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Quantidade</th>
                                <th>Preço Unit.</th>
                                <th>Valor Total</th>
                                <th>Validade</th>
                                <th>Fornecedor</th>
                                <th>Propriedade</th>
                                <th style="text-align:center;">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            items.forEach(function(item) {
                var qtd = typeof item.quantidade === 'number' ? item.quantidade : parseFloat(item.quantidade) || 0;
                var preco = typeof item.preco === 'number' ? item.preco : parseFloat(item.preco) || 0;
                var valorTotalItem = qtd * preco;
                var min = typeof item.estoqueMinimo === 'number' ? item.estoqueMinimo : parseFloat(item.estoqueMinimo) || 5;
                
                // Badge de validade
                var validadeBadge = '';
                var diff = item.validade ? GR.Utils.calcularDiasParaVencimento(item.validade) : null;
                var statusCor = '';
                
                if (diff !== null && diff < 0) {
                    validadeBadge = '<span class="badge badge-danger" style="font-size:9px;">🔴 Vencido</span>';
                    statusCor = 'style="background:#ffcdd2;"';
                } else if (diff !== null && diff <= 3) {
                    validadeBadge = '<span class="badge badge-danger" style="font-size:9px;">⚠️ Vence em ' + diff + 'd</span>';
                    statusCor = 'style="background:#ffebee;"';
                } else if (diff !== null && diff <= 7) {
                    validadeBadge = '<span class="badge badge-warning" style="font-size:9px;">📅 ' + diff + ' dias</span>';
                    statusCor = 'style="background:#fff3e0;"';
                } else if (diff !== null) {
                    validadeBadge = '<span class="badge badge-success" style="font-size:9px;">✅ OK</span>';
                } else {
                    validadeBadge = '<span style="font-size:9px;color:var(--text-light);">—</span>';
                }
                
                // 🆕 Badge de estoque - usando o estoqueMinimo personalizado
                var estoqueBadge = '';
                if (qtd <= 0) {
                    estoqueBadge = '<span class="badge badge-danger" style="font-size:9px;">🔴 Esgotado</span>';
                } else if (qtd <= min) {
                    estoqueBadge = '<span class="badge badge-warning" style="font-size:9px;">⚠️ Baixo (min: ' + min + ')</span>';
                } else {
                    estoqueBadge = '<span class="badge badge-success" style="font-size:9px;">✅ OK</span>';
                }

                var validadeDisplay = item.validade ? GR.Utils.formatarDataBR(item.validade) : '-';

                html += `
                    <tr ${statusCor}>
                        <td><strong>${GR.Utils.escapeHtml(item.nome)}</strong></td>
                        <td><span class="badge badge-info" style="font-size:9px;">${GR.Utils.escapeHtml(item.categoria)}</span></td>
                        <td>${qtd} ${item.unidade || ''} ${estoqueBadge}</td>
                        <td>${GR.Utils.formatarMoedaBR(preco)}</td>
                        <td><strong>${GR.Utils.formatarMoedaBR(valorTotalItem)}</strong></td>
                        <td>${validadeDisplay} ${validadeBadge}</td>
                        <td>${GR.Utils.escapeHtml(item.fornecedor || '-')}</td>
                        <td>${GR.Utils.escapeHtml(item.propriedade || '-')}</td>
                        <td style="text-align:center;white-space:nowrap;">
                            <button class="btn btn-primary btn-sm" onclick="GR.Modules.Insumos.editar('${item.id}')" title="Editar insumo" style="font-size:9px;padding:2px 6px;">✏️</button>
                            <button class="btn btn-warning btn-sm" onclick="GR.Modules.Insumos.ajustarEstoque('${item.id}')" title="Ajustar estoque" style="font-size:9px;padding:2px 6px;">📦</button>
                            <button class="btn btn-danger btn-sm" onclick="GR.Modules.Insumos.excluir('${item.id}')" title="Excluir insumo" style="font-size:9px;padding:2px 6px;">🗑️</button>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            // ============================================================
            // 🆕 RESUMO POR CATEGORIA
            // ============================================================
            var categorias = {};
            items.forEach(function(i) {
                var cat = i.categoria || 'Outros';
                categorias[cat] = (categorias[cat] || 0) + 1;
            });
            
            html += `
                <div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                    <span style="font-size:11px;color:var(--text-light);font-weight:600;">📊 Resumo por categoria:</span>
            `;

            var categoriasOrdenadas = Object.keys(categorias).sort();
            categoriasOrdenadas.forEach(function(cat) {
                html += `
                    <span style="font-size:10px;background:var(--primary);color:#fff;padding:2px 12px;border-radius:12px;display:inline-flex;align-items:center;gap:4px;">
                        📂 ${cat}: <strong>${categorias[cat]}</strong>
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
        
        // Atualiza contadores nos elementos existentes
        var totalInsumos = document.getElementById('total-insumos');
        if (totalInsumos) totalInsumos.textContent = items.length;
        
        var valorEstoque = document.getElementById('valor-estoque');
        if (valorEstoque) valorEstoque.textContent = GR.Utils.formatarMoedaBR(valorTotal);
        
        var insumosVencidos = document.getElementById('insumos-vencidos');
        if (insumosVencidos) insumosVencidos.textContent = vencidos.length;
        
        console.log('📊 Insumos filtrados:', items.length, 'de', (GR.State.data.insumos || []).length);
    },

    // ================================================================
    // 🆕 FILTROS RÁPIDOS
    // ================================================================
    _filtrarTodos: function() {
        this.render();
    },

    _filtrarVencidos: function() {
        var div = document.getElementById('lista-insumos');
        if (!div) return;
        
        var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        items = items.filter(function(i) {
            return i.validade && new Date(i.validade) < hoje;
        });
        
        this._renderListaFiltrada(div, items, 'Vencidos');
    },

    _filtrarVencendo: function() {
        var div = document.getElementById('lista-insumos');
        if (!div) return;
        
        var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        
        items = items.filter(function(i) {
            if (!i.validade) return false;
            var diff = GR.Utils.calcularDiasParaVencimento(i.validade);
            return diff !== null && diff >= 0 && diff <= 7;
        });
        
        this._renderListaFiltrada(div, items, 'Vencem em 7 dias');
    },

    // 🆕 FILTRO ESTOQUE BAIXO - USANDO ESTOQUE MÍNIMO PERSONALIZADO
    _filtrarEstoqueBaixo: function() {
        var div = document.getElementById('lista-insumos');
        if (!div) return;
        
        var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        
        items = items.filter(function(i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            var min = typeof i.estoqueMinimo === 'number' ? i.estoqueMinimo : parseFloat(i.estoqueMinimo) || 5;
            return qtd <= min && qtd > 0;
        });
        
        this._renderListaFiltrada(div, items, 'Estoque Baixo');
    },

    _filtrarComEstoque: function() {
        var div = document.getElementById('lista-insumos');
        if (!div) return;
        
        var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        
        items = items.filter(function(i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            return qtd > 0;
        });
        
        this._renderListaFiltrada(div, items, 'Com Estoque');
    },

    _renderListaFiltrada: function(div, filtrados, titulo) {
        if (!filtrados.length) {
            div.innerHTML = `
                <div class="empty-state" style="padding:40px 20px;text-align:center;color:var(--text-light);">
                    <span class="icon" style="font-size:48px;display:block;margin-bottom:12px;">🔍</span>
                    <div class="message" style="font-size:16px;font-weight:500;">Nenhum insumo encontrado para o filtro: ${titulo}</div>
                    <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Insumos.render()" style="margin-top:12px;">
                        🔄 Limpar filtros
                    </button>
                </div>
            `;
            return;
        }
        
        this._renderDadosFiltrados(div, filtrados, titulo);
    },

    _renderDadosFiltrados: function(div, items, titulo) {
        var total = items.length;
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        var vencidos = items.filter(function(i) { 
            return i.validade && new Date(i.validade) < hoje; 
        });
        
        var valorTotal = items.reduce(function(acc, i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            var preco = typeof i.preco === 'number' ? i.preco : parseFloat(i.preco) || 0;
            return acc + (qtd * preco);
        }, 0);

        var html = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:12px;">
                <div class="card" style="padding:10px;text-align:center;border-top:3px solid var(--primary);">
                    <div style="font-size:20px;font-weight:700;color:var(--primary-dark);">${total}</div>
                    <div style="font-size:10px;color:var(--text-light);">📦 Total</div>
                </div>
                <div class="card" style="padding:10px;text-align:center;border-top:3px solid var(--danger);">
                    <div style="font-size:20px;font-weight:700;color:var(--danger);">${vencidos.length}</div>
                    <div style="font-size:10px;color:var(--text-light);">⚠️ Vencidos</div>
                </div>
                <div class="card" style="padding:10px;text-align:center;border-top:3px solid var(--success);">
                    <div style="font-size:16px;font-weight:700;color:var(--success);">${GR.Utils.formatarMoedaBR(valorTotal)}</div>
                    <div style="font-size:10px;color:var(--text-light);">💰 Valor</div>
                </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Insumos.render()" style="font-size:10px;">🔙 Limpar</button>
                <span style="font-size:11px;color:var(--text-light);padding:4px 8px;">
                    Filtro: <strong>${titulo}</strong>
                </span>
            </div>
            <div class="card" style="padding:12px;">
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Quantidade</th>
                                <th>Valor</th>
                                <th>Validade</th>
                                <th>Fornecedor</th>
                                <th style="text-align:center;">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        items.forEach(function(item) {
            var qtd = typeof item.quantidade === 'number' ? item.quantidade : parseFloat(item.quantidade) || 0;
            var preco = typeof item.preco === 'number' ? item.preco : parseFloat(item.preco) || 0;
            var valorTotalItem = qtd * preco;
            var min = typeof item.estoqueMinimo === 'number' ? item.estoqueMinimo : parseFloat(item.estoqueMinimo) || 5;
            
            var diff = item.validade ? GR.Utils.calcularDiasParaVencimento(item.validade) : null;
            var statusCor = '';
            var validadeBadge = '';
            
            if (diff !== null && diff < 0) {
                validadeBadge = '🔴 Vencido';
                statusCor = 'style="background:#ffcdd2;"';
            } else if (diff !== null && diff <= 3) {
                validadeBadge = '⚠️ ' + diff + ' dias';
                statusCor = 'style="background:#ffebee;"';
            } else if (diff !== null && diff <= 7) {
                validadeBadge = '📅 ' + diff + ' dias';
                statusCor = 'style="background:#fff3e0;"';
            } else if (diff !== null) {
                validadeBadge = '✅ OK';
            } else {
                validadeBadge = '—';
            }
            
            // 🆕 Badge de estoque usando estoqueMinimo
            var estoqueBadge = '';
            var estoqueCor = '';
            if (qtd <= 0) {
                estoqueBadge = '🔴 Esgotado';
                estoqueCor = 'var(--danger)';
            } else if (qtd <= min) {
                estoqueBadge = '⚠️ Baixo (min: ' + min + ')';
                estoqueCor = 'var(--warning)';
            } else {
                estoqueBadge = '✅ OK';
                estoqueCor = 'var(--success)';
            }

            html += `
                <tr ${statusCor}>
                    <td><strong>${GR.Utils.escapeHtml(item.nome)}</strong></td>
                    <td><span class="badge badge-info" style="font-size:9px;">${GR.Utils.escapeHtml(item.categoria)}</span></td>
                    <td>${qtd} ${item.unidade || ''} <span style="font-size:9px;color:${estoqueCor};">${estoqueBadge}</span></td>
                    <td>${GR.Utils.formatarMoedaBR(valorTotalItem)}</td>
                    <td>${item.validade ? GR.Utils.formatarDataBR(item.validade) : '-'} <span style="font-size:9px;">${validadeBadge}</span></td>
                    <td>${GR.Utils.escapeHtml(item.fornecedor || '-')}</td>
                    <td style="text-align:center;white-space:nowrap;">
                        <button class="btn btn-primary btn-sm" onclick="GR.Modules.Insumos.editar('${item.id}')" title="Editar" style="font-size:9px;padding:2px 6px;">✏️</button>
                        <button class="btn btn-warning btn-sm" onclick="GR.Modules.Insumos.ajustarEstoque('${item.id}')" title="Ajustar" style="font-size:9px;padding:2px 6px;">📦</button>
                        <button class="btn btn-danger btn-sm" onclick="GR.Modules.Insumos.excluir('${item.id}')" title="Excluir" style="font-size:9px;padding:2px 6px;">🗑️</button>
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
        GR.State.ui.insumoEditando = editId || null;
        document.getElementById('modal-insumo-title').textContent = editId ? '✏️ Editar Insumo' : '🧪 Novo Insumo';
        document.getElementById('insumo-nome').value = '';
        document.getElementById('insumo-categoria').value = 'Adubo';
        document.getElementById('insumo-quantidade').value = 0;
        document.getElementById('insumo-unidade').value = 'kg';
        document.getElementById('insumo-preco').value = '0,00';
        document.getElementById('insumo-fornecedor-id').value = '';
        document.getElementById('insumo-validade').value = '';
        document.getElementById('insumo-estoque-minimo').value = 5; // 🆕 Valor padrão
        document.getElementById('insumo-obs').value = '';
        GR.UI._atualizarSelectsPropriedade();

        if (editId) {
            var item = GR.State.data.insumos.find(function(i) { return i.id === editId; });
            if (item) {
                document.getElementById('insumo-nome').value = item.nome || '';
                document.getElementById('insumo-categoria').value = item.categoria || 'Adubo';
                document.getElementById('insumo-quantidade').value = item.quantidade || 0;
                document.getElementById('insumo-unidade').value = item.unidade || 'kg';
                document.getElementById('insumo-preco').value = GR.Utils.formatarMoedaSemSimbolo(item.preco || 0);
                document.getElementById('insumo-fornecedor-id').value = item.fornecedorId || '';
                document.getElementById('insumo-validade').value = item.validade || '';
                document.getElementById('insumo-estoque-minimo').value = item.estoqueMinimo || 5; // 🆕
                document.getElementById('insumo-propriedade').value = item.propriedade || '';
                document.getElementById('insumo-obs').value = item.obs || '';
            }
        }
        GR.Modal.open('modal-insumo');
    },

    // ================================================================
    // 🆕 QUANDO SELECIONAR "CADASTRAR NOVO FORNECEDOR"
    // ================================================================
    _onFornecedorSelecionado: function() {
        var select = document.getElementById('insumo-fornecedor-id');
        if (!select) return;
        
        var valor = select.value;
        
        // Se escolheu "Cadastrar Novo"
        if (valor === 'novo') {
            // Abre o modal de fornecedor
            if (GR.Modules.Fornecedores && typeof GR.Modules.Fornecedores.abrirModal === 'function') {
                GR.Modules.Fornecedores.abrirModal(null, function(fornecedorId) {
                    // Callback após salvar o fornecedor
                    if (fornecedorId) {
                        // Aguarda o fornecedor ser salvo e recarrega os selects
                        setTimeout(function() {
                            if (typeof window.popularSelectsFornecedores === 'function') {
                                window.popularSelectsFornecedores();
                            }
                            // Seleciona o fornecedor recém-criado
                            var selectAtualizado = document.getElementById('insumo-fornecedor-id');
                            if (selectAtualizado) {
                                selectAtualizado.value = fornecedorId;
                            }
                        }, 500);
                    }
                });
            } else {
                // Fallback: abre o modal de fornecedor manualmente
                var modalFornecedor = document.getElementById('modal-fornecedor');
                if (modalFornecedor) {
                    // Limpa o formulário de fornecedor
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
                    document.getElementById('forn-cep').value = '';
                    document.getElementById('forn-endereco').value = '';
                    document.getElementById('forn-cidade').value = '';
                    document.getElementById('forn-estado').value = '';
                    document.getElementById('forn-observacoes').value = '';
                    document.getElementById('forn-ativo').checked = true;
                    
                    // Abre o modal
                    GR.Modal.open('modal-fornecedor');
                    
                    // Volta o select para a opção vazia
                    select.value = '';
                } else {
                    GR.Toast.warning('⚠️ Módulo de fornecedores não disponível');
                    select.value = '';
                }
            }
        }
    },

    // ================================================================
    // SALVAR INSUMO
    // ================================================================
    salvar: function() {
        var nome = document.getElementById('insumo-nome').value.trim();
        var categoria = document.getElementById('insumo-categoria').value;
        var quantidade = parseFloat(document.getElementById('insumo-quantidade').value) || 0;
        var unidade = document.getElementById('insumo-unidade').value;
        var preco = GR.Utils.parseMoedaBR(document.getElementById('insumo-preco').value);
        var fornecedorId = document.getElementById('insumo-fornecedor-id').value;
        var validade = document.getElementById('insumo-validade').value;
        var estoqueMinimo = parseFloat(document.getElementById('insumo-estoque-minimo').value) || 5; // 🆕
        var propriedade = document.getElementById('insumo-propriedade').value;
        var obs = document.getElementById('insumo-obs').value.trim();

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
        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            categoria: categoria,
            quantidade: quantidade,
            unidade: unidade,
            preco: preco || 0,
            fornecedorId: fornecedorId || '',
            validade: validade,
            estoqueMinimo: estoqueMinimo, // 🆕
            propriedade: GR.Utils.escapeHtml(propriedade),
            obs: GR.Utils.escapeHtml(obs),
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('insumos');
        var editId = GR.State.ui.insumoEditando;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.State.atualizarNoCache('insumos', editId, dados);
                GR.Modal.close('modal-insumo');
                GR.Toast.success('Insumo atualizado!');
                GR.State.adicionarHistorico('editou insumo', 'Insumos', 'Insumo: ' + nome);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function(docRef) {
                dados.id = docRef.id;
                GR.State.inserirNoCache('insumos', dados);
                GR.Modal.close('modal-insumo');
                GR.Toast.success('Insumo salvo!');
                GR.State.adicionarHistorico('criou insumo', 'Insumos', 'Insumo: ' + nome);
                GR.UI.refreshCurrentView();
                GR.State.verificarVencimentos();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    editar: function(id) { this.abrirModal(id); },

    excluir: function(id) {
        if (!confirm('Excluir este insumo?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        db.collection('users').doc(uid).collection('insumos').doc(id).delete()
            .then(function() {
                GR.State.removerDoCache('insumos', id);
                GR.Toast.success('Insumo excluído!');
                GR.State.adicionarHistorico('excluiu insumo', 'Insumos', 'Insumo ID: ' + id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // AJUSTAR ESTOQUE
    // ================================================================
    ajustarEstoque: function(id) {
        var item = GR.State.data.insumos.find(function(i) { return i.id === id; });
        if (!item) {
            GR.Toast.error('Insumo não encontrado!');
            return;
        }

        var modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:350px;">
                <div class="modal-header">
                    <h2 class="modal-title">📦 Ajustar Estoque</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <p style="margin-bottom:6px;">Ajuste o estoque de <strong>${GR.Utils.escapeHtml(item.nome)}</strong></p>
                <p><strong>Estoque atual:</strong> ${item.quantidade || 0} ${item.unidade || ''}</p>
                <p><strong>Estoque mínimo:</strong> ${item.estoqueMinimo || 5} ${item.unidade || ''}</p>
                <p><strong>Valor unitário:</strong> ${GR.Utils.formatarMoedaBR(item.preco || 0)}</p>
                <div class="form-group">
                    <label>Quantidade (positivo=entrada, negativo=saída)</label>
                    <input type="number" id="ajuste-quantidade" class="form-control" step="0.01" value="0">
                </div>
                <div style="display:flex;gap:3px;justify-content:flex-end;margin-top:8px;">
                    <button class="btn btn-success" onclick="GR.Modules.Insumos._confirmarAjuste('${id}')">✅ Aplicar</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(function() { document.getElementById('ajuste-quantidade').focus(); }, 100);
    },

    _confirmarAjuste: function(id) {
        var item = GR.State.data.insumos.find(function(i) { return i.id === id; });
        if (!item) return;
        var input = document.getElementById('ajuste-quantidade');
        var valor = parseFloat(input.value);
        if (isNaN(valor) || valor === 0) {
            GR.Toast.warning('Valor inválido!');
            return;
        }
        var novaQtde = (item.quantidade || 0) + valor;
        if (novaQtde < 0) {
            GR.Toast.error('Quantidade não pode ficar negativa!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        
        var historicoAjuste = {
            data: new Date().toISOString(),
            tipo: valor > 0 ? 'Entrada' : 'Saída',
            quantidade: Math.abs(valor),
            unidade: item.unidade || 'un',
            usuario: user.email || user.uid,
            insumo: item.nome,
            estoqueAnterior: item.quantidade || 0,
            estoqueNovo: novaQtde,
            estoqueMinimo: item.estoqueMinimo || 5
        };
        
        db.collection('users').doc(uid).collection('insumos').doc(id).update({ quantidade: novaQtde })
            .then(function() {
                return db.collection('users').doc(uid).collection('insumosHistorico').add(historicoAjuste);
            })
            .then(function() {
                GR.Toast.success('Estoque ajustado: ' + (valor > 0 ? '+' : '') + valor + ' ' + (item.unidade || ''));
                var modal = document.querySelector('.modal.active');
                if (modal) modal.remove();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao ajustar estoque: ' + err.message);
            });
    },

    // ================================================================
    // FUNÇÕES ADICIONAIS
    // ================================================================
    getEstoqueBaixo: function() {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        return items.filter(function(i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            var min = typeof i.estoqueMinimo === 'number' ? i.estoqueMinimo : parseFloat(i.estoqueMinimo) || 5;
            return qtd <= min && qtd > 0;
        });
    },

    getVencidos: function() {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return items.filter(function(i) {
            return i.validade && new Date(i.validade) < hoje;
        });
    },

    getPorCategoria: function(categoria) {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        if (categoria) {
            items = items.filter(function(i) { return i.categoria === categoria; });
        }
        return items;
    },

    calcularValorTotalEstoque: function() {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        return items.reduce(function(acc, i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            var preco = typeof i.preco === 'number' ? i.preco : parseFloat(i.preco) || 0;
            return acc + (qtd * preco);
        }, 0);
    },

    exportarLista: function() {
        try {
            var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
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
                valorTotalEstoque: items.reduce(function(acc, i) {
                    var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
                    var preco = typeof i.preco === 'number' ? i.preco : parseFloat(i.preco) || 0;
                    return acc + (qtd * preco);
                }, 0),
                insumos: items.map(function(i) {
                    return {
                        nome: i.nome,
                        categoria: i.categoria,
                        quantidade: i.quantidade,
                        unidade: i.unidade,
                        preco: i.preco,
                        fornecedor: i.fornecedor,
                        validade: i.validade,
                        estoqueMinimo: i.estoqueMinimo || 5,
                        propriedade: i.propriedade,
                        obs: i.obs
                    };
                })
            };
            
            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'insumos_export_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            
            GR.Toast.success('✅ Lista de insumos exportada!');
        } catch (e) {
            GR.Toast.error('Erro ao exportar: ' + e.message);
        }
    }
};

console.log('✅ Módulo Insumos carregado com design igual ao Relatórios!');