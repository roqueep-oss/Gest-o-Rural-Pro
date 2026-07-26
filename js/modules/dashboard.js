// ================================================================
// MÓDULO: DASHBOARD - Painel Inicial
// ================================================================

GR.Modules.Dashboard = {
    _dadosChartReceitasPorMes: {},
    _dadosChartDespesasPorMes: {},
    _tipoGraficoDashboard: 'bar',
    _chartFinanceiro: null,

    // ================================================================
    // RENDER - PAINEL PRINCIPAL
    // ================================================================
    _renderDashboard: function(container) {
        console.log('📊 Renderizando dashboard completo...');
        if (!container) container = document.getElementById('sectionContainer');
        if (!container) return;

        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        var propDisplay = propAtiva === 'todas' ? '🌍 Todas as propriedades' : '📍 ' + propAtiva;

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><span class="emoji">📊</span> Painel de Controle</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                        <span style="font-size:11px;color:var(--text-light);">${propDisplay}</span>
                        <button class="btn btn-info btn-sm" onclick="GR.Modules.Dashboard._atualizarDashboard()" title="Atualizar dados">🔄 Atualizar</button>
                        <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Dashboard._exportarDashboard()" title="Exportar dados">📤 Exportar</button>
                    </div>
                </div>
                <div id="dashboardContent">
                    <div class="stats-grid" id="dashboardStats">
                        <div class="stats-card"><div class="number" id="dashTarefas">0</div><div class="label">📋 Ações</div></div>
                        <div class="stats-card"><div class="number" id="dashContratos">0</div><div class="label">💳 Contratos</div></div>
                        <div class="stats-card"><div class="number" id="dashInsumos">0</div><div class="label">🧪 Insumos</div></div>
                        <div class="stats-card"><div class="number" id="dashAnimais">0</div><div class="label">🐄 Animais</div></div>
                        <div class="stats-card"><div class="number" id="dashFuncionarios">0</div><div class="label">👨‍🌾 Funcionários</div></div>
                        <div class="stats-card"><div class="number" id="dashDocumentos">0</div><div class="label">📁 Documentos</div></div>
                        <div class="stats-card"><div class="number" id="dashAnalises">0</div><div class="label">🧪 Análises</div></div>
                        <div class="stats-card"><div class="number" id="dashParceiros">0</div><div class="label">👥 Parceiros</div></div>
                        <div class="stats-card"><div class="number" id="dashViveiro">0</div><div class="label">🌱 Viveiro</div></div>
                        <div class="stats-card"><div class="number" id="dashOrcamentos">0</div><div class="label">💰 Orçamentos</div></div>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:12px 0;" id="dashboardFinanceiro">
                        <div class="stats-card" style="border-left-color:#28a745;"><div class="number" style="color:#28a745;" id="dashRecMes">R$ 0</div><div class="label">💰 Receitas do Mês</div></div>
                        <div class="stats-card" style="border-left-color:#dc3545;"><div class="number" style="color:#dc3545;" id="dashDespMes">R$ 0</div><div class="label">💸 Despesas do Mês</div></div>
                        <div class="stats-card" style="border-left-color:#ffc107;"><div class="number" style="color:#ffc107;" id="dashSaldoMes">R$ 0</div><div class="label">💵 Saldo do Mês</div></div>
                        <div class="stats-card" style="border-left-color:#6610f2;"><div class="number" style="color:#6610f2;" id="dashSaldoTotal">R$ 0</div><div class="label">🏦 Saldo Total</div></div>
                    </div>

                    <div style="background:var(--card-bg,#f8f9fa);border-radius:8px;padding:12px;margin:12px 0;border:1px solid var(--border,#ddd);">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">
                            <div style="font-weight:700;font-size:14px;">📈 Receitas vs Despesas (12 meses)</div>
                            <div style="display:flex;gap:4px;">
                                <button class="btn btn-sm btn-outline-primary" onclick="GR.Modules.Dashboard._alterarTipoGrafico('bar')" id="btn-grafico-bar" style="padding:2px 8px;font-size:10px;border:1px solid var(--primary);background:var(--primary);color:#fff;border-radius:3px;cursor:pointer;">📊 Barras</button>
                                <button class="btn btn-sm btn-outline-primary" onclick="GR.Modules.Dashboard._alterarTipoGrafico('line')" id="btn-grafico-line" style="padding:2px 8px;font-size:10px;border:1px solid var(--border);background:transparent;color:var(--text-light);border-radius:3px;cursor:pointer;">📈 Linha</button>
                            </div>
                        </div>
                        <canvas id="chartDashboardFinanceiro" style="width:100%;max-height:280px;height:280px;"></canvas>
                        <div id="dashTendencia" style="text-align:center;padding:6px;font-size:13px;font-weight:600;margin-top:6px;"></div>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                        <div style="background:var(--card-bg,#fff);border-radius:8px;padding:12px;border:1px solid var(--border,#ddd);">
                            <div style="font-weight:700;font-size:13px;margin-bottom:8px;">📋 Ações Recentes</div>
                            <div id="dashAcoesRecentes" style="font-size:12px;color:var(--text-light);">Carregando...</div>
                        </div>
                        <div style="background:var(--card-bg,#fff);border-radius:8px;padding:12px;border:1px solid var(--border,#ddd);">
                            <div style="font-weight:700;font-size:13px;margin-bottom:8px;">⚠️ Alertas</div>
                            <div id="dashAlertas" style="font-size:12px;color:var(--text-light);">Carregando...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        GR.Modules.Dashboard._atualizarDashboard();
    },

    // ================================================================
    // ATUALIZAR DASHBOARD
    // ================================================================
    _atualizarDashboard: function() {
        console.log('📊 Atualizando dashboard completo...');
        try {
            var self = GR.Modules.Dashboard;
            var f = function(arr, campo) { return GR.State.filtrarPorPropriedade(arr || [], campo); };
            var tarefas = f(GR.State.data.tarefas, 'propriedade');
            var contratos = f(GR.State.data.contratos, 'propriedade');
            var insumos = f(GR.State.data.insumos, 'propriedade');
            var animais = f(GR.State.data.animais, 'propriedade');
            var funcionarios = f(GR.State.data.funcionarios, 'propriedade');
            var documentos = f(GR.State.data.documentos, 'propriedade');
            var analises = f(GR.State.data.analises, 'propriedade');
            var parceiros = f(GR.State.data.parceiros, 'propriedade');
            var orcamentos = f(GR.State.data.orcamentos, 'propriedade');
            var receitas = f(GR.State.data.receitas, 'propriedade');
            var despesas = f(GR.State.data.despesas, 'propriedade');

            var setNum = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
            setNum('dashTarefas', tarefas.length);
            setNum('dashContratos', contratos.length);
            setNum('dashInsumos', insumos.length);
            setNum('dashAnimais', animais.length);
            setNum('dashFuncionarios', funcionarios.length);
            setNum('dashDocumentos', documentos.length);
            setNum('dashAnalises', analises.length);
            setNum('dashParceiros', parceiros.length);
            setNum('dashOrcamentos', orcamentos.length);

            var viveiroTotal = (GR.State.data.viveiroMudas || []).length + (GR.State.data.viveiroInsumos || []).length + (GR.State.data.viveiroServicos || []).length;
            setNum('dashViveiro', viveiroTotal);

            var hoje = new Date();
            var mesStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');
            var receitasMes = receitas.filter(function(r) { return r.data && r.data.startsWith(mesStr); });
            var despesasMes = despesas.filter(function(d) { return d.data && d.data.startsWith(mesStr); });
            var totalRecMes = receitasMes.reduce(function(s, r) { return s + (r.valor || 0); }, 0);
            var totalDespMes = despesasMes.reduce(function(s, d) { return s + (d.valor || 0); }, 0);
            var totalRec = receitas.reduce(function(s, r) { return s + (r.valor || 0); }, 0);
            var totalDesp = despesas.reduce(function(s, d) { return s + (d.valor || 0); }, 0);

            setNum('dashRecMes', GR.Utils.formatarMoedaBR(totalRecMes));
            setNum('dashDespMes', GR.Utils.formatarMoedaBR(totalDespMes));
            setNum('dashSaldoMes', GR.Utils.formatarMoedaBR(totalRecMes - totalDespMes));
            setNum('dashSaldoTotal', GR.Utils.formatarMoedaBR(totalRec - totalDesp));

            var saldoMesStyle = document.getElementById('dashSaldoMes');
            if (saldoMesStyle) saldoMesStyle.style.color = (totalRecMes - totalDespMes) >= 0 ? '#28a745' : '#dc3545';

            self._dadosChartReceitasPorMes = {};
            self._dadosChartDespesasPorMes = {};
            receitas.forEach(function(r) {
                if (!r.data) return;
                var key = new Date(r.data).getMonth() + '-' + new Date(r.data).getFullYear();
                self._dadosChartReceitasPorMes[key] = (self._dadosChartReceitasPorMes[key] || 0) + (r.valor || 0);
            });
            despesas.forEach(function(d) {
                if (!d.data) return;
                var key = new Date(d.data).getMonth() + '-' + new Date(d.data).getFullYear();
                self._dadosChartDespesasPorMes[key] = (self._dadosChartDespesasPorMes[key] || 0) + (d.valor || 0);
            });

            self._renderChartFinanceiro();
            self._renderAcoesRecentes();
            self._renderAlertas();
            self._atualizarTendencias();

            console.log('✅ Dashboard atualizado:', { tarefas: tarefas.length, contratos: contratos.length, insumos: insumos.length, animais: animais.length, funcionarios: funcionarios.length, documentos: documentos.length, analises: analises.length, parceiros: parceiros.length, viveiro: viveiroTotal, orcamentos: orcamentos.length });
        } catch (e) {
            console.error('❌ Erro ao atualizar dashboard:', e);
        }
    },

    // ================================================================
    // AÇÕES RECENTES
    // ================================================================
    _renderAcoesRecentes: function() {
        var container = document.getElementById('dashAcoesRecentes');
        if (!container) return;
        var tarefas = GR.State.filtrarPorPropriedade(GR.State.data.tarefas || [], 'propriedade');
        var ordenadas = tarefas.slice().sort(function(a, b) { return (b.data || '').localeCompare(a.data || ''); });
        var recentes = ordenadas.slice(0, 5);
        if (recentes.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:12px;color:#999;">Nenhuma ação registrada</div>';
            return;
        }
        var html = '';
        recentes.forEach(function(t) {
            var dataStr = t.data ? GR.Utils.formatarDataBR(t.data) : '';
            var cor = t.status === 'Concluído' ? '#28a745' : t.status === 'Pendente' ? '#ffc107' : '#6c757d';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border-light,#eee);gap:4px;">' +
                '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + GR.Utils.escapeHtml(t.tipo || t.descricao || 'Ação') + '</span>' +
                '<span style="font-size:10px;color:' + cor + ';white-space:nowrap;">' + dataStr + '</span></div>';
        });
        container.innerHTML = html;
    },

    // ================================================================
    // ALERTAS
    // ================================================================
    _renderAlertas: function() {
        var container = document.getElementById('dashAlertas');
        if (!container) return;
        var alertas = [];
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        var insumos = GR.State.filtrarPorPropriedade(GR.State.data.insumos || [], 'propriedade');
        insumos.forEach(function(i) {
            if (i.validade) {
                var val = new Date(i.validade);
                var diff = Math.ceil((val - hoje) / (1000 * 60 * 60 * 24));
                if (diff < 0) alertas.push({ tipo: 'danger', msg: '🧪 Insumo vencido: ' + (i.nome || i.descricao || '') + ' (' + Math.abs(diff) + ' dias)' });
                else if (diff <= 30) alertas.push({ tipo: 'warning', msg: '🧪 Insumo vence em ' + diff + ' dias: ' + (i.nome || i.descricao || '') });
            }
        });

        var contratos = GR.State.filtrarPorPropriedade(GR.State.data.contratos || [], 'propriedade');
        contratos.forEach(function(c) {
            if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.status === 'Pendente' && p.vencimento) {
                        var partes = p.vencimento.split('/');
                        var dataVen = partes.length === 3 ? new Date(partes[2], partes[1]-1, partes[0]) : new Date(p.vencimento);
                        var diff = Math.ceil((dataVen - hoje) / (1000 * 60 * 60 * 24));
                        if (diff < 0) alertas.push({ tipo: 'danger', msg: '💳 Parcela vencida: ' + (c.numero || 'Contrato') + ' - R$ ' + (p.valor || 0).toFixed(2) });
                        else if (diff <= 15) alertas.push({ tipo: 'warning', msg: '💳 Parcela vence em ' + diff + ' dias: ' + (c.numero || 'Contrato') });
                    }
                });
            }
        });

        if (alertas.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:12px;color:#999;">✅ Nenhum alerta no momento</div>';
            return;
        }
        alertas.sort(function(a, b) { return a.tipo === 'danger' ? -1 : 1; });
        var html = '';
        alertas.slice(0, 5).forEach(function(a) {
            var bg = a.tipo === 'danger' ? '#f8d7da' : '#fff3cd';
            var cor = a.tipo === 'danger' ? '#721c24' : '#856404';
            html += '<div style="padding:4px 8px;margin-bottom:3px;border-radius:4px;background:' + bg + ';color:' + cor + ';font-size:11px;">' + a.msg + '</div>';
        });
        if (alertas.length > 5) html += '<div style="font-size:10px;color:#999;text-align:center;margin-top:4px;">+ ' + (alertas.length - 5) + ' alertas</div>';
        container.innerHTML = html;
    },

    // ================================================================
    // TENDÊNCIAS
    // ================================================================
    _atualizarTendencias: function() {
        var hoje = new Date();
        var mesStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');
        var receitas = GR.State.filtrarPorPropriedade(GR.State.data.receitas || [], 'propriedade');
        var despesas = GR.State.filtrarPorPropriedade(GR.State.data.despesas || [], 'propriedade');
        var totalRecMes = receitas.filter(function(r) { return r.data && r.data.startsWith(mesStr); }).reduce(function(s, r) { return s + (r.valor || 0); }, 0);
        var totalDespMes = despesas.filter(function(d) { return d.data && d.data.startsWith(mesStr); }).reduce(function(s, d) { return s + (d.valor || 0); }, 0);
        var saldo = totalRecMes - totalDespMes;
        var el = document.getElementById('dashTendencia');
        if (!el) return;
        if (saldo > 0) { el.innerHTML = '📈 Saldo positivo este mês: ' + GR.Utils.formatarMoedaBR(saldo) + ' (Receitas: ' + GR.Utils.formatarMoedaBR(totalRecMes) + ' | Despesas: ' + GR.Utils.formatarMoedaBR(totalDespMes) + ')'; el.style.color = 'var(--success)'; }
        else if (saldo < 0) { el.innerHTML = '📉 Saldo negativo este mês: ' + GR.Utils.formatarMoedaBR(saldo) + ' (Receitas: ' + GR.Utils.formatarMoedaBR(totalRecMes) + ' | Despesas: ' + GR.Utils.formatarMoedaBR(totalDespMes) + ')'; el.style.color = 'var(--danger)'; }
        else { el.innerHTML = '📊 Saldo equilibrado este mês'; el.style.color = 'var(--text-light)'; }
    },

    // ================================================================
    // GRÁFICO FINANCEIRO
    // ================================================================
    _renderChartFinanceiro: function() {
        var self = GR.Modules.Dashboard;
        var canvas = document.getElementById('chartDashboardFinanceiro');
        if (!canvas) return;
        if (self._chartFinanceiro) { self._chartFinanceiro.destroy(); self._chartFinanceiro = null; }

        var tipo = self._tipoGraficoDashboard || 'bar';
        var meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        var hoje = new Date();
        var labels = [];
        var receitasData = [];
        var despesasData = [];

        for (var i = 11; i >= 0; i--) {
            var d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            labels.push(meses[d.getMonth()] + '/' + d.getFullYear().toString().slice(-2));
            receitasData.push(self._dadosChartReceitasPorMes ? (self._dadosChartReceitasPorMes[d.getMonth() + '-' + d.getFullYear()] || 0) : 0);
            despesasData.push(self._dadosChartDespesasPorMes ? (self._dadosChartDespesasPorMes[d.getMonth() + '-' + d.getFullYear()] || 0) : 0);
        }

        if (typeof Chart === 'undefined') { console.warn('Chart.js não carregado'); return; }

        function criar() {
            var config = {
                type: tipo,
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Receitas', data: receitasData, backgroundColor: 'rgba(40,167,69,0.7)', borderColor: '#28a745', borderWidth: 2, tension: 0.3, fill: false },
                        { label: 'Despesas', data: despesasData, backgroundColor: 'rgba(220,53,69,0.7)', borderColor: '#dc3545', borderWidth: 2, tension: 0.3, fill: false }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                        legend: { position: 'top', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
                        tooltip: {
                            callbacks: {
                                label: function(ctx) { return ctx.dataset.label + ': ' + GR.Utils.formatarMoedaBR(ctx.parsed.y); }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                        y: {
                            beginAtZero: true,
                            ticks: { callback: function(v) { return 'R$' + (v / 1000).toFixed(0) + 'k'; }, font: { size: 10 } }
                        }
                    }
                }
            };
            try { self._chartFinanceiro = new Chart(canvas, config); } catch(e) { console.warn('Erro ao criar gráfico:', e); }
        }

        if (typeof ChartDataLabels !== 'undefined') {
            try {
                Chart.register(ChartDataLabels);
                criar();
            } catch(e) { criar(); }
        } else {
            criar();
        }
    },

    // ================================================================
    // ALTERAR TIPO DO GRÁFICO
    // ================================================================
    _alterarTipoGrafico: function(tipo) {
        var self = GR.Modules.Dashboard;
        self._tipoGraficoDashboard = tipo;
        var barBtn = document.getElementById('btn-grafico-bar');
        var lineBtn = document.getElementById('btn-grafico-line');
        if (barBtn) { barBtn.style.background = tipo === 'bar' ? 'var(--primary)' : 'transparent'; barBtn.style.color = tipo === 'bar' ? '#fff' : 'var(--text-light)'; }
        if (lineBtn) { lineBtn.style.background = tipo === 'line' ? 'var(--primary)' : 'transparent'; lineBtn.style.color = tipo === 'line' ? '#fff' : 'var(--text-light)'; }
        self._renderChartFinanceiro();
    },

    // ================================================================
    // EXPORTAR DASHBOARD
    // ================================================================
    _exportarDashboard: function() {
        try {
            var f = function(arr, campo) { return GR.State.filtrarPorPropriedade(arr || [], campo); };
            var tarefas = f(GR.State.data.tarefas, 'propriedade');
            var contratos = f(GR.State.data.contratos, 'propriedade');
            var insumos = f(GR.State.data.insumos, 'propriedade');
            var animais = f(GR.State.data.animais, 'propriedade');
            var funcionarios = f(GR.State.data.funcionarios, 'propriedade');
            var docs = f(GR.State.data.documentos, 'propriedade');
            var analises = f(GR.State.data.analises, 'propriedade');
            var parceiros = f(GR.State.data.parceiros, 'propriedade');
            var orcamentos = f(GR.State.data.orcamentos, 'propriedade');
            var receitas = f(GR.State.data.receitas, 'propriedade');
            var despesas = f(GR.State.data.despesas, 'propriedade');
            var viveiro = (GR.State.data.viveiroMudas || []).length + (GR.State.data.viveiroInsumos || []).length + (GR.State.data.viveiroServicos || []).length;

            var totalR = receitas.reduce(function(s, r) { return s + (r.valor || 0); }, 0);
            var totalD = despesas.reduce(function(s, d) { return s + (d.valor || 0); }, 0);
            var hoje = new Date();
            var recMes = receitas.filter(function(r) { return r.data && r.data.startsWith(hoje.getFullYear() + '-' + String(hoje.getMonth()+1).padStart(2,'0')); }).reduce(function(s, r) { return s + (r.valor || 0); }, 0);
            var despMes = despesas.filter(function(d) { return d.data && d.data.startsWith(hoje.getFullYear() + '-' + String(hoje.getMonth()+1).padStart(2,'0')); }).reduce(function(s, d) { return s + (d.valor || 0); }, 0);

            var dados = {
                tarefas: tarefas.length, contratos: contratos.length, insumos: insumos.length,
                animais: animais.length, funcionarios: funcionarios.length,
                documentos: docs.length, analises: analises.length,
                parceiros: parceiros.length, viveiro: viveiro, orcamentos: orcamentos.length,
                receitasMes: recMes, despesasMes: despMes, saldoMes: recMes - despMes,
                saldoTotal: totalR - totalD,
                exportadoEm: new Date().toLocaleString('pt-BR'),
                propriedadeAtiva: GR.State.ui.propriedadeAtiva || 'todas'
            };

            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'dashboard_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            GR.Toast.success('✅ Dashboard exportado!');
        } catch (error) {
            console.error('❌ Erro ao exportar dashboard:', error);
            GR.Toast.error('Erro ao exportar dashboard');
        }
    }
};
