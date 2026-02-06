# Teste Local da API de Busca Web

## 🚨 Problema Identificado

O erro 404 indica que o endpoint `/api/tavily-search` não está sendo encontrado. Isso pode acontecer porque:

1. A pasta `api` não está na raiz correta do projeto
2. O servidor local não está configurado para funções serverless
3. As rotas não estão sendo reconhecidas

## ✅ Soluções

### Opção 1: Testar no Servidor de Desenvolvimento

1. Instale o Vercel CLI:
```bash
npm i -g vercel
```

2. Na pasta do projeto:
```bash
cd Lhama-AI
vercel dev
```

3. Teste o endpoint:
```bash
curl http://localhost:3000/api/test
```

### Opção 2: Testar Apenas a Lógica (Sem API)

Para testar a funcionalidade sem depender do servidor, modifique temporariamente a função `buscarNaWeb`:

```javascript
async function buscarNaWeb(query) {
    console.log('[BUSCA WEB] Buscando na web:', query);
    
    // Simulação para teste
    if (query.toLowerCase().includes('lula')) {
        return `🔍 **Resultado da busca para "${query}"**

Luiz Inácio Lula da Silva é o atual presidente do Brasil, eleito em 2022 para o mandato 2023-2026. Nascido em 27 de outubro de 1945 em Caetés, Pernambuco, Lula já foi presidente anteriormente (2003-2010) e é fundador do Partido dos Trabalhadores (PT).

**Fontes:**
1. [Governo Federal](https://www.gov.br)
2. [Wikipedia](https://pt.wikipedia.org/wiki/Luiz_In%C3%A1cio_Lula_da_Silva)
3. [BBC Brasil](https://www.bbc.com/portuguese)`;
    }
    
    return `🔍 **Resultado da busca para "${query}"**

Esta é uma resposta de teste. A funcionalidade completa estará disponível após configurar a API Tavily e fazer o deploy na Vercel.

**Fontes:**
1. [Fonte de teste 1](https://exemplo.com)
2. [Fonte de teste 2](https://exemplo.com)`;
}
```

### Opção 3: Deploy Direto na Vercel

1. Configure a variável de ambiente `TAVILY_API_KEY` no dashboard da Vercel
2. Faça o deploy do projeto
3. Teste a funcionalidade no ambiente de produção

## 🔧 Verificação de Arquivos

Verifique se os seguintes arquivos existem na estrutura correta:

```
Lhama-AI/
├── api/
│   ├── tavily-search.js    ✅
│   └── test.js            ✅
├── conversa.html          ✅
├── conversa.js            ✅
└── vercel.json           ✅
```

## 🌐 Teste de Conectividade

Após fazer o deploy, teste os endpoints:

1. **Teste básico:**
   ```
   https://seu-projeto.vercel.app/api/test
   ```

2. **Teste da API Tavily:**
   ```
   https://seu-projeto.vercel.app/api/tavily-search
   ```

## 📝 Próximos Passos

1. Faça o deploy na Vercel
2. Configure a variável `TAVILY_API_KEY`
3. Teste a funcionalidade de busca web
4. Se funcionar, remova o arquivo de teste
5. Aproveite a busca web em tempo real!
