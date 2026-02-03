let treinamentos = [];
let historicoConversa = [];
let bancoImagens = {}; // Inicializada como objeto vazio para ser carregada via fetch.

// Modos de funcionalidade
let modoImagemAtivo = false;

// Debug: Verificar se a API Groq está disponível
console.log('[CONVERSA] Inicializando conversa.js...');
console.log('[CONVERSA] Modo imagem:', modoImagemAtivo);

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

// ===== FUNÇÕES DE IMAGEM =====
function alternarModoImagem() {
    const btnImagem = document.getElementById('btn-imagem');
    const input = document.getElementById('input-mensagem');
    
    if (modoImagemAtivo) {
        modoImagemAtivo = false;
        if (btnImagem) btnImagem.classList.remove('active');
        input.placeholder = 'Olá! Pergunte-me qualquer coisa...';
    } else {
        modoImagemAtivo = true;
        if (btnImagem) btnImagem.classList.add('active');
        input.placeholder = 'Descreva a imagem que você quer gerar...';
        input.value = '';
        input.focus();
    }
}

function mostrarGerandoImagem() {
    const chatBox = document.getElementById('chat-box');
    const divMensagem = document.createElement('div');
    divMensagem.className = 'mensagem bot';
    divMensagem.id = 'gerando-imagem-msg';
    
    divMensagem.innerHTML = `
        <div class="message-content">
            <div class="gerando-imagem-card">
                <div class="gerando-imagem-icon">🎨</div>
                <div class="gerando-imagem-texto">Gerando Imagem<span class="pontos">...</span></div>
            </div>
        </div>
    `;
    
    chatBox.appendChild(divMensagem);
    
    // Animação dos pontos
    const pontos = divMensagem.querySelector('.pontos');
    let contador = 0;
    const animacao = setInterval(() => {
        contador = (contador + 1) % 4;
        pontos.textContent = '.'.repeat(contador || 1);
    }, 500);
    // Salvar referência da animação para parar depois
    divMensagem.animacaoInterval = animacao;
    
    // Scroll para a mensagem
    const container = document.getElementById('chat-box-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function removerGerandoImagem() {
    const msg = document.getElementById('gerando-imagem-msg');
    if (msg) {
        if (msg.animacaoInterval) {
async function gerarImagem(prompt) {
    console.log('[IMAGEM] Gerando imagem com Pollinations AI:', prompt);
    
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

// LOAD
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


/* ===== Lhama AI Live: hotword detection e sessão ao vivo (apenas áudio) ===== */
let hotwordRecognition = null;
let liveActive = false;
let liveRecognition = null;

function startHotwordListener() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    hotwordRecognition = new SR();
    hotwordRecognition.continuous = true;
    hotwordRecognition.interimResults = true;
    hotwordRecognition.lang = 'pt-BR';

    hotwordRecognition.onresult = (e) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) transcript += e.results[i][0].transcript + ' ';
        transcript = transcript.toLowerCase();
        if (transcript.includes('hey lhama') || transcript.includes('ok lhama') || transcript.includes('oi lhama')) {
            // Hotword detectada
            triggerLiveMode();
        }
    };
    hotwordRecognition.onerror = (err) => {
        console.error('hotwordRecognition error:', err);
        const vt = document.getElementById('voice-toast');
        if (vt) { vt.textContent = 'Erro no reconhecimento de hotword'; vt.classList.add('show'); setTimeout(() => vt.classList.remove('show'), 3000); }
    };
    hotwordRecognition.onstart = () => { console.log('hotwordRecognition started'); };
    hotwordRecognition.onend = () => { console.log('hotwordRecognition ended'); if (!liveActive) setTimeout(() => hotwordRecognition && hotwordRecognition.start(), 400); };
    hotwordRecognition.start();
}

function stopHotwordListener() {
    if (hotwordRecognition) {
        try { hotwordRecognition.stop(); } catch(e){}
        try { hotwordRecognition.abort && hotwordRecognition.abort(); } catch(e){}
        hotwordRecognition = null;
    }
}

/**
 * Verifica se o SpeechRecognition está funcional (tenta iniciar uma instância curta).
 * Retorna Promise<boolean>.
 */
function verifySpeechRecognitionAvailable(timeout = 1500) {
    return new Promise((resolve) => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return resolve(false);
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        let tester = null;
        let finished = false;
        try {
            tester = new SR();
            tester.continuous = false;
            tester.interimResults = false;
            tester.lang = 'pt-BR';
            tester.onstart = () => { if (!finished) { finished = true; try { tester.stop(); } catch(e){}; resolve(true); } };
            tester.onerror = (e) => { if (!finished) { finished = true; resolve(false); } };
            tester.onend = () => { if (!finished) { finished = true; resolve(true); } };
            try { tester.start(); } catch (e) { finished = true; resolve(false); }
        } catch (err) {
            resolve(false);
        }
        // safety timeout
        setTimeout(() => { if (!finished) { finished = true; try { tester && tester.stop(); } catch(e){}; resolve(false); } }, timeout);
    });
}

// handler do botão de teste rápido (adicionado ao carregar)
// handler do botão de teste removido (debug removed)

function triggerLiveMode() {
    if (liveActive) return;
    liveActive = true;
    showLiveModal();
    // fala inicial de ativação
    lerTextoEmVoz('Lhama Live ativada. O que você deseja?');
    // start live recognition for conversation (only while modal open)
    startLiveRecognition();
}

function showLiveModal() {
    const modal = document.getElementById('live-modal');
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
    const closeBtn = document.getElementById('live-close');
    if (closeBtn) closeBtn.onclick = stopLiveMode;
}

function hideLiveModal() {
    const modal = document.getElementById('live-modal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden','true');
}

function stopLiveMode() {
    liveActive = false;
    hideLiveModal();
    stopLiveRecognition();
    // parar sessão full-screen também
    stopLiveSession();
}

function startLiveRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    liveRecognition = new SR();
    liveRecognition.continuous = false; // single query then respond
    liveRecognition.interimResults = false;
    liveRecognition.lang = 'pt-BR';

    liveRecognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        // adicionar mensagem do usuário no chat
        try { adicionarMensagem(text, 'usuario'); } catch (err) { console.warn('erro ao adicionar msg usuario:', err); }
        // processa por trás e responde (texto) baseado no treinamento
        const resposta = gerarResposta(text);
        // adiciona resposta como mensagem de bot no chat
        try { adicionarMensagem(resposta, 'bot'); } catch (err) { console.warn('erro ao adicionar msg bot:', err); }
        // fala a resposta
        lerTextoEmVoz(resposta);
        // após falar, escuta novamente enquanto modal aberto
        const onEnd = () => {
            if (liveActive) {
                setTimeout(() => { try { liveRecognition.start(); } catch(e){} }, 300);
            }
            liveRecognition.onend = null;
        };
        liveRecognition.onend = onEnd;
    };

    liveRecognition.onerror = (err) => { /* ignore */ };
    liveRecognition.onend = () => { if (liveActive) { try { liveRecognition.start(); } catch(e){} } };
    try { liveRecognition.start(); } catch(e) { console.warn(e); }
}

