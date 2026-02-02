# 📚 Guia Completo: Configurar Gemini AI no Vercel

Bem-vindo! Este guia passo a passo mostra **EXATAMENTE** como configurar a API do Gemini no seu site hospedado no Vercel. Sem estresse, sem confusão! 🎯

---

## ✅ Pré-requisitos

1. **Conta Google** (você provavelmente já tem)
2. **Projeto no Vercel** (onde seu site está hospedado)
3. **Acesso ao painel do Vercel** (controle de seu projeto)
4. **Chave API do Gemini** (vamos conseguir agora)

---

## 🔑 PASSO 1: Obter sua Chave API do Gemini

### 1.1 Acesse o Google AI Studio
- Abra no navegador: **https://aistudio.google.com**
- Faça login com sua conta Google

### 1.2 Crie ou acesse uma chave API
1. No menu esquerdo, clique em **"API keys"** (ou "Chaves de API")
2. Clique em **"Create API key"** (ou "Criar chave de API")
3. Escolha **"Create API key in new project"**
4. Pronto! Uma chave será gerada. Ela parece assim:
   ```
   AIzaSyD-ABC123DEF456GHI789JKL012MNO...
   ```

### 1.3 Copie a chave
- **Copie a chave inteira** (clique no ícone de copiar)
- Guarde em um local seguro (vamos usar em breve)

⚠️ **IMPORTANTE**: Nunca compartilhe esta chave com ninguém! Guarde para si.

---

## 🚀 PASSO 2: Adicionar a Chave no Vercel

### 2.1 Acesse o Painel do Vercel
1. Vá para **https://vercel.com/dashboard**
2. Faça login se necessário
3. Clique no seu **projeto** (o que tem seu site)

### 2.2 Acesse as Variáveis de Ambiente
1. Na página do seu projeto, procure na barra lateral por **"Settings"** (Configurações)
2. Clique em **"Settings"**
3. No menu esquerdo, clique em **"Environment Variables"** (Variáveis de Ambiente)

### 2.3 Crie a Variável
1. Clique em **"Add Another"** ou **"Add"** (Adicionar)
2. Preencha os campos:

   **Name (Nome):**
   ```
   GEMINI_API_KEY
   ```

   **Value (Valor):**
   ```
   [Cole aqui sua chave que copiou no PASSO 1]
   ```

3. Selecione os ambientes (marque todos):
   - ✅ Production (Produção)
   - ✅ Preview (Visualização)
   - ✅ Development (Desenvolvimento)

4. Clique em **"Save"** (Salvar)

✅ **Pronto!** A chave foi adicionada.

---

## 🌐 PASSO 3: Faça Deploy da Atualização

Como você adicionou variáveis de ambiente, precisa fazer um novo deploy.

### 3.1 Opção A: Deploy Automático (Recomendado)
- Vá ao seu repositório no GitHub (ou GitLab/Bitbucket)
- Faça qualquer pequena mudança (ou só faça push vazio)
- O Vercel vai detectar e fazer deploy automaticamente

### 3.2 Opção B: Redeploy Manual
1. No painel do Vercel, clique em **"Deployments"** (Implementações)
2. Clique nos 3 pontinhos `...` do deployment mais recente
3. Selecione **"Redeploy"** (Reconfigurar)
4. Confirme

✅ Aguarde o deploy terminar (vira verde quando pronto)

---

## 🧪 PASSO 4: Testar Localmente (Opcional, mas Recomendado)

Se quiser testar no seu computador antes de enviarpara o Vercel:

### 4.1 Adicione a Chave Localmente
1. Abra seu navegador (ex: Chrome)
2. Abra o **Console** (F12 ou Ctrl+Shift+J)
3. Cole este comando e pressione Enter:

   ```javascript
   sessionStorage.setItem('GEMINI_API_KEY', 'AIzaSyD-ABC123...')
   ```

   (Substitua `'AIzaSyD-ABC123...'` por sua chave real)

4. Feche o console

### 4.2 Teste a IA
- Faça uma pergunta que **NÃO** existe no training.json
- Se a API está funcionando, você verá uma resposta do Gemini! ✨

---

## 🔍 PASSO 5: Como Funciona Agora?

