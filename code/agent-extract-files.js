    // ==================== EXTRAÇÃO E RETORNO DE ARQUIVOS EDITADOS ====================
    
    /**
     * Extrai blocos de código da resposta e retorna como arquivos downloadáveis
     * Procura por padrões como ```html, ```javascript, etc
     */
    function extractAndReturnFiles(responseText) {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const fileCards = [];
        let match;
        
        while ((match = codeBlockRegex.exec(responseText)) !== null) {
            const language = match[1] || 'txt';
            const code = match[2].trim();
            
            // Determinar extensão do arquivo
            const extensions = {
                'html': 'html',
                'javascript': 'js',
                'js': 'js',
                'python': 'py',
                'py': 'py',
                'css': 'css',
                'json': 'json',
                'xml': 'xml',
                'sql': 'sql',
                'java': 'java',
                'cpp': 'cpp',
                'c': 'c',
                'typescript': 'ts',
                'ts': 'ts',
                'bash': 'sh',
                'yaml': 'yml',
                'markdown': 'md'
            };
            
            const ext = extensions[language.toLowerCase()] || language.toLowerCase();
            const fileName = `arquivo.${ext}`;
            
            // Criar card de download
            const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const fileCard = `
<div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4 my-3">
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <span class="material-icons-outlined text-blue-600 dark:text-blue-400 text-xl">download</span>
            <div>
                <p class="font-semibold text-blue-900 dark:text-blue-100">📥 Arquivo Editado</p>
                <p class="text-sm text-blue-700 dark:text-blue-300">${fileName}</p>
            </div>
        </div>
        <button class="download-file-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" data-file-id="${fileId}">
            <span class="material-icons-outlined text-sm align-middle">save_alt</span>
            Baixar
        </button>
    </div>
</div>`;
            
            fileCards.push({
                id: fileId,
                fileName: fileName,
                code: code,
                html: fileCard,
                language: language
            });
        }
        
        return fileCards;
    }

    /**
     * Renderiza cards de arquivo na resposta da IA
     */
    function renderFileCards(responseText, responseContainerId) {
        const files = extractAndReturnFiles(responseText);
        
        if (files.length === 0) return; // Sem arquivos para baixar
        
        const responseContainer = document.getElementById(responseContainerId);
        if (!responseContainer) return;
        
        // Adicionar cards de arquivo após o texto
        files.forEach(file => {
            const cardDiv = document.createElement('div');
            cardDiv.innerHTML = file.html;
            cardDiv.id = file.id;
            
            // Armazenar código no elemento para download posterior
            cardDiv._fileCode = file.code;
            cardDiv._fileName = file.fileName;
            
            responseContainer.appendChild(cardDiv);
        });
        
        // Setup event listener para downloads
        setTimeout(() => {
            document.querySelectorAll('.download-file-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const fileId = e.currentTarget.dataset.fileId;
                    const fileCard = document.getElementById(fileId);
                    
                    if (fileCard && fileCard._fileCode) {
                        const blob = new Blob([fileCard._fileCode], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileCard._fileName;
                        a.click();
                        URL.revokeObjectURL(url);
                        
                        // Feedback visual
                        const btnText = btn.innerHTML;
                        btn.innerHTML = '<span class="material-icons-outlined text-sm">check</span> Baixado!';
                        setTimeout(() => { btn.innerHTML = btnText; }, 2000);
                    }
                });
            });
        }, 100);
    }
