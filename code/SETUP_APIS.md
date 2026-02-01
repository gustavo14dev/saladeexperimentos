# 🦙 Lhama Code 1 - Configuração das APIs

## Visão Geral dos Modelos

### 📱 Rápido (Gemini Flash)
- **API:** Google Gemini
- **Velocidade:** ⚡ Muito rápida
- **Custo:** 💰 Econômico
- **Processamento:** Direto, sem raciocínio elaborado
- **Ideal para:** Respostas rápidas e simples

### 🧠 Raciocínio (Groq Llama 3)
- **API:** Groq
- **Velocidade:** ⚡ Rápida
- **Custo:** 💰 Moderado
- **Processamento:** 
  - ✅ Análise de contexto
  - ✅ Consulta ao modelo
  - ✅ Pensamento e raciocínio
  - ✅ Validação de resposta
- **Ideal para:** Análise profunda e técnica

### 💎 Pro (Groq + Gemini)
- **APIs:** Groq + Google Gemini
- **Velocidade:** ⚡ Normal
- **Custo:** 💰 Mais alto (usa 2 APIs)
- **Processamento:**
  1. ✅ **Rodada 1:** Ambas as IAs analisam independentemente
  2. ✅ **Rodada 2:** Cada IA revisa a resposta da outra
  3. ✅ **Rodada 3:** Groq sintetiza uma resposta final
- **Ideal para:** Análises críticas com múltiplas perspectivas

---

## 🔑 Configuração das APIs

### Passo 1: Obter a API Key do Groq

1. Acesse [https://console.groq.com](https://console.groq.com)
2. Crie uma conta ou faça login
3. Vá para "API Keys"
4. Clique em "Create New API Key"
5. Copie a chave (exemplo: `gsk_xxxxxxxxxxxxxxxxxxxx`)

### Passo 2: Configurar no Console do Navegador

Abra o Console do Navegador (F12 → Console) e execute:

```javascript
session.start("sua_chave_groq_aqui")
```

**Exemplo prático:**
```javascript
session.start("gsk_1234567890abcdefghijklmnop")
```

**Saída esperada:**
```
✅ API Key Groq salva com sucesso!
Agora você pode enviar mensagens pelo chat.
Use o modelo "Raciocínio" para testar.
```

---

### Passo 3: Obter a API Key do Gemini

1. Acesse [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Clique em "Create API key"
3. Selecione o projeto (ou crie um novo)
4. Copie a chave (exemplo: `AIzaSy...`)

### Passo 4: Configurar Gemini no Console

Abra o Console do Navegador e execute:

```javascript
session.startGemini("sua_chave_gemini_aqui")
```

**Exemplo prático:**
```javascript
session.startGemini("AIzaSyDemoKey1234567890abcdefghijklmnop")
```

**Saída esperada:**
```
✅ API Key Gemini salva com sucesso!
Agora você pode usar os modelos "Rápido" e "Pro".
```

---

## ✅ Verificar Status

Para verificar se as duas APIs estão configuradas corretamente, execute:

```javascript
session.status()
```

**Saída esperada (quando ambas estão configuradas):**
```
📊 Status das APIs:
✅ Groq: gsk_12345...
✅ Gemini: AIzaSy...
```

---

## 🚀 Usando os Modelos

### Modelo Rápido
1. Clique no botão de modelo ao lado de "Adicionar código"
2. Selecione "Rápido"
3. Digite sua pergunta
4. Pressione Enter ou clique no botão enviar

### Modelo Raciocínio
1. Clique no botão de modelo
2. Selecione "Raciocínio" (padrão)
3. Veja o processo passo a passo com os checks

### Modelo Pro
1. Clique no botão de modelo
2. Selecione "Pro"
3. Veja ambas as IAs pensando e depois revisando uma a outra

---

## 🔧 Comandos do Console

```javascript
// Remover API Key Groq
session.clear()

// Remover API Key Gemini
session.clearGemini()

// Ver histórico de conversas
agent.getHistoryStats()

// Limpar histórico
agent.clearHistory()
```

---

## ⚠️ Dicas Importantes

1. **Guarde as chaves em local seguro** - Não compartilhe as APIs
2. **Cada modelo tem seu uso**:
   - Use **Rápido** para perguntas simples
   - Use **Raciocínio** para análises técnicas
   - Use **Pro** quando precisa de múltiplas perspectivas
3. **O modelo Pro usa 2 APIs**, então é mais caro
4. **Limite de taxa:** Verifique os limites de sua conta Groq e Gemini

---

## 🆘 Troubleshooting

### Erro: "API Key não configurada"
```
Solução: Execute session.start("sua_chave_groq")
```

### Erro: "API Key Gemini não configurada"
```
Solução: Execute session.startGemini("sua_chave_gemini")
```

### Erro: "Resposta inválida"
```
Verifique:
1. A chave está correta
2. Você tem saldo/limite na conta
3. A API está ativa/habilitada
```

### Modelo Pro não funciona
```
Verifique se AMBAS as APIs estão configuradas:
session.status()
```

---

## 📊 Monitoramento de Custo

- **Rápido:** Usa Gemini Flash (mais econômico)
- **Raciocínio:** Usa Groq (1 chamada por pergunta)
- **Pro:** Usa Groq + Gemini (3-4 chamadas por pergunta)

Monitore seus gastos nos painéis:
- Groq: https://console.groq.com/billing
- Gemini: https://console.cloud.google.com/billing

---

## ✨ Exemplo Completo

```javascript
// 1. Configurar APIs
session.start("sua_chave_groq")
session.startGemini("sua_chave_gemini")

// 2. Verificar status
session.status()

// 3. Usar o chat normalmente
// → Escolha o modelo desejado no dropdown
// → Digite sua pergunta
// → Veja a mágica acontecer! ✨
```

---

**Boa sorte com seu Lhama Code 1! 🦙**
