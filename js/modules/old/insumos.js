// ================================================================
// MÓDULO: INSUMOS - COMPLETO COM FILTRO DE PROPRIEDADE
// ================================================================

GR.Modules.Insumos = {
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

        var totalItens = document.getElementById('total-insumos');
        if (totalItens) totalItens.textContent = items.length;

        var valorTotal = items.reduce(function(acc, i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            var preco = typeof i.preco === 'number' ? i.preco : parseFloat(i.preco) || 0;
            return acc + (qtd * preco);
        }, 0);
        var valorEstoque = document.getElementById('valor-estoque');
        if (valorEstoque) valorEstoque.textContent = GR.Utils.formatarMoedaBR(valorTotal);

        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        var vencidos = items.filter(function(i) { return i.validade && new Date(i.validade) < hoje; });
        var insumosVencidos = document.getElementById('insumos-vencidos');
        if (insumosVencidos) insumosVencidos.textContent = vencidos.length;

        if (!items.length) {
            div.innerHTML = '<div class="empty-state"><span class="icon">🧪</span><div class="message">Nenhum insumo cadastrado</div></div>';
            return;
        }

        // 🔥 RESUMO POR CATEGORIA
        var categorias = {};
        items.forEach(function(i) {
            var cat = i.categoria || 'Outros';
            if (!categorias[cat]) categorias[cat] = 0;
            categorias[cat]++;
        });
        var categoriasHtml = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;padding:4px 0;">';
        for (var cat in categorias) {
            categoriasHtml += '<span style="font-size:10px;background:var(--bg);padding:2px 10px;border-radius:12px;border:1px solid var(--border);">' + 
                GR.Utils.escapeHtml(cat) + ': <strong>' + categorias[cat] + '</strong></span>';
        }
        categoriasHtml += '</div>';

        var rows = items.map(function(item) {
            var vencimento = item.validade ? GR.Utils.formatarDataBR(item.validade) : '-';
            var statusValidade = item.validade ? (new Date(item.validade) < hoje ? '🔴' : '🟢') : '⚪';
            var diff = item.validade ? GR.Utils.calcularDiasParaVencimento(item.validade) : null;
            var alertClass = '';
            var alertTitle = '';
            if (diff !== null && diff >= 0 && diff <= 3) {
                alertClass = 'style="background:#ffebee;"';
                alertTitle = '⚠️ Vence em ' + diff + ' dias!';
            } else if (diff !== null && diff > 3 && diff <= 7) {
                alertClass = 'style="background:#fff3e0;"';
                alertTitle = '📅 Vence em ' + diff + ' dias';
            } else if (diff !== null && diff < 0) {
                alertClass = 'style="background:#ffcdd2;"';
                alertTitle = '🔴 VENCIDO!';
            }

            var qtd = typeof item.quantidade === 'number' ? item.quantidade : parseFloat(item.quantidade) || 0;
            var preco = typeof item.preco === 'number' ? item.preco : parseFloat(item.preco) || 0;

            // 🔥 BADGE DE VALIDADE
            var validadeBadge = '';
            if (diff !== null && diff < 0) {
                validadeBadge = '<span class="badge badge-danger">Vencido</span>';
            } else if (diff !== null && diff <= 3) {
                validadeBadge = '<span class="badge badge-warning">Vence em ' + diff + 'd</span>';
            } else if (diff !== null && diff <= 7) {
                validadeBadge = '<span class="badge badge-info">' + diff + ' dias</span>';
            } else if (diff !== null) {
                validadeBadge = '<span class="badge badge-success">OK</span>';
            }

            return '<tr ' + alertClass + ' title="' + alertTitle + '">' +
                '<td><strong>' + GR.Utils.escapeHtml(item.nome) + '</strong></td>' +
                '<td><span class="badge badge-info">' + GR.Utils.escapeHtml(item.categoria) + '</span></td>' +
                '<td>' + qtd + ' ' + (item.unidade || '') + '</td>' +
                '<td>' + GR.Utils.formatarMoedaBR(preco) + '</td>' +
                '<td>' + GR.Utils.formatarMoedaBR(qtd * preco) + '</td>' +
                '<td>' + statusValidade + ' ' + vencimento + ' ' + validadeBadge + '</td>' +
                '<td>' + GR.Utils.escapeHtml(item.fornecedor || '-') + '</td>' +
                '<td>' + GR.Utils.escapeHtml(item.propriedade || '-') + '</td>' +
                '<td>' +
                '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Insumos.editar(\'' + item.id + '\')" title="Editar insumo">✏️</button>' +
                '<button class="btn btn-warning btn-sm" onclick="GR.Modules.Insumos.ajustarEstoque(\'' + item.id + '\')" title="Ajustar estoque">📦</button>' +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Insumos.excluir(\'' + item.id + '\')" title="Excluir insumo">🗑️</button>' +
                '</td>' +
                '</tr>';
        }).join('');

        div.innerHTML = categoriasHtml +
            '<div class="table-responsive"><table><thead><tr><th>Nome</th><th>Categoria</th><th>Quantidade</th><th>Preço Unit.</th><th>Valor Total</th><th>Validade</th><th>Fornecedor</th><th>Propriedade</th><th>Ações</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        
        console.log('📊 Insumos filtrados:', items.length, 'de', (GR.State.data.insumos || []).length);
    },

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
                document.getElementById('insumo-propriedade').value = item.propriedade || '';
                document.getElementById('insumo-obs').value = item.obs || '';
                
                // 🔥 SE TIVER FORNECEDOR, ATUALIZA O NOME PARA EXIBIÇÃO
                if (item.fornecedorId) {
                    var fornecedor = GR.State.buscarFornecedorPorId(item.fornecedorId);
                    if (fornecedor) {
                        var nomeFornecedor = fornecedor.nome || fornecedor.razaoSocial || 'N/A';
                        var doc = fornecedor.cpfcnpj ? ' (' + fornecedor.cpfcnpj + ')' : '';
                        // Apenas para exibição, o valor do select já está definido
                    }
                }
            }
        }
        GR.Modal.open('modal-insumo');
    },

    salvar: function() {
        var nome = document.getElementById('insumo-nome').value.trim();
        var categoria = document.getElementById('insumo-categoria').value;
        var quantidade = parseFloat(document.getElementById('insumo-quantidade').value) || 0;
        var unidade = document.getElementById('insumo-unidade').value;
        var preco = GR.Utils.parseMoedaBR(document.getElementById('insumo-preco').value);
        var fornecedorId = document.getElementById('insumo-fornecedor-id').value;
        var validade = document.getElementById('insumo-validade').value;
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
            propriedade: GR.Utils.escapeHtml(propriedade),
            obs: GR.Utils.escapeHtml(obs),
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('insumos');
        var editId = GR.State.ui.insumoEditando;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-insumo');
                GR.Toast.success('Insumo atualizado!');
                GR.State.adicionarHistorico('editou insumo', 'Insumos', 'Insumo: ' + nome);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function() {
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
                GR.Toast.success('Insumo excluído!');
                GR.State.adicionarHistorico('excluiu insumo', 'Insumos', 'Insumo ID: ' + id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    ajustarEstoque: function(id) {
        var item = GR.State.data.insumos.find(function(i) { return i.id === id; });
        if (!item) {
            GR.Toast.error('Insumo não encontrado!');
            return;
        }

        var modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.display = 'flex';
        modal.innerHTML = '<div class="modal-content" style="max-width:350px;">' +
            '<div class="modal-header"><h2 class="modal-title">📦 Ajustar Estoque</h2><button class="close-btn" onclick="this.closest(\'.modal\').remove()">×</button></div>' +
            '<p style="margin-bottom:6px;">Ajuste o estoque de <strong>' + GR.Utils.escapeHtml(item.nome) + '</strong></p>' +
            '<p><strong>Estoque atual:</strong> ' + item.quantidade + ' ' + (item.unidade || '') + '</p>' +
            '<p><strong>Valor unitário:</strong> ' + GR.Utils.formatarMoedaBR(item.preco || 0) + '</p>' +
            '<div class="form-group"><label>Quantidade (positivo=entrada, negativo=saída)</label><input type="number" id="ajuste-quantidade" class="form-control" step="0.01" value="0"></div>' +
            '<div style="display:flex;gap:3px;justify-content:flex-end;margin-top:8px;">' +
            '<button class="btn btn-success" onclick="GR.Modules.Insumos._confirmarAjuste(\'' + id + '\')">✅ Aplicar</button>' +
            '<button class="btn btn-secondary" onclick="this.closest(\'.modal\').remove()">Cancelar</button>' +
            '</div></div>';
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
        
        // 🔥 REGISTRA HISTÓRICO DO AJUSTE
        var historicoAjuste = {
            data: new Date().toISOString(),
            tipo: valor > 0 ? 'Entrada' : 'Saída',
            quantidade: Math.abs(valor),
            unidade: item.unidade || 'un',
            usuario: user.email || user.uid,
            insumo: item.nome,
            estoqueAnterior: item.quantidade || 0,
            estoqueNovo: novaQtde
        };
        
        db.collection('users').doc(uid).collection('insumos').doc(id).update({ quantidade: novaQtde })
            .then(function() {
                // Salva histórico do ajuste
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
    // 🆕 FUNÇÕES ADICIONAIS
    // ================================================================

    // Obter insumos com estoque baixo
    getEstoqueBaixo: function(limite) {
        limite = limite || 10;
        var items = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        return items.filter(function(i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            return qtd <= limite && qtd > 0;
        });
    },

    // Obter insumos vencidos
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

    // Obter insumos por categoria
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

    // Calcular valor total do estoque
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

    // Exportar lista de insumos
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

console.log('✅ Módulo Insumos carregado com filtro de propriedade!');