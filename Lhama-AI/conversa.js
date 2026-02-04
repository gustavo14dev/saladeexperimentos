let treinamentos = [];
let historicoConversa = [];
let bancoImagens = {}; // Inicializada como objeto vazio para ser carregada via fetch.

// ===== SISTEMA DE PERSONALIDADES =====
let personalidadeAtual = 'Normal';

const configuracoesPersonalidade = {
    'Normal': {
        icone: 'person',
        prompt: 'Seja uma assistente equilibrada, prestativa e amigável. Responda de forma clara e útil.'
    },
    'Divertida': {
        icone: 'mood',
        prompt: 'Seja uma assistente engraçada, animada e cheia de energia! Use piadas, emojis e tom descontraído. Seja sempre positiva e divertida!'
    },
    'Criativa': {
        icone: 'lightbulb',
        prompt: 'Seja uma assistente criativa, inovadora e inspiradora. Pense fora da caixa, use metáforas e ideias originais.'
    },
    'Analítica': {
        icone: 'analytics',
        prompt: 'Seja uma assistente lógica, detalhista e analítica. Foque em dados, fatos e raciocínio estruturado. Seja precisa e objetiva.'
    },
    'Motivadora': {
        icone: 'emoji_events',
        prompt: 'Seja uma assistente motivadora e positiva! Incentive, inspire e levante o ânimo. Use palavras de encorajamento e pensamento positivo.'
    },
    'Acadêmica': {
        icone: 'school',
        prompt: 'Seja uma assistente formal e educativa. Use linguagem culta, explique conceitos com profundidade e mantenha um tom acadêmico.'
    },
    'Dramática': {
        icone: 'theater_comedy',
        prompt: 'Seja uma assistente expressiva e teatral! Use linguagem dramática, exclamações e tom emocionante. Seja como uma atriz de palco!'
    },
    'Curiosa': {
        icone: 'psychology_alt',
        prompt: 'Seja uma assistente curiosa e investigativa. Faça perguntas, explore diferentes ângulos e mostre interesse genuíno em aprender.'
    },
    'Minimalista': {
        icone: 'minimize',
        prompt: 'Seja uma assistente direta e objetiva. Vá direto ao ponto, use frases curtas e seja concisa. Sem rodeios ou excessos.'
    },
    'Zen': {
        icone: 'self_improvement',
        prompt: 'Seja uma assistente calma e meditativa. Use linguagem tranquila, fale com sabedoria interior e mantenha a paz mental.'
    },
    'Pirata': {
        icone: 'sailing',
        prompt: 'Seja uma assistente pirata! Use linguagem de marujos, fale sobre tesouros, aventuras e mares. Seja ousada e aventureira!'
    },
    'Redatora': {
        icone: 'edit_note',
        prompt: 'Seja uma assistente redatora profissional. Use linguagem eloquente, persuasiva e bem estruturada. Escreva com clareza e elegância.'
    },
    'Executiva': {
        icone: 'business_center',
        prompt: 'Seja uma assistente executiva e profissional. Seja direta, eficiente e focada em resultados. Use linguagem de negócios.'
    },
    'Empática': {
        icone: 'favorite',
        prompt: 'Seja uma assistente compreensiva e acolhedora. Demonstre empatia, ouça com atenção e ofereça apoio emocional.'
    }
};

// Modos de funcionalidade

// Debug: Verificar se a API Groq está disponível
console.log('[CONVERSA] Inicializando conversa.js...');

// Aguardar um pouco para garantir que a API foi carregada
setTimeout(() => {
    console.log('[CONVERSA] Verificação tardia - window.lhamaGroqAPI:', !!window.lhamaGroqAPI);
    if (window.lhamaGroqAPI) {
        console.log('[CONVERSA] API está disponível:', window.lhamaGroqAPI.estaDisponivel());
    }
}, 100);

// ===== SISTEMA DE SCROLL INTELIGENTE =====
let isUserScrolling = false;
let _scrollTimeout = null;
const SCROLL_DISTANCE_THRESHOLD = 300; // px - quando exceder, mostra botão

