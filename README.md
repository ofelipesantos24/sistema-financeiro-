# 📒 Livro Caixa — Controle Financeiro Pessoal

Um controle financeiro pessoal simples, rápido e sem cadastro — no estilo de um livro caixa. Rode direto no navegador, sem backend, sem conta, sem enviar seus dados pra lugar nenhum.

**[👉 https://ofelipesantos24.github.io/sistema-financeiro-/

## Funcionalidades

- Lançamento rápido de entradas e saídas, com categoria e data
- Resumo do mês: total de entradas, saídas e saldo
- "Carimbo" de saldo geral sempre visível
- Filtro por mês, categoria, tipo e busca por descrição
- Gráfico de saídas por categoria
- Exportar e importar backup em `.json`
- Tudo salvo no `localStorage` do seu navegador — nenhum dado sai da sua máquina

## Como usar

Basta abrir o `index.html` no navegador. Não precisa de instalação, servidor ou build.

```bash
git clone https://github.com/SEU-USUARIO/controle-financeiro.git
cd controle-financeiro
open index.html   # ou apenas dê duplo clique no arquivo
```

## Publicando no GitHub

Se você ainda não tem este projeto no GitHub, os comandos abaixo criam o repositório e sobem tudo:

```bash
cd controle-financeiro
git init
git add .
git commit -m "Primeira versão do controle financeiro"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/controle-financeiro.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário do GitHub. Se o repositório ainda não existe lá, crie-o primeiro em github.com (sem README, sem `.gitignore` — para não conflitar com o que já está aqui) e só depois rode o `git push`.

## Colocando no ar com GitHub Pages (grátis)

1. No repositório, vá em **Settings → Pages**.
2. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
3. Clique em **Save**. Em alguns minutos o site estará em `https://SEU-USUARIO.github.io/controle-financeiro/`.

## Estrutura

```
controle-financeiro/
├── index.html      # estrutura da página
├── style.css        # visual (tema "livro caixa")
├── script.js         # lógica: lançamentos, filtros, gráfico, backup
├── README.md
├── LICENSE
└── .gitignore
```

## Sobre os dados

Este projeto **não tem backend**. Todos os lançamentos ficam salvos no `localStorage` do navegador em que você está usando o app. Isso significa:

- Se você limpar os dados do navegador, os lançamentos somem — por isso existe o botão **Exportar backup**.
- Os dados não sincronizam entre dispositivos ou navegadores diferentes.
- Ninguém além de você tem acesso a essas informações.

## Licença

MIT — use, modifique e distribua à vontade. Veja [LICENSE](LICENSE).
