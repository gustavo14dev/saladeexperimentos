# saladeexperimentos
Um site de projetos incríveis

---

## Desativar o anúncio da Dora AI

Se desejar impedir que o card de anúncio da **Dora AI** apareça, há duas formas simples:

- Pelo navegador (recomendado): abra o console do DevTools e execute:

  ```js
  localStorage.setItem('dora_announced', '1')
  // Para reativar, rode: localStorage.removeItem('dora_announced')
  ```

- Pelo código (alteração permanente): abra `Dora-AI/conversa.js` e comente/remova a chamada `mostrarAnuncio()` na inicialização, ou mantenha o código atual que usa a flag `dora_announced`.

