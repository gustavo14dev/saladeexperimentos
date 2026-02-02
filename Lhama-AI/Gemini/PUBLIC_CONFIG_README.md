⚠️ ATENÇÃO: Uso de Chaves em Frontend (Public Config)

Este arquivo documenta o uso de `public-config.js` (embutir chaves em JS via `window`) e as medidas de mitigação.

Quando usar
- Ambiente fechado e controlado (apenas você e alguns amigos).
- Testes locais e demonstrações rápidas onde risco é aceitável.

Como usar
1. Edite `Gemini/public-config.js` e coloque suas chaves:

```js
window.GEMINI_API_KEY = 'SUA_CHAVE_GEMINI_AQUI';
window.MISTRAL_API_KEY = 'SUA_CHAVE_MISTRAL_AQUI';
window.GROQ_API_KEY = 'SUA_CHAVE_GROQ_AQUI';
```

2. O arquivo já está referenciado em `conversa.html` antes de `Gemini/config.js` para que `api-init.js` encontre as chaves automaticamente e as armazene em `sessionStorage`.

Riscos e mitigação (importante)
- Qualquer usuário com acesso ao site ou ao código pode ver e usar as chaves.
- Recomendado restringir as chaves nos provedores (por exemplo: HTTP referrers, domínios permitidos, quotas limitadas).
- Crie chaves de uso restrito, com quotas baixas e revogue/rotacione regularmente.
- Nunca use chaves administrativas ou com privilégios altos expostas publicamente.

Boa prática alternativa (recomendada)
- Para produção e deploy público, use `process.env` no Vercel e a Vercel Function `/api/config` para NÃO retornar valores sensíveis (somente `hasKey: true`).

Se precisar, eu posso também:
- Adicionar validação extra no frontend para recusar chaves sem restrição de referrer;
- Gerar um script que obfusca a chave em build (nota: isso NÃO é seguro, apenas retarda acesso).

