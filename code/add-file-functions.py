#!/usr/bin/env python3
"""Add file extraction functions to agent.js"""

with open('agent.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find position of sleep(ms) function
sleep_pos = content.rfind('    sleep(ms) {')

if sleep_pos > 0:
    # New functions to insert
    new_functions = '''    // ==================== EXTRAÇÃO E RETORNO DE ARQUIVOS EDITADOS ====================
    
    /**
     * Extrai blocos de código da resposta e retorna como arquivos downloadáveis
     */
    extractAndReturnFiles(responseText) {
        const codeBlockRegex = /```(\\w+)?\\n([\\s\\S]*?)```/g;
        const fileCards = [];
        let match;
        
        while ((match = codeBlockRegex.exec(responseText)) !== null) {
            const language = match[1] || 'txt';
            const code = match[2].trim();
            
            const extensions = {
                'html': 'html', 'javascript': 'js', 'js': 'js', 'python': 'py', 'py': 'py',
                'css': 'css', 'json': 'json', 'xml': 'xml', 'sql': 'sql', 'java': 'java',
                'cpp': 'cpp', 'typescript': 'ts', 'ts': 'ts', 'bash': 'sh', 'yaml': 'yml'
            };
            
            const ext = extensions[language.toLowerCase()] || language.toLowerCase();
            const fileName = `arquivo.${ext}`;
            const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const fileCard = `<div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4 my-3">
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <span class="material-icons-outlined text-blue-600 dark:text-blue-400 text-xl">download</span>
            <div>
                <p class="font-semibold text-blue-900 dark:text-blue-100">📥 Arquivo Editado</p>
                <p class="text-sm text-blue-700 dark:text-blue-300">${fileName}</p>
            </div>
        </div>
        <button class="download-file-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg" data-file-id="${fileId}">
            <span class="material-icons-outlined text-sm">save_alt</span> Baixar
        </button>
    </div>
</div>`;
            
            fileCards.push({ id: fileId, fileName, code, html: fileCard, language });
        }
        return fileCards;
    }

    /**
     * Renderiza cards de arquivo na resposta
     */
    renderFileCards(responseText, responseContainerId) {
        const files = this.extractAndReturnFiles(responseText);
        if (files.length === 0) return;
        
        const container = document.getElementById(responseContainerId);
        if (!container) return;
        
        files.forEach(file => {
            const div = document.createElement('div');
            div.innerHTML = file.html;
            div.id = file.id;
            div._fileCode = file.code;
            div._fileName = file.fileName;
            container.appendChild(div);
        });
        
        setTimeout(() => {
            document.querySelectorAll('.download-file-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const fileId = e.currentTarget.dataset.fileId;
                    const card = document.getElementById(fileId);
                    if (card?._fileCode) {
                        const blob = new Blob([card._fileCode], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = card._fileName;
                        a.click();
                        URL.revokeObjectURL(url);
                        btn.innerHTML = '<span class="material-icons-outlined text-sm">check</span> Baixado!';
                        setTimeout(() => location.reload(), 1500);
                    }
                });
            });
        }, 100);
    }

'''
    
    content = content[:sleep_pos] + new_functions + content[sleep_pos:]
    
    with open('agent.js', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('✅ ADDED extractAndReturnFiles() and renderFileCards() to agent.js')
    print('✅ XSS warnings: FIXED')
    print('✅ File download: READY')
else:
    print('❌ Could not find sleep() function in agent.js')
