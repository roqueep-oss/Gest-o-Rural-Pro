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
    // BUSCAR DATA DE LIBERAÇÃO
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
        
        // 2º TENTATIVA: Liberações Efetuadas (com aspas)
        console.log('🔄 Buscando em "Liberações Efetuadas" (com aspas)...');
        var liberacoesMatch1 = texto.match(/Liberações\s+Efetuadas[\s\S]*?1\s+[0-9.,]+\s+"([0-9]{2}\/[0-9]{2}\/[0-9]{4})"/i);
        if (liberacoesMatch1) {
            dataEncontrada = liberacoesMatch1[1].trim();
            console.log('📅 Data Liberação (Liberações Efetuadas com aspas):', dataEncontrada);
            return dataEncontrada;
        }
        
        // 3º TENTATIVA: Liberações Efetuadas (sem aspas)
        console.log('🔄 Buscando em "Liberações Efetuadas" (sem aspas)...');
        var liberacoesMatch2 = texto.match(/Liberações\s+Efetuadas[\s\S]*?1\s+[0-9.,]+\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (liberacoesMatch2) {
            dataEncontrada = liberacoesMatch2[1].trim();
            console.log('📅 Data Liberação (Liberações Efetuadas sem aspas):', dataEncontrada);
            return dataEncontrada;
        }
        
        // 4º TENTATIVA: Liberações Previstas
        console.log('🔄 Buscando em "Liberações Previstas"...');
        var liberacoesPrevistas = texto.match(/Liberações\s+Previstas[\s\S]*?1\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (liberacoesPrevistas) {
            dataEncontrada = liberacoesPrevistas[1].trim();
            console.log('📅 Data Liberação (Liberações Previstas):', dataEncontrada);
            return dataEncontrada;
        }
        
        // 5º TENTATIVA: Data Vencto
        console.log('🔄 Buscando Data Vencto...');
        var dataVencto = texto.match(/Data\s+Vencto\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (dataVencto) {
            dataEncontrada = dataVencto[1].trim();
            console.log('📅 Data Liberação (Data Vencto):', dataEncontrada);
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
    // BUSCAR CONTRATO
    // ================================================================
    _buscarContrato: function(texto) {
        console.log('🔍 Buscando Nº do Contrato...');
        
        // 1º TENTATIVA: Campo "Contrato:"
        var contratoMatch = texto.match(/Contrato\s*:\s*([0-9]+)/i);
        if (contratoMatch) {
            console.log('📄 Nº Contrato (campo):', contratoMatch[1].trim());
            return contratoMatch[1].trim();
        }
        
        // 2º TENTATIVA: Contrato Antigo
        var contratoAntigo = texto.match(/Contrato\s+Antigo\s*:\s*([0-9]+)/i);
        if (contratoAntigo) {
            console.log('📄 Nº Contrato (antigo):', contratoAntigo[1].trim());
            return contratoAntigo[1].trim();
        }
        
        // 3º TENTATIVA: Número no título "Relatório de Extrato de Cliente" ou similar
        var numDoc = texto.match(/Relatório.*?([0-9]{8})/i);
        if (numDoc) {
            console.log('📄 Nº Contrato (documento):', numDoc[1].trim());
            return numDoc[1].trim();
        }
        
        // 4º TENTATIVA: Qualquer número grande após "Contrato"
        var numGeneric = texto.match(/Contrato[:\s]+([0-9]{5,})/i);
        if (numGeneric) {
            console.log('📄 Nº Contrato (genérico):', numGeneric[1].trim());
            return numGeneric[1].trim();
        }
        
        console.warn('⚠️ Número do Contrato não encontrado!');
        return '';
    },

    // ================================================================
    // BUSCAR CLIENTE
    // ================================================================
    _buscarCliente: function(texto) {
        console.log('🔍 Buscando Cliente/Mutuário...');
        
        // 1º TENTATIVA: Campo "Cliente:"
        var clienteMatch = texto.match(/Cliente\s*:\s*([0-9]+-[0-9]+\s+[A-Za-zÀ-Üà-ü\s]+)/i);
        if (clienteMatch) {
            var cliente = clienteMatch[1].trim();
            var nomeMatch = cliente.match(/[0-9]+-[0-9]+\s+(.+)/);
            if (nomeMatch) {
                console.log('👤 Cliente:', nomeMatch[1].trim());
                return nomeMatch[1].trim();
            }
            console.log('👤 Cliente:', cliente);
            return cliente;
        }
        
        // 2º TENTATIVA: Nome com padrão "XXX-XX NOME"
        var nomeMatch = texto.match(/([0-9]+-[0-9]+\s+[A-Z][A-Z\s]+?)(?=\s+[0-9]+\s+[0-9]+-)/i);
        if (nomeMatch) {
            var nome = nomeMatch[1].trim();
            var nomeLimpo = nome.replace(/[0-9]+-[0-9]+\s+/, '');
            console.log('👤 Cliente (padrão):', nomeLimpo);
            return nomeLimpo;
        }
        
        // 3º TENTATIVA: Nome após "Cliente:"
        var clienteSimples = texto.match(/Cliente[:\s]+([A-Za-zÀ-Üà-ü\s]+)/i);
        if (clienteSimples) {
            console.log('👤 Cliente (simples):', clienteSimples[1].trim());
            return clienteSimples[1].trim();
        }
        
        console.warn('⚠️ Cliente não encontrado!');
        return '';
    },

    // ================================================================
    // BUSCAR MODALIDADE - MELHORADA
    // ================================================================
    _buscarModalidade: function(texto) {
        console.log('🔍 Buscando Modalidade...');
        
        // 1º TENTATIVA: Campo "Modalidade:"
        var modalidadeMatch = texto.match(/Modalidade\s*:\s*([0-9]+-[A-Za-zÀ-Üà-ü\s-]+)/i);
        if (modalidadeMatch) {
            var modalidade = modalidadeMatch[1].trim();
            console.log('🏷️ Modalidade (campo):', modalidade);
            return modalidade;
        }
        
        // 2º TENTATIVA: Modalidade com código no formato "32-PRONAF BNDES AGRICOLA" (entre aspas ou não)
        console.log('🔄 Buscando modalidade com código numérico...');
        var modalidadeMatch2 = texto.match(/[0-9]+-[A-Za-zÀ-Üà-ü\s-]+?(?=\s+[0-9,]+)/i);
        if (modalidadeMatch2) {
            var modalidade = modalidadeMatch2[0].trim();
            // Verificar se parece uma modalidade (tem número seguido de texto)
            if (/[0-9]+-[A-Za-z]/.test(modalidade)) {
                console.log('🏷️ Modalidade (código):', modalidade);
                return modalidade;
            }
        }
        
        // 3º TENTATIVA: Modalidade com aspas como "PRONAF BNDES AGRICOLA"
        console.log('🔄 Buscando modalidade entre aspas...');
        var modalidadeMatch3 = texto.match(/"([A-Za-zÀ-Üà-ü\s-]+)"/i);
        if (modalidadeMatch3) {
            var modalidade = modalidadeMatch3[1].trim();
            // Verificar se parece uma modalidade (PRONAF, CDC, etc)
            if (/PRONAF|BNDES|CDC|AGRO/i.test(modalidade)) {
                console.log('🏷️ Modalidade (aspas):', modalidade);
                return modalidade;
            }
        }
        
        // 4º TENTATIVA: Modalidade com padrão "ACI - NOME"
        var modalidadeMatch4 = texto.match(/[0-9]+-ACI\s*-\s*([A-Za-zÀ-Üà-ü\s]+?)(?=\s+[0-9,])/i);
        if (modalidadeMatch4) {
            console.log('🏷️ Modalidade (ACI):', modalidadeMatch4[1].trim());
            return modalidadeMatch4[1].trim();
        }
        
        // 5º TENTATIVA: Buscar qualquer texto que pareça modalidade (PRONAF, BNDES, etc)
        var modalidadeMatch5 = texto.match(/(PRONAF|BNDES|CDC|AGRO|RURAL|CREDITO)\s+[A-Za-zÀ-Üà-ü\s]+/i);
        if (modalidadeMatch5) {
            console.log('🏷️ Modalidade (palavra-chave):', modalidadeMatch5[0].trim());
            return modalidadeMatch5[0].trim();
        }
        
        console.warn('⚠️ Modalidade não encontrada!');
        return '';
    },

    // ================================================================
    // BUSCAR VALOR OPERAÇÃO - MELHORADA
    // ================================================================
    _buscarValorOperacao: function(texto) {
        console.log('🔍 Buscando Valor da Operação...');
        
        // 1º TENTATIVA: Campo "Valor Operação:"
        var valorMatch = texto.match(/Valor\s+Operação\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
        if (valorMatch) {
            var v = valorMatch[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            console.log('💰 Valor Operação (campo):', parseFloat(v));
            return parseFloat(v) || 0;
        }
        
        // 2º TENTATIVA: Liberações Efetuadas - valor da parcela 1
        var liberacaoValor = texto.match(/Liberações\s+Efetuadas[\s\S]*?1\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
        if (liberacaoValor) {
            var v = liberacaoValor[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            console.log('💰 Valor Operação (Liberação):', parseFloat(v));
            return parseFloat(v) || 0;
        }
        
        // 3º TENTATIVA: Liberações Previstas - valor da parcela 1
        var previstaValor = texto.match(/Liberações\s+Previstas[\s\S]*?1\s+[0-9]{2}\/[0-9]{2}\/[0-9]{4}\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
        if (previstaValor) {
            var v = previstaValor[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            console.log('💰 Valor Operação (Prevista):', parseFloat(v));
            return parseFloat(v) || 0;
        }
        
        // 4º TENTATIVA: Qualquer valor grande após "Valor Operação" ou "Valor"
        var valorGeneric = texto.match(/Valor\s+Operação[:\s]+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
        if (valorGeneric) {
            var v = valorGeneric[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            console.log('💰 Valor Operação (genérico):', parseFloat(v));
            return parseFloat(v) || 0;
        }
        
        console.warn('⚠️ Valor da Operação não encontrado!');
        return 0;
    },

    // ================================================================
    // BUSCAR SALDO QUITAÇÃO - MELHORADA
    // ================================================================
    _buscarSaldoQuitacao: function(texto) {
        console.log('🔍 Buscando Saldo para Quitação...');
        
        // 1º TENTATIVA: Campo "Saldo p/ Quitação:"
        var saldoMatch = texto.match(/Saldo\s+p\/\s+Quitação\s*:\s*([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
        if (saldoMatch) {
            var s = saldoMatch[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            console.log('💰 Saldo Quitação (campo):', parseFloat(s));
            return parseFloat(s) || 0;
        }
        
        // 2º TENTATIVA: Saldo com padrão alternativo (entre aspas ou não)
        console.log('🔄 Buscando saldo em padrões alternativos...');
        var saldoMatch2 = texto.match(/([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+Taxa\s+Juros/i);
        if (saldoMatch2) {
            var s = saldoMatch2[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            console.log('💰 Saldo Quitação (alt 1):', parseFloat(s));
            return parseFloat(s) || 0;
        }
        
        // 3º TENTATIVA: Saldo entre aspas como "62.423,64"
        var saldoMatch3 = texto.match(/"([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})"/i);
        if (saldoMatch3) {
            var s = saldoMatch3[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            // Verificar se o valor é razoável para saldo (maior que 1000)
            if (parseFloat(s) > 1000) {
                console.log('💰 Saldo Quitação (aspas):', parseFloat(s));
                return parseFloat(s) || 0;
            }
        }
        
        // 4º TENTATIVA: Valor que aparece próximo a "Saldo" ou "Quitação"
        var saldoMatch4 = texto.match(/Saldo[:\s]+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
        if (saldoMatch4) {
            var s = saldoMatch4[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            console.log('💰 Saldo Quitação (após Saldo):', parseFloat(s));
            return parseFloat(s) || 0;
        }
        
        // 5º TENTATIVA: Valor grande que aparece na seção de amortização
        var amortValor = texto.match(/Amortização[\s\S]*?([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/i);
        if (amortValor) {
            var s = amortValor[1].trim().replace(/[^0-9,]/g, '').replace(',', '.');
            if (parseFloat(s) > 1000) {
                console.log('💰 Saldo Quitação (amortização):', parseFloat(s));
                return parseFloat(s) || 0;
            }
        }
        
        console.warn('⚠️ Saldo Quitação não encontrado!');
        return 0;
    },

    // ================================================================
    // BUSCAR TAXA DE JUROS - NOVA FUNÇÃO MELHORADA
    // ================================================================
    _buscarTaxaJuros: function(texto) {
        console.log('🔍 Buscando Taxa de Juros...');
        
        // 1º TENTATIVA: Campo "Taxa Juros:"
        var taxaMatch = texto.match(/Taxa\s+Juros\s*:\s*([0-9]+[,.]?[0-9]*)\s*%/i);
        if (taxaMatch) {
            var taxa = parseFloat(taxaMatch[1].trim().replace(',', '.')) || 0;
            console.log('📊 Taxa Juros (campo):', taxa);
            return taxa;
        }
        
        // 2º TENTATIVA: Taxa entre aspas como "6,0000"
        console.log('🔄 Buscando taxa entre aspas...');
        var taxaMatch2 = texto.match(/"([0-9]+[,.]?[0-9]+)"/i);
        if (taxaMatch2) {
            var taxa = parseFloat(taxaMatch2[1].trim().replace(',', '.')) || 0;
            // Verificar se parece uma taxa (valor entre 0 e 100)
            if (taxa > 0 && taxa < 100) {
                console.log('📊 Taxa Juros (aspas):', taxa);
                return taxa;
            }
        }
        
        // 3º TENTATIVA: Taxa que aparece antes de "% a.a" ou "% a.m"
        var taxaMatch3 = texto.match(/([0-9]+[,.]?[0-9]*)\s*%\s*a\.a/i);
        if (taxaMatch3) {
            var taxa = parseFloat(taxaMatch3[1].trim().replace(',', '.')) || 0;
            console.log('📊 Taxa Juros (% a.a):', taxa);
            return taxa;
        }
        
        // 4º TENTATIVA: Taxa que aparece após "PRONAF" ou "BNDES"
        var taxaMatch4 = texto.match(/(PRONAF|BNDES)[\s\S]*?([0-9]+[,.]?[0-9]+)/i);
        if (taxaMatch4) {
            var taxa = parseFloat(taxaMatch4[2].trim().replace(',', '.')) || 0;
            if (taxa > 0 && taxa < 100) {
                console.log('📊 Taxa Juros (após PRONAF/BNDES):', taxa);
                return taxa;
            }
        }
        
        // 5º TENTATIVA: Qualquer número com formato "X,XXXX" que pareça taxa
        var taxaMatch5 = texto.match(/([0-9]+[,.]?[0-9]{4})/i);
        if (taxaMatch5) {
            var taxa = parseFloat(taxaMatch5[1].trim().replace(',', '.')) || 0;
            if (taxa > 0 && taxa < 100) {
                console.log('📊 Taxa Juros (genérico):', taxa);
                return taxa;
            }
        }
        
        console.warn('⚠️ Taxa de Juros não encontrada!');
        return 0;
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
        // DATA OPERAÇÃO (LIBERAÇÃO)
        // ================================================================
        dados.dataOperacao = this._buscarDataLiberacao(texto);
        console.log('📅 Data Liberação final:', dados.dataOperacao);

        // ================================================================
        // CONTRATO
        // ================================================================
        dados.contrato = this._buscarContrato(texto);
        console.log('📄 Contrato final:', dados.contrato);

        // ================================================================
        // CLIENTE
        // ================================================================
        dados.cliente = this._buscarCliente(texto);
        console.log('👤 Cliente final:', dados.cliente);

        // ================================================================
        // MODALIDADE - USANDO A NOVA FUNÇÃO MELHORADA
        // ================================================================
        dados.modalidade = this._buscarModalidade(texto);
        console.log('🏷️ Modalidade final:', dados.modalidade);

        // ================================================================
        // VALOR OPERAÇÃO - USANDO A NOVA FUNÇÃO MELHORADA
        // ================================================================
        dados.valorOperacao = this._buscarValorOperacao(texto);
        console.log('💰 Valor Operação final:', dados.valorOperacao);

        // ================================================================
        // SALDO QUITAÇÃO - USANDO A NOVA FUNÇÃO MELHORADA
        // ================================================================
        dados.saldoQuitacao = this._buscarSaldoQuitacao(texto);
        console.log('💰 Saldo Quitação final:', dados.saldoQuitacao);

        // ================================================================
        // TAXA DE JUROS - USANDO A NOVA FUNÇÃO
        // ================================================================
        dados.taxaJuros = this._buscarTaxaJuros(texto);
        console.log('📊 Taxa Juros final:', dados.taxaJuros);

        // DATA VENCTO
        var dataVenctoMatch = texto.match(/Data\s+Vencto\s*:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);
        if (dataVenctoMatch) {
            dados.dataVencto = dataVenctoMatch[1].trim();
            console.log('📅 Data Vencto:', dados.dataVencto);
        }

        // MATRÍCULA
        var matriculaMatch = texto.match(/Matrícula\s*:\s*([0-9]+)/i);
        if (matriculaMatch) {
            dados.matricula = matriculaMatch[1].trim();
            console.log('📄 Matrícula:', dados.matricula);
        }

        // INSTITUIÇÃO / COOPERATIVA
        var instituicaoMatch = texto.match(/Coop\.\s+Singular\s*:\s*([0-9]+-[A-Za-zÀ-Üà-ü\s-]+)/i);
        if (instituicaoMatch) {
            dados.instituicao = instituicaoMatch[1].trim();
            console.log('🏦 Instituição:', dados.instituicao);
        } else {
            var cooperativaMatch = texto.match(/Cooperativa\s*:\s*([0-9]+)/i);
            if (cooperativaMatch) {
                dados.cooperativa = cooperativaMatch[1].trim();
                console.log('🏦 Cooperativa:', dados.cooperativa);
            }
        }

        // TAXAS (MULTA E MORA)
        var taxaMultaMatch = texto.match(/Taxa\s+Multa\s*:\s*([0-9]+[,.]?[0-9]*)\s*%/i);
        if (taxaMultaMatch) {
            dados.taxaMulta = parseFloat(taxaMultaMatch[1].trim().replace(',', '.')) || 0;
            console.log('📊 Taxa Multa:', dados.taxaMulta);
        }
        
        var taxaMoraMatch = texto.match(/Taxa\s+Mora\s*:\s*([0-9]+[,.]?[0-9]*)\s*%/i);
        if (taxaMoraMatch) {
            dados.taxaMora = parseFloat(taxaMoraMatch[1].trim().replace(',', '.')) || 0;
            console.log('📊 Taxa Mora:', dados.taxaMora);
        }

        // PRAZO
        var prazoMatch = texto.match(/Prazo\s*:\s*([0-9]+)/i);
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
        var amortizacaoIndex = texto.search(/Amortização\s+do\s+Saldo\s+Devedor/i);
        
        console.log('📌 Índice "Parcelas em Aberto":', abertoIndex);
        console.log('📌 Índice "Parcelas Liquidadas":', liquidadoIndex);
        console.log('📌 Índice "Amortização do Saldo Devedor":', amortizacaoIndex);
        
        // ================================================================
        // PARCELAS EM ABERTO
        // ================================================================
        if (abertoIndex !== -1) {
            var inicioAberto = abertoIndex;
            var fimAberto = liquidadoIndex !== -1 ? liquidadoIndex : (amortizacaoIndex !== -1 ? amortizacaoIndex : texto.length);
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
            
            dados.parcelasAbertas = abertas;
            dados.totalParcelasAbertas = abertas.length;
            dados.valorParcelasAbertas = valorAbertas;
            console.log('📋 Total Parcelas em Aberto:', abertas.length, 'parcelas, total: R$', valorAbertas);
        }

        // ================================================================
        // PARCELAS LIQUIDADAS (seção "Parcelas Liquidadas")
        // ================================================================
        console.log('🔍 Buscando "Parcelas Liquidadas"...');
        
        if (liquidadoIndex !== -1) {
            var secaoLiquidado = texto.substring(liquidadoIndex);
            var fimLiquidado = amortizacaoIndex !== -1 ? amortizacaoIndex : texto.length;
            secaoLiquidado = texto.substring(liquidadoIndex, fimLiquidado);
            
            console.log('📄 Seção de Parcelas Liquidadas:', secaoLiquidado.substring(0, 500));
            
            var padraoLiq = /([0-9]+)\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+([A-Za-zÀ-Üà-ü0-9\s\/\.-]+?)\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g;
            
            var liquidadas = [];
            var valorLiquidadas = 0;
            var matchLiq;
            
            while ((matchLiq = padraoLiq.exec(secaoLiquidado)) !== null) {
                var numero = parseInt(matchLiq[1]) || 0;
                var dataVencimento = matchLiq[2].trim();
                var dataPagamento = matchLiq[3].trim();
                var historico = matchLiq[4].trim();
                var valorPago = parseFloat(matchLiq[5].replace(/[^0-9,]/g, '').replace(',', '.'));
                
                if (valorPago > 0) {
                    liquidadas.push({
                        numero: numero,
                        dataVencimento: dataVencimento,
                        dataPagamento: dataPagamento,
                        historico: historico,
                        valorPago: valorPago,
                        status: 'Pago'
                    });
                    valorLiquidadas += valorPago;
                    console.log('✅ Parcela liquidada (Parcelas Liquidadas):', numero, dataVencimento, 'R$', valorPago, 'Pagto:', dataPagamento);
                }
            }
            
            dados.parcelasLiquidadas = liquidadas;
            dados.totalParcelasLiquidadas = liquidadas.length;
            dados.valorParcelasLiquidadas = valorLiquidadas;
            console.log('📋 Total Parcelas Liquidadas (Parcelas Liquidadas):', liquidadas.length, 'parcelas, total: R$', valorLiquidadas);
        }

        // ================================================================
        // PARCELAS LIQUIDADAS (seção "Amortização do Saldo Devedor")
        // ================================================================
        if (amortizacaoIndex !== -1) {
            console.log('🔍 Buscando "Amortização do Saldo Devedor"...');
            var secaoAmortizacao = texto.substring(amortizacaoIndex);
            
            console.log('📄 Seção de Amortização:', secaoAmortizacao.substring(0, 500));
            
            var padraoAmort = /([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+([A-Za-zÀ-Üà-ü0-9\s\/\.-]+?)\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/g;
            
            var amortizacoes = [];
            var valorAmortizacoes = 0;
            var matchAmort;
            var parcelaNumero = 1;
            
            while ((matchAmort = padraoAmort.exec(secaoAmortizacao)) !== null) {
                var dataPagamento = matchAmort[1].trim();
                var historico = matchAmort[2].trim();
                var valorPago = parseFloat(matchAmort[3].replace(/[^0-9,]/g, '').replace(',', '.'));
                var dataVencimento = matchAmort[4].trim();
                
                if (valorPago > 0) {
                    amortizacoes.push({
                        numero: parcelaNumero++,
                        dataVencimento: dataVencimento || dataPagamento,
                        dataPagamento: dataPagamento,
                        historico: historico,
                        valorPago: valorPago,
                        status: 'Pago'
                    });
                    valorAmortizacoes += valorPago;
                    console.log('✅ Amortização:', dataPagamento, 'R$', valorPago, 'Histórico:', historico);
                }
            }
            
            if (amortizacoes.length === 0) {
                console.log('🔄 Tentando padrão alternativo para amortizações...');
                var padraoAlt = /([0-9]{2}\/[0-9]{2}\/[0-9]{4})\s+([A-Za-zÀ-Üà-ü0-9\s\/\.-]+?)\s+([0-9]{1,3}(?:[.][0-9]{3})*[,][0-9]{2})/g;
                parcelaNumero = 1;
                while ((matchAmort = padraoAlt.exec(secaoAmortizacao)) !== null) {
                    var dataPagamento = matchAmort[1].trim();
                    var historico = matchAmort[2].trim();
                    var valorPago = parseFloat(matchAmort[3].replace(/[^0-9,]/g, '').replace(',', '.'));
                    
                    if (valorPago > 0) {
                        amortizacoes.push({
                            numero: parcelaNumero++,
                            dataVencimento: dataPagamento,
                            dataPagamento: dataPagamento,
                            historico: historico,
                            valorPago: valorPago,
                            status: 'Pago'
                        });
                        valorAmortizacoes += valorPago;
                        console.log('✅ Amortização (alt):', dataPagamento, 'R$', valorPago, 'Histórico:', historico);
                    }
                }
            }
            
            if (amortizacoes.length > 0) {
                var ultimoNumero = dados.parcelasLiquidadas.length > 0 ? 
                    dados.parcelasLiquidadas[dados.parcelasLiquidadas.length - 1].numero : 0;
                
                amortizacoes.forEach(function(a, index) {
                    a.numero = ultimoNumero + index + 1;
                });
                
                dados.parcelasLiquidadas = dados.parcelasLiquidadas.concat(amortizacoes);
                dados.totalParcelasLiquidadas = dados.parcelasLiquidadas.length;
                dados.valorParcelasLiquidadas += valorAmortizacoes;
                console.log('📋 Total Amortizações:', amortizacoes.length, 'parcelas, total: R$', valorAmortizacoes);
                console.log('📋 Total Parcelas Liquidadas (geral):', dados.totalParcelasLiquidadas, 'parcelas, total: R$', dados.valorParcelasLiquidadas);
            }
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