// ================================================================
// MÓDULO: PRODUÇÃO - Culturas, Colheitas, Secagem e Estoque
// ================================================================

GR.Modules.Producao = {
    _abaAtiva: 'colheitas',

    init: function() {
        console.log('🌾 Módulo Produção inicializado');
    },

    render: function() {
        var div = document.getElementById('lista-producao');
        if (!div) return;

        var culturas = GR.State.filtrarPorPropriedade(GR.State.data.culturas || [], 'propriedade');
        var colheitas = GR.State.filtrarPorPropriedade(GR.State.data.colheitas || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';

        if (propAtiva !== 'todas') {
            culturas = culturas.filter(function(c) { return c.propriedade === propAtiva; });
            colheitas = colheitas.filter(function(c) { return c.propriedade === propAtiva; });
        }

        var totalSacosMaduros = colheitas.reduce(function(s, c) { return s + (c.sacosMaduros || 0); }, 0);
        var totalSacosBeneficiados = colheitas.reduce(function(s, c) {
            var cargas = c.cargas || [];
            return s + cargas.reduce(function(ss, cr) { return ss + (cr.sacasBeneficiadas || 0); }, 0);
        }, 0);
        var totalGastos = colheitas.reduce(function(s, c) { return s + (c.totalGasto || 0); }, 0);
        var totalCargas = colheitas.reduce(function(s, c) {
            return s + ((c.cargas || []).length);
        }, 0);

        var html = '<div class="stats-grid">' +
            '<div class="stats-card"><div class="number">' + culturas.length + '</div><div class="label">🌱 Culturas</div></div>' +
            '<div class="stats-card"><div class="number">' + colheitas.length + '</div><div class="label">🌾 Colheitas</div></div>' +
            '<div class="stats-card"><div class="number">' + totalSacosMaduros + '</div><div class="label">🟤 Sacos Maduros</div></div>' +
            '<div class="stats-card"><div class="number">' + totalSacosBeneficiados + '</div><div class="label">⚪ Sacas Beneficiadas</div></div>' +
            '<div class="stats-card"><div class="number">' + totalCargas + '</div><div class="label">🚛 Cargas Secagem</div></div>' +
            '<div class="stats-card"><div class="number" style="color:' + (totalGastos >= 0 ? 'var(--danger)' : 'var(--success)') + ';">' + GR.Utils.formatarMoedaBR(totalGastos) + '</div><div class="label">💰 Total Gasto</div></div>' +
            '</div>';

        html += '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" onclick="GR.Modules.Producao.abrirModalCultura()">🌱 Nova Cultura</button>' +
            '<button class="btn btn-success" onclick="GR.Modules.Producao.abrirModalColheita()">🌾 Nova Colheita</button>' +
            '<button class="btn btn-info" onclick="GR.Modules.Producao._abaAtiva = \'colheitas\'; GR.Modules.Producao.render()" style="background:' + (this._abaAtiva === 'colheitas' ? 'var(--primary)' : '') + ';">📋 Colheitas</button>' +
            '<button class="btn btn-info" onclick="GR.Modules.Producao._abaAtiva = \'culturas\'; GR.Modules.Producao.render()" style="background:' + (this._abaAtiva === 'culturas' ? 'var(--primary)' : '') + ';">🌱 Culturas</button>' +
            '</div>';

        if (this._abaAtiva === 'colheitas') {
            html += this._renderTabelaColheitas(colheitas);
        } else {
            html += this._renderTabelaCulturas(culturas);
        }

        div.innerHTML = html;
    },

    _renderTabelaCulturas: function(culturas) {
        if (!culturas.length) {
            return '<div class="empty-state"><span class="icon">🌱</span><div class="message">Nenhuma cultura cadastrada</div></div>';
        }
        var html = '<div class="table-responsive"><table><thead><tr><th>🌱 Cultura</th><th>Propriedade</th><th>Ações</th></tr></thead><tbody>';
        culturas.forEach(function(c) {
            html += '<tr>' +
                '<td><strong>' + GR.Utils.escapeHtml(c.nome) + '</strong></td>' +
                '<td>' + GR.Utils.escapeHtml(c.propriedade || '-') + '</td>' +
                '<td>' +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Producao.excluirCultura(\'' + c.id + '\')" title="Excluir cultura">🗑️</button>' +
                '</td></tr>';
        });
        html += '</tbody></table></div>';
        return html;
    },

    _renderTabelaColheitas: function(colheitas) {
        if (!colheitas.length) {
            return '<div class="empty-state"><span class="icon">🌾</span><div class="message">Nenhuma colheita registrada</div></div>';
        }
        var ordenadas = colheitas.slice().sort(function(a, b) { return (b.data || '').localeCompare(a.data || ''); });
        var html = '';
        ordenadas.forEach(function(c) {
            var cargas = c.cargas || [];
            var totalEnviado = cargas.reduce(function(s, cr) { return s + (cr.sacosEnviados || 0); }, 0);
            var totalBeneficiado = cargas.reduce(function(s, cr) { return s + (cr.sacasBeneficiadas || 0); }, 0);
            var saldoMaduro = (c.sacosMaduros || 0) - totalEnviado;

            html += '<div class="card" style="margin-bottom:8px;padding:10px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">' +
                '<div><strong style="font-size:14px;">' + GR.Utils.escapeHtml(c.cultura || 'Sem cultura') + '</strong> ' +
                '<span style="font-size:11px;color:var(--text-light);">' + GR.Utils.formatarDataBR(c.data) + '</span></div>' +
                '<div style="display:flex;gap:3px;">' +
                '<button class="btn btn-info btn-sm" onclick="GR.Modules.Producao.abrirModalCarga(\'' + c.id + '\')" title="Adicionar carga de secagem" style="font-size:9px;">🚛 Carga</button>' +
                '<button class="btn btn-primary btn-sm" onclick="GR.Modules.Producao.abrirModalColheita(\'' + c.id + '\')" title="Editar colheita" style="font-size:9px;">✏️</button>' +
                '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Producao.excluirColheita(\'' + c.id + '\')" title="Excluir colheita" style="font-size:9px;">🗑️</button>' +
                '</div></div>' +
                '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:4px;margin-top:6px;font-size:11px;">' +
                '<div>👣 Pés: <strong>' + (c.pesColhidos || 0) + '</strong></div>' +
                '<div>🟤 Sacos maduros: <strong>' + (c.sacosMaduros || 0) + '</strong></div>' +
                '<div>💰 Custo/pé: <strong>' + GR.Utils.formatarMoedaBR(c.custoPorPe || 0) + '</strong></div>' +
                '<div>💰 Custo/saco: <strong>' + GR.Utils.formatarMoedaBR(c.custoSaco || 0) + '</strong></div>' +
                '<div>💸 Total gasto: <strong>' + GR.Utils.formatarMoedaBR(c.totalGasto || 0) + '</strong></div>' +
                '<div>📦 Saldo maduro: <strong style="color:' + (saldoMaduro > 0 ? 'var(--warning)' : 'var(--text-light)') + ';">' + saldoMaduro + '</strong></div>' +
                '</div>';

            if (cargas.length) {
                html += '<div style="margin-top:6px;padding:6px;background:var(--bg);border-radius:4px;">' +
                    '<div style="font-size:11px;font-weight:600;margin-bottom:4px;">🚛 Cargas para Secagem</div>';
                cargas.forEach(function(cr, idx) {
                    html += '<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0;border-bottom:1px solid var(--border-light);">' +
                        '<span>#' + (idx + 1) + ' ' + (cr.data ? GR.Utils.formatarDataBR(cr.data) : '') + '</span>' +
                        '<span>Enviado: <strong>' + (cr.sacosEnviados || 0) + '</strong> sacos</span>' +
                        '<span>Beneficiado: <strong>' + (cr.sacasBeneficiadas || 0) + '</strong> sacas</span>' +
                        '<span>Rendimento: <strong>' + (cr.sacosEnviados && cr.sacasBeneficiadas ? ((cr.sacasBeneficiadas / cr.sacosEnviados * 100).toFixed(1) + '%') : '-') + '</strong></span>' +
                        '<button class="btn btn-danger btn-sm" onclick="GR.Modules.Producao.excluirCarga(\'' + c.id + '\',' + idx + ')" title="Excluir carga" style="font-size:8px;padding:1px 4px;">🗑️</button>' +
                        '</div>';
                });
                html += '<div style="font-size:10px;margin-top:4px;padding-top:4px;border-top:2px solid var(--border);display:flex;justify-content:space-between;">' +
                    '<span>📤 Total enviado: <strong>' + totalEnviado + '</strong></span>' +
                    '<span>📥 Total beneficiado: <strong>' + totalBeneficiado + '</strong></span>' +
                    '<span>📊 Rendimento médio: <strong>' + (totalEnviado ? (totalBeneficiado / totalEnviado * 100).toFixed(1) + '%' : '-') + '</strong></span>' +
                    '</div></div>';
            }

            html += '</div>';
        });
        return html;
    },

    // ================================================================
    // CULTURAS
    // ================================================================
    abrirModalCultura: function() {
        var container = document.getElementById('modal-container');
        if (!container) return;

        var modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.display = 'flex';
        modal.innerHTML = '<div class="modal-content" style="max-width:400px;">' +
            '<div class="modal-header"><h2 class="modal-title">🌱 Nova Cultura</h2><button class="close-btn" onclick="this.closest(\'.modal.active\').remove()">×</button></div>' +
            '<div class="form-group"><label>Nome da Cultura</label><input type="text" id="cultura-nome" class="form-control" placeholder="Ex: Café Conilon"></div>' +
            '<div class="form-group"><label>Propriedade</label><input type="text" id="cultura-propriedade" class="form-control" placeholder="Propriedade" value="' + GR.Utils.escapeHtml(GR.State.ui.propriedadeAtiva || '') + '"></div>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;margin-top:10px;">' +
            '<button class="btn btn-success" onclick="GR.Modules.Producao.salvarCultura()">✅ Salvar</button>' +
            '<button class="btn btn-secondary" onclick="this.closest(\'.modal.active\').remove()">Cancelar</button></div></div>';
        container.appendChild(modal);
        setTimeout(function() { document.getElementById('cultura-nome').focus(); }, 100);
    },

    salvarCultura: function() {
        var user = firebase.auth().currentUser;
        if (!user) return;
        var nome = document.getElementById('cultura-nome').value.trim();
        var propriedade = document.getElementById('cultura-propriedade').value.trim();
        if (!nome) { GR.Toast.error('Informe o nome da cultura!'); return; }
        if (!propriedade) { GR.Toast.error('Informe a propriedade!'); return; }

        var dados = {
            nome: GR.Utils.escapeHtml(nome),
            propriedade: GR.Utils.escapeHtml(propriedade),
            dataCriacao: GR.Utils.now()
        };

        db.collection('users').doc(user.uid).collection('culturas').add(dados)
            .then(function(docRef) {
                dados.id = docRef.id;
                GR.State.inserirNoCache('culturas', dados);
                var modal = document.querySelector('.modal.active');
                if (modal) modal.remove();
                GR.Toast.success('✅ Cultura cadastrada!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro: ' + err.message);
            });
    },

    excluirCultura: function(id) {
        if (!confirm('Excluir esta cultura?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        db.collection('users').doc(user.uid).collection('culturas').doc(id).delete()
            .then(function() {
                GR.State.removerDoCache('culturas', id);
                GR.Toast.success('Cultura excluída!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro: ' + err.message);
            });
    },

    // ================================================================
    // COLHEITAS
    // ================================================================
    abrirModalColheita: function(editId) {
        var container = document.getElementById('modal-container');
        if (!container) return;

        var item = null;
        if (editId) {
            item = GR.State.data.colheitas.find(function(c) { return c.id === editId; });
        }

        var culturas = GR.State.filtrarPorPropriedade(GR.State.data.culturas || [], 'propriedade');
        var propAtiva = GR.State.ui.propriedadeAtiva || 'todas';
        var optionsCultura = '<option value="">Selecione...</option>';
        culturas.forEach(function(c) {
            var sel = (item && item.cultura === c.nome) ? 'selected' : '';
            optionsCultura += '<option value="' + GR.Utils.escapeHtml(c.nome) + '" ' + sel + '>' + GR.Utils.escapeHtml(c.nome) + '</option>';
        });

        var modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.display = 'flex';
        modal.innerHTML = '<div class="modal-content" style="max-width:500px;">' +
            '<div class="modal-header"><h2 class="modal-title">' + (editId ? '✏️ Editar' : '🌾 Nova') + ' Colheita</h2><button class="close-btn" onclick="this.closest(\'.modal.active\').remove()">×</button></div>' +
            '<div class="form-group"><label>Cultura</label><select id="colheita-cultura" class="form-control">' + optionsCultura + '</select></div>' +
            '<div class="form-group"><label>Data da Colheita</label><input type="date" id="colheita-data" class="form-control" value="' + (item ? item.data : new Date().toISOString().slice(0, 10)) + '"></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
            '<div class="form-group"><label>👣 Pés Colhidos</label><input type="number" id="colheita-pes" class="form-control" value="' + (item ? item.pesColhidos || 0 : 0) + '"></div>' +
            '<div class="form-group"><label>🟤 Sacos Maduros</label><input type="number" id="colheita-sacos" class="form-control" step="0.1" value="' + (item ? item.sacosMaduros || 0 : 0) + '"></div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
            '<div class="form-group"><label>💰 Custo por Pé (R$)</label><input type="number" id="colheita-custoPe" class="form-control" step="0.01" value="' + (item ? item.custoPorPe || 0 : 0) + '"></div>' +
            '<div class="form-group"><label>💰 Custo por Saco (R$)</label><input type="number" id="colheita-custoSaco" class="form-control" step="0.01" value="' + (item ? item.custoSaco || 0 : 0) + '"></div>' +
            '</div>' +
            '<div class="form-group"><label>💸 Total Gasto (R$) <span style="font-size:10px;color:var(--text-light);">(calculado automaticamente)</span></label><input type="number" id="colheita-totalGasto" class="form-control" step="0.01" value="' + (item ? item.totalGasto || 0 : 0) + '"></div>' +
            '<div class="form-group"><label>Propriedade</label><input type="text" id="colheita-propriedade" class="form-control" value="' + (item ? GR.Utils.escapeHtml(item.propriedade || '') : GR.Utils.escapeHtml(GR.State.ui.propriedadeAtiva || '')) + '"></div>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;margin-top:10px;">' +
            '<button class="btn btn-success" onclick="GR.Modules.Producao.salvarColheita(\'' + (editId || '') + '\')">✅ Salvar</button>' +
            '<button class="btn btn-secondary" onclick="this.closest(\'.modal.active\').remove()">Cancelar</button></div></div>';
        container.appendChild(modal);

        // Auto-calcular total gasto
        var inputPes = document.getElementById('colheita-pes');
        var inputCustoPe = document.getElementById('colheita-custoPe');
        var inputCustoSaco = document.getElementById('colheita-custoSaco');
        var inputTotal = document.getElementById('colheita-totalGasto');
        var inputSacos = document.getElementById('colheita-sacos');

        function calcularTotal() {
            var pes = parseFloat(inputPes.value) || 0;
            var custoPe = parseFloat(inputCustoPe.value) || 0;
            var sacos = parseFloat(inputSacos.value) || 0;
            var custoSaco = parseFloat(inputCustoSaco.value) || 0;
            var total = (pes * custoPe) + (sacos * custoSaco);
            if (total > 0) inputTotal.value = total.toFixed(2);
        }
        inputPes.addEventListener('input', calcularTotal);
        inputCustoPe.addEventListener('input', calcularTotal);
        inputSacos.addEventListener('input', calcularTotal);
        inputCustoSaco.addEventListener('input', calcularTotal);

        setTimeout(function() { document.getElementById('colheita-cultura').focus(); }, 100);
    },

    salvarColheita: function(editId) {
        var user = firebase.auth().currentUser;
        if (!user) return;
        var uid = user.uid;

        var dados = {
            cultura: document.getElementById('colheita-cultura').value,
            data: document.getElementById('colheita-data').value,
            pesColhidos: parseFloat(document.getElementById('colheita-pes').value) || 0,
            sacosMaduros: parseFloat(document.getElementById('colheita-sacos').value) || 0,
            custoPorPe: parseFloat(document.getElementById('colheita-custoPe').value) || 0,
            custoSaco: parseFloat(document.getElementById('colheita-custoSaco').value) || 0,
            totalGasto: parseFloat(document.getElementById('colheita-totalGasto').value) || 0,
            propriedade: document.getElementById('colheita-propriedade').value.trim(),
            cargas: [],
            dataCriacao: GR.Utils.now()
        };

        if (!dados.cultura) { GR.Toast.error('Selecione uma cultura!'); return; }
        if (!dados.data) { GR.Toast.error('Informe a data!'); return; }

        if (editId) {
            dados.dataAtualizacao = GR.Utils.now();
            var item = GR.State.data.colheitas.find(function(c) { return c.id === editId; });
            if (item && item.cargas) dados.cargas = item.cargas;

            db.collection('users').doc(uid).collection('colheitas').doc(editId).update(dados)
                .then(function() {
                    GR.State.atualizarNoCache('colheitas', editId, dados);
                    var modal = document.querySelector('.modal.active');
                    if (modal) modal.remove();
                    GR.Toast.success('✅ Colheita atualizada!');
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    GR.Toast.error('Erro: ' + err.message);
                });
        } else {
            db.collection('users').doc(uid).collection('colheitas').add(dados)
                .then(function(docRef) {
                    dados.id = docRef.id;
                    GR.State.inserirNoCache('colheitas', dados);
                    var modal = document.querySelector('.modal.active');
                    if (modal) modal.remove();
                    GR.Toast.success('✅ Colheita registrada!');
                    GR.UI.refreshCurrentView();
                }).catch(function(err) {
                    GR.Toast.error('Erro: ' + err.message);
                });
        }
    },

    excluirColheita: function(id) {
        if (!confirm('Excluir esta colheita?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;
        db.collection('users').doc(user.uid).collection('colheitas').doc(id).delete()
            .then(function() {
                GR.State.removerDoCache('colheitas', id);
                GR.Toast.success('Colheita excluída!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro: ' + err.message);
            });
    },

    // ================================================================
    // CARGAS DE SECAGEM
    // ================================================================
    abrirModalCarga: function(colheitaId) {
        var container = document.getElementById('modal-container');
        if (!container) return;

        var colheita = GR.State.data.colheitas.find(function(c) { return c.id === colheitaId; });
        if (!colheita) { GR.Toast.error('Colheita não encontrada'); return; }

        var saldoMaduro = (colheita.sacosMaduros || 0);
        var cargas = colheita.cargas || [];
        var totalEnviado = cargas.reduce(function(s, c) { return s + (c.sacosEnviados || 0); }, 0);
        var disponivel = saldoMaduro - totalEnviado;

        var modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.display = 'flex';
        modal.innerHTML = '<div class="modal-content" style="max-width:450px;">' +
            '<div class="modal-header"><h2 class="modal-title">🚛 Nova Carga de Secagem</h2><button class="close-btn" onclick="this.closest(\'.modal.active\').remove()">×</button></div>' +
            '<p style="font-size:12px;color:var(--text-light);margin-bottom:6px;">Cultura: <strong>' + GR.Utils.escapeHtml(colheita.cultura) + '</strong> | Data: ' + GR.Utils.formatarDataBR(colheita.data) + '</p>' +
            '<p style="font-size:12px;">🟤 Sacos maduros: <strong>' + saldoMaduro + '</strong> | 📤 Já enviados: <strong>' + totalEnviado + '</strong> | 📦 Disponível: <strong style="color:' + (disponivel > 0 ? 'var(--success)' : 'var(--danger)') + ';">' + disponivel + '</strong></p>' +
            '<div class="form-group"><label>Data do Envio</label><input type="date" id="carga-data" class="form-control" value="' + new Date().toISOString().slice(0, 10) + '"></div>' +
            '<div class="form-group"><label>📤 Sacos Enviados para Secagem</label><input type="number" id="carga-enviados" class="form-control" step="0.1" value="0"></div>' +
            '<div class="form-group"><label>📥 Sacas Beneficiadas (resultado)</label><input type="number" id="carga-beneficiadas" class="form-control" step="0.1" value="0"></div>' +
            '<div style="display:flex;gap:4px;justify-content:flex-end;margin-top:10px;">' +
            '<button class="btn btn-success" onclick="GR.Modules.Producao.salvarCarga(\'' + colheitaId + '\')">✅ Salvar Carga</button>' +
            '<button class="btn btn-secondary" onclick="this.closest(\'.modal.active\').remove()">Cancelar</button></div></div>';
        container.appendChild(modal);
        setTimeout(function() { document.getElementById('carga-enviados').focus(); }, 100);
    },

    salvarCarga: function(colheitaId) {
        var user = firebase.auth().currentUser;
        if (!user) return;

        var data = document.getElementById('carga-data').value;
        var enviados = parseFloat(document.getElementById('carga-enviados').value) || 0;
        var beneficiadas = parseFloat(document.getElementById('carga-beneficiadas').value) || 0;

        if (!enviados) { GR.Toast.error('Informe a quantidade enviada!'); return; }

        var colheita = GR.State.data.colheitas.find(function(c) { return c.id === colheitaId; });
        if (!colheita) { GR.Toast.error('Colheita não encontrada'); return; }

        var cargas = colheita.cargas || [];
        cargas.push({
            data: data,
            sacosEnviados: enviados,
            sacasBeneficiadas: beneficiadas
        });

        db.collection('users').doc(user.uid).collection('colheitas').doc(colheitaId).update({ cargas: cargas })
            .then(function() {
                GR.State.atualizarNoCache('colheitas', colheitaId, colheita);
                var modal = document.querySelector('.modal.active');
                if (modal) modal.remove();
                GR.Toast.success('✅ Carga registrada!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro: ' + err.message);
            });
    },

    excluirCarga: function(colheitaId, index) {
        if (!confirm('Excluir esta carga?')) return;
        var user = firebase.auth().currentUser;
        if (!user) return;

        var colheita = GR.State.data.colheitas.find(function(c) { return c.id === colheitaId; });
        if (!colheita) return;

        var cargas = colheita.cargas || [];
        cargas.splice(index, 1);

        db.collection('users').doc(user.uid).collection('colheitas').doc(colheitaId).update({ cargas: cargas })
            .then(function() {
                GR.State.atualizarNoCache('colheitas', colheitaId, colheita);
                GR.Toast.success('Carga excluída!');
                GR.UI.refreshCurrentView();
            }).catch(function(err) {
                GR.Toast.error('Erro: ' + err.message);
            });
    }
};
