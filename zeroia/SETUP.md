# 🔑 CONFIGURAÇÃO RÁPIDA - GROQ_API_KEY

## ⚡ Passo 1: Obter a Chave API do Groq

Visite: https://console.groq.com/keys

1. Faça login ou crie uma conta (é grátis)
2. Clique em "Create API Key"
3. Copie a chave (será algo como: `gsk_...`)

## 📦 Passo 2: Adicionar ao Vercel

### Opção A: Via Dashboard Vercel (Recomendado)

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `saladeexperimentos`
3. Vá para **Settings** (ícone engrenagem)
4. Clique em **Environment Variables**
5. Clique em **Add New**
6. Preencha:
   - **Name:** `GROQ_API_KEY`
   - **Value:** Cole sua chave do Groq
   - **Environments:** Selecione Production, Preview e Development
7. Clique em **Save**

### Opção B: Via Vercel CLI

```bash
vercel env add GROQ_API_KEY
# Cole sua chave quando solicitado
# Selecione: Production, Preview, Development
```

### Opção C: Do Package.json

Se tiver um `vercel.json`, pode adicionar direto:

```json
{
  "env": {
    "GROQ_API_KEY": "@groq_api_key"
  }
}
```

E então: `vercel secrets create groq_api_key "sua_chave_aqui"`

## ✅ Passo 3: Deploy

Após adicionar a variável, faça um novo deploy:

```bash
git add .
git commit -m "config: add GROQ_API_KEY"
git push
```

Vercel fará o deploy automático.

## 🧪 Testar

Acesse: `https://saladeexperimentos.vercel.app/zeroia`

Cole um texto e clique em "Analisar Texto"

## ❌ Solução de Problemas

### "GROQ_API_KEY não configurada"
- ✅ Verifique se a variável foi adicionada no Vercel
- ✅ Aguarde 5-10 minutos para propagar
- ✅ Refaça o deploy com `git push`

### "Erro ao chamar API GROQ"
- ✅ Verifique se a chave é válida em: https://console.groq.com/keys
- ✅ Certifique-se de que a chave começa com `gsk_`
- ✅ Não há caracteres extras (espaços, quebras de linha)

### CORS Error
- ✅ O CORS já está configurado no `ai-detect.js`
- ✅ Se persistir, verifique se a URL está correta no `script.js`

---

**Precisa de ajuda?** Consulte:
- Groq Docs: https://console.groq.com/docs
- Vercel Env: https://vercel.com/docs/environment-variables