function initScrollSystem() {
    const container = document.getElementById('chat-box-container');
    const btn = document.getElementById('scrollToBottomBtn');
    if (!container) return;

    container.addEventListener('scroll', () => {
        isUserScrolling = true;
        checkScrollButtonVisibility();
        if (_scrollTimeout) clearTimeout(_scrollTimeout);
        _scrollTimeout = setTimeout(() => {
            isUserScrolling = false;
            checkScrollButtonVisibility();
        }, 1500);
    });

    if (btn) {
        btn.addEventListener('click', () => {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            btn.style.display = 'none';
            isUserScrolling = false;
            setTimeout(() => checkScrollButtonVisibility(), 300);
        });
    }
}

// Inicializar sistema de scroll ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    try { initScrollSystem(); } catch (e) { /* ignore */ }
    // Checar visibilidade do botão uma vez após carregamento
    setTimeout(() => { try { checkScrollButtonVisibility(); } catch(e){} }, 300);
});

function checkScrollButtonVisibility() {
    const container = document.getElementById('chat-box-container');
    const btn = document.getElementById('scrollToBottomBtn');
    if (!container || !btn) return;
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distance > SCROLL_DISTANCE_THRESHOLD) {
        btn.style.display = 'flex';
    } else {
        btn.style.display = 'none';
    }
}