// Sessão Live full-screen: reconhecimento contínuo, sem mostrar transcrição na UI modal
let liveSessionRecognition = null;
function startLiveSession() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showVoiceToast && showVoiceToast('Reconhecimento de voz não disponível neste navegador', 3000);
        return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    liveSessionRecognition = new SR();
    liveSessionRecognition.continuous = true;
    liveSessionRecognition.interimResults = false; // não mostrar parciais
    liveSessionRecognition.lang = 'pt-BR';

    liveSessionRecognition.onresult = (e) => {
        try {
            const text = e.results[e.resultIndex][0].transcript;
            // adicionar ao chat como mensagem do usuário (por trás)
            adicionarMensagem(text, 'usuario');
            // gerar resposta com base em training.json
            const resp = gerarResposta(text);
            adicionarMensagem(resp, 'bot');
            // falar a resposta: pausar reconhecimento enquanto fala para evitar 'picote' e reiniciar depois
            try { liveSessionRecognition && liveSessionRecognition.stop(); } catch(e){}
            const utter = lerTextoEmVoz(resp);
            if (utter) {
                utter.onend = () => { try { if (liveSessionRecognition) liveSessionRecognition.start(); } catch(e){} };
            } else {
                try { if (liveSessionRecognition) liveSessionRecognition.start(); } catch(e){}
            }
        } catch (err) { console.error('Erro no liveSession onresult:', err); }
    };

    liveSessionRecognition.onerror = (err) => { console.error('liveSessionRecognition error:', err); };
    liveSessionRecognition.onend = () => { console.log('liveSessionRecognition ended'); if (liveSessionRecognition) { try { liveSessionRecognition.start(); } catch(e){} } };
    try { liveSessionRecognition.start(); } catch(e) { console.warn('Erro ao iniciar liveSessionRecognition:', e); }
}

function stopLiveSession() {
    if (liveSessionRecognition) {
        try { liveSessionRecognition.stop(); } catch(e){}
        liveSessionRecognition = null;
    }
}

function stopLiveRecognition() {
    if (liveRecognition) {
        try { liveRecognition.stop(); } catch(e){}
        liveRecognition = null;
    }
}
    // Iniciar uma nova conversa ao carregar (se você quiser)
    // iniciarNovaConversa();
});