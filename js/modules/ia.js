(function() {
    'use strict';

    // ================================================================
    // IA - MÓDULO DE INTELIGÊNCIA ARTIFICIAL
    // ================================================================
    // Funcionalidades:
    // 1. Assistente Virtual (Chat) - Gemini ou DeepSeek
    // 2. Detecção de Anomalias - 100% local
    // 3. Recomendações Personalizadas - Híbrido (local + IA)
    // 4. Extração Inteligente de Documentos - IA
    // 5. Análise de Imagens - Gemini Vision
    // 6. Previsão de Safra - Local
    // ================================================================

    var URL_GEMINI = 'https://generativelanguage.googleapis.com/v1/models/';
    var MODELO_GEMINI = 'gemini-3.5-flash';
    var URL_DEEPSEEK = 'https://api.deepseek.com/v1';
    var MODELO_DEEPSEEK = 'deepseek-v4-flash';
    var URL_NVIDIA = 'https://integrate.api.nvidia.com/v1';
    var MODELO_NVIDIA = 'deepseek-ai/deepseek-v4-flash';
    var CHAVE_NVIDIA_PADRAO = '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';
    var PROVEDORES = {
        gemini: { nome: 'Google Gemini', icone: '🔴' },
        deepseek: { nome: 'DeepSeek V4', icone: '🟢' },
        nvidia: { nome: 'NVIDIA NIM', icone: '🟢' }
    };

    GR.Modules.IA = {
        _inicializado: false,
        _abaAtiva: 'chat',
        _provedor: 'gemini',
        _apiKeyGemini: '',
        _apiKeyDeepSeek: '',
        _apiKeyNvidia: '',
        _historicoChat: [],
        _processando: false,
        _imagemSelecionada: null,

        init: function() {
            if (this._inicializado) return;
            this._provedor = localStorage.getItem('gr_ia_provedor') || 'gemini';
            this._apiKeyGemini = localStorage.getItem('gr_gemini_key') || '';
            this._apiKeyDeepSeek = localStorage.getItem('gr_deepseek_key') || '';
            this._apiKeyNvidia = localStorage.getItem('gr_nvidia_key') || CHAVE_NVIDIA_PADRAO;
            this._inicializado = true;
            console.log('✅ Módulo IA inicializado (provedor: ' + this._provedor + ')');
            this._carregarChavesFirestore();
        },

        _salvarChaveFirestore: function() {
            var user = firebase.auth().currentUser;
            if (!user) return;
            var ref = db.collection('users').doc(user.uid).collection('config').doc('ia');
            ref.set({
                provedor: this._provedor,
                geminiKey: this._apiKeyGemini,
                deepseekKey: this._apiKeyDeepSeek,
                nvidiaKey: this._apiKeyNvidia
            }, { merge: true }).catch(function(err) {
                console.warn('⚠️ Erro ao salvar chaves IA no Firestore:', err);
            });
        },

        _carregarChavesFirestore: function() {
            var self = this;
            var user = firebase.auth().currentUser;
            if (!user) return;
            var ref = db.collection('users').doc(user.uid).collection('config').doc('ia');
            ref.get().then(function(doc) {
                if (doc.exists) {
                    var data = doc.data();
                    if (data.geminiKey) {
                        self._apiKeyGemini = data.geminiKey;
                        localStorage.setItem('gr_gemini_key', data.geminiKey);
                    }
                    if (data.deepseekKey) {
                        self._apiKeyDeepSeek = data.deepseekKey;
                        localStorage.setItem('gr_deepseek_key', data.deepseekKey);
                    }
                    if (data.nvidiaKey) {
                        self._apiKeyNvidia = data.nvidiaKey;
                        localStorage.setItem('gr_nvidia_key', data.nvidiaKey);
                    }
                    if (data.provedor) {
                        self._provedor = data.provedor;
                        localStorage.setItem('gr_ia_provedor', data.provedor);
                    }
                }
            }).catch(function(err) {
                console.warn('⚠️ Erro ao carregar chaves IA do Firestore:', err);
            });
        },

        _getApiKey: function() {
            if (this._provedor === 'deepseek') return this._apiKeyDeepSeek;
            if (this._provedor === 'nvidia') return this._apiKeyNvidia;
            return this._apiKeyGemini;
        },

        render: function() {
            var container = document.getElementById('ia-content');
            if (!container) return;
            this._renderLayout(container);
            this._carregarAba(this._abaAtiva);
        },

        // ================================================================
        // LAYOUT PRINCIPAL
        // ================================================================
        _renderLayout: function(container) {
            var self = this;
            var abas = [
                { id: 'chat', icone: '💬', nome: 'Assistente' },
                { id: 'anomalias', icone: '⚠️', nome: 'Anomalias' },
                { id: 'recomendacoes', icone: '💡', nome: 'Recomendações' },
                { id: 'extracao', icone: '📄', nome: 'Extrair Docs' },
                { id: 'imagem', icone: '📷', nome: 'Analisar Imagem' },
                { id: 'previsao', icone: '📈', nome: 'Previsões' }
            ];

            var hasKey = this._getApiKey() ? true : false;
            var provedorInfo = PROVEDORES[this._provedor] || PROVEDORES.gemini;

            container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title"><span class="emoji">🤖</span> Inteligência Artificial</div>
                        <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">
                            <span id="ia-status" style="font-size:11px;padding:2px 8px;border-radius:10px;${hasKey ? 'background:#e8f5e9;color:#2e7d32;' : 'background:#fff3e0;color:#e65100;'}">
                                ${hasKey ? '🟢 ' + provedorInfo.nome : '🟡 Sem chave API'}
                            </span>
                            <button class="btn btn-sm btn-secondary" onclick="GR.Modules.IA._abrirConfig()" title="Configurar">⚙️</button>
                        </div>
                    </div>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;padding:8px 12px;border-bottom:1px solid var(--border);">
                        ${abas.map(function(a) {
                            return `<button class="btn btn-sm ia-tab ${self._abaAtiva === a.id ? 'btn-primary' : 'btn-secondary'}" data-ia-tab="${a.id}" onclick="GR.Modules.IA._mudarAba('${a.id}')">
                                ${a.icone} ${a.nome}
                            </button>`;
                        }).join('')}
                    </div>
                    <div id="ia-conteudo" style="padding:12px;min-height:400px;"></div>
                </div>
            `;
        },

        _mudarAba: function(aba) {
            this._abaAtiva = aba;
            document.querySelectorAll('.ia-tab').forEach(function(btn) {
                btn.classList.toggle('btn-primary', btn.dataset.iaTab === aba);
                btn.classList.toggle('btn-secondary', btn.dataset.iaTab !== aba);
            });
            this._carregarAba(aba);
        },

        _carregarAba: function(aba) {
            switch(aba) {
                case 'chat': this._renderChat(); break;
                case 'anomalias': this._renderAnomalias(); break;
                case 'recomendacoes': this._renderRecomendacoes(); break;
                case 'extracao': this._renderExtracao(); break;
                case 'imagem': this._renderImagem(); break;
                case 'previsao': this._renderPrevisao(); break;
            }
        },

        // ================================================================
        // CONFIGURAÇÃO
        // ================================================================
        _abrirConfig: function() {
            var self = this;
            var provedor = this._provedor;

            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
            overlay.id = 'ia-modal-overlay';
            overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

            var modal = document.createElement('div');
            modal.style.cssText = 'background:var(--surface,#fff);border-radius:12px;padding:24px;max-width:520px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2);position:relative;max-height:90vh;overflow-y:auto;';
            modal.onclick = function(e) { e.stopPropagation(); };

            var geminiChecked = provedor === 'gemini' ? 'checked' : '';
            var deepseekChecked = provedor === 'deepseek' ? 'checked' : '';
            var nvidiaChecked = provedor === 'nvidia' ? 'checked' : '';

            modal.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <div style="font-size:18px;font-weight:700;">⚙️ Configurar IA</div>
                    <button onclick="document.getElementById('ia-modal-overlay').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--text-light,#999);">✕</button>
                </div>

                <label style="font-size:13px;font-weight:600;display:block;margin-bottom:8px;">Provedor de IA:</label>
                <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
                    <label style="flex:1;min-width:120px;padding:10px;border:2px solid ${provedor === 'gemini' ? 'var(--primary)' : 'var(--border)'};border-radius:8px;cursor:pointer;text-align:center;background:${provedor === 'gemini' ? '#f0f7ff' : 'transparent'};"
                        onclick="document.getElementById('ia-prov-gemini').click()">
                        <input type="radio" name="ia-provider" id="ia-prov-gemini" value="gemini" ${geminiChecked}
                            onchange="GR.Modules.IA._trocarProvedorUI('gemini')" style="display:none;">
                        <div style="font-size:20px;">🔴</div>
                        <div style="font-size:12px;font-weight:600;">Gemini</div>
                        <div style="font-size:9px;color:var(--text-light);">Grátis</div>
                    </label>
                    <label style="flex:1;min-width:120px;padding:10px;border:2px solid ${provedor === 'deepseek' ? 'var(--primary)' : 'var(--border)'};border-radius:8px;cursor:pointer;text-align:center;background:${provedor === 'deepseek' ? '#f0f7ff' : 'transparent'};"
                        onclick="document.getElementById('ia-prov-deepseek').click()">
                        <input type="radio" name="ia-provider" id="ia-prov-deepseek" value="deepseek" ${deepseekChecked}
                            onchange="GR.Modules.IA._trocarProvedorUI('deepseek')" style="display:none;">
                        <div style="font-size:20px;">🟢</div>
                        <div style="font-size:12px;font-weight:600;">DeepSeek</div>
                        <div style="font-size:9px;color:var(--text-light);">5M tokens</div>
                    </label>
                    <label style="flex:1;min-width:120px;padding:10px;border:2px solid ${provedor === 'nvidia' ? 'var(--primary)' : 'var(--border)'};border-radius:8px;cursor:pointer;text-align:center;background:${provedor === 'nvidia' ? '#f0f7ff' : 'transparent'};"
                        onclick="document.getElementById('ia-prov-nvidia').click()">
                        <input type="radio" name="ia-provider" id="ia-prov-nvidia" value="nvidia" ${nvidiaChecked}
                            onchange="GR.Modules.IA._trocarProvedorUI('nvidia')" style="display:none;">
                        <div style="font-size:20px;">🟢</div>
                        <div style="font-size:12px;font-weight:600;">NVIDIA NIM</div>
                        <div style="font-size:9px;color:var(--text-light);">Grátis</div>
                    </label>
                </div>

                <div id="ia-config-gemini" style="display:${provedor === 'gemini' ? 'block' : 'none'};">
                    <p style="font-size:12px;color:var(--text-light,#666);margin-bottom:8px;line-height:1.5;">
                        Chave gratuita do Google Gemini. <a href="https://aistudio.google.com/apikey" target="_blank" style="color:var(--primary);">Criar chave</a>
                    </p>
                    <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Chave da API Gemini:</label>
                    <input type="password" id="ia-key-gemini" value="${this._apiKeyGemini}"
                        style="width:100%;padding:10px;border:2px solid var(--border,#ddd);border-radius:8px;font-size:14px;box-sizing:border-box;">
                </div>

                <div id="ia-config-deepseek" style="display:${provedor === 'deepseek' ? 'block' : 'none'};">
                    <p style="font-size:12px;color:var(--text-light,#666);margin-bottom:8px;line-height:1.5;">
                        Chave da API DeepSeek. 5M tokens grátis ao criar conta em 
                        <a href="https://platform.deepseek.com" target="_blank" style="color:var(--primary);">platform.deepseek.com</a>
                    </p>
                    <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Chave da API DeepSeek:</label>
                    <input type="password" id="ia-key-deepseek" value="${this._apiKeyDeepSeek}"
                        style="width:100%;padding:10px;border:2px solid var(--border,#ddd);border-radius:8px;font-size:14px;box-sizing:border-box;">
                </div>

                <div id="ia-config-nvidia" style="display:${provedor === 'nvidia' ? 'block' : 'none'};">
                    <p style="font-size:12px;color:var(--text-light,#666);margin-bottom:8px;line-height:1.5;">
                        Chave gratuita do NVIDIA NIM. Crie conta em 
                        <a href="https://build.nvidia.com" target="_blank" style="color:var(--primary);">build.nvidia.com</a>
                        (verificação de telefone). Modelo: DeepSeek V4 Flash.
                    </p>
                    <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">Chave da API NVIDIA:</label>
                    <input type="password" id="ia-key-nvidia" value="${this._apiKeyNvidia}"
                        style="width:100%;padding:10px;border:2px solid var(--border,#ddd);border-radius:8px;font-size:14px;box-sizing:border-box;">
                </div>

                <div style="margin-top:8px;font-size:11px;color:var(--text-light,#999);">
                    💡 As chaves ficam salvas no Firebase (nuvem) e no navegador (localStorage).
                    ${provedor !== 'gemini' ? '⚠️ Análise de imagens requer Gemini.' : ''}
                </div>

                <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:12px;border-top:1px solid var(--border,#eee);">
                    <button onclick="document.getElementById('ia-modal-overlay').remove()"
                        style="padding:8px 16px;border:1px solid var(--border,#ddd);border-radius:6px;background:transparent;cursor:pointer;font-size:13px;">Cancelar</button>
                    <button onclick="GR.Modules.IA._salvarChave()"
                        style="padding:8px 16px;border:none;border-radius:6px;background:var(--primary,#1976d2);color:#fff;cursor:pointer;font-size:13px;font-weight:600;">Salvar</button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);
        },

        _trocarProvedorUI: function(provedor) {
            document.getElementById('ia-config-gemini').style.display = provedor === 'gemini' ? 'block' : 'none';
            document.getElementById('ia-config-deepseek').style.display = provedor === 'deepseek' ? 'block' : 'none';
            document.getElementById('ia-config-nvidia').style.display = provedor === 'nvidia' ? 'block' : 'none';
            document.querySelectorAll('#ia-modal-overlay label[style*="flex:1"]').forEach(function(el) {
                var isSelected = el.querySelector('input')?.value === provedor;
                el.style.borderColor = isSelected ? 'var(--primary)' : 'var(--border)';
                el.style.background = isSelected ? '#f0f7ff' : 'transparent';
            });
        },

        _salvarChave: function() {
            var prov = document.querySelector('input[name="ia-provider"]:checked');
            if (!prov) return;
            var provedor = prov.value;

            if (provedor === 'gemini') {
                var key = document.getElementById('ia-key-gemini')?.value?.trim() || '';
                if (!key) { GR.Toast.warning('⚠️ Digite a chave da API Gemini'); return; }
                this._apiKeyGemini = key;
                localStorage.setItem('gr_gemini_key', key);
            } else if (provedor === 'deepseek') {
                var key = document.getElementById('ia-key-deepseek')?.value?.trim() || '';
                if (!key) { GR.Toast.warning('⚠️ Digite a chave da API DeepSeek'); return; }
                this._apiKeyDeepSeek = key;
                localStorage.setItem('gr_deepseek_key', key);
            } else {
                var key = document.getElementById('ia-key-nvidia')?.value?.trim() || '';
                if (!key) { GR.Toast.warning('⚠️ Digite a chave da API NVIDIA'); return; }
                this._apiKeyNvidia = key;
                localStorage.setItem('gr_nvidia_key', key);
            }

            this._provedor = provedor;
            localStorage.setItem('gr_ia_provedor', provedor);

            this._salvarChaveFirestore();

            var overlay = document.getElementById('ia-modal-overlay');
            if (overlay) overlay.remove();
            GR.Toast.success('✅ Configuração salva com sucesso!');
            this.render();
        },

        // ================================================================
        // CHAMADAS DE API (LLM)
        // ================================================================

        _chamarLLM: function(prompt) {
            if (this._provedor === 'deepseek' && this._apiKeyDeepSeek) {
                return this._chamarDeepSeek(prompt);
            }
            if (this._provedor === 'nvidia' && this._apiKeyNvidia) {
                return this._chamarNvidia(prompt);
            }
            return this._chamarGemini(prompt);
        },

        _chamarGemini: function(prompt) {
            if (!this._apiKeyGemini) {
                return Promise.reject('Chave da API Gemini não configurada');
            }

            var self = this;
            var url = URL_GEMINI + MODELO_GEMINI + ':generateContent?key=' + this._apiKeyGemini;

            var body = {
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            };

            return fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }).then(function(res) {
                if (!res.ok) {
                    return res.json().then(function(err) {
                        var erroMsg = err.error?.message || 'Erro na API Gemini';
                        if (erroMsg.indexOf('quota') > -1 || erroMsg.indexOf('Quota') > -1 || erroMsg.indexOf('RESOURCE_EXHAUSTED') > -1) {
                            throw new Error('QUOTA_EXCEEDED');
                        }
                        throw new Error(erroMsg);
                    });
                }
                return res.json();
            }).then(function(data) {
                return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            });
        },

        _chamarDeepSeek: function(prompt) {
            if (!this._apiKeyDeepSeek) {
                return Promise.reject('Chave da API DeepSeek não configurada');
            }

            var body = {
                model: MODELO_DEEPSEEK,
                messages: [
                    { role: 'system', content: 'Você é um assistente especializado em gestão rural. Responda em português brasileiro, de forma clara e direta.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2048
            };

            return fetch(URL_DEEPSEEK + '/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this._apiKeyDeepSeek
                },
                body: JSON.stringify(body)
            }).then(function(res) {
                if (!res.ok) {
                    return res.json().then(function(err) {
                        throw new Error(err.error?.message || 'Erro na API DeepSeek');
                    });
                }
                return res.json();
            }).then(function(data) {
                return data.choices?.[0]?.message?.content || '';
            });
        },

        _chamarNvidia: function(prompt) {
            if (!this._apiKeyNvidia) {
                return Promise.reject('Chave da API NVIDIA não configurada');
            }

            var body = {
                model: MODELO_NVIDIA,
                messages: [
                    { role: 'system', content: 'Você é um assistente especializado em gestão rural. Responda em português brasileiro, de forma clara e direta.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 1,
                top_p: 0.95,
                max_tokens: 16384,
                extra_body: {
                    chat_template_kwargs: {
                        thinking: true,
                        reasoning_effort: 'high'
                    }
                }
            };

            return fetch(URL_NVIDIA + '/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this._apiKeyNvidia
                },
                body: JSON.stringify(body)
            }).then(function(res) {
                if (!res.ok) {
                    return res.json().then(function(err) {
                        throw new Error(err.error?.message || 'Erro na API NVIDIA');
                    });
                }
                return res.json();
            }).then(function(data) {
                var msg = data.choices?.[0]?.message;
                var reasoning = msg?.reasoning || msg?.reasoning_content || '';
                var content = msg?.content || '';
                return (reasoning ? '[Raciocínio]\n' + reasoning + '\n\n[Resposta]\n' : '') + content;
            });
        },

        _chamarGeminiVisao: function(prompt, base64Image, mimeType) {
            if (!this._apiKeyGemini) {
                return Promise.reject('Chave da API Gemini não configurada (necessária para análise de imagens)');
            }

            var url = URL_GEMINI + MODELO_GEMINI + ':generateContent?key=' + this._apiKeyGemini;

            var body = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType || 'image/jpeg',
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 2048
                }
            };

            return fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }).then(function(res) {
                if (!res.ok) {
                    return res.json().then(function(err) {
                        var erroMsg = err.error?.message || 'Erro na API Gemini Vision';
                        if (erroMsg.indexOf('quota') > -1 || erroMsg.indexOf('Quota') > -1 || erroMsg.indexOf('RESOURCE_EXHAUSTED') > -1) {
                            throw new Error('QUOTA_EXCEEDED');
                        }
                        throw new Error(erroMsg);
                    });
                }
                return res.json();
            }).then(function(data) {
                return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            });
        },

        // ================================================================
        // 1. ASSISTENTE VIRTUAL (CHAT)
        // ================================================================
        _renderChat: function() {
            var self = this;
            var container = document.getElementById('ia-conteudo');
            if (!container) return;

            if (!this._getApiKey()) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="icon">🔑</span>
                        <div class="message">Configure uma chave de API para usar o assistente</div>
                        <button class="btn btn-primary" onclick="GR.Modules.IA._abrirConfig()">⚙️ Configurar Agora</button>
                    </div>
                `;
                return;
            }

            var mensagens = this._historicoChat.map(function(m) {
                var extra = '';
                if (m.tipo === 'erro') {
                    extra = 'style="background:#fff3e0;color:#e65100;border:1px solid #ffcc02;border-bottom-left-radius:4px;font-size:12px;"';
                }
                return `
                    <div style="margin-bottom:8px;display:flex;${m.tipo === 'user' ? 'justify-content:flex-end' : 'justify-content:flex-start'}">
                        <div ${extra || ''} style="max-width:80%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.4;
                            ${m.tipo === 'user' ? 'background:var(--primary);color:#fff;border-bottom-right-radius:4px;' : ''}
                            ${m.tipo === 'ai' ? 'background:var(--bg);border:1px solid var(--border);border-bottom-left-radius:4px;' : ''}
                            ${m.tipo === 'erro' ? '' : ''}">
                            ${m.texto.replace(/\n/g, '<br>')}
                            ${m.tipo === 'erro' && m.texto.indexOf('QUOTA_EXCEEDED') > -1 ? '<div style="margin-top:6px;font-size:11px;">💡 Cota excedida. Aguarde ou troque de provedor no ⚙️</div>' : ''}
                            ${m.tipo === 'erro' && m.texto.indexOf('QUOTA_EXCEEDED') === -1 ? '<div style="margin-top:6px;font-size:11px;">💡 Tente novamente ou configure outro provedor no ⚙️</div>' : ''}
                        </div>
                    </div>
                `;
            }).join('');

            var provedorInfo = PROVEDORES[this._provedor] || PROVEDORES.gemini;

            var qtd = this._historicoChat.length;
            var qtdExchanges = Math.floor(qtd / 2);

            container.innerHTML = `
                <div style="display:flex;flex-direction:column;height:500px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:11px;color:var(--text-light);">${qtdExchanges > 0 ? qtdExchanges + ' troca(s)' : ''}</span>
                        ${qtd > 0 ? '<button class="btn btn-sm btn-secondary" onclick="GR.Modules.IA._limparChat()" style="font-size:11px;">🗑️ Limpar chat</button>' : ''}
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:8px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;background:var(--surface);" id="ia-chat-msg">
                        ${mensagens || '<div style="text-align:center;padding:40px;color:var(--text-light);font-size:14px;">💬 Pergunte sobre seus dados da fazenda!</div>'}
                    </div>
                    <div style="display:flex;gap:4px;">
                        <textarea id="ia-chat-input" placeholder="Ex: Quanto gastei com insumos esse mês?"
                            style="flex:1;padding:8px;border:1px solid var(--border);border-radius:6px;font-size:13px;resize:none;rows:2;"
                            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();GR.Modules.IA._enviarMensagem()}"></textarea>
                        <button class="btn btn-primary" onclick="GR.Modules.IA._enviarMensagem()" id="ia-btn-enviar" style="align-self:flex-end;">Enviar</button>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-light);margin-top:4px;">
                        <span>💡 O assistente tem acesso aos seus dados do sistema.</span>
                        <span style="background:var(--bg);padding:2px 6px;border-radius:6px;">${provedorInfo.icone} ${provedorInfo.nome}</span>
                    </div>
                </div>
            `;

            this._rolarChat();
        },

        _enviarMensagem: function() {
            if (this._processando) return;

            var input = document.getElementById('ia-chat-input');
            if (!input) return;
            var msg = input.value.trim();
            if (!msg) return;

            this._historicoChat.push({ tipo: 'user', texto: msg });
            input.value = '';
            this._processando = true;

            var btn = document.getElementById('ia-btn-enviar');
            if (btn) {
                btn.disabled = true;
                btn.textContent = '⏳';
            }

            this._historicoChat.push({ tipo: 'ai', texto: '🤔 Pensando...' });
            this._renderChat();

            var self = this;

            this._montarContextoParaChat(msg).then(function(contexto) {
                var historicoTexto = '';
                var historico = self._historicoChat.filter(function(m) { return m.tipo === 'user' || m.tipo === 'ai'; });
                var ultimas = historico.slice(-8);
                if (ultimas.length > 1) {
                    historicoTexto = '\n\nHISTÓRICO DA CONVERSA:\n';
                    ultimas.forEach(function(m) {
                        if (m.texto !== '🤔 Pensando...') {
                            historicoTexto += (m.tipo === 'user' ? 'Usuário: ' : 'Assistente: ') + m.texto.slice(0, 500) + '\n';
                        }
                    });
                }

                var prompt = 'Você é um assistente especializado em gestão rural. ' +
                    'Responda em português brasileiro, de forma clara e direta. ' +
                    'Use os dados fornecidos para responder com informações reais. ' +
                    'Se não souber algo, diga que não tem essa informação.' +
                    historicoTexto + '\n\n' +
                    'CONTEXTO DOS DADOS DO USUÁRIO:\n' + contexto + '\n\n' +
                    'PERGUNTA DO USUÁRIO: ' + msg + '\n\n' +
                    'Responda de forma útil e objetiva.';

                return self._chamarLLM(prompt);
            }).then(function(resposta) {
                self._historicoChat.pop();
                if (!resposta || resposta.trim() === '') {
                    self._historicoChat.push({ tipo: 'erro', texto: '⚠️ A IA retornou uma resposta vazia. Tente novamente.' });
                } else {
                    self._historicoChat.push({ tipo: 'ai', texto: resposta });
                }
                self._processando = false;
                if (btn) { btn.disabled = false; btn.textContent = 'Enviar'; }
                self._renderChat();
            }).catch(function(err) {
                self._historicoChat.pop();
                var msgErro = err.message || err || 'Erro desconhecido';

                if (msgErro === 'QUOTA_EXCEEDED') {
                    msgErro = '⚠️ Limite de uso da API excedido.\n\n📌 Soluções:\n1️⃣ Aguarde alguns minutos (a cota gratuita renova)\n2️⃣ Troque para o outro provedor no ⚙️\n3️⃣ Gere uma nova chave';
                } else if (msgErro.indexOf('API key') > -1 || msgErro.indexOf('key') > -1 || msgErro.indexOf('401') > -1) {
                    msgErro = '⚠️ Problema com a chave da API. Verifique se está correta no ⚙️ ou gere uma nova.';
                } else if (msgErro.indexOf('fetch') > -1 || msgErro.indexOf('network') > -1 || msgErro.indexOf('NetworkError') > -1) {
                    msgErro = '⚠️ Erro de conexão. Verifique sua internet e tente novamente.';
                } else if (msgErro.indexOf('not found') > -1 || msgErro.indexOf('not supported') > -1) {
                    msgErro = '⚠️ Modelo de IA não disponível. Tente o outro provedor no ⚙️.';
                }

                self._historicoChat.push({ tipo: 'erro', texto: msgErro });
                self._processando = false;
                if (btn) { btn.disabled = false; btn.textContent = 'Enviar'; }
                self._renderChat();
            });
        },

        _montarContextoParaChat: function(pergunta) {
            var self = this;
            return new Promise(function(resolve) {
                try {
                    var state = GR.State;
                    var dados = state?.data || {};
                    var propAtiva = state?.ui?.propriedadeAtiva || 'todas';

                    var contexto = '';

                    if (pergunta.match(/gastei|gasto|gastos|despesa|receita|dinheiro|valor|custo|custos|financeiro/i)) {
                        var receitas = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.receitas || [], 'propriedade') : (dados.receitas || []);
                        var despesas = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.despesas || [], 'propriedade') : (dados.despesas || []);
                        var totalRec = receitas.reduce(function(s, r) { return s + (r.valor || 0); }, 0);
                        var totalDesp = despesas.reduce(function(s, d) { return s + (d.valor || 0); }, 0);
                        var esteMes = new Date().toISOString().slice(0, 7);
                        var recMes = receitas.filter(function(r) { return r.data && r.data.slice(0, 7) === esteMes; });
                        var despMes = despesas.filter(function(d) { return d.data && d.data.slice(0, 7) === esteMes; });
                        var totalRecMes = recMes.reduce(function(s, r) { return s + (r.valor || 0); }, 0);
                        var totalDespMes = despMes.reduce(function(s, d) { return s + (d.valor || 0); }, 0);
                        contexto += '--- DADOS FINANCEIROS ---\n';
                        contexto += 'Total de receitas: R$ ' + totalRec.toFixed(2) + ' (' + receitas.length + ' registros)\n';
                        contexto += 'Total de despesas: R$ ' + totalDesp.toFixed(2) + ' (' + despesas.length + ' registros)\n';
                        contexto += 'Receitas deste mês: R$ ' + totalRecMes.toFixed(2) + '\n';
                        contexto += 'Despesas deste mês: R$ ' + totalDespMes.toFixed(2) + '\n';
                        contexto += 'Saldo: R$ ' + (totalRec - totalDesp).toFixed(2) + '\n\n';
                    }

                    if (pergunta.match(/tarefa|tarefas|ação|ações|fazer|plantio|colheita/i)) {
                        var tarefas = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.tarefas || [], 'propriedade') : (dados.tarefas || []);
                        var pendentes = tarefas.filter(function(t) { return t.status === 'Pendente' || !t.status; });
                        var concluidas = tarefas.filter(function(t) { return t.status === 'Concluída' || t.status === 'Concluido'; });
                        contexto += '--- TAREFAS ---\n';
                        contexto += 'Total de tarefas: ' + tarefas.length + '\n';
                        contexto += 'Pendentes: ' + pendentes.length + '\n';
                        contexto += 'Concluídas: ' + concluidas.length + '\n';
                        if (pendentes.length > 0) {
                            contexto += 'Próximas tarefas pendentes:\n';
                            pendentes.slice(0, 5).forEach(function(t) {
                                contexto += '- ' + (t.acao || t.nome || t.descricao || 'Sem descrição') + (t.data ? ' (Data: ' + t.data + ')' : '') + '\n';
                            });
                        }
                        contexto += '\n';
                    }

                    if (pergunta.match(/insumo|insumos|adubo|defensivo|semente|estoque/i)) {
                        var insumos = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.insumos || [], 'propriedade') : (dados.insumos || []);
                        var baixoEstoque = insumos.filter(function(i) { return (i.quantidade || 0) <= (i.estoqueMinimo || 0); });
                        contexto += '--- INSUMOS ---\n';
                        contexto += 'Total de insumos: ' + insumos.length + '\n';
                        contexto += 'Com estoque baixo: ' + baixoEstoque.length + '\n';
                        contexto += 'Valor total em estoque: R$ ' + insumos.reduce(function(s, i) { return s + ((i.quantidade || 0) * (i.valorUnitario || 0)); }, 0).toFixed(2) + '\n\n';
                    }

                    if (pergunta.match(/animal|animais|gado|boi|vaca|pecuária|rebanho/i)) {
                        var animais = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.animais || [], 'propriedade') : (dados.animais || []);
                        contexto += '--- PECUÁRIA ---\n';
                        contexto += 'Total de animais: ' + animais.length + '\n\n';
                    }

                    if (pergunta.match(/funcionário|funcionarios|empregado|colaborador|equipe/i)) {
                        var funcs = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.funcionarios || [], 'propriedade') : (dados.funcionarios || []);
                        var ativos = funcs.filter(function(f) { return f.status === 'Ativo'; });
                        contexto += '--- FUNCIONÁRIOS ---\n';
                        contexto += 'Total: ' + funcs.length + '\n';
                        contexto += 'Ativos: ' + ativos.length + '\n';
                        contexto += 'Folha de pagamento mensal: R$ ' + funcs.reduce(function(s, f) { return s + (f.salario || 0); }, 0).toFixed(2) + '\n\n';
                    }

                    if (pergunta.match(/solo|análise|analise|fertilidade|ph|nutriente/i)) {
                        var analises = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.analises || [], 'propriedade') : (dados.analises || []);
                        contexto += '--- ANÁLISES DE SOLO ---\n';
                        contexto += 'Total de análises: ' + analises.length + '\n';
                        if (analises.length > 0) {
                            var ultima = analises[analises.length - 1];
                            contexto += 'Última análise: ' + (ultima.data || 'Sem data') + '\n';
                            if (ultima.resultados) {
                                contexto += 'Resultados: ' + JSON.stringify(ultima.resultados).slice(0, 500) + '\n';
                            }
                        }
                        contexto += '\n';
                    }

                    if (pergunta.match(/contrato|contratos|crédito|credito|financiamento|banco|parcela|emprestimo/i)) {
                        var contratos = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.contratos || [], 'propriedade') : (dados.contratos || []);
                        var ativos = contratos.filter(function(c) { return c.status === 'Ativo'; });
                        contexto += '--- CONTRATOS/CRÉDITO ---\n';
                        contexto += 'Total: ' + contratos.length + '\n';
                        contexto += 'Ativos: ' + ativos.length + '\n';
                        var totalDivida = ativos.reduce(function(s, c) { return s + (c.valorTotal || 0); }, 0);
                        contexto += 'Valor total em aberto: R$ ' + totalDivida.toFixed(2) + '\n\n';
                    }

                    contexto += '--- INFORMAÇÕES GERAIS ---\n';
                    contexto += 'Propriedade ativa: ' + propAtiva + '\n';
                    contexto += 'Total de propriedades cadastradas: ' + (dados.propriedades?.length || 0) + '\n';
                    contexto += 'Data atual: ' + new Date().toLocaleString('pt-BR') + '\n';

                    resolve(contexto);
                } catch(e) {
                    resolve('Não foi possível carregar o contexto dos dados.');
                }
            });
        },

        _rolarChat: function() {
            setTimeout(function() {
                var chat = document.getElementById('ia-chat-msg');
                if (chat) chat.scrollTop = chat.scrollHeight;
            }, 50);
        },

        _limparChat: function() {
            this._historicoChat = [];
            this._renderChat();
        },

        // ================================================================
        // 2. DETECÇÃO DE ANOMALIAS (100% LOCAL)
        // ================================================================
        _renderAnomalias: function() {
            var self = this;
            var container = document.getElementById('ia-conteudo');
            if (!container) return;

            container.innerHTML = '<div style="text-align:center;padding:20px;">🔍 Analisando dados...</div>';

            setTimeout(function() {
                var alertas = self._detectarAnomalias();

                if (alertas.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <span class="icon">✅</span>
                            <div class="message">Nenhuma anomalia detectada!</div>
                            <div style="font-size:12px;color:var(--text-light);margin-top:8px;">Todos os dados estão dentro dos padrões esperados.</div>
                        </div>
                    `;
                    return;
                }

                var cards = alertas.map(function(a) {
                    var cor = a.gravidade === 'alta' ? 'var(--danger)' : a.gravidade === 'media' ? 'var(--warning)' : 'var(--info)';
                    var icone = a.gravidade === 'alta' ? '🔴' : a.gravidade === 'media' ? '🟡' : '🔵';
                    return `
                        <div style="padding:10px;margin-bottom:8px;border-left:4px solid ${cor};background:var(--surface);border-radius:6px;border:1px solid var(--border);">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <strong>${icone} ${a.titulo}</strong>
                                <span style="font-size:11px;padding:2px 6px;border-radius:8px;background:${cor};color:#fff;font-weight:600;">${a.gravidade.toUpperCase()}</span>
                            </div>
                            <div style="font-size:13px;margin-top:4px;color:var(--text);">${a.mensagem}</div>
                            <div style="font-size:11px;color:var(--text-light);margin-top:4px;">📌 ${a.modulo} | ${a.data}</div>
                        </div>
                    `;
                }).join('');

                container.innerHTML = `
                    <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:13px;font-weight:600;">⚠️ ${alertas.length} anomalia(s) encontrada(s)</span>
                        <button class="btn btn-sm btn-secondary" onclick="GR.Modules.IA._renderAnomalias()">🔄 Atualizar</button>
                    </div>
                    ${cards}
                    <div style="font-size:11px;color:var(--text-light);margin-top:8px;text-align:center;">
                        💡 As anomalias são detectadas comparando os dados atuais com o histórico. 100% local, sem custo.
                    </div>
                `;
            }, 300);
        },

        _detectarAnomalias: function() {
            var alertas = [];
            var state = GR.State;
            var dados = state?.data || {};
            var propAtiva = state?.ui?.propriedadeAtiva || 'todas';
            var hoje = new Date();

            try {
                var despesas = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.despesas || [], 'propriedade') : (dados.despesas || []);
                if (despesas.length >= 3) {
                    var valores = despesas.map(function(d) { return d.valor || 0; });
                    var media = valores.reduce(function(s, v) { return s + v; }, 0) / valores.length;
                    var desvioPadrao = Math.sqrt(valores.reduce(function(s, v) { return s + Math.pow(v - media, 2); }, 0) / valores.length);
                    var esteMes = hoje.toISOString().slice(0, 7);
                    var despMes = despesas.filter(function(d) { return d.data && d.data.slice(0, 7) === esteMes; });
                    despMes.forEach(function(d) {
                        var valor = d.valor || 0;
                        if (valor > media + (desvioPadrao * 2) && desvioPadrao > 0) {
                            alertas.push({
                                titulo: '💰 Despesa acima do normal',
                                mensagem: 'R$ ' + valor.toFixed(2) + ' em "' + (d.categoria || d.descricao || 'Sem descrição') + '" está muito acima da sua média de R$ ' + media.toFixed(2),
                                gravidade: valor > media + (desvioPadrao * 3) ? 'alta' : 'media',
                                modulo: 'Contabilidade',
                                data: d.data || hoje.toLocaleDateString('pt-BR')
                            });
                        }
                    });
                }
            } catch(e) {}

            try {
                var insumos = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.insumos || [], 'propriedade') : (dados.insumos || []);
                insumos.forEach(function(i) {
                    var qtd = i.quantidade || 0;
                    var min = i.estoqueMinimo || 0;
                    if (min > 0 && qtd <= min) {
                        alertas.push({
                            titulo: '📦 Estoque baixo: ' + (i.nome || i.produto || 'Insumo'),
                            mensagem: 'Quantidade atual: ' + qtd + ' | Estoque mínimo: ' + min + '. Considere reabastecer.',
                            gravidade: qtd === 0 ? 'alta' : 'media',
                            modulo: 'Insumos',
                            data: hoje.toLocaleDateString('pt-BR')
                        });
                    }
                });
            } catch(e) {}

            try {
                var tarefas = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.tarefas || [], 'propriedade') : (dados.tarefas || []);
                var hojeStr = hoje.toISOString().slice(0, 10);
                tarefas.forEach(function(t) {
                    if ((t.status === 'Pendente' || !t.status) && t.data && t.data < hojeStr) {
                        var dias = Math.round((hoje - new Date(t.data)) / 86400000);
                        alertas.push({
                            titulo: '⏰ Tarefa atrasada: ' + (t.acao || t.nome || 'Tarefa'),
                            mensagem: 'Data: ' + t.data + ' | Atraso: ' + dias + ' dia(s)',
                            gravidade: dias > 7 ? 'alta' : dias > 3 ? 'media' : 'baixa',
                            modulo: 'Tarefas',
                            data: t.data
                        });
                    }
                });
            } catch(e) {}

            try {
                var animais = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.animais || [], 'propriedade') : (dados.animais || []);
                animais.forEach(function(a) {
                    if (a.historicoPeso && Array.isArray(a.historicoPeso) && a.historicoPeso.length >= 2) {
                        var pesos = a.historicoPeso.sort(function(x, y) { return new Date(y.data || y.data) - new Date(x.data || x.data); });
                        var ultimo = pesos[0];
                        var anterior = pesos[1];
                        if (ultimo && anterior && (ultimo.peso || 0) < (anterior.peso || 0)) {
                            var perda = (anterior.peso || 0) - (ultimo.peso || 0);
                            var perc = ((perda / (anterior.peso || 1)) * 100).toFixed(1);
                            if (perc > 5) {
                                alertas.push({
                                    titulo: '🐄 Perda de peso: ' + (a.identificacao || a.nome || 'Animal'),
                                    mensagem: 'Perdeu ' + perda + 'kg (' + perc + '%) desde a última pesagem. Verificar saúde.',
                                    gravidade: perc > 10 ? 'alta' : 'media',
                                    modulo: 'Pecuária',
                                    data: ultimo.data || hoje.toLocaleDateString('pt-BR')
                                });
                            }
                        }
                    }
                });
            } catch(e) {}

            try {
                var contratos = state?.filtrarPorPropriedade ? state.filtrarPorPropriedade(dados.contratos || [], 'propriedade') : (dados.contratos || []);
                contratos.forEach(function(c) {
                    if (c.parcelas && Array.isArray(c.parcelas)) {
                        c.parcelas.forEach(function(p) {
                            if (p.status === 'Pendente' && p.vencimento) {
                                var partes = p.vencimento.split('/');
                                var dataVen = new Date(partes[2] + '-' + partes[1] + '-' + partes[0]);
                                var diff = Math.round((dataVen - hoje) / 86400000);
                                if (diff >= 0 && diff <= 5) {
                                    alertas.push({
                                        titulo: '📋 Parcela próxima do vencimento',
                                        mensagem: 'Contrato: ' + (c.numero || 'N/A') + ' | Parcela: ' + (p.numero || 0) + ' | Valor: R$ ' + (p.valor || 0).toFixed(2) + ' | Vence em ' + diff + ' dia(s)',
                                        gravidade: diff <= 1 ? 'alta' : 'media',
                                        modulo: 'Crédito',
                                        data: p.vencimento
                                    });
                                }
                            }
                        });
                    }
                });
            } catch(e) {}

            var ordem = { 'alta': 0, 'media': 1, 'baixa': 2 };
            alertas.sort(function(a, b) { return (ordem[a.gravidade] || 0) - (ordem[b.gravidade] || 0); });

            return alertas;
        },

        // ================================================================
        // 3. RECOMENDAÇÕES PERSONALIZADAS (HÍBRIDO)
        // ================================================================
        _renderRecomendacoes: function() {
            var self = this;
            var container = document.getElementById('ia-conteudo');
            if (!container) return;

            container.innerHTML = '<div style="text-align:center;padding:20px;">💡 Gerando recomendações...</div>';

            setTimeout(function() {
                var recomendacoes = self._gerarRecomendacoes();

                var cards = recomendacoes.map(function(r) {
                    var icones = { 'financeiro': '💰', 'insumos': '📦', 'tarefas': '📋', 'pecuaria': '🐄', 'solo': '🧪', 'geral': '💡' };
                    return `
                        <div style="padding:12px;margin-bottom:8px;background:var(--surface);border-radius:8px;border:1px solid var(--border);border-left:4px solid var(--primary);">
                            <div style="font-size:14px;font-weight:600;">${icones[r.tipo] || '💡'} ${r.titulo}</div>
                            <div style="font-size:13px;margin-top:4px;color:var(--text);">${r.descricao}</div>
                            <div style="font-size:11px;color:var(--text-light);margin-top:4px;">🎯 Prioridade: ${r.prioridade}</div>
                        </div>
                    `;
                }).join('');

                var comIA = self._getApiKey() ? true : false;

                container.innerHTML = `
                    <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:13px;font-weight:600;">💡 ${recomendacoes.length} recomendação(ões)</span>
                        <div style="display:flex;gap:4px;">
                            ${comIA ? '<span style="font-size:10px;color:var(--text-light);padding:4px 8px;background:#e8f5e9;border-radius:10px;">🤖 Com IA</span>' : ''}
                            <button class="btn btn-sm btn-secondary" onclick="GR.Modules.IA._renderRecomendacoes()">🔄 Atualizar</button>
                        </div>
                    </div>
                    ${cards || '<div class="empty-state"><span class="icon">💡</span><div class="message">Sem recomendações no momento</div></div>'}
                    <div style="font-size:11px;color:var(--text-light);margin-top:8px;text-align:center;">
                        💡 Recomendações baseadas nos seus dados. ${comIA ? 'Com a chave API, as recomendações são enriquecidas com IA.' : 'Configure a chave no ⚙️ para recomendações mais detalhadas.'}
                    </div>
                `;

                if (comIA && recomendacoes.length > 0) {
                    self._enriquecerRecomendacoes(recomendacoes);
                }
            }, 300);
        },

        _gerarRecomendacoes: function() {
            var recs = [];
            var state = GR.State;
            var dados = state?.data || {};

            try {
                var analises = dados.analises || [];
                if (analises.length > 0) {
                    var ultima = analises[analises.length - 1];
                    if (ultima.resultados) {
                        var res = ultima.resultados;
                        if (res.ph && parseFloat(res.ph) < 5.5) {
                            recs.push({ tipo: 'solo', titulo: 'Calagem recomendada', descricao: 'O pH do solo está em ' + res.ph + '. Recomenda-se aplicar calcário para elevar o pH ideal para a cultura.', prioridade: 'Alta' });
                        }
                        if (res.fosforo && parseFloat(res.fosforo) < 10) {
                            recs.push({ tipo: 'solo', titulo: 'Fósforo baixo no solo', descricao: 'Nível de fósforo: ' + res.fosforo + '. Considere adubação fosfatada de acordo com a cultura.', prioridade: 'Alta' });
                        }
                        if (res.potassio && parseFloat(res.potassio) < 60) {
                            recs.push({ tipo: 'solo', titulo: 'Potássio abaixo do ideal', descricao: 'Potássio em ' + res.potassio + '. Aplique fertilizante potássico (KCl) conforme recomendação para a cultura.', prioridade: 'Média' });
                        }
                    }
                }
            } catch(e) {}

            try {
                var insumos = dados.insumos || [];
                var baixo = insumos.filter(function(i) { return (i.quantidade || 0) <= (i.estoqueMinimo || 0) && (i.estoqueMinimo || 0) > 0; });
                if (baixo.length > 0) {
                    var nomes = baixo.map(function(i) { return i.nome || i.produto || 'Insumo'; }).join(', ');
                    recs.push({ tipo: 'insumos', titulo: 'Reabastecer estoque', descricao: baixo.length + ' insumo(s) com estoque crítico: ' + nomes + '. Programe a compra para evitar falta.', prioridade: 'Alta' });
                }
            } catch(e) {}

            try {
                var receitas = dados.receitas || [];
                var despesas = dados.despesas || [];
                var totalRec = receitas.reduce(function(s, r) { return s + (r.valor || 0); }, 0);
                var totalDesp = despesas.reduce(function(s, d) { return s + (d.valor || 0); }, 0);
                if (totalDesp > totalRec) {
                    recs.push({ tipo: 'financeiro', titulo: 'Atenção: despesas maiores que receitas', descricao: 'Suas despesas (R$ ' + totalDesp.toFixed(2) + ') superam as receitas (R$ ' + totalRec.toFixed(2) + '). Reveja os custos.', prioridade: 'Alta' });
                }
            } catch(e) {}

            try {
                var tarefas = dados.tarefas || [];
                var pendentes = tarefas.filter(function(t) { return t.status === 'Pendente' || !t.status; });
                if (pendentes.length > 5) {
                    recs.push({ tipo: 'tarefas', titulo: pendentes.length + ' tarefas pendentes', descricao: 'Você tem ' + pendentes.length + ' tarefas em aberto. Priorize as mais urgentes para não acumular.', prioridade: 'Média' });
                }
            } catch(e) {}

            try {
                var animais = dados.animais || [];
                var semPesagem = animais.filter(function(a) { return !a.historicoPeso || a.historicoPeso.length === 0; });
                if (semPesagem.length > 0 && animais.length > 0) {
                    recs.push({ tipo: 'pecuaria', titulo: semPesagem.length + ' animal(is) sem pesagem', descricao: semPesagem.length + ' de ' + animais.length + ' animais nunca foram pesados. Recomenda-se monitoramento de peso mensal.', prioridade: 'Baixa' });
                }
            } catch(e) {}

            try {
                var funcs = dados.funcionarios || [];
                if (funcs.length > 0) {
                    var ferias = funcs.filter(function(f) { return f.status === 'Ativo' && f.dataAdmissao; });
                    ferias.forEach(function(f) {
                        var adm = new Date(f.dataAdmissao);
                        var diff = (new Date() - adm) / 86400000;
                        if (diff > 365) {
                            recs.push({ tipo: 'geral', titulo: 'Férias do funcionário ' + (f.nome || ''), descricao: (f.nome || 'Funcionário') + ' trabalha há mais de 1 ano (' + Math.round(diff / 30) + ' meses). Verifique programação de férias.', prioridade: 'Média' });
                        }
                    });
                }
            } catch(e) {}

            return recs;
        },

        _enriquecerRecomendacoes: function(recomendacoes) {
            var self = this;
            var texto = recomendacoes.map(function(r, i) {
                return (i + 1) + '. ' + r.titulo + ': ' + r.descricao + ' (Prioridade: ' + r.prioridade + ')';
            }).join('\n');

            var prompt = 'Com base nas seguintes recomendações para uma propriedade rural, gere uma análise geral em português brasileiro, priorizando as ações mais importantes. Seja objetivo e prático:\n\n' + texto;

            this._chamarLLM(prompt).then(function(resposta) {
                var el = document.createElement('div');
                el.style.cssText = 'margin-top:12px;padding:12px;background:#f0f7ff;border-radius:8px;border:1px solid #bbdefb;font-size:13px;line-height:1.5;';
                el.innerHTML = '<strong style="color:var(--primary);">🤖 Análise da IA:</strong><br>' + resposta.replace(/\n/g, '<br>');
                var container = document.getElementById('ia-conteudo');
                if (container) container.appendChild(el);
            }).catch(function() {});
        },

        // ================================================================
        // 4. EXTRAÇÃO INTELIGENTE DE DOCUMENTOS
        // ================================================================
        _renderExtracao: function() {
            var self = this;
            var container = document.getElementById('ia-conteudo');
            if (!container) return;

            if (!this._getApiKey()) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="icon">🔑</span>
                        <div class="message">Configure uma chave de API para extrair dados de documentos</div>
                        <button class="btn btn-primary" onclick="GR.Modules.IA._abrirConfig()">⚙️ Configurar Agora</button>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div style="margin-bottom:12px;">
                    <p style="font-size:13px;color:var(--text-light);margin-bottom:8px;">
                        Faça upload de um documento (PDF, imagem) e a IA extrairá automaticamente as informações estruturadas.
                    </p>
                    <div style="border:2px dashed var(--border);border-radius:8px;padding:24px;text-align:center;background:var(--surface);"
                        id="ia-upload-area"
                        ondrop="GR.Modules.IA._processarArquivoDrop(event)"
                        ondragover="event.preventDefault()">
                        <input type="file" id="ia-arquivo-input" accept=".pdf,.jpg,.jpeg,.png,.txt" style="display:none;"
                            onchange="GR.Modules.IA._processarArquivo(event)">
                        <div style="font-size:40px;margin-bottom:8px;">📄</div>
                        <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Arraste um arquivo ou clique para selecionar</div>
                        <div style="font-size:11px;color:var(--text-light);">PDF, JPG, PNG ou TXT</div>
                        <button class="btn btn-primary" style="margin-top:12px;" onclick="document.getElementById('ia-arquivo-input').click()">📁 Selecionar Arquivo</button>
                    </div>
                </div>
                <div id="ia-extracao-resultado"></div>
            `;
        },

        _processarArquivoDrop: function(event) {
            event.preventDefault();
            var files = event.dataTransfer.files;
            if (files.length > 0) {
                this._lerEProcessarArquivo(files[0]);
            }
        },

        _processarArquivo: function(event) {
            var file = event.target.files?.[0];
            if (file) {
                this._lerEProcessarArquivo(file);
            }
        },

        _lerEProcessarArquivo: function(file) {
            var self = this;
            var resultado = document.getElementById('ia-extracao-resultado');
            if (!resultado) return;

            resultado.innerHTML = '<div style="text-align:center;padding:20px;">⏳ Processando "' + file.name + '" com IA...</div>';

            var reader = new FileReader();

            reader.onload = function(e) {
                var conteudo = e.target.result;

                if (file.type === 'application/pdf' || file.type.startsWith('text/')) {
                    self._extrairDeTexto(conteudo, file.name, resultado);
                } else if (file.type.startsWith('image/')) {
                    var base64 = conteudo.split(',')[1];
                    self._extrairDeImagem(base64, file.type, file.name, resultado);
                } else {
                    try {
                        var text = typeof conteudo === 'string' ? conteudo : '';
                        self._extrairDeTexto(text, file.name, resultado);
                    } catch(e) {
                        resultado.innerHTML = '<div style="padding:12px;background:#ffebee;border-radius:6px;color:var(--danger);">❌ Erro ao processar arquivo: ' + e.message + '</div>';
                    }
                }
            };

            if (file.type.startsWith('text/') || file.type === 'application/pdf') {
                reader.readAsText(file);
            } else if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        },

        _extrairDeTexto: function(texto, nomeArquivo, container) {
            var self = this;

            var prompt = 'Extraia informações estruturadas do seguinte documento rural em português brasileiro. Identifique: tipo de documento (nota fiscal, contrato, receituário, relatório, etc.), data, valores, produtos, quantidades, partes envolvidas. Retorne em formato JSON organizado.\n\nCONTEÚDO:\n' + texto.slice(0, 10000);

            this._chamarLLM(prompt).then(function(resposta) {
                var jsonTentativa = self._tentarExtrairJSON(resposta);
                container.innerHTML = self._renderResultadoExtracao(resposta, jsonTentativa);
            }).catch(function(err) {
                container.innerHTML = '<div style="padding:12px;background:#fff3e0;border-radius:6px;color:var(--warning);">⚠️ ' + (err.message || err) + '</div>';
            });
        },

        _extrairDeImagem: function(base64, mimeType, nomeArquivo, container) {
            var self = this;

            if (this._provedor === 'deepseek') {
                container.innerHTML = '<div style="padding:12px;background:#fff3e0;border-radius:6px;color:var(--warning);">⚠️ Análise de imagem requer Gemini. Troque o provedor no ⚙️ ou use a aba "Analisar Imagem" após configurar Gemini.</div>';
                return;
            }

            var prompt = 'Extraia todas as informações visíveis nesta imagem de documento rural. Identifique: tipo de documento, data, valores, produtos, quantidades, nomes. Retorne os dados de forma estruturada.';

            this._chamarGeminiVisao(prompt, base64, mimeType).then(function(resposta) {
                var jsonTentativa = self._tentarExtrairJSON(resposta);
                container.innerHTML = self._renderResultadoExtracao(resposta, jsonTentativa);
            }).catch(function(err) {
                container.innerHTML = '<div style="padding:12px;background:#fff3e0;border-radius:6px;color:var(--warning);">⚠️ ' + (err.message || err) + '</div>';
            });
        },

        _tentarExtrairJSON: function(texto) {
            try {
                var match = texto.match(/\{[\s\S]*\}/);
                if (match) {
                    return JSON.parse(match[0]);
                }
            } catch(e) {}
            return null;
        },

        _renderResultadoExtracao: function(resposta, json) {
            var html = '<div style="margin-top:12px;padding:12px;background:#f5f5f5;border-radius:8px;border:1px solid var(--border);">';

            if (json) {
                html += '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">📋 Dados Extraídos:</div>';
                html += '<div style="font-size:12px;">';
                for (var key in json) {
                    var val = typeof json[key] === 'object' ? JSON.stringify(json[key], null, 2) : json[key];
                    html += '<div style="margin-bottom:4px;"><strong>' + key + ':</strong> ' + val + '</div>';
                }
                html += '</div>';
                html += '<hr style="margin:8px 0;border-color:var(--border);">';
                html += '<button class="btn btn-sm btn-primary" onclick="navigator.clipboard.writeText(\'' + JSON.stringify(json, null, 2).replace(/'/g, "\\'") + '\');GR.Toast.success(\'✅ Copiado!\')">📋 Copiar JSON</button>';
            }

            html += '<div style="margin-top:8px;font-size:12px;color:var(--text);">';
            html += '<strong>Resumo:</strong><br>' + (json ? '✅ Dados extraídos com sucesso' : '📄 Texto extraído:') + '</div>';

            if (!json) {
                html += '<div style="margin-top:4px;padding:8px;background:#fff;border-radius:4px;font-size:12px;max-height:200px;overflow-y:auto;">' + resposta.replace(/\n/g, '<br>') + '</div>';
            }

            html += '</div>';
            return html;
        },

        // ================================================================
        // 5. ANÁLISE DE IMAGENS (GEMINI VISION)
        // ================================================================
        _renderImagem: function() {
            var container = document.getElementById('ia-conteudo');
            if (!container) return;

            var aviso = '';
            if (this._provedor === 'deepseek') {
                aviso = '<div style="padding:8px;background:#fff3e0;border-radius:6px;font-size:12px;color:#e65100;margin-bottom:8px;">⚠️ DeepSeek não suporta análise de imagens. Configure Gemini no ⚙️ para usar este recurso.</div>';
            }

            if (!this._apiKeyGemini) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="icon">🔑</span>
                        <div class="message">Configure a chave da API Gemini para analisar imagens</div>
                        <button class="btn btn-primary" onclick="GR.Modules.IA._abrirConfig()">⚙️ Configurar Agora</button>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                ${aviso}
                <div style="margin-bottom:12px;">
                    <p style="font-size:13px;color:var(--text-light);margin-bottom:8px;">
                        Tire uma foto ou selecione uma imagem para análise. A IA pode identificar:
                    </p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;font-size:12px;">
                        <span style="padding:4px 8px;background:#e8f5e9;border-radius:10px;">🌱 Doenças em plantas</span>
                        <span style="padding:4px 8px;background:#e3f2fd;border-radius:10px;">🐄 Condição animal</span>
                        <span style="padding:4px 8px;background:#fff3e0;border-radius:10px;">📄 Documentos</span>
                        <span style="padding:4px 8px;background:#fce4ec;border-radius:10px;">🔍 Pragas</span>
                    </div>
                    <div style="border:2px dashed var(--border);border-radius:8px;padding:24px;text-align:center;background:var(--surface);"
                        id="ia-img-area"
                        ondrop="GR.Modules.IA._processarImagemDrop(event)"
                        ondragover="event.preventDefault()">
                        <input type="file" id="ia-img-input" accept="image/*" style="display:none;"
                            onchange="GR.Modules.IA._processarImagemUpload(event)">
                        <div style="font-size:40px;margin-bottom:8px;">📷</div>
                        <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Selecione uma imagem para analisar</div>
                        <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
                            <button class="btn btn-primary" onclick="document.getElementById('ia-img-input').click()">📁 Escolher Imagem</button>
                            <button class="btn btn-info" onclick="GR.Modules.IA._capturarCamera()">📸 Usar Câmera</button>
                        </div>
                    </div>
                </div>
                <div id="ia-img-preview" style="display:none;margin-bottom:12px;text-align:center;">
                    <img id="ia-img-mostrar" style="max-width:100%;max-height:300px;border-radius:8px;border:1px solid var(--border);">
                    <div style="margin-top:8px;">
                        <button class="btn btn-primary" onclick="GR.Modules.IA._analisarImagem()">🔍 Analisar Imagem</button>
                        <button class="btn btn-secondary" onclick="GR.Modules.IA._limparImagem()">❌ Remover</button>
                    </div>
                </div>
                <div id="ia-img-resultado"></div>
                <div id="ia-camera-container" style="display:none;">
                    <video id="ia-camera" style="width:100%;max-height:300px;border-radius:8px;" autoplay></video>
                    <div style="margin-top:8px;display:flex;gap:4px;justify-content:center;">
                        <button class="btn btn-primary" onclick="GR.Modules.IA._capturarFoto()">📸 Capturar</button>
                        <button class="btn btn-secondary" onclick="GR.Modules.IA._pararCamera()">❌ Fechar Câmera</button>
                    </div>
                </div>
            `;
        },

        _streamCamera: null,

        _capturarCamera: function() {
            var self = this;
            var container = document.getElementById('ia-camera-container');
            if (!container) return;
            container.style.display = 'block';

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                    .then(function(stream) {
                        self._streamCamera = stream;
                        var video = document.getElementById('ia-camera');
                        if (video) video.srcObject = stream;
                    })
                    .catch(function(err) {
                        GR.Toast.error('❌ Erro ao acessar câmera: ' + err.message);
                    });
            } else {
                GR.Toast.warning('⚠️ Câmera não suportada neste navegador');
            }
        },

        _capturarFoto: function() {
            var video = document.getElementById('ia-camera');
            if (!video) return;
            var canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            this._streamCamera?.getTracks().forEach(function(t) { t.stop(); });
            document.getElementById('ia-camera-container').style.display = 'none';
            this._mostrarImagemPreview(dataUrl);
        },

        _pararCamera: function() {
            this._streamCamera?.getTracks().forEach(function(t) { t.stop(); });
            document.getElementById('ia-camera-container').style.display = 'none';
        },

        _processarImagemDrop: function(event) {
            event.preventDefault();
            var files = event.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this._lerImagem(files[0]);
            }
        },

        _processarImagemUpload: function(event) {
            var file = event.target.files?.[0];
            if (file && file.type.startsWith('image/')) {
                this._lerImagem(file);
            }
        },

        _lerImagem: function(file) {
            var reader = new FileReader();
            var self = this;
            reader.onload = function(e) {
                self._mostrarImagemPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        },

        _mostrarImagemPreview: function(dataUrl) {
            this._imagemSelecionada = dataUrl;
            var preview = document.getElementById('ia-img-preview');
            var img = document.getElementById('ia-img-mostrar');
            if (preview) preview.style.display = 'block';
            if (img) img.src = dataUrl;
            document.getElementById('ia-img-resultado').innerHTML = '';
        },

        _limparImagem: function() {
            this._imagemSelecionada = null;
            var preview = document.getElementById('ia-img-preview');
            if (preview) preview.style.display = 'none';
            document.getElementById('ia-img-resultado').innerHTML = '';
        },

        _analisarImagem: function() {
            var self = this;
            if (!this._imagemSelecionada) {
                GR.Toast.warning('⚠️ Selecione uma imagem primeiro');
                return;
            }

            if (!this._apiKeyGemini) {
                GR.Toast.error('❌ Análise de imagens requer chave Gemini configurada no ⚙️');
                return;
            }

            var resultado = document.getElementById('ia-img-resultado');
            if (!resultado) return;

            resultado.innerHTML = '<div style="text-align:center;padding:20px;">🔍 Analisando imagem com IA...</div>';

            var base64 = this._imagemSelecionada.split(',')[1];
            var mimeType = this._imagemSelecionada.split(';')[0].split(':')[1] || 'image/jpeg';

            var prompt = 'Analise esta imagem detalhadamente. Se for uma planta/cultura: identifique a espécie, possíveis doenças, pragas ou deficiências nutricionais. Se for um animal: avalie a condição corporal. Se for um documento: extraia as informações. Se for outro: descreva o que vê. Responda em português brasileiro.';

            this._chamarGeminiVisao(prompt, base64, mimeType).then(function(resposta) {
                resultado.innerHTML = `
                    <div style="padding:12px;background:#f0f7ff;border-radius:8px;border:1px solid #bbdefb;">
                        <div style="font-size:14px;font-weight:600;margin-bottom:8px;">🔍 Resultado da Análise:</div>
                        <div style="font-size:13px;line-height:1.6;">${resposta.replace(/\n/g, '<br>')}</div>
                    </div>
                `;
            }).catch(function(err) {
                resultado.innerHTML = '<div style="padding:12px;background:#ffebee;border-radius:6px;color:var(--danger);">❌ ' + (err.message || err) + '</div>';
            });
        },

        // ================================================================
        // 6. PREVISÃO DE SAFRA (LOCAL)
        // ================================================================
        _renderPrevisao: function() {
            var self = this;
            var container = document.getElementById('ia-conteudo');
            if (!container) return;

            container.innerHTML = '<div style="text-align:center;padding:20px;">📈 Calculando previsões...</div>';

            setTimeout(function() {
                var previsoes = self._calcularPrevisoes();

                if (!previsoes || previsoes.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <span class="icon">📊</span>
                            <div class="message">Sem dados suficientes para previsões</div>
                            <div style="font-size:12px;color:var(--text-light);margin-top:8px;">
                                Cadastre produções, culturas e colheitas para gerar previsões.
                            </div>
                        </div>
                    `;
                    return;
                }

                var cards = previsoes.map(function(p) {
                    return `
                        <div style="padding:12px;margin-bottom:8px;background:var(--surface);border-radius:8px;border:1px solid var(--border);border-left:4px solid var(--primary);">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div style="font-size:14px;font-weight:600;">${p.cultura}</div>
                                <span style="font-size:11px;color:var(--text-light);">${p.propriedade}</span>
                            </div>
                            <div style="margin-top:8px;display:flex;gap:16px;flex-wrap:wrap;">
                                <div style="text-align:center;">
                                    <div style="font-size:20px;font-weight:700;color:var(--primary);">${p.previsao}</div>
                                    <div style="font-size:11px;color:var(--text-light);">Previsão ${p.safra}</div>
                                </div>
                                <div style="text-align:center;">
                                    <div style="font-size:16px;font-weight:600;color:var(--text);">${p.mediaHistorica || '-'}</div>
                                    <div style="font-size:11px;color:var(--text-light);">Média histórica</div>
                                </div>
                                <div style="text-align:center;">
                                    <div style="font-size:16px;font-weight:600;color:${p.tendencia === 'crescimento' ? 'var(--success)' : p.tendencia === 'queda' ? 'var(--danger)' : 'var(--text)'}">
                                        ${p.tendencia === 'crescimento' ? '📈' : p.tendencia === 'queda' ? '📉' : '➡️'} ${p.percentualTendencia || ''}
                                    </div>
                                    <div style="font-size:11px;color:var(--text-light);">Tendência</div>
                                </div>
                            </div>
                            ${p.observacao ? '<div style="font-size:12px;color:var(--text-light);margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">💡 ' + p.observacao + '</div>' : ''}
                        </div>
                    `;
                }).join('');

                container.innerHTML = `
                    <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:13px;font-weight:600;">📈 Previsões de Safra</span>
                        <span style="font-size:10px;color:var(--text-light);background:var(--bg);padding:4px 8px;border-radius:8px;">100% local - sem custo</span>
                    </div>
                    ${cards}
                    <div style="margin-top:8px;padding:12px;background:#f0f7ff;border-radius:8px;border:1px solid #bbdefb;font-size:12px;color:var(--text-light);">
                        <strong>📌 Como funciona:</strong> As previsões usam regressão linear simples baseada no histórico de colheitas e produções cadastradas no sistema. Quanto mais dados, mais precisa a previsão.
                    </div>
                `;
            }, 300);
        },

        _calcularPrevisoes: function() {
            var previsoes = [];
            var state = GR.State;
            var dados = state?.data || {};

            try {
                var culturas = dados.culturas || [];
                var colheitas = dados.colheitas || [];
                var producoes = dados.producoes || [];
                var safras = dados.safras || [];

                var culturasMap = {};

                colheitas.forEach(function(c) {
                    var nome = c.cultura || c.nome || 'Cultura';
                    if (!culturasMap[nome]) {
                        culturasMap[nome] = { nome: nome, dados: [], propriedade: c.propriedade || 'N/A' };
                    }
                    culturasMap[nome].dados.push({
                        ano: parseInt(c.safra || c.ano || new Date(c.data || Date.now()).getFullYear()),
                        produtividade: parseFloat(c.produtividade || c.quantidade || 0),
                        area: parseFloat(c.area || 0)
                    });
                });

                producoes.forEach(function(p) {
                    var nome = p.cultura || p.produto || 'Produção';
                    if (!culturasMap[nome]) {
                        culturasMap[nome] = { nome: nome, dados: [], propriedade: p.propriedade || 'N/A' };
                    }
                    culturasMap[nome].dados.push({
                        ano: parseInt(p.safra || p.ano || new Date(p.data || Date.now()).getFullYear()),
                        produtividade: parseFloat(p.quantidade || p.produtividade || 0),
                        area: parseFloat(p.area || 0)
                    });
                });

                safras.forEach(function(s) {
                    var nome = s.cultura || s.nome || 'Safra';
                    if (!culturasMap[nome]) {
                        culturasMap[nome] = { nome: nome, dados: [], propriedade: s.propriedade || 'N/A' };
                    }
                    culturasMap[nome].dados.push({
                        ano: parseInt(s.safra || s.ano || new Date(s.data || Date.now()).getFullYear()),
                        produtividade: parseFloat(s.produtividade || s.quantidade || 0),
                        area: parseFloat(s.area || 0)
                    });
                });

                var anoAtual = new Date().getFullYear();

                for (var nome in culturasMap) {
                    var info = culturasMap[nome];
                    if (info.dados.length < 2) continue;

                    info.dados.sort(function(a, b) { return a.ano - b.ano; });

                    var anos = info.dados.map(function(d) { return d.ano; });
                    var valores = info.dados.map(function(d) { return d.produtividade; });

                    var media = valores.reduce(function(s, v) { return s + v; }, 0) / valores.length;

                    var n = valores.length;
                    var somaX = anos.reduce(function(s, a) { return s + a; }, 0);
                    var somaY = valores.reduce(function(s, v) { return s + v; }, 0);
                    var somaXY = 0;
                    var somaX2 = 0;
                    for (var i = 0; i < n; i++) {
                        somaXY += anos[i] * valores[i];
                        somaX2 += anos[i] * anos[i];
                    }

                    var declive = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);
                    var intercepto = (somaY - declive * somaX) / n;

                    var previsaoProxAno = declive * (anoAtual + 1) + intercepto;

                    if (previsaoProxAno < 0) previsaoProxAno = media * 0.9;

                    var ultimoValor = valores[valores.length - 1];
                    var tendencia = previsaoProxAno > ultimoValor ? 'crescimento' : previsaoProxAno < ultimoValor ? 'queda' : 'estavel';
                    var percTendencia = ultimoValor > 0 ? (((previsaoProxAno - ultimoValor) / ultimoValor) * 100).toFixed(1) + '%' : '';

                    var observacao = '';
                    if (tendencia === 'crescimento') {
                        observacao = 'Tendência de crescimento baseada nos últimos ' + n + ' registro(s). Continue com o manejo atual.';
                    } else if (tendencia === 'queda') {
                        observacao = 'Atenção: tendência de queda. Reveja o manejo, adubação e tratos culturais.';
                    } else {
                        observacao = 'Produtividade estável. Mantenha as práticas atuais.';
                    }

                    previsoes.push({
                        cultura: nome,
                        propriedade: info.propriedade,
                        safra: anoAtual + 1 + '/' + (anoAtual + 2),
                        previsao: previsaoProxAno.toFixed(1) + (info.dados[0].area ? ' (un)' : ''),
                        mediaHistorica: media.toFixed(1),
                        tendencia: tendencia,
                        percentualTendencia: percTendencia,
                        observacao: observacao,
                        confiabilidade: n >= 3 ? 'Alta' : 'Média'
                    });
                }
            } catch(e) {
                console.warn('⚠️ Erro ao calcular previsões:', e);
            }

            return previsoes;
        }
    };
})();