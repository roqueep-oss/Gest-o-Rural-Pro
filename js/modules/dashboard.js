// ================================================================
// MÓDULO: DASHBOARD - Painel Inicial (UI Kit v2)
// ================================================================

GR.Modules.Dashboard = {
    _dadosChartReceitasPorMes: {},
    _dadosChartDespesasPorMes: {},
    _tipoGraficoDashboard: 'bar',
    _chartFinanceiro: null,
    _periodoStats: 'mes',
    _calAno: null,
    _calMes: null,

    // ================================================================
    // RENDER - PAINEL PRINCIPAL
    // ================================================================
    _renderDashboard: function(container) {
        console.log('📊 Renderizando dashboard completo (UI Kit)...');
        if (!container) container = document.getElementById('sectionContainer');
        if (!container) return;

        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        var propDisplay = propAtiva === 'todas' ? '🌍 Todas as propriedades' : '📍 ' + propAtiva;

        var user = GR.State.data.usuario || {};
        var nome = user.nome || user.email || (typeof APP !== 'undefined' && APP.usuario ? (APP.usuario.nome || APP.usuario.email) : '') || 'Usuário';
        if (nome && nome.indexOf('@') > -1) nome = nome.split('@')[0];

        var dataHoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        container.innerHTML = `
            <div class="dash-wrap">

                <div class="dash-hero">
                    <div class="dash-hero-info">
                        <div class="dash-hello">Olá, ${GR.Utils.escapeHtml(nome)} 👋</div>
                        <div class="dash-sub">${dataHoje}</div>
                        <div class="dash-prop">${propDisplay}</div>
                    </div>
                    <div class="dash-hero-actions">
                        <button class="btn btn-sm" onclick="GR.Modules.Dashboard._atualizarDashboard()" title="Atualizar dados">🔄 Atualizar</button>
                        <button class="btn btn-sm" onclick="GR.Modules.Dashboard._exportarDashboard()" title="Exportar dados">📤 Exportar</button>
                    </div>
                </div>

                <div class="dash-kpis" id="dashboardFinanceiro">
                    <div style="display:flex;justify-content:flex-end;align-items:center;grid-column:1/-1;">
                        <div class="dash-seg" id="dashPeriodoToggle">
                            <button id="btn-periodo-mes" class="active" onclick="GR.Modules.Dashboard._alterarPeriodoStats('mes')">Mês</button>
                            <button id="btn-periodo-ano" onclick="GR.Modules.Dashboard._alterarPeriodoStats('ano')">Ano</button>
                        </div>
                    </div>
                    <div class="dash-kpi" style="--kpi:#2563eb;">
                        <div class="dash-kpi-ic">💰</div>
                        <div>
                            <div class="dash-kpi-num" id="dashRecMes">R$ 0</div>
                            <div class="dash-kpi-lab" id="dashRecMesLabel">Receitas do Mês</div>
                        </div>
                    </div>
                    <div class="dash-kpi" style="--kpi:#f59e0b;">
                        <div class="dash-kpi-ic">💸</div>
                        <div>
                            <div class="dash-kpi-num" id="dashDespMes">R$ 0</div>
                            <div class="dash-kpi-lab" id="dashDespMesLabel">Despesas do Mês</div>
                        </div>
                    </div>
                    <div class="dash-kpi" style="--kpi:#06b6d4;">
                        <div class="dash-kpi-ic">💵</div>
                        <div>
                            <div class="dash-kpi-num" id="dashSaldoMes">R$ 0</div>
                            <div class="dash-kpi-lab" id="dashSaldoMesLabel">Saldo do Mês</div>
                        </div>
                    </div>
                    <div class="dash-kpi" style="--kpi:#7c3aed;">
                        <div class="dash-kpi-ic">🏦</div>
                        <div>
                            <div class="dash-kpi-num" id="dashSaldoTotal">R$ 0</div>
                            <div class="dash-kpi-lab">Saldo Total</div>
                        </div>
                    </div>
                </div>

                <div class="dash-card">
                    <div class="dash-card-head">
                        <h3>📈 Receitas vs Despesas (12 meses)</h3>
                        <div class="dash-seg">
                            <button id="btn-grafico-bar" class="active" onclick="GR.Modules.Dashboard._alterarTipoGrafico('bar')">📊 Barras</button>
                            <button id="btn-grafico-line" onclick="GR.Modules.Dashboard._alterarTipoGrafico('line')">📈 Linha</button>
                        </div>
                    </div>
                    <canvas id="chartDashboardFinanceiro" style="width:100%;max-height:280px;height:280px;"></canvas>
                    <div id="dashTendencia" style="text-align:center;padding:6px;font-size:13px;font-weight:600;margin-top:6px;"></div>
                </div>

                <div class="dash-counters" id="dashboardStats">
                    <div class="dash-tile" onclick="GR.UI.mudarView('acoes')"><div class="dash-tile-ic">📋</div><div class="dash-tile-num" id="dashTarefas">0</div><div class="dash-tile-lab">Ações</div></div>
                    <div class="dash-tile" onclick="GR.UI.mudarView('credito')"><div class="dash-tile-ic">💳</div><div class="dash-tile-num" id="dashContratos">0</div><div class="dash-tile-lab">Contratos</div></div>
                    <div class="dash-tile" onclick="GR.UI.mudarView('insumos')"><div class="dash-tile-ic">🧪</div><div class="dash-tile-num" id="dashInsumos">0</div><div class="dash-tile-lab">Insumos</div></div>
                    <div class="dash-tile" onclick="GR.UI.mudarView('pecuaria')"><div class="dash-tile-ic">🐄</div><div class="dash-tile-num" id="dashAnimais">0</div><div class="dash-tile-lab">Animais</div></div>
                    <div class="dash-tile" onclick="GR.UI.mudarView('funcionarios')"><div class="dash-tile-ic">👨‍🌾</div><div class="dash-tile-num" id="dashFuncionarios">0</div><div class="dash-tile-lab">Funcionários</div></div>
                    <div class="dash-tile" onclick="GR.UI.mudarView('documentos')"><div class="dash-tile-ic">📁</div><div class="dash-tile-num" id="dashDocumentos">0</div><div class="dash-tile-lab">Documentos</div></div>
                    <div class="dash-tile" onclick="GR.UI.mudarView('analises')"><div class="dash-tile-ic">🔬</div><div class="dash-tile-num" id="dashAnalises">0</div><div class="dash-tile-lab">Análises</div></div>
                    <div class="dash-tile" onclick="GR.UI.mudarView('parceiros')"><div class="dash-tile-ic">👥</div><div class="dash-tile-num" id="dashParceiros">0</div><div class="dash-tile-lab">Parceiros</div></div>
                    <div class="dash-tile" onclick="GR.UI.mudarView('viveiro')"><div class="dash-tile-ic">🌱</div><div class="dash-tile-num" id="dashViveiro">0</div><div class="dash-tile-lab">Viveiro</div></div>
                    <div class="dash-tile" onclick="GR.UI.mudarView('orcamentos')"><div class="dash-tile-ic">💰</div><div class="dash-tile-num" id="dashOrcamentos">0</div><div class="dash-tile-lab">Orçamentos</div></div>
                </div>

                <div class="dash-card">
                    <div class="dash-card-head"><h3>⚡ Acesso Rápido</h3></div>
                    <div class="dash-quick" id="dashboardQuick"></div>
                </div>

                <div class="dash-grid-2">
                    <div class="dash-card">
                        <div class="dash-card-head">
                            <h3>📅 Calendário</h3>
                            <div class="dash-cal-head" style="margin:0;">
                                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Dashboard._navegarCalendario(-1)">◀</button>
                                <span class="dash-cal-title" id="dashCalendarioMes"></span>
                                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Dashboard._navegarCalendario(1)">▶</button>
                            </div>
                        </div>
                        <div id="dashCalendarioGrid" class="dash-cal"></div>
                        <div class="dash-card-head" style="margin-top:12px;"><h3>🗓️ Eventos de Hoje</h3></div>
                        <div id="dashEventosHoje" style="font-size:12px;"></div>
                    </div>

                    <div class="dash-grid-2-col">
                        <div class="dash-card">
                            <div class="dash-card-head"><h3>📋 Ações Recentes</h3></div>
                            <div id="dashAcoesRecentes" style="font-size:12px;"></div>
                        </div>
                        <div class="dash-card">
                            <div class="dash-card-head"><h3>⚠️ Alertas</h3></div>
                            <div id="dashAlertas" style="font-size:12px;"></div>
                        </div>
                    </div>
                </div>

            </div>
        `;

        GR.Modules.Dashboard._renderAtalhos();
        GR.Modules.Dashboard._atualizarDashboard();
    },

    // ================================================================
    // ATALHOS RÁPIDOS
    // ================================================================
    _renderAtalhos: function() {
        var container = document.getElementById('dashboardQuick');
        if (!container) return;
        var atalhos = [
            { v: 'contabilidade', ic: '🧾', l: 'Financeiro' },
            { v: 'acoes', ic: '📋', l: 'Ações' },
            { v: 'insumos', ic: '🧪', l: 'Insumos' },
            { v: 'pecuaria', ic: '🐄', l: 'Pecuária' },
            { v: 'viveiro', ic: '🌱', l: 'Viveiro' },
            { v: 'funcionarios', ic: '👨‍🌾', l: 'Funcionários' },
            { v: 'credito', ic: '💳', l: 'Crédito' },
            { v: 'orcamentos', ic: '💰', l: 'Orçamentos' },
            { v: 'producao', ic: '🌾', l: 'Produção' },
            { v: 'documentos', ic: '📁', l: 'Documentos' },
            { v: 'analises', ic: '🔬', l: 'Análises' },
            { v: 'relatorios', ic: '📈', l: 'Relatórios' }
        ];
        container.innerHTML = atalhos.map(function(a) {
            return '<div class="dash-quick-item" onclick="GR.UI.mudarView(\'' + a.v + '\')">' +
                '<span class="dash-quick-ic">' + a.ic + '</span>' +
                '<span class="dash-quick-lab">' + a.l + '</span></div>';
        }).join('');
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

            self._atualizarFinanceiro();

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
            self._renderCalendario();
            self._renderEventosHoje();

            console.log('✅ Dashboard atualizado:', { tarefas: tarefas.length, contratos: contratos.length, insumos: insumos.length, animais: animais.length, funcionarios: funcionarios.length, documentos: documentos.length, analises: analises.length, parceiros: parceiros.length, viveiro: viveiroTotal, orcamentos: orcamentos.length });
        } catch (e) {
            console.error('❌ Erro ao atualizar dashboard:', e);
        }
    },

    // ================================================================
    // FINANCEIRO (com seletor Mês / Ano)
    // ================================================================
    _atualizarFinanceiro: function() {
        var self = GR.Modules.Dashboard;
        var f = function(arr, campo) { return GR.State.filtrarPorPropriedade(arr || [], campo); };
        var receitas = f(GR.State.data.receitas, 'propriedade');
        var despesas = f(GR.State.data.despesas, 'propriedade');

        var hoje = new Date();
        var periodo = self._periodoStats || 'mes';
        var receitasPeriodo, despesasPeriodo;
        if (periodo === 'ano') {
            var anoStr = hoje.getFullYear().toString();
            receitasPeriodo = receitas.filter(function(r) { return r.data && r.data.slice(0, 4) === anoStr; });
            despesasPeriodo = despesas.filter(function(d) { return d.data && d.data.slice(0, 4) === anoStr; });
        } else {
            var mesStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');
            receitasPeriodo = receitas.filter(function(r) { return r.data && r.data.slice(0, 7) === mesStr; });
            despesasPeriodo = despesas.filter(function(d) { return d.data && d.data.slice(0, 7) === mesStr; });
        }

        var totalRecPeriodo = receitasPeriodo.reduce(function(s, r) { return s + (r.valor || 0); }, 0);
        var totalDespPeriodo = despesasPeriodo.reduce(function(s, d) { return s + (d.valor || 0); }, 0);
        var totalRec = receitas.reduce(function(s, r) { return s + (r.valor || 0); }, 0);
        var totalDesp = despesas.reduce(function(s, d) { return s + (d.valor || 0); }, 0);

        var setNum = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
        setNum('dashRecMes', GR.Utils.formatarMoedaBR(totalRecPeriodo));
        setNum('dashDespMes', GR.Utils.formatarMoedaBR(totalDespPeriodo));
        setNum('dashSaldoMes', GR.Utils.formatarMoedaBR(totalRecPeriodo - totalDespPeriodo));
        setNum('dashSaldoTotal', GR.Utils.formatarMoedaBR(totalRec - totalDesp));

        var labelRec = document.getElementById('dashRecMesLabel');
        var labelDesp = document.getElementById('dashDespMesLabel');
        var labelSaldo = document.getElementById('dashSaldoMesLabel');
        var sufixo = periodo === 'ano' ? 'do Ano' : 'do Mês';
        if (labelRec) labelRec.textContent = 'Receitas ' + sufixo;
        if (labelDesp) labelDesp.textContent = 'Despesas ' + sufixo;
        if (labelSaldo) labelSaldo.textContent = 'Saldo ' + sufixo;

        var saldoMesStyle = document.getElementById('dashSaldoMes');
        if (saldoMesStyle) saldoMesStyle.style.color = (totalRecPeriodo - totalDespPeriodo) >= 0 ? '#10b981' : '#ef4444';
    },

    // ================================================================
    // ALTERAR PERÍODO (Mês / Ano)
    // ================================================================
    _alterarPeriodoStats: function(periodo) {
        var self = GR.Modules.Dashboard;
        self._periodoStats = periodo;
        var btnMes = document.getElementById('btn-periodo-mes');
        var btnAno = document.getElementById('btn-periodo-ano');
        if (btnMes) btnMes.classList.toggle('active', periodo === 'mes');
        if (btnAno) btnAno.classList.toggle('active', periodo === 'ano');
        self._atualizarFinanceiro();
        self._atualizarTendencias();
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
            container.innerHTML = '<div class="dash-empty">Nenhuma ação registrada</div>';
            return;
        }
        var html = '';
        recentes.forEach(function(t) {
            var dataStr = t.data ? GR.Utils.formatarDataBR(t.data) : '';
            var cor = t.status === 'Concluído' ? '#10b981' : t.status === 'Pendente' ? '#f59e0b' : '#94a3b8';
            html += '<div class="dash-event"><i class="dash-event-dot" style="background:' + cor + '"></i>' +
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
            container.innerHTML = '<div class="dash-empty">✅ Nenhum alerta no momento</div>';
            return;
        }
        alertas.sort(function(a, b) { return a.tipo === 'danger' ? -1 : 1; });
        var html = '';
        alertas.slice(0, 5).forEach(function(a) {
            var bg = a.tipo === 'danger' ? '#fef2f2' : '#fffbeb';
            var cor = a.tipo === 'danger' ? '#b91c1c' : '#b45309';
            html += '<div style="padding:6px 10px;margin-bottom:4px;border-radius:8px;background:' + bg + ';color:' + cor + ';font-size:11px;border-left:3px solid ' + cor + ';">' + a.msg + '</div>';
        });
        if (alertas.length > 5) html += '<div style="font-size:10px;color:var(--text-muted);text-align:center;margin-top:4px;">+ ' + (alertas.length - 5) + ' alertas</div>';
        container.innerHTML = html;
    },

    // ================================================================
    // TENDÊNCIAS
    // ================================================================
    _atualizarTendencias: function() {
        var hoje = new Date();
        var periodo = GR.Modules.Dashboard._periodoStats || 'mes';
        var prefixo = periodo === 'ano' ? hoje.getFullYear().toString() : hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');
        var receitas = GR.State.filtrarPorPropriedade(GR.State.data.receitas || [], 'propriedade');
        var despesas = GR.State.filtrarPorPropriedade(GR.State.data.despesas || [], 'propriedade');
        var totalRecMes = receitas.filter(function(r) { return r.data && r.data.slice(0, prefixo.length) === prefixo; }).reduce(function(s, r) { return s + (r.valor || 0); }, 0);
        var totalDespMes = despesas.filter(function(d) { return d.data && d.data.slice(0, prefixo.length) === prefixo; }).reduce(function(s, d) { return s + (d.valor || 0); }, 0);
        var saldo = totalRecMes - totalDespMes;
        var el = document.getElementById('dashTendencia');
        if (!el) return;
        var unidade = periodo === 'ano' ? 'este ano' : 'este mês';
        if (saldo > 0) { el.innerHTML = '📈 Saldo positivo ' + unidade + ': ' + GR.Utils.formatarMoedaBR(saldo) + ' (Receitas: ' + GR.Utils.formatarMoedaBR(totalRecMes) + ' | Despesas: ' + GR.Utils.formatarMoedaBR(totalDespMes) + ')'; el.style.color = 'var(--success)'; }
        else if (saldo < 0) { el.innerHTML = '📉 Saldo negativo ' + unidade + ': ' + GR.Utils.formatarMoedaBR(saldo) + ' (Receitas: ' + GR.Utils.formatarMoedaBR(totalRecMes) + ' | Despesas: ' + GR.Utils.formatarMoedaBR(totalDespMes) + ')'; el.style.color = 'var(--danger)'; }
        else { el.innerHTML = '📊 Saldo equilibrado ' + unidade; el.style.color = 'var(--text-light)'; }
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
                        { label: 'Receitas', data: receitasData, backgroundColor: 'rgba(37,99,235,0.75)', borderColor: '#2563eb', borderWidth: 2, tension: 0.3, fill: false },
                        { label: 'Despesas', data: despesasData, backgroundColor: 'rgba(245,158,11,0.75)', borderColor: '#f59e0b', borderWidth: 2, tension: 0.3, fill: false }
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
        if (barBtn) barBtn.classList.toggle('active', tipo === 'bar');
        if (lineBtn) lineBtn.classList.toggle('active', tipo === 'line');
        self._renderChartFinanceiro();
    },

    // ================================================================
    // CALENDÁRIO
    // ================================================================
    _parseData: function(str) {
        if (!str) return null;
        var d = null;
        var m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) {
            d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
        } else {
            var p = String(str).split('/');
            if (p.length === 3) d = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
        }
        if (d && !isNaN(d.getTime())) return d;
        return null;
    },

    _coletarEventosMes: function(ano, mes) {
        var self = GR.Modules.Dashboard;
        var eventos = {};
        var f = function(arr, campo) { return GR.State.filtrarPorPropriedade(arr || [], campo); };
        var add = function(diaStr, obj) {
            if (!diaStr) return;
            var d = self._parseData(diaStr);
            if (!d) return;
            var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            (eventos[key] = eventos[key] || []).push(obj);
        };

        f(GR.State.data.tarefas, 'propriedade').forEach(function(t) {
            add(t.data, { cor: '#2563eb', msg: '📋 ' + (t.tipo || t.descricao || 'Ação') });
        });
        f(GR.State.data.receitas, 'propriedade').forEach(function(r) {
            add(r.data, { cor: '#10b981', msg: '💰 Receita: ' + GR.Utils.formatarMoedaBR(r.valor || 0) });
        });
        f(GR.State.data.despesas, 'propriedade').forEach(function(d) {
            add(d.data, { cor: '#f59e0b', msg: '💸 Despesa: ' + GR.Utils.formatarMoedaBR(d.valor || 0) });
        });
        f(GR.State.data.contratos, 'propriedade').forEach(function(c) {
            if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.vencimento) add(p.vencimento, { cor: '#dc2626', msg: '💳 Parcela ' + (c.numero || '') + ': R$ ' + (p.valor || 0).toFixed(2) });
                });
            }
        });
        f(GR.State.data.insumos, 'propriedade').forEach(function(i) {
            if (i.validade) add(i.validade, { cor: '#7c3aed', msg: '🧪 Validade: ' + (i.nome || i.descricao || '') });
        });

        return eventos;
    },

    _renderCalendario: function() {
        var grid = document.getElementById('dashCalendarioGrid');
        if (!grid) return;
        var self = GR.Modules.Dashboard;
        var hoje = new Date();
        if (self._calAno === null || self._calAno === undefined) {
            self._calAno = hoje.getFullYear();
            self._calMes = hoje.getMonth();
        }
        var ano = self._calAno;
        var mes = self._calMes;

        var label = document.getElementById('dashCalendarioMes');
        var nomesMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        if (label) label.textContent = nomesMeses[mes] + ' ' + ano;

        var eventos = self._coletarEventosMes(ano, mes);
        var primeiro = new Date(ano, mes, 1);
        var offset = (primeiro.getDay() + 6) % 7;
        var diasNoMes = new Date(ano, mes + 1, 0).getDate();

        var diasSem = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
        var html = '<div class="dash-cal-dow">' + diasSem.map(function(d) { return '<div>' + d + '</div>'; }).join('') + '</div>';

        var cellHtml = '';
        for (var i = 0; i < offset; i++) cellHtml += '<div class="dash-cal-cell empty"></div>';
        for (var d = 1; d <= diasNoMes; d++) {
            var key = ano + '-' + String(mes + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            var isHoje = (ano === hoje.getFullYear() && mes === hoje.getMonth() && d === hoje.getDate());
            var ev = eventos[key] || [];
            var dots = '';
            if (ev.length) {
                var cores = {};
                ev.forEach(function(e) { cores[e.cor] = true; });
                dots = '<div class="dash-cal-dots">' + Object.keys(cores).map(function(c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</div>';
            }
            cellHtml += '<div class="dash-cal-cell' + (isHoje ? ' hoje' : '') + (ev.length ? ' has-events' : '') + '"' + (ev.length ? ' title="' + ev.length + ' evento(s)"' : '') + '>' + d + dots + '</div>';
        }

        grid.innerHTML = html + cellHtml;
    },

    _navegarCalendario: function(delta) {
        var self = GR.Modules.Dashboard;
        if (self._calAno === null || self._calAno === undefined) {
            var hoje = new Date();
            self._calAno = hoje.getFullYear();
            self._calMes = hoje.getMonth();
        }
        self._calMes += delta;
        if (self._calMes < 0) { self._calMes = 11; self._calAno--; }
        if (self._calMes > 11) { self._calMes = 0; self._calAno++; }
        self._renderCalendario();
    },

    // ================================================================
    // EVENTOS DE HOJE
    // ================================================================
    _renderEventosHoje: function() {
        var el = document.getElementById('dashEventosHoje');
        if (!el) return;
        var self = GR.Modules.Dashboard;
        var hoje = new Date();
        var key = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
        var eventos = self._coletarEventosMes(hoje.getFullYear(), hoje.getMonth())[key] || [];
        if (eventos.length === 0) {
            el.innerHTML = '<div class="dash-empty">Nenhum evento para hoje 🎉</div>';
            return;
        }
        el.innerHTML = eventos.map(function(e) {
            return '<div class="dash-event"><i class="dash-event-dot" style="background:' + e.cor + '"></i><span>' + GR.Utils.escapeHtml(e.msg) + '</span></div>';
        }).join('');
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
