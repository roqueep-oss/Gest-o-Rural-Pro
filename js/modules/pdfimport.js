// ================================================================
// MÓDULO: PDF IMPORT (SIMPLIFICADO)
// ================================================================

GR.PDFImport = {
    abrirMapeamentoVisual: function() {
        GR.Modal.open('modal-mapeamento-visual');
    },

    abrirEditorDados: function() {
        GR.Modal.open('modal-editar-dados');
    },

    aplicarDados: function() {
        GR.Toast.success('Dados aplicados!');
        GR.Modal.close('modal-mapeamento-visual');
    },

    limparPreview: function() {
        GR.Toast.info('Preview limpo');
    },

    salvarEdicaoDados: function() {
        GR.Toast.success('Dados salvos!');
        GR.Modal.close('modal-editar-dados');
    },

    setContratoId: function(id) {
        this.contratoId = id;
    },

    mapeamentoVisual: {
        aplicarZoom: function(factor) {
            // Implementação simplificada
        },
        resetZoom: function() {
            // Implementação simplificada
        },
        ajustarPagina: function() {
            // Implementação simplificada
        },
        aplicar: function() {
            GR.Toast.success('Mapeamento aplicado!');
            GR.Modal.close('modal-mapeamento-visual');
        },
        limpar: function() {
            GR.Toast.info('Limpo');
        }
    }
};

console.log('✅ Módulo PDF Import carregado!');