// ================================================================
// MÓDULO: SCANNER (SIMPLIFICADO)
// ================================================================

GR.Scanner = {
    abrirScanner: function() {
        GR.Modal.open('modal-scanner');
        var container = document.getElementById('scanner-container');
        if (container) {
            container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-light);">📷 Scanner disponível em breve</div>';
        }
    },

    fecharScanner: function() {
        GR.Modal.close('modal-scanner');
    },

    uploadImagem: function() {
        document.getElementById('scan-file-input').click();
    }
};

console.log('✅ Módulo Scanner carregado!');