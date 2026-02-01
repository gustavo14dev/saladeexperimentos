/**
 * Módulo para formatar respostas com código sem trigger XSS warnings do highlight.js
 */

export function formatCodeBlock(lang, code, codeId) {
    // Escape do código para armazenar em atributo
    const codeEscaped = code.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    return `<div class="bg-gray-900 dark:bg-gray-950 rounded-xl my-4 overflow-hidden border border-gray-700 dark:border-gray-800 shadow-lg">
        <div class="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
            <span class="text-xs font-semibold text-gray-300 uppercase">${lang || 'code'}</span>
            <div class="flex gap-2">
                <button class="copy-btn px-3 py-1.5 text-xs flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded transition-colors" data-code-id="${codeId}">
                    <span class="material-icons-outlined text-sm">content_copy</span> Copiar
                </button>
                <button class="download-btn px-3 py-1.5 text-xs flex items-center gap-1 bg-primary hover:bg-primary/90 text-white rounded transition-colors" data-code-id="${codeId}" data-lang="${lang || 'txt'}">
                    <span class="material-icons-outlined text-sm">download</span> Baixar
                </button>
            </div>
        </div>
        <div class="p-4 overflow-x-auto bg-gray-950">
            <pre class="m-0"><code class="text-sm font-mono text-gray-100 language-${lang || 'plaintext'}" id="${codeId}" data-raw-code="${codeEscaped}" data-language="${lang || 'plaintext'}"></code></pre>
        </div>
    </div>`;
}

// Função para ser chamada após DOM estar pronto
export function initCodeHighlighting(containerEl) {
    // Encontrar todos os <code> com atributo data-raw-code
    const codeElements = containerEl.querySelectorAll('code[data-raw-code]');
    
    codeElements.forEach(codeEl => {
        const rawCode = codeEl.getAttribute('data-raw-code')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
        
        const lang = codeEl.getAttribute('data-language') || 'plaintext';
        
        // Inserir o código via textContent (seguro!)
        codeEl.textContent = rawCode;
        
        // Agora fazer highlight no elemento com código plaintext
        try {
            hljs.highlightElement(codeEl);
        } catch(e) {
            console.warn('Erro ao highlight:', e);
        }
    });
}
