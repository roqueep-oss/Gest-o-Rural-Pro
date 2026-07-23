// ================================================================
// MÓDULO: CONTABILIDADE - COMPLETO COM FILTRO DE PROPRIEDADE
// ================================================================

GR.Modules.Contabilidade = {
    render: function() {
        var div = document.getElementById('lista-contabilidade');
        if (!div) return;

        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var receitas = GR.State.filtrarPorPropriedade(GR.State.data.receitas || [], 'propriedade');
        var despesas = GR.State.filtrarPorPropriedade(GR.State.data.despesas || [], 'propriedade');
        
        // 🔥 APLICA O FILTRO DA ABA ATIVA (SE NÃO FOR "TODAS")
        var filtro = GR.State.ui.propriedadeAtiva || 'todas';
        if (filtro !== 'todas') {
            receitas = receitas.filter(function(item) {
                return item.propriedade === filtro;
            });
            despesas = despesas.filter(function(item) {
                return item.propriedade === filtro;
            });
        }

        var totalReceitas = receitas.reduce(function(s, r) { return s + (r.valor || 0); }, 0);
        var totalDespesas = despesas.reduce(function(s, d) { return s + (d.valor || 0); }, 0);
        var saldo = totalReceitas - totalDespesas;

        // 🔥 COR DO SALDO DINÂMICA
        var saldoCor = saldo >= 0 ? 'var(--success)' : 'var(--danger)';
        var saldoIcon = saldo >= 0 ? '📈' : '📉';

        var html = '<div class="stats-grid">' +
            '<div class="stats-card"><div class="number" style="color:var(--success);">' + GR.Utils.formatarMoedaBR(totalReceitas) + '</div><div class="label">💰 Receitas</div></div>' +
            '<div class="stats-card danger"><div class="number" style="color:var(--danger);">' + GR.Utils.formatarMoedaBR(totalDespesas) + '</div><div class="label">💸 Despesas</div></div>' +
            '<div class="stats-card ' + (saldo >= 0 ? 'success' : 'danger') + '"><div class="number" style="color:' + saldoCor + ';">' + GR.Utils.formatarMoedaBR(saldo) + '</div><div class="label">' + saldoIcon + ' Saldo</div></div>' +
            '</div>';

        // 🔥 CONTADOR DE ITENS
        var totalItens = receitas.length + despesas.length;
        if (totalItens === 0) {
            html += '<div class="empty-state"><span class="icon">💰</span><div class="message">Nenhum lançamento contábil</div></div>';
            div.innerHTML = html;
            return;
        }

        html += '<div class="table-responsive"><table><thead><tr><th>Tipo</th><th>Descrição</th><th>Data</th><th>Valor</th><th>Propriedade</th><th>Ações</th></tr></thead><tbody>';

        // 🔥 RECEITAS (COM BADGE DE ORIGEM)
        receitas.forEach(function(r) {
            var origemBadge = '';
            if (r.origem === 'Venda') origemBadge = '<span class="badge badge-success" style="font-size:8px;">Venda</span>';
            else if (r.origem === 'Financiamento') origemBadge = '<span class="badge badge-info" style="font-size:8px;">Financiamento</span>';
            else if (r.origem === 'Subsídio') origemBadge = '<span class="badge badge-warning" style="font-size:8px;">Subsídio</span>';
            else origemBadge = '<span class="badge badge-secondary" style="font-size:8px;">' + GR.Utils.escapeHtml(r.origem || 'Outros') + '</span>';

            html += '<tr>' +
                '<td><span class="badge badge-success">💰 Receita</span> ' + origemBadge + '</td>' +
                '<td><strong>' + GR.Utils.escapeHtml(r.descricao) + '</strong></td>' +
                '<td>' + GR.Utils.formatarDataBR(r.data) + '</td>' +
                '<td style="font-weight:600;color:var(--success);">' + GR.Utils.formatarMoedaBR(r.valor) + '</td>' +
                '<td>' + GR.Utils.escapeHtml(r.propriedade || '-') + '</td>' +
                '<td>' +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Contabilidade.excluir(\'receitas\',\'' + r.id + '\')" title="Excluir receita">🗑️</button>' +
                '</td>' +
                '</tr>';
        });

        // 🔥 DESPESAS (COM BADGE DE CATEGORIA)
        despesas.forEach(function(d) {
            var categoriaBadge = '';
            if (d.categoria === 'Insumos') categoriaBadge = '<span class="badge badge-warning" style="font-size:8px;">🧪 Insumos</span>';
            else if (d.categoria === 'Mão de Obra') categoriaBadge = '<span class="badge badge-info" style="font-size:8px;">👨‍🌾 Mão de Obra</span>';
            else if (d.categoria === 'Máquinas') categoriaBadge = '<span class="badge badge-primary" style="font-size:8px;">🚜 Máquinas</span>';
            else if (d.categoria === 'Manutenção') categoriaBadge = '<span class="badge badge-secondary" style="font-size:8px;">🔧 Manutenção</span>';
            else categoriaBadge = '<span class="badge badge-secondary" style="font-size:8px;">' + GR.Utils.escapeHtml(d.categoria || 'Outros') + '</span>';

            html += '<tr>' +
                '<td><span class="badge badge-danger">💸 Despesa</span> ' + categoriaBadge + '</td>' +
                '<td><strong>' + GR.Utils.escapeHtml(d.descricao) + '</strong></td>' +
                '<td>' + GR.Utils.formatarDataBR(d.data) + '</td>' +
                '<td style="font-weight:600;color:var(--danger);">' + GR.Utils.formatarMoedaBR(d.valor) + '</td>' +
                '<td>' + GR.Utils.escapeHtml(d.propriedade || '-') + '</td>' +
                '<td>' +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Contabilidade.excluir(\'despesas\',\'' + d.id + '\')" title="Excluir despesa">🗑️</button>' +
                '</td>' +
                '</tr>';
        });

        html += '</tbody></table></div>';
        
        // 🔥 RESUMO RÁPIDO
        html += '<div style="margin-top:8px;padding:8px 12px;background:var(--bg);border-radius:4px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;font-size:11px;color:var(--text-light);">' +
            '<span>📊 Total de lançamentos: <strong>' + totalItens + '</strong></span>' +
            '<span>📈 Receitas: <strong style="color:var(--success);">' + receitas.length + '</strong></span>' +
            '<span>📉 Despesas: <strong style="color:var(--danger);">' + despesas.length + '</strong></span>' +
            '<span>🏷️ Saldo: <strong style="color:' + saldoCor + ';">' + GR.Utils.formatarMoedaBR(saldo) + '</strong></span>' +
            '</div>';

        div.innerHTML = html;
        
        console.log('📊 Contabilidade filtrada: Receitas=' + receitas.length + ', Despesas=' + despesas.length + ' de ' + ((GR.State.data.receitas || []).length + (GR.State.data.despesas || []).length));
    },

    salvarDespesa: function() {
        var descricao = document.getElementById('desp-descricao').value.trim();
        var data = document.getElementById('desp-data').value;
        var valor = GR.Utils.parseMoedaBR(document.getElementById('desp-valor').value);
        var categoria = document.getElementById('desp-categoria').value;
        var propriedade = document.getElementById('desp-propriedade').value;

        if (!descricao || !data || !valor) {
            GR.Toast.error('Campos obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            descricao: GR.Utils.escapeHtml(descricao),
            data: data,
            valor: valor || 0,
            categoria: categoria,
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataCriacao: GR.Utils.now()
        };

        db.collection('users').doc(uid).collection('despesas').add(dados)
            .then(function() {
                GR.Modal.close('modal-despesa');
                GR.Toast.success('Despesa registrada!');
                GR.State.adicionarHistorico('criou despesa', 'Contabilidade', 'Despesa: ' + descricao);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
    },

    salvarReceita: function() {
        var descricao = document.getElementById('rec-descricao').value.trim();
        var data = document.getElementById('rec-data').value;
        var valor = GR.Utils.parseMoedaBR(document.getElementById('rec-valor').value);
        var origem = document.getElementById('rec-origem').value;
        var propriedade = document.getElementById('rec-propriedade').value;

        if (!descricao || !data || !valor) {
            GR.Toast.error('Campos obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            descricao: GR.Utils.escapeHtml(descricao),
            data: data,
            valor: valor || 0,
            origem: origem,
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataCriacao: GR.Utils.now()
        };

        db.collection('users').doc(uid).collection('receitas').add(dados)
            .then(function() {
                GR.Modal.close('modal-receita');
                GR.Toast.success('Receita registrada!');
                GR.State.adicionarHistorico('criou receita', 'Contabilidade', 'Receita: ' + descricao);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
    },

    excluir: function(tipo, id) {
        if (!confirm('Excluir este item?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        db.collection('users').doc(uid).collection(tipo).doc(id).delete()
            .then(function() {
                GR.Toast.success('Excluído!');
                GR.State.adicionarHistorico('excluiu ' + tipo, 'Contabilidade', 'Excluiu ' + tipo + ' ID: ' + id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // 🆕 FUNÇÕES ADICIONAIS
    // ================================================================

    // Obter resumo financeiro filtrado
    getResumoFinanceiro: function() {
        var receitas = GR.State.filtrarPorPropriedade(GR.State.data.receitas || [], 'propriedade');
        var despesas = GR.State.filtrarPorPropriedade(GR.State.data.despesas || [], 'propriedade');
        
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            receitas = receitas.filter(function(r) { return r.propriedade === propAtiva; });
            despesas = despesas.filter(function(d) { return d.propriedade === propAtiva; });
        }

        var totalReceitas = receitas.reduce(function(s, r) { return s + (r.valor || 0); }, 0);
        var totalDespesas = despesas.reduce(function(s, d) { return s + (d.valor || 0); }, 0);

        return {
            receitas: receitas,
            despesas: despesas,
            totalReceitas: totalReceitas,
            totalDespesas: totalDespesas,
            saldo: totalReceitas - totalDespesas,
            totalItens: receitas.length + despesas.length
        };
    },

    // Exportar relatório financeiro
    exportarRelatorio: function() {
        try {
            var resumo = this.getResumoFinanceiro();
            var hoje = new Date().toLocaleString('pt-BR');

            var dados = {
                exportadoEm: hoje,
                propriedadeAtiva: GR.State.ui.propriedadeAtiva || 'todas',
                resumo: {
                    totalReceitas: resumo.totalReceitas,
                    totalDespesas: resumo.totalDespesas,
                    saldo: resumo.saldo,
                    totalItens: resumo.totalItens,
                    qtdReceitas: resumo.receitas.length,
                    qtdDespesas: resumo.despesas.length
                },
                receitas: resumo.receitas.map(function(r) {
                    return {
                        descricao: r.descricao,
                        data: r.data,
                        valor: r.valor,
                        origem: r.origem,
                        propriedade: r.propriedade
                    };
                }),
                despesas: resumo.despesas.map(function(d) {
                    return {
                        descricao: d.descricao,
                        data: d.data,
                        valor: d.valor,
                        categoria: d.categoria,
                        propriedade: d.propriedade
                    };
                })
            };

            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'relatorio_financeiro_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);

            GR.Toast.success('✅ Relatório financeiro exportado!');
        } catch (e) {
            GR.Toast.error('Erro ao exportar: ' + e.message);
        }
    },

    // Gerar resumo por categoria
    getResumoPorCategoria: function() {
        var despesas = GR.State.filtrarPorPropriedade(GR.State.data.despesas || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            despesas = despesas.filter(function(d) { return d.propriedade === propAtiva; });
        }

        var categorias = {};
        despesas.forEach(function(d) {
            var cat = d.categoria || 'Outros';
            if (!categorias[cat]) {
                categorias[cat] = 0;
            }
            categorias[cat] += d.valor || 0;
        });

        return categorias;
    }
};

console.log('✅ Módulo Contabilidade carregado com filtro de propriedade!');