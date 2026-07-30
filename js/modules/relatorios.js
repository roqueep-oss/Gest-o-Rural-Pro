// ================================================================
// MÓDULO: RELATÓRIOS - COMPLETO COM FILTRO DE PROPRIEDADE
// ================================================================

GR.Modules.Relatorios = {
    // ================================================================
    // RENDER PRINCIPAL - COM FILTRO DE PROPRIEDADE
    // ================================================================
    render: function() {
        var div = document.getElementById('relatorios-content');
        if (!div) return;

        // 🔥 MOSTRA A PROPRIEDADE ATIVA NO TOPO
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        var propDisplay = propAtiva === 'todas' ? 'Todas as Propriedades' : '📍 ' + propAtiva;
        
        var html = `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;padding:8px 12px;background:var(--bg);border-radius:4px;border:1px solid var(--border);">
                <span style="font-size:13px;font-weight:600;">📈 Relatórios</span>
                <span style="font-size:11px;color:var(--text-light);">${propDisplay}</span>
                <button class="btn btn-sm btn-secondary" onclick="GR.Modules.Relatorios._alternarPropriedade()" style="font-size:10px;">
                    ${propAtiva === 'todas' ? '🔍 Filtrar por propriedade' : '🌍 Todas as propriedades'}
                </button>
            </div>
        `;

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">';

        var relatorios = [
            { id: 'resumo-geral', icon: '📊', label: 'Resumo Geral', desc: 'Visão completa do sistema' },
            { id: 'financeiro', icon: '💰', label: 'Financeiro', desc: 'Receitas, despesas e fluxo de caixa' },
            { id: 'estoque', icon: '📦', label: 'Estoque', desc: 'Insumos, produtos e alertas' },
            { id: 'pecuaria', icon: '🐄', label: 'Pecuária', desc: 'Rebanho, sanidade e produção' },
            { id: 'viveiro', icon: '🌱', label: 'Viveiro', desc: 'Mudas, insumos e serviços' },
            { id: 'documentos', icon: '📁', label: 'Documentos', desc: 'Documentos e arquivos' },
            { id: 'analises', icon: '🧪', label: 'Análises', desc: 'Análises de solo e folha' },
            { id: 'tarefas', icon: '✅', label: 'Tarefas', desc: 'Tarefas e produtividade' },
            { id: 'funcionarios', icon: '👨‍🌾', label: 'Funcionários', desc: 'Equipe e folha de pagamento' },
            { id: 'contratos', icon: '📋', label: 'Contratos', desc: 'Parceiros e contratos' },
            { id: 'orcamentos', icon: '📄', label: 'Orçamentos', desc: 'Cotações e compras' }
        ];

        relatorios.forEach(function(r) {
            html += '<div class="card" style="cursor:pointer;padding:12px;text-align:center;transition:all 0.2s;" onclick="GR.Modules.Relatorios.gerar(\'' + r.id + '\')" onmouseover="this.style.transform=\'scale(1.02)\';this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.15)\';" onmouseout="this.style.transform=\'scale(1)\';this.style.boxShadow=\'none\';">' +
                '<div style="font-size:32px;">' + r.icon + '</div>' +
                '<div style="font-weight:600;font-size:13px;margin:4px 0;">' + r.label + '</div>' +
                '<div style="font-size:11px;color:var(--text-light);">' + r.desc + '</div>' +
                '</div>';
        });

        html += '</div>';
        html += '<div id="relatorio-resultado" style="margin-top:15px;padding:12px;background:var(--surface);border-radius:8px;border:1px solid var(--border);display:none;"></div>';

        // 🔥 BOTÃO DE EXPORTAÇÃO
        html += `
            <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">
                <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Relatorios.exportarCSV()" style="font-size:11px;">📊 Exportar CSV</button>
                <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Relatorios.exportarJSON()" style="font-size:11px;">📋 Exportar JSON</button>
                <button class="btn btn-secondary btn-sm" onclick="GR.Modules.Relatorios.gerarPDFCompleto()" style="font-size:11px;">📄 Gerar PDF Completo</button>
            </div>
        `;

        div.innerHTML = html;
        
        console.log('📈 Relatórios carregados - Propriedade ativa:', propAtiva);
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
        
        // Se estiver em 'todas', vai para a primeira propriedade
        if (propAtual === 'todas' && props.length > 0) {
            GR.State.ui.propriedadeAtiva = props[0];
            GR.Toast.info('📍 Filtrando por: ' + props[0]);
        } else {
            // Alterna para a próxima propriedade
            var index = props.indexOf(propAtual);
            if (index === -1 || index === props.length - 1) {
                GR.State.ui.propriedadeAtiva = 'todas';
                GR.Toast.info('🌍 Mostrando todas as propriedades');
            } else {
                GR.State.ui.propriedadeAtiva = props[index + 1];
                GR.Toast.info('📍 Filtrando por: ' + props[index + 1]);
            }
        }
        
        // Atualiza a UI
        GR.UI.atualizarPropTabs();
        this.render();
        GR.UI.refreshCurrentView();
    },

    // ================================================================
    // GERAR RELATÓRIO - COM FILTRO DE PROPRIEDADE
    // ================================================================
    gerar: function(tipo) {
        var div = document.getElementById('relatorio-resultado');
        if (!div) return;
        div.style.display = 'block';

        // 🔥 OBTÉM DADOS FILTRADOS POR PROPRIEDADE
        var data = this._getDadosFiltrados();

        var html = '<h4 style="font-size:14px;">📊 ' + this._getTituloRelatorio(tipo) + '</h4>';
        html += '<div style="font-size:12px;color:var(--text-light);">Gerado em: ' + new Date().toLocaleString() + '</div>';
        
        // 🔥 MOSTRA O FILTRO ATIVO
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        html += '<div style="font-size:11px;color:var(--text-light);margin-bottom:8px;">📍 Filtro: ' + (propAtiva === 'todas' ? 'Todas as propriedades' : propAtiva) + '</div>';

        var dados = {};
        var totalizadores = {};

        switch (tipo) {
            case 'resumo-geral':
                dados = {
                    'Total de Propriedades': (data.propriedades || []).length,
                    'Total de Tarefas': (data.tarefas || []).length,
                    'Total de Documentos': (data.documentos || []).length,
                    'Total de Análises': (data.analises || []).length,
                    'Mudas no Viveiro': (data.viveiroMudas || []).length,
                    'Funcionários': (data.funcionarios || []).length,
                    'Receitas': (data.receitas || []).length,
                    'Despesas': (data.despesas || []).length,
                    'Animais': (data.animais || []).length,
                    'Parceiros': (data.parceiros || []).length,
                    'Orçamentos': (data.orcamentos || []).length
                };
                break;

            case 'financeiro':
                var receitas = data.receitas || [];
                var despesas = data.despesas || [];
                var totalReceitas = receitas.reduce(function(sum, r) { return sum + (r.valor || 0); }, 0);
                var totalDespesas = despesas.reduce(function(sum, d) { return sum + (d.valor || 0); }, 0);
                var saldo = totalReceitas - totalDespesas;
                
                dados = {
                    'Total Receitas': GR.Utils.formatarMoedaBR(totalReceitas),
                    'Total Despesas': GR.Utils.formatarMoedaBR(totalDespesas),
                    'Saldo': GR.Utils.formatarMoedaBR(saldo),
                    'Quantidade Receitas': receitas.length,
                    'Quantidade Despesas': despesas.length,
                    'Média Receitas': receitas.length > 0 ? GR.Utils.formatarMoedaBR(totalReceitas / receitas.length) : 'R$ 0,00',
                    'Média Despesas': despesas.length > 0 ? GR.Utils.formatarMoedaBR(totalDespesas / despesas.length) : 'R$ 0,00'
                };
                totalizadores = {
                    '💰 Saldo Total': saldo
                };
                break;

            case 'estoque':
                var insumos = data.insumos || [];
                var totalInsumos = insumos.length;
                var alertaEstoque = insumos.filter(function(i) { return (i.quantidade || 0) < 5; });
                var vencidos = insumos.filter(function(i) { 
                    if (!i.validade) return false;
                    return new Date(i.validade) < new Date();
                });
                var valorTotalEstoque = insumos.reduce(function(sum, i) {
                    return sum + ((i.quantidade || 0) * (i.preco || 0));
                }, 0);
                
                var categorias = {};
                insumos.forEach(function(i) {
                    var cat = i.categoria || 'Outros';
                    categorias[cat] = (categorias[cat] || 0) + 1;
                });
                
                dados = {
                    'Total Insumos': totalInsumos,
                    'Insumos em Alerta (estoque < 5)': alertaEstoque.length,
                    'Insumos Vencidos': vencidos.length,
                    'Valor Total do Estoque': GR.Utils.formatarMoedaBR(valorTotalEstoque),
                    'Categorias': Object.keys(categorias).length,
                    'Detalhamento': Object.entries(categorias).map(function(e) { return e[0] + ': ' + e[1]; }).join(' | ')
                };
                totalizadores = {
                    '📦 Valor Estoque': valorTotalEstoque
                };
                break;

            case 'pecuaria':
                var animais = data.animais || [];
                var totalAnimais = animais.length;
                var porEspecie = {};
                var porStatus = {};
                var machos = 0, femeas = 0;
                var prenhes = 0;
                
                animais.forEach(function(a) {
                    var especie = a.especie || a.raca || 'Outros';
                    porEspecie[especie] = (porEspecie[especie] || 0) + 1;
                    
                    var status = a.status || 'Ativo';
                    porStatus[status] = (porStatus[status] || 0) + 1;
                    
                    if (a.sexo === 'Macho') machos++;
                    else if (a.sexo === 'Fêmea') femeas++;
                    
                    if (a.prenha) prenhes++;
                });
                
                var valorTotalRebanho = animais.reduce(function(sum, a) { return sum + (a.valor || 0); }, 0);
                
                dados = {
                    'Total Animais': totalAnimais,
                    'Machos': machos,
                    'Fêmeas': femeas,
                    'Prenhes': prenhes,
                    'Espécies': Object.keys(porEspecie).length,
                    'Status': Object.keys(porStatus).length,
                    'Valor Total do Rebanho': GR.Utils.formatarMoedaBR(valorTotalRebanho),
                    'Detalhamento Espécies': Object.entries(porEspecie).map(function(e) { return e[0] + ': ' + e[1]; }).join(' | ')
                };
                totalizadores = {
                    '🐄 Valor Total Rebanho': valorTotalRebanho
                };
                break;

            case 'viveiro':
                var mudas = data.viveiroMudas || [];
                var insumosViveiro = data.viveiroInsumos || [];
                var servicosViveiro = data.viveiroServicos || [];
                var trabalhadoresViveiro = data.viveiroTrabalhadores || [];
                var totalMudas = mudas.reduce(function(sum, m) { return sum + (m.quantidade || 0); }, 0);
                var servicosConcluidos = servicosViveiro.filter(function(s) { return s.status === 'Concluído'; });
                var servicosPendentes = servicosViveiro.filter(function(s) { return s.status !== 'Concluído'; });
                
                var porEspecieMuda = {};
                mudas.forEach(function(m) {
                    var esp = m.especie || 'Outros';
                    porEspecieMuda[esp] = (porEspecieMuda[esp] || 0) + (m.quantidade || 0);
                });
                
                dados = {
                    'Total Mudas': totalMudas,
                    'Espécies de Mudas': mudas.length,
                    'Insumos em Estoque': insumosViveiro.length,
                    'Serviços Pendentes': servicosPendentes.length,
                    'Serviços Concluídos': servicosConcluidos.length,
                    'Trabalhadores': trabalhadoresViveiro.length,
                    'Detalhamento Mudas': Object.entries(porEspecieMuda).map(function(e) { return e[0] + ': ' + e[1]; }).join(' | ')
                };
                totalizadores = {
                    '🌱 Total de Mudas': totalMudas
                };
                break;

            case 'documentos':
                var documentos = data.documentos || [];
                var porTipo = {};
                var comArquivo = 0;
                documentos.forEach(function(d) {
                    var tipo = d.tipo || 'Outros';
                    porTipo[tipo] = (porTipo[tipo] || 0) + 1;
                    if (d.arquivoUrl) comArquivo++;
                });
                dados = {
                    'Total Documentos': documentos.length,
                    'Tipos': Object.keys(porTipo).length,
                    'Com Arquivo Anexado': comArquivo,
                    'Sem Arquivo': documentos.length - comArquivo,
                    'Detalhamento': Object.entries(porTipo).map(function(e) { return e[0] + ': ' + e[1]; }).join(' | ')
                };
                break;

            case 'analises':
                var analises = data.analises || [];
                var porTipoAnalise = {};
                var porStatusAnalise = {};
                var totalElementos = 0;
                var precisamCorrecao = 0;
                
                analises.forEach(function(a) {
                    var tipo = a.tipo || 'solo';
                    porTipoAnalise[tipo] = (porTipoAnalise[tipo] || 0) + 1;
                    
                    var status = a.status || 'Equilibrado';
                    porStatusAnalise[status] = (porStatusAnalise[status] || 0) + 1;
                    
                    if (a.elementos) {
                        totalElementos += Object.keys(a.elementos).length;
                    }
                    if (a.status === 'Correção Necessária') precisamCorrecao++;
                });
                
                dados = {
                    'Total Análises': analises.length,
                    'Análises de Solo': porTipoAnalise.solo || 0,
                    'Análises de Folha': porTipoAnalise.folha || 0,
                    'Correção Necessária': precisamCorrecao,
                    'Equilibradas': porStatusAnalise.Equilibrado || 0,
                    'Média de Elementos': analises.length > 0 ? (totalElementos / analises.length).toFixed(1) : 0
                };
                break;

            case 'tarefas':
                var tarefas = data.tarefas || [];
                var porStatusTarefa = {};
                var porPrioridade = {};
                var porCategoria = {};
                
                tarefas.forEach(function(t) {
                    var status = t.status || 'Pendente';
                    porStatusTarefa[status] = (porStatusTarefa[status] || 0) + 1;
                    
                    var prioridade = t.prioridade || 'Média';
                    porPrioridade[prioridade] = (porPrioridade[prioridade] || 0) + 1;
                    
                    var categoria = t.categoria || 'Geral';
                    porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;
                });
                
                var atrasadas = tarefas.filter(function(t) {
                    if (!t.dataLimite || t.status === 'Concluída') return false;
                    return new Date(t.dataLimite) < new Date();
                });
                
                dados = {
                    'Total Tarefas': tarefas.length,
                    'Pendentes': porStatusTarefa.Pendente || 0,
                    'Em Andamento': porStatusTarefa['Em Andamento'] || 0,
                    'Concluídas': porStatusTarefa.Concluída || 0,
                    'Atrasadas': atrasadas.length,
                    'Prioridade Alta': porPrioridade.Alta || 0,
                    'Prioridade Média': porPrioridade.Média || 0,
                    'Prioridade Baixa': porPrioridade.Baixa || 0
                };
                break;

            case 'funcionarios':
                var funcionarios = data.funcionarios || [];
                var porStatusFunc = {};
                var porCargo = {};
                var totalSalarios = 0;
                
                funcionarios.forEach(function(f) {
                    var status = f.status || 'Ativo';
                    porStatusFunc[status] = (porStatusFunc[status] || 0) + 1;
                    
                    var cargo = f.cargo || 'Outros';
                    porCargo[cargo] = (porCargo[cargo] || 0) + 1;
                    
                    totalSalarios += (f.salario || 0);
                });
                
                dados = {
                    'Total Funcionários': funcionarios.length,
                    'Ativos': porStatusFunc.Ativo || 0,
                    'Férias': porStatusFunc['Férias'] || 0,
                    'Afastados': porStatusFunc.Afastado || 0,
                    'Desligados': porStatusFunc.Desligado || 0,
                    'Total Folha Salarial': GR.Utils.formatarMoedaBR(totalSalarios),
                    'Média Salarial': funcionarios.length > 0 ? GR.Utils.formatarMoedaBR(totalSalarios / funcionarios.length) : 'R$ 0,00',
                    'Cargos': Object.keys(porCargo).length
                };
                totalizadores = {
                    '👨‍🌾 Total Funcionários': funcionarios.length
                };
                break;

            case 'contratos':
                var parceiros = data.parceiros || [];
                var porTipoContrato = {};
                var totalContratos = parceiros.length;
                var vigentes = 0;
                var vencidos = 0;
                var vencendoBreve = 0;
                var hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                
                parceiros.forEach(function(p) {
                    var tipo = p.tipo || 'Outros';
                    porTipoContrato[tipo] = (porTipoContrato[tipo] || 0) + 1;
                    
                    if (p.dataFim) {
                        var dataFim = new Date(p.dataFim);
                        dataFim.setHours(0, 0, 0, 0);
                        if (dataFim < hoje) vencidos++;
                        else if (dataFim - hoje < 30 * 24 * 60 * 60 * 1000) vencendoBreve++;
                        else vigentes++;
                    } else {
                        vigentes++;
                    }
                });
                
                dados = {
                    'Total Contratos': totalContratos,
                    'Vigentes': vigentes,
                    'Vencendo em Breve (< 30 dias)': vencendoBreve,
                    'Vencidos': vencidos,
                    'Tipos': Object.keys(porTipoContrato).length,
                    'Detalhamento': Object.entries(porTipoContrato).map(function(e) { return e[0] + ': ' + e[1]; }).join(' | ')
                };
                break;

            case 'orcamentos':
                var orcamentos = data.orcamentos || [];
                var porStatusOrc = {};
                var totalValorOrc = 0;
                
                orcamentos.forEach(function(o) {
                    var status = o.status || 'Pendente';
                    porStatusOrc[status] = (porStatusOrc[status] || 0) + 1;
                    totalValorOrc += (o.valorTotal || o.valor || 0);
                });
                
                dados = {
                    'Total Orçamentos': orcamentos.length,
                    'Aprovados': porStatusOrc.Aprovado || 0,
                    'Pendentes': porStatusOrc.Pendente || 0,
                    'Em Análise': porStatusOrc['Em análise'] || 0,
                    'Recusados': porStatusOrc.Recusado || 0,
                    'Valor Total Cotações': GR.Utils.formatarMoedaBR(totalValorOrc),
                    'Média por Cotação': orcamentos.length > 0 ? GR.Utils.formatarMoedaBR(totalValorOrc / orcamentos.length) : 'R$ 0,00'
                };
                totalizadores = {
                    '📄 Total Orçamentos': orcamentos.length
                };
                break;

            default:
                dados = { 'Mensagem': 'Relatório não disponível' };
        }

        // 🔥 EXIBE OS DADOS
        html += '<div style="margin-top:10px;">';
        for (var key in dados) {
            var valor = dados[key];
            var isDestaque = false;
            
            // Destaca valores importantes
            if (typeof valor === 'string' && valor.includes('R$')) {
                isDestaque = true;
            }
            if (typeof valor === 'number' && valor > 0 && (key.includes('Total') || key.includes('Saldo'))) {
                isDestaque = true;
            }
            
            html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;' + 
                (isDestaque ? 'background:var(--bg);padding:6px 8px;border-radius:4px;' : '') + '">' +
                '<span style="font-weight:500;">' + key + '</span>' +
                '<span style="' + (isDestaque ? 'font-weight:700;color:var(--primary);' : '') + '">' + valor + '</span>' +
                '</div>';
        }
        html += '</div>';

        // 🔥 TOTALIZADORES EM DESTAQUE
        if (Object.keys(totalizadores).length > 0) {
            html += '<div style="margin-top:10px;padding:8px;background:var(--primary-light);border-radius:4px;display:flex;flex-wrap:wrap;gap:12px;">';
            for (var key in totalizadores) {
                html += '<div style="font-size:13px;font-weight:600;">' + key + ': <span style="color:var(--primary-dark);">' + 
                    (typeof totalizadores[key] === 'number' ? GR.Utils.formatarMoedaBR(totalizadores[key]) : totalizadores[key]) + 
                    '</span></div>';
            }
            html += '</div>';
        }

        // 🔥 BOTÕES DE AÇÃO
        html += '<div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary btn-sm" onclick="window.print()">🖨️ Imprimir</button>' +
            '<button class="btn btn-secondary btn-sm" onclick="GR.Modules.Relatorios._copiarRelatorio()">📋 Copiar</button>' +
            '<button class="btn btn-secondary btn-sm" onclick="GR.Modules.Relatorios._exportarRelatorioCSV(\'' + tipo + '\')">📊 Exportar CSV</button>' +
            '</div>';

        div.innerHTML = html;
        
        // Guarda os dados para exportação
        window._ultimoRelatorio = {
            tipo: tipo,
            dados: dados,
            totalizadores: totalizadores,
            titulo: this._getTituloRelatorio(tipo)
        };
    },

    // ================================================================
    // 🆕 FUNÇÃO PARA OBTER DADOS FILTRADOS
    // ================================================================
    _getDadosFiltrados: function() {
        var data = {};
        var colecoes = [
            'propriedades', 'tarefas', 'documentos', 'analises', 
            'receitas', 'despesas', 'insumos', 'funcionarios',
            'animais', 'parceiros', 'contratos', 'orcamentos',
            'viveiroMudas', 'viveiroInsumos', 'viveiroServicos', 'viveiroTrabalhadores'
        ];

        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';

        colecoes.forEach(function(col) {
            var items = GR.State.data[col] || [];
            
            // 🔥 APLICA O FILTRO DE PROPRIEDADE
            var filtrados = GR.State.filtrarPorPropriedade(items, 'propriedade');
            
            // 🔥 APLICA O FILTRO DA ABA ATIVA
            if (propAtiva !== 'todas') {
                filtrados = filtrados.filter(function(item) {
                    return item.propriedade === propAtiva;
                });
            }
            
            data[col] = filtrados;
        });

        // Propriedades não precisa de filtro
        data.propriedades = GR.State.data.propriedades || [];

        return data;
    },

    // ================================================================
    // 🆕 TÍTULOS DOS RELATÓRIOS
    // ================================================================
    _getTituloRelatorio: function(tipo) {
        var titulos = {
            'resumo-geral': '📊 Resumo Geral do Sistema',
            'financeiro': '💰 Relatório Financeiro',
            'estoque': '📦 Relatório de Estoque',
            'pecuaria': '🐄 Relatório da Pecuária',
            'viveiro': '🌱 Relatório do Viveiro',
            'documentos': '📁 Relatório de Documentos',
            'analises': '🧪 Relatório de Análises',
            'tarefas': '✅ Relatório de Tarefas',
            'funcionarios': '👨‍🌾 Relatório de Funcionários',
            'contratos': '📋 Relatório de Contratos',
            'orcamentos': '📄 Relatório de Orçamentos'
        };
        return titulos[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
    },

    // ================================================================
    // 🆕 COPIAR RELATÓRIO
    // ================================================================
    _copiarRelatorio: function() {
        var div = document.getElementById('relatorio-resultado');
        if (!div) return;

        var texto = '';
        var elementos = div.querySelectorAll('div[style*="display:flex;justify-content:space-between"]');
        elementos.forEach(function(el) {
            var spans = el.querySelectorAll('span');
            if (spans.length === 2) {
                texto += spans[0].textContent + ': ' + spans[1].textContent + '\n';
            }
        });

        if (texto) {
            navigator.clipboard.writeText(texto)
                .then(function() {
                    GR.Toast.success('✅ Relatório copiado!');
                })
                .catch(function() {
                    var textarea = document.createElement('textarea');
                    textarea.value = texto;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    GR.Toast.success('✅ Relatório copiado!');
                });
        }
    },

    // ================================================================
    // 🆕 EXPORTAR RELATÓRIO COMO CSV
    // ================================================================
    _exportarRelatorioCSV: function(tipo) {
        var relatorio = window._ultimoRelatorio;
        if (!relatorio || relatorio.tipo !== tipo) {
            GR.Toast.warning('⚠️ Gere o relatório primeiro!');
            return;
        }

        try {
            var csv = 'Indicador,Valor\n';
            for (var key in relatorio.dados) {
                var valor = relatorio.dados[key];
                if (typeof valor === 'string' && valor.includes(',')) {
                    valor = '"' + valor + '"';
                }
                csv += key + ',' + valor + '\n';
            }
            
            // Adiciona totalizadores
            if (relatorio.totalizadores && Object.keys(relatorio.totalizadores).length > 0) {
                csv += '\nTotalizadores\n';
                for (var key in relatorio.totalizadores) {
                    var valor = relatorio.totalizadores[key];
                    if (typeof valor === 'number') {
                        valor = 'R$ ' + valor.toFixed(2);
                    }
                    if (typeof valor === 'string' && valor.includes(',')) {
                        valor = '"' + valor + '"';
                    }
                    csv += key + ',' + valor + '\n';
                }
            }

            var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'relatorio_' + tipo + '_' + new Date().toISOString().slice(0, 10) + '.csv';
            a.click();
            URL.revokeObjectURL(url);
            
            GR.Toast.success('✅ CSV exportado!');
        } catch (e) {
            GR.Toast.error('Erro ao exportar CSV: ' + e.message);
        }
    },

    // ================================================================
    // 🆕 EXPORTAR RELATÓRIO COMO JSON
    // ================================================================
    _exportarRelatorioJSON: function() {
        var relatorio = window._ultimoRelatorio;
        if (!relatorio) {
            GR.Toast.warning('⚠️ Gere um relatório primeiro!');
            return;
        }

        try {
            var dados = {
                exportadoEm: new Date().toISOString(),
                propriedadeAtiva: GR.State.ui.propriedadeAtiva || 'todas',
                tipo: relatorio.tipo,
                titulo: relatorio.titulo,
                indicadores: relatorio.dados,
                totalizadores: relatorio.totalizadores || {}
            };

            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'relatorio_' + relatorio.tipo + '_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            
            GR.Toast.success('✅ JSON exportado!');
        } catch (e) {
            GR.Toast.error('Erro ao exportar JSON: ' + e.message);
        }
    },

    // ================================================================
    // 🆕 EXPORTAR CSV GLOBAL
    // ================================================================
    exportarCSV: function() {
        var relatorio = window._ultimoRelatorio;
        if (!relatorio) {
            GR.Toast.warning('⚠️ Gere um relatório primeiro!');
            return;
        }
        this._exportarRelatorioCSV(relatorio.tipo);
    },

    // ================================================================
    // 🆕 EXPORTAR JSON GLOBAL
    // ================================================================
    exportarJSON: function() {
        this._exportarRelatorioJSON();
    },

    // ================================================================
    // 🆕 GERAR PDF COMPLETO
    // ================================================================
    gerarPDFCompleto: function() {
        var relatorio = window._ultimoRelatorio;
        if (!relatorio) {
            GR.Toast.warning('⚠️ Gere um relatório primeiro!');
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
                    GR.Modules.Relatorios._gerarPDFRelatorio(relatorio);
                };
                document.head.appendChild(script2);
            };
            document.head.appendChild(script);
        } else {
            this._gerarPDFRelatorio(relatorio);
        }
    },

    _gerarPDFRelatorio: function(relatorio) {
        try {
            var { jsPDF } = window.jspdf;
            var doc = new jsPDF('p', 'mm', 'a4');
            var pageWidth = doc.internal.pageSize.getWidth();
            var margin = 15;
            var y = margin;

            // Cabeçalho
            doc.setFontSize(20);
            doc.setTextColor(46, 125, 50);
            doc.setFont('helvetica', 'bold');
            doc.text('📊 ' + relatorio.titulo, pageWidth / 2, y, { align: 'center' });
            y += 8;

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            var dataGeracao = new Date().toLocaleString('pt-BR');
            doc.text('Gerado em: ' + dataGeracao, pageWidth / 2, y, { align: 'center' });
            y += 6;

            var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
            doc.text('📍 Filtro: ' + (propAtiva === 'todas' ? 'Todas as propriedades' : propAtiva), pageWidth / 2, y, { align: 'center' });
            y += 8;

            doc.setDrawColor(46, 125, 50);
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;

            // Dados
            doc.setFontSize(11);
            doc.setTextColor(50, 50, 50);
            doc.setFont('helvetica', 'normal');

            var dadosArray = [];
            for (var key in relatorio.dados) {
                dadosArray.push([key, String(relatorio.dados[key])]);
            }

            if (dadosArray.length > 0) {
                doc.autoTable({
                    startY: y,
                    head: [['Indicador', 'Valor']],
                    body: dadosArray,
                    theme: 'striped',
                    headStyles: {
                        fillColor: [46, 125, 50],
                        textColor: [255, 255, 255],
                        fontSize: 10,
                        fontStyle: 'bold'
                    },
                    bodyStyles: {
                        fontSize: 9
                    },
                    columnStyles: {
                        0: { cellWidth: 100 },
                        1: { cellWidth: 60, halign: 'right' }
                    },
                    margin: { left: margin, right: margin }
                });

                y = doc.lastAutoTable.finalY + 8;
            }

            // Totalizadores
            if (relatorio.totalizadores && Object.keys(relatorio.totalizadores).length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(46, 125, 50);
                doc.setFont('helvetica', 'bold');
                doc.text('📌 Totalizadores', margin, y);
                y += 6;

                doc.setFontSize(10);
                doc.setTextColor(50, 50, 50);
                doc.setFont('helvetica', 'normal');

                var totalArray = [];
                for (var key in relatorio.totalizadores) {
                    var valor = relatorio.totalizadores[key];
                    if (typeof valor === 'number') {
                        valor = 'R$ ' + valor.toFixed(2);
                    }
                    totalArray.push([key, String(valor)]);
                }

                if (totalArray.length > 0) {
                    doc.autoTable({
                        startY: y,
                        head: [['Totalizador', 'Valor']],
                        body: totalArray,
                        theme: 'plain',
                        headStyles: {
                            fillColor: [255, 193, 7],
                            textColor: [0, 0, 0],
                            fontSize: 10,
                            fontStyle: 'bold'
                        },
                        bodyStyles: {
                            fontSize: 9
                        },
                        columnStyles: {
                            0: { cellWidth: 100 },
                            1: { cellWidth: 60, halign: 'right' }
                        },
                        margin: { left: margin, right: margin }
                    });

                    y = doc.lastAutoTable.finalY + 8;
                }
            }

            // Rodapé
            var docY = doc.internal.pageSize.getHeight() - 15;
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'italic');
            doc.text('📄 Documento gerado por Gestão Rural v2.2', margin, docY);
            doc.text('Página ' + doc.internal.getNumberOfPages(), pageWidth - margin, docY, { align: 'right' });

            doc.save('relatorio_' + relatorio.tipo + '_' + new Date().toISOString().slice(0, 10) + '.pdf');
            GR.Toast.success('✅ PDF gerado com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            GR.Toast.error('Erro ao gerar PDF: ' + error.message);
        }
    }
};

console.log('✅ Módulo Relatórios carregado com filtro de propriedade!');