// ===== ANÚNCIO =====
function mostrarAnuncio() {
    const overlay = document.createElement('div');
    overlay.id = 'anuncio-overlay';
    overlay.className = 'anuncio-overlay';
    overlay.innerHTML = `
        <div class="anuncio-container">
            <div class="titulo-com-badge">
                <h2 class="titulo-animado">Lhama AI 1</h2>
            </div>
            <div class="anuncio-texto">
                <ul>
                    <li>Mais inteligente</li>
                    <li>30.000 novos treinamentos</li>
                    <li>Design premium e mais suave</li>
                    <li>Interface aprimorada estilo moderno</li>
                    <li>Ficando cada vez mais profissional</li>
                </ul>
            </div>
            <div class="anuncio-botoes">
                <button onclick="fecharAnuncio()">Fechar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function fecharAnuncio() {
    const overlay = document.getElementById('anuncio-overlay');
    if (overlay) overlay.remove();
}

// ===== MENU MOBILE =====
function toggleToolsMenu() {
    const dropdown = document.getElementById('tools-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('tools-dropdown');
    const trigger = document.getElementById('menu-trigger');
    if (dropdown && trigger && !dropdown.contains(e.target) && !trigger.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});
function closeToolsMenuMobile() {
    const dropdown = document.getElementById('tools-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}


// ===== FUNÇÕES DE UTILITÁRIOS (SENTIMENTO, TEXTO, MARCA D'ÁGUA) =====

function enviarMensagem() {
    const input = document.getElementById('input-mensagem');
    const btnEnviar = document.getElementById('btn-send');
    const inputAreaContainer = document.querySelector('.input-area-container');

    let mensagem = input.value.trim();

    if (!mensagem) return;

    // Inicia animação de onda colorida
    if (inputAreaContainer) {
        inputAreaContainer.classList.add('wave-animation');
        setTimeout(() => { inputAreaContainer.classList.remove('wave-animation'); }, 600);
    }

    // Limpar input
    input.value = '';
    input.style.height = '';

    // Adicionar mensagem do usuário ao chat
    adicionarMensagem(mensagem, 'usuario');

    // Gerar resposta da IA
    gerarResposta(mensagem, historicoConversa).then(resposta => {
        // Adicionar resposta da IA ao chat
        adicionarMensagem(resposta, 'bot');
        
        // Reabilitar botão
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = '<span class="material-icons-round text-base">arrow_upward</span>';
        }
        
        // Scroll para baixo
        const container = document.getElementById('chat-box-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }).catch(erro => {
        console.error('[ERRO] Falha ao gerar resposta:', erro);
        adicionarMensagem('Desculpe, estou com dificuldades para responder no momento. Tente novamente em alguns instantes.', 'bot');
        
        // Reabilitar botão
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = '<span class="material-icons-round text-base">arrow_upward</span>';
        }
    });
}

function adicionarMensagem(texto, tipo, imagemNome = null) {
    // Salvar no histórico
    if (typeof salvarMensagemHistorico !== 'undefined') {
        salvarMensagemHistorico(tipo, texto);
    }

    const chatBox = document.getElementById('chat-box');
    const divMensagem = document.createElement('div');
    divMensagem.className = `mensagem ${tipo}`;
    const divContent = document.createElement('div');
    divContent.className = 'message-content';
    
    if (tipo === 'bot') {
        // Verificar se é uma imagem gerada (contém HTML de imagem)
        if (texto.includes('imagem-gerada-container')) {
            // Adicionar mensagem de imagem diretamente sem animação
            divContent.innerHTML = texto;
            divMensagem.appendChild(divContent);
            chatBox.appendChild(divMensagem);
            
            // Adicionar botões de ação para imagem
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions-container';
            
            const btnCopy = document.createElement('button');
            btnCopy.className = 'action-icon-btn';
            btnCopy.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">content_copy</span> <span>Copiar URL</span>';
            btnCopy.onclick = () => {
                const imgElement = divContent.querySelector('.imagem-gerada');
                if (imgElement) {
                    navigator.clipboard.writeText(imgElement.src);
                }
            };
            actionsContainer.appendChild(btnCopy);
            
            const btnDownload = document.createElement('button');
            btnDownload.className = 'action-icon-btn';
            btnDownload.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">download</span> <span>Download</span>';
            btnDownload.onclick = () => {
                const imgElement = divContent.querySelector('.imagem-gerada');
                if (imgElement) {
                    baixarImagem(imgElement.src);
                }
            };
            actionsContainer.appendChild(btnDownload);
            
            divMensagem.appendChild(actionsContainer);
        } else {
            // Processar o texto com o renderizador se disponível
            let textoProcessado = texto;
            if (typeof RespostaRenderer !== 'undefined' && RespostaRenderer && RespostaRenderer.processar) {
                textoProcessado = RespostaRenderer.processar(texto);
            }
            
            const textoSemHTML = texto.replace(/<[^>]*>/g, '');
            // Animação de digitação letra por letra
            let i = 0;
            divContent.innerHTML = '';
            divMensagem.appendChild(divContent); // Corrige bug: adiciona conteúdo antes da animação
            chatBox.appendChild(divMensagem);
            function escreverLetra() {
                if (i <= textoProcessado.length) {
                    divContent.innerHTML = textoProcessado.slice(0, i);
                    scrollParaBaixo();
                    i++;
                    setTimeout(escreverLetra, 8 + Math.random() * 18);
                } else {
                    divContent.innerHTML = textoProcessado;
                    // ...ações e imagem...
                    if (imagemNome) {
                        const imgContainer = document.createElement('div');
                        imgContainer.className = 'imagem-container-premium';
                        imgContainer.innerHTML = '<div class="skeleton-loader"></div>';
                        divContent.appendChild(imgContainer);
                        const img = new Image();
                        img.src = `img-IA/${imagemNome}`;
                        img.className = 'imagem-resposta-premium';
                        img.alt = "Imagem gerada por IA";
                        img.crossOrigin = 'Anonymous';
                        img.onload = () => {
                            setTimeout(() => {
                                adicionarMarcaDagua(img);
                                imgContainer.innerHTML = '';
                                imgContainer.appendChild(img);
                                scrollParaBaixo();
                            }, 1000);
                        };
                        img.onerror = () => {
                            imgContainer.innerHTML = '<span style="font-size:12px; color:#999;">Erro ao gerar imagem.</span>';
                        };
                    }
                    // Ações da Mensagem
                    const actionsContainer = document.createElement('div');
                    actionsContainer.className = 'message-actions-container';
                    const btnCopy = document.createElement('button');
                    btnCopy.className = 'action-icon-btn';
                    btnCopy.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">content_copy</span> <span>Copiar</span>';
                    btnCopy.onclick = () => copiarTexto(textoSemHTML);
                    actionsContainer.appendChild(btnCopy);
                    const btnAudio = document.createElement('button');
                    btnAudio.className = 'action-icon-btn audio-btn';
                    btnAudio.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">volume_up</span> <span>Ouvir</span>';
                    btnAudio.onclick = () => lerTextoEmVoz(textoSemHTML);
                    actionsContainer.appendChild(btnAudio);
                    if (imagemNome && !texto.includes('image2-composicao-container')) {
                        const btnDownload = document.createElement('button');
                        btnDownload.className = 'action-icon-btn';
                        btnDownload.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">download</span> <span>Download</span>';
                        btnDownload.onclick = () => baixarImagem(`img-IA/${imagemNome}`);
                        actionsContainer.appendChild(btnDownload);
                    }
                    divMensagem.appendChild(actionsContainer);
                }
            }
            escreverLetra();
        }
    } else {
        divContent.innerHTML = texto;
        divMensagem.appendChild(divContent);
        chatBox.appendChild(divMensagem);
    }
    scrollParaBaixo();
}

function scrollParaBaixo() {
    const chatBoxContainer = document.getElementById('chat-box-container');
    if (!chatBoxContainer) return;
    chatBoxContainer.scrollTo({ top: chatBoxContainer.scrollHeight, behavior: 'smooth' });
    const btn = document.getElementById('scrollToBottomBtn');
    if (btn) btn.style.display = 'none';
}

function mostrarDigitando(mostrar) {
    const chatBox = document.getElementById('chat-box');
    const digitandoElement = document.getElementById('digitando');
    if (mostrar) {
        if (!digitandoElement) {
            const div = document.createElement('div');
            div.id = 'digitando';
            div.className = 'mensagem bot digitando';
            div.innerHTML = '<div class="message-content">Lhama AI está pensando...</div>';
            chatBox.appendChild(div);
        }
        scrollParaBaixo();
    } else {
        if (digitandoElement) digitandoElement.remove();
    }
}

// ===== FUNÇÃO MELHORADA COM RETRY AUTOMÁTICO - VIA PROXY OTIMIZADO =====
async function gerarImagemComRetry(prompt) {
    console.log('[IMAGEM] Gerando imagem com Pollinations AI (via proxy):', prompt);
    
    const maxRetries = 3;
    const retryDelay = 2000; // 2 segundos entre tentativas
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[IMAGEM] Tentativa ${attempt}/${maxRetries}`);
            
            // Usar proxy otimizado para evitar CORS
            const response = await fetch('/api/flux-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            console.log('[IMAGEM] Status do proxy:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[IMAGEM] Erro no proxy:', response.status, errorText);
                
                // Se for erro 502/503 e ainda temos tentativas, tentar novamente
                if ((response.status === 502 || response.status === 503 || response.status === 429) && attempt < maxRetries) {
                    console.log(`[IMAGEM] Erro ${response.status} detectado, tentando novamente em ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }
                
                if (response.status === 401) {
                    return "🔐 Erro de autenticação com Pollinations AI.";
                } else if (response.status === 429) {
                    return "⏱️ Muitas requisições. Tente novamente em alguns segundos.";
                } else if (response.status === 500 || response.status === 502 || response.status === 503) {
                    return "⚠️ Serviço Pollinations AI temporariamente indisponível. Tente novamente em alguns minutos.";
                } else {
                    return `Erro na API Pollinations: ${errorText || response.statusText}`;
                }
            }

            const data = await response.json();
            console.log('[IMAGEM] Dados recebidos do proxy:', data);
            
            if (data.data && data.data.length > 0 && data.data[0].url) {
                const imageUrl = data.data[0].url;
                console.log('[IMAGEM] Imagem gerada com sucesso!');

                // Adicionar timestamp para evitar cache
                const timestampedImageUrl = `${imageUrl}?t=${Date.now()}`;

                return `<div class="imagem-gerada-container">
                    <img src="${timestampedImageUrl}" alt="Imagem gerada por Pollinations AI" class="imagem-gerada" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkVycm8gYW8gY2FycmVnYXIgaW1hZ2VtPC90ZXh0Pjwvc3ZnPg=='" />
                </div>`;
            } else {
                console.error('[IMAGEM] Estrutura de resposta inválida');
                return "Desculpe, não consegui gerar a imagem. Tente novamente.";
            }

        } catch (erro) {
            console.error(`[IMAGEM] Erro na tentativa ${attempt}:`, erro);
            
            // Se for erro de rede e ainda temos tentativas, tentar novamente
            if ((erro.message.includes('fetch') || erro.message.includes('network') || erro.message.includes('CORS')) && attempt < maxRetries) {
                console.log(`[IMAGEM] Erro de rede/CORS detectado, tentando novamente em ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
            }
            
            if (attempt === maxRetries) {
                return "❌ Erro na API Pollinations após várias tentativas. O serviço pode estar temporariamente indisponível. Tente novamente em alguns minutos.";
            }
        }
    }
    
    return "❌ Não foi possível gerar a imagem após várias tentativas. Tente novamente mais tarde.";
}

