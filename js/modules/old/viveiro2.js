// ================================================================
// MÓDULO: VIVEIRO - COMPLETO COM FILTRO DE PROPRIEDADE
// ================================================================

GR.Modules.Viveiro = {
    // ================================================================
    // RENDER PRINCIPAL - COM FILTRO DE PROPRIEDADE
    // ================================================================
    render: function() {
        var div = document.getElementById('viveiro-content');
        if (!div) return;

        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE PARA CADA SUB-MÓDULO
        var mudas = GR.State.filtrarPorPropriedade(GR.State.data.viveiroMudas || [], 'propriedade');
        var insumos = GR.State.filtrarPorPropriedade(GR.State.data.viveiroInsumos || [], 'propriedade');
        var servicos = GR.State.filtrarPorPropriedade(GR.State.data.viveiroServicos || [], 'propriedade');
        var trabalhadores = GR.State.filtrarPorPropriedade(GR.State.data.viveiroTrabalhadores || [], 'propriedade');

        // 🔥 APLICA O FILTRO DA ABA ATIVA (SE NÃO FOR "TODAS")
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            mudas = mudas.filter(function(item) { return item.propriedade === propAtiva; });
            insumos = insumos.filter(function(item) { return item.propriedade === propAtiva; });
            servicos = servicos.filter(function(item) { return item.propriedade === propAtiva; });
            trabalhadores = trabalhadores.filter(function(item) { return item.propriedade === propAtiva; });
        }

        // Atualiza os contadores
        var totalMudas = document.getElementById('total-mudas');
        if (totalMudas) totalMudas.textContent = mudas.length;
        var totalInsumos = document.getElementById('total-insumos-viveiro');
        if (totalInsumos) totalInsumos.textContent = insumos.length;
        var totalServicos = document.getElementById('total-servicos-viveiro');
        if (totalServicos) totalServicos.textContent = servicos.length;

        // 🔥 MOSTRA A PROPRIEDADE ATIVA
        var propDisplay = propAtiva === 'todas' ? '🌍 Todas as propriedades' : '📍 ' + propAtiva;

        var html = `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;padding:8px 12px;background:var(--bg);border-radius:4px;border:1px solid var(--border);">
                <span style="font-size:13px;font-weight:600;">🌱 Viveiro</span>
                <span style="font-size:11px;color:var(--text-light);">${propDisplay}</span>
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro._alternarPropriedade()" style="font-size:10px;">
                    ${propAtiva === 'todas' ? '🔍 Filtrar por propriedade' : '🌍 Todas'}
                </button>
            </div>
        `;

        // 🔥 CARDS DE ESTATÍSTICAS
        var totalMudasQtd = mudas.reduce(function(sum, m) { return sum + (m.quantidade || 0); }, 0);
        var mudasProntas = mudas.filter(function(m) { return m.status === 'Pronta'; }).length;
        var mudasProducao = mudas.filter(function(m) { return m.status === 'Produção'; }).length;
        var servicosPendentes = servicos.filter(function(s) { return s.status !== 'Concluído'; }).length;
        var insumosBaixo = insumos.filter(function(i) { 
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            var min = typeof i.estoqueMinimo === 'number' ? i.estoqueMinimo : parseFloat(i.estoqueMinimo) || 5;
            return qtd < min;
        }).length;

        html += `
            <div class="stats-grid" style="margin-bottom:12px;">
                <div class="stats-card" style="border-left-color:var(--success);">
                    <div class="number" style="font-size:18px;">${mudas.length}</div>
                    <div class="label" style="font-size:10px;">🌱 Mudas</div>
                    <div style="font-size:9px;color:var(--text-light);">${totalMudasQtd} unidades</div>
                </div>
                <div class="stats-card" style="border-left-color:#4CAF50;">
                    <div class="number" style="font-size:18px;color:#4CAF50;">${mudasProntas}</div>
                    <div class="label" style="font-size:10px;">✅ Prontas</div>
                </div>
                <div class="stats-card" style="border-left-color:var(--warning);">
                    <div class="number" style="font-size:18px;color:var(--warning);">${mudasProducao}</div>
                    <div class="label" style="font-size:10px;">⏳ Em Produção</div>
                </div>
                <div class="stats-card" style="border-left-color:var(--info);">
                    <div class="number" style="font-size:18px;color:var(--info);">${insumos.length}</div>
                    <div class="label" style="font-size:10px;">📦 Insumos</div>
                    <div style="font-size:9px;color:${insumosBaixo > 0 ? 'var(--danger)' : 'var(--success)'};">${insumosBaixo > 0 ? '⚠️ ' + insumosBaixo + ' com estoque baixo' : '✅ Estoque OK'}</div>
                </div>
                <div class="stats-card" style="border-left-color:var(--primary);">
                    <div class="number" style="font-size:18px;color:var(--primary);">${servicos.length}</div>
                    <div class="label" style="font-size:10px;">🔧 Serviços</div>
                    <div style="font-size:9px;color:${servicosPendentes > 0 ? 'var(--warning)' : 'var(--success)'};">${servicosPendentes > 0 ? servicosPendentes + ' pendentes' : '✅ Todos concluídos'}</div>
                </div>
                <div class="stats-card" style="border-left-color:#9C27B0;">
                    <div class="number" style="font-size:18px;color:#9C27B0;">${trabalhadores.length}</div>
                    <div class="label" style="font-size:10px;">👨‍🌾 Trabalhadores</div>
                </div>
            </div>

            <!-- Filtros rápidos -->
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro._filtrarPorTipo('todos')" style="font-size:10px;">📋 Todos</button>
                <button class="btn btn-sm btn-success" onclick="GR.Modules.Viveiro._filtrarPorStatusMuda('Pronta')" style="font-size:10px;">✅ Prontas</button>
                <button class="btn btn-sm btn-warning" onclick="GR.Modules.Viveiro._filtrarPorStatusMuda('Produção')" style="font-size:10px;">⏳ Produção</button>
                <button class="btn btn-sm btn-info" onclick="GR.Modules.Viveiro._filtrarPorStatusServico('Pendente')" style="font-size:10px;">📋 Serviços Pendentes</button>
                <button class="btn btn-sm btn-danger" onclick="GR.Modules.Viveiro._filtrarEstoqueBaixo()" style="font-size:10px;">⚠️ Estoque Baixo</button>
            </div>
        `;

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;">';

        // 🔥 MUDAS (COM EXCLUSÃO E EDIÇÃO)
        html += '<div style="background:var(--surface);padding:8px;border-radius:6px;border:1px solid var(--border);">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
            '<h4 style="font-size:11px;margin:0;">🌱 Mudas (' + mudas.length + ')</h4>' +
            '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalMuda()" style="font-size:9px;padding:2px 6px;">➕</button>' +
            '</div>';
        if (!mudas.length) html += '<div style="color:#999;font-size:11px;">Nenhuma muda</div>';
        else {
            mudas.forEach(function(m) {
                var statusBadge = m.status === 'Pronta' ? '<span class="badge badge-success">Pronta</span>' :
                    m.status === 'Produção' ? '<span class="badge badge-warning">Produção</span>' :
                    '<span class="badge badge-info">' + m.status + '</span>';
                html += '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid var(--border);align-items:center;">' +
                    '<div><span>' + GR.Utils.escapeHtml(m.especie || 'Muda') + '</span> ' + statusBadge + '</div>' +
                    '<div style="display:flex;align-items:center;gap:2px;">' +
                    '<span>' + (m.quantidade || 0) + ' un</span>' +
                    '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalMuda(\'' + m.id + '\')" style="font-size:8px;padding:1px 4px;">✏️</button>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir(\'muda\',\'' + m.id + '\')" style="font-size:8px;padding:1px 4px;">🗑️</button>' +
                    '</div></div>';
            });
        }
        html += '</div>';

        // 🔥 INSUMOS (COM EXCLUSÃO E EDIÇÃO)
        html += '<div style="background:var(--surface);padding:8px;border-radius:6px;border:1px solid var(--border);">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
            '<h4 style="font-size:11px;margin:0;">📦 Insumos (' + insumos.length + ')</h4>' +
            '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalInsumo()" style="font-size:9px;padding:2px 6px;">➕</button>' +
            '</div>';
        if (!insumos.length) html += '<div style="color:#999;font-size:11px;">Nenhum insumo</div>';
        else {
            insumos.forEach(function(i) {
                var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
                var min = typeof i.estoqueMinimo === 'number' ? i.estoqueMinimo : parseFloat(i.estoqueMinimo) || 5;
                var statusEstoque = qtd < min ? '🔴' : '🟢';
                var alertClass = qtd < min ? 'style="background:#ffebee;padding:3px 6px;border-radius:3px;"' : '';
                html += '<div ' + alertClass + ' style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid var(--border);align-items:center;">' +
                    '<div><span>' + GR.Utils.escapeHtml(i.nome || 'Insumo') + '</span> <span style="font-size:9px;color:var(--text-light);">' + i.tipo + '</span></div>' +
                    '<div style="display:flex;align-items:center;gap:2px;">' +
                    '<span>' + statusEstoque + ' ' + qtd + ' ' + (i.unidade || '') + '</span>' +
                    '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalInsumo(\'' + i.id + '\')" style="font-size:8px;padding:1px 4px;">✏️</button>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir(\'insumo\',\'' + i.id + '\')" style="font-size:8px;padding:1px 4px;">🗑️</button>' +
                    '</div></div>';
            });
        }
        html += '</div>';

        // 🔥 SERVIÇOS (COM EXCLUSÃO E EDIÇÃO)
        html += '<div style="background:var(--surface);padding:8px;border-radius:6px;border:1px solid var(--border);">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
            '<h4 style="font-size:11px;margin:0;">🔧 Serviços (' + servicos.length + ')</h4>' +
            '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalServico()" style="font-size:9px;padding:2px 6px;">➕</button>' +
            '</div>';
        if (!servicos.length) html += '<div style="color:#999;font-size:11px;">Nenhum serviço</div>';
        else {
            servicos.forEach(function(s) {
                var statusBadge = s.status === 'Concluído' ? '<span class="badge badge-success">✅</span>' :
                    s.status === 'Em andamento' ? '<span class="badge badge-warning">⏳</span>' :
                    '<span class="badge badge-info">📋</span>';
                var custoDisplay = s.custo ? GR.Utils.formatarMoedaBR(s.custo) : '';
                html += '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid var(--border);align-items:center;">' +
                    '<div><span>' + GR.Utils.escapeHtml(s.descricao || 'Serviço') + '</span> ' + statusBadge + ' <span style="font-size:9px;color:var(--text-light);">' + (s.responsavel || '-') + '</span></div>' +
                    '<div style="display:flex;align-items:center;gap:2px;">' +
                    '<span style="font-size:9px;">' + custoDisplay + '</span>' +
                    '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalServico(\'' + s.id + '\')" style="font-size:8px;padding:1px 4px;">✏️</button>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir(\'servico\',\'' + s.id + '\')" style="font-size:8px;padding:1px 4px;">🗑️</button>' +
                    '</div></div>';
            });
        }
        html += '</div>';

        // 🔥 TRABALHADORES (COM EXCLUSÃO E EDIÇÃO)
        html += '<div style="background:var(--surface);padding:8px;border-radius:6px;border:1px solid var(--border);">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
            '<h4 style="font-size:11px;margin:0;">👨‍🌾 Trabalhadores (' + trabalhadores.length + ')</h4>' +
            '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalTrabalhador()" style="font-size:9px;padding:2px 6px;">➕</button>' +
            '</div>';
        if (!trabalhadores.length) html += '<div style="color:#999;font-size:11px;">Nenhum trabalhador</div>';
        else {
            trabalhadores.forEach(function(t) {
                html += '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid var(--border);align-items:center;">' +
                    '<div><span>' + GR.Utils.escapeHtml(t.nome || 'Trabalhador') + '</span> <span style="font-size:9px;color:var(--text-light);">' + (t.funcao || '-') + '</span></div>' +
                    '<div style="display:flex;align-items:center;gap:2px;">' +
                    '<span style="font-size:9px;">' + (t.admissao ? GR.Utils.formatarDataBR(t.admissao) : '') + '</span>' +
                    '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalTrabalhador(\'' + t.id + '\')" style="font-size:8px;padding:1px 4px;">✏️</button>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir(\'trabalhador\',\'' + t.id + '\')" style="font-size:8px;padding:1px 4px;">🗑️</button>' +
                    '</div></div>';
            });
        }
        html += '</div>';

        html += '</div>';

        // 🔥 BOTÕES DE AÇÃO
        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;padding-top:10px;border-top:1px solid var(--border);">' +
            '<button class="btn btn-primary" onclick="GR.Modules.Viveiro.abrirModalMuda()">➕ Nova Muda</button>' +
            '<button class="btn btn-primary" onclick="GR.Modules.Viveiro.abrirModalInsumo()">📦 Novo Insumo</button>' +
            '<button class="btn btn-primary" onclick="GR.Modules.Viveiro.abrirModalServico()">🔧 Novo Serviço</button>' +
            '<button class="btn btn-primary" onclick="GR.Modules.Viveiro.abrirModalTrabalhador()">👨‍🌾 Novo Trabalhador</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modules.Viveiro.exportarDados()">📊 Exportar Dados</button>' +
            '</div>';

        div.innerHTML = html;
        
        console.log('📊 Viveiro filtrado: Mudas=' + mudas.length + ', Insumos=' + insumos.length + 
            ', Serviços=' + servicos.length + ', Trabalhadores=' + trabalhadores.length);
    },

    // ================================================================
    // 🆕 ALTERNAR PROPRIEDADE
    // ================================================================
    _alternarPropriedade: function() {
        var props = GR.State.getPropriedadesPermitidas();
        if (!props || props.length === 0) {
            GR.Toast.warning('⚠️ Nenhuma propriedade disponível!');
            return;
        }

        var propAtual = GR.State.ui.propriedadeAtiva || 'todas';
        
        if (propAtual === 'todas' && props.length > 0) {
            GR.State.ui.propriedadeAtiva = props[0];
            GR.Toast.info('📍 Filtrando por: ' + props[0]);
        } else {
            var index = props.indexOf(propAtual);
            if (index === -1 || index === props.length - 1) {
                GR.State.ui.propriedadeAtiva = 'todas';
                GR.Toast.info('🌍 Mostrando todas as propriedades');
            } else {
                GR.State.ui.propriedadeAtiva = props[index + 1];
                GR.Toast.info('📍 Filtrando por: ' + props[index + 1]);
            }
        }
        
        GR.UI.atualizarPropTabs();
        this.render();
        GR.UI.refreshCurrentView();
    },

    // ================================================================
    // 🆕 FILTROS
    // ================================================================
    _filtroTipoAtual: 'todos',

    _filtrarPorTipo: function(tipo) {
        this._filtroTipoAtual = tipo;
        // Re-renderiza com o filtro aplicado
        this.render();
    },

    _filtrarPorStatusMuda: function(status) {
        var div = document.getElementById('viveiro-content');
        if (!div) return;

        var mudas = GR.State.filtrarPorPropriedade(GR.State.data.viveiroMudas || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            mudas = mudas.filter(function(item) { return item.propriedade === propAtiva; });
        }
        mudas = mudas.filter(function(m) { return m.status === status; });

        var insumos = GR.State.filtrarPorPropriedade(GR.State.data.viveiroInsumos || [], 'propriedade');
        if (propAtiva !== 'todas') {
            insumos = insumos.filter(function(item) { return item.propriedade === propAtiva; });
        }

        var servicos = GR.State.filtrarPorPropriedade(GR.State.data.viveiroServicos || [], 'propriedade');
        if (propAtiva !== 'todas') {
            servicos = servicos.filter(function(item) { return item.propriedade === propAtiva; });
        }

        var trabalhadores = GR.State.filtrarPorPropriedade(GR.State.data.viveiroTrabalhadores || [], 'propriedade');
        if (propAtiva !== 'todas') {
            trabalhadores = trabalhadores.filter(function(item) { return item.propriedade === propAtiva; });
        }

        var html = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;padding:8px 12px;background:var(--bg);border-radius:4px;border:1px solid var(--border);">' +
            '<span style="font-size:13px;font-weight:600;">🌱 Viveiro - Filtro: Mudas ' + status + '</span>' +
            '<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro.render()" style="font-size:10px;">🔙 Limpar filtro</button>' +
            '</div>';

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;">';
        html += this._gerarCardMudas(mudas);
        html += this._gerarCardInsumos(insumos);
        html += this._gerarCardServicos(servicos);
        html += this._gerarCardTrabalhadores(trabalhadores);
        html += '</div>';

        div.innerHTML = html;
    },

    _filtrarPorStatusServico: function(status) {
        var div = document.getElementById('viveiro-content');
        if (!div) return;

        var servicos = GR.State.filtrarPorPropriedade(GR.State.data.viveiroServicos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            servicos = servicos.filter(function(item) { return item.propriedade === propAtiva; });
        }
        servicos = servicos.filter(function(s) { return s.status !== 'Concluído'; });

        var mudas = GR.State.filtrarPorPropriedade(GR.State.data.viveiroMudas || [], 'propriedade');
        if (propAtiva !== 'todas') {
            mudas = mudas.filter(function(item) { return item.propriedade === propAtiva; });
        }

        var insumos = GR.State.filtrarPorPropriedade(GR.State.data.viveiroInsumos || [], 'propriedade');
        if (propAtiva !== 'todas') {
            insumos = insumos.filter(function(item) { return item.propriedade === propAtiva; });
        }

        var trabalhadores = GR.State.filtrarPorPropriedade(GR.State.data.viveiroTrabalhadores || [], 'propriedade');
        if (propAtiva !== 'todas') {
            trabalhadores = trabalhadores.filter(function(item) { return item.propriedade === propAtiva; });
        }

        var html = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;padding:8px 12px;background:var(--bg);border-radius:4px;border:1px solid var(--border);">' +
            '<span style="font-size:13px;font-weight:600;">🌱 Viveiro - Filtro: Serviços Pendentes</span>' +
            '<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro.render()" style="font-size:10px;">🔙 Limpar filtro</button>' +
            '</div>';

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;">';
        html += this._gerarCardMudas(mudas);
        html += this._gerarCardInsumos(insumos);
        html += this._gerarCardServicos(servicos);
        html += this._gerarCardTrabalhadores(trabalhadores);
        html += '</div>';

        div.innerHTML = html;
    },

    _filtrarEstoqueBaixo: function() {
        var div = document.getElementById('viveiro-content');
        if (!div) return;

        var insumos = GR.State.filtrarPorPropriedade(GR.State.data.viveiroInsumos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            insumos = insumos.filter(function(item) { return item.propriedade === propAtiva; });
        }
        insumos = insumos.filter(function(i) {
            var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
            var min = typeof i.estoqueMinimo === 'number' ? i.estoqueMinimo : parseFloat(i.estoqueMinimo) || 5;
            return qtd < min;
        });

        var mudas = GR.State.filtrarPorPropriedade(GR.State.data.viveiroMudas || [], 'propriedade');
        if (propAtiva !== 'todas') {
            mudas = mudas.filter(function(item) { return item.propriedade === propAtiva; });
        }

        var servicos = GR.State.filtrarPorPropriedade(GR.State.data.viveiroServicos || [], 'propriedade');
        if (propAtiva !== 'todas') {
            servicos = servicos.filter(function(item) { return item.propriedade === propAtiva; });
        }

        var trabalhadores = GR.State.filtrarPorPropriedade(GR.State.data.viveiroTrabalhadores || [], 'propriedade');
        if (propAtiva !== 'todas') {
            trabalhadores = trabalhadores.filter(function(item) { return item.propriedade === propAtiva; });
        }

        var html = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;padding:8px 12px;background:var(--bg);border-radius:4px;border:1px solid var(--border);">' +
            '<span style="font-size:13px;font-weight:600;">🌱 Viveiro - Estoque Baixo (<span style="color:var(--danger);">' + insumos.length + '</span> itens)</span>' +
            '<button class="btn btn-sm btn-secondary" onclick="GR.Modules.Viveiro.render()" style="font-size:10px;">🔙 Limpar filtro</button>' +
            '</div>';

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;">';
        html += this._gerarCardMudas(mudas);
        html += this._gerarCardInsumos(insumos);
        html += this._gerarCardServicos(servicos);
        html += this._gerarCardTrabalhadores(trabalhadores);
        html += '</div>';

        div.innerHTML = html;
    },

    // ================================================================
    // 🆕 CARDS PARA RENDERIZAÇÃO
    // ================================================================
    _gerarCardMudas: function(mudas) {
        var html = '<div style="background:var(--surface);padding:8px;border-radius:6px;border:1px solid var(--border);">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
            '<h4 style="font-size:11px;margin:0;">🌱 Mudas (' + mudas.length + ')</h4>' +
            '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalMuda()" style="font-size:9px;padding:2px 6px;">➕</button>' +
            '</div>';
        if (!mudas.length) html += '<div style="color:#999;font-size:11px;">Nenhuma muda</div>';
        else {
            mudas.forEach(function(m) {
                var statusBadge = m.status === 'Pronta' ? '<span class="badge badge-success">Pronta</span>' :
                    m.status === 'Produção' ? '<span class="badge badge-warning">Produção</span>' :
                    '<span class="badge badge-info">' + m.status + '</span>';
                html += '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid var(--border);align-items:center;">' +
                    '<div><span>' + GR.Utils.escapeHtml(m.especie || 'Muda') + '</span> ' + statusBadge + '</div>' +
                    '<div style="display:flex;align-items:center;gap:2px;">' +
                    '<span>' + (m.quantidade || 0) + ' un</span>' +
                    '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalMuda(\'' + m.id + '\')" style="font-size:8px;padding:1px 4px;">✏️</button>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir(\'muda\',\'' + m.id + '\')" style="font-size:8px;padding:1px 4px;">🗑️</button>' +
                    '</div></div>';
            });
        }
        html += '</div>';
        return html;
    },

    _gerarCardInsumos: function(insumos) {
        var html = '<div style="background:var(--surface);padding:8px;border-radius:6px;border:1px solid var(--border);">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
            '<h4 style="font-size:11px;margin:0;">📦 Insumos (' + insumos.length + ')</h4>' +
            '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalInsumo()" style="font-size:9px;padding:2px 6px;">➕</button>' +
            '</div>';
        if (!insumos.length) html += '<div style="color:#999;font-size:11px;">Nenhum insumo</div>';
        else {
            insumos.forEach(function(i) {
                var qtd = typeof i.quantidade === 'number' ? i.quantidade : parseFloat(i.quantidade) || 0;
                var min = typeof i.estoqueMinimo === 'number' ? i.estoqueMinimo : parseFloat(i.estoqueMinimo) || 5;
                var statusEstoque = qtd < min ? '🔴' : '🟢';
                var alertClass = qtd < min ? 'style="background:#ffebee;padding:3px 6px;border-radius:3px;"' : '';
                html += '<div ' + alertClass + ' style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid var(--border);align-items:center;">' +
                    '<div><span>' + GR.Utils.escapeHtml(i.nome || 'Insumo') + '</span> <span style="font-size:9px;color:var(--text-light);">' + i.tipo + '</span></div>' +
                    '<div style="display:flex;align-items:center;gap:2px;">' +
                    '<span>' + statusEstoque + ' ' + qtd + ' ' + (i.unidade || '') + '</span>' +
                    '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalInsumo(\'' + i.id + '\')" style="font-size:8px;padding:1px 4px;">✏️</button>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir(\'insumo\',\'' + i.id + '\')" style="font-size:8px;padding:1px 4px;">🗑️</button>' +
                    '</div></div>';
            });
        }
        html += '</div>';
        return html;
    },

    _gerarCardServicos: function(servicos) {
        var html = '<div style="background:var(--surface);padding:8px;border-radius:6px;border:1px solid var(--border);">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
            '<h4 style="font-size:11px;margin:0;">🔧 Serviços (' + servicos.length + ')</h4>' +
            '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalServico()" style="font-size:9px;padding:2px 6px;">➕</button>' +
            '</div>';
        if (!servicos.length) html += '<div style="color:#999;font-size:11px;">Nenhum serviço</div>';
        else {
            servicos.forEach(function(s) {
                var statusBadge = s.status === 'Concluído' ? '<span class="badge badge-success">✅</span>' :
                    s.status === 'Em andamento' ? '<span class="badge badge-warning">⏳</span>' :
                    '<span class="badge badge-info">📋</span>';
                var custoDisplay = s.custo ? GR.Utils.formatarMoedaBR(s.custo) : '';
                html += '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid var(--border);align-items:center;">' +
                    '<div><span>' + GR.Utils.escapeHtml(s.descricao || 'Serviço') + '</span> ' + statusBadge + ' <span style="font-size:9px;color:var(--text-light);">' + (s.responsavel || '-') + '</span></div>' +
                    '<div style="display:flex;align-items:center;gap:2px;">' +
                    '<span style="font-size:9px;">' + custoDisplay + '</span>' +
                    '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalServico(\'' + s.id + '\')" style="font-size:8px;padding:1px 4px;">✏️</button>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir(\'servico\',\'' + s.id + '\')" style="font-size:8px;padding:1px 4px;">🗑️</button>' +
                    '</div></div>';
            });
        }
        html += '</div>';
        return html;
    },

    _gerarCardTrabalhadores: function(trabalhadores) {
        var html = '<div style="background:var(--surface);padding:8px;border-radius:6px;border:1px solid var(--border);">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
            '<h4 style="font-size:11px;margin:0;">👨‍🌾 Trabalhadores (' + trabalhadores.length + ')</h4>' +
            '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalTrabalhador()" style="font-size:9px;padding:2px 6px;">➕</button>' +
            '</div>';
        if (!trabalhadores.length) html += '<div style="color:#999;font-size:11px;">Nenhum trabalhador</div>';
        else {
            trabalhadores.forEach(function(t) {
                html += '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid var(--border);align-items:center;">' +
                    '<div><span>' + GR.Utils.escapeHtml(t.nome || 'Trabalhador') + '</span> <span style="font-size:9px;color:var(--text-light);">' + (t.funcao || '-') + '</span></div>' +
                    '<div style="display:flex;align-items:center;gap:2px;">' +
                    '<span style="font-size:9px;">' + (t.admissao ? GR.Utils.formatarDataBR(t.admissao) : '') + '</span>' +
                    '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Viveiro.abrirModalTrabalhador(\'' + t.id + '\')" style="font-size:8px;padding:1px 4px;">✏️</button>' +
                    '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Viveiro.excluir(\'trabalhador\',\'' + t.id + '\')" style="font-size:8px;padding:1px 4px;">🗑️</button>' +
                    '</div></div>';
            });
        }
        html += '</div>';
        return html;
    },

    // ================================================================
    // ABRIR MODAL MUDA - COM FILTRO DE PROPRIEDADE
    // ================================================================
    abrirModalMuda: function(editId) {
        GR.State.ui.viveiroEditando = { tipo: 'muda', id: editId || null };
        
        // 🔥 ATUALIZA O SELECT DE PROPRIEDADE COM AS PERMITIDAS
        GR.UI._atualizarSelectsPropriedade();

        var titleEl = document.getElementById('modal-viveiro-muda-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Muda' : '🌱 Nova Muda';
        
        document.getElementById('viveiro-muda-especie').value = '';
        document.getElementById('viveiro-muda-variedade').value = '';
        document.getElementById('viveiro-muda-qtd').value = 0;
        document.getElementById('viveiro-muda-status').value = 'Produção';
        document.getElementById('viveiro-muda-data-producao').value = new Date().toISOString().split('T')[0];
        document.getElementById('viveiro-muda-obs').value = '';
        document.getElementById('viveiro-muda-propriedade').value = GR.State.ui.propriedadeAtiva || '';

        if (editId) {
            var item = GR.State.data.viveiroMudas.find(function(m) { return m.id === editId; });
            if (item) {
                document.getElementById('viveiro-muda-especie').value = item.especie || '';
                document.getElementById('viveiro-muda-variedade').value = item.variedade || '';
                document.getElementById('viveiro-muda-qtd').value = item.quantidade || 0;
                document.getElementById('viveiro-muda-status').value = item.status || 'Produção';
                document.getElementById('viveiro-muda-data-producao').value = item.dataProducao || '';
                document.getElementById('viveiro-muda-propriedade').value = item.propriedade || '';
                document.getElementById('viveiro-muda-obs').value = item.obs || '';
            }
        }
        GR.Modal.open('modal-viveiro-muda');
    },

    // ================================================================
    // SALVAR MUDA
    // ================================================================
    salvarMuda: function() {
        var especie = document.getElementById('viveiro-muda-especie').value.trim();
        var variedade = document.getElementById('viveiro-muda-variedade').value.trim();
        var quantidade = parseInt(document.getElementById('viveiro-muda-qtd').value) || 0;
        var status = document.getElementById('viveiro-muda-status').value;
        var dataProducao = document.getElementById('viveiro-muda-data-producao').value;
        var propriedade = document.getElementById('viveiro-muda-propriedade').value;
        var obs = document.getElementById('viveiro-muda-obs').value.trim();

        if (!especie || quantidade <= 0) {
            GR.Toast.error('Espécie e quantidade são obrigatórios!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            especie: GR.Utils.escapeHtml(especie),
            variedade: GR.Utils.escapeHtml(variedade),
            quantidade: quantidade,
            status: status,
            dataProducao: dataProducao || '',
            propriedade: GR.Utils.escapeHtml(propriedade),
            obs: GR.Utils.escapeHtml(obs),
            dataAtualizacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroMudas');
        var editId = GR.State.ui.viveiroEditando ? GR.State.ui.viveiroEditando.id : null;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-muda');
                GR.Toast.success('Muda atualizada!');
                GR.State.adicionarHistorico('editou muda', 'Viveiro', 'Muda: ' + especie);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            dados.dataCriacao = GR.Utils.now();
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-muda');
                GR.Toast.success('Muda cadastrada!');
                GR.State.adicionarHistorico('criou muda', 'Viveiro', 'Muda: ' + especie);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    // ================================================================
    // ABRIR MODAL INSUMO - COM FILTRO DE PROPRIEDADE
    // ================================================================
    abrirModalInsumo: function(editId) {
        GR.State.ui.viveiroEditando = { tipo: 'insumo', id: editId || null };
        
        // 🔥 ATUALIZA O SELECT DE PROPRIEDADE COM AS PERMITIDAS
        GR.UI._atualizarSelectsPropriedade();

        var titleEl = document.getElementById('modal-viveiro-insumo-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Insumo' : '📦 Novo Insumo';
        
        document.getElementById('viveiro-insumo-nome').value = '';
        document.getElementById('viveiro-insumo-tipo').value = 'Substrato';
        document.getElementById('viveiro-insumo-qtd').value = 0;
        document.getElementById('viveiro-insumo-unidade').value = 'kg';
        document.getElementById('viveiro-insumo-preco').value = '0,00';
        document.getElementById('viveiro-insumo-fornecedor').value = '';
        document.getElementById('viveiro-insumo-validade').value = '';
        document.getElementById('viveiro-insumo-estoque-minimo').value = 5;
        document.getElementById('viveiro-insumo-propriedade').value = GR.State.ui.propriedadeAtiva || '';

        if (editId) {
            var item = GR.State.data.viveiroInsumos.find(function(i) { return i.id === editId; });
            if (item) {
                document.getElementById('viveiro-insumo-nome').value = item.nome || '';
                document.getElementById('viveiro-insumo-tipo').value = item.tipo || 'Substrato';
                document.getElementById('viveiro-insumo-qtd').value = item.quantidade || 0;
                document.getElementById('viveiro-insumo-unidade').value = item.unidade || 'kg';
                document.getElementById('viveiro-insumo-preco').value = GR.Utils.formatarMoedaSemSimbolo(item.preco || 0);
                document.getElementById('viveiro-insumo-fornecedor').value = item.fornecedor || '';
                document.getElementById('viveiro-insumo-validade').value = item.validade || '';
                document.getElementById('viveiro-insumo-estoque-minimo').value = item.estoqueMinimo || 5;
                document.getElementById('viveiro-insumo-propriedade').value = item.propriedade || '';
            }
        }
        GR.Modal.open('modal-viveiro-insumo');
    },

    // ================================================================
    // SALVAR INSUMO
    // ================================================================
    salvarInsumo: function() {
        var nome = document.getElementById('viveiro-insumo-nome').value.trim();
        var tipo = document.getElementById('viveiro-insumo-tipo').value;
        var quantidade = parseFloat(document.getElementById('viveiro-insumo-qtd').value) || 0;
        var unidade = document.getElementById('viveiro-insumo-unidade').value;
        var preco = GR.Utils.parseMoedaBR(document.getElementById('viveiro-insumo-preco').value);
        var fornecedor = document.getElementById('viveiro-insumo-fornecedor').value.trim();
        var validade = document.getElementById('viveiro-insumo-validade').value;
        var estoqueMinimo = parseFloat(document.getElementById('viveiro-insumo-estoque-minimo').value) || 5;
        var propriedade = document.getElementById('viveiro-insumo-propriedade').value;

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
            tipo: tipo,
            quantidade: quantidade,
            unidade: unidade,
            preco: preco || 0,
            fornecedor: GR.Utils.escapeHtml(fornecedor),
            validade: validade || '',
            estoqueMinimo: estoqueMinimo,
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataAtualizacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroInsumos');
        var editId = GR.State.ui.viveiroEditando ? GR.State.ui.viveiroEditando.id : null;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-insumo');
                GR.Toast.success('Insumo atualizado!');
                GR.State.adicionarHistorico('editou insumo', 'Viveiro', 'Insumo: ' + nome);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            dados.dataCriacao = GR.Utils.now();
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-insumo');
                GR.Toast.success('Insumo cadastrado!');
                GR.State.adicionarHistorico('criou insumo', 'Viveiro', 'Insumo: ' + nome);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    // ================================================================
    // ABRIR MODAL SERVICO - COM FILTRO DE PROPRIEDADE
    // ================================================================
    abrirModalServico: function(editId) {
        GR.State.ui.viveiroEditando = { tipo: 'servico', id: editId || null };
        
        // 🔥 ATUALIZA O SELECT DE PROPRIEDADE COM AS PERMITIDAS
        GR.UI._atualizarSelectsPropriedade();

        var titleEl = document.getElementById('modal-viveiro-servico-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Serviço' : '🛠️ Novo Serviço';
        
        document.getElementById('viveiro-servico-desc').value = '';
        document.getElementById('viveiro-servico-data').value = new Date().toISOString().split('T')[0];
        document.getElementById('viveiro-servico-responsavel').value = '';
        document.getElementById('viveiro-servico-custo').value = '0,00';
        document.getElementById('viveiro-servico-status').value = 'Pendente';
        document.getElementById('viveiro-servico-obs').value = '';
        document.getElementById('viveiro-servico-propriedade').value = GR.State.ui.propriedadeAtiva || '';

        if (editId) {
            var item = GR.State.data.viveiroServicos.find(function(s) { return s.id === editId; });
            if (item) {
                document.getElementById('viveiro-servico-desc').value = item.descricao || '';
                document.getElementById('viveiro-servico-data').value = item.data || '';
                document.getElementById('viveiro-servico-responsavel').value = item.responsavel || '';
                document.getElementById('viveiro-servico-custo').value = GR.Utils.formatarMoedaSemSimbolo(item.custo || 0);
                document.getElementById('viveiro-servico-status').value = item.status || 'Pendente';
                document.getElementById('viveiro-servico-propriedade').value = item.propriedade || '';
                document.getElementById('viveiro-servico-obs').value = item.obs || '';
            }
        }
        GR.Modal.open('modal-viveiro-servico');
    },

    // ================================================================
    // SALVAR SERVICO
    // ================================================================
    salvarServico: function() {
        var descricao = document.getElementById('viveiro-servico-desc').value.trim();
        var data = document.getElementById('viveiro-servico-data').value;
        var responsavel = document.getElementById('viveiro-servico-responsavel').value.trim();
        var custo = GR.Utils.parseMoedaBR(document.getElementById('viveiro-servico-custo').value);
        var status = document.getElementById('viveiro-servico-status').value;
        var propriedade = document.getElementById('viveiro-servico-propriedade').value;
        var obs = document.getElementById('viveiro-servico-obs').value.trim();

        if (!descricao || !data || !responsavel) {
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
            responsavel: GR.Utils.escapeHtml(responsavel),
            custo: custo || 0,
            status: status || 'Pendente',
            propriedade: GR.Utils.escapeHtml(propriedade),
            obs: GR.Utils.escapeHtml(obs),
            dataAtualizacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroServicos');
        var editId = GR.State.ui.viveiroEditando ? GR.State.ui.viveiroEditando.id : null;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-servico');
                GR.Toast.success('Serviço atualizado!');
                GR.State.adicionarHistorico('editou serviço', 'Viveiro', 'Serviço: ' + descricao);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            dados.dataCriacao = GR.Utils.now();
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-servico');
                GR.Toast.success('Serviço cadastrado!');
                GR.State.adicionarHistorico('criou serviço', 'Viveiro', 'Serviço: ' + descricao);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    // ================================================================
    // ABRIR MODAL TRABALHADOR - COM FILTRO DE PROPRIEDADE
    // ================================================================
    abrirModalTrabalhador: function(editId) {
        GR.State.ui.viveiroEditando = { tipo: 'trabalhador', id: editId || null };
        
        // 🔥 ATUALIZA O SELECT DE PROPRIEDADE COM AS PERMITIDAS
        GR.UI._atualizarSelectsPropriedade();

        var titleEl = document.getElementById('modal-viveiro-trabalhador-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Trabalhador' : '👤 Novo Trabalhador';
        
        document.getElementById('viveiro-trabalhador-nome').value = '';
        document.getElementById('viveiro-trabalhador-cpf').value = '';
        document.getElementById('viveiro-trabalhador-funcao').value = '';
        document.getElementById('viveiro-trabalhador-ddd').value = '';
        document.getElementById('viveiro-trabalhador-tel').value = '';
        document.getElementById('viveiro-trabalhador-admissao').value = '';
        document.getElementById('viveiro-trabalhador-propriedade').value = GR.State.ui.propriedadeAtiva || '';

        if (editId) {
            var item = GR.State.data.viveiroTrabalhadores.find(function(t) { return t.id === editId; });
            if (item) {
                document.getElementById('viveiro-trabalhador-nome').value = item.nome || '';
                document.getElementById('viveiro-trabalhador-cpf').value = item.cpf || '';
                document.getElementById('viveiro-trabalhador-funcao').value = item.funcao || '';
                document.getElementById('viveiro-trabalhador-ddd').value = item.telefone?.ddd || '';
                document.getElementById('viveiro-trabalhador-tel').value = item.telefone?.numero || '';
                document.getElementById('viveiro-trabalhador-admissao').value = item.admissao || '';
                document.getElementById('viveiro-trabalhador-propriedade').value = item.propriedade || '';
            }
        }
        GR.Modal.open('modal-viveiro-trabalhador');
    },

    // ================================================================
    // SALVAR TRABALHADOR
    // ================================================================
    salvarTrabalhador: function() {
        var nome = document.getElementById('viveiro-trabalhador-nome').value.trim();
        var cpf = document.getElementById('viveiro-trabalhador-cpf').value.trim();
        var funcao = document.getElementById('viveiro-trabalhador-funcao').value.trim();
        var ddd = document.getElementById('viveiro-trabalhador-ddd').value.trim();
        var tel = document.getElementById('viveiro-trabalhador-tel').value.trim();
        var admissao = document.getElementById('viveiro-trabalhador-admissao').value;
        var propriedade = document.getElementById('viveiro-trabalhador-propriedade').value;

        if (!nome) {
            GR.Toast.error('Nome é obrigatório!');
            return;
        }
        if (cpf && !GR.Utils.validarCPF(cpf)) {
            GR.Toast.error('CPF inválido!');
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
            cpf: cpf || '',
            funcao: GR.Utils.escapeHtml(funcao),
            telefone: (ddd || tel) ? { ddd: ddd, numero: tel } : null,
            admissao: admissao || '',
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataAtualizacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('viveiroTrabalhadores');
        var editId = GR.State.ui.viveiroEditando ? GR.State.ui.viveiroEditando.id : null;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-viveiro-trabalhador');
                GR.Toast.success('Trabalhador atualizado!');
                GR.State.adicionarHistorico('editou trabalhador', 'Viveiro', 'Trabalhador: ' + nome);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            dados.dataCriacao = GR.Utils.now();
            ref.add(dados).then(function() {
                GR.Modal.close('modal-viveiro-trabalhador');
                GR.Toast.success('Trabalhador cadastrado!');
                GR.State.adicionarHistorico('criou trabalhador', 'Viveiro', 'Trabalhador: ' + nome);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    // ================================================================
    // EXCLUIR
    // ================================================================
    excluir: function(tipo, id) {
        if (!confirm('Excluir este item do viveiro?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        var colecaoMap = {
            'muda': 'viveiroMudas',
            'insumo': 'viveiroInsumos',
            'servico': 'viveiroServicos',
            'trabalhador': 'viveiroTrabalhadores'
        };
        var colecao = colecaoMap[tipo];
        if (!colecao) return;

        db.collection('users').doc(uid).collection(colecao).doc(id).delete()
            .then(function() {
                GR.Toast.success('Item excluído!');
                GR.State.adicionarHistorico('excluiu item viveiro', 'Viveiro', 'Tipo: ' + tipo);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // 🆕 EXPORTAR DADOS
    // ================================================================
    exportarDados: function() {
        try {
            var mudas = GR.State.filtrarPorPropriedade(GR.State.data.viveiroMudas || [], 'propriedade');
            var insumos = GR.State.filtrarPorPropriedade(GR.State.data.viveiroInsumos || [], 'propriedade');
            var servicos = GR.State.filtrarPorPropriedade(GR.State.data.viveiroServicos || [], 'propriedade');
            var trabalhadores = GR.State.filtrarPorPropriedade(GR.State.data.viveiroTrabalhadores || [], 'propriedade');

            var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
            if (propAtiva !== 'todas') {
                mudas = mudas.filter(function(item) { return item.propriedade === propAtiva; });
                insumos = insumos.filter(function(item) { return item.propriedade === propAtiva; });
                servicos = servicos.filter(function(item) { return item.propriedade === propAtiva; });
                trabalhadores = trabalhadores.filter(function(item) { return item.propriedade === propAtiva; });
            }

            var dados = {
                exportadoEm: new Date().toISOString(),
                propriedadeAtiva: propAtiva,
                mudas: mudas,
                insumos: insumos,
                servicos: servicos,
                trabalhadores: trabalhadores,
                resumo: {
                    totalMudas: mudas.length,
                    totalInsumos: insumos.length,
                    totalServicos: servicos.length,
                    totalTrabalhadores: trabalhadores.length,
                    totalMudasQtd: mudas.reduce(function(sum, m) { return sum + (m.quantidade || 0); }, 0)
                }
            };

            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'viveiro_export_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);

            GR.Toast.success('✅ Dados do viveiro exportados!');
        } catch (e) {
            GR.Toast.error('Erro ao exportar: ' + e.message);
        }
    }
};

console.log('✅ Módulo Viveiro carregado com filtro de propriedade!');