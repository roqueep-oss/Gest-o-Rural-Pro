// ================================================================
// MÓDULO: DOCUMENTOS - COMPLETO COM FILTRO DE PROPRIEDADE
// ================================================================

GR.Modules.Documentos = {
    render: function() {
        var div = document.getElementById('lista-documentos');
        if (!div) return;
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.documentos || [], 'propriedade');
        
        // 🔥 APLICA O FILTRO DA ABA ATIVA (SE NÃO FOR "TODAS")
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }

        if (!items.length) {
            div.innerHTML = '<div class="empty-state"><span class="icon">📁</span><div class="message">Nenhum documento cadastrado</div></div>';
            return;
        }

        var tipoIcons = {
            'Escritura': '📜', 'CCIR': '🏷️', 'ITR': '🧾', 'Matricula': '📋',
            'Contrato': '📄', 'NotaFiscal': '🧾', 'Licenca': '✅', 'Certidao': '📑', 'Outros': '📎'
        };
        
        var tipoCores = {
            'Escritura': '#4CAF50', 'CCIR': '#2196F3', 'ITR': '#FF9800', 'Matricula': '#9C27B0',
            'Contrato': '#00BCD4', 'NotaFiscal': '#F44336', 'Licenca': '#8BC34A', 'Certidao': '#3F51B5', 'Outros': '#78909C'
        };

        var rows = items.map(function(d) {
            var icon = tipoIcons[d.tipo] || '📄';
            var cor = tipoCores[d.tipo] || '#78909c';
            
            var hasFile = d.arquivoUrl ? 
                '<button class="btn btn-info btn-sm" onclick="GR.Modules.Documentos.visualizarArquivo(\'' + d.id + '\')" title="Visualizar arquivo">📄 Visualizar</button>' : 
                '<span style="color:#999;font-size:10px;">Sem arquivo</span>';
            
            var dataExibicao = d.dataCriacao ? GR.Utils.formatarDataBR(d.dataCriacao) : '-';

            return '<tr>' +
                '<td><span style="background:' + cor + ';color:#fff;padding:2px 8px;border-radius:4px;font-size:10px;">' + icon + ' ' + GR.Utils.escapeHtml(d.tipo) + '</span></td>' +
                '<td><strong>' + GR.Utils.escapeHtml(d.numero || '-') + '</strong></td>' +
                '<td>' + GR.Utils.escapeHtml(d.propriedade || '-') + '</td>' +
                '<td>' + GR.Utils.escapeHtml(d.descricao || '-') + '</td>' +
                '<td>' + dataExibicao + '</td>' +
                '<td>' + hasFile + '</td>' +
                '<td>' +
                '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Documentos.editar(\'' + d.id + '\')" title="Editar documento">✏️</button>' +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Documentos.excluir(\'' + d.id + '\')" title="Excluir documento">🗑️</button>' +
                '</td>' +
                '</tr>';
        }).join('');

        // 🔥 ADICIONA CONTADOR DE DOCUMENTOS
        var totalDocs = items.length;
        var porTipo = {};
        items.forEach(function(d) {
            var tipo = d.tipo || 'Outros';
            porTipo[tipo] = (porTipo[tipo] || 0) + 1;
        });
        
        var resumoHtml = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;padding:4px 0;">' +
            '<span style="font-size:11px;color:var(--text-light);">📊 Total: <strong>' + totalDocs + '</strong> documento(s)</span>';
        
        for (var tipo in porTipo) {
            var icon = tipoIcons[tipo] || '📄';
            resumoHtml += '<span style="font-size:10px;background:var(--bg);padding:2px 8px;border-radius:12px;">' + icon + ' ' + tipo + ': ' + porTipo[tipo] + '</span>';
        }
        resumoHtml += '</div>';

        div.innerHTML = resumoHtml +
            '<div class="table-responsive"><table><thead><tr><th>Tipo</th><th>Número</th><th>Propriedade</th><th>Descrição</th><th>Data</th><th>Arquivo</th><th>Ações</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        
        console.log('📊 Documentos filtrados:', items.length, 'de', (GR.State.data.documentos || []).length);
    },

    abrirModal: function(editId) {
        GR.State.ui.documentoEditando = editId || null;
        document.getElementById('modal-documento-title').textContent = editId ? '✏️ Editar Documento' : '📁 Novo Documento';
        document.getElementById('documento-tipo').value = 'Outros';
        document.getElementById('documento-numero').value = '';
        document.getElementById('doc-propriedade').value = '';
        document.getElementById('doc-descricao').value = '';
        document.getElementById('doc-file-name').textContent = 'Nenhum arquivo selecionado';
        document.getElementById('doc-arquivo').value = '';
        GR.UI._atualizarSelectsPropriedade();

        if (editId) {
            var item = GR.State.data.documentos.find(function(d) { return d.id === editId; });
            if (item) {
                document.getElementById('documento-tipo').value = item.tipo || 'Outros';
                document.getElementById('documento-numero').value = item.numero || '';
                document.getElementById('doc-propriedade').value = item.propriedade || '';
                document.getElementById('doc-descricao').value = item.descricao || '';
                if (item.arquivoUrl) {
                    document.getElementById('doc-file-name').textContent = '📄 Arquivo anexado';
                }
            }
        }
        GR.Modal.open('modal-documento');
    },

    editar: function(id) {
        this.abrirModal(id);
    },

    salvar: function() {
        var tipo = document.getElementById('documento-tipo').value;
        var numero = document.getElementById('documento-numero').value.trim();
        var propriedade = document.getElementById('doc-propriedade').value;
        var descricao = document.getElementById('doc-descricao').value.trim();
        var arquivoInput = document.getElementById('doc-arquivo');

        if (!propriedade) {
            GR.Toast.error('Propriedade é obrigatória!');
            return;
        }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            tipo: tipo,
            numero: GR.Utils.escapeHtml(numero),
            propriedade: GR.Utils.escapeHtml(propriedade),
            descricao: GR.Utils.escapeHtml(descricao),
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('documentos');
        var editId = GR.State.ui.documentoEditando;

        // Se tiver arquivo, fazer upload primeiro
        if (arquivoInput && arquivoInput.files && arquivoInput.files[0]) {
            var file = arquivoInput.files[0];
            
            // 🔥 VALIDA TAMANHO DO ARQUIVO (10MB)
            if (file.size > 10 * 1024 * 1024) {
                GR.Toast.error('Arquivo muito grande! Máximo 10MB.');
                return;
            }
            
            var filePath = 'documentos/' + uid + '/' + Date.now() + '_' + file.name;
            var uploadTask = storage.ref(filePath).put(file);

            GR.Toast.info('📤 Fazendo upload do arquivo...');

            uploadTask.then(function(snapshot) {
                return snapshot.ref.getDownloadURL();
            }).then(function(downloadURL) {
                dados.arquivoUrl = downloadURL;
                dados.arquivoNome = file.name;
                dados.arquivoPath = filePath;
                return GR.Modules.Documentos._salvarDados(dados, ref, editId);
            }).catch(function(err) {
                GR.Toast.error('Erro no upload: ' + err.message);
            });
        } else if (editId) {
            // Atualização sem novo arquivo - manter o existente
            var item = GR.State.data.documentos.find(function(d) { return d.id === editId; });
            if (item) {
                if (item.arquivoUrl) {
                    dados.arquivoUrl = item.arquivoUrl;
                    dados.arquivoNome = item.arquivoNome;
                    dados.arquivoPath = item.arquivoPath;
                }
            }
            GR.Modules.Documentos._salvarDados(dados, ref, editId);
        } else {
            // Novo documento sem arquivo
            GR.Modules.Documentos._salvarDados(dados, ref, null);
        }
    },

    _salvarDados: function(dados, ref, editId) {
        if (editId) {
            return ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-documento');
                GR.Toast.success('Documento atualizado!');
                GR.State.adicionarHistorico('editou documento', 'Documentos', 'Documento: ' + dados.tipo);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            return ref.add(dados).then(function() {
                GR.Modal.close('modal-documento');
                GR.Toast.success('Documento salvo!');
                GR.State.adicionarHistorico('criou documento', 'Documentos', 'Documento: ' + dados.tipo);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    visualizarArquivo: function(id) {
        var item = GR.State.data.documentos.find(function(d) { return d.id === id; });
        if (!item || !item.arquivoUrl) {
            GR.Toast.error('Arquivo não encontrado!');
            return;
        }

        // Abrir em nova janela
        window.open(item.arquivoUrl, '_blank');
    },

    excluir: function(id) {
        if (!confirm('Excluir este documento?')) return;
        
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        // Buscar o documento para ver se tem arquivo
        var item = GR.State.data.documentos.find(function(d) { return d.id === id; });
        
        db.collection('users').doc(uid).collection('documentos').doc(id).delete()
            .then(function() {
                // Se tiver arquivo, excluir do storage também
                if (item && item.arquivoPath) {
                    storage.ref(item.arquivoPath).delete().catch(function(err) {
                        console.warn('Erro ao excluir arquivo:', err);
                    });
                }
                GR.Toast.success('Documento excluído!');
                GR.State.adicionarHistorico('excluiu documento', 'Documentos', 'Documento ID: ' + id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },
    
    // ================================================================
    // 🆕 FUNÇÕES ADICIONAIS
    // ================================================================
    
    // Obter documentos por tipo
    getPorTipo: function(tipo) {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.documentos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        if (tipo) {
            items = items.filter(function(d) { return d.tipo === tipo; });
        }
        return items;
    },
    
    // Contar documentos por tipo
    contarPorTipo: function() {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.documentos || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        var contagem = {};
        items.forEach(function(d) {
            var tipo = d.tipo || 'Outros';
            contagem[tipo] = (contagem[tipo] || 0) + 1;
        });
        return contagem;
    },
    
    // Exportar lista de documentos
    exportarLista: function() {
        try {
            var items = GR.State.filtrarPorPropriedade(GR.State.data.documentos || [], 'propriedade');
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
                documentos: items.map(function(d) {
                    return {
                        tipo: d.tipo,
                        numero: d.numero,
                        propriedade: d.propriedade,
                        descricao: d.descricao,
                        dataCriacao: d.dataCriacao,
                        temArquivo: !!d.arquivoUrl
                    };
                })
            };
            
            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'documentos_export_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            
            GR.Toast.success('✅ Lista de documentos exportada!');
        } catch (e) {
            GR.Toast.error('Erro ao exportar: ' + e.message);
        }
    }
};

console.log('✅ Módulo Documentos carregado com filtro de propriedade!');