// Substituir a função original
async function gerarImagem(prompt) {
    return await gerarImagemComRetry(prompt);
}

// ===== DOWNLOAD/COPY/AUDIO =====
function baixarImagem(src) {
    const a = document.createElement('a');
    a.href = src;
    a.download = `DoraAI-${Date.now()}.png`;
    a.click();
}
function copiarTexto(txt) { navigator.clipboard.writeText(txt.replace(/<p>|<\/p>|<br>/g, '\n').replace(/<[^>]*>/g, '')); }
function lerTextoEmVoz(txt) {
    const txtLimpo = txt.replace(/<[^>]*>/g, '');
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();
    const u = new SpeechSynthesisUtterance(txtLimpo);
    
    // Buscar vozes de português português (Portugal) primeiro
    const voices = synth.getVoices ? synth.getVoices() : [];
    let vozEscolhida = null;
    
    // Preferências: primeiro pt-PT (Portugal), depois Google Portuguese, depois qualquer português
    const preferenciaNomes = [
        'pt-pt',
        'portuguese (portugal)',
        'portuguese portugal',
        'português (portugal)',
        'português portugal',
        'google português',
        'portuguese',
        'pt-br',
        'portuguese (brazil)',
        'português (brasil)',
        'luciana',
        'daniel',
        'joão',
        'joao',
        'maria'
    ];
    
    // Tentar encontrar pela ordem de preferência
    for (const pref of preferenciaNomes) {
        const encontrada = voices.find(v => {
            const nameLower = (v.name||'').toLowerCase();
            const langLower = (v.lang||'').toLowerCase();
            return nameLower.includes(pref) || langLower.includes(pref);
        });
        if (encontrada) {
            vozEscolhida = encontrada;
            break;
        }
    }
    
    // Fallback: qualquer voz portuguesa
    if (!vozEscolhida) {
        for (const v of voices) {
            if (v.lang && v.lang.toLowerCase().startsWith('pt')) {
                vozEscolhida = v;
                break;
            }
        }
    }
    
    if (vozEscolhida) {
        u.voice = vozEscolhida;
        u.lang = vozEscolhida.lang;
    } else {
        u.lang = 'pt-PT'; // Preferir pt-PT por padrão
    }
    
    // Parâmetros para voz clara e natural
    u.rate = 0.9;      // Velocidade um pouco mais lenta para clareza
    u.pitch = 1.0;     // Tom natural
    u.volume = 1.0;    // Volume máximo
    
    console.log('TTS using voice:', (u.voice && u.voice.name) || u.lang);
    synth.speak(u);
    return u;
}

