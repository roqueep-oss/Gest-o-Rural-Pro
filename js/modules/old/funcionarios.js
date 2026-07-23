// ================================================================
// MÓDULO: FUNCIONÁRIOS - COMPLETO COM FILTRO DE PROPRIEDADE
// ================================================================

GR.Modules.Funcionarios = {
    render: function() {
        var div = document.getElementById('lista-funcionarios');
        if (!div) return;
        
        // 🔥 USA O FILTRO GLOBAL DE PROPRIEDADE
        var items = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        
        // 🔥 APLICA O FILTRO DA ABA ATIVA (SE NÃO FOR "TODAS")
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }

        if (!items.length) {
            div.innerHTML = '<div class="empty-state"><span class="icon">👨‍🌾</span><div class="message">Nenhum funcionário cadastrado</div></div>';
            return;
        }

        // 🔥 ESTATÍSTICAS DOS FUNCIONÁRIOS
        var totalAtivos = items.filter(function(f) { return f.status === 'Ativo'; }).length;
        var totalFerias = items.filter(function(f) { return f.status === 'Férias'; }).length;
        var totalAfastados = items.filter(function(f) { return f.status === 'Afastado'; }).length;
        var totalDesligados = items.filter(function(f) { return f.status === 'Desligado'; }).length;
        var somaSalarios = items.reduce(function(sum, f) { return sum + (f.salario || 0); }, 0);

        var statsHtml = '<div class="stats-grid" style="margin-bottom:8px;">' +
            '<div class="stats-card"><div class="number" style="color:var(--success);">' + totalAtivos + '</div><div class="label">✅ Ativos</div></div>' +
            '<div class="stats-card warning"><div class="number" style="color:var(--warning);">' + totalFerias + '</div><div class="label">🏖️ Férias</div></div>' +
            '<div class="stats-card danger"><div class="number" style="color:var(--danger);">' + totalAfastados + '</div><div class="label">⚠️ Afastados</div></div>' +
            '<div class="stats-card"><div class="number" style="color:var(--text-light);">' + totalDesligados + '</div><div class="label">🚫 Desligados</div></div>' +
            '<div class="stats-card info"><div class="number" style="color:var(--info);">' + items.length + '</div><div class="label">👨‍🌾 Total</div></div>' +
            '<div class="stats-card"><div class="number" style="color:var(--primary-dark);">' + GR.Utils.formatarMoedaBR(somaSalarios) + '</div><div class="label">💰 Folha Salarial</div></div>' +
            '</div>';

        var rows = items.map(function(f) {
            var tel = f.telefone ? GR.Utils.formatarTelefone(f.telefone.ddd, f.telefone.numero) : '-';
            var statusBadge = f.status === 'Ativo' ? '<span class="badge badge-success">✅ Ativo</span>' :
                f.status === 'Férias' ? '<span class="badge badge-warning">🏖️ Férias</span>' :
                f.status === 'Afastado' ? '<span class="badge badge-danger">⚠️ Afastado</span>' :
                '<span class="badge badge-secondary">🚫 Desligado</span>';

            var cpfDisplay = f.cpf ? GR.Utils.formatarCPF(f.cpf) : '-';

            return '<tr>' +
                '<td><strong>' + GR.Utils.escapeHtml(f.nome) + '</strong></td>' +
                '<td>' + GR.Utils.escapeHtml(f.cargo || '-') + '</td>' +
                '<td>' + cpfDisplay + '</td>' +
                '<td>' + tel + '</td>' +
                '<td>' + GR.Utils.formatarMoedaBR(f.salario) + '</td>' +
                '<td>' + (f.admissao ? GR.Utils.formatarDataBR(f.admissao) : '-') + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + GR.Utils.escapeHtml(f.propriedade || '-') + '</td>' +
                '<td>' +
                '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Funcionarios.editar(\'' + f.id + '\')" title="Editar funcionário">✏️</button>' +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Funcionarios.excluir(\'' + f.id + '\')" title="Excluir funcionário">🗑️</button>' +
                '</td>' +
                '</tr>';
        }).join('');

        div.innerHTML = statsHtml +
            '<div class="table-responsive"><table><thead><tr><th>Nome</th><th>Cargo</th><th>CPF</th><th>Telefone</th><th>Salário</th><th>Admissão</th><th>Status</th><th>Propriedade</th><th>Ações</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        
        console.log('📊 Funcionários filtrados:', items.length, 'de', (GR.State.data.funcionarios || []).length);
    },

    abrirModal: function(editId) {
        GR.State.ui.funcionarioEditando = editId || null;
        document.getElementById('modal-funcionario-title').textContent = editId ? '✏️ Editar Funcionário' : '👨‍🌾 Novo Funcionário';
        document.getElementById('func-nome').value = '';
        document.getElementById('func-cpf').value = '';
        document.getElementById('func-ddd').value = '';
        document.getElementById('func-telefone').value = '';
        document.getElementById('func-cargo').value = '';
        document.getElementById('func-salario').value = '0,00';
        document.getElementById('func-admissao').value = '';
        document.getElementById('func-status').value = 'Ativo';
        GR.UI._atualizarSelectsPropriedade();

        if (editId) {
            var item = GR.State.data.funcionarios.find(function(f) { return f.id === editId; });
            if (item) {
                document.getElementById('func-nome').value = item.nome || '';
                document.getElementById('func-cpf').value = item.cpf || '';
                document.getElementById('func-ddd').value = item.telefone?.ddd || '';
                document.getElementById('func-telefone').value = item.telefone?.numero || '';
                document.getElementById('func-cargo').value = item.cargo || '';
                document.getElementById('func-salario').value = GR.Utils.formatarMoedaSemSimbolo(item.salario || 0);
                document.getElementById('func-admissao').value = item.admissao || '';
                document.getElementById('func-status').value = item.status || 'Ativo';
                document.getElementById('func-propriedade').value = item.propriedade || '';
            }
        }
        GR.Modal.open('modal-funcionario');
    },

    salvar: function() {
        var nome = document.getElementById('func-nome').value.trim();
        var cpf = document.getElementById('func-cpf').value.trim();
        var ddd = document.getElementById('func-ddd').value.trim();
        var telefone = document.getElementById('func-telefone').value.trim();
        var cargo = document.getElementById('func-cargo').value.trim();
        var salario = GR.Utils.parseMoedaBR(document.getElementById('func-salario').value);
        var admissao = document.getElementById('func-admissao').value;
        var status = document.getElementById('func-status').value;
        var propriedade = document.getElementById('func-propriedade').value;

        if (!nome) { GR.Toast.error('Nome é obrigatório!'); return; }
        if (cpf && !GR.Utils.validarCPF(cpf)) { GR.Toast.error('CPF inválido!'); return; }

        var user = firebase.auth().currentUser;
        if (!user) {
            GR.Toast.error('Usuário não autenticado!');
            return;
        }

        var uid = user.uid;
        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            cpf: cpf || '',
            telefone: (ddd || telefone) ? { ddd: ddd, numero: telefone } : null,
            cargo: GR.Utils.escapeHtml(cargo),
            salario: salario || 0,
            admissao: admissao || '',
            status: status,
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataCriacao: GR.Utils.now()
        };

        var ref = db.collection('users').doc(uid).collection('funcionarios');
        var editId = GR.State.ui.funcionarioEditando;

        if (editId) {
            ref.doc(editId).update(dados).then(function() {
                GR.Modal.close('modal-funcionario');
                GR.Toast.success('Funcionário atualizado!');
                GR.State.adicionarHistorico('editou funcionário', 'Funcionários', 'Funcionário: ' + nome);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao atualizar: ' + err.message);
            });
        } else {
            ref.add(dados).then(function() {
                GR.Modal.close('modal-funcionario');
                GR.Toast.success('Funcionário salvo!');
                GR.State.adicionarHistorico('criou funcionário', 'Funcionários', 'Funcionário: ' + nome);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao salvar: ' + err.message);
            });
        }
    },

    editar: function(id) { this.abrirModal(id); },

    excluir: function(id) {
        if (!confirm('Excluir este funcionário?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;
        db.collection('users').doc(uid).collection('funcionarios').doc(id).delete()
            .then(function() {
                GR.Toast.success('Funcionário excluído!');
                GR.State.adicionarHistorico('excluiu funcionário', 'Funcionários', 'Funcionário ID: ' + id);
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro ao excluir: ' + err.message);
            });
    },

    // ================================================================
    // 🆕 FUNÇÕES ADICIONAIS
    // ================================================================

    // Obter funcionários por status
    getPorStatus: function(status) {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        if (status) {
            items = items.filter(function(f) { return f.status === status; });
        }
        return items;
    },

    // Contar funcionários por status
    contarPorStatus: function() {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        var contagem = {
            Ativo: 0,
            'Férias': 0,
            Afastado: 0,
            Desligado: 0
        };
        items.forEach(function(f) {
            var status = f.status || 'Desligado';
            if (contagem[status] !== undefined) {
                contagem[status]++;
            }
        });
        return contagem;
    },

    // Calcular total da folha salarial
    calcularFolhaSalarial: function() {
        var items = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        if (propAtiva !== 'todas') {
            items = items.filter(function(item) {
                return item.propriedade === propAtiva;
            });
        }
        var ativos = items.filter(function(f) { return f.status === 'Ativo'; });
        return ativos.reduce(function(sum, f) { return sum + (f.salario || 0); }, 0);
    },

    // Exportar lista de funcionários
    exportarLista: function() {
        try {
            var items = GR.State.filtrarPorPropriedade(GR.State.data.funcionarios || [], 'propriedade');
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
                totalFolhaSalarial: items.reduce(function(sum, f) { return sum + (f.salario || 0); }, 0),
                funcionarios: items.map(function(f) {
                    return {
                        nome: f.nome,
                        cpf: f.cpf,
                        cargo: f.cargo,
                        telefone: f.telefone ? GR.Utils.formatarTelefone(f.telefone.ddd, f.telefone.numero) : null,
                        salario: f.salario,
                        admissao: f.admissao,
                        status: f.status,
                        propriedade: f.propriedade
                    };
                })
            };
            
            var blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'funcionarios_export_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            
            GR.Toast.success('✅ Lista de funcionários exportada!');
        } catch (e) {
            GR.Toast.error('Erro ao exportar: ' + e.message);
        }
    }
};

console.log('✅ Módulo Funcionários carregado com filtro de propriedade!');