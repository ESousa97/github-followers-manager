# GitHub Followers Manager

Uma aplicação web simples para gerenciar seus seguidores no GitHub.

## 🚀 Funcionalidades

- ✅ Verificar quem te segue no GitHub
- ✅ Verificar quem você está seguindo
- ✅ Identificar quem você segue mas não te segue de volta
- ✅ Identificar quem te segue mas você não segue de volta
- ✅ Deixar de seguir usuários que não te seguem de volta (requer token)
- ✅ Seguir de volta usuários que te seguem (requer token)

## 📋 Como usar

1. **Abra o arquivo `index.html` no navegador**
   - Basta dar duplo clique no arquivo ou arrastar para o navegador

2. **Digite seu usuário do GitHub**
   - Exemplo: `octocat`

3. **(Opcional) Adicione um token de acesso**
   - Necessário apenas se você quiser deixar de seguir usuários
   - Crie um token em: https://github.com/settings/tokens
   - Selecione a permissão: `user:follow`

4. **Clique em "Verificar"**
   - A aplicação irá buscar seus seguidores e quem você segue
   - Mostrará quem não te segue de volta

5. **Deixar de seguir (opcional)**
   - Se você forneceu um token, poderá clicar no botão "Deixar de seguir" para cada usuário

## 🔐 Segurança

- O token de acesso é usado apenas no seu navegador
- Nenhum dado é enviado para servidores externos (exceto a API do GitHub)
- O token não é armazenado permanentemente

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- GitHub REST API v3

## 📝 Notas

- A API do GitHub tem limite de requisições (60 por hora sem token, 5000 com token)
- Se você tiver muitos seguidores/seguindo, pode demorar alguns segundos para carregar
- É recomendado usar um token para evitar limitações da API

## 🎨 Features

- Interface moderna e responsiva
- Animações suaves
- Design gradiente atrativo
- Feedback visual para todas as ações
- Totalmente em português

---

Desenvolvido com ❤️ para facilitar o gerenciamento de followers no GitHub