// ===== INICIALIZAÇÃO E RESETS =====

function iniciarNovaConversa() {
    historicoConversa = [];
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = `
        <div class="mensagem bot boas-vindas-inicial">
            <div class="message-content">Olá!
Sou a Dora AI. Como posso te ajudar hoje? ✨</div>
        </div>
    `;
    const input = document.getElementById('input-mensagem');
    input.value = '';
    input.placeholder = "Converse com a Dora AI...";
    input.focus();
}

function ajustarAlturaTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.classList.remove('scrolling');
}

function atualizarBotaoAudioEnviar() {
    const textarea = document.getElementById('input-mensagem');
    const btnSend = document.getElementById('btn-send');
    if (!textarea || !btnSend) return;
    const hasText = textarea.value.trim().length > 0;
    // manter o botão habilitado mesmo sem texto (ele abre o modo Live)
    btnSend.disabled = false;
    if (hasText) {
        btnSend.classList.remove('send-live');
    } else {
        btnSend.classList.add('send-live');
    }
}

function clicouBotaoAcao() {
    const textarea = document.getElementById('input-mensagem');
    if (textarea && textarea.value.trim().length > 0) enviarMensagem();
    else gravarAudio();
}

// Transcrição de Voz
let isListening = false;
let _tempTranscript = '';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true; // mantem até o usuário parar
recognition.interimResults = true; // resultados parciais
recognition.lang = 'pt-BR';

recognition.onstart = () => {
    isListening = true;
    _tempTranscript = '';
    const mic = document.getElementById('btn-mic');
    if (mic) mic.classList.add('recording');
};

recognition.onend = () => {
    isListening = false;
    const mic = document.getElementById('btn-mic');
    if (mic) mic.classList.remove('recording');
    // auto-enviar se houver algo transcrito
    const val = (_tempTranscript || '').trim();
    if (val.length > 0) {
        const input = document.getElementById('input-mensagem');
        if (input) {
            input.value = val;
            atualizarBotaoAudioEnviar();
            enviarMensagem();
        }
    }
};