### O Fluxo de Respostas:
1. **Você faz uma pergunta**
2. A IA **busca no training.json** (busca exata)
3. Se encontrar → **Responde do training.json** ⚡ (rápido)
4. Se **NÃO encontrar** → **Chama API do Gemini** 🤖 (usa a chave)
5. Gemini gera uma resposta criativa
6. Você vê a resposta!

### Exemplo:
```
Você: "olá"
→ Encontrado no training.json!
→ Resposta: "Olá! 🌟 Tudo bem?"

Você: "Como é a vida num planeta misterioso?"
→ Não está no training.json
→ API Gemini gera resposta
→ Resposta criativa do Gemini! ✨
```

---

## ⚡ Qual Modelo Estou Usando?

O código está configurado para usar:
- **Modelo**: `gemini-2.5-flash` ⚡
  - Mais rápido
  - Mais econômico
  - Perfeito para chatbots

Se quiser mudar de modelo, edite o arquivo `Gemini/config.js`:
```javascript
MODEL: 'gemini-2.0-flash-exp',  // Trocar aqui
```

Modelos disponíveis:
- `gemini-2.5-flash` ⭐ (Recomendado - mais rápido)
- `gemini-2.0-flash`
- `gemini-1.5-pro` (Mais poderoso, mais lento)

---

## 🐛 Solução de Problemas

### "Chave API inválida"
- ✅ Verifique se copiou a chave **INTEIRA**
- ✅ Verifique se não tem espaços extras
- ✅ Tente gerar uma **nova chave** no Google AI Studio

### "Erro de conexão"
- ✅ Verifique sua conexão de internet
- ✅ Aguarde alguns segundos e tente novamente
- ✅ Verifique se o Vercel fez o deploy com sucesso

### "Muitas requisições"
- ✅ A API do Gemini tem limite de requisições por minuto
- ✅ Aguarde um pouco e tente novamente
- ✅ Se usa muito, considere um plano pago do Google

### "API não está respondendo"
- ✅ Verifique se a variável `GEMINI_API_KEY` foi adicionada no Vercel
- ✅ Verifique se fez o deploy **DEPOIS** de adicionar a chave
- ✅ Aguarde 2-3 minutos (às vezes o Vercel leva para processar)

---

## 📋 Checklist Final

- [ ] Criei chave API no Google AI Studio
- [ ] Copiei a chave completa
- [ ] Adicionei a variável `GEMINI_API_KEY` no Vercel
- [ ] (Opcional, recomendação de segurança) Adicionei `EXPOSE_GEMINI_KEY=false` para NÃO expor a chave via `/api/config` e optei por usar `/api/gemini-proxy`
- [ ] Selecionei todos os ambientes (Production, Preview, Development)
- [ ] Cliquei em "Save"
- [ ] Fiz um novo deploy no Vercel
- [ ] Aguardei o deploy ficar verde
- [ ] Testei fazendo uma pergunta que não está no training.json
- [ ] Recebi uma resposta do Gemini! ✨

---

## 💡 Dicas Extras

### Economizar na API
- Quanto menos você usa a API, menos gasta
- As perguntas no `training.json` são **GRÁTIS** (não usam API)
- Adicione mais respostas ao training.json para economizar

### Melhorar Respostas
- Edit `Gemini/config.js` para ajustar:
  - `temperature` (criatividade): 0.0 = exato, 1.0 = criativo)
  - `maxOutputTokens` (tamanho da resposta)

### Monitorar Uso
- Acesse **https://aistudio.google.com** → "API dashboard"
- Veja quantas requisições fez
- Veja quanto gastou

---

## 🎉 Parabéns!

Seu Lhama AI 1 agora tem **superpoderes** com a API do Gemini! 🚀

### Próximos Passos:
1. Teste várias perguntas
2. Ajuste o training.json conforme necessário
3. Monitore o uso da API
4. Curta as respostas criativas! 🤖✨

---

## 📞 Precisa de Ajuda?

Se algo não funcionar:
1. Verifique o console (F12) para ver erros
2. Leia a seção "Solução de Problemas" acima
3. Tente fazer um novo deploy no Vercel

---

**Desenvolvido com 💖 para o Lhama AI 1**
