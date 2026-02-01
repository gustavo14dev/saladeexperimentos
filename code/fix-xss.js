#!/usr/bin/env node

/**
 * Fix para XSS warnings do highlight.js
 * Execute: node fix-xss.js
 */

const fs = require('fs');
const path = require('path');

const mainFile = path.join(__dirname, 'main.js');
let content = fs.readFileSync(mainFile, 'utf8');

// Remover hljs.highlight() em formatResponse
const oldFormatResponse = `        // Processar blocos de código com syntax highlight
        formatted = formatted.replace(/\`\`\`(\w+)?\\\n([\\\s\\\S]*?)\`\`\`/g, (match, lang, code) => {
            const codeId = 'code_' + Date.now() + Math.random().toString(36).substr(2, 9);
            const trimmedCode = code.trim();
            let highlightedCode = trimmedCode;
            
            try {
                highlightedCode = hljs.highlight(trimmedCode, { language: lang || 'plaintext', ignoreIllegals: true }).value;
            } catch (e) {
                console.warn('Erro ao highlight código:', e);
                highlightedCode = trimmedCode;
            }
            
            return \`<div class="bg-gray-900 dark:bg-gray-950 rounded-xl my-4 overflow-hidden border border-gray-700 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow">
                    <div class="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800">
                        <span class="text-xs font-semibold text-gray-300 uppercase tracking-wider">\${lang || 'code'}</span>
                        <div class="flex gap-2">
                            <button onclick="copyCode('\${codeId}')" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors transform hover:scale-105">
                                <span class="material-icons-outlined" style="font-size: 14px;">content_copy</span>
                                Copiar
                            </button>
                            <button onclick="downloadCode('\${codeId}', '\${lang || 'txt'}')" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors transform hover:scale-105">
                                <span class="material-icons-outlined" style="font-size: 14px;">download</span>
                                Baixar
                            </button>
                        </div>
                    </div>
                    <div class="p-4 overflow-x-auto no-scrollbar" id="\${codeId}_container">
                        <pre id="\${codeId}" class="m-0"><code class="text-sm font-mono text-gray-100 leading-relaxed hljs language-\${lang || 'plaintext'}">\${highlightedCode}</code></pre>
                    </div>
                </div>\`;
        });`;

// TROCAR POR VERSÃO SEM hljs.highlight()
const newFormatResponse = `        // Processar blocos de código - NÃO fazer highlight aqui!
        formatted = formatted.replace(/\`\`\`(\w+)?\\\n([\\\s\\\S]*?)\`\`\`/g, (match, lang, code) => {
            const codeId = 'code_' + Date.now() + Math.random().toString(36).substr(2, 9);
            const trimmedCode = code.trim();
            
            // Escapar código para data attribute
            const escapedCode = trimmedCode
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            
            return \`<div class="bg-gray-900 dark:bg-gray-950 rounded-xl my-4 overflow-hidden border border-gray-700 dark:border-gray-800 shadow-lg">
                <div class="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
                    <span class="text-xs font-semibold text-gray-300 uppercase">\${lang || 'code'}</span>
                    <div class="flex gap-2">
                        <button class="copy-btn px-3 py-1.5 text-xs flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded" data-code-id="\${codeId}">
                            <span class="material-icons-outlined text-sm">content_copy</span> Copiar
                        </button>
                        <button class="download-btn px-3 py-1.5 text-xs flex items-center gap-1 bg-primary hover:bg-primary/90 text-white rounded" data-code-id="\${codeId}" data-lang="\${lang || 'txt'}">
                            <span class="material-icons-outlined text-sm">download</span> Baixar
                        </button>
                    </div>
                </div>
                <div class="p-4 overflow-x-auto bg-gray-950">
                    <pre class="m-0"><code id="\${codeId}" class="text-sm font-mono text-gray-100 language-\${lang || 'plaintext'}" data-raw-code="\${escapedCode}"></code></pre>
                </div>
            </div>\`;
        });`;

if (content.includes(oldFormatResponse)) {
    content = content.replace(oldFormatResponse, newFormatResponse);
    console.log('✅ Replaced code block formatting');
} else {
    console.warn('⚠️ Could not find exact match for code block formatting');
}

// Atualizar typewriterEffect para descodificar data-raw-code
const oldTypewriter = `        // Aplicar syntax highlight APENAS em blocos de código legítimos
        setTimeout(() => {
            try {
                // Procurar apenas por elementos <code> dentro de <pre> (blocos de código reais)
                const codeBlocks = element.querySelectorAll('pre > code');
                codeBlocks.forEach(codeBlock => {
                    try {
                        hljs.highlightElement(codeBlock);
                    } catch(e) {}
                });
            } catch(e) {}
            // Garantir scroll final depois do highlight
            this.scrollToBottom();
        }, 100);`;

const newTypewriter = `        // Aplicar syntax highlight APENAS em blocos de código legítimos
        setTimeout(() => {
            try {
                // Descodificar e inserir código em elements com data-raw-code
                const codeBlocks = element.querySelectorAll('code[data-raw-code]');
                codeBlocks.forEach(codeBlock => {
                    const rawCode = codeBlock.getAttribute('data-raw-code')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"');
                    
                    // Usar textContent para inserir código (SEGURO!)
                    codeBlock.textContent = rawCode;
                    
                    // Agora fazer highlight - nunca vai ter HTML não escapado
                    try {
                        hljs.highlightElement(codeBlock);
                    } catch(e) {}
                });
            } catch(e) {}
            // Garantir scroll final depois do highlight
            this.scrollToBottom();
        }, 100);`;

if (content.includes(oldTypewriter)) {
    content = content.replace(oldTypewriter, newTypewriter);
    console.log('✅ Updated typewriterEffect');
} else {
    console.warn('⚠️ Could not find typewriterEffect');
}

// Adicionar event listener para copy/download no init()
const initMatch = content.match(/this\.init\(\);/);
if (initMatch) {
    const init = `this.init();
        
        // Setup delegated event listeners para copy/download
        document.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.copy-btn');
            if (copyBtn) {
                const codeId = copyBtn.dataset.codeId;
                const codeEl = document.getElementById(codeId);
                if (codeEl) {
                    navigator.clipboard.writeText(codeEl.textContent).then(() => {
                        const original = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<span class="material-icons-outlined text-sm">check</span> Copiado!';
                        setTimeout(() => { copyBtn.innerHTML = original; }, 2000);
                    });
                }
            }
            
            const dlBtn = e.target.closest('.download-btn');
            if (dlBtn) {
                const codeId = dlBtn.dataset.codeId;
                const lang = dlBtn.dataset.lang;
                const codeEl = document.getElementById(codeId);
                if (codeEl) {
                    const blob = new Blob([codeEl.textContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'arquivo.' + lang;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            }
        });`;
    
    content = content.replace(/this\.init\(\);/, init);
    console.log('✅ Added event listeners');
}

fs.writeFileSync(mainFile, content, 'utf8');
console.log('✅ File updated successfully!');
console.log('🎉 XSS warnings should be fixed now');
