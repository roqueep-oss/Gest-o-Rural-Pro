// ================================================================
// MÓDULO: ANÁLISES - VERSÃO 2.0 COMPLETA
// Suporte: Solo, Folha e DRES com cálculo de doses
// Baseado em: Incaper (2013), Embrapa (2017), Cooabriel
// ================================================================

GR.Analises = {
    // ============================================================
    // CACHE
    // ============================================================
    _cache: {
        dadosExtraidos: null,
        arquivoPDF: null,
        dresAtual: null,
        ultimaBusca: null,
        recomendacoesCalculadas: null,
        analiseEditando: null
    },

    // ============================================================
    // CONFIGURAÇÕES - Classes de interpretação (Incaper 2013)
    // ============================================================
    _config: {
        classesSolo: {
            'pH': { muitoBaixo: '<4.5', baixo: '4.5-5.4', medio: '5.5-6.0', alto: '6.1-7.0', muitoAlto: '>7.0' },
            'P': { muitoBaixo: '<3', baixo: '3-5', medio: '6-10', alto: '11-20', muitoAlto: '>20' },
            'K': { muitoBaixo: '<30', baixo: '30-60', medio: '61-120', alto: '121-200', muitoAlto: '>200' },
            'Ca': { baixo: '<1.5', medio: '1.5-4.0', alto: '>4.0' },
            'Mg': { baixo: '<0.5', medio: '0.5-1.0', alto: '>1.0' },
            'Al': { baixo: '<0.3', medio: '0.3-1.0', alto: '>1.0' },
            'H+Al': { baixo: '<2.5', medio: '2.5-5.0', alto: '>5.0' },
            'SB': { baixo: '<2.0', medio: '2.0-5.0', alto: '>5.0' },
            'CTC': { baixo: '<4.5', medio: '4.5-10', alto: '>10' },
            'V': { baixo: '<50', medio: '50-70', alto: '>70' },
            'MO': { baixo: '<1.5', medio: '1.5-3.0', alto: '>3.0' },
            'Zn': { baixo: '<2.0', medio: '2.0-6.0', alto: '>6.0' },
            'Cu': { baixo: '<0.5', medio: '0.5-1.5', alto: '>1.5' },
            'Fe': { baixo: '<20', medio: '20-30', alto: '>30' },
            'Mn': { baixo: '<5.0', medio: '5.0-15', alto: '>15' },
            'B': { baixo: '<0.2', medio: '0.2-0.6', alto: '>0.6' },
            'S': { baixo: '<5.0', medio: '5.0-10', alto: '>10' }
        },

        // Tabela de recomendação de produtos por hectare
        recomendacoesProdutos: {
            'Calagem': {
                'pH': { 
                    condicao: 'baixo',
                    produto: 'Calcário Dolomítico',
                    dose: '2.0 a 4.0 t/ha',
                    observacao: 'Aplicar 3 meses antes do plantio, incorporar na camada 0-20cm. Realizar análise de solo após 60 dias.'
                }
            },
            'Fósforo': {
                'P': {
                    condicao: 'baixo',
                    produto: 'Superfosfato Simples (18% P2O5)',
                    dose: '200 a 400 kg/ha',
                    observacao: 'Aplicar no sulco de plantio ou a lanço. Evitar contato direto com as sementes.'
                },
                'P_medio': {
                    condicao: 'medio',
                    produto: 'Superfosfato Simples (18% P2O5)',
                    dose: '100 a 200 kg/ha',
                    observacao: 'Aplicar no sulco de plantio como adubação de manutenção.'
                }
            },
            'Potássio': {
                'K': {
                    condicao: 'baixo',
                    produto: 'Cloreto de Potássio (60% K2O)',
                    dose: '120 a 200 kg/ha',
                    observacao: 'Parcelar em 2-3 aplicações. Evitar aplicação em excesso em solos arenosos.'
                },
                'K_medio': {
                    condicao: 'medio',
                    produto: 'Cloreto de Potássio (60% K2O)',
                    dose: '60 a 120 kg/ha',
                    observacao: 'Aplicar em cobertura, parcelado em 2 vezes.'
                }
            },
            'Cálcio': {
                'Ca': {
                    condicao: 'baixo',
                    produto: 'Calcário Dolomítico ou Gesso Agrícola',
                    dose: '1.0 a 2.5 t/ha',
                    observacao: 'Incorporar na camada 0-20cm. Aplicar com antecedência de 60-90 dias.'
                }
            },
            'Magnésio': {
                'Mg': {
                    condicao: 'baixo',
                    produto: 'Calcário Dolomítico (30% MgO)',
                    dose: '1.0 a 2.0 t/ha',
                    observacao: 'Incorporar na camada 0-20cm. Aplicar com antecedência de 60-90 dias.'
                }
            },
            'Alumínio': {
                'Al': {
                    condicao: 'alto',
                    produto: 'Calcário Dolomítico',
                    dose: '2.0 a 4.0 t/ha',
                    observacao: 'Neutralização do Al tóxico. Aplicar com antecedência mínima de 60 dias.'
                }
            },
            'Acidez': {
                'H+Al': {
                    condicao: 'alto',
                    produto: 'Calcário Dolomítico',
                    dose: '2.0 a 3.5 t/ha',
                    observacao: 'Correção da acidez do solo. Incorporar na camada 0-20cm.'
                }
            },
            'Zinco': {
                'Zn': {
                    condicao: 'baixo',
                    produto: 'Sulfato de Zinco (20% Zn)',
                    dose: '5.0 a 10 kg/ha',
                    observacao: 'Aplicação via solo (sulco) ou foliar (0.2-0.5%). Em solos argilosos, aumentar dose em 30%.'
                }
            },
            'Cobre': {
                'Cu': {
                    condicao: 'baixo',
                    produto: 'Sulfato de Cobre (25% Cu)',
                    dose: '3.0 a 6.0 kg/ha',
                    observacao: 'Aplicação via solo (sulco) ou foliar (0.1-0.2%). Cuidado com toxidez em solos arenosos.'
                }
            },
            'Ferro': {
                'Fe': {
                    condicao: 'baixo',
                    produto: 'Quelato de Ferro (EDTA-Fe 13%)',
                    dose: '2.0 a 5.0 kg/ha',
                    observacao: 'Aplicação foliar (0.1-0.2%). Em solos calcários, usar quelato de Fe-EDDHA.'
                }
            },
            'Manganês': {
                'Mn': {
                    condicao: 'baixo',
                    produto: 'Sulfato de Manganês (30% Mn)',
                    dose: '4.0 a 8.0 kg/ha',
                    observacao: 'Aplicação via solo (sulco) ou foliar (0.2-0.5%). A eficiência é reduzida em pH elevado.'
                }
            },
            'Boro': {
                'B': {
                    condicao: 'baixo',
                    produto: 'Ácido Bórico (17% B)',
                    dose: '2.0 a 4.0 kg/ha',
                    observacao: 'Aplicação via solo ou foliar (0.1%). Cuidado: a diferença entre deficiência e toxidez é pequena.'
                }
            },
            'Enxofre': {
                'S': {
                    condicao: 'baixo',
                    produto: 'Gesso Agrícola (15-18% S)',
                    dose: '200 a 500 kg/ha',
                    observacao: 'Aplicar a lanço. Em culturas de alta exigência (crucíferas), usar doses mais elevadas.'
                }
            },
            'Matéria Orgânica': {
                'MO': {
                    condicao: 'baixo',
                    produto: 'Composto Orgânico/Esterco Curtido',
                    dose: '5.0 a 15.0 t/ha',
                    observacao: 'Incorporar na camada 0-20cm. Aplicar com antecedência mínima de 30 dias do plantio.'
                }
            },
            'Saturação por Bases': {
                'V': {
                    condicao: 'baixo',
                    produto: 'Calcário Dolomítico',
                    dose: 'Calcular pela necessidade de calagem (NC)',
                    observacao: 'NC = (V2 - V1) x T / 100. Elevar V% para 60-70% (culturas anuais) ou 70-80% (hortaliças).'
                }
            }
        },

        // Classes de interpretação para análise foliar (Tabela 5 - Incaper 2017)
        // Macronutrientes em g/kg, Micronutrientes em mg/kg
        classesFoliares: {
            'N': { baixo: '<24.2', adequado: '24.2-30.5', alto: '>30.5' },
            'P': { baixo: '<0.9', adequado: '0.9-1.5', alto: '>1.5' },
            'K': { baixo: '<17.5', adequado: '17.5-25.3', alto: '>25.3' },
            'Ca': { baixo: '<9.8', adequado: '9.8-16.0', alto: '>16.0' },
            'Mg': { baixo: '<2.6', adequado: '2.6-4.2', alto: '>4.2' },
            'S': { baixo: '<2.1', adequado: '2.1-2.7', alto: '>2.7' },
            'B': { baixo: '<54', adequado: '54-127', alto: '>127' },
            'Zn': { baixo: '<8', adequado: '8-15', alto: '>15' },
            'Mn': { baixo: '<24', adequado: '24-80', alto: '>80' },
            'Fe': { baixo: '<38', adequado: '38-61', alto: '>61' },
            'Cu': { baixo: '<3', adequado: '3-18', alto: '>18' }
        },

        // Nomes completos dos elementos foliares
        nomesElementosFoliares: {
            'N': 'Nitrogênio (N)',
            'P': 'Fósforo (P)',
            'K': 'Potássio (K)',
            'Ca': 'Cálcio (Ca)',
            'Mg': 'Magnésio (Mg)',
            'S': 'Enxofre (S)',
            'B': 'Boro (B)',
            'Zn': 'Zinco (Zn)',
            'Mn': 'Manganês (Mn)',
            'Fe': 'Ferro (Fe)',
            'Cu': 'Cobre (Cu)'
        },

        // Nomes completos dos elementos
        nomesElementos: {
            'pH': 'pH do Solo',
            'P': 'Fósforo (P)',
            'K': 'Potássio (K)',
            'Ca': 'Cálcio (Ca)',
            'Mg': 'Magnésio (Mg)',
            'Al': 'Alumínio (Al)',
            'H+Al': 'Acidez Potencial (H+Al)',
            'SB': 'Soma de Bases',
            'CTC': 'CTC Total',
            'V': 'Saturação por Bases (V%)',
            'MO': 'Matéria Orgânica',
            'Zn': 'Zinco (Zn)',
            'Cu': 'Cobre (Cu)',
            'Fe': 'Ferro (Fe)',
            'Mn': 'Manganês (Mn)',
            'B': 'Boro (B)',
            'S': 'Enxofre (S)'
        },

        // Tabelas de adubação N-P-K por produtividade (Fonte: Incaper 2017)
        tabelasAdubacao: {
            N: {
                produtividades: [0, 20, 30, 50, 70, 100, 130, 170],
                doses: [200, 260, 320, 380, 440, 500, 560, 620]
            },
            K: {
                produtividades: [0, 20, 30, 50, 70, 100, 130, 170],
                faixasSolo: [
                    { label: 'baixo', limite: 60, doses: [170, 230, 290, 350, 410, 470, 530, 600] },
                    { label: 'medio', limite: 120, doses: [100, 160, 220, 280, 340, 400, 460, 520] },
                    { label: 'alto', limite: 200, doses: [30, 90, 150, 210, 270, 330, 390, 450] },
                    { label: 'muitoAlto', limite: Infinity, doses: [0, 0, 0, 80, 140, 200, 260, 320] }
                ]
            },
            P: {
                produtividades: [0, 20, 30, 50, 70, 100, 130, 170],
                faixasSolo: [
                    { label: 'muitoBaixo', doses: [20, 35, 45, 60, 75, 90, 105, 120] },
                    { label: 'baixo', doses: [0, 0, 0, 20, 35, 50, 65, 80] },
                    { label: 'medio', doses: [0, 0, 0, 0, 0, 20, 40, 60] },
                    { label: 'alto', doses: [0, 0, 0, 0, 0, 0, 0, 0] }
                ]
            }
        },

        // Cores por status
        coresStatus: {
            'ideal': '#2e7d32',
            'adequado': '#2e7d32',
            'baixo': '#c62828',
            'medio': '#f57c00',
            'alto': '#e65100',
            'muitoBaixo': '#b71c1c',
            'muitoAlto': '#1b5e20',
            'recomendado': '#1565c0',
            'abaixo': '#c62828',
            'acima': '#e65100',
            'necessario': '#c62828'
        },

        // Labels por status
        labelsStatus: {
            'ideal': '✅ Ideal',
            'adequado': '✅ Adequado',
            'baixo': '⬇️ Baixo',
            'medio': '➡️ Médio',
            'alto': '⬆️ Alto',
            'muitoBaixo': '⬇️⬇️ Muito Baixo',
            'muitoAlto': '⬆️⬆️ Muito Alto',
            'recomendado': '📌 Recomendado',
            'abaixo': '⬇️ Abaixo',
            'acima': '⬆️ Acima',
            'necessario': '⚠️ Necessário'
        }
    },

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    init: function() {
        console.log('🔬 Inicializando módulo Análises...');
        
        // Verificar se o cache está inicializado
        if (!this._cache) {
            this._cache = {
                dadosExtraidos: null,
                arquivoPDF: null,
                dresAtual: null,
                ultimaBusca: null,
                recomendacoesCalculadas: null,
                analiseEditando: null
            };
        }

        // Injetar estilos se não existirem
        this._injectStyles();
        
        console.log('✅ Módulo Análises inicializado');
    },

    // ============================================================
    // INJETAR ESTILOS
    // ============================================================
    _injectStyles: function() {
        if (document.getElementById('analises-styles')) return;
        
        var style = document.createElement('style');
        style.id = 'analises-styles';
        style.textContent = `
            /* Stats */
            .analise-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 8px;
                margin-bottom: 16px;
                padding: 12px;
                background: var(--surface, #f5f5f5);
                border-radius: 8px;
                border: 1px solid var(--border, #ddd);
            }
            .stat-item {
                text-align: center;
                padding: 4px 8px;
                border-right: 1px solid var(--border, #ddd);
            }
            .stat-item:last-child { border-right: none; }
            .stat-number {
                display: block;
                font-size: 22px;
                font-weight: 700;
                color: var(--primary, #2e7d32);
            }
            .stat-label {
                display: block;
                font-size: 10px;
                color: var(--text-light, #666);
            }
            
            /* Tabela */
            .analise-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
            }
            .analise-table thead {
                background: var(--surface, #f5f5f5);
                border-bottom: 2px solid var(--border, #ddd);
            }
            .analise-table th {
                padding: 8px 6px;
                text-align: left;
                font-weight: 600;
                font-size: 11px;
                text-transform: uppercase;
                color: var(--text-light, #666);
            }
            .analise-table td {
                padding: 8px 6px;
                border-bottom: 1px solid var(--border, #ddd);
                vertical-align: middle;
            }
            .analise-table tr:hover {
                background: var(--hover, #f0f0f0);
            }
            .btn-group {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }
            
            /* Modal de Recomendações */
            .recomendacoes-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            }
            .recomendacoes-modal {
                background: var(--bg, #fff);
                border-radius: 12px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .recomendacoes-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid var(--border, #ddd);
                position: sticky;
                top: 0;
                background: var(--bg, #fff);
                z-index: 10;
            }
            .recomendacoes-header h2 {
                margin: 0;
                font-size: 18px;
                color: var(--primary, #2e7d32);
            }
            .recomendacoes-close {
                background: none;
                border: none;
                font-size: 24px;
                color: var(--text-light, #666);
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
            }
            .recomendacoes-close:hover {
                background: var(--hover, #f0f0f0);
            }
            .recomendacoes-body {
                padding: 20px;
            }
            .recomendacoes-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4px 16px;
                padding: 12px;
                background: var(--surface, #f5f5f5);
                border-radius: 6px;
                margin-bottom: 16px;
                font-size: 13px;
            }
            .recomendacoes-section {
                margin-bottom: 16px;
            }
            .recomendacoes-section h3 {
                font-size: 14px;
                margin: 0 0 8px 0;
                padding: 4px 8px;
                border-radius: 4px;
            }
            .recomendacoes-section h3.alta {
                background: #ffebee;
                color: #c62828;
            }
            .recomendacoes-section h3.media {
                background: #fff3e0;
                color: #f57c00;
            }
            
            /* Card de Recomendação */
            .recomendacao-card {
                background: var(--surface, #f5f5f5);
                border-left: 4px solid var(--primary, #2e7d32);
                border-radius: 6px;
                padding: 12px 16px;
                margin-bottom: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .recomendacao-card:last-child { margin-bottom: 0; }
            .recomendacao-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;
            }
            .recomendacao-elemento {
                font-weight: 700;
                font-size: 14px;
            }
            .recomendacao-status {
                font-weight: 600;
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 12px;
                background: var(--bg, #fff);
            }
            .recomendacao-conteudo {
                font-size: 13px;
            }
            .recomendacao-conteudo > div {
                padding: 2px 0;
            }
            .recomendacao-doses {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4px 16px;
                margin: 6px 0;
                padding: 8px 12px;
                background: #e8f5e9;
                border-radius: 4px;
                font-size: 12px;
            }
            .recomendacao-obs {
                margin-top: 4px;
                padding: 4px 8px;
                background: #fff3e0;
                border-radius: 4px;
                font-size: 12px;
                color: #555;
            }
            .recomendacoes-empty {
                padding: 20px;
                text-align: center;
                background: #e8f5e9;
                border-radius: 6px;
                font-size: 16px;
                color: #2e7d32;
            }
            .recomendacoes-footer {
                padding: 12px 20px;
                border-top: 1px solid var(--border, #ddd);
                display: flex;
                gap: 8px;
                justify-content: flex-end;
                position: sticky;
                bottom: 0;
                background: var(--bg, #fff);
            }
            
            /* Receituário */
            .receituario-header {
                margin-bottom: 16px;
            }
            .receituario-header h2 {
                margin: 0 0 8px 0;
                color: var(--primary, #2e7d32);
            }
            .receituario-info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 4px 16px;
                padding: 12px;
                background: var(--surface, #f5f5f5);
                border-radius: 6px;
                font-size: 13px;
            }
            .receituario-info-grid div {
                padding: 2px 0;
            }
            .resultados-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
                gap: 4px;
                margin: 8px 0 12px 0;
            }
            .resultado-item {
                background: var(--surface, #f5f5f5);
                padding: 6px 8px;
                border-radius: 4px;
                border-left: 3px solid var(--border, #ddd);
                text-align: center;
            }
            .resultado-label {
                font-size: 9px;
                font-weight: 600;
                text-transform: uppercase;
                color: var(--text-light, #666);
            }
            .resultado-valor {
                font-size: 16px;
                font-weight: 700;
            }
            .resultado-status {
                font-size: 8px;
                color: var(--text-light, #666);
            }
            .recomendacoes-lista {
                margin: 8px 0;
            }
            .recomendacoes-lista h4 {
                margin: 8px 0 4px 0;
                font-size: 13px;
            }
            .receituario-actions {
                margin-top: 16px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            /* Animações */
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            
            /* Responsivo */
            @media (max-width: 768px) {
                .analise-stats { grid-template-columns: repeat(3, 1fr); }
                .receituario-info-grid { grid-template-columns: 1fr 1fr; }
                .recomendacao-doses { grid-template-columns: 1fr; }
                .recomendacoes-info { grid-template-columns: 1fr; }
                .recomendacoes-modal { max-height: 95vh; margin: 10px; }
            }
            @media (max-width: 480px) {
                .analise-stats { grid-template-columns: repeat(2, 1fr); }
                .analise-table { font-size: 11px; }
                .analise-table th, .analise-table td { padding: 4px 3px; }
                .btn-sm { font-size: 10px; padding: 2px 4px; }
            }
        `;
        
        document.head.appendChild(style);
    },

    // ============================================================
    // RENDER - Interface principal
    // ============================================================
    render: function() {
        var div = document.getElementById('lista-analises');
        if (!div) {
            console.warn('⚠️ Container #lista-analises não encontrado');
            return;
        }

        var todasAnalises = this._getAnalises();
        var propAtiva = this._getPropriedadeAtiva();
        
        var analises = this._filtrarAnalises(todasAnalises, propAtiva);

        if (!analises.length) {
            div.innerHTML = this._renderEmptyState();
            return;
        }

        var html = this._renderStats(analises);
        html += this._renderTableHeader();
        var rows = '';
        var itemsToRender = analises.slice(0, 100);
        
        for (var i = 0; i < itemsToRender.length; i++) {
            rows += this._criarLinhaAnalise(itemsToRender[i]);
        }

        html += '<tbody>' + rows + '</tbody></table>';
        html += this._renderPagination(analises.length);
        div.innerHTML = html;

        this._bindRecommendationEvents();
    },

    // ============================================================
    // MÉTODOS AUXILIARES DE RENDER
    // ============================================================
    _getAnalises: function() {
        if (GR.State && GR.State.data && GR.State.data.analises) {
            return GR.State.data.analises;
        }
        return [];
    },

    _getPropriedadeAtiva: function() {
        if (GR.State && GR.State.ui) {
            return GR.State.ui.propriedadeAtiva || 'todas';
        }
        return 'todas';
    },

    _filtrarAnalises: function(analises, propAtiva) {
        var result = analises.slice();
        
        if (GR.State && GR.State.filtrarPorPropriedade) {
            result = GR.State.filtrarPorPropriedade(result, 'propriedade');
        }
        
        if (propAtiva !== 'todas') {
            result = result.filter(function(a) {
                return a.propriedade === propAtiva;
            });
        }

        result.sort(function(a, b) {
            return (a.data || '').localeCompare(b.data || '') * -1;
        });

        return result;
    },

    _renderStats: function(analises) {
        var total = analises.length;
        var solo = analises.filter(function(a) { return a.tipo === 'solo'; }).length;
        var folha = analises.filter(function(a) { return a.tipo === 'tecido-vegetal' || a.tipo === 'folha'; }).length;
        var dres = analises.filter(function(a) { return a.tipo === 'dres'; }).length;
        var corrigir = analises.filter(function(a) { 
            return a.status === 'Correção Necessária' || 
                   a.status === 'Ruim' || 
                   a.status === 'Muito ruim' ||
                   a.status === 'Baixo';
        }).length;

        return '<div class="analise-stats">' +
            '<div class="stat-item"><span class="stat-number">' + total + '</span><span class="stat-label">Total</span></div>' +
            '<div class="stat-item"><span class="stat-number">' + solo + '</span><span class="stat-label">🧪 Solo</span></div>' +
            '<div class="stat-item"><span class="stat-number">' + folha + '</span><span class="stat-label">🌿 Folha</span></div>' +
            '<div class="stat-item"><span class="stat-number">' + dres + '</span><span class="stat-label">📐 DRES</span></div>' +
            '<div class="stat-item" style="border-color:#f57c00;"><span class="stat-number" style="color:#f57c00;">' + corrigir + '</span><span class="stat-label">⚠️ Corrigir</span></div>' +
            '</div>';
    },

    _renderPagination: function(total) {
        if (total <= 100) return '';
        return '<div class="pagination-info" style="padding:8px;text-align:center;font-size:12px;color:#666;">' +
            'Mostrando 100 de ' + total + ' análises. Use os filtros para refinar.' +
            '</div>';
    },

    _renderEmptyState: function() {
        return '<div class="empty-state">' +
            '<span class="icon">🧪</span>' +
            '<div class="message">Nenhuma análise cadastrada</div>' +
            '<div class="sub-message">Clique em "Nova Análise" para começar</div>' +
            '</div>';
    },

    _renderTableHeader: function() {
        return '<div class="table-responsive"><table class="analise-table">' +
            '<thead><tr>' +
            '<th>Tipo</th>' +
            '<th>Propriedade</th>' +
            '<th>Talhão</th>' +
            '<th>Cultura</th>' +
            '<th>Data</th>' +
            '<th>Info</th>' +
            '<th>Status</th>' +
            '<th>PDF</th>' +
            '<th>Ações</th>' +
            '</tr></thead>';
    },

    // ============================================================
    // CRIAÇÃO DE LINHA
    // ============================================================
    _criarLinhaAnalise: function(a) {
        var tipoLabel = this._getTipoLabel(a.tipo);
        var isGood = this._isStatusBom(a.status);
        var badgeClass = isGood ? 'badge-success' : 'badge-warning';
        
        var pdfBtn = a.arquivoUrl ? 
            '<button class="btn btn-info btn-sm" onclick="GR.Analises.visualizarPDF(\'' + a.id + '\')">📄 PDF</button>' : 
            '<span style="color:#999;font-size:10px;">Sem PDF</span>';
        
        var infoText = this._getInfoText(a);
        var hasRecomendacao = (a.recomendacoes && a.recomendacoes.length > 0);

        return '<tr data-id="' + a.id + '">' +
            '<td><span class="badge badge-info">' + tipoLabel + '</span></td>' +
            '<td><strong>' + this._escapeHtml(a.propriedade) + '</strong></td>' +
            '<td>' + (a.talhao || '-') + '</td>' +
            '<td>' + (a.cultura || '-') + '</td>' +
            '<td>' + this._formatarData(a.data) + '</td>' +
            '<td>' + infoText + '</td>' +
            '<td><span class="badge ' + badgeClass + '">' + (a.status || 'N/A') + '</span></td>' +
            '<td>' + pdfBtn + '</td>' +
            '<td>' +
            '<div class="btn-group">' +
            '<button class="btn btn-primary btn-sm" onclick="GR.Analises.verReceituario(\'' + a.id + '\')" title="Ver Receituário">📋</button>' +
            (hasRecomendacao ? '<button class="btn btn-success btn-sm btn-recomendacao" data-id="' + a.id + '" title="Ver Recomendações">📊</button>' : '') +
            '<button class="btn btn-danger btn-sm" onclick="GR.Analises.excluir(\'' + a.id + '\')" title="Excluir">🗑️</button>' +
            '</div>' +
            '</td>' +
            '</tr>';
    },

    _getTipoLabel: function(tipo) {
        if (tipo === 'solo') return '🧪 Solo';
        if (tipo === 'tecido-vegetal') return '🌿 Tecido Vegetal';
        if (tipo === 'dres') return '📐 DRES';
        return '🧪 Solo';
    },

    _getInfoText: function(a) {
        if (a.tipo === 'dres') {
            return 'IQES: ' + (a.iqes || 'N/A');
        }
        if (a.elementos) {
            var count = Object.keys(a.elementos).length;
            return count + ' elementos';
        }
        return '0 elementos';
    },

    _isStatusBom: function(status) {
        var bons = ['Equilibrado', 'Muito boa', 'Boa', 'Adequado', 'Normal', 'Ideal'];
        return bons.indexOf(status) !== -1;
    },

    _bindRecommendationEvents: function() {
        var buttons = document.querySelectorAll('.btn-recomendacao');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function(e) {
                var id = this.getAttribute('data-id');
                GR.Analises.mostrarRecomendacoesDetalhadas(id);
            });
        }
    },

    // ============================================================
    // MODAL - Abrir para nova análise ou edição
    // ============================================================
    abrirModal: function(editId) {
        // Garantir que o cache existe
        if (!this._cache) {
            this._cache = {
                dadosExtraidos: null,
                arquivoPDF: null,
                dresAtual: null,
                ultimaBusca: null,
                recomendacoesCalculadas: null,
                analiseEditando: null
            };
        }
        
        this._cache.dadosExtraidos = null;
        this._cache.arquivoPDF = null;
        this._cache.dresAtual = null;

        if (!GR.State) {
            GR.Toast.error('Estado não inicializado!');
            return;
        }

        this._cache.analiseEditando = editId || null;
        GR.State.ui.analiseEditando = editId || null;
        
        var titleEl = document.getElementById('modal-analise-title');
        if (titleEl) {
            titleEl.textContent = editId ? '✏️ Editar Análise' : '🧪 Nova Análise';
        }

        this._resetarFormulario();
        
        if (GR.UI && GR.UI._atualizarSelectsPropriedade) {
            GR.UI._atualizarSelectsPropriedade();
        }

        this._toggleTipoFields('solo');

        // Popular dropdown de culturas
        this._popularDropdownCulturas();

        if (editId) {
            var item = this._findAnalise(editId);
            if (item) {
                this._preencherFormulario(item);
                
                if (item.tipo === 'dres') {
                    this._toggleTipoFields('dres');
                    this._preencherDRES(item);
                }
                
                if (item.elementos && Object.keys(item.elementos).length > 0) {
                    var dados = {
                        elementos: item.elementos,
                        recomendacoes: item.recomendacoes || [],
                        status: item.status || 'Equilibrado'
                    };
                    this._mostrarResultados(dados);
                    var resultadosEl = document.getElementById('analise-resultados');
                    if (resultadosEl) resultadosEl.style.display = 'block';
                }
            }
        }

        var pdfInput = document.getElementById('analise-file-input');
        if (pdfInput) {
            pdfInput.value = '';
            pdfInput.onchange = function(e) {
                if (this.files && this.files[0]) {
                    GR.Analises.processarPDF(this.files[0]);
                }
            };
        }

        var tipoEl = document.getElementById('analise-tipo');
        if (tipoEl) {
            tipoEl.onchange = function() {
                GR.Analises._toggleTipoFields(this.value);
            };
        }

        GR.Modal.open('modal-analise');
    },

    // ============================================================
    // TOGGLE - Campos por tipo
    // ============================================================
    _toggleTipoFields: function(tipo) {
        var soloFields = document.getElementById('analise-solo-fields');
        if (soloFields) soloFields.style.display = tipo === 'solo' ? 'block' : 'none';

        var partePlantaGroup = document.getElementById('analise-parte-planta-group');
        if (partePlantaGroup) partePlantaGroup.style.display = tipo === 'tecido-vegetal' ? 'block' : 'none';

        var dresFields = document.getElementById('analise-dres-fields');
        if (dresFields) dresFields.style.display = tipo === 'dres' ? 'block' : 'none';

        var resultadosEl = document.getElementById('analise-resultados');
        if (resultadosEl) {
            resultadosEl.style.display = (tipo === 'dres' || tipo === 'solo' || tipo === 'tecido-vegetal') ? 'block' : 'none';
        }
    },

    // ============================================================
    // POPULAR DROPDOWN DE CULTURAS
    // ============================================================
    _popularDropdownCulturas: function() {
        var select = document.getElementById('analise-cultura');
        if (!select) return;

        var culturas = [];
        if (typeof GR !== 'undefined' && GR.State && GR.State.data && GR.State.data.culturas) {
            culturas = GR.State.data.culturas;
        }

        var html = '<option value="">Selecione...</option>';
        var nomes = {};
        for (var i = 0; i < culturas.length; i++) {
            var nome = culturas[i].nome || '';
            if (nome && !nomes[nome]) {
                nomes[nome] = true;
                html += '<option value="' + this._escapeHtml(nome) + '">' + this._escapeHtml(nome) + '</option>';
            }
        }
        select.innerHTML = html;
    },

    // ============================================================
    // FORMULÁRIO - Reset e preenchimento
    // ============================================================
    _resetarFormulario: function() {
        var campos = {
            'analise-tipo': 'solo',
            'analise-propriedade': '',
            'analise-data': new Date().toISOString().split('T')[0],
            'analise-talhao': '',
            'analise-cultura': '',
            'analise-cultura-especifica': '',
            'analise-produtividade': '',
            'analise-area': '1.0',
            'analise-parte-planta': 'folha'
        };

        for (var id in campos) {
            var el = document.getElementById(id);
            if (el) el.value = campos[id];
        }

        var partePlantaGroup = document.getElementById('analise-parte-planta-group');
        if (partePlantaGroup) partePlantaGroup.style.display = 'none';

        var camposDRES = [
            'dres-num-amostras',
            'dres-areas-homogeneas',
            'dres-epoca-avaliacao',
            'dres-umidade-solo'
        ];
        
        for (var i = 0; i < camposDRES.length; i++) {
            var el = document.getElementById(camposDRES[i]);
            if (el) el.value = '';
        }

        for (var j = 1; j <= 3; j++) {
            var espessura = document.getElementById('dres-camada-' + j + '-espessura');
            var nota = document.getElementById('dres-camada-' + j + '-nota');
            if (espessura) espessura.value = '';
            if (nota) nota.value = '';
        }

        var resultadoDiv = document.getElementById('dres-resultado');
        if (resultadoDiv) resultadoDiv.innerHTML = '';

        var resultadosEl = document.getElementById('analise-resultados');
        if (resultadosEl) resultadosEl.style.display = 'none';

        var progressBar = document.getElementById('analise-progress-bar');
        if (progressBar) progressBar.style.display = 'none';

        var pdfInput = document.getElementById('analise-file-input');
        if (pdfInput) pdfInput.value = '';
    },

    _preencherFormulario: function(item) {
        var campos = {
            'analise-tipo': item.tipo || 'solo',
            'analise-propriedade': item.propriedade || '',
            'analise-data': item.data || '',
            'analise-talhao': item.talhao || '',
            'analise-cultura': item.cultura || '',
            'analise-cultura-especifica': item.culturaEspecifica || '',
            'analise-produtividade': item.produtividade || '',
            'analise-area': item.area || '1.0',
            'analise-parte-planta': item.partePlanta || 'folha'
        };

        for (var id in campos) {
            var el = document.getElementById(id);
            if (el) el.value = campos[id];
        }

        if (item.tipo === 'tecido-vegetal') {
            var partePlantaGroup = document.getElementById('analise-parte-planta-group');
            if (partePlantaGroup) partePlantaGroup.style.display = 'block';
        }
    },

    _preencherDRES: function(item) {
        var camposDRES = [
            'dres-num-amostras',
            'dres-areas-homogeneas',
            'dres-epoca-avaliacao',
            'dres-umidade-solo'
        ];
        
        for (var i = 0; i < camposDRES.length; i++) {
            var el = document.getElementById(camposDRES[i]);
            if (el && item[camposDRES[i]] !== undefined) {
                el.value = item[camposDRES[i]];
            }
        }

        for (var j = 1; j <= 3; j++) {
            var espessura = document.getElementById('dres-camada-' + j + '-espessura');
            var nota = document.getElementById('dres-camada-' + j + '-nota');
            
            if (espessura && item['camada' + j + 'Espessura'] !== undefined) {
                espessura.value = item['camada' + j + 'Espessura'];
            }
            if (nota && item['camada' + j + 'Nota'] !== undefined) {
                nota.value = item['camada' + j + 'Nota'];
            }
        }

        if (item.iqes) {
            var iqesDisplay = document.getElementById('dres-iqes-display');
            if (iqesDisplay) {
                iqesDisplay.textContent = 'IQES: ' + item.iqes;
            }
        }
    },

    // ============================================================
    // DRES - Calcular
    // ============================================================
    calcularDRES: function() {
        var camadas = [];
        var totalEspessura = 0;

        for (var i = 1; i <= 3; i++) {
            var espessuraEl = document.getElementById('dres-camada-' + i + '-espessura');
            var notaEl = document.getElementById('dres-camada-' + i + '-nota');
            
            if (espessuraEl && notaEl) {
                var espessura = parseFloat(espessuraEl.value) || 0;
                var nota = parseFloat(notaEl.value) || 0;
                
                if (espessura > 0 && nota > 0) {
                    camadas.push({ espessura: espessura, nota: nota });
                    totalEspessura += espessura;
                }
            }
        }

        if (camadas.length === 0 || totalEspessura === 0) {
            GR.Toast.warning('Preencha pelo menos uma camada com espessura e nota.');
            return;
        }

        var iqea = 0;
        for (var j = 0; j < camadas.length; j++) {
            iqea += (camadas[j].espessura * camadas[j].nota);
        }
        iqea = iqea / totalEspessura;
        iqea = Math.round(iqea * 10) / 10;

        var classes = [
            { nome: 'Muito boa', min: 5.0, max: 6.0, cor: '#2e7d32' },
            { nome: 'Boa', min: 4.0, max: 4.9, cor: '#388e3c' },
            { nome: 'Regular', min: 3.0, max: 3.9, cor: '#f57c00' },
            { nome: 'Ruim', min: 2.0, max: 2.9, cor: '#c62828' },
            { nome: 'Muito ruim', min: 1.0, max: 1.9, cor: '#b71c1c' }
        ];

        var qualidade = 'Muito ruim';
        var cor = '#b71c1c';
        var recomendacao = this._getRecomendacaoDRES(qualidade);

        for (var k = 0; k < classes.length; k++) {
            if (iqea >= classes[k].min && iqea <= classes[k].max) {
                qualidade = classes[k].nome;
                cor = classes[k].cor;
                recomendacao = this._getRecomendacaoDRES(qualidade);
                break;
            }
        }

        if (!this._cache) {
            this._cache = {};
        }
        
        this._cache.dresAtual = {
            iqea: iqea,
            qualidade: qualidade,
            recomendacao: recomendacao,
            camadas: camadas,
            totalEspessura: totalEspessura
        };

        var resultadoDiv = document.getElementById('dres-resultado');
        if (resultadoDiv) {
            resultadoDiv.innerHTML = 
                '<div style="background:' + cor + '15;padding:12px;border-radius:8px;border:2px solid ' + cor + ';">' +
                '<div style="font-size:20px;font-weight:700;color:' + cor + ';">IQEA: ' + iqea + ' - ' + qualidade + '</div>' +
                '<div style="font-size:13px;margin-top:6px;color:#333;">' + recomendacao + '</div>' +
                '<div style="font-size:11px;color:#666;margin-top:4px;">Camadas: ' + 
                camadas.map(function(c) { return c.espessura + 'cm (nota ' + c.nota + ')'; }).join(' | ') + 
                '</div></div>';
        }

        GR.Toast.success('IQEA calculado: ' + iqea + ' - ' + qualidade);
    },

    _getRecomendacaoDRES: function(qualidade) {
        var recomendacoes = {
            'Muito boa': 'Manter o sistema de manejo utilizado. Atenção para novas tecnologias conservacionistas. Avaliar possibilidade de rotação de culturas.',
            'Boa': 'Intensificar uso de sistemas diversificados de produção com alta aporte de fitomassa. Incluir gramíneas no sistema de rotação.',
            'Regular': 'Aprimorar o sistema de produção ampliando a diversificação de espécies vegetais. Evitar operações mecanizadas em excesso.',
            'Ruim': 'Realizar diagnóstico completo da área. Rever sistema de produção e práticas conservacionistas. Considerar uso de plantas de cobertura.',
            'Muito ruim': 'Adotar estratégias integradas de recuperação. Incluir gramíneas por pelo menos 1 ano. Considerar intervenções mecânicas criteriosas.'
        };
        return recomendacoes[qualidade] || recomendacoes['Muito ruim'];
    },

    // ============================================================
    // PROCESSAR PDF
    // ============================================================
    processarPDF: function(file) {
        if (!file) {
            GR.Toast.error('Nenhum arquivo selecionado!');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            GR.Toast.error('Arquivo muito grande (máx 10MB).');
            return;
        }

        var progressBar = document.getElementById('analise-progress-bar');
        var progress = document.getElementById('analise-progress');
        if (progressBar) progressBar.style.display = 'block';
        if (progress) progress.style.width = '10%';

        var reader = new FileReader();
        var self = this;

        reader.onload = function(e) {
            var arrayBuffer = e.target.result;
            
            if (typeof pdfjsLib === 'undefined') {
                GR.Toast.error('PDF.js não carregado.');
                if (progressBar) progressBar.style.display = 'none';
                return;
            }

            try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            } catch (err) {}

            pdfjsLib.getDocument({ data: arrayBuffer }).promise
                .then(function(pdf) {
                    return self._extrairTextoPDF(pdf, progress);
                })
                .then(function(texto) {
                    if (progress) progress.style.width = '70%';
                    
                    var dados = self._extrairDados(texto);
                    self._mostrarResultados(dados);
                    
                    var resultadosEl = document.getElementById('analise-resultados');
                    if (resultadosEl) resultadosEl.style.display = 'block';

                    // Atualizar tipo no formulário conforme o PDF detectado
                    var tipoEl = document.getElementById('analise-tipo');
                    if (tipoEl && dados && dados.tipo) {
                        tipoEl.value = dados.tipo;
                        self._toggleTipoFields(dados.tipo);
                    }
                    
                    if (progress) progress.style.width = '100%';
                    setTimeout(function() { 
                        if (progressBar) progressBar.style.display = 'none'; 
                    }, 500);
                    
                    var numElementos = Object.keys(dados.elementos).length;
                    GR.Toast.success('Análise processada! ' + numElementos + ' elementos extraídos.');
                    
                    if (!self._cache) {
                        self._cache = {};
                    }
                    self._cache.dadosExtraidos = dados;
                    self._cache.arquivoPDF = file;
                })
                .catch(function(err) {
                    console.error('Erro ao processar PDF:', err);
                    GR.Toast.error('Erro ao processar: ' + err.message);
                    if (progressBar) progressBar.style.display = 'none';
                });
        };
        
        reader.readAsArrayBuffer(file);
    },

    _extrairTextoPDF: function(pdf, progress) {
        var textoCompleto = '';
        var totalPages = pdf.numPages;
        var promises = [];

        for (var i = 1; i <= totalPages; i++) {
            promises.push(pdf.getPage(i).then(function(page) {
                if (progress) {
                    var pct = ((i / totalPages) * 50 + 10);
                    progress.style.width = pct + '%';
                }
                return page.getTextContent().then(function(textContent) {
                    if (textContent && textContent.items) {
                        var textos = textContent.items.map(function(item) { return item.str || ''; });
                        textoCompleto += textos.join(' ') + '\n';
                    }
                });
            }));
        }

        return Promise.all(promises).then(function() { return textoCompleto; });
    },

    // ============================================================
    // EXTRAIR DADOS - Suporte Cooabriel e padrão
    // ============================================================
    _extrairDados: function(texto) {
        // Detectar tipo de análise
        var isFoliar = /tecido\s*vegetal/i.test(texto);

        if (isFoliar) {
            return this._extrairDadosFoliar(texto);
        }

        var dados = {
            tipo: 'solo',
            elementos: {},
            recomendacoes: [],
            status: 'Equilibrado'
        };

        // Extrair informações do cabeçalho Cooabriel
        var propMatch = texto.match(/NOME:\s*([^\n]+)/i);
        if (propMatch) dados.propriedadeExtraida = propMatch[1].trim();

        var culturaMatch = texto.match(/CULTURA:\s*([^\n]+)/i);
        if (culturaMatch) dados.culturaExtraida = culturaMatch[1].trim();

        var dataMatch = texto.match(/DATA ANÁLISE:\s*([^\n]+)/i);
        if (dataMatch) dados.dataExtraida = dataMatch[1].trim();

        // Elementos do solo com seus padrões (classificação via Incaper 2017)
        var elementosMap = {
            'pH': { label: 'pH' },
            'P': { label: 'Fósforo' },
            'K': { label: 'Potássio' },
            'Ca': { label: 'Cálcio' },
            'Mg': { label: 'Magnésio' },
            'Al': { label: 'Alumínio' },
            'H+Al': { label: 'Acidez' },
            'SB': { label: 'Soma de Bases' },
            'CTC': { label: 'CTC Total' },
            'V': { label: 'Saturação por Bases' },
            'MO': { label: 'Matéria Orgânica' },
            'Zn': { label: 'Zinco' },
            'Cu': { label: 'Cobre' },
            'Fe': { label: 'Ferro' },
            'Mn': { label: 'Manganês' },
            'B': { label: 'Boro' },
            'S': { label: 'Enxofre' }
        };

        // Buscar números no texto
        var numeros = texto.match(/(\d+[,.]?\d*)/g);
        var idx = 0;

        // Tentar extrair cada elemento
        for (var key in elementosMap) {
            var config = elementosMap[key];
            var pattern = new RegExp(key + '\\s*[:.]?\\s*([0-9]+[,.]?[0-9]*)', 'i');
            var match = texto.match(pattern);
            
            if (match) {
                var valor = parseFloat(match[1].replace(',', '.'));
                if (!isNaN(valor) && valor > 0) {
                    dados.elementos[key] = Math.round(valor * 10) / 10;
                    continue;
                }
            }
            
            // Tentar por posição se houver números suficientes
            if (numeros && idx < numeros.length) {
                var valorPos = parseFloat(numeros[idx].replace(',', '.'));
                if (!isNaN(valorPos) && valorPos > 0 && valorPos < 1000) {
                    dados.elementos[key] = Math.round(valorPos * 10) / 10;
                }
                idx++;
            }
        }

        // Extrair Alumínio
        var alMatch = texto.match(/Al\s*[:.]?\s*([0-9]+[,.]?[0-9]*)/i);
        if (alMatch) {
            var alValor = parseFloat(alMatch[1].replace(',', '.'));
            if (!isNaN(alValor) && alValor > 0) {
                dados.elementos['Al'] = Math.round(alValor * 10) / 10;
            }
        }

        // Classificar elementos usando tabelas do Incaper 2017
        var precisaCorrecao = false;
        var produtividade = parseFloat(document.getElementById('analise-produtividade')?.value) || 0;
        dados._produtividadeExtraida = produtividade;

        for (var ek in dados.elementos) {
            var ev = dados.elementos[ek];
            var config = elementosMap[ek];
            if (!config) continue;

            var status = this._classificarElemento(ek, ev);
            if (status !== 'ideal' && status !== 'medio') precisaCorrecao = true;

            var recText = this._getRecomendacaoPorElemento(ek, status);
            
            dados.recomendacoes.push({
                elemento: config.label || ek,
                valor: ev,
                status: status,
                recomendacao: recText
            });
        }

        // Verificar relação Ca:Mg
        var caMg = this._verificarRelacaoCaMg(dados.elementos);
        if (caMg && caMg.status !== 'ideal') {
            dados.recomendacoes.push({
                elemento: 'Relação Ca:Mg',
                valor: caMg.valor.toFixed(1) + ':1',
                status: caMg.status,
                recomendacao: caMg.recomendacao
            });
            precisaCorrecao = true;
        }

        dados.status = precisaCorrecao ? 'Correção Necessária' : 'Equilibrado';
        if (dados.status === 'Correção Necessária' && dados.recomendacoes.length === 0) {
            dados.status = 'Equilibrado';
        }
        return dados;
    },

    // ============================================================
    // EXTRAIR DADOS FOLIAR - Formato Labosoil (Tabela 5 - Incaper 2017)
    // ============================================================
    _extrairDadosFoliar: function(texto) {
        var dados = {
            tipo: 'tecido-vegetal',
            elementos: {},
            amostras: [],
            recomendacoes: [],
            status: 'Equilibrado'
        };

        // Extrair amostras - ignorar número do relatório (primeiro match)
        var todosIds = texto.match(/(\d{4}\/\d{4})/g) || [];
        var sampleIds = todosIds.slice(1); // Remove número do relatório

        var sampleNames = texto.match(/AMOSTRA\s*-\s*\d+\s*-\s*([^\n]+)/gi) || [];

        // Ordem dos nutrientes na análise foliar
        var nutrientes = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'B', 'Zn', 'Mn', 'Fe', 'Cu'];

        // Encontrar a seção de resultados analíticos no texto
        var idxResultados = texto.search(/RESULTADOS\s*ANAL[IÍ]TICOS/i);
        if (idxResultados < 0) {
            dados.status = 'Erro: formato não reconhecido';
            return dados;
        }
        var textoSecao = texto.substring(idxResultados);

        // Extrair números apenas da seção de resultados
        var nums = textoSecao.match(/(\d+[,.]?\d*)/g) || [];
        var valores = [];
        for (var ni = 0; ni < nums.length; ni++) {
            var v = parseFloat(nums[ni].replace(',', '.'));
            if (!isNaN(v)) valores.push(v);
        }

        // Encontrar inicio dos dados: buscar primeiro valor potencial de N (15-35)
        // que ocorre APÓS os cabeçalhos de coluna (4 digitos)
        var startIdx = 0;
        var encontrouHeader = false;
        for (var si = 0; si < valores.length; si++) {
            var v = valores[si];
            // Cabeçalhos de coluna são valores de 4 dígitos no início da seção
            if (!encontrouHeader && v >= 1000 && v < 10000) {
                encontrouHeader = true;
                continue;
            }
            // Após encontrar um header, o próximo valor entre 15-35 é o N
            if (encontrouHeader && v > 15 && v < 35) {
                startIdx = si;
                break;
            }
        }
        // Fallback: buscar primeiro N se não encontrou headers
        if (!encontrouHeader) {
            for (var si2 = 0; si2 < valores.length; si2++) {
                if (valores[si2] > 15 && valores[si2] < 35) {
                    startIdx = si2;
                    break;
                }
            }
        }

        // Agrupar por amostra: 11 nutrientes + 13 razões por coluna
        // Pular cabeçalhos de coluna (4 dígitos) e razões (13 valores após cada 11 nutrientes)
        var amostras = [];
        var vi = startIdx;
        while (vi < valores.length && amostras.length < 3) {
            // Pular cabeçalhos de coluna que aparecem entre as amostras
            while (vi < valores.length && valores[vi] >= 1000 && valores[vi] < 10000) {
                vi++;
            }
            if (vi + 11 > valores.length) break;
            var grupoNutrientes = valores.slice(vi, vi + 11);
            amostras.push(grupoNutrientes);
            vi += 11 + 13; // Pular nutrientes + razões
        }

        // Limitar a número de amostras conhecidas
        var numAmostras = Math.min(amostras.length, Math.max(sampleIds.length, 3));

        for (var ai = 0; ai < numAmostras; ai++) {
            var amostra = {
                id: sampleIds[ai] || ('Amostra ' + (ai + 1)),
                nome: '',
                elementos: {}
            };

            if (sampleNames[ai]) {
                var nomeMatch = sampleNames[ai].match(/AMOSTRA\s*-\s*\d+\s*-\s*(.+)/i);
                if (nomeMatch) amostra.nome = nomeMatch[1].trim();
            }

            var vals = amostras[ai] || [];
            for (var ei = 0; ei < nutrientes.length && ei < vals.length; ei++) {
                amostra.elementos[nutrientes[ei]] = vals[ei];
            }

            dados.amostras.push(amostra);
        }

        // Usar a primeira amostra como referência principal
        if (dados.amostras.length > 0) {
            dados.elementos = dados.amostras[0].elementos;
            dados.amostraPrincipal = dados.amostras[0];
        }

        // Classificar elementos foliares
        var precisaCorrecao = false;
        for (var ek in dados.elementos) {
            var ev = dados.elementos[ek];
            var status = this._classificarElementoFoliar(ek, ev);
            if (status === 'baixo' || status === 'alto') precisaCorrecao = true;

            var nomeEl = this._config.nomesElementosFoliares[ek] || ek;
            dados.recomendacoes.push({
                elemento: ek,
                nomeElemento: nomeEl,
                valor: ev + (['B', 'Zn', 'Mn', 'Fe', 'Cu'].indexOf(ek) >= 0 ? ' mg/kg' : ' g/kg'),
                status: status,
                recomendacao: this._getRecomendacaoFoliar(ek, status, ev)
            });
        }

        dados.status = precisaCorrecao ? 'Correção Necessária' : 'Equilibrado';
        if (dados.status === 'Correção Necessária' && dados.recomendacoes.length === 0) {
            dados.status = 'Equilibrado';
        }
        return dados;
    },

    _getRecomendacaoFoliar: function(elemento, status, valor) {
        if (status === 'adequado' || status === 'ideal') {
            return 'Teor dentro da faixa de suficiência. Manter o manejo atual.';
        }

        var nomes = this._config.nomesElementosFoliares;
        var nome = nomes[elemento] || elemento;

        if (status === 'baixo') {
            var recomendacoes = {
                'N': 'Deficiência de N. Aplicar ureia (45% N) via foliar a 1-2% ou sulfato de amônio a 1-2%. Realizar adubação de cobertura com 20-40 kg/ha de N.',
                'P': 'Deficiência de P. Aplicar MAP (11-52-00) ou fosfato monoamônico via foliar a 0.5-1%. Adubação de solo com 30-60 kg/ha de P2O5.',
                'K': 'Deficiência de K. Aplicar KCl (60% K2O) via foliar a 1-1.5% ou nitrato de potássio a 0.5-1%. Adubação de solo com 40-80 kg/ha de K2O.',
                'Ca': 'Deficiência de Ca. Aplicar cálcio quelatizado ou nitrato de cálcio via foliar a 0.5-1%. Gesso agrícola 500-1000 kg/ha no solo.',
                'Mg': 'Deficiência de Mg. Aplicar sulfato de magnésio via foliar a 0.5-1% ou quelato de Mg. Calcário dolomítico se solo ácido.',
                'S': 'Deficiência de S. Aplicar sulfato de amônio (24% S) ou gesso agrícola 200-400 kg/ha. Sulfato de magnésio via foliar a 1-2%.',
                'B': 'Deficiência de B. Aplicar ácido bórico (17% B) via foliar a 0.1-0.3% ou bórax a 0.2-0.5%. Cuidado: toxidez próxima.',
                'Zn': 'Deficiência de Zn. Aplicar sulfato de zinco (20% Zn) via foliar a 0.3-0.5% ou quelato de Zn. Adubação de solo com 5-10 kg/ha de Zn.',
                'Mn': 'Deficiência de Mn. Aplicar sulfato de manganês (30% Mn) via foliar a 0.2-0.5% ou quelato de Mn. Evitar pH > 6.0.',
                'Fe': 'Deficiência de Fe. Aplicar quelato de Fe (EDTA-Fe 13%) via foliar a 0.1-0.2% ou sulfato ferroso a 0.2-0.5%.',
                'Cu': 'Deficiência de Cu. Aplicar sulfato de cobre (25% Cu) via foliar a 0.1-0.2%. Cuidado com fitotoxidez.'
            };
            return recomendacoes[elemento] || nome + ' abaixo da faixa de suficiência. Consultar engenheiro agrônomo.';
        }

        if (status === 'alto') {
            var recomendacoesExcesso = {
                'N': 'Excesso de N. Reduzir adubação nitrogenada. Sintomas: crescimento vegetativo excessivo, suscetibilidade a pragas.',
                'P': 'Excesso de P. Suspender adubação fosfatada. Pode causar deficiência de Zn e Fe.',
                'K': 'Excesso de K. Reduzir adubação potássica. Pode induzir deficiência de Ca e Mg.',
                'Ca': 'Excesso de Ca. Verificar pH do solo. Suspender calagem. Pode induzir deficiência de Mg e K.',
                'Mg': 'Excesso de Mg. Reduzir aplicação de magnésio. Pode induzir deficiência de K.',
                'S': 'Excesso de S. Suspender adubação sulfatada. Pode acidificar o solo.',
                'B': 'TOXIDEZ de B. Suspender aplicação de boro. Risco de queima de folhas. Lavar com água se aplicação recente.',
                'Zn': 'Excesso de Zn. Suspender aplicação de zinco. Pode causar fitotoxidez.',
                'Mn': 'Excesso de Mn. Verificar pH do solo. Pode estar relacionado à acidez excessiva.',
                'Fe': 'Excesso de Fe. Pode estar relacionado à acidez do solo ou compactação. Verificar drenagem.',
                'Cu': 'Excesso de Cu. Suspender aplicação de cobre. Risco de fitotoxidez radicular.'
            };
            return recomendacoesExcesso[elemento] || nome + ' acima da faixa de suficiência. Consultar engenheiro agrônomo.';
        }

        return nome + ' - ' + status + '. Consultar engenheiro agrônomo.';
    },

    _getRecomendacaoPorElemento: function(elemento, status) {
        var configs = this._config.recomendacoesProdutos;
        var mapa = {
            'pH': 'Calagem',
            'P': 'Fósforo',
            'K': 'Potássio',
            'Ca': 'Cálcio',
            'Mg': 'Magnésio',
            'Al': 'Alumínio',
            'H+Al': 'Acidez',
            'V': 'Saturação por Bases',
            'MO': 'Matéria Orgânica',
            'Zn': 'Zinco',
            'Cu': 'Cobre',
            'Fe': 'Ferro',
            'Mn': 'Manganês',
            'B': 'Boro',
            'S': 'Enxofre'
        };

        var grupo = mapa[elemento];
        if (!grupo) return 'Elemento ' + elemento + ' - ' + status;

        var config = configs[grupo];
        if (!config) return 'Elemento ' + elemento + ' - ' + status;

        // Procurar recomendação específica
        for (var key in config) {
            if (config[key].condicao === status || 
                config[key].condicao === elemento + '_' + status) {
                return config[key].produto + ': ' + config[key].dose + ' - ' + config[key].observacao;
            }
        }

        // Fallback - tentar baixo, depois medio, depois alto
        var fallbacks = ['baixo', 'muitoBaixo', 'alto', 'muitoAlto', 'medio'];
        for (var fi = 0; fi < fallbacks.length; fi++) {
            for (var key2 in config) {
                if (config[key2].condicao === fallbacks[fi]) {
                    return config[key2].produto + ': ' + config[key2].dose + ' - ' + config[key2].observacao;
                }
            }
        }

        return 'Consulte um engenheiro agrônomo para ' + elemento;
    },

    _classificarElemento: function(elemento, valor) {
        if (valor === undefined || valor === null || isNaN(valor)) return 'ideal';
        var classes = this._config.classesSolo[elemento];
        if (!classes) return 'ideal';

        if (elemento === 'pH') {
            if (valor < 4.5) return 'muitoBaixo';
            if (valor <= 5.4) return 'baixo';
            if (valor <= 6.0) return 'medio';
            if (valor <= 7.0) return 'alto';
            return 'muitoAlto';
        }
        if (elemento === 'P') {
            if (valor < 3) return 'muitoBaixo';
            if (valor <= 5) return 'baixo';
            if (valor <= 10) return 'medio';
            if (valor <= 20) return 'alto';
            return 'muitoAlto';
        }
        if (elemento === 'K') {
            if (valor < 30) return 'muitoBaixo';
            if (valor <= 60) return 'baixo';
            if (valor <= 120) return 'medio';
            if (valor <= 200) return 'alto';
            return 'muitoAlto';
        }

        if (classes.baixo && classes.medio && classes.alto) {
            var baixoMax = parseFloat(classes.baixo.replace('<', '').split('-')[1]) || parseFloat(classes.baixo.replace('<', ''));
            var medioMax = parseFloat(classes.medio.split('-')[1]) || parseFloat(classes.medio.replace('<', ''));
            if (isNaN(baixoMax)) baixoMax = parseFloat(classes.baixo.match(/[\d.]+/)[1]);
            if (isNaN(medioMax)) medioMax = parseFloat(classes.medio.match(/[\d.]+/)[1]);

            if (classes.baixo.startsWith('<')) {
                baixoMax = parseFloat(classes.baixo.substring(1));
                if (valor < baixoMax) return 'baixo';
            } else {
                var partes = classes.baixo.split('-');
                var baixoMin = parseFloat(partes[0]);
                baixoMax = parseFloat(partes[1]);
                if (valor < baixoMin) return 'baixo';
                if (valor <= baixoMax) return 'medio';
            }

            if (classes.medio.indexOf('-') !== -1) {
                var medPartes = classes.medio.split('-');
                var medioMin = parseFloat(medPartes[0]);
                medioMax = parseFloat(medPartes[1]);
                if (valor >= medioMin && valor <= medioMax) return 'medio';
            } else {
                medioMax = parseFloat(classes.medio.replace('<', ''));
                if (classes.medio.startsWith('<') && valor < medioMax) return 'medio';
            }

            if (classes.alto.startsWith('>')) {
                var altoMin = parseFloat(classes.alto.substring(1));
                if (valor >= altoMin) return 'alto';
            } else {
                var altPartes = classes.alto.split('-');
                var altoMin = parseFloat(altPartes[0]);
                if (valor >= altoMin) return 'alto';
            }
        }

        return 'ideal';
    },

    // ============================================================
    // CLASSIFICAR ELEMENTO FOLIAR (Tabela 5 - Incaper 2017)
    // ============================================================
    _classificarElementoFoliar: function(elemento, valor) {
        if (valor === undefined || valor === null || isNaN(valor)) return 'ideal';
        var classes = this._config.classesFoliares[elemento];
        if (!classes) return 'ideal';

        var baixoMax = parseFloat(classes.baixo.replace('<', '').replace(',', '.'));
        var adeqPartes = classes.adequado.split('-');
        var adeqMin = parseFloat(adeqPartes[0].replace(',', '.'));
        var adeqMax = parseFloat(adeqPartes[1].replace(',', '.'));
        var altoMin = parseFloat(classes.alto.replace('>', '').replace(',', '.'));

        if (valor < baixoMax) return 'baixo';
        if (valor >= adeqMin && valor <= adeqMax) return 'adequado';
        if (valor > adeqMax) return 'alto';

        return 'ideal';
    },

    _calcularCalagemRecomendacao: function(elementos, produtividade) {
        var V = elementos['V'];
        var CTC = elementos['CTC'];
        if (V === undefined || CTC === undefined) return null;

        var V2 = 60;
        if (produtividade && produtividade > 60) {
            V2 = 70;
        }
        var QC = CTC * (V2 - V) * 0.5 / 80;
        if (QC < 0) QC = 0;
        QC = Math.round(QC * 100) / 100;

        var recomendacao = null;
        if (QC > 0) {
            recomendacao = {
                elemento: 'Calagem',
                produto: 'Calcário Dolomítico (PRNT 80%)',
                doseHa: QC.toFixed(2) + ' t/ha',
                observacao: 'QC = T(V2 - V1) x p / PRNT. V2=' + V2 + '%, PRNT=80%, p=0.5 (superficial). ' +
                    'Manter Ca > 2.5 e Mg > 1.0 cmolc/dm³. Relação Ca:Mg ideal 3:1 a 4:1.'
            };
        }

        var recomendacaoGesso = null;
        var Ca = elementos['Ca'];
        var Al = elementos['Al'];
        if (Ca !== undefined && Ca <= 0.4 || Al !== undefined && Al >= 0.5) {
            var QG = QC * 0.3;
            recomendacaoGesso = {
                elemento: 'Gesso',
                produto: 'Gesso Agrícola',
                doseHa: QG.toFixed(2) + ' t/ha',
                observacao: 'QG = 0.3 x QC. Aplicar quando Ca <= 0.4 cmolc/dm³ ou Al >= 0.5 cmolc/dm³ ou m% > 30%.'
            };
        }

        return { calagem: recomendacao, gesso: recomendacaoGesso };
    },

    _verificarRelacaoCaMg: function(elementos) {
        var Ca = elementos['Ca'];
        var Mg = elementos['Mg'];
        if (Ca === undefined || Mg === undefined || Mg === 0) return null;
        var relacao = Ca / Mg;
        if (relacao < 3) {
            return { status: 'abaixo', valor: relacao, recomendacao: 'Relação Ca:Mg baixa (' + relacao.toFixed(1) + ':1). Utilizar calcário calcítico para elevar Ca.' };
        } else if (relacao > 4) {
            return { status: 'acima', valor: relacao, recomendacao: 'Relação Ca:Mg alta (' + relacao.toFixed(1) + ':1). Utilizar calcário dolomítico para elevar Mg.' };
        }
        return { status: 'ideal', valor: relacao, recomendacao: 'Relação Ca:Mg ideal (' + relacao.toFixed(1) + ':1).' };
    },

    // ============================================================
    // MOSTRAR RESULTADOS
    // ============================================================
    _mostrarResultados: function(dados) {
        var div = document.getElementById('analise-dados');
        var recDiv = document.getElementById('analise-recomendacoes');
        if (!div) return;

        var html = '';
        var elementos = dados.elementos || {};
        var recomendacoes = dados.recomendacoes || [];

        // Informações extraídas
        var infoHtml = '';
        if (dados.propriedadeExtraida) {
            infoHtml += '<div style="font-size:10px;color:var(--text-light);margin-bottom:4px;">📌 ' + dados.propriedadeExtraida + '</div>';
        }
        if (dados.culturaExtraida) {
            infoHtml += '<div style="font-size:10px;color:var(--text-light);margin-bottom:4px;">🌱 ' + dados.culturaExtraida + '</div>';
        }
        if (dados.dataExtraida) {
            infoHtml += '<div style="font-size:10px;color:var(--text-light);margin-bottom:4px;">📅 ' + dados.dataExtraida + '</div>';
        }

        if (infoHtml) {
            html += '<div style="background:var(--surface);padding:6px;border-radius:4px;margin-bottom:6px;">' + infoHtml + '</div>';
        }

        // Mostrar tipo de análise
        var tipoLabel = dados.tipo === 'tecido-vegetal' ? '🍃 Análise de Tecido Vegetal' : '🪴 Análise de Solo';
        html += '<div style="font-size:10px;color:var(--text-light);margin-bottom:6px;">' + tipoLabel + '</div>';

        // Renderizar elementos
        var cores = this._config.coresStatus || {
            ideal: '#2e7d32',
            adequado: '#2e7d32',
            baixo: '#c62828',
            medio: '#f57c00',
            alto: '#e65100',
            muitoBaixo: '#b71c1c',
            muitoAlto: '#1b5e20'
        };
        var labels = this._config.labelsStatus || {
            ideal: '✅ Ideal',
            adequado: '✅ Adequado',
            baixo: '⬇️ Baixo',
            medio: '➡️ Médio',
            alto: '⬆️ Alto',
            muitoBaixo: '⬇️⬇️ Muito Baixo',
            muitoAlto: '⬆️⬆️ Muito Alto'
        };

        for (var key in elementos) {
            var valor = elementos[key];
            var elem = null;
            for (var ri = 0; ri < recomendacoes.length; ri++) {
                if (recomendacoes[ri].elemento === key) {
                    elem = recomendacoes[ri];
                    break;
                }
            }
            if (!elem) continue;

            var cor = cores[elem.status] || '#666';
            var statusText = labels[elem.status] || elem.status;

            html += '<div style="background:var(--surface);padding:4px 8px;border-radius:4px;border:1px solid var(--border);text-align:center;">' +
                '<div style="font-weight:600;font-size:9px;">' + key + '</div>' +
                '<div style="font-size:16px;font-weight:700;color:' + cor + ';">' + valor + '</div>' +
                '<div style="font-size:8px;color:var(--text-light);">' + statusText + '</div>' +
                '</div>';
        }

        div.innerHTML = html || '<div style="text-align:center;padding:10px;color:#999;">Nenhum elemento extraído</div>';

        // Renderizar recomendações não ideais
        var recsNaoIdeais = [];
        for (var ri2 = 0; ri2 < recomendacoes.length; ri2++) {
            var s = recomendacoes[ri2].status;
            if (s !== 'ideal' && s !== 'adequado') {
                recsNaoIdeais.push(recomendacoes[ri2]);
            }
        }
        
        if (recsNaoIdeais.length) {
            var recHtml = '<h5 style="font-size:11px;color:#e65100;margin-top:6px;">📝 Recomendações (' + recsNaoIdeais.length + ')</h5>';
            for (var ri3 = 0; ri3 < recsNaoIdeais.length; ri3++) {
                var r = recsNaoIdeais[ri3];
                var cor2 = (r.status === 'baixo' || r.status === 'muitoBaixo') ? '#c62828' : '#e65100';
                var nomeExib = r.nomeElemento || r.elemento;
                recHtml += '<div class="receituario-item" style="background:#e8f5e9;border-left:3px solid ' + cor2 + ';padding:4px 8px;margin:3px 0;border-radius:3px;font-size:11px;">' +
                    '<strong>' + nomeExib + ':</strong> ' + r.recomendacao +
                    '</div>';
            }
            recDiv.innerHTML = recHtml;
        } else {
            recDiv.innerHTML = '<div style="background:#e8f5e9;padding:8px;border-radius:4px;margin-top:4px;">✅ Todos os elementos estão na faixa ideal.</div>';
        }
    },

    // ============================================================
    // RECOMENDAÇÕES DETALHADAS - COM QUANTIDADES POR HECTARE
    // ============================================================
    mostrarRecomendacoesDetalhadas: function(id) {
        var analise = this._findAnalise(id);
        if (!analise) {
            GR.Toast.error('Análise não encontrada!');
            return;
        }

        // Calcular recomendações
        var recomendacoes = this._calcularRecomendacoes(analise);
        if (!recomendacoes || recomendacoes.length === 0) {
            GR.Toast.info('Nenhuma recomendação necessária para esta análise.');
            return;
        }

        // Criar modal de recomendações
        var modalHtml = this._criarModalRecomendacoes(analise, recomendacoes);
        
        // Mostrar em um modal
        var overlay = document.createElement('div');
        overlay.className = 'recomendacoes-overlay';
        overlay.innerHTML = modalHtml;
        document.body.appendChild(overlay);

        // Fechar ao clicar fora
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        // Fechar com botão
        var closeBtn = overlay.querySelector('.recomendacoes-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                overlay.remove();
            });
        }
    },

    _calcularRecomendacoes: function(analise) {
        if (!analise.elementos || Object.keys(analise.elementos).length === 0) {
            return [];
        }

        var recomendacoes = [];
        var produtos = this._config.recomendacoesProdutos || {};
        var tabelas = this._config.tabelasAdubacao || {};
        var elementos = analise.elementos || {};
        var recomendacoesSalvas = analise.recomendacoes || [];
        var area = parseFloat(analise.area) || 1;
        var produtividade = parseFloat(analise.produtividade) || 0;

        // Calcular recomendação de calagem (Incaper 2017)
        var calcResult = this._calcularCalagemRecomendacao(elementos, produtividade);
        if (calcResult) {
            if (calcResult.calagem) {
                recomendacoes.push({
                    elemento: 'Calagem',
                    nomeElemento: 'Calagem',
                    valor: elementos['V'] || 'N/A',
                    status: 'baixo',
                    statusLabel: '⬇️ Necessário',
                    produto: calcResult.calagem.produto,
                    doseHa: calcResult.calagem.doseHa,
                    doseAmostra: (parseFloat(calcResult.calagem.doseHa) * area).toFixed(2) + ' t',
                    observacao: calcResult.calagem.observacao,
                    prioridade: 'Alta',
                    grupo: 'Calagem'
                });
            }
            if (calcResult.gesso) {
                recomendacoes.push({
                    elemento: 'Gesso',
                    nomeElemento: 'Gesso Agrícola',
                    valor: 'Ca: ' + (elementos['Ca'] || 'N/A'),
                    status: 'baixo',
                    statusLabel: '⬇️ Necessário',
                    produto: calcResult.gesso.produto,
                    doseHa: calcResult.gesso.doseHa,
                    doseAmostra: (parseFloat(calcResult.gesso.doseHa) * area).toFixed(2) + ' t',
                    observacao: calcResult.gesso.observacao,
                    prioridade: 'Alta',
                    grupo: 'Gesso'
                });
            }
        }

        // Verificar relação Ca:Mg
        var caMgResult = this._verificarRelacaoCaMg(elementos);
        if (caMgResult && caMgResult.status !== 'ideal') {
            recomendacoes.push({
                elemento: 'Relação Ca:Mg',
                nomeElemento: 'Relação Cálcio:Magnésio',
                valor: caMgResult.valor.toFixed(1) + ':1',
                status: caMgResult.status,
                statusLabel: caMgResult.status === 'abaixo' ? '⬇️ Baixa' : '⬆️ Alta',
                produto: caMgResult.status === 'abaixo' ? 'Calcário Calcítico' : 'Calcário Dolomítico',
                doseHa: 'Ajustar pela calagem',
                doseAmostra: 'Conforme necessidade de calagem',
                observacao: caMgResult.recomendacao,
                prioridade: 'Média',
                grupo: 'CaMg'
            });
        }

        // Usar tabelas de adubação N-P-K (Incaper 2017, Tabelas 7 e 8)
        if (produtividade > 0 && tabelas.N && tabelas.K && tabelas.P) {
            var prodTable = tabelas.N.produtividades;
            var prodIndex = 0;
            for (var pi = 0; pi < prodTable.length; pi++) {
                if (produtividade > prodTable[pi]) prodIndex = pi;
            }

            // Nitrogênio
            var doseN = tabelas.N.doses[prodIndex];
            var recN = this._encontrarRecSalva(recomendacoesSalvas, 'N');
            recomendacoes.push({
                elemento: 'N',
                nomeElemento: 'Nitrogênio (N)',
                valor: doseN + ' kg/ha/ano',
                status: 'recomendado',
                statusLabel: '📌 Recomendado',
                produto: 'Ureia (45% N) ou Sulfato de Amônio (20% N)',
                doseHa: doseN + ' kg/ha de N',
                doseAmostra: (doseN * area).toFixed(0) + ' kg de N',
                observacao: 'Tabela 7 - Incaper 2017. Parcelar em 3 aplicações (floração, chumbinho, granação). ' +
                    'Se usar ureia: ' + (doseN / 0.45).toFixed(0) + ' kg/ha de ureia. ' +
                    'Se usar sulfato de amônio: ' + (doseN / 0.20).toFixed(0) + ' kg/ha de sulfato de amônio.',
                prioridade: 'Alta',
                grupo: 'N'
            });

            // Potássio
            var teorK = elementos['K'] || 0;
            var doseK = 0;
            var faixaK = null;
            for (var fk = 0; fk < tabelas.K.faixasSolo.length; fk++) {
                var faixa = tabelas.K.faixasSolo[fk];
                if (teorK < faixa.limite) {
                    doseK = faixa.doses[prodIndex];
                    faixaK = faixa.label;
                    break;
                }
            }
            if (doseK > 0) {
                recomendacoes.push({
                    elemento: 'K',
                    nomeElemento: 'Potássio (K)',
                    valor: doseK + ' kg/ha/ano',
                    status: 'recomendado',
                    statusLabel: '📌 Recomendado (K solo: ' + faixaK + ')',
                    produto: 'Cloreto de Potássio (60% K2O)',
                    doseHa: doseK + ' kg/ha de K2O',
                    doseAmostra: (doseK * area).toFixed(0) + ' kg de K2O',
                    observacao: 'Tabela 7 - Incaper 2017. Parcelar em 3 aplicações. ' +
                        'Equivale a ' + (doseK / 0.60).toFixed(0) + ' kg/ha de KCl.',
                    prioridade: 'Alta',
                    grupo: 'K'
                });
            }

            // Fósforo (Incaper 2017, Tabela 8)
            var teorP = elementos['P'] || 0;
            var doseP = 0;
            var faixaP = null;
            var pLimites = { 'muitoBaixo': [0, 3], 'baixo': [3, 5], 'medio': [5, 10], 'alto': [10, Infinity] };
            for (var fp = 0; fp < tabelas.P.faixasSolo.length; fp++) {
                var faixaP2 = tabelas.P.faixasSolo[fp];
                var pLim = pLimites[faixaP2.label] || [0, 0];
                if (teorP >= pLim[0] && teorP < pLim[1]) {
                    doseP = faixaP2.doses[prodIndex];
                    faixaP = faixaP2.label;
                    break;
                }
            }
            if (doseP > 0) {
                recomendacoes.push({
                    elemento: 'P',
                    nomeElemento: 'Fósforo (P)',
                    valor: doseP + ' kg/ha/ano',
                    status: 'recomendado',
                    statusLabel: '📌 Recomendado (P solo: ' + faixaP + ')',
                    produto: 'Superfosfato Simples (18% P2O5) ou Superfosfato Triplo (41% P2O5)',
                    doseHa: doseP + ' kg/ha de P2O5',
                    doseAmostra: (doseP * area).toFixed(0) + ' kg de P2O5',
                    observacao: 'Tabela 8 - Incaper 2017. Aplicar em dose única na floração. ' +
                        'Se usar superfosfato simples: ' + (doseP / 0.18).toFixed(0) + ' kg/ha. ' +
                        'Se usar superfosfato triplo: ' + (doseP / 0.41).toFixed(0) + ' kg/ha.',
                    prioridade: 'Alta',
                    grupo: 'P'
                });
            }
        }

        // Demais elementos usando mapa de recomendação
        var mapaElementos = {
            'pH': 'Calagem',
            'Ca': 'Cálcio',
            'Mg': 'Magnésio',
            'Al': 'Alumínio',
            'H+Al': 'Acidez',
            'MO': 'Matéria Orgânica',
            'Zn': 'Zinco',
            'Cu': 'Cobre',
            'Fe': 'Ferro',
            'Mn': 'Manganês',
            'B': 'Boro',
            'S': 'Enxofre'
        };

        for (var key in elementos) {
            if (key === '_produtividade' || key === 'N' || key === 'P' || key === 'K' || key === 'V' || key === 'SB' || key === 'CTC') continue;

            var grupo = mapaElementos[key];
            if (!grupo) continue;

            var recSalva = this._encontrarRecSalva(recomendacoesSalvas, key);
            if (!recSalva || recSalva.status === 'ideal' || recSalva.status === 'medio') continue;

            var produtoConfig = produtos[grupo];
            if (!produtoConfig) continue;

            var configProduto = null;
            var chaves = Object.keys(produtoConfig);
            for (var j = 0; j < chaves.length; j++) {
                var chave = chaves[j];
                if (produtoConfig[chave].condicao === recSalva.status) {
                    configProduto = produtoConfig[chave];
                    break;
                }
            }
            if (!configProduto && chaves.length > 0) {
                configProduto = produtoConfig[chaves[0]];
            }
            if (!configProduto) continue;

            var doseHa = configProduto.dose || 'N/A';
            var doseAmostra = this._calcularDosePorAmostra(doseHa, area);

            var prioridade = (recSalva.status === 'baixo' || recSalva.status === 'muitoBaixo' || recSalva.status === 'muitoAlto') ? 'Alta' : 'Média';
            var nomeElemento = this._config.nomesElementos[key] || key;

            recomendacoes.push({
                elemento: key,
                nomeElemento: nomeElemento,
                valor: elementos[key],
                status: recSalva.status,
                statusLabel: this._getStatusLabel(recSalva.status),
                produto: configProduto.produto || 'Produto recomendado',
                doseHa: doseHa,
                doseAmostra: doseAmostra,
                observacao: configProduto.observacao || '',
                prioridade: prioridade,
                grupo: grupo
            });
        }

        // Ordenar por prioridade
        recomendacoes.sort(function(a, b) {
            if (a.prioridade === 'Alta' && b.prioridade !== 'Alta') return -1;
            if (b.prioridade === 'Alta' && a.prioridade !== 'Alta') return 1;
            return 0;
        });

        this._cache.recomendacoesCalculadas = recomendacoes;
        return recomendacoes;
    },

    _encontrarRecSalva: function(recomendacoes, key) {
        for (var i = 0; i < recomendacoes.length; i++) {
            var r = recomendacoes[i];
            if (r.elemento === key || r.elemento === key.toLowerCase() ||
                r.elemento === this._config.nomesElementos[key]) {
                return r;
            }
        }
        return null;
    },

    _calcularDosePorAmostra: function(doseHa, areaHa) {
        if (!doseHa || doseHa === 'N/A') return 'N/A';
        if (!areaHa || areaHa <= 0) areaHa = 1;
        
        // Extrair números da string de dose
        var numeros = doseHa.match(/(\d+[,.]?\d*)/g);
        if (!numeros) return 'N/A';

        var unidade = this._extrairUnidade(doseHa);
        var doses = [];

        for (var i = 0; i < numeros.length; i++) {
            var valor = parseFloat(numeros[i].replace(',', '.'));
            if (!isNaN(valor)) {
                var doseArea = valor * areaHa;
                doses.push(doseArea.toFixed(1) + ' ' + unidade);
            }
        }

        return doses.join(' a ') || 'N/A';
    },

    _extrairUnidade: function(doseStr) {
        var match = doseStr.match(/[a-zA-Z\/]+$/);
        return match ? match[0] : 'kg';
    },

    _getStatusLabel: function(status) {
        return this._config.labelsStatus[status] || status;
    },

    // ============================================================
    // MODAL DE RECOMENDAÇÕES
    // ============================================================
    _criarModalRecomendacoes: function(analise, recomendacoes) {
        var totalRecomendacoes = recomendacoes.length;
        var html = '<div class="recomendacoes-modal">' +
            '<div class="recomendacoes-header">' +
            '<h2>📊 Recomendações Técnicas</h2>' +
            '<button class="recomendacoes-close">✕</button>' +
            '</div>' +
            '<div class="recomendacoes-body">' +
            '<div class="recomendacoes-info">' +
            '<div><strong>Propriedade:</strong> ' + this._escapeHtml(analise.propriedade) + '</div>' +
            '<div><strong>Cultura:</strong> ' + (analise.cultura || 'Não informada') + '</div>' +
            '<div><strong>Talhão:</strong> ' + (analise.talhao || '-') + '</div>' +
            '<div><strong>Data:</strong> ' + this._formatarData(analise.data) + '</div>' +
            '<div><strong>Área:</strong> ' + (analise.area || '1.0') + ' ha</div>' +
            '<div><strong>Recomendações:</strong> ' + totalRecomendacoes + '</div>' +
            '</div>';

        if (totalRecomendacoes === 0) {
            html += '<div class="recomendacoes-empty">✅ Todos os elementos estão equilibrados. Nenhuma recomendação necessária.</div>';
        } else {
            html += '<div class="recomendacoes-list">';
            
            // Separar por prioridade
            var altaPrioridade = recomendacoes.filter(function(r) { return r.prioridade === 'Alta'; });
            var mediaPrioridade = recomendacoes.filter(function(r) { return r.prioridade === 'Média'; });

            if (altaPrioridade.length > 0) {
                html += '<div class="recomendacoes-section"><h3 class="alta">🔴 Prioridade Alta (' + altaPrioridade.length + ')</h3>';
                for (var i = 0; i < altaPrioridade.length; i++) {
                    html += this._criarCardRecomendacao(altaPrioridade[i]);
                }
                html += '</div>';
            }

            if (mediaPrioridade.length > 0) {
                html += '<div class="recomendacoes-section"><h3 class="media">🟡 Prioridade Média (' + mediaPrioridade.length + ')</h3>';
                for (var j = 0; j < mediaPrioridade.length; j++) {
                    html += this._criarCardRecomendacao(mediaPrioridade[j]);
                }
                html += '</div>';
            }

            html += '</div>';
        }

        html += '<div class="recomendacoes-footer">' +
            '<button class="btn btn-primary" onclick="GR.Analises.imprimirRecomendacoes()">🖨️ Imprimir</button>' +
            '<button class="btn btn-secondary" onclick="this.closest(\'.recomendacoes-overlay\').remove()">Fechar</button>' +
            '</div>' +
            '</div></div>';

        return html;
    },

    _criarCardRecomendacao: function(rec) {
        var cores = this._config.coresStatus || {
            baixo: '#c62828',
            medio: '#f57c00',
            alto: '#e65100',
            muitoBaixo: '#b71c1c',
            muitoAlto: '#1b5e20',
            ideal: '#2e7d32'
        };
        var color = cores[rec.status] || '#666';

        return '<div class="recomendacao-card" style="border-left-color:' + color + ';">' +
            '<div class="recomendacao-header">' +
            '<span class="recomendacao-elemento">' + rec.nomeElemento + '</span>' +
            '<span class="recomendacao-status" style="color:' + color + ';">' + rec.statusLabel + '</span>' +
            '</div>' +
            '<div class="recomendacao-conteudo">' +
            '<div><strong>Valor atual:</strong> ' + rec.valor + '</div>' +
            '<div><strong>Produto:</strong> ' + rec.produto + '</div>' +
            '<div class="recomendacao-doses">' +
            '<div><strong>📦 Dose por hectare:</strong> ' + rec.doseHa + '</div>' +
            '<div><strong>🧪 Dose para esta área:</strong> ' + rec.doseAmostra + '</div>' +
            '</div>' +
            '<div class="recomendacao-obs">💡 ' + rec.observacao + '</div>' +
            '</div>' +
            '</div>';
    },

    // ============================================================
    // IMPRIMIR RECOMENDAÇÕES
    // ============================================================
    imprimirRecomendacoes: function() {
        var conteudo = document.querySelector('.recomendacoes-body');
        if (!conteudo) {
            conteudo = document.getElementById('receituario-content');
        }
        if (!conteudo) {
            GR.Toast.error('Nenhum conteúdo para imprimir.');
            return;
        }

        var janela = window.open('', '_blank', 'width=800,height=600');
        if (!janela) {
            GR.Toast.error('Permita pop-ups para imprimir.');
            return;
        }

        var estilos = document.querySelector('style')?.innerHTML || '';
        
        janela.document.write('<!DOCTYPE html><html><head>' +
            '<title>Recomendações Técnicas</title>' +
            '<style>' + estilos + '</style>' +
            '<style>' +
            'body{padding:30px;background:#fff;font-family:Arial,sans-serif;}' +
            '.recomendacao-card{border-left:4px solid #2e7d32;background:#f5f5f5;padding:12px;margin:8px 0;border-radius:4px;}' +
            '.recomendacao-header{display:flex;justify-content:space-between;font-weight:bold;margin-bottom:6px;}' +
            '.recomendacao-doses{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:6px 0;background:#e8f5e9;padding:8px;border-radius:4px;}' +
            '.recomendacao-obs{color:#666;font-size:12px;margin-top:4px;padding:4px 8px;background:#fff3e0;border-radius:4px;}' +
            '.no-print{display:none;} @media print{.btn{display:none;}}' +
            '.recomendacoes-info{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;padding:12px;background:#f5f5f5;border-radius:6px;margin-bottom:16px;}' +
            '</style>' +
            '</head><body>' +
            '<div style="max-width:800px;margin:0 auto;">' +
            '<h1 style="text-align:center;color:#2e7d32;">📊 Recomendações Técnicas</h1>' +
            conteudo.innerHTML +
            '</div>' +
            '<script>window.onload=function(){setTimeout(window.print,1000);}<\/script>' +
            '</body></html>');
        janela.document.close();
    },

    // ============================================================
    // RECEITUÁRIO - Versão completa
    // ============================================================
    verReceituario: function(id) {
        var analise = this._findAnalise(id);
        if (!analise) {
            GR.Toast.error('Análise não encontrada!');
            return;
        }

        var div = document.getElementById('receituario-content');
        if (!div) return;

        // Calcular recomendações
        var recomendacoes = this._calcularRecomendacoes(analise);
        var html = this._construirReceituario(analise, recomendacoes);
        div.innerHTML = html;
        GR.Modal.open('modal-receituario');
    },

    _construirReceituario: function(analise, recomendacoes) {
        var partes = [];
        var tipoLabel = this._getTipoLabel(analise.tipo);

        // Cabeçalho
        partes.push('<div class="receituario-header">' +
            '<h2>📋 Receituário Agrícola</h2>' +
            '<div class="receituario-info-grid">' +
            '<div><strong>Propriedade:</strong> ' + this._escapeHtml(analise.propriedade) + '</div>' +
            '<div><strong>Cultura:</strong> ' + (analise.cultura || '-') + '</div>' +
            '<div><strong>Talhão:</strong> ' + (analise.talhao || '-') + '</div>' +
            '<div><strong>Data:</strong> ' + this._formatarData(analise.data) + '</div>' +
            '<div><strong>Tipo:</strong> ' + tipoLabel + '</div>' +
            '<div><strong>Status:</strong> ' + (analise.status || 'N/A') + '</div>' +
            '<div><strong>Área:</strong> ' + (analise.area || '1.0') + ' ha</div>' +
            (analise.culturaEspecifica ? '<div><strong>Variedade:</strong> ' + this._escapeHtml(analise.culturaEspecifica) + '</div>' : '') +
            '</div></div>');

        // DRES
        if (analise.tipo === 'dres' && analise.iqes) {
            var cores = {
                'Muito boa': '#2e7d32',
                'Boa': '#388e3c',
                'Regular': '#f57c00',
                'Ruim': '#c62828',
                'Muito ruim': '#b71c1c'
            };
            var cor = cores[analise.status] || '#666';
            
            partes.push('<div class="dres-resultado" style="background:' + cor + '15;padding:12px;border-radius:8px;border:2px solid ' + cor + ';margin-bottom:12px;">' +
                '<div style="font-size:18px;font-weight:700;color:' + cor + ';">IQES: ' + analise.iqes + ' - ' + analise.status + '</div>' +
                (analise.recomendacaoDRES ? '<div style="font-size:13px;margin-top:6px;">' + analise.recomendacaoDRES + '</div>' : '') +
                '</div>');
        }

        // Resultados
        if (analise.elementos && Object.keys(analise.elementos).length > 0) {
            partes.push('<h3>🔬 Resultados da Análise</h3>' +
                '<div class="resultados-grid">');

            var cores = this._config.coresStatus || { ideal: '#2e7d32', baixo: '#c62828', alto: '#e65100' };
            var labels = this._config.labelsStatus || {};

            for (var key in analise.elementos) {
                var valor = analise.elementos[key];
                var rec = null;
                if (analise.recomendacoes) {
                    for (var ri = 0; ri < analise.recomendacoes.length; ri++) {
                        if (analise.recomendacoes[ri].elemento === key) {
                            rec = analise.recomendacoes[ri];
                            break;
                        }
                    }
                }
                var cor2 = (rec && cores[rec.status]) ? cores[rec.status] : '#666';

                partes.push('<div class="resultado-item" style="border-color:' + cor2 + ';">' +
                    '<div class="resultado-label">' + key + '</div>' +
                    '<div class="resultado-valor" style="color:' + cor2 + ';">' + valor + '</div>' +
                    '<div class="resultado-status">' + (rec ? (labels[rec.status] || rec.status) : '') + '</div>' +
                    '</div>');
            }
            partes.push('</div>');
        }

        // Recomendações com doses
        if (recomendacoes && recomendacoes.length > 0) {
            partes.push('<h3 style="color:#e65100;margin-top:16px;">📝 Recomendações com Doses</h3>');
            partes.push('<div class="recomendacoes-lista">');
            
            var alta = recomendacoes.filter(function(r) { return r.prioridade === 'Alta'; });
            var media = recomendacoes.filter(function(r) { return r.prioridade === 'Média'; });

            if (alta.length > 0) {
                partes.push('<h4 style="color:#c62828;">🔴 Prioridade Alta (' + alta.length + ')</h4>');
                for (var i = 0; i < alta.length; i++) {
                    partes.push(this._criarCardRecomendacao(alta[i]));
                }
            }

            if (media.length > 0) {
                partes.push('<h4 style="color:#f57c00;">🟡 Prioridade Média (' + media.length + ')</h4>');
                for (var j = 0; j < media.length; j++) {
                    partes.push(this._criarCardRecomendacao(media[j]));
                }
            }

            partes.push('</div>');
        } else if (analise.tipo !== 'dres') {
            partes.push('<div class="recomendacoes-empty">✅ Todos os elementos estão na faixa ideal. Nenhuma recomendação necessária.</div>');
        }

        // Ações
        partes.push('<div class="receituario-actions">' +
            '<button class="btn btn-primary" onclick="GR.Analises.imprimirReceituario()">🖨️ Imprimir</button>' +
            '<button class="btn btn-success" onclick="GR.Analises.mostrarRecomendacoesDetalhadas(\'' + analise.id + '\')">📊 Recomendações</button>' +
            '<button class="btn btn-secondary" onclick="GR.Modal.close(\'modal-receituario\')">Fechar</button>' +
            '</div>');

        return partes.join('');
    },

    // ============================================================
    // IMPRIMIR RECEITUÁRIO
    // ============================================================
    imprimirReceituario: function() {
        var conteudo = document.getElementById('receituario-content');
        if (!conteudo) return;

        var janela = window.open('', '_blank', 'width=800,height=600');
        if (!janela) {
            GR.Toast.error('Permita pop-ups para imprimir.');
            return;
        }

        var estilos = document.querySelector('style')?.innerHTML || '';

        janela.document.write('<!DOCTYPE html><html><head>' +
            '<title>Receituário Agrícola</title>' +
            '<style>' + estilos + '</style>' +
            '<style>' +
            'body{padding:30px;background:#fff;font-family:Arial,sans-serif;}' +
            '.receituario-info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 16px;padding:12px;background:#f5f5f5;border-radius:6px;margin-bottom:12px;}' +
            '.resultados-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:4px;margin:8px 0;}' +
            '.resultado-item{background:#f5f5f5;padding:6px;border-radius:4px;border-left:3px solid #ddd;text-align:center;}' +
            '.recomendacao-card{border-left:4px solid #2e7d32;background:#f5f5f5;padding:12px;margin:8px 0;border-radius:4px;}' +
            '.recomendacao-doses{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:6px 0;background:#e8f5e9;padding:8px;border-radius:4px;}' +
            '.recomendacao-obs{color:#666;font-size:12px;margin-top:4px;padding:4px 8px;background:#fff3e0;border-radius:4px;}' +
            '.no-print{display:none;} @media print{.btn{display:none;}}' +
            '</style>' +
            '</head><body>' +
            '<div style="max-width:800px;margin:0 auto;">' +
            '<h1 style="text-align:center;color:#2e7d32;">📋 Receituário Agrícola</h1>' +
            conteudo.innerHTML +
            '</div>' +
            '<script>window.onload=function(){setTimeout(window.print,1000);}<\/script>' +
            '</body></html>');
        janela.document.close();
    },

    // ============================================================
    // VISUALIZAR PDF
    // ============================================================
    visualizarPDF: function(id) {
        var item = this._findAnalise(id);
        if (!item || !item.arquivoUrl) {
            GR.Toast.error('PDF não encontrado!');
            return;
        }
        window.open(item.arquivoUrl, '_blank');
    },

    // ============================================================
    // SALVAR
    // ============================================================
    salvar: function() {
        var tipo = document.getElementById('analise-tipo')?.value || 'solo';
        var propriedade = document.getElementById('analise-propriedade')?.value?.trim() || '';
        var data = document.getElementById('analise-data')?.value || '';
        var talhao = document.getElementById('analise-talhao')?.value?.trim() || '';
        var cultura = document.getElementById('analise-cultura')?.value?.trim() || '';
        var culturaEspecifica = document.getElementById('analise-cultura-especifica')?.value?.trim() || '';
        var produtividade = document.getElementById('analise-produtividade')?.value?.trim() || '';
        var area = document.getElementById('analise-area')?.value?.trim() || '1.0';

        if (!propriedade) {
            GR.Toast.error('Selecione uma propriedade!');
            return;
        }

        if (!data) {
            GR.Toast.error('Selecione a data da análise!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var partePlanta = document.getElementById('analise-parte-planta')?.value || 'folha';

        var dados = {
            tipo: tipo,
            propriedade: propriedade,
            data: data,
            talhao: talhao,
            cultura: cultura,
            culturaEspecifica: culturaEspecifica,
            produtividade: produtividade,
            area: parseFloat(area) || 1.0,
            partePlanta: tipo === 'tecido-vegetal' ? partePlanta : '',
            dataCriacao: GR.Utils.now ? GR.Utils.now() : new Date().toISOString(),
            dataAtualizacao: GR.Utils.now ? GR.Utils.now() : new Date().toISOString()
        };

        // Coletar dados DRES
        if (tipo === 'dres' && this._cache && this._cache.dresAtual) {
            dados.iqes = this._cache.dresAtual.iqea;
            dados.status = this._cache.dresAtual.qualidade;
            dados.recomendacaoDRES = this._cache.dresAtual.recomendacao;
            
            var camposDRES = ['dres-num-amostras', 'dres-areas-homogeneas', 'dres-epoca-avaliacao', 'dres-umidade-solo'];
            for (var i = 0; i < camposDRES.length; i++) {
                var el = document.getElementById(camposDRES[i]);
                if (el) dados[camposDRES[i]] = el.value;
            }
            
            for (var j = 1; j <= 3; j++) {
                var espessura = document.getElementById('dres-camada-' + j + '-espessura');
                var nota = document.getElementById('dres-camada-' + j + '-nota');
                if (espessura) dados['camada' + j + 'Espessura'] = parseFloat(espessura.value) || 0;
                if (nota) dados['camada' + j + 'Nota'] = parseFloat(nota.value) || 0;
            }
        }

        // Usar dados extraídos do PDF
        if (this._cache && this._cache.dadosExtraidos) {
            dados.elementos = this._cache.dadosExtraidos.elementos || {};
            dados.recomendacoes = this._cache.dadosExtraidos.recomendacoes || [];
            if (!dados.status || dados.status === 'Equilibrado') {
                dados.status = this._cache.dadosExtraidos.status || 'Equilibrado';
            }
        }

        // Upload de PDF
        var pdfInput = document.getElementById('analise-file-input');
        var file = (this._cache && this._cache.arquivoPDF) || (pdfInput?.files?.[0]) || null;

        if (file && window.location.protocol !== 'file:') {
            this._uploadPDF(file, dados, user.uid);
        } else {
            if (file && window.location.protocol === 'file:') {
                GR.Toast.warning('Ambiente local - PDF não será salvo.');
            }
            this._salvarDados(dados, user.uid);
        }
    },

    _uploadPDF: function(file, dados, uid) {
        var filePath = 'analises/' + uid + '/' + Date.now() + '_' + file.name;
        var uploadTask = storage.ref(filePath).put(file);

        GR.Toast.info('📤 Fazendo upload do PDF...');

        uploadTask.then(function(snapshot) {
            return snapshot.ref.getDownloadURL();
        }).then(function(downloadURL) {
            dados.arquivoUrl = downloadURL;
            dados.arquivoNome = file.name;
            dados.arquivoPath = filePath;
            GR.Analises._salvarDados(dados, uid);
        }).catch(function(err) {
            GR.Toast.error('Erro no upload: ' + err.message);
            GR.Analises._salvarDados(dados, uid);
        });
    },

    _salvarDados: function(dados, uid) {
        var ref = db.collection('users').doc(uid).collection('analises');
        var editId = this._cache.analiseEditando || (GR.State && GR.State.ui ? GR.State.ui.analiseEditando : null);
        var isEdit = !!editId;

        var operation = isEdit ? ref.doc(editId).update(dados) : ref.add(dados);
        var successMsg = isEdit ? 'Análise atualizada!' : 'Análise salva!';

        operation.then(function(docRef) {
            if (!isEdit && docRef) {
                dados.id = docRef.id;
                if (GR.State && GR.State.inserirNoCache) {
                    GR.State.inserirNoCache('analises', dados);
                }
            } else if (isEdit) {
                if (GR.State && GR.State.atualizarNoCache) {
                    GR.State.atualizarNoCache('analises', editId, dados);
                }
            }

            GR.Modal.close('modal-analise');
            GR.Toast.success(successMsg);
            
            if (GR.State && GR.State.adicionarHistorico) {
                GR.State.adicionarHistorico(
                    isEdit ? 'editou análise' : 'criou análise', 
                    'Análises', 
                    'Análise: ' + dados.propriedade
                );
            }
            
            if (GR.Analises && GR.Analises._cache) {
                GR.Analises._cache.dadosExtraidos = null;
                GR.Analises._cache.arquivoPDF = null;
                GR.Analises._cache.dresAtual = null;
                GR.Analises._cache.recomendacoesCalculadas = null;
            }
            
            if (GR.UI && GR.UI.refreshCurrentView) {
                GR.UI.refreshCurrentView();
            }
        }).catch(function(err) {
            GR.Toast.error('Erro ao ' + (isEdit ? 'atualizar' : 'salvar') + ': ' + err.message);
            console.error('Erro no Firebase:', err);
        });
    },

    // ============================================================
    // EXCLUIR
    // ============================================================
    excluir: function(id) {
        var item = this._findAnalise(id);
        var nome = item?.propriedade || 'análise';
        
        if (!confirm('⚠️ Tem certeza que deseja excluir a análise de "' + nome + '"?\nEsta ação não pode ser desfeita.')) {
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;

        db.collection('users').doc(uid).collection('analises').doc(id).delete()
            .then(function() {
                if (item && item.arquivoPath) {
                    storage.ref(item.arquivoPath).delete()
                        .catch(function(err) { console.warn('Erro ao excluir arquivo:', err); });
                }
                
                GR.Toast.success('Análise excluída!');
                if (GR.State && GR.State.removerDoCache) {
                    GR.State.removerDoCache('analises', id);
                }
                if (GR.State && GR.State.adicionarHistorico) {
                    GR.State.adicionarHistorico('excluiu análise', 'Análises', 'Análise: ' + nome);
                }
                if (GR.UI && GR.UI.refreshCurrentView) {
                    GR.UI.refreshCurrentView();
                }
            })
            .catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
                console.error('Erro na exclusão:', err);
            });
    },

    // ============================================================
    // UTILITÁRIOS
    // ============================================================
    _findAnalise: function(id) {
        if (!GR.State || !GR.State.data || !GR.State.data.analises) return null;
        for (var i = 0; i < GR.State.data.analises.length; i++) {
            if (GR.State.data.analises[i].id === id) {
                return GR.State.data.analises[i];
            }
        }
        return null;
    },

    _escapeHtml: function(texto) {
        if (!texto) return '';
        var div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    },

    _formatarData: function(data) {
        if (!data) return '-';
        var partes = data.split('-');
        if (partes.length === 3) {
            return partes[2] + '/' + partes[1] + '/' + partes[0];
        }
        return data;
    }
};

// ================================================================
// INICIALIZAÇÃO AUTOMÁTICA
// ================================================================
if (typeof GR !== 'undefined' && GR.Analises) {
    GR.Analises.init();
    console.log('✅ Módulo Análises 2.0 inicializado com sucesso');
}

console.log('📄 Módulo Análises 2.0 carregado');