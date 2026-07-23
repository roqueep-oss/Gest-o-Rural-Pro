// ================================================================
// MÓDULO: CONTRATOS (CRÉDITO) - COMPLETO
// ================================================================

if (typeof GR.Modules === 'undefined') {
    GR.Modules = {};
}

GR.Modules.Contratos = {
    render: function() {
        console.log('📋 Renderizando Contratos...');
        var div = document.getElementById('lista-contratos');
        if (!div) {
            console.warn('⚠️ Elemento lista-contratos não encontrado');
            return;
        }
        var items = GR.State.data.contratos || [];
        var filtrados = items.filter(function(item) {
            if (GR.State.ui.propriedadeAtiva === 'todas') return true;
            return item.propriedade === GR.State.ui.propriedadeAtiva;
        });

        var totalAtivos = 0,
            saldoDevedor = 0,
            totalParcelasPendentes = 0,
            venc15 = 0,
            venc30 = 0,
            venc365 = 0;
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        filtrados.forEach(function(c) {
            if (c.status === 'Ativo') totalAtivos++;
            if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.status === 'Pendente' && p.vencimento) {
                        var valorParcela = parseFloat(p.valor) || 0;
                        saldoDevedor += valorParcela;
                        totalParcelasPendentes++;
                        var venc = new Date(p.vencimento);
                        venc.setHours(0, 0, 0, 0);
                        var diff = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
                        if (diff >= 0 && diff <= 15) venc15++;
                        if (diff >= 0 && diff <= 30) venc30++;
                        if (diff >= 0 && diff <= 365) venc365++;
                    }
                });
            }
        });

        var statsHtml = '<div class="credito-stats-grid">' +
            '<div class="credito-stats-card"><div class="number">' + totalAtivos + '</div><div class="label">📋 Contratos Ativos</div></div>' +
            '<div class="credito-stats-card danger"><div class="number">' + GR.Utils.formatarMoedaBR(saldoDevedor) + '</div><div class="label">💰 Saldo Devedor</div></div>' +
            '<div class="credito-stats-card warning"><div class="number">' + totalParcelasPendentes + '</div><div class="label">📌 Parcelas Pendentes</div></div>' +
            '<div class="credito-stats-card warning"><div class="number">' + venc15 + '</div><div class="label">⚠️ Vence em 15 dias</div></div>' +
            '<div class="credito-stats-card info"><div class="number">' + venc30 + '</div><div class="label">📅 Vence em 30 dias</div></div>' +
            '<div class="credito-stats-card info"><div class="number">' + venc365 + '</div><div class="label">📆 Vence em 365 dias</div></div>' +
            '</div>';

        if (!filtrados.length) {
            div.innerHTML = statsHtml + '<div class="empty-state"><span class="icon">💳</span><div class="message">Nenhuma operação de crédito</div></div>';
            return;
        }

        var rows = filtrados.map(function(c) {
            var totalPendente = 0;
            var parcelasEmAberto = 0;
            
            if (c.parcelas && Array.isArray(c.parcelas)) {
                c.parcelas.forEach(function(p) {
                    if (p.status === 'Pendente') {
                        totalPendente += parseFloat(p.valor) || 0;
                        parcelasEmAberto++;
                    }
                });
            }
            
            var statusBadge = c.status === 'Ativo' ? '<span class="badge badge-success">Ativo</span>' :
                c.status === 'Quitado' ? '<span class="badge badge-info">Quitado</span>' :
                '<span class="badge badge-danger">Cancelado</span>';

            var hasFile = c.arquivoUrl ? 
                '<button class="btn btn-info btn-sm" onclick="GR.Modules.Contratos.visualizarPDF(\'' + c.id + '\')">📄 PDF</button>' : 
                '<span style="color:#999;font-size:10px;">Sem PDF</span>';

            var parcelasInfo = '';
            if (parcelasEmAberto > 0) {
                parcelasInfo = '<span style="color:#ff9800;font-weight:bold;">' + parcelasEmAberto + ' em aberto</span>';
            } else {
                parcelasInfo = '<span style="color:#4caf50;">✅ Quitado</span>';
            }

            // Garantir que a data seja exibida corretamente
            var dataExibicao = c.data || '';
            if (dataExibicao && dataExibicao.includes('-')) {
                var partes = dataExibicao.split('-');
                if (partes.length === 3) {
                    dataExibicao = partes[2] + '/' + partes[1] + '/' + partes[0];
                }
            }

            return '<tr>' +
                '<td><strong>' + GR.Utils.escapeHtml(c.numero) + '</strong></td>' +
                '<td>' + GR.Utils.escapeHtml(c.propriedade) + '</td>' +
                '<td>' + dataExibicao + '</td>' +
                '<td>' + GR.Utils.formatarMoedaBR(c.valor) + '</td>' +
                '<td>' + GR.Utils.formatarMoedaBR(totalPendente) + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + parcelasInfo + '</td>' +
                '<td>' + hasFile + '</td>' +
                '<td>' +
                '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Contratos.editar(\'' + c.id + '\')">✏️</button>' +
                '<button class="btn btn-info btn-sm" onclick="GR.Vencimentos.verParcelas(\'' + c.id + '\')">📅</button>' +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Contratos.excluir(\'' + c.id + '\')">🗑️</button>' +
                '</td>' +
                '</tr>';
        }).join('');

        div.innerHTML = statsHtml +
            '<div class="table-responsive"><table><thead><tr>' +
            '<th>Nº</th>' +
            '<th>Propriedade</th>' +
            '<th>Data</th>' +
            '<th>Valor</th>' +
            '<th>Pendente</th>' +
            '<th>Status</th>' +
            '<th>Parcelas em Aberto</th>' +
            '<th>PDF</th>' +
            '<th>Ações</th>' +
            '</tr></thead><tbody>' +
            rows + '</tbody></table></div>';
    },

    abrirModal: function(editId) {
        console.log('🔓 GR.Modules.Contratos.abrirModal chamado!');
        GR.State.ui.contratoEditando = editId || null;
        
        var titleEl = document.getElementById('modal-contrato-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Operação' : '💳 Nova Operação de Crédito';
        
        var campos = ['contrato-propriedade', 'contrato-numero', 'contrato-data', 'contrato-valor',
            'contrato-status', 'contrato-taxa-juros', 'contrato-saldo-quitacao', 'contrato-data-saldo',
            'contrato-modalidade', 'contrato-mutuario', 'contrato-instituicao'
        ];
        campos.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
        });

        var preview = document.getElementById('pdf-preview');
        if (preview) preview.style.display = 'none';
        var info = document.getElementById('pdf-info-geral');
        if (info) info.style.display = 'none';
        
        var parcelasInfo = document.getElementById('parcelas-info');
        if (parcelasInfo) parcelasInfo.textContent = 'Parcelas em aberto: 0 | Liquidadas: 0';

        var statusEl = document.getElementById('pdf-status');
        if (statusEl) statusEl.textContent = 'Nenhum';

        this._parcelasTemp = [];
        this._preencherTabelaParcelas([]);

        GR.UI._atualizarSelectsPropriedade();

        if (editId) {
            var item = GR.State.data.contratos.find(function(c) { return c.id === editId; });
            if (item) {
                var propEl = document.getElementById('contrato-propriedade');
                if (propEl) propEl.value = item.propriedade || '';
                var numEl = document.getElementById('contrato-numero');
                if (numEl) numEl.value = item.numero || '';
                
                var dataEl = document.getElementById('contrato-data');
                if (dataEl) {
                    var dataValue = item.data || '';
                    if (dataValue && dataValue.includes('/')) {
                        var partes = dataValue.split('/');
                        if (partes.length === 3) {
                            dataValue = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                        }
                    }
                    dataEl.value = dataValue;
                }
                
                var valEl = document.getElementById('contrato-valor');
                if (valEl) valEl.value = GR.Utils.formatarMoedaSemSimbolo(item.valor || 0);
                var statusEl2 = document.getElementById('contrato-status');
                if (statusEl2) statusEl2.value = item.status || 'Ativo';
                var taxaEl = document.getElementById('contrato-taxa-juros');
                if (taxaEl) taxaEl.value = item.taxaJuros || '';
                var saldoEl = document.getElementById('contrato-saldo-quitacao');
                if (saldoEl) saldoEl.value = GR.Utils.formatarMoedaSemSimbolo(item.saldoQuitacao || 0);
                var dsEl = document.getElementById('contrato-data-saldo');
                if (dsEl) {
                    var dsValue = item.dataSaldo || '';
                    if (dsValue && dsValue.includes('/')) {
                        var partes = dsValue.split('/');
                        if (partes.length === 3) {
                            dsValue = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                        }
                    }
                    dsEl.value = dsValue;
                }
                var modEl = document.getElementById('contrato-modalidade');
                if (modEl) modEl.value = item.modalidade || '';
                var mutEl = document.getElementById('contrato-mutuario');
                if (mutEl) mutEl.value = item.mutuario || '';
                var instEl = document.getElementById('contrato-instituicao');
                if (instEl) instEl.value = item.instituicao || '';
                
                if (item.parcelas && item.parcelas.length > 0) {
                    this._parcelasTemp = JSON.parse(JSON.stringify(item.parcelas));
                    this._parcelasTemp = this._parcelasTemp.map(function(p) {
                        var novaP = JSON.parse(JSON.stringify(p));
                        if (novaP.vencimento) {
                            var partes = novaP.vencimento.split('/');
                            if (partes.length === 3) {
                                novaP.vencimento = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                            }
                        }
                        if (novaP.dataPagamento) {
                            var partes = novaP.dataPagamento.split('/');
                            if (partes.length === 3) {
                                novaP.dataPagamento = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                            }
                        }
                        return novaP;
                    });
                    this._preencherTabelaParcelas(this._parcelasTemp);
                }
            }
        }
        
        var pdfInput = document.getElementById('pdf-file-input');
        if (pdfInput) {
            pdfInput.onchange = null;
            pdfInput.onchange = function(e) {
                if (this.files && this.files[0]) {
                    GR.Modules.Contratos.processarPDF(this.files[0]);
                }
            };
        }

        GR.Modal.open('modal-contrato');
    },

    // ================================================================
    // BUSCAR DATA DE LIBERAÇÃO - FUNÇÃO COMPLEMENTAR
    // ================================================================
    _buscarDataLiberacao: function(texto) {
        console.log('🔍 Buscando Data de Liberação...');
        
        var dataEncontrada = '';
        
        // 1º TENTATIVA: Campo "Data Operação"
        var dataOperacaoMatch = texto.match(/Data\s+Operação\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (dataOperacaoMatch) {
            dataEncontrada = dataOperacaoMatch[1].trim();
            console.log('📅 Data Liberação (campo Data Operação):', dataEncontrada);
            return dataEncontrada;
        }
        
        // 2º TENTATIVA: Seção "Liberações Efetuadas" - Padrão 1 (com aspas)
        console.log('🔄 Buscando em "Liberações Efetuadas" (com aspas)...');
        var liberacoesMatch1 = texto.match(/Liberações\s+Efetuadas[\s\S]*?1\s+[0-9.,]+\s+"([0-9]{2}\/[0-9]{2}\/[0-9]{4})"/i);
        if (liberacoesMatch1) {
            dataEncontrada = liberacoesMatch1[1].trim();
            console.log('📅 Data Liberação (Liberações Efetuadas com aspas):', dataEncontrada);
            return dataEncontrada;
        }
        
        // 3º TENTATIVA: Seção "Liberações Efetuadas" - Padrão 2 (sem aspas)
        console.log('🔄 Buscando em "Liberações Efetuadas" (sem aspas)...');
        var liberacoesMatch2 = texto.match(/Liberações\s+Efetuadas[\s\S]*?1\s+[0-9.,]+\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (liberacoesMatch2) {
            dataEncontrada = liberacoesMatch2[1].trim();
            console.log('📅 Data Liberação (Liberações Efetuadas sem aspas):', dataEncontrada);
            return dataEncontrada;
        }
        
        // 4º TENTATIVA: Padrão "Nº da Parcela 1 ... Data da Liberação ... [data]"
        console.log('🔄 Buscando padrão alternativo de liberação...');
        var parcela1Match = texto.match(/1\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+[0-9.,]+/i);
        if (parcela1Match) {
            dataEncontrada = parcela1Match[1].trim();
            console.log('📅 Data Liberação (parcela 1):', dataEncontrada);
            return dataEncontrada;
        }
        
        // 5º TENTATIVA: Buscar qualquer data que apareça após "Liberações Efetuadas"
        console.log('🔄 Buscando data genérica após "Liberações Efetuadas"...');
        var liberacoesGenMatch = texto.match(/Liberações\s+Efetuadas[\s\S]*?([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (liberacoesGenMatch) {
            dataEncontrada = liberacoesGenMatch[1].trim();
            console.log('📅 Data Liberação (genérica após Liberações):', dataEncontrada);
            return dataEncontrada;
        }
        
        // 6º TENTATIVA: Fallback - data de emissão
        console.log('🔄 Usando fallback - data de emissão...');
        var fallbackData = texto.match(/Data\s+de\s+Emissão\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (fallbackData) {
            dataEncontrada = fallbackData[1].trim();
            console.log('📅 Data Liberação (fallback - data emissão):', dataEncontrada);
            return dataEncontrada;
        }
        
        console.warn('⚠️ Nenhuma data de liberação encontrada!');
        return dataEncontrada;
    },

    // ================================================================
    // PROCESSAR PDF
    // ================================================================
    processarPDF: function(file) {
        console.log('📄 GR.Modules.Contratos.processarPDF chamado!', file);
        
        if (!file) {
            GR.Toast.error('Nenhum arquivo selecionado!');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            GR.Toast.error('Arquivo muito grande (máx 10MB).');
            return;
        }

        var statusEl = document.getElementById('pdf-status');
        if (statusEl) statusEl.textContent = '🔄 Processando...';

        if (typeof pdfjsLib === 'undefined') {
            GR.Toast.error('PDF.js não carregado.');
            if (statusEl) statusEl.textContent = '❌ Erro';
            return;
        }

        var reader = new FileReader();
        var self = this;

        reader.onload = function(e) {
            var arrayBuffer = e.target.result;

            try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            } catch (err) {}

            pdfjsLib.getDocument({ data: arrayBuffer }).promise
                .then(function(pdf) {
                    var textoCompleto = '';
                    var promises = [];

                    for (var i = 1; i <= pdf.numPages; i++) {
                        promises.push(pdf.getPage(i).then(function(page) {
                            return page.getTextContent().then(function(textContent) {
                                if (textContent && textContent.items) {
                                    textoCompleto += textContent.items.map(function(item) { return item.str || ''; }).join(' ') + '\n';
                                }
                            });
                        }));
                    }

                    return Promise.all(promises).then(function() { return textoCompleto; });
                })
                .then(function(texto) {
                    self._pdfTexto = texto;
                    console.log('📄 TEXTO COMPLETO EXTRAÍDO DO PDF:');
                    console.log(texto);
                    
                    var dadosBrutos = self._extrairTodosOsDados(texto);
                    console.log('📊 DADOS BRUTOS EXTRAÍDOS:', dadosBrutos);
                    
                    var dadosMapeados = self._mapearDados(dadosBrutos);
                    console.log('📊 DADOS MAPEADOS:', dadosMapeados);
                    
                    self._dadosExtraidos = dadosMapeados;
                    self._preencherCampos(dadosMapeados);
                    
                    // ============================================================
                    // MESCLAR TODAS AS PARCELAS (ABERTAS + LIQUIDADAS)
                    // ============================================================
                    var todasParcelas = [];
                    
                    if (dadosMapeados.parcelasAbertas && dadosMapeados.parcelasAbertas.length > 0) {
                        dadosMapeados.parcelasAbertas.forEach(function(p) {
                            todasParcelas.push({
                                numero: p.numero || 0,
                                vencimento: p.dataVencimento || p.vencimento || '',
                                valor: p.valor || 0,
                                status: p.status || 'Pendente',
                                dataPagamento: p.dataPagamento || '',
                                historico: p.historico || ''
                            });
                        });
                    }
                    
                    if (dadosMapeados.parcelasLiquidadas && dadosMapeados.parcelasLiquidadas.length > 0) {
                        dadosMapeados.parcelasLiquidadas.forEach(function(p) {
                            todasParcelas.push({
                                numero: p.numero || 0,
                                vencimento: p.dataVencimento || p.vencimento || '',
                                valor: p.valorPago || p.valor || 0,
                                status: p.status || 'Pago',
                                dataPagamento: p.dataPagamento || '',
                                historico: p.historico || ''
                            });
                        });
                    }
                    
                    todasParcelas.sort(function(a, b) {
                        return (a.numero || 0) - (b.numero || 0);
                    });
                    
                    console.log('📋 TODAS AS PARCELAS (abertas + liquidadas):', todasParcelas);
                    console.log('📋 Quantidade total:', todasParcelas.length);
                    
                    if (todasParcelas.length > 0) {
                        todasParcelas = todasParcelas.map(function(p) {
                            var novaP = JSON.parse(JSON.stringify(p));
                            if (novaP.vencimento) {
                                var partes = novaP.vencimento.split('/');
                                if (partes.length === 3) {
                                    novaP.vencimento = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                                }
                            }
                            if (novaP.dataPagamento) {
                                var partes = novaP.dataPagamento.split('/');
                                if (partes.length === 3) {
                                    novaP.dataPagamento = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                                }
                            }
                            return novaP;
                        });
                        
                        self._parcelasTemp = JSON.parse(JSON.stringify(todasParcelas));
                        setTimeout(function() {
                            self._preencherTabelaParcelas(self._parcelasTemp);
                            console.log('✅ Tabela com TODAS as parcelas preenchida!');
                        }, 300);
                    } else {
                        console.warn('⚠️ Nenhuma parcela extraída do PDF');
                        self._parcelasTemp = [];
                        self._preencherTabelaParcelas([]);
                    }
                    // ============================================================
                    
                    var preview = document.getElementById('pdf-preview');
                    if (preview) preview.style.display = 'block';
                    var info = document.getElementById('pdf-info-geral');
                    if (info) info.style.display = 'block';
                    
                    var parcelasInfo = document.getElementById('parcelas-info');
                    if (parcelasInfo) {
                        var abertas = dadosMapeados.parcelasAbertas ? dadosMapeados.parcelasAbertas.length : 0;
                        var liquidadas = dadosMapeados.parcelasLiquidadas ? dadosMapeados.parcelasLiquidadas.length : 0;
                        parcelasInfo.textContent = 'Parcelas em aberto: ' + abertas + ' | Liquidadas: ' + liquidadas + ' | Total: ' + (abertas + liquidadas);
                    }
                    
                    if (statusEl) statusEl.textContent = '✅ Dados extraídos!';
                    
                    GR.Toast.success('PDF processado! ' + todasParcelas.length + ' parcelas extraídas.');
                })
                .catch(function(err) {
                    console.error('❌ Erro no PDF:', err);
                    GR.Toast.error('Erro ao processar: ' + err.message);
                    if (statusEl) statusEl.textContent = '❌ Erro';
                });
        };

        reader.readAsArrayBuffer(file);
    },

    // ================================================================
    // EXTRAIR TODOS OS DADOS DO TEXTO
    // ================================================================
    _extrairTodosOsDados: function(texto) {
        console.log('🔍 Extraindo TODOS os dados do texto...');
        
        var dados = {
            contrato: '',
            matricula: '',
            cliente: '',
            modalidade: '',
            instituicao: '',
            taxaJuros: 0,
            valorOperacao: 0,
            saldoQuitacao: 0,
            dataEmissao: '',
            dataOperacao: '',
            dataVencto: '',
            cooperativa: '',
            prazo: '',
            valorLiquido: 0,
            taxaMulta: 0,
            taxaMora: 0,
            parcelasAbertas: [],
            parcelasLiquidadas: [],
            totalParcelasAbertas: 0,
            totalParcelasLiquidadas: 0,
            valorParcelasAbertas: 0,
            valorParcelasLiquidadas: 0
        };

        // DATA DE EMISSÃO
        var dataEmissaoMatch = texto.match(/Data\s+de\s+Emissão\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (dataEmissaoMatch) {
            dados.dataEmissao = dataEmissaoMatch[1].trim();
            console.log('📅 Data Emissão:', dados.dataEmissao);
        }

        // ================================================================
        // DATA OPERAÇÃO (LIBERAÇÃO) - USANDO A NOVA FUNÇÃO
        // ================================================================
        dados.dataOperacao = this._buscarDataLiberacao(texto);
        console.log('📅 Data Liberação final:', dados.dataOperacao);

        // DATA VENCTO
        var dataVenctoMatch = texto.match(/Data\s+Vencto\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (dataVenctoMatch) {
            dados.dataVencto = dataVenctoMatch[1].trim();
            console.log('📅 Data Vencto:', dados.dataVencto);
        }

        // CONTRATO (Nº)
        var contratoMatch = texto.match(/Contrato\s*:\s*([0-9]+)/i);
        if (contratoMatch) {
            dados.contrato = contratoMatch[1].trim();
            console.log('📄 Nº Contrato:', dados.contrato);
        } else {
            var fallbackContrato = texto.match(/- % a\.a\s+([0-9]+)\s+3-SAC/);
            if (fallbackContrato) {
                dados.contrato = fallbackContrato[1].trim();
                console.log('📄 Nº Contrato (fallback):', dados.contrato);
            }
        }

        // MATRÍCULA
        var matriculaMatch = texto.match(/Matrícula\s*:\s*([0-9]+)/i);
        if (matriculaMatch) {
            dados.matricula = matriculaMatch[1].trim();
            console.log('📄 Matrícula:', dados.matricula);
        }

        // CLIENTE (MUTUÁRIO)
        var clienteMatch = texto.match(/[0-9]+-[0-9]+\s+([A-Z][A-Z\s]+?)(?=\s+[0-9]+\s+[0-9]+-ACI)/);
        if (clienteMatch) {
            dados.cliente = clienteMatch[1].trim();
            console.log('👤 Cliente:', dados.cliente);
        }

        // MODALIDADE
        var modalidadeMatch = texto.match(/[0-9]+-ACI\s*-\s*([A-Za-zÀ-Üà-ü\s]+?)(?=\s+[0-9,]+)/);
        if (modalidadeMatch) {
            dados.modalidade = modalidadeMatch[1].trim();
            console.log('🏷️ Modalidade:', dados.modalidade);
        }

        // INSTITUIÇÃO / COOPERATIVA
        var instituicaoMatch = texto.match(/([0-9]+-[A-Za-zÀ-Üà-ü]+)\s+-\s+PA\s+RIO\s+BANANAL/);
        if (instituicaoMatch) {
            var inst = instituicaoMatch[1].trim();
            var partes = inst.split('-');
            if (partes.length > 1) {
                dados.instituicao = partes[1].trim();
            } else {
                dados.instituicao = inst;
            }
            console.log('🏦 Instituição:', dados.instituicao);
        }
        var cooperativaMatch = texto.match(/Cooperativa\s*:\s*([0-9]+)/);
        if (cooperativaMatch) {
            dados.cooperativa = cooperativaMatch[1].trim();
            console.log('🏦 Cooperativa:', dados.cooperativa);
        }

        // TAXAS
        var taxaJurosMatch = texto.match(/Taxa\s+Juros\s*:\s*([0-9]+[,.]?[0-9]*)/);
        if (taxaJurosMatch) {
            dados.taxaJuros = parseFloat(taxaJurosMatch[1].trim().replace(',', '.')) || 0;
            console.log('📊 Taxa Juros:', dados.taxaJuros);
        } else {
            var fallbackTaxa = texto.match(/PRONAF REPASSE\s+([0-9,]+)\s+1,0000/);
            if (fallbackTaxa) {
                dados.taxaJuros = parseFloat(fallbackTaxa[1].trim().replace(',', '.')) || 0;
                console.log('📊 Taxa Juros (fallback):', dados.taxaJuros);
            }
        }
        var taxaMultaMatch = texto.match(/Taxa\s+Multa\s*:\s*([0-9]+[,.]?[0-9]*)/);
        if (taxaMultaMatch) {
            dados.taxaMulta = parseFloat(taxaMultaMatch[1].trim().replace(',', '.')) || 0;
            console.log('📊 Taxa Multa:', dados.taxaMulta);
        }
        var taxaMoraMatch = texto.match(/Taxa\s+Mora\s*:\s*([0-9]+[,.]?[0-9]*)/);
        if (taxaMoraMatch) {
            dados.taxaMora = parseFloat(taxaMoraMatch[1].trim().replace(',', '.')) || 0;
            console.log('📊 Taxa Mora:', dados.taxaMora);
        }

        // VALORES
        var valorOperacaoMatch = texto.match(/Valor\s+Operação\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/);
        if (valorOperacaoMatch) {
            var v = valorOperacaoMatch[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            dados.valorOperacao = parseFloat(v) || 0;
            console.log('💰 Valor Operação:', dados.valorOperacao);
        } else {
            var fallbackValor = texto.match(/1,0000\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+2,00/);
            if (fallbackValor) {
                var v = fallbackValor[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                dados.valorOperacao = parseFloat(v) || 0;
                console.log('💰 Valor Operação (fallback):', dados.valorOperacao);
            }
        }
        var valorLiquidoMatch = texto.match(/Valor\s+Líquido\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/);
        if (valorLiquidoMatch) {
            var v = valorLiquidoMatch[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            dados.valorLiquido = parseFloat(v) || 0;
            console.log('💰 Valor Líquido:', dados.valorLiquido);
        }

        // SALDO QUITAÇÃO
        var saldoMatch = texto.match(/([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+Taxa\s+Juros\s+Inad/);
        if (saldoMatch) {
            var s = saldoMatch[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            dados.saldoQuitacao = parseFloat(s) || 0;
            console.log('💰 Saldo Quitação:', dados.saldoQuitacao);
        } else {
            var saldoQuit = texto.match(/Saldo\s+p\/\s+Quitação\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/);
            if (saldoQuit) {
                var s = saldoQuit[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
                dados.saldoQuitacao = parseFloat(s) || 0;
                console.log('💰 Saldo Quitação (fallback):', dados.saldoQuitacao);
            }
        }

        // PRAZO
        var prazoMatch = texto.match(/Prazo\s*:\s*([0-9]+)/);
        if (prazoMatch) {
            dados.prazo = prazoMatch[1].trim();
            console.log('📋 Prazo:', dados.prazo);
        }

        // ================================================================
        // PARCELAS EM ABERTO
        // ================================================================
        console.log('🔍 Buscando "Parcelas em Aberto"...');
        
        var abertoIndex = texto.search(/Parcelas\s+em\s+Aberto/i);
        var liquidadoIndex = texto.search(/Parcelas\s+Liquidadas/i);
        
        console.log('📌 Índice "Parcelas em Aberto":', abertoIndex);
        console.log('📌 Índice "Parcelas Liquidadas":', liquidadoIndex);
        
        if (abertoIndex !== -1) {
            var inicioAberto = abertoIndex;
            var fimAberto = liquidadoIndex !== -1 ? liquidadoIndex : texto.length;
            var secaoAberto = texto.substring(inicioAberto, fimAberto);
            
            console.log('📄 Seção de Parcelas em Aberto:', secaoAberto.substring(0, 500));
            
            var padraoAberto = /([0-9]+)\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+[0-9,]+\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g;
            var abertas = [];
            var valorAbertas = 0;
            var match;
            
            while ((match = padraoAberto.exec(secaoAberto)) !== null) {
                var numero = parseInt(match[1]) || 0;
                var dataVencimento = match[2].trim();
                var valor = parseFloat(match[3].replace(/[^0-9,]/g, '').replace(',', '.'));
                
                if (valor > 0) {
                    abertas.push({
                        numero: numero,
                        dataVencimento: dataVencimento,
                        valor: valor,
                        status: 'Pendente',
                        dataPagamento: '',
                        historico: ''
                    });
                    valorAbertas += valor;
                    console.log('✅ Parcela em aberto:', numero, dataVencimento, 'R$', valor);
                }
            }
            
            // Se não encontrou, tentar padrão alternativo
            if (abertas.length === 0) {
                console.log('🔄 Tentando padrão alternativo para parcelas em aberto...');
                var padraoAlt = /([0-9]+)\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+[0-9,]+\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g;
                while ((match = padraoAlt.exec(secaoAberto)) !== null) {
                    var numero = parseInt(match[1]) || 0;
                    var dataVencimento = match[2].trim();
                    var valor = parseFloat(match[3].replace(/[^0-9,]/g, '').replace(',', '.'));
                    
                    if (valor > 0) {
                        abertas.push({
                            numero: numero,
                            dataVencimento: dataVencimento,
                            valor: valor,
                            status: 'Pendente',
                            dataPagamento: '',
                            historico: ''
                        });
                        valorAbertas += valor;
                        console.log('✅ Parcela em aberto (alt):', numero, dataVencimento, 'R$', valor);
                    }
                }
            }
            
            dados.parcelasAbertas = abertas;
            dados.totalParcelasAbertas = abertas.length;
            dados.valorParcelasAbertas = valorAbertas;
            console.log('📋 Total Parcelas em Aberto:', abertas.length, 'parcelas, total: R$', valorAbertas);
        }

        // ================================================================
        // PARCELAS LIQUIDADAS
        // ================================================================
        console.log('🔍 Buscando "Parcelas Liquidadas"...');
        
        if (liquidadoIndex !== -1) {
            var secaoLiquidado = texto.substring(liquidadoIndex);
            
            console.log('📄 Seção de Parcelas Liquidadas:', secaoLiquidado.substring(0, 500));
            
            var padraoLiq = /([0-9]+)\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+([A-Za-zÀ-Üà-ü0-9\s\/\.-]+?)\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+[0-9,]+\s+[0-9,]+\s+[0-9,]+\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/g;
            
            var liquidadas = [];
            var valorLiquidadas = 0;
            var matchLiq;
            
            while ((matchLiq = padraoLiq.exec(secaoLiquidado)) !== null) {
                var numero = parseInt(matchLiq[1]) || 0;
                var dataVencimento = matchLiq[2].trim();
                var historico = matchLiq[3].trim();
                var valorPago = parseFloat(matchLiq[4].replace(/[^0-9,]/g, '').replace(',', '.'));
                var dataPagamento = matchLiq[5].trim();
                
                if (valorPago > 0) {
                    liquidadas.push({
                        numero: numero,
                        dataVencimento: dataVencimento,
                        historico: historico,
                        valorPago: valorPago,
                        dataPagamento: dataPagamento,
                        status: 'Pago'
                    });
                    valorLiquidadas += valorPago;
                    console.log('✅ Parcela liquidada:', numero, dataVencimento, 'R$', valorPago, 'Pagto:', dataPagamento);
                }
            }
            
            if (liquidadas.length === 0) {
                console.log('🔄 Tentando padrão alternativo para liquidadas...');
                var padraoAlt = /([0-9]+)\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+([A-Za-zÀ-Üà-ü0-9\s\/\.-]+?)\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g;
                while ((matchLiq = padraoAlt.exec(secaoLiquidado)) !== null) {
                    var numero = parseInt(matchLiq[1]) || 0;
                    var dataVencimento = matchLiq[2].trim();
                    var historico = matchLiq[3].trim();
                    var valorPago = parseFloat(matchLiq[4].replace(/[^0-9,]/g, '').replace(',', '.'));
                    
                    if (valorPago > 0) {
                        liquidadas.push({
                            numero: numero,
                            dataVencimento: dataVencimento,
                            historico: historico,
                            valorPago: valorPago,
                            dataPagamento: '',
                            status: 'Pago'
                        });
                        valorLiquidadas += valorPago;
                        console.log('✅ Parcela liquidada (alt):', numero, dataVencimento, 'R$', valorPago);
                    }
                }
            }
            
            dados.parcelasLiquidadas = liquidadas;
            dados.totalParcelasLiquidadas = liquidadas.length;
            dados.valorParcelasLiquidadas = valorLiquidadas;
            console.log('📋 Total Parcelas Liquidadas:', liquidadas.length, 'parcelas, total: R$', valorLiquidadas);
        }

        console.log('✅ Extração completa concluída!');
        console.log('📊 Resumo: Abertas=' + dados.parcelasAbertas.length + ', Liquidadas=' + dados.parcelasLiquidadas.length);
        return dados;
    },

    // ================================================================
    // MAPEAR DADOS BRUTOS
    // ================================================================
    _mapearDados: function(dadosBrutos) {
        return {
            numeroContrato: dadosBrutos.contrato || dadosBrutos.matricula || '',
            mutuario: dadosBrutos.cliente || '',
            valorOperacao: dadosBrutos.valorOperacao || dadosBrutos.valorLiquido || 0,
            modalidade: dadosBrutos.modalidade || '',
            instituicao: dadosBrutos.instituicao || dadosBrutos.cooperativa || '',
            taxaJuros: dadosBrutos.taxaJuros || 0,
            dataLiberacao: dadosBrutos.dataOperacao || dadosBrutos.dataVencto || '',
            saldoQuitacao: dadosBrutos.saldoQuitacao || 0,
            dataQuitacao: dadosBrutos.dataEmissao || '',
            parcelasAbertas: dadosBrutos.parcelasAbertas || [],
            parcelasLiquidadas: dadosBrutos.parcelasLiquidadas || [],
            totalParcelasAbertas: dadosBrutos.totalParcelasAbertas || 0,
            totalParcelasLiquidadas: dadosBrutos.totalParcelasLiquidadas || 0,
            valorParcelasAbertas: dadosBrutos.valorParcelasAbertas || 0,
            valorParcelasLiquidadas: dadosBrutos.valorParcelasLiquidadas || 0
        };
    },

    // ================================================================
    // PREENCHER CAMPOS
    // ================================================================
    _preencherCampos: function(dados) {
        console.log('📝 Preenchendo campos...');
        console.log('📝 Dados recebidos:', dados);
        
        if (dados.numeroContrato) {
            var el = document.getElementById('contrato-numero');
            if (el) {
                el.value = dados.numeroContrato;
                console.log('📝 Número do Contrato preenchido:', dados.numeroContrato);
            }
        }
        
        if (dados.mutuario) {
            var el = document.getElementById('contrato-mutuario');
            if (el) {
                el.value = dados.mutuario;
                console.log('📝 Mutuário preenchido:', dados.mutuario);
            }
        }
        
        if (dados.valorOperacao > 0) {
            var el = document.getElementById('contrato-valor');
            if (el) {
                el.value = GR.Utils.formatarMoedaSemSimbolo(dados.valorOperacao);
                console.log('📝 Valor preenchido:', dados.valorOperacao);
            }
        }
        
        if (dados.modalidade) {
            var el = document.getElementById('contrato-modalidade');
            if (el) {
                el.value = dados.modalidade;
                console.log('📝 Modalidade preenchida:', dados.modalidade);
            }
        }
        
        if (dados.instituicao) {
            var el = document.getElementById('contrato-instituicao');
            if (el) {
                el.value = dados.instituicao;
                console.log('📝 Instituição preenchida:', dados.instituicao);
            }
        }
        
        if (dados.taxaJuros > 0) {
            var el = document.getElementById('contrato-taxa-juros');
            if (el) {
                el.value = dados.taxaJuros;
                console.log('📝 Taxa preenchida:', dados.taxaJuros);
            }
        }
        
        if (dados.dataLiberacao) {
            var partes = dados.dataLiberacao.split(/[\/-]/);
            if (partes.length === 3) {
                var el = document.getElementById('contrato-data');
                if (el) {
                    el.value = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                    console.log('📝 Data Liberação preenchida:', dados.dataLiberacao);
                }
            }
        }
        
        if (dados.saldoQuitacao > 0) {
            var el = document.getElementById('contrato-saldo-quitacao');
            if (el) {
                el.value = GR.Utils.formatarMoedaSemSimbolo(dados.saldoQuitacao);
                console.log('📝 Saldo Quitação preenchido:', dados.saldoQuitacao);
            }
        }
        
        if (dados.dataQuitacao) {
            var partes = dados.dataQuitacao.split(/[\/-]/);
            if (partes.length === 3) {
                var el = document.getElementById('contrato-data-saldo');
                if (el) {
                    el.value = partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                    console.log('📝 Data Quitação preenchida:', dados.dataQuitacao);
                }
            }
        }

        var els = {
            'pdf-data-liberacao': dados.dataLiberacao || '-',
            'pdf-valor-liberacao': dados.valorOperacao > 0 ? GR.Utils.formatarMoedaBR(dados.valorOperacao) : '-',
            'pdf-cliente': dados.mutuario || '-',
            'pdf-numero-contrato': dados.numeroContrato || '-',
            'pdf-taxa-juros': dados.taxaJuros > 0 ? dados.taxaJuros + '%' : '-',
            'pdf-saldo-quitacao': dados.saldoQuitacao > 0 ? GR.Utils.formatarMoedaBR(dados.saldoQuitacao) : '-',
            'pdf-data-saldo': dados.dataQuitacao || '-',
            'pdf-modalidade': dados.modalidade || '-',
            'pdf-instituicao': dados.instituicao || '-'
        };
        
        for (var id in els) {
            var el = document.getElementById(id);
            if (el) el.textContent = els[id];
        }
    },

    // ================================================================
    // GERENCIAR PARCELAS NA TABELA
    // ================================================================
    _preencherTabelaParcelas: function(parcelas) {
        console.log('📝 _preencherTabelaParcelas chamado com:', parcelas);
        var tbody = document.getElementById('parcelas-tbody');
        if (!tbody) {
            console.warn('⚠️ tbody não encontrado!');
            return;
        }
        tbody.innerHTML = '';
        if (!parcelas || !parcelas.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:6px;">Nenhuma parcela cadastrada</td></tr>';
            this._atualizarTotaisParcelas();
            return;
        }
        console.log('📝 Exibindo ' + parcelas.length + ' parcelas');
        
        var self = this;
        parcelas.forEach(function(p, index) {
            var tr = document.createElement('tr');
            tr.dataset.index = index;
            
            var vencimento = p.vencimento || '';
            var dataPagamento = p.dataPagamento || '';
            
            var converterData = function(dataStr) {
                if (!dataStr) return '';
                if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) return dataStr;
                var partes = dataStr.split('/');
                if (partes.length === 3) {
                    return partes[2] + '-' + partes[1].padStart(2, '0') + '-' + partes[0].padStart(2, '0');
                }
                return dataStr;
            };
            
            var vencimentoISO = converterData(vencimento);
            var dataPagamentoISO = converterData(dataPagamento);
            
            tr.innerHTML = `
                <td><input type="number" class="form-control" style="width:50px;font-size:10px;padding:2px;" value="${p.numero || ''}" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'numero', this.value)"></td>
                <td><input type="date" class="form-control" style="width:90px;font-size:10px;padding:2px;" value="${vencimentoISO}" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'vencimento', this.value)"></td>
                <td><input type="text" class="form-control" style="width:80px;font-size:10px;padding:2px;" value="${p.valor ? GR.Utils.formatarMoedaSemSimbolo(p.valor) : '0,00'}" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'valor', this.value)"></td>
                <td>
                    <select class="form-control" style="width:80px;font-size:10px;padding:2px;" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'status', this.value)">
                        <option value="Pendente" ${p.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Pago" ${p.status === 'Pago' ? 'selected' : ''}>Pago</option>
                    </select>
                </td>
                <td><input type="date" class="form-control" style="width:90px;font-size:10px;padding:2px;" value="${dataPagamentoISO}" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'dataPagamento', this.value)"></td>
                <td><input type="text" class="form-control" style="width:100px;font-size:10px;padding:2px;" value="${p.historico || ''}" onchange="GR.Modules.Contratos._atualizarParcela(${index}, 'historico', this.value)"></td>
                <td><button class="btn btn-danger btn-sm" onclick="GR.Modules.Contratos._removerParcela(${index})" style="padding:0 4px;font-size:10px;">✕</button></td>
            `;
            tbody.appendChild(tr);
        });
        this._atualizarTotaisParcelas();
    },

    _atualizarParcela: function(index, campo, valor) {
        if (!this._parcelasTemp) this._parcelasTemp = [];
        if (!this._parcelasTemp[index]) {
            this._parcelasTemp[index] = { numero: 0, vencimento: '', valor: 0, status: 'Pendente', dataPagamento: '', historico: '' };
        }
        
        if (campo === 'vencimento' || campo === 'dataPagamento') {
            if (valor) {
                var partes = valor.split('-');
                if (partes.length === 3) {
                    valor = partes[2] + '/' + partes[1] + '/' + partes[0];
                }
            }
        }
        
        if (campo === 'valor') {
            valor = GR.Utils.parseMoedaBR(valor);
        }
        
        if (campo === 'numero') {
            valor = parseInt(valor) || 0;
        }
        
        this._parcelasTemp[index][campo] = valor;
        this._atualizarTotaisParcelas();
    },

    _removerParcela: function(index) {
        if (!this._parcelasTemp) this._parcelasTemp = [];
        if (index >= 0 && index < this._parcelasTemp.length) {
            this._parcelasTemp.splice(index, 1);
            this._preencherTabelaParcelas(this._parcelasTemp);
            this._atualizarTotaisParcelas();
        }
    },

    adicionarParcela: function() {
        if (!this._parcelasTemp) this._parcelasTemp = [];
        var ultimoNumero = 0;
        if (this._parcelasTemp.length > 0) {
            ultimoNumero = this._parcelasTemp[this._parcelasTemp.length - 1].numero || 0;
        }
        this._parcelasTemp.push({
            numero: ultimoNumero + 1,
            vencimento: '',
            valor: 0,
            status: 'Pendente',
            dataPagamento: '',
            historico: ''
        });
        this._preencherTabelaParcelas(this._parcelasTemp);
        this._atualizarTotaisParcelas();
    },

    removerUltimaParcela: function() {
        if (!this._parcelasTemp || this._parcelasTemp.length === 0) {
            GR.Toast.warning('Nenhuma parcela para remover');
            return;
        }
        this._parcelasTemp.pop();
        this._preencherTabelaParcelas(this._parcelasTemp);
        this._atualizarTotaisParcelas();
    },

    _atualizarTotaisParcelas: function() {
        var total = document.getElementById('total-parcelas');
        var totalValor = document.getElementById('total-parcelas-valor');
        if (!total || !totalValor) return;
        var parcelas = this._parcelasTemp || [];
        total.textContent = parcelas.length;
        var soma = parcelas.reduce(function(acc, p) { return acc + (parseFloat(p.valor) || 0); }, 0);
        totalValor.textContent = GR.Utils.formatarMoedaBR(soma);
    },

    _obterParcelasDoFormulario: function() {
        var parcelas = this._parcelasTemp || [];
        return parcelas.map(function(p) {
            var novaP = JSON.parse(JSON.stringify(p));
            if (novaP.vencimento && /^\d{4}-\d{2}-\d{2}$/.test(novaP.vencimento)) {
                var partes = novaP.vencimento.split('-');
                novaP.vencimento = partes[2] + '/' + partes[1] + '/' + partes[0];
            }
            if (novaP.dataPagamento && /^\d{4}-\d{2}-\d{2}$/.test(novaP.dataPagamento)) {
                var partes = novaP.dataPagamento.split('-');
                novaP.dataPagamento = partes[2] + '/' + partes[1] + '/' + partes[0];
            }
            return novaP;
        });
    },

    aplicarDadosPDF: function() {
        var preview = document.getElementById('pdf-preview');
        if (preview) preview.style.display = 'none';
        GR.Toast.success('Dados aplicados com sucesso!');
    },

    abrirMapeamentoVisual: function() {
        GR.Modal.open('modal-mapeamento-visual');
    },

    // ================================================================
    // SALVAR CONTRATO
    // ================================================================
    salvar: function() {
        var propriedade = document.getElementById('contrato-propriedade')?.value || '';
        var numero = document.getElementById('contrato-numero')?.value?.trim() || '';
        var data = document.getElementById('contrato-data')?.value || '';
        var valor = GR.Utils.parseMoedaBR(document.getElementById('contrato-valor')?.value || '0');
        var status = document.getElementById('contrato-status')?.value || 'Ativo';
        var taxaJuros = parseFloat(document.getElementById('contrato-taxa-juros')?.value) || 0;
        var saldoQuitacao = GR.Utils.parseMoedaBR(document.getElementById('contrato-saldo-quitacao')?.value || '0');
        var dataSaldo = document.getElementById('contrato-data-saldo')?.value || '';
        var modalidade = document.getElementById('contrato-modalidade')?.value?.trim() || '';
        var mutuario = document.getElementById('contrato-mutuario')?.value?.trim() || '';
        var instituicao = document.getElementById('contrato-instituicao')?.value?.trim() || '';

        if (!propriedade || !numero || !data || !valor) {
            GR.Toast.error('Campos obrigatórios: Propriedade, Número, Data e Valor!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var parcelasParaSalvar = this._obterParcelasDoFormulario();

        var dados = {
            propriedade: GR.Utils.escapeHtml(propriedade),
            numero: GR.Utils.escapeHtml(numero),
            data: data,
            valor: valor || 0,
            status: status,
            taxaJuros: taxaJuros,
            saldoQuitacao: saldoQuitacao || 0,
            dataSaldo: dataSaldo || '',
            modalidade: GR.Utils.escapeHtml(modalidade),
            mutuario: GR.Utils.escapeHtml(mutuario),
            instituicao: GR.Utils.escapeHtml(instituicao),
            parcelas: parcelasParaSalvar,
            dataCriacao: GR.Utils.now()
        };

        var pdfInput = document.getElementById('pdf-file-input');
        var file = null;
        if (pdfInput && pdfInput.files && pdfInput.files[0]) {
            file = pdfInput.files[0];
        }

        var self = this;
        var salvarEDepoisAtualizar = function(dados, uid) {
            self._salvarDados(dados, uid).then(function() {
                GR.UI.refreshCurrentView();
            });
        };

        if (file) {
            var isLocal = window.location.protocol === 'file:';
            if (isLocal) {
                GR.Toast.warning('⚠️ Ambiente local. PDF não será salvo.');
                salvarEDepoisAtualizar(dados, uid);
            } else {
                var filePath = 'contratos/' + uid + '/' + Date.now() + '_' + file.name;
                var uploadTask = storage.ref(filePath).put(file);
                GR.Toast.info('📤 Fazendo upload do PDF...');
                uploadTask.then(function(snapshot) {
                    return snapshot.ref.getDownloadURL();
                }).then(function(downloadURL) {
                    dados.arquivoUrl = downloadURL;
                    dados.arquivoNome = file.name;
                    dados.arquivoPath = filePath;
                    salvarEDepoisAtualizar(dados, uid);
                }).catch(function(err) {
                    GR.Toast.error('Erro no upload: ' + err.message);
                    salvarEDepoisAtualizar(dados, uid);
                });
            }
        } else {
            salvarEDepoisAtualizar(dados, uid);
        }
    },

    _salvarDados: function(dados, uid) {
        var ref = db.collection('users').doc(uid).collection('contratos');
        var editId = GR.State.ui.contratoEditando;

        return new Promise(function(resolve, reject) {
            if (editId) {
                ref.doc(editId).update(dados).then(function() {
                    GR.Modal.close('modal-contrato');
                    GR.Toast.success('Operação atualizada!');
                    GR.State.adicionarHistorico('editou contrato', 'Crédito', 'Contrato: ' + dados.numero);
                    GR.UI.refreshCurrentView();
                    GR.State.verificarVencimentos();
                    resolve();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao atualizar: ' + err.message);
                    reject(err);
                });
            } else {
                ref.add(dados).then(function(docRef) {
                    GR.Modal.close('modal-contrato');
                    GR.Toast.success('Operação salva!');
                    GR.State.adicionarHistorico('criou contrato', 'Crédito', 'Contrato: ' + dados.numero);
                    GR.Vencimentos.idContratoAtivo = docRef.id;
                    GR.UI.refreshCurrentView();
                    GR.State.verificarVencimentos();
                    resolve();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao salvar: ' + err.message);
                    reject(err);
                });
            }
        });
    },

    editar: function(id) {
        this.abrirModal(id);
    },

    excluir: function(id) {
        if (!confirm('Excluir esta operação?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        
        var item = GR.State.data.contratos.find(function(c) { return c.id === id; });

        db.collection('users').doc(uid).collection('contratos').doc(id).delete()
            .then(function() {
                if (item && item.arquivoPath) {
                    storage.ref(item.arquivoPath).delete().catch(function(err) {
                        console.warn('Erro ao excluir arquivo:', err);
                    });
                }
                GR.Toast.success('Excluído!');
                GR.State.adicionarHistorico('excluiu contrato', 'Crédito', 'Contrato ID: ' + id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    visualizarPDF: function(id) {
        var item = GR.State.data.contratos.find(function(c) { return c.id === id; });
        if (!item || !item.arquivoUrl) {
            GR.Toast.error('PDF não encontrado!');
            return;
        }
        window.open(item.arquivoUrl, '_blank');
    }
};

console.log('✅ Módulo Contratos carregado!');