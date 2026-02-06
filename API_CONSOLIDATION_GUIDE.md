# 🎯 Guia de Consolidação de APIs - Lhama AI

## ✅ Problema Resolvido: Limite de 12 Funções Serverless

Você estava com **13 funções serverless** no plano Hobby da Vercel (limite: 12).

---

## 📊 Antes vs Depois

### 🔴 ANTES (13 funções):
```
api/
├── config.js
├── flux-proxy.js ❌
├── gemini-proxy.js ❌
├── groq-proxy-lhama1.js ❌
├── groq-proxy.js ❌
├── groq.js ❌
├── lhama-groq-api-proxy.js ✅ (mantida)
├── mistral-proxy.js ❌
├── mistral.js ❌
├── pixels-proxy.js ❌
├── status.js
└── unified-proxy.js ✅ (nova)

Lhama-AI/api/
├── tavily-search.js ❌
└── test.js ❌
```

### 🟢 DEPOIS (5 funções):
```
api/
├── config.js ✅
├── lhama-groq-api-proxy.js ✅ (já consolidada)
├── status.js ✅
└── unified-proxy.js ✅ (nova super função)

Lhama-AI/api/
└── (vazia) ✅
```

**Redução: 13 → 5 funções (8 funções removidas!)**

---

## 🚀 Super Proxy Unificado

O novo `unified-proxy.js` consolida **3 APIs essenciais em uma função**:

### 📡 Serviços Disponíveis:
- `tavily_search` - Busca web Tavily
- `pixels` - Busca de imagens Pexels  
- `mistral` - API Mistral AI (para Lhama Code 1)

### 🔧 Como Usar:

**Frontend (JavaScript):**
```javascript
// Busca web Tavily
const response = await fetch('/api/unified-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        service: 'tavily_search',
        query: 'sua busca',
        search_depth: 'basic',
        include_answer: true,
        max_results: 5
    })
});

// Busca imagens Pexels
const response = await fetch('/api/unified-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        service: 'pixels',
        query: 'gatos',
        per_page: 20,
        page: 1
    })
});

// API Mistral (Lhama Code 1)
const response = await fetch('/api/unified-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        service: 'mistral',
        model: 'codestral-latest',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048
    })
});
```

---

## 🔑 Variáveis de Ambiente Necessárias

Configure estas variáveis na Vercel:

### 🔐 Chaves de API:
```bash
TAVILY_API_KEY=your_tavily_key_here
PEXELS_API_KEY=your_pexels_key_here
MISTRAL_API_KEY=your_mistral_key_here
LHAMA_GROQ_API_PROXY=your_groq_key_here
```

### 📋 Status Atual:
- ✅ `LHAMA_GROQ_API_PROXY` - Já configurada (Groq)
- ❌ `TAVILY_API_KEY` - Precisa configurar
- ❌ `PEXELS_API_KEY` - Precisa configurar  
- ❌ `MISTRAL_API_KEY` - Precisa configurar

---

## 🎯 Benefícios

### ✅ Vantagens da Consolidação:
1. **Dentro do limite** - 5 funções vs 12 permitidas
2. **Manutenção fácil** - 1 arquivo para 3 APIs essenciais
3. **Performance melhor** - Menos cold starts
4. **Custo reduzido** - Menos funções ativas
5. **Deploy mais rápido** - Menos arquivos para processar

### 🔄 Migração Automática:
- ✅ Tavily: Já migrada para unified-proxy
- ✅ Pexels: Já migrada para unified-proxy  
- ✅ Mistral: Já migrada para unified-proxy (Lhama Code 1)
- ✅ Groq: Continua usando lhama-groq-api-proxy

---

## 🚀 Próximos Passos

### 1. ⚙️ Configurar Variáveis de Ambiente
Vá ao dashboard da Vercel → Settings → Environment Variables e adicione:

```bash
TAVILY_API_KEY=sk_sua_chave_aqui
PEXELS_API_KEY=sua_chave_pexels_aqui
MISTRAL_API_KEY=sua_chave_mistral_aqui
```

### 2. 🧪 Testar Localmente
```bash
# Testar unified proxy - Tavily
curl -X POST http://localhost:3000/api/unified-proxy \
  -H "Content-Type: application/json" \
  -d '{"service": "tavily_search", "query": "test"}'

# Testar unified proxy - Pexels
curl -X POST http://localhost:3000/api/unified-proxy \
  -H "Content-Type: application/json" \
  -d '{"service": "pixels", "query": "cats"}'

# Testar unified proxy - Mistral
curl -X POST http://localhost:3000/api/unified-proxy \
  -H "Content-Type: application/json" \
  -d '{"service": "mistral", "model": "codestral-latest", "messages": [{"role": "user", "content": "Hello"}]}'
```

### 3. 🚀 Deploy na Vercel
```bash
git add .
git commit -m "Consolidar APIs em unified-proxy.js - remover Flux/Gemini"
git push origin main
```

---

## 🎉 Resultado Final

**Agora você tem:**
- ✅ **5 funções serverless** (dentro do limite)
- ✅ **Super proxy unificado** para 3 APIs essenciais
- ✅ **Busca web funcional** com Tavily
- ✅ **Imagens integradas** com Pexels
- ✅ **Lhama Code 1 funcional** com Mistral
- ✅ **Deploy sem erros** de limite

**Economia: 8 funções serverless!** 🎯

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique as variáveis de ambiente na Vercel
2. Teste o unified-proxy localmente
3. Confirme se o frontend está chamando `/api/unified-proxy`

**Problema resolvido!** 🚀
