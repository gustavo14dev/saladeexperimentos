// URL da API - usar localhost para desenvolvimento, Vercel em produção
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api/ai-detect'
    : 'https://saladeexperimentos.vercel.app/api/ai-detect';

const inputText = document.getElementById('inputText');
const analyzeBtn = document.getElementById('analyzeBtn');
const humanizeBtn = document.getElementById('humanizeBtn');
const charCount = document.getElementById('charCount');
const resultContainer = document.getElementById('resultContainer');
const loadingContainer = document.getElementById('loadingContainer');
const emptyContainer = document.getElementById('emptyContainer');

console.log('[ZeroIA] API URL:', API_URL);

// Atualizar contagem de caracteres
inputText.addEventListener('input', () => {
    charCount.textContent = inputText.value.length;
    // se usuário editar após análise, esconder o botão humanizar
    if (inputText.value.trim().length > 0) {
        humanizeBtn.classList.add('hidden');
    }
});

// Analisar texto ao clicar no botão
analyzeBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    
    if (!text) {
        alert('Por favor, cole um texto para analisar');
        return;
    }

    // Mostrar loading
    emptyContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    loadingContainer.classList.remove('hidden');
    analyzeBtn.disabled = true;
    analyzeBtn.style.opacity = '0.6';

    try {
        console.log('[ZeroIA] Enviando requisição...');
        
        // Fazer requisição à API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        console.log('[ZeroIA] Status da resposta:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[ZeroIA] Erro da API:', errorData);
            throw new Error(errorData.error || `Erro ao analisar texto (${response.status})`);
        }

        const data = await response.json();
        console.log('[ZeroIA] Dados recebidos:', data);
        
        // Exibir resultado
        displayResults(data);

        // ativar botão humanizar
        humanizeBtn.classList.remove('hidden');

    } catch (error) {
        console.error('[ZeroIA] Erro:', error);
        alert('❌ Erro ao analisar o texto:\n\n' + error.message);
    } finally {
        // Esconder loading
        loadingContainer.classList.add('hidden');
        analyzeBtn.disabled = false;
        analyzeBtn.style.opacity = '1';
    }
});

function displayResults(data) {
    const percentage = data.percentage || 0;
    const suspiciousPhrases = data.suspicious_phrases || [];
    const characteristics = data.characteristics || [];

    // Atualizar porcentagem
    document.getElementById('percentageText').textContent = `${Math.round(percentage)}%`;
    document.getElementById('aiPercentage').textContent = `${Math.round(percentage)}%`;
    document.getElementById('humanPercentage').textContent = `${Math.round(100 - percentage)}%`;

    // Atualizar círculo de progresso
    const progressCircle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;

    // Cores baseado na porcentagem
    let verdictClass = 'verdict-human';
    let verdictText = '✓ Texto provavelmente HUMANO';
    
    if (percentage >= 75) {
        verdictClass = 'verdict-ai-high';
        verdictText = '⚠️ Texto MUITO PROVÁVEL ser de IA';
    } else if (percentage >= 50) {
        verdictClass = 'verdict-ai-medium';
        verdictText = '⚠️ Texto POSSIVELMENTE de IA';
    } else if (percentage >= 25) {
        verdictClass = 'verdict-ai-low';
        verdictText = '🤔 Traços de IA detectados';
    }

    const verdictEl = document.getElementById('verdict');
    verdictEl.className = `verdict ${verdictClass}`;
    verdictEl.textContent = verdictText;

    // Exibir trechos suspeitos
    let detailsHTML = '';
    
    if (suspiciousPhrases && suspiciousPhrases.length > 0) {
        detailsHTML += '<div class="suspicious-section">';
        detailsHTML += '<h3 🚨 Trechos Suspeitos</h3>';
        detailsHTML += '<div class="phrases-list">';
        suspiciousPhrases.slice(0, 5).forEach(phrase => {
            detailsHTML += `<div class="phrase-item">"${phrase}"</div>`;
        });
        detailsHTML += '</div>';
        detailsHTML += '</div>';
    }

    // Exibir características
    if (characteristics && characteristics.length > 0) {
        detailsHTML += '<div class="characteristics-section">';
        detailsHTML += '<h3>📊 Características Detectadas</h3>';
        detailsHTML += '<div class="characteristics-list">';
        characteristics.slice(0, 4).forEach(char => {
            detailsHTML += `<div class="characteristic-item">
                <strong>${char.trait}</strong>
                <p>${char.evidence}</p>
            </div>`;
        });
        detailsHTML += '</div>';
        detailsHTML += '</div>';
    }

    document.getElementById('analysisDetails').innerHTML = detailsHTML;

    // Mostrar resultado
    resultContainer.classList.remove('hidden');
}

// Humanizar botão
humanizeBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) return;

    humanizeBtn.disabled = true;
    humanizeBtn.textContent = 'Humanizando...';

    try {
        const resp = await fetch(window.location.hostname === 'localhost' ?
            'http://localhost:3000/api/humanize' :
            'https://saladeexperimentos.vercel.app/api/humanize', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ text })
        });
        const data = await resp.json();
        if (!resp.ok) {
            console.error('[ZeroIA] erro humanize', data);
            alert('Erro ao humanizar: ' + (data.error || resp.status));
            return;
        }

        // substituir texto e reanalisar
        inputText.value = data.humanized || '';
        charCount.textContent = inputText.value.length;
        humanizeBtn.textContent = 'Humanizar Texto';
        humanizeBtn.disabled = false;

        analyzeBtn.click();
    } catch (err) {
        console.error('[ZeroIA] falha humanizar', err);
        alert('Falha na humanização');
        humanizeBtn.textContent = 'Humanizar Texto';
        humanizeBtn.disabled = false;
    }
});

// Permitir análise com Ctrl+Enter / Cmd+Enter
inputText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        analyzeBtn.click();
    }
});
