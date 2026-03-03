# 🤖 ZeroIA - Detector de Textos Gerados por IA

Um detector moderno e profissional que identifica se um texto foi gerado por inteligência artificial, usando a API Groq com análise avançada.

## 🎯 Características

- ✨ Interface moderna e responsiva com 2 cards
- 📊 Análise visual com gráfico circular animado
- 🎯 Porcentagem de probabilidade de IA
- 🚨 Identificação de trechos suspeitos
- 📈 Características detectadas do texto
- ⚡ API integrada com Groq (Mixtral 8x7b)
- 🎨 Design profissional com cantos arredondados

## 🚀 Como Configurar

### 1. Obter a GROQ API Key

1. Acesse [console.groq.com](https://console.groq.com)
2. Faça login ou crie uma conta
3. Vá para "API Keys"
4. Copie sua chave API

### 2. Configurar no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Vá para o seu projeto `saladeexperimentos`
3. Settings → Environment Variables
4. Adicione uma nova variável:
   - **Name:** `GROQ_API_KEY`
   - **Value:** [Cole sua chave do Groq]
5. Clique em "Save"

### 3. Deploy

```bash
git add .
git commit -m "feat: add ZeroIA detector"
git push
```

O Vercel fará o deploy automático!

## 🧪 Testar Localmente

Se quiser testar localmente:

1. Crie um arquivo `.env.local` na raiz do projeto:
```env
GROQ_API_KEY=sua_chave_aqui
```

2. Inicie o servidor:
```bash
npm install
npm start
```

3. Abra `http://localhost:3000/zeroia`

## 📱 Como Usar

1. **Cole o texto** no card esquerdo
2. **Clique em "Analisar Texto"** (ou use Ctrl+Enter)
3. **Veja o resultado** no card direito:
   - Porcentagem de probabilidade de IA
   - Trechos suspeitos
   - Características observadas

## 🎨 Design

- **Gradiente**: Roxo a rosa (#667eea → #764ba2)
- **Botão**: Azul indigo com sombra
- **Cores de Resultado**:
  - 🟢 Verde: Texto humano (0-25%)
  - 🟡 Amarelo: Traços de IA (25-50%)
  - 🟠 Laranja: Possivelmente IA (50-75%)
  - 🔴 Vermelho: Muito provável IA (75-100%)

## 🔗 API Endpoint

**POST** `/api/ai-detect`

### Request:
```json
{
  "text": "Seu texto aqui..."
}
```

### Response:
```json
{
  "percentage": 75,
  "suspicious_phrases": [
    "é uma questão complexa",
    "portanto, conclui-se que"
  ],
  "characteristics": [
    {
      "trait": "Estrutura Formal",
      "evidence": "Uso consistente de vocabulário técnico"
    }
  ]
}
```

## 📁 Estrutura

```
zeroia/
├── index.html      (Estrutura HTML)
├── script.js       (Lógica do frontend)
├── style.css       (Estilos modernos)
└── README.md       (Este arquivo)

api/
└── ai-detect.js    (Endpoint da API com Groq)
```

## 🔒 Segurança

- A chave API fica segura no servidor Vercel
- Frontend não tem acesso direto à chave
- CORS configurado para aceitar requisições

## 💡 Melhorias Futuras

- [ ] Histórico de análises
- [ ] Exportar resultado como PDF
- [ ] Comparação entre múltiplos textos
- [ ] Modo escuro automático
- [ ] Suporte a mais idiomas
- [x] Botão "Humanizar" para reescrever texto e reanalisar
- [x] Exibição de rótulo de pontuação estilo "AI GPT*"
- [x] Caixa de sugestões com pontos positivos/negativos e melhorias

## 📄 Licença

MIT - Uso livre para qualquer propósito

---

**Desenvolvido com ❤️ usando Groq + Moderna UI**
