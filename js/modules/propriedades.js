// ================================================================
// MÓDULO: PROPRIEDADES - CADASTRO RÁPIDO COM VÍNCULO GLOBAL
// ================================================================

GR.Modules.Propriedades = GR.Modules.Propriedades || {};

GR.Modules.Propriedades = {
    abrirModal: function(editId) {
        if (editId) {
            GR.Modules.Configuracoes.editarPropriedade(editId);
        } else {
            GR.Modules.Configuracoes.abrirModalPropriedades();
        }
    },

    salvar: function() {
        GR.Modules.Configuracoes.salvarPropriedadeModal();
    },

    excluir: function(id) {
        GR.Modules.Configuracoes.excluirPropriedade(id);
    },

    _atualizarVinculos: function() {
        GR.State.carregarDados().then(function() {
            GR.UI.atualizarPropTabsComPermissoes();
            GR.UI._atualizarSelectsPropriedade();
            GR.UI.refreshCurrentView();
        });
    }
};
