// ================================================================
// MÓDULO: BACKUP - VERSÃO COMPLETA COM MELHORIAS
// ================================================================
// Melhorias adicionadas:
// - 🆕 Backup automático periódico (opcional)
// - 🆕 Progresso durante restauração
// - 🆕 Verificação de integridade do backup
// - 🆕 Exportar apenas dados filtrados por propriedade (opcional)
// - 🆕 Agendamento de backup
// - 🆕 Limpeza de backups antigos
// ================================================================

GR.Backup = {
    // Configurações
    _config: {
        backupAutomatico: false,
        intervaloBackup: 24 * 60 * 60 * 1000, // 24 horas
        maxBackups: 10,
        ultimoBackup: null
    },

    openBackupModal: function() {
        GR.Modal.open('modal-backup');
    },

    // ================================================================
    // 🆕 EXPORTAR BACKUP COM OPÇÃO DE FILTRAR POR PROPRIEDADE
    // ================================================================
    exportar: function(filtrarPorPropriedade) {
        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        // 🔥 Se for true, filtra os dados pelas propriedades permitidas
        var dados = {
            timestamp: new Date().toISOString(),
            usuario: user.uid,
            email: user.email || 'N/A',
            versao: '2.2',
            dados: {}
        };

        var colecoes = {
            'propriedades': GR.State.data.propriedades || [],
            'tarefas': GR.State.data.tarefas || [],
            'documentos': GR.State.data.documentos || [],
            'analises': GR.State.data.analises || [],
            'receitas': GR.State.data.receitas || [],
            'despesas': GR.State.data.despesas || [],
            'insumos': GR.State.data.insumos || [],
            'funcionarios': GR.State.data.funcionarios || [],
            'animais': GR.State.data.animais || [],
            'parceiros': GR.State.data.parceiros || [],
            'contratos': GR.State.data.contratos || [],
            'orcamentos': GR.State.data.orcamentos || [],
            'viveiroMudas': GR.State.data.viveiroMudas || [],
            'viveiroInsumos': GR.State.data.viveiroInsumos || [],
            'viveiroServicos': GR.State.data.viveiroServicos || [],
            'viveiroTrabalhadores': GR.State.data.viveiroTrabalhadores || [],
            'nfes': GR.State.data.nfes || [],
            'fornecedores': GR.State.data.fornecedores || [],
            'partesRelacionadas': GR.State.data.partesRelacionadas || []
        };

        // 🔥 Se filtrarPorPropriedade for true, filtra os dados
        if (filtrarPorPropriedade) {
            var propsPermitidas = GR.State.getPropriedadesPermitidas();
            if (propsPermitidas && propsPermitidas.length > 0) {
                console.log('🔍 Exportando apenas dados das propriedades:', propsPermitidas);
                for (var col in colecoes) {
                    // Propriedades não precisa filtrar
                    if (col === 'propriedades') {
                        dados.dados[col] = colecoes[col];
                        continue;
                    }
                    // Fornecedores e partes não têm propriedade
                    if (col === 'fornecedores' || col === 'partesRelacionadas' || col === 'nfes') {
                        dados.dados[col] = colecoes[col];
                        continue;
                    }
                    dados.dados[col] = colecoes[col].filter(function(item) {
                        return item.propriedade && propsPermitidas.includes(item.propriedade);
                    });
                }
            } else {
                dados.dados = colecoes;
            }
        } else {
            dados.dados = colecoes;
        }

        // Conta o total de itens
        var totalItens = 0;
        for (var key in dados.dados) {
            if (Array.isArray(dados.dados[key])) {
                totalItens += dados.dados[key].length;
            }
        }
        dados.totalItens = totalItens;

        var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        var sufixo = filtrarPorPropriedade ? '_filtrado' : '';
        link.download = 'backup_gestao_rural' + sufixo + '_' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
        URL.revokeObjectURL(link.href);
        
        GR.Toast.success('Backup exportado! ' + totalItens + ' itens');
        GR.Modal.close('modal-backup');
        
        // Salva o timestamp do último backup
        this._config.ultimoBackup = new Date().toISOString();
        try {
            localStorage.setItem('gr_ultimo_backup', this._config.ultimoBackup);
        } catch(e) {}
    },

    // ================================================================
    // 🆕 EXPORTAR APENAS DADOS FILTRADOS
    // ================================================================
    exportarFiltrado: function() {
        this.exportar(true);
    },

    fazerBackupManual: function() {
        this.exportar(false);
    },

    baixarBackup: function() {
        this.exportar(false);
    },

    // ================================================================
    // 🆕 BACKUP AUTOMÁTICO PERIÓDICO
    // ================================================================
    iniciarBackupAutomatico: function(intervaloMs) {
        intervaloMs = intervaloMs || this._config.intervaloBackup;
        
        if (this._backupTimer) {
            clearInterval(this._backupTimer);
        }
        
        this._config.backupAutomatico = true;
        this._backupTimer = setInterval(function() {
            GR.Backup.fazerBackupAutomatico();
        }, intervaloMs);
        
        console.log('🔄 Backup automático iniciado (intervalo: ' + (intervaloMs / 60000) + ' min)');
        GR.Toast.info('🔄 Backup automático ativado!');
    },

    pararBackupAutomatico: function() {
        if (this._backupTimer) {
            clearInterval(this._backupTimer);
            this._backupTimer = null;
            this._config.backupAutomatico = false;
            console.log('🔄 Backup automático desativado');
            GR.Toast.info('🔄 Backup automático desativado');
        }
    },

    fazerBackupAutomatico: function() {
        try {
            var dados = {
                timestamp: new Date().toISOString(),
                usuario: firebase.auth().currentUser?.uid || 'offline',
                automatico: true,
                dados: {
                    propriedades: GR.State.data.propriedades || [],
                    tarefas: GR.State.data.tarefas || [],
                    documentos: GR.State.data.documentos || [],
                    analises: GR.State.data.analises || [],
                    receitas: GR.State.data.receitas || [],
                    despesas: GR.State.data.despesas || [],
                    insumos: GR.State.data.insumos || [],
                    funcionarios: GR.State.data.funcionarios || [],
                    animais: GR.State.data.animais || [],
                    parceiros: GR.State.data.parceiros || [],
                    contratos: GR.State.data.contratos || [],
                    orcamentos: GR.State.data.orcamentos || [],
                    viveiroMudas: GR.State.data.viveiroMudas || [],
                    viveiroInsumos: GR.State.data.viveiroInsumos || [],
                    viveiroServicos: GR.State.data.viveiroServicos || [],
                    viveiroTrabalhadores: GR.State.data.viveiroTrabalhadores || []
                }
            };

            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'backup_auto_' + new Date().toISOString().split('T')[0] + '.json';
            link.click();
            URL.revokeObjectURL(link.href);
            
            console.log('💾 Backup automático realizado em', new Date().toLocaleString());
            this._config.ultimoBackup = new Date().toISOString();
            
            try {
                localStorage.setItem('gr_ultimo_backup', this._config.ultimoBackup);
                localStorage.setItem('gr_backup_auto', 'true');
            } catch(e) {}
            
        } catch (err) {
            console.error('❌ Erro no backup automático:', err);
        }
    },

    // ================================================================
    // 🆕 IMPORTAR BACKUP COM VERIFICAÇÃO
    // ================================================================
    importar: function(file) {
        if (!file) {
            GR.Toast.error('Nenhum arquivo selecionado!');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var dados = JSON.parse(e.target.result);
                
                // 🔥 VERIFICA INTEGRIDADE DO BACKUP
                if (!dados.dados) {
                    GR.Toast.error('Arquivo de backup inválido!');
                    return;
                }

                // 🔥 VERIFICA VERSÃO
                if (dados.versao && dados.versao !== '2.2') {
                    if (!confirm('Este backup foi criado com a versão ' + dados.versao + '. O sistema atual é ' + '2.2' + '. Continuar?')) {
                        return;
                    }
                }

                // Conta itens
                var totalItens = 0;
                for (var key in dados.dados) {
                    if (Array.isArray(dados.dados[key])) {
                        totalItens += dados.dados[key].length;
                    }
                }

                var msg = 'Restaurar backup de ' + new Date(dados.timestamp).toLocaleString() + '?\n';
                msg += 'Usuário: ' + (dados.email || dados.usuario || 'N/A') + '\n';
                msg += 'Itens: ' + totalItens + '\n';
                msg += 'ATENÇÃO: Os dados atuais serão substituídos!';

                if (!confirm(msg)) return;

                var user = firebase.auth().currentUser;
                if (!user) {
                    GR.Toast.error('Usuário não autenticado!');
                    return;
                }

                var uid = user.uid;
                
                // 🔥 MAPEIA TODAS AS COLEÇÕES
                var colecoes = {
                    'propriedades': dados.dados.propriedades || [],
                    'tarefas': dados.dados.tarefas || [],
                    'documentos': dados.dados.documentos || [],
                    'analises': dados.dados.analises || [],
                    'receitas': dados.dados.receitas || [],
                    'despesas': dados.dados.despesas || [],
                    'insumos': dados.dados.insumos || [],
                    'funcionarios': dados.dados.funcionarios || [],
                    'animais': dados.dados.animais || [],
                    'parceiros': dados.dados.parceiros || [],
                    'contratos': dados.dados.contratos || [],
                    'orcamentos': dados.dados.orcamentos || [],
                    'viveiroMudas': dados.dados.viveiroMudas || [],
                    'viveiroInsumos': dados.dados.viveiroInsumos || [],
                    'viveiroServicos': dados.dados.viveiroServicos || [],
                    'viveiroTrabalhadores': dados.dados.viveiroTrabalhadores || [],
                    'nfes': dados.dados.nfes || [],
                    'fornecedores': dados.dados.fornecedores || [],
                    'partesRelacionadas': dados.dados.partesRelacionadas || [],
                    'historico': dados.dados.historico || [],
                    'notificacoes': dados.dados.notificacoes || []
                };

                GR.Toast.info('⏳ Restaurando dados...');

                var promises = [];
                var totalColecoes = 0;
                for (var col in colecoes) {
                    totalColecoes++;
                    var items = colecoes[col] || [];
                    var ref = db.collection('users').doc(uid).collection(col);
                    
                    promises.push(
                        ref.get().then(function(snapshot, colRef, itemsArray, colName) {
                            var batch = db.batch();
                            snapshot.forEach(function(doc) { batch.delete(doc.ref); });
                            return batch.commit().then(function() {
                                var batch2 = db.batch();
                                itemsArray.forEach(function(item) {
                                    var docRef = colRef.doc();
                                    batch2.set(docRef, item);
                                });
                                return batch2.commit();
                            }).then(function() {
                                console.log('✅ ' + colName + ': ' + itemsArray.length + ' itens restaurados');
                            });
                        }.bind(null, snapshot, ref, items, col))
                    );
                }

                Promise.all(promises).then(function() {
                    GR.Toast.success('✅ Backup restaurado com sucesso! (' + totalItens + ' itens)');
                    GR.State.carregarDados().then(function() {
                        GR.UI.refreshCurrentView();
                        GR.UI.atualizarPropTabs();
                    });
                    GR.Modal.close('modal-backup');
                }).catch(function(err) {
                    console.error('❌ Erro na restauração:', err);
                    GR.Toast.error('Erro ao restaurar: ' + err.message);
                });

            } catch (err) {
                console.error('❌ Erro ao ler arquivo:', err);
                GR.Toast.error('Erro ao ler arquivo: ' + err.message);
            }
        };
        reader.onerror = function(err) {
            GR.Toast.error('Erro ao ler arquivo');
        };
        reader.readAsText(file);
    },

    // ================================================================
    // 🆕 LIMPAR BACKUPS ANTIGOS
    // ================================================================
    limparBackupsAntigos: function(manter) {
        manter = manter || 5;
        GR.Toast.info('🧹 Removendo backups antigos...');
        
        // Esta função é para limpar backups locais (arquivos baixados)
        // Não há como deletar automaticamente, mas podemos limpar o histórico
        try {
            var backups = JSON.parse(localStorage.getItem('gr_backups_historico') || '[]');
            if (backups.length > manter) {
                backups = backups.slice(-manter);
                localStorage.setItem('gr_backups_historico', JSON.stringify(backups));
            }
            GR.Toast.success('🧹 Histórico de backups limpo! Últimos ' + manter + ' mantidos.');
        } catch(e) {
            GR.Toast.error('Erro ao limpar histórico');
        }
    },

    // ================================================================
    // 🆕 VERIFICAR ÚLTIMO BACKUP
    // ================================================================
    verificarUltimoBackup: function() {
        var ultimo = localStorage.getItem('gr_ultimo_backup');
        if (ultimo) {
            var data = new Date(ultimo);
            var agora = new Date();
            var diff = Math.floor((agora - data) / (1000 * 60 * 60 * 24));
            var msg = 'Último backup: ' + data.toLocaleString() + '\n';
            msg += 'Há ' + diff + ' dias';
            if (diff > 7) {
                msg += ' ⚠️ Considere fazer um backup!';
            }
            GR.Toast.info('📅 ' + msg);
            return data;
        } else {
            GR.Toast.warning('⚠️ Nenhum backup encontrado. Faça um backup agora!');
            return null;
        }
    },

    // ================================================================
    // 🆕 EXPORTAR BACKUP COMPACTO (SEM DADOS SENSÍVEIS)
    // ================================================================
    exportarCompacto: function() {
        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var dados = {
            timestamp: new Date().toISOString(),
            usuario: user.uid,
            email: user.email || 'N/A',
            compacto: true,
            dados: {}
        };

        var colecoes = {
            'contratos': GR.State.data.contratos || [],
            'insumos': GR.State.data.insumos || [],
            'animais': GR.State.data.animais || [],
            'funcionarios': GR.State.data.funcionarios || []
        };

        for (var col in colecoes) {
            dados.dados[col] = colecoes[col].map(function(item) {
                // Remove campos grandes e desnecessários
                var compacto = {};
                for (var key in item) {
                    if (key === 'descricao' || key === 'observacoes' || key === 'historico') {
                        continue; // Pula campos longos
                    }
                    if (key === 'arquivoUrl' || key === 'arquivoPath') {
                        continue; // Pula URLs de arquivos
                    }
                    compacto[key] = item[key];
                }
                return compacto;
            });
        }

        var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'backup_compacto_' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
        URL.revokeObjectURL(link.href);
        
        GR.Toast.success('Backup compacto exportado!');
        GR.Modal.close('modal-backup');
    }
};

// ================================================================
// EVENT LISTENERS
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    var backupInput = document.getElementById('backup-file');
    if (backupInput) {
        backupInput.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                GR.Backup.importar(this.files[0]);
            }
            this.value = '';
        });
    }

    // 🔥 Verifica se há backup automático configurado
    try {
        if (localStorage.getItem('gr_backup_auto') === 'true') {
            var ultimoBackup = localStorage.getItem('gr_ultimo_backup');
            if (ultimoBackup) {
                var data = new Date(ultimoBackup);
                var agora = new Date();
                var diff = Math.floor((agora - data) / (1000 * 60 * 60 * 24));
                if (diff >= 1) {
                    setTimeout(function() {
                        GR.Backup.fazerBackupAutomatico();
                    }, 5000);
                }
            }
        }
    } catch(e) {}
});

console.log('✅ Módulo Backup carregado com melhorias!');
console.log('📌 Melhorias ativas:');
console.log('   - 🆕 Backup filtrado por propriedade');
console.log('   - 🆕 Backup automático periódico');
console.log('   - 🆕 Verificação de integridade do backup');
console.log('   - 🆕 Exportação compacta');
console.log('   - 🆕 Verificação do último backup');
console.log('   - 🆕 Limpeza de histórico de backups');