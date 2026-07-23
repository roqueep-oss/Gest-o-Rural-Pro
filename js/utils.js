// ================================================================
// UTILS - UTILIDADES GERAIS
// ================================================================

GR.Utils = {
    escapeHtml: function(text) {
        if (!text) return '';
        var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
    },

    unescapeHtml: function(text) {
        if (!text) return '';
        var map = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'" };
        return String(text).replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) { return map[m]; });
    },

    formatarDataBR: function(data) {
        if (!data) return '-';
        var d = new Date(data);
        if (isNaN(d.getTime())) return '-';
        return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
    },

    formatarDataHoraBR: function(data) {
        if (!data) return '-';
        var d = new Date(data);
        if (isNaN(d.getTime())) return '-';
        return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear() +
            ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    },

    // ================================================================
    // 🔧 FUNÇÕES CORRIGIDAS - COM SEPARADOR DE MILHAR
    // ================================================================

    // Formata número para moeda BR com separador de milhar (R$ 1.234,56)
    formatarMoedaBR: function(valor) {
        if (isNaN(valor) || valor === null || valor === undefined) return 'R$ 0,00';
        var numero = parseFloat(valor);
        var partes = numero.toFixed(2).split('.');
        var inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        var decimal = partes[1] || '00';
        return 'R$ ' + inteiro + ',' + decimal;
    },

    // Formata número sem símbolo com separador de milhar (1.234,56)
    formatarMoedaSemSimbolo: function(valor) {
        if (isNaN(valor) || valor === null || valor === undefined) return '0,00';
        var numero = parseFloat(valor);
        var partes = numero.toFixed(2).split('.');
        var inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        var decimal = partes[1] || '00';
        return inteiro + ',' + decimal;
    },

    parseMoedaBR: function(valor) {
        if (!valor) return 0;
        var str = String(valor).replace(/[^0-9,]/g, '').replace(',', '.');
        var num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    },

    // Formata input em tempo real com separador de milhar
    formatarMoedaInput: function(input) {
        if (!input) return;
        var valor = input.value.replace(/[^0-9,]/g, '');
        if (!valor) { input.value = '0,00'; return; }
        var partes = valor.split(',');
        var inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        var decimal = partes[1] || '';
        input.value = inteiro + ',' + decimal.padEnd(2, '0').substring(0, 2);
    },

    formatarCPF: function(cpf) {
        if (!cpf) return '';
        cpf = String(cpf).replace(/\D/g, '');
        if (cpf.length !== 11) return cpf;
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    formatarTelefone: function(ddd, numero) {
        if (!ddd && !numero) return '-';
        if (!numero) return '-' + ddd;
        return '(' + ddd + ') ' + numero;
    },

    calcularDiasParaVencimento: function(data) {
        if (!data) return null;
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        var venc = new Date(data);
        venc.setHours(0, 0, 0, 0);
        return Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
    },

    getPartePorNome: function(nome) {
        if (!nome) return null;
        var partes = GR.State.data.partesRelacionadas || [];
        return partes.find(function(p) { return p.nome === nome; });
    },

    now: function() {
        return new Date().toISOString();
    },

    validarCPF: function(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        var soma = 0;
        for (var i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
        var resto = 11 - (soma % 11);
        var digito1 = resto >= 10 ? 0 : resto;
        if (parseInt(cpf.charAt(9)) !== digito1) return false;
        soma = 0;
        for (var j = 0; j < 10; j++) soma += parseInt(cpf.charAt(j)) * (11 - j);
        resto = 11 - (soma % 11);
        var digito2 = resto >= 10 ? 0 : resto;
        if (parseInt(cpf.charAt(10)) !== digito2) return false;
        return true;
    },

    validarEmail: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    _carregarBibliotecas: function() {
        if (typeof pdfjsLib === 'undefined') {
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
            document.head.appendChild(script);
        }
        if (typeof QRCode === 'undefined') {
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            document.head.appendChild(script);
        }
        console.log('📚 Bibliotecas verificadas');
    },

    truncar: function(texto, tamanho) {
        if (!texto) return '';
        if (texto.length <= tamanho) return texto;
        return texto.substring(0, tamanho) + '...';
    },

    capitalizar: function(texto) {
        if (!texto) return '';
        return texto.toLowerCase().replace(/(^\w|\s\w)/g, function(m) { return m.toUpperCase(); });
    },

    gerarId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    // ================================================================
    // 🆕 FUNÇÕES ADICIONAIS
    // ================================================================

    // Formata número com separador de milhar (1.234)
    formatarNumero: function(valor) {
        if (isNaN(valor) || valor === null || valor === undefined) return '0';
        var numero = parseFloat(valor);
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },

    // Converte string com separador de milhar para número
    parseNumero: function(valor) {
        if (!valor) return 0;
        var str = String(valor).replace(/[^0-9,.]/g, '').replace(/\./g, '').replace(',', '.');
        var num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    },

    // Formata valor com separador de milhar e 2 casas decimais (1234,56 -> 1.234,56)
    formatarDecimalBR: function(valor) {
        if (isNaN(valor) || valor === null || valor === undefined) return '0,00';
        var numero = parseFloat(valor);
        var partes = numero.toFixed(2).split('.');
        var inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        var decimal = partes[1] || '00';
        return inteiro + ',' + decimal;
    }
};

console.log('✅ GR.Utils carregado com formatação de moeda corrigida!');
console.log('📌 Melhorias ativas:');
console.log('   - formatarMoedaBR() com separador de milhar');
console.log('   - formatarMoedaSemSimbolo() com separador de milhar');
console.log('   - formatarMoedaInput() com separador de milhar');
console.log('   - 🆕 formatarNumero()');
console.log('   - 🆕 parseNumero()');
console.log('   - 🆕 formatarDecimalBR()');