# Configuração da Busca Web com Tavily API

## 📋 Descrição

A funcionalidade de busca web permite que o Lhama AI 1 pesquise informações na internet em tempo real usando a API Tavily, proporcionando respostas atualizadas e baseadas em fontes confiáveis.

## 🔧 Configuração

### 1. Obter Chave da API Tavily

1. Acesse [https://tavily.com](https://tavily.com)
2. Crie uma conta gratuita
3. Vá para o dashboard e copie sua API key

### 2. Configurar Variável de Ambiente na Vercel

Na sua hospedagem Vercel, adicione a seguinte variável de ambiente:

```
TAVILY_API_KEY=sua_chave_api_aqui
```

**Importante:** Use exatamente `TAVILY_API_KEY` como nome da variável.

### 3. Deploy

Após configurar a variável de ambiente, faça o deploy do seu projeto na Vercel.

## 🚀 Como Usar

1. No chat do Lhama AI 1, clique no botão **"Busca Web"**
2. O botão ficará azul com o texto **"Busca Web ON"**
3. Digite o que você quer pesquisar na web
4. A IA irá:
   - Buscar informações na web usando Tavily
   - Analisar os resultados
   - Gerar uma resposta completa e detalhada usando as informações encontradas

## 📝️ Exemplos de Uso

- "Qual a previsão do tempo para São Paulo hoje?"
- "Quem ganhou o último prêmio Nobel?"
- "Novidades sobre inteligência artificial esta semana"
- "Como funciona a tecnologia 5G?"

## 🔄 Fluxo de Funcionamento

1. **Usuário ativa modo Busca Web** e digita uma pergunta
2. **Tavily API** busca informações relevantes na web
3. **Groq API** analisa os resultados e gera uma resposta personalizada
4. **Resposta final** é exibida com fontes e informações detalhadas

## 🛠️ Estrutura dos Arquivos

- `api/tavily-search.js` - Proxy serverless para a API Tavily
- `conversa.html` - Interface com botão de busca web
- `conversa.js` - Lógica de busca e integração

## 🔒 Segurança

- A chave da API é armazenada apenas no servidor (variáveis de ambiente)
- O frontend nunca tem acesso direto à chave
- Todas as requisições passam pelo proxy seguro

## 📊 Limites da API

A conta gratuita da Tavily inclui:
- 1.000 buscas/mês
- Até 5 resultados por busca
- Busca básica (não inclui conteúdo bruto)

Para mais informações, visite [tavily.com/pricing](https://tavily.com/pricing)

## 🐛 Troubleshooting

### Erro: "Chave da API Tavily não configurada"
- Verifique se a variável `TAVILY_API_KEY` foi configurada na Vercel
- Confirme se não há espaços ou caracteres extras

### Erro: "Muitas requisições"
- Aguarde alguns segundos antes de fazer novas buscas
- Verifique seu limite mensal na Tavily

### Busca não retorna resultados
- Tente usar termos mais específicos
- Verifique a ortografia das palavras
- Use termos em português ou inglês

## 🎯 Benefícios

- ✅ Informações em tempo real
- ✅ Fontes confiáveis e atualizadas
- ✅ Respostas enriquecidas com dados da web
- ✅ Integração perfeita com as personalidades da IA
- ✅ Interface intuitiva e fácil de usar
