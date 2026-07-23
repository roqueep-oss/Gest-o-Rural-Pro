// ================================================================
// TOAST - SISTEMA DE NOTIFICAÇÕES FLUTUANTES
// ================================================================

GR.Toast = {
    _container: null,

    _init: function() {
        if (this._container) return;
        this._container = document.createElement('div');
        this._container.className = 'toast-container';
        this._container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:400px;width:100%;pointer-events:none;';
        document.body.appendChild(this._container);
    },

    _show: function(mensagem, tipo, duracao) {
        this._init();
        duracao = duracao || 4000;
        var cores = { 'success': '#2e7d32', 'error': '#c62828', 'warning': '#e65100', 'info': '#0d47a1' };
        var icones = { 'success': '✅', 'error': '❌', 'warning': '⚠️', 'info': 'ℹ️' };
        var cor = cores[tipo] || '#333';
        var icon = icones[tipo] || 'ℹ️';

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + tipo;
        toast.style.cssText = 'background:var(--surface);color:var(--text);padding:12px 16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);border-left:4px solid ' + cor +
            ';display:flex;align-items:center;gap:10px;animation:fadeIn 0.3s ease;pointer-events:auto;border:1px solid var(--border);font-size:14px;font-weight:500;';

        var iconEl = document.createElement('span');
        iconEl.textContent = icon;
        iconEl.style.fontSize = '20px';
        toast.appendChild(iconEl);

        var msgEl = document.createElement('span');
        msgEl.textContent = mensagem;
        msgEl.style.flex = '1';
        toast.appendChild(msgEl);

        var closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'background:none;border:none;color:var(--text-light);cursor:pointer;font-size:16px;padding:0 4px;';
        closeBtn.onclick = function() { toast.remove(); };
        toast.appendChild(closeBtn);

        this._container.appendChild(toast);

        if (duracao > 0) {
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateX(20px)';
                    toast.style.transition = 'all 0.3s ease';
                    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
                }
            }, duracao);
        }
        return toast;
    },

    success: function(mensagem, duracao) { return this._show(mensagem, 'success', duracao); },
    error: function(mensagem, duracao) { return this._show(mensagem, 'error', duracao || 6000); },
    warning: function(mensagem, duracao) { return this._show(mensagem, 'warning', duracao); },
    info: function(mensagem, duracao) { return this._show(mensagem, 'info', duracao); },
    clear: function() { if (this._container) this._container.innerHTML = ''; }
};

console.log('✅ GR.Toast carregado!');