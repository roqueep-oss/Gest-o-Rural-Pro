// ================================================================
// MODAL - SISTEMA DE MODAIS
// ================================================================

GR.Modal = {
    _openModals: [],

    open: function(modalId) {
        // Tentar encontrar o modal pelo ID exato
        var modal = document.getElementById(modalId);
        if (!modal) {
            // Fallback: tentar com prefixo 'modal-'
            modal = document.getElementById('modal-' + modalId);
            if (!modal) {
                console.warn('⚠️ Modal não encontrado:', modalId);
                return;
            }
        }
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this._openModals.push(modalId);
        setTimeout(function() {
            var input = modal.querySelector('input, textarea, select');
            if (input) input.focus();
        }, 100);
    },

    close: function(modalId) {
        var modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.getElementById('modal-' + modalId);
            if (!modal) return;
        }
        modal.classList.remove('active');
        modal.style.display = 'none';
        this._openModals = this._openModals.filter(function(id) { return id !== modalId; });
        if (this._openModals.length === 0) document.body.style.overflow = '';
    },

    closeAll: function() {
        document.querySelectorAll('.modal.active').forEach(function(modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        });
        this._openModals = [];
        document.body.style.overflow = '';
    }
};

console.log('✅ GR.Modal carregado!');