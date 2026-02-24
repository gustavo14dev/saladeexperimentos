let treinamentos = [];
let historicoConversa = [];
let bancoImagens = {}; // Inicializada como objeto vazio para ser carregada via fetch.

// ===== SISTEMA DE IMAGENS =====
let modoImagemAtivo = false;
let imagensAtuais = [];
let paginaAtual = 1;
let termoBuscaAtual = '';
// ===== SISTEMA DE BUSCA WEB =====
let modoBuscaWebAtivo = false;

// ===== SISTEMA DE PERSONALIDADES =====
let personalidadeAtual = 'Normal';

const configuracoesPersonalidade = {
    'Normal': {
        icone: 'person',
        prompt: 'Você é a Lumi AI 1.2. Seja uma assistente equilibrada, prestativa e amigável. Responda de forma clara, direta e útil. Use tom neutro e profissional.'
    },
    'Divertida': {
        icone: 'mood',
        prompt: 'Seja uma assistente EXTREMAMENTE engraçada, animada e cheia de energia! Use muitas piadas, emojis 😄, gírias e tom descontraído. Seja sempre positiva e divertida! Use exclamações!!! e linguagem informal.'
    },
    'Criativa': {
        icone: 'lightbulb',
        prompt: 'Seja uma assistente CRIATIVA e inovadora! Use metáforas, ideias originais, pense fora da caixa. Seja inspiradora, use linguagem poética e imaginativa. Crie soluções únicas e criativas!'
    },
    'Analítica': {
        icone: 'analytics',
        prompt: 'Seja uma assistente 100% analítica e lógica! Foque em dados, fatos, estatísticas e raciocínio estruturado. Seja precisa, objetiva, use números e análises detalhadas. Evite emoções, seja puramente racional.'
    },
    'Motivadora': {
        icone: 'emoji_events',
        prompt: 'Seja uma assistente SUPER motivadora! Use palavras de encorajamento, pensamento positivo, frases inspiradoras. Seja como um coach! Incentive, motive e levante o ânimo sempre! Use energia contagiante!'
    },
    'Acadêmica': {
        icone: 'school',
        prompt: 'Seja uma assistente FORMAL e acadêmica! Use linguagem culta, termos técnicos, explique conceitos com profundidade. Cite fontes, referências, seja como um professor universitário. Use tom erudito e educativo.'
    },
    'Dramática': {
        icone: 'theater_comedy',
        prompt: 'Seja uma assistente DRAMÁTICA e teatral! Use linguagem exagerada, dramática, exclamações intensas! Seja como uma atriz de teatro! Use expressões fortes, emoções intensas, seja ESPECTACULAR!!!'
    },
    'Curiosa': {
        icone: 'psychology_alt',
        prompt: 'Seja uma assistente EXTREMAMENTE curiosa! Faça muitas perguntas, explore diferentes ângulos, mostre interesse genuíno em aprender. Questione tudo, investigue, seja como uma detetive curiosa!'
    },
    'Minimalista': {
        icone: 'minimize',
        prompt: 'Seja uma assistente MINIMALISTA e direta! Use frases curtas, vá direto ao ponto. Sem rodeios, sem excessos. Respostas concisas e objetivas. Máximo de informação com mínimo de palavras.'
    },
    'Zen': {
        icone: 'self_improvement',
        prompt: 'Seja uma assistente ZEN e tranquila! Use linguagem calma, meditativa. Fale com sabedoria interior, mantenha a paz mental. Use metáforas de natureza, seja serena e equilibrada. Respira fundo.'
    },
    'Pirata': {
        icone: 'sailing',
        prompt: 'Seja um PIRATA autêntico! Use linguagem de marujos, gírias piratas! Fale sobre tesouros, aventuras, mares, tempestades! Use "Ahoy!", "meu caro!", expressões marinheiras. Seja ousado, aventureiro e um pouco selvagem!'
    },
    'Redatora': {
        icone: 'edit_note',
        prompt: 'Seja uma REDATORA profissional! Use linguagem eloquente, persuasiva e bem estruturada. Escreva com clareza e elegância. Use修辞, argumentos convincentes, seja como uma jornalista expert.'
    },
    'Executiva': {
        icone: 'business_center',
        prompt: 'Seja uma EXECUTIVA profissional! Seja direta, eficiente, focada em resultados. Use linguagem de negócios, termos corporativos. Seja decisiva, estratégica e orientada para objetivos.'
    },
    'Empática': {
        icone: 'favorite',
        prompt: 'Seja uma assistente EXTREMAMENTE empática! Demonstre compreensão profunda, ouça com atenção, ofereça apoio emocional. Valide sentimentos, seja acolhedora, gentil e compreensiva. Use linguagem calorosa.'
    }
};

// Debug: Verificar se a personalidade está sendo aplicada
console.log('[CONVERSA] Personalidade atual:', personalidadeAtual);
console.log('[CONVERSA] Prompt da personalidade:', configuracoesPersonalidade[personalidadeAtual].prompt);

// Modos de funcionalidade
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


// ===== FUNÇÕES DE IMAGENS =====

async function buscarEMostrarImagens(termoBusca) {
    console.log('[IMAGENS] Buscando imagens para:', termoBusca);
    termoBuscaAtual = termoBusca;
    paginaAtual = 1;
    imagensAtuais = [];
    
    try {
        // Buscar primeira página de imagens (30 imagens)
        const response = await fetch(`/api/pixels-proxy?query=${encodeURIComponent(termoBusca)}&per_page=30&page=1`);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        imagensAtuais = data.photos || [];
        
        console.log('[IMAGENS] Encontradas:', imagensAtuais.length, 'imagens');
        
        // Gerar HTML das imagens
        return gerarHTMLImagens();
        
    } catch (erro) {
        console.error('[IMAGENS] Erro ao buscar imagens:', erro);
        return `❌ Não consegui buscar imagens para "${termoBusca}". Tente novamente.`;
    }
}

function gerarHTMLImagens() {
    if (imagensAtuais.length === 0) {
        return `📸 Não encontrei imagens para "${termoBuscaAtual}". Tente outro termo.`;
    }
    
    let html = `
        <div class="imagens-resposta-container">
            <div class="imagens-header">
                <span class="imagens-titulo">📸 ${imagensAtuais.length} imagens encontradas para "${termoBuscaAtual}"</span>
                <button class="btn-mostrar-mais" onclick="mostrarMaisImagens()" id="btn-mostrar-mais">
                    <span class="material-icons-round">add_circle</span>
                    Mostrar mais 10
                </button>
            </div>
            <div class="imagens-grid" id="imagens-grid">
    `;
    
    // Adicionar as 30 primeiras imagens
    imagensAtuais.slice(0, 30).forEach((imagem, index) => {
        html += `
            <div class="imagem-card" data-index="${index}">
                <img src="${imagem.src.large}" alt="${imagem.alt}" loading="lazy" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlbSBubyBkaXNwb25pdmVsPC90ZXh0Pjwvc3ZnPg=='" />
                <div class="imagem-overlay">
                    <div class="imagem-acoes">
                        <button class="btn-acao" onclick="baixarImagem('${imagem.src.large}')" title="Baixar">
                            <span class="material-icons-round">download</span>
                        </button>
                        <button class="btn-acao" onclick="copiarTexto('${imagem.src.large}')" title="Copiar URL">
                            <span class="material-icons-round">content_copy</span>
                        </button>
                        <button class="btn-acao" onclick="abrirImagemNovaJanela('${imagem.src.large}')" title="Abrir em nova janela">
                            <span class="material-icons-round">open_in_new</span>
                        </button>
                    </div>
                </div>
                <div class="imagem-info">
                    <span class="imagem-fotografo">📷 ${imagem.photographer}</span>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <style>
        .imagens-resposta-container {
            margin: 16px 0;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .imagens-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .imagens-titulo {
            font-weight: 600;
            color: #fff;
            font-size: 14px;
        }
        
        .btn-mostrar-mais {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            transition: all 0.3s ease;
        }
        
        .btn-mostrar-mais:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .imagens-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
        }
        
        .imagem-card {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            background: rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        .imagem-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
        }
        
        .imagem-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
        }
        
        .imagem-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: flex-end;
            padding: 8px;
        }
        
        .imagem-card:hover .imagem-overlay {
            opacity: 1;
        }
        
        .imagem-acoes {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
        }
        
        .btn-acao {
            background: rgba(255, 255, 255, 0.9);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .btn-acao:hover {
            background: white;
            transform: scale(1.1);
        }
        
        .btn-acao .material-icons-round {
            font-size: 16px;
            color: #333;
        }
        
        .imagem-info {
            padding: 8px;
            background: rgba(0, 0, 0, 0.3);
        }
        
        .imagem-fotografo {
            font-size: 11px;
            color: #ccc;
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        @media (max-width: 768px) {
            .imagens-grid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 8px;
            }
            
            .imagem-card img {
                height: 120px;
            }
        }
        </style>
    `;
    
    return html;
}

async function mostrarMaisImagens() {
    const btn = document.getElementById('btn-mostrar-mais');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons-round">hourglass_empty</span> Carregando...';
    }
    
    try {
        paginaAtual++;
        
        const response = await fetch(`/api/pixels-proxy?query=${encodeURIComponent(termoBuscaAtual)}&per_page=10&page=${paginaAtual}`);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        const novasImagens = data.photos || [];
        
        if (novasImagens.length === 0) {
            if (btn) {
                btn.innerHTML = '<span class="material-icons-round">check_circle</span> Fim dos resultados';
                btn.disabled = true;
            }
            return;
        }
        
        imagensAtuais.push(...novasImagens);
        
        const grid = document.getElementById('imagens-grid');
        if (grid) {
            novasImagens.forEach((imagem, index) => {
                const globalIndex = imagensAtuais.length - novasImagens.length + index;
                const cardHTML = `
                    <div class="imagem-card" data-index="${globalIndex}">
                        <img src="${imagem.src.large}" alt="${imagem.alt}" loading="lazy" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlbSBubyBkaXNwb25pdmVsPC90ZXh0Pjwvc3ZnPg=='" />
                        <div class="imagem-overlay">
                            <div class="imagem-acoes">
                                <button class="btn-acao" onclick="baixarImagem('${imagem.src.large}')" title="Baixar">
                                    <span class="material-icons-round">download</span>
                                </button>
                                <button class="btn-acao" onclick="copiarTexto('${imagem.src.large}')" title="Copiar URL">
                                    <span class="material-icons-round">content_copy</span>
                                </button>
                                <button class="btn-acao" onclick="abrirImagemNovaJanela('${imagem.src.large}')" title="Abrir em nova janela">
                                    <span class="material-icons-round">open_in_new</span>
                                </button>
                            </div>
                        </div>
                        <div class="imagem-info">
                            <span class="imagem-fotografo">📷 ${imagem.photographer}</span>
                        </div>
                    </div>
                `;
                grid.insertAdjacentHTML('beforeend', cardHTML);
            });
        }
        
        if (btn) {
            btn.innerHTML = '<span class="material-icons-round">add_circle</span> Mostrar mais 10';
            btn.disabled = false;
        }
    } catch (erro) {
        console.error('[IMAGENS] Erro ao carregar mais imagens:', erro);
        if (btn) {
            btn.innerHTML = '<span class="material-icons-round">error</span> Erro ao carregar';
            btn.disabled = false;
        }
    }
}

function toggleModoImagem() {
    modoImagemAtivo = !modoImagemAtivo;
    
    const btn = document.getElementById('btn-modo-imagem');
    const input = document.getElementById('input-mensagem');
    
    if (modoImagemAtivo) {
        // Ativar modo imagem
        if (btn) {
            btn.classList.add('ativo');
        }
        if (input) {
            input.placeholder = '📸 Descreva as imagens que quer buscar com a Lumi...';
        }
        console.log('[IMAGENS] Modo imagem ATIVADO');
    } else {
        // Desativar modo imagem
        if (btn) {
            btn.classList.remove('ativo');
        }
        if (input) {
            input.placeholder = 'Converse com a Lumi AI...';
        }
        console.log('[IMAGENS] Modo imagem DESATIVADO');
    }
}

// ===== FUNÇÕES DE BUSCA WEB =====

function toggleModoBuscaWeb() {
    modoBuscaWebAtivo = !modoBuscaWebAtivo;
    
    const btn = document.getElementById('btn-modo-busca-web');
    const input = document.getElementById('input-mensagem');
    
    if (modoBuscaWebAtivo) {
        // Ativar modo busca web
        if (btn) {
            btn.classList.add('ativo');
        }
        if (input) {
            input.placeholder = '🔍 O que você quer pesquisar na web?';
        }
        console.log('[BUSCA WEB] Modo busca web ATIVADO');
    } else {
        // Desativar modo busca web
        if (btn) {
            btn.classList.remove('ativo');
        }
        if (input) {
            input.placeholder = 'Converse com a Lumi AI...';
        }
        console.log('[BUSCA WEB] Modo busca web DESATIVADO');
    }
}

async function buscarNaWeb(query) {
    try {
        const response = await fetch('/api/lhama-groq-api-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mode: 'tavily_search',
                query: query,
                search_depth: 'basic',
                include_answer: true,
                include_raw_content: false,
                max_results: 5
            })
        });

        if (!response.ok) {
            const contentType = response.headers.get('content-type') || '';
            const raw = await response.text();
            let message = `Erro na busca web (HTTP ${response.status})`;

            if (contentType.includes('application/json')) {
                try {
                    const errorData = JSON.parse(raw);
                    message = errorData.error || message;
                } catch (e) {
                    message = raw || message;
                }
            } else if (raw && raw.toLowerCase().includes('not found')) {
                message = 'Endpoint /api/lhama-groq-api-proxy não encontrado (404). Verifique o deploy/configuração na Vercel.';
            }

            throw new Error(message);
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const raw = await response.text();
            throw new Error('Resposta inválida do servidor (não-JSON). ' + (raw ? raw.slice(0, 120) : ''));
        }

        const data = await response.json();
        console.log('[BUSCA WEB] Resultados:', data);

        // Buscar imagens relacionadas do Pexels (se disponível)
        let imagens = [];
        try {
            if (typeof buscarImagensPexels === 'function') {
                imagens = await buscarImagensPexels(query, 3);
            }
        } catch (e) {
            imagens = [];
        }

        if (data.answer) {
            let resultado = data.answer;

            if (imagens.length > 0) {
                const paragrafos = String(resultado).split('\n\n');
                let resultadoComImagens = '';

                paragrafos.forEach((paragrafo, index) => {
                    resultadoComImagens += paragrafo;
                    if (index === 0 && imagens[0]) {
                        resultadoComImagens += '\n\n' + criarImagemHTML(imagens[0]) + '\n\n';
                    } else if (index === Math.floor(paragrafos.length / 2) && imagens[1]) {
                        resultadoComImagens += '\n\n' + criarImagemHTML(imagens[1]) + '\n\n';
                    }
                });

                if (imagens[2]) {
                    resultadoComImagens += '\n\n' + criarImagemHTML(imagens[2]);
                }

                resultado = resultadoComImagens;
            }

            if (Array.isArray(data.results) && data.results.length > 0) {
                resultado += `\n\n---\n\n**📚 Fontes utilizadas:**\n${data.results.map((result, index) => `${index + 1}. [${result.title}](${result.url})`).join('\n')}`;
            }

            return resultado;
        }

        return `🔍 Não encontrei resultados específicos para "${query}". Tente com outros termos.`;
    } catch (error) {
        console.error('[BUSCA WEB] Erro:', error);
        return `❌ Erro ao buscar na web: ${error.message}`;
    }
}

function criarImagemHTML(imagem) {
    if (!imagem || !imagem.src) return '';
    return `
<div class="imagem-busca-web" style="margin: 15px 0; text-align: center;">
    <img src="${imagem.src.medium || imagem.src.small || imagem.src.large}" alt="${imagem.alt || ''}" style="
        width: 160px;
        height: 110px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.15);
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid #e5e7eb;
    " onclick="window.open('${imagem.src.large || imagem.src.original || imagem.src.medium}', '_blank')"
    onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.25)'"
    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 3px 10px rgba(0,0,0,0.15)'"
    />
    <div style="font-size: 10px; color: #6b7280; margin-top: 6px; font-style: italic;">📷 ${(imagem.photographer || '').toString()}</div>
</div>`;
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
        // Verificar se é uma resposta de imagens (contém o container de imagens)
        if (texto.includes('imagens-resposta-container')) {
            // Adicionar HTML de imagens diretamente
            divContent.innerHTML = texto;
            divMensagem.appendChild(divContent);
            chatBox.appendChild(divMensagem);
            
            // Adicionar botões de ação para a resposta de imagens
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions-container';
            
            const btnCopy = document.createElement('button');
            btnCopy.className = 'action-icon-btn';
            btnCopy.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">content_copy</span> <span>Copiar resultado</span>';
            btnCopy.onclick = () => {
                const textoLimpo = texto.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                navigator.clipboard.writeText(textoLimpo);
            };
            actionsContainer.appendChild(btnCopy);
            
            const btnAudio = document.createElement('button');
            btnAudio.className = 'action-icon-btn audio-btn';
            btnAudio.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">volume_up</span> <span>Ouvir</span>';
            btnAudio.onclick = () => {
                const textoLimpo = texto.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                lerTextoEmVoz(textoLimpo);
            };
            actionsContainer.appendChild(btnAudio);
            
            divMensagem.appendChild(actionsContainer);
            
        } else if (texto.includes('imagem-gerada-container')) {
            // Adicionar mensagem de imagem gerada diretamente sem animação
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
                    setTimeout(escreverLetra, 0 + Math.random() * 1); // Ultra rápido: 0-1ms
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
            div.innerHTML = '<div class="message-content">Lumi AI está pensando...</div>';
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

// ===== FUNÇÃO PRINCIPAL DE ENVIO DE MENSAGEM =====
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

    // Verificar se está em modo imagem
    if (modoImagemAtivo) {
        // Buscar imagens e mostrar na resposta
        buscarEMostrarImagens(mensagem).then(respostaImagens => {
            adicionarMensagem(respostaImagens, 'bot');
            
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
            console.error('[ERRO] Falha ao buscar imagens:', erro);
            adicionarMensagem('Desculpe, não consegui buscar as imagens. Tente novamente.', 'bot');
            
            // Reabilitar botão
            if (btnEnviar) {
                btnEnviar.disabled = false;
                btnEnviar.innerHTML = '<span class="material-icons-round text-base">arrow_upward</span>';
            }
        });
    } else if (modoBuscaWebAtivo) {
        // Buscar na web e depois gerar resposta com base nos resultados
        buscarNaWeb(mensagem).then(resultadosBusca => {
            // Gerar resposta da IA usando os resultados da busca
            const promptComBusca = `Com base nos seguintes resultados de busca na web sobre "${mensagem}":\n\n${resultadosBusca}\n\nPor favor, analise essas informações e gere uma resposta completa, detalhada e útil em português brasileiro. Use formatação markdown com negrito, listas e estrutura clara.`;
            
            gerarResposta(promptComBusca, historicoConversa).then(resposta => {
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
                console.error('[ERRO] Falha ao gerar resposta com busca:', erro);
                adicionarMensagem('Desculpe, não consegui processar os resultados da busca. Tente novamente.', 'bot');
                
                // Reabilitar botão
                if (btnEnviar) {
                    btnEnviar.disabled = false;
                    btnEnviar.innerHTML = '<span class="material-icons-round text-base">arrow_upward</span>';
                }
            });
        }).catch(erro => {
            console.error('[ERRO] Falha ao buscar na web:', erro);
            adicionarMensagem('Desculpe, não consegui buscar na web. Tente novamente.', 'bot');
            
            // Reabilitar botão
            if (btnEnviar) {
                btnEnviar.disabled = false;
                btnEnviar.innerHTML = '<span class="material-icons-round text-base">arrow_upward</span>';
            }
        });
    } else {
        // Gerar resposta normal da IA
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
}

// ===== INICIALIZAÇÃO E RESETS =====

function iniciarNovaConversa() {
    historicoConversa = [];
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = `
        <div class="mensagem bot boas-vindas-inicial">
            <div class="message-content">Olá!
Sou a Lumi AI. Como posso te ajudar hoje? ✨</div>
        </div>
    `;
    const input = document.getElementById('input-mensagem');
    input.value = '';
    input.placeholder = "Converse com a Lumi AI...";
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
    console.log('[DEBUG] Personalidade atual:', personalidadeAtual);
    console.log('[DEBUG] Prompt da personalidade:', configuracoesPersonalidade[personalidadeAtual]?.prompt);
    
    try {
        // Adicionar prompt de personalidade ao system message
        const configPersonalidade = configuracoesPersonalidade[personalidadeAtual];
        const promptPersonalidade = configPersonalidade ? configPersonalidade.prompt : '';
        
        // Construção robusta do System Message
        const systemMessage = `Você é a Lhama AI 1, uma inteligência artificial avançada.

MODO DE PERSONALIDADE ATUAL: ${personalidadeAtual.toUpperCase()}
DIRETRIZES: ${promptPersonalidade || 'Seja prestativa, educada e inteligente.'}

IMPORTANTE: Mantenha essa personalidade durante toda a resposta. Responda sempre em português brasileiro.`;

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
                        content: systemMessage
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
            btnSend.title = 'Ativar Lumi Live (voz)';
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
    console.log('[PERSONALIDADE] Selecionando:', personalidade);
    
    // Forçar atualização da variável global
    personalidadeAtual = personalidade;
    
    // Também salvar em localStorage imediatamente
    localStorage.setItem('personalidadeSelecionada', personalidade);
    
    console.log('[PERSONALIDADE] Variável atualizada para:', personalidadeAtual);
    console.log('[PERSONALIDADE] Prompt aplicado:', configuracoesPersonalidade[personalidadeAtual]?.prompt);
    
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
    
    // Adicionar mensagem de confirmação
    const mensagemConfirmacao = `Personalidade alterada para **${personalidade}**! Agora vou responder como uma IA ${personalidade.toLowerCase()}.`;
    adicionarMensagem(mensagemConfirmacao, 'bot');
    
    console.log('[PERSONALIDADE] Seleção concluída com sucesso!');
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

// Exportar funções de personalidade
window.togglePersonalidadeMenu = togglePersonalidadeMenu;
window.selecionarPersonalidade = selecionarPersonalidade;

// Exportar funções de imagem
window.toggleModoImagem = toggleModoImagem;
window.mostrarMaisImagens = mostrarMaisImagens;
window.abrirImagemNovaJanela = abrirImagemNovaJanela;

// Exportar funções de busca web
window.toggleModoBuscaWeb = toggleModoBuscaWeb;
window.buscarNaWeb = buscarNaWeb;
window.buscarImagensPexels = buscarImagensPexels;

// Exportar função principal de envio de mensagem
window.enviarMensagem = enviarMensagem;