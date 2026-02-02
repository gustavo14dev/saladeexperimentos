/**
 * Geração de Imagens com Gemini
 * Integração com modelo de geração de imagens mais econômico
 * 
 * Marca d'água com "Lhama AI 1"
 */

class GeminiImageAPI {
    constructor() {
        this.estaProcessando = false;
        this.modeloImagem = 'imagen-3.0-fast-generate-001'; // Modelo mais econômico do Google
    }

    /**
     * Verifica se pode gerar imagem
     * @returns {boolean}
     */
    podeGerar() {
        return true;
    }

    /**
     * Detecta se o usuário está pedindo para gerar imagem
     * @param {string} mensagem - Mensagem do usuário
     * @returns {boolean}
     */
    estasPedindoImagem(mensagem) {
        const palavrasChave = [
            'gere uma imagem',
            'gera uma imagem',
            'gerar imagem',
            'gera imagem',
            'desenha',
            'desenhe',
            'pinta',
            'pinte',
            'cria uma imagem',
            'crie uma imagem',
            'cria imagem',
            'crie imagem',
            'cria uma foto',
            'crie uma foto',
            'foto de',
            'imagem de',
            'picture of',
            'draw me',
            'generate image'
        ];

        const mensagemLower = mensagem.toLowerCase();
        return palavrasChave.some(palavra => mensagemLower.includes(palavra));
    }

    /**
        // Função de geração de imagem desativada. Apenas training.json será usado.
        return null;
            return null;

        } finally {
            this.estaProcessando = false;
        }
    }
}

// Instância global
const geminiImageAPI = new GeminiImageAPI();
// Arquivo removido. Toda lógica de API foi eliminada. Apenas training.json é usado.
