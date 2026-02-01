// VERSÃO CORRIGIDA DE formatResponse() - SEM hljs.highlight()
// Cole isto no lugar da função original (linhas 1320-1373)

function formatResponse(text) {
    // Se texto está vazio ou muito pequeno, retornar como está
    if (!text || text.length === 0) {
        return '<p class="text-gray-600 dark:text-gray-400">Resposta vazia</p>';
    }
    
    let formatted = this.escapeHtml ? this.escapeHtml(text) : text;
    
    // Processar blocos de código - NÃO fazer highlight aqui!
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const codeId = 'code_' + Date.now() + Math.random().toString(36).substr(2, 9);
        const trimmedCode = code.trim();
        
        // Escapar para armazenar seguro em atributo data
        const escapedCode = trimmedCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        
        // HTML SEM O CÓDIGO INSIDE - código vai no data attribute
        return `<div class="bg-gray-900 dark:bg-gray-950 rounded-xl my-4 overflow-hidden border border-gray-700 dark:border-gray-800 shadow-lg">
    <div class="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
        <span class="text-xs font-semibold text-gray-300 uppercase">${lang || 'code'}</span>
        <div class="flex gap-2">
            <button class="copy-code px-3 py-1.5 text-xs flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded transition-colors" data-code-id="${codeId}">
                <span class="material-icons-outlined text-sm">content_copy</span> Copiar
            </button>
            <button class="download-code px-3 py-1.5 text-xs flex items-center gap-1 bg-primary hover:bg-primary/90 text-white rounded transition-colors" data-code-id="${codeId}" data-lang="${lang || 'txt'}">
                <span class="material-icons-outlined text-sm">download</span> Baixar
            </button>
        </div>
    </div>
    <div class="p-4 overflow-x-auto bg-gray-950">
        <pre class="m-0"><code id="${codeId}" class="text-sm font-mono text-gray-100 language-${lang || 'plaintext'}" data-raw-code="${escapedCode}"></code></pre>
    </div>
</div>`;
    });

    // Processar inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-800 dark:bg-gray-900 px-2.5 py-1 rounded text-sm font-mono text-orange-400 border border-gray-700">$1</code>');
    
    // Processar bold e italic
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>');
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>');
    
    // Processar quebras de linha - converter \n\n em paragrafos
    formatted = formatted.replace(/\n\n+/g, '</p><p class="mt-3 text-gray-700 dark:text-gray-200">');
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Envolver em paragrafos se não tiver tags de bloco
    if (!formatted.includes('<div') && !formatted.includes('<pre') && !formatted.includes('<p>')) {
        formatted = '<p class="text-gray-700 dark:text-gray-200">' + formatted + '</p>';
    }
    
    return formatted;
}
