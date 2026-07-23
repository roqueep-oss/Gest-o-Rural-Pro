// ================================================================
// STORE - GERENCIAMENTO DE DADOS LOCAIS (Cache)
// ================================================================

GR.Store = {
    _prefix: 'gr_',

    set: function(key, value, ttl) {
        try {
            localStorage.setItem(this._prefix + key, JSON.stringify({ value: value, timestamp: Date.now(), ttl: ttl || null }));
            return true;
        } catch (e) { return false; }
    },

    get: function(key, defaultValue) {
        try {
            var raw = localStorage.getItem(this._prefix + key);
            if (!raw) return defaultValue;
            var item = JSON.parse(raw);
            if (item.ttl && (Date.now() - item.timestamp) > item.ttl) {
                localStorage.removeItem(this._prefix + key);
                return defaultValue;
            }
            return item.value;
        } catch (e) { return defaultValue; }
    },

    remove: function(key) {
        try { localStorage.removeItem(this._prefix + key); return true; } catch (e) { return false; }
    },

    clear: function() {
        try {
            Object.keys(localStorage).forEach(function(key) {
                if (key.startsWith(GR.Store._prefix)) localStorage.removeItem(key);
            });
            return true;
        } catch (e) { return false; }
    },

    setPreference: function(key, value) {
        var prefs = this.get('preferences', {});
        prefs[key] = value;
        this.set('preferences', prefs);
    },

    getPreference: function(key, defaultValue) {
        var prefs = this.get('preferences', {});
        return prefs[key] !== undefined ? prefs[key] : defaultValue;
    }
};

console.log('✅ GR.Store carregado!');