recognition.onresult = (e) => {
    let interim = '';
    let final = '';
    for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
    }
    // guarda em temp e atualiza o input para visualização ao usuário
    _tempTranscript = (final + ' ' + interim).trim();
    const input = document.getElementById('input-mensagem');
    if (input) {
        input.value = _tempTranscript;
        ajustarAlturaTextarea(input);
        atualizarBotaoAudioEnviar();
    }
};

function gravarAudio() {
    try {
        if (!isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }
    } catch (err) {
        console.error(err);
    }
}

// ===== FUNÇÕES FALTANTES =====

async function gerarResposta(mensagemUsuario, historicoConversa = []) {
    const mensagemOriginal = mensagemUsuario;
    mensagemUsuario = mensagemUsuario.toLowerCase();
    const sentimento = detectarSentimento(mensagemUsuario);
    const palavrasUsuario = mensagemUsuario.split(/\W+/).filter(Boolean);

    let melhorResposta = null;

    // Forçar chamada direta à API Groq sem dependência da classe
    console.log('[DEBUG] Forçando chamada direta à API Groq...');
    
    try {
        const response = await fetch('/api/lhama-groq-api-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: `Você é a Lhama AI 1, uma assistente EXTREMAMENTE INTELIGENTE, criativa e MUITO ÚTIL. Responda em português brasileiro de forma completa e detalhada.`
                    },
                    ...historicoConversa.map(msg => ({
                        role: msg.tipo === 'usuario' ? 'user' : 'assistant',
                        content: msg.texto
                    })),
                    {
                        role: 'user',
                        content: mensagemOriginal
                    }
                ],
                temperature: 0.7,
                max_tokens: 8192,
                top_p: 1,
                stream: false
            })
        });

        console.log('[DEBUG] Resposta do proxy:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[DEBUG] Erro na API:', response.status, errorText);
            
            if (response.status === 401) {
                return formatarResposta("🔐 Chave API não configurada. Verifique a variável LHAMA_GROQ_API_PROXY na Vercel.");
            } else if (response.status === 403) {
                return formatarResposta("❌ Sem permissão para usar a API. Verifique a variável LHAMA_GROQ_API_PROXY.");
            } else if (response.status === 429) {
                return formatarResposta("⏱️ Muitas requisições. Tente novamente em alguns segundos.");
            } else if (response.status === 500) {
                return formatarResposta("🔧 Servidor da API indisponível. Tente novamente.");
            } else {
                return formatarResposta(`Erro na API: ${errorText || response.statusText}`);
            }
        }

        const data = await response.json();
        console.log('[DEBUG] Dados recebidos:', data);
        
        if (!data.choices || data.choices.length === 0) {
            console.error('[DEBUG] Estrutura de resposta inválida');
            return formatarResposta("Desculpe, não consegui gerar uma resposta. Tente novamente.");
        }

        const conteudoResposta = data.choices[0]?.message?.content;
        
        if (!conteudoResposta) {
            console.error('[DEBUG] Resposta vazia');
            return formatarResposta("Desculpe, a resposta veio vazia. Tente novamente.");
        }

        console.log('[DEBUG] Resposta da API obtida com sucesso!');
        return formatarResposta(conteudoResposta);

    } catch (erro) {
        console.error('[DEBUG] Erro ao chamar API diretamente:', erro);
        return formatarResposta("❌ Erro na API Groq: " + erro.message + ". Tente novamente.");
    }
}

// ===== LOAD EVENT LISTENER =====
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('dora_announced_v1.4')) {
        mostrarAnuncio();
        localStorage.setItem('dora_announced_v1.4', '1');
    }

    const textarea = document.getElementById('input-mensagem');
    if (textarea) {
        ajustarAlturaTextarea(textarea);
        textarea.addEventListener('input', (e) => {
            ajustarAlturaTextarea(e.target);
            atualizarBotaoAudioEnviar();
        });
     
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarMensagem();
            }
        });
    }
    // estado inicial do botão enviar
    atualizarBotaoAudioEnviar();

    // Carregamento dos dados
    fetch('training.json').then(r => r.json()).then(d => treinamentos = d).catch(e => console.log(e));
    
    // NOVO: Carregar o banco de imagens do arquivo JSON externo
    fetch('imagem.json')
        .then(r => r.json())
        .then(d => {
            bancoImagens = d; // Atribui os dados do JSON à variável global.
            console.log("Banco de Imagens carregado com sucesso.");
        })
        .catch(e => console.error("Erro ao carregar imagem.json:", e));

    // Conectar o toast (informativo) e ajustar o comportamento do botão enviar
    const voiceToast = document.getElementById('voice-toast');
    function showVoiceToast(msg, ms = 4000) {
        if (!voiceToast) return;
        voiceToast.textContent = msg;
        voiceToast.classList.add('show');
        if (ms > 0) setTimeout(() => voiceToast.classList.remove('show'), ms);
    }
    // não mostrar instrução automática no toast por padrão

    // botão enviar: se textarea vazio => ativa Live fullscreen; caso contrário envia texto
    const btnSend = document.getElementById('btn-send');
    function atualizarVisualBotaoSend() {
        const ta = document.getElementById('input-mensagem');
        if (!btnSend || !ta) return;
        if (ta.value.trim().length === 0) {
            btnSend.innerHTML = '<span class="material-symbols-rounded">graphic_eq</span>';
            btnSend.title = 'Ativar Lhama Live (voz)';
        } else {
            btnSend.innerHTML = '<span class="material-symbols-rounded">arrow_upward</span>';
            btnSend.title = 'Enviar mensagem';
        }
    }

    const ta = document.getElementById('input-mensagem');
    if (ta) ta.addEventListener('input', atualizarVisualBotaoSend);
    atualizarVisualBotaoSend();

    if (btnSend) {
        btnSend.addEventListener('click', async (e) => {
            const ta = document.getElementById('input-mensagem');
            if (ta && ta.value.trim().length > 0) {
                enviarMensagem();
                return;
            }

            // Se vazio: ativar Live em tela cheia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                showVoiceToast('Microfone não suportado neste navegador', 3000);
                return;
            }

            try {
                showVoiceToast('Solicitando acesso ao microfone...', 2000);
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(t => t.stop());
                // abrir modal full-screen e iniciar sessão de reconhecimento contínuo
                showLiveModal();
                startLiveSession();
            } catch (err) {
                console.warn('Permissão de microfone negada ou erro:', err);
                showVoiceToast('Permissão de microfone negada', 3000);
            }
        });
    }

    // tenta detectar e fixar uma voz pt-BR preferida (padrão clássico). Alguns navegadores só retornam vozes após onvoiceschanged
    function pickPreferredVoice() {
        const synth = window.speechSynthesis;
        const voices = synth.getVoices ? synth.getVoices() : [];
        if (!voices || voices.length === 0) return;
        // preferir explicitamente a voz eSpeak PT-BR se disponível
        const exact = voices.find(v => (v.name||'').toLowerCase() === 'espeak portuguese (brazil)');
        if (exact) { window.__preferredVoiceName = exact.name; console.log('Preferred voice set to exact match', exact.name); return; }
        const preferenciaNomes = ['google português do brasil','português do brasil','pt-br','luciana','daniel','joão','joao','maria','brasil'];
        for (const pref of preferenciaNomes) {
            const found = voices.find(v => (v.name||'').toLowerCase().includes(pref) || (v.lang||'').toLowerCase().includes(pref));
            if (found) { window.__preferredVoiceName = found.name; console.log('Preferred voice set to', found.name); return; }
        }
        // fallback: primeira voz pt encontrada
        const pt = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('pt'));
        if (pt) { window.__preferredVoiceName = pt.name; console.log('Preferred voice fallback to', pt.name); }
    }
    if (window.speechSynthesis) {
        pickPreferredVoice();
        window.speechSynthesis.onvoiceschanged = pickPreferredVoice;
    }
    
    // ===== SISTEMA DE PERSONALIDADES =====
    // Carregar personalidade salva
    carregarPersonalidadeSalva();
    
    // Adicionar event listeners para personalidade
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('personalidade-dropdown');
        const btn = document.querySelector('[onclick="togglePersonalidadeMenu()"]');
        
        if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
});

// ===== FUNÇÕES DE PERSONALIDADE =====
function togglePersonalidadeMenu() {
    const dropdown = document.getElementById('personalidade-dropdown');
    
    if (!dropdown) {
        console.error('[PERSONALIDADE] Dropdown não encontrado');
        return;
    }
    
    console.log('[PERSONALIDADE] Toggle dropdown, estado atual:', dropdown.classList.contains('hidden'));
    
    if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden');
        dropdown.classList.add('personalidade-dropdown');
        atualizarPersonalidadeSelecionada();
        console.log('[PERSONALIDADE] Dropdown aberto');
    } else {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('personalidade-dropdown');
        console.log('[PERSONALIDADE] Dropdown fechado');
    }
}

function selecionarPersonalidade(personalidade) {
    personalidadeAtual = personalidade;
    
    // Atualizar botão principal
    const btn = document.querySelector('[onclick="togglePersonalidadeMenu()"]');
    const config = configuracoesPersonalidade[personalidade];
    if (btn && config) {
        btn.innerHTML = `
            <span class="material-icons-round">${config.icone}</span>
            Personalidade
        `;
    }
    
    // Fechar dropdown
    const dropdown = document.getElementById('personalidade-dropdown');
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
    
    // Salvar no localStorage
    localStorage.setItem('personalidadeSelecionada', personalidade);
    
    // Adicionar mensagem de confirmação
    const mensagemConfirmacao = `Personalidade alterada para **${personalidade}**! Agora vou responder como uma IA ${personalidade.toLowerCase()}.`;
    adicionarMensagem(mensagemConfirmacao, 'bot');
    
    console.log('[PERSONALIDADE] Alterada para:', personalidade);
}

function atualizarPersonalidadeSelecionada() {
    // Remover classe active de todos os itens
    const itens = document.querySelectorAll('.personalidade-item');
    itens.forEach(item => item.classList.remove('active'));
    
    // Adicionar classe active ao item selecionado
    const itemSelecionado = document.querySelector(`[data-personalidade="${personalidadeAtual}"]`);
    if (itemSelecionado) {
        itemSelecionado.classList.add('active');
    }
}

function carregarPersonalidadeSalva() {
    const personalidadeSalva = localStorage.getItem('personalidadeSelecionada');
    if (personalidadeSalva && configuracoesPersonalidade[personalidadeSalva]) {
        personalidadeAtual = personalidadeSalva;
        const config = configuracoesPersonalidade[personalidadeSalva];
        const btn = document.querySelector('[onclick="togglePersonalidadeMenu()"]');
        if (btn && config) {
            btn.innerHTML = `
                <span class="material-icons-round">${config.icone}</span>
                Personalidade
            `;
        }
    }
}

// Modificar função gerarResposta para incluir personalidade
const gerarRespostaOriginal = gerarResposta;
gerarResposta = function(mensagemUsuario, historicoConversa = []) {
    // Adicionar prompt de personalidade
    const promptPersonalidade = configuracoesPersonalidade[personalidadeAtual]?.prompt || '';
    const systemMessage = promptPersonalidade ? 
        `Você é a Lhama AI 1. ${promptPersonalidade} Responda em português brasileiro de forma completa e detalhada.` :
        `Você é a Lhama AI 1, uma assistente EXTREMAMENTE INTELIGENTE, criativa e MUITO ÚTIL. Responda em português brasileiro de forma completa e detalhada.`;

    // Modificar a chamada da API para incluir o system message
    const chamadaOriginal = gerarRespostaOriginal;
    return new Promise((resolve) => {
        // Substituir o system message na chamada
        fetch('/api/lhama-groq-api-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: systemMessage
                    },
                    ...historicoConversa.map(msg => ({
                        role: msg.tipo === 'usuario' ? 'user' : 'assistant',
                        content: msg.texto
                    })),
                    {
                        role: 'user',
                        content: mensagemUsuario
                    }
                ],
                temperature: 0.7,
                max_tokens: 8192,
                top_p: 1,
                stream: false
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.choices && data.choices.length > 0) {
                resolve(data.choices[0].message.content);
            } else {
                resolve("Desculpe, não consegui gerar uma resposta. Tente novamente.");
            }
        })
        .catch(error => {
            console.error('[PERSONALIDADE] Erro:', error);
            resolve("Desculpe, estou com dificuldades para responder no momento. Tente novamente em alguns instantes.");
        });
    });
};

// Exportar funções de personalidade
window.togglePersonalidadeMenu = togglePersonalidadeMenu;
window.selecionarPersonalidade = selecionarPersonalidade;