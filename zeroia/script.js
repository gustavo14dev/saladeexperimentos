// Configuração de endpoints (mantive compatibilidade com ambiente local)
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api/ai-detect'
    : 'https://saladeexperimentos.vercel.app/api/ai-detect';

// Elementos principais
const inputText = document.getElementById('inputText');

// armazena a última porcentagem que foi exibida (antes de humanizar)
let lastAnalyzedPercentage = null;

const analyzeBtn = document.getElementById('analyzeBtn');
const humanizeBtn = document.getElementById('humanizeBtn');
const charCount = document.getElementById('charCount');
const resultContainer = document.getElementById('resultContainer');
const loadingContainer = document.getElementById('loadingContainer');
const emptyContainer = document.getElementById('emptyContainer');
const progressCircle = document.getElementById('progressCircle');
const percentageText = document.getElementById('percentageText');
const aiPercentage = document.getElementById('aiPercentage');
const humanPercentage = document.getElementById('humanPercentage');
const verdictEl = document.getElementById('verdict');
const suggestionsEl = document.getElementById('suggestions');
const analysisDetails = document.getElementById('analysisDetails');
const clearBtn = document.getElementById('clearBtn');

// Inicialização
let circleRadius = 45;
const circumference = 2 * Math.PI * circleRadius;
if (progressCircle) {
    progressCircle.style.strokeDasharray = `${circumference}`;
    progressCircle.style.strokeDashoffset = `${circumference}`;
}

// Atualizar contagem de caracteres
inputText.addEventListener('input', () => {
    charCount.textContent = inputText.value.length;
    // esconder se estiver visível um resultado antigo
    if (resultContainer && !resultContainer.classList.contains('hidden')) {
        // mantém resultado até nova análise; se preferir limpar automaticamente, descomente:
        // resultContainer.classList.add('hidden');
    }
});

// Limpar texto
clearBtn?.addEventListener('click', () => {
    inputText.value = '';
    charCount.textContent = '0';
    resultContainer?.classList.add('hidden');
    emptyContainer?.classList.remove('hidden');
});


// Função para mostrar loading
function showLoading() {
    emptyContainer?.classList.add('hidden');
    resultContainer?.classList.add('hidden');
    loadingContainer?.classList.remove('hidden');
    analyzeBtn.disabled = true;
}

function hideLoading() {
    loadingContainer?.classList.add('hidden');
    analyzeBtn.disabled = false;
}

// função de análise que chama a API e retorna os dados
async function analyzeText(text) {
    const resp = await fetch(API_URL, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})});
    if (!resp.ok) {
        const err = await resp.json().catch(()=>({}));
        throw new Error(err.error || 'Erro na API');
    }
    return resp.json();
}

// Analisar texto (botão principal)
analyzeBtn.addEventListener('click', async () => {
    const txt = inputText.value.trim();
    if (!txt) return alert('Cole um texto para analisar');

    showLoading();
    try {
        const data = await analyzeText(txt);
        renderResult(data);
    } catch (err) {
        console.error(err);
        alert('Erro ao analisar: ' + (err.message || err));
    } finally {
        hideLoading();
    }
});

// Atalho Ctrl/Cmd + Enter
inputText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') analyzeBtn.click();
});

// Renderiza resultado mantendo compatibilidade com campo JSON retornado da API
function renderResult(data = {}) {
    const percentage = Math.max(0, Math.min(100, Math.round(data.percentage || 0)));
    // guardar último percentual para comparação quando humanizar
    lastAnalyzedPercentage = percentage;
    const suspiciousPhrases = data.suspicious_phrases || [];
    const characteristics = data.characteristics || [];

    percentageText.textContent = `${percentage}%`;
    aiPercentage.textContent = `${percentage}%`;
    humanPercentage.textContent = `${100 - percentage}%`;

    // animar círculo
    const offset = circumference - (percentage / 100) * circumference;
    if (progressCircle) progressCircle.style.strokeDashoffset = offset;

    // texto do veredito
    let vtext = '✓ Texto provávelmente humano';
    if (percentage >= 75) vtext = '⚠️ Muito provável ser gerado por IA';
    else if (percentage >= 50) vtext = '⚠️ Possível conteúdo de IA';
    else if (percentage >= 25) vtext = '🤔 Sinais de IA detectados';
    verdictEl.textContent = vtext;

    // sugestões simples
    const suggestions = [];
    if (percentage >= 75) suggestions.push('Alta probabilidade de IA — considere revisar ou humanizar.');
    else if (percentage >= 50) suggestions.push('Possível IA — revise tom e variação de frases.');
    else suggestions.push('Baixa probabilidade de IA — parece natural.');
    if (suspiciousPhrases.length) suggestions.push('Trechos suspeitos: ' + suspiciousPhrases.slice(0,3).join('; '));
    suggestionsEl.innerHTML = `<strong>Sugestões</strong><p style="color:var(--muted);margin-top:6px">${suggestions.join('<br>')}</p>`;
    suggestionsEl.classList.remove('hidden');

    // detalhes
    let detailsHtml = '';
    if (suspiciousPhrases.length) {
        detailsHtml += '<div><strong>Trechos suspeitos</strong>';
        suspiciousPhrases.slice(0,5).forEach(p => { detailsHtml += `<div style="padding:8px 10px;border-radius:8px;margin-top:8px;background:rgba(255,255,255,0.02)">"${p}"</div>` });
        detailsHtml += '</div>';
    }
    if (characteristics.length) {
        detailsHtml += '<div style="margin-top:8px"><strong>Características</strong>';
        characteristics.slice(0,5).forEach(c => { detailsHtml += `<div style="padding:8px 10px;border-radius:8px;margin-top:8px;background:rgba(255,255,255,0.02)"><strong>${c.trait}</strong><div style="color:var(--muted)">${c.evidence}</div></div>` });
        detailsHtml += '</div>';
    }
    analysisDetails.innerHTML = detailsHtml;

    emptyContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    humanizeBtn?.classList.remove('hidden');
}

// Reanalisar (botão dentro do resultado)
document.getElementById('reanalyzeBtn')?.addEventListener('click', () => analyzeBtn.click());

// Humanizar: envia para endpoint /api/humanize, substitui texto e reanalisar
humanizeBtn?.addEventListener('click', async () => {
    let currentText = inputText.value.trim();
    if (!currentText) return;

    const HUMANIZE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api/humanize'
        : 'https://saladeexperimentos.vercel.app/api/humanize';

    humanizeBtn.disabled = true;
    const originalLabel = humanizeBtn.textContent;

    // queremos garantir que o novo texto tenha porcentagem menor que lastAnalyzedPercentage
    let attempts = 0;
    const maxAttempts = 10; // mais tentativas para aumentar chance de sucesso
    let newText = currentText;
    let newPercent = lastAnalyzedPercentage || 100;

    showLoading();
    try {
        do {
            attempts += 1;
            // solicitar humanização
            const resp = await fetch(HUMANIZE_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ text: newText })
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) throw new Error(data.error || 'Erro humanize');

            newText = data.humanized || newText;
            // analisar novo texto
            const analysis = await analyzeText(newText);
            newPercent = Math.max(0, Math.min(100, Math.round(analysis.percentage || 0)));
            // se melhor caiu abaixo do anterior, pode mostrar
            if (newPercent < lastAnalyzedPercentage) {
                inputText.value = newText;
                charCount.textContent = newText.length;
                renderResult(analysis);
                break;
            }
            // caso contrário, repetir até limite
        } while (attempts < maxAttempts);

        if (newPercent >= lastAnalyzedPercentage) {
            // não conseguiu melhorar
            alert('Não foi possível gerar um texto com menor % de IA após várias tentativas. Tente reformular manualmente.');
            // reapresenta resultado original (sem substituir texto)
            renderResult({ percentage: lastAnalyzedPercentage });
        }
    } catch (err) {
        console.error('[ZeroIA] humanize error', err);
        alert('Erro ao humanizar: ' + (err.message || err));
    } finally {
        hideLoading();
        humanizeBtn.disabled = false;
        humanizeBtn.textContent = originalLabel;
    }
});

// (botões de copiar/tema/exemplos removidos — funcionalidade simplificada)

