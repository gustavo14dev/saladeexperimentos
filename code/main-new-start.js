import { Agent } from './agent.js';
import { TimelineSystem } from './timeline-system.js';
import { ProactiveSuggestions } from './proactive-system.js';
import { PreferenceLearning } from './preference-system.js';

console.log('[STARTUP] Loading modules...');

// Sistema de Depuração (carregado dinamicamente)
let DebugSystem = null;

// Flag de debug global (desativar em produção)
const DEBUG = false;

// ============================================
// EXTENSÃO GLOBAL: Funções para copy/download
// ============================================

window.handleCopyCode = function(codeId) {
    const codeEl = document.getElementById(codeId);
    if (codeEl) {
        const text = codeEl.textContent;
        navigator.clipboard.writeText(text).then(() => {
            // Toast de sucesso
            const btn = document.querySelector(`[data-code-id="${codeId}"]`);
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span class="material-icons-outlined text-sm">check</span> Copiado!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            }
        }).catch(() => {
            alert('Erro ao copiar');
        });
    }
};

window.handleDownloadCode = function(codeId, lang) {
    const codeEl = document.getElementById(codeId);
    if (codeEl) {
        const text = codeEl.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arquivo.${lang}`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// ============================================
// CLASS UI
// ============================================

class UI {
    constructor() {
        this.isTransitioned = false;
        this.agent = new Agent(this);
        this.chats = this.loadChats();
        this.currentChatId = null;
        this.currentModel = 'raciocinio';
        
        // Inicializar sistemas de melhoria
        this.timeline = new TimelineSystem(this);
        this.suggestions = new ProactiveSuggestions(this.agent, this);
        this.preferences = new PreferenceLearning();
        
        this.elements = {
            welcomeScreen: document.getElementById('welcomeScreen'),
            titleSection: document.getElementById('titleSection'),
            chatArea: document.getElementById('chatArea'),
            messagesContainer: document.getElementById('messagesContainer'),
            userInput: document.getElementById('userInput'),
            sendButton: document.getElementById('sendButton'),
            addCodeButton: document.getElementById('addCodeButton'),
            newChatBtn: document.getElementById('newChatBtn'),
            chatHistoryList: document.getElementById('chatHistoryList'),
            modelButton: document.getElementById('modelButton'),
            modelDropdown: document.getElementById('modelDropdown'),
            modelButtonText: document.getElementById('modelButtonText'),
            scrollToBottomBtn: document.getElementById('scrollToBottomBtn')
        };

        // Debug (somente se flag ativada)
        if (DEBUG) {
            console.log('✅ Elementos carregados:', {
                modelButton: !!this.elements.modelButton,
                modelDropdown: !!this.elements.modelDropdown,
                modelButtonText: !!this.elements.modelButtonText
            });
        }

            this.init();
        }
    }
