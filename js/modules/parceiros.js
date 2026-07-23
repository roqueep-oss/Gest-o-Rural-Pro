// ================================================================
// MÓDULO: PARCEIROS - COMPLETO COM FILTRO DE PROPRIEDADE
// ================================================================

GR.Modules.Parceiros = {
    render: function() {
        var div = document.getElementById('lista-parceiros');
        if (!div) return;
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.parceiros || [], 'propriedade');
        
        // 🔥 APLICA O FILTRO DA ABA ATIVA (SE NÃO FOR "TODAS")
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }

        if (!items.length) {
            div.innerHTML = '<div class="empty-state"><span class="icon">👤</span><div class="message">Nenhum parceiro cadastrado</div></div>';
            return;
        }

        // 🔥 ESTATÍSTICAS POR TIPO
        var tipos = {};
        items.forEach(function(p) {
            var tipo = p.tipo || 'Outros';
            if (!tipos[tipo]) tipos[tipo] = 0;
            tipos[tipo]++;
        });

        var statsHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;padding:4px 0;">';
        statsHtml += '<span style="font-size:11px;color:var(--text-light);">📊 Total: <strong>' + items.length + '</strong> parceiro(s)</span>';
        for (var tipo in tipos) {
            var emoji = tipo === 'Comodato' ? '📦' : tipo === 'Arrendamento' ? '🏠' : tipo === 'Parceria Agricola' ? '🌾' : '🤝';
            statsHtml += '<span style="font-size:10px;background:var(--bg);padding:2px 10px;border-radius:12px;border:1px solid var(--border);">' +
                emoji + ' ' + tipo + ': <strong>' + tipos[tipo] + '</strong></span>';
        }
        statsHtml += '</div>';

        var rows = items.map(function(p) {
            var tel = p.telefone ? GR.Utils.formatarTelefone(p.telefone.ddd, p.telefone.numero) : '-';
            
            // Badge do tipo
            var tipoBadge = p.tipo === 'Comodato' ? '<span class="badge badge-info">📦 Comodato</span>' :
                p.tipo === 'Arrendamento' ? '<span class="badge badge-warning">🏠 Arrendamento</span>' :
                p.tipo === 'Parceria Agricola' ? '<span class="badge badge-success">🌾 Parceria</span>' :
                '<span class="badge badge-secondary">🤝 ' + GR.Utils.escapeHtml(p.tipo) + '</span>';

            // Status de vigência
            var hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            var dataFim = p.dataFim ? new Date(p.dataFim) : null;
            var statusVigencia = '';
            var statusCor = '';
            
            if (dataFim) {
                dataFim.setHours(0, 0, 0, 0);
                if (dataFim < hoje) {
                    statusVigencia = '⚠️ Vencido';
                    statusCor = 'var(--danger)';
                } else if (dataFim - hoje < 30 * 24 * 60 * 60 * 1000) {
                    statusVigencia = '⏳ Vence em breve';
                    statusCor = 'var(--warning)';
                } else {
                    statusVigencia = '✅ Vigente';
                    statusCor = 'var(--success)';
                }
            }

            var vigenciaText = (p.dataInicio ? GR.Utils.formatarDataBR(p.dataInicio) : '') + 
                ' → ' + (p.dataFim ? GR.Utils.formatarDataBR(p.dataFim) : '');

            return '<tr>' +
                '<td>' + tipoBadge + '</td>' +
                '<td><strong>' + GR.Utils.escapeHtml(p.nome) + '</strong></td>' +
                '<td>' + GR.Utils.formatarCPF(p.cpf) + '</td>' +
                '<td>' + tel + '</td>' +
                '<td><small title="' + vigenciaText + '">' + vigenciaText + '</small></td>' +
                '<td><span style="color:' + statusCor + ';font-size:11px;font-weight:600;">' + statusVigencia + '</span></td>' +
                '<td>' + GR.Utils.escapeHtml(p.propriedade || '-') + '</td>' +
                '<td>' +
                '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Parceiros.editar(\'' + p.id + '\')" title="Editar parceiro">✏️</button>' +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Parceiros.excluir(\'' + p.id + '\')" title="Excluir parceiro">🗑️</button>' +
                '</td>' +
                '</tr>';
        }).join('');

        div.innerHTML = statsHtml +
            '<div class="table-responsive"><table><thead><tr><th>Tipo</th><th>Nome</th><th>CPF</th><th>Telefone</th><th>Vigência</th><th>Status</th><th>Propriedade</th><th>Ações</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        
        console.log('📊 Parceiros filtrados:', items.length, 'de', (GR.State.data.parceiros || []).length);
    },

    abrirModal: function(editId) {
        GR.State.ui.parceiroEditando = editId || null;
        
        var titleEl = document.getElementById('modal-parceiro-title');
        if (titleEl) titleEl.textContent = editId ? '✏️ Editar Parceiro' : '👥 Novo Parceiro';
        
        document.getElementById('parceiro-nome').value = '';
        document.getElementById('parceiro-cpf').value = '';
        document.getElementById('parceiro-ddd').value = '';
        document.getElementById('parceiro-telefone').value = '';
        document.getElementById('parceiro-data-inicio').value = '';
        document.getElementById('parceiro-data-fim').value = '';
        document.getElementById('parceiro-obs').value = '';
        document.getElementById('parceiro-tipo').value = 'Comodato';
        GR.UI._atualizarSelectsPropriedade();

        var selectParte = document.getElementById('parceiro-parte-relacionada');
        if (selectParte) {
            selectParte.innerHTML = '<option value="">Nenhuma</option>';
            var partes = GR.State.data.partesRelacionadas || [];
            partes.forEach(function(p) {
                var opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.nome + ' (' + GR.Utils.formatarCPF(p.cpf) + ')';
                selectParte.appendChild(opt);
            });
        }

        if (editId) {
            var item = GR.State.data.parceiros.find(function(p) { return p.id === editId; });
            if (item) {
                document.getElementById('parceiro-tipo').value = item.tipo || 'Comodato';
                document.getElementById('parceiro-nome').value = item.nome || '';
                document.getElementById('parceiro-cpf').value = item.cpf || '';
                if (item.telefone) {
                    document.getElementById('parceiro-ddd').value = item.telefone.ddd || '';
                    document.getElementById('parceiro-telefone').value = item.telefone.numero || '';
                }
                document.getElementById('parceiro-data-inicio').value = item.dataInicio || '';
                document.getElementById('parceiro-data-fim').value = item.dataFim || '';
                document.getElementById('parceiro-propriedade').value = item.propriedade || '';
                document.getElementById('parceiro-obs').value = item.obs || '';
                
                // Seleciona a parte relacionada se houver
                if (item.parteRelacionadaId && selectParte) {
                    selectParte.value = item.parteRelacionadaId;
                }
            }
        }
        GR.Modal.open('modal-contrato-parceiro');
    },

    editar: function(id) {
        this.abrirModal(id);
    },

    selecionarParteRelacionada: function() {
        var id = document.getElementById('parceiro-parte-relacionada').value;
        if (!id) return;
        var parte = GR.State.data.partesRelacionadas.find(function(p) { return p.id === id; });
        if (parte) {
            document.getElementById('parceiro-nome').value = parte.nome;
            document.getElementById('parceiro-cpf').value = GR.Utils.formatarCPF(parte.cpf);
            if (parte.telefone) {
                document.getElementById('parceiro-ddd').value = parte.telefone.ddd || '';
                document.getElementById('parceiro-telefone').value = parte.telefone.numero || '';
            }
        }
    },

    salvar: function() {
        var tipo = document.getElementById('parceiro-tipo').value;
        var nome = document.getElementById('parceiro-nome').value.trim();
        var cpf = document.getElementById('parceiro-cpf').value.trim();
        var ddd = document.getElementById('parceiro-ddd').value.trim();
        var tel = document.getElementById('parceiro-telefone').value.trim();
        var dataInicio = document.getElementById('parceiro-data-inicio').value;
        var dataFim = document.getElementById('parceiro-data-fim').value;
        var propriedade = document.getElementById('parceiro-propriedade').value;
        var obs = document.getElementById('parceiro-obs').value.trim();
        var parteRelacionadaId = document.getElementById('parceiro-parte-relacionada').value;

        if (!nome || !cpf) { GR.Toast.error('Nome e CPF são obrigatórios!'); return; }
        if (!GR.Utils.validarCPF(cpf)) { GR.Toast.error('CPF inválido!'); return; }
        if (!dataInicio || !dataFim) { GR.Toast.error('Datas obrigatórias!'); return; }
        if (dataFim < dataInicio) { GR.Toast.error('Data de término deve ser posterior!'); return; }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            tipo: tipo,
            nome: GR.Utils.escapeHtml(nome),
            cpf: cpf,
            telefone: (ddd || tel) ? { ddd: ddd, numero: tel } : null,
            dataInicio: dataInicio,
            dataFim: dataFim,
            propriedade: GR.Utils.escapeHtml(propriedade),
            obs: GR.Utils.escapeHtml(obs),
            parteRelacionadaId: parteRelacionadaId || '',
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('parceiros');
        var editId = GR.State.ui.parceiroEditando;

        if (editId) {
            ref.doc(editId).update(dados)
                .then(function() {
                    GR.Modal.close('modal-contrato-parceiro');
                    GR.Toast.success('Parceiro atualizado!');
                    GR.State.adicionarHistorico('editou parceiro', 'Parceiros', 'Parceiro: ' + nome);
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao atualizar: ' + err.message);
                });
        } else {
            ref.add(dados)
                .then(function() {
                    GR.Modal.close('modal-contrato-parceiro');
                    GR.Toast.success('Parceiro salvo!');
                    GR.State.adicionarHistorico('criou parceiro', 'Parceiros', 'Parceiro: ' + nome);
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao salvar: ' + err.message);
                });
        }
    },

    excluir: function(id) {
        if (!confirm('Excluir este parceiro?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        db.collection('users').doc(uid).collection('parceiros').doc(id).delete()
            .then(function() {
                GR.Toast.success('Parceiro excluído!');
                GR.State.adicionarHistorico('excluiu parceiro', 'Parceiros', 'Parceiro ID: ' + id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // 🆕 FUNÇÕES ADICIONAIS
    // ================================================================

    // Obter parceiros por tipo
    getPorTipo: function(tipo) {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.parceiros || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        if (tipo) {
            items = items.filter(function(p) { return p.tipo === tipo; });
        }
        return items;
    },

    // Obter parceiros com vigência vencida
    getVencidos: function() {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.parceiros || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return items.filter(function(p) {
            if (!p.dataFim) return false;
            var dataFim = new Date(p.dataFim);
            dataFim.setHours(0, 0, 0, 0);
            return dataFim < hoje;
        });
    },

    // Obter parceiros com vigência próxima (30 dias)
    getVencendoEmBreve: function(dias) {
        dias = dias || 30;
        var items = GR.State.filtrarPorPropriedade(GR.State.data.parceiros || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        var limite = new Date(hoje);
        limite.setDate(limite.getDate() + dias);
        return items.filter(function(p) {
            if (!p.dataFim) return false;
            var dataFim = new Date(p.dataFim);
            dataFim.setHours(0, 0, 0, 0);
            return dataFim > hoje && dataFim <= limite;
        });
    },

    // Contar parceiros por tipo
    contarPorTipo: function() {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.parceiros || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        var contagem = {};
        items.forEach(function(p) {
            var tipo = p.tipo || 'Outros';
            contagem[tipo] = (contagem[tipo] || 0) + 1;
        });
        return contagem;
    },

    // Exportar lista de parceiros
    exportarLista: function() {
        try {
            var items = GR.State.filtrarPorPropriedade(GR.State.data.parceiros || [], 'propriedade');
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
                parceiros: items.map(function(p) {
                    return {
                        tipo: p.tipo,
                        nome: p.nome,
                        cpf: p.cpf,
                        telefone: p.telefone ? GR.Utils.formatarTelefone(p.telefone.ddd, p.telefone.numero) : null,
                        dataInicio: p.dataInicio,
                        dataFim: p.dataFim,
                        propriedade: p.propriedade,
                        obs: p.obs
                    };
                })
            };
            
            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'parceiros_export_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            
            GR.Toast.success('✅ Lista de parceiros exportada!');
        } catch (e) {
            GR.Toast.error('Erro ao exportar: ' + e.message);
        }
    }
};

// ================================================================
// PARTES RELACIONADAS - COM FILTRO DE PROPRIEDADE (não tem propriedade)
// ================================================================

GR.Modules.PartesRelacionadas = {
    abrirModal: function(editId) {
        GR.State.ui.parteEditando = editId || null;
        document.getElementById('modal-parte-title').textContent = editId ? '✏️ Editar Parte' : '👤 Nova Parte Relacionada';
        document.getElementById('parte-nome').value = '';
        document.getElementById('parte-cpf').value = '';
        document.getElementById('parte-ddd').value = '';
        document.getElementById('parte-telefone').value = '';

        if (editId) {
            var item = GR.State.data.partesRelacionadas.find(function(p) { return p.id === editId; });
            if (item) {
                document.getElementById('parte-nome').value = item.nome || '';
                document.getElementById('parte-cpf').value = item.cpf || '';
                if (item.telefone) {
                    document.getElementById('parte-ddd').value = item.telefone.ddd || '';
                    document.getElementById('parte-telefone').value = item.telefone.numero || '';
                }
            }
        }
        GR.Modal.open('modal-parte-relacionada');
    },

    salvar: function() {
        var nome = document.getElementById('parte-nome').value.trim();
        var cpf = document.getElementById('parte-cpf').value.trim();
        var ddd = document.getElementById('parte-ddd').value.trim();
        var telefone = document.getElementById('parte-telefone').value.trim();
        var editId = GR.State.ui.parteEditando;

        if (!nome || !cpf) { GR.Toast.error('Nome e CPF são obrigatórios!'); return; }
        if (!GR.Utils.validarCPF(cpf)) { GR.Toast.error('CPF inválido!'); return; }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            cpf: cpf,
            telefone: (ddd || telefone) ? { ddd: ddd, numero: telefone } : null,
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('partesRelacionadas');

        if (editId) {
            ref.doc(editId).update(dados)
                .then(function() {
                    GR.Modal.close('modal-parte-relacionada');
                    GR.Toast.success('Parte atualizada!');
                    GR.State.adicionarHistorico('editou parte', 'Partes', 'Parte: ' + nome);
                    GR.UI.atualizarDatalists();
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao atualizar: ' + err.message);
                });
        } else {
            ref.add(dados)
                .then(function() {
                    GR.Modal.close('modal-parte-relacionada');
                    GR.Toast.success('Parte salva!');
                    GR.State.adicionarHistorico('criou parte', 'Partes', 'Parte: ' + nome);
                    GR.UI.atualizarDatalists();
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    GR.Toast.error('Erro ao salvar: ' + err.message);
                });
        }
    },

    editar: function(id) {
        this.abrirModal(id);
    },

    excluir: function(id) {
        if (!confirm('Excluir esta parte relacionada?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        db.collection('users').doc(uid).collection('partesRelacionadas').doc(id).delete()
            .then(function() {
                GR.Toast.success('Parte excluída!');
                GR.State.adicionarHistorico('excluiu parte', 'Partes', 'Parte ID: ' + id);
                GR.UI.atualizarDatalists();
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    }
};

console.log('✅ Módulo Parceiros carregado com filtro de propriedade!');