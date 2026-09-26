# Refatoração — ExpediCheck

Esta versão foi preparada para transformar o antigo `form-exp` em um projeto público de portfólio, independente do Lovable e sem dados corporativos.

## Alterações principais

- Lovable / `lovable-tagger` removidos.
- Referências a GPT Engineer removidas.
- Identidade Nitro e imagens corporativas removidas.
- Nome demonstrativo adotado: **ExpediCheck**.
- Supabase e função `create-master-user` removidos da versão pública.
- Migrations antigas e dados pessoais removidos.
- Autenticação substituída por modo demonstração local.
- Persistência feita em `localStorage`.
- Dados fictícios adicionados para diferentes etapas do fluxo.
- Fluxo mantido: Separador → Conferente → Líder → Fiscal.
- Formulário do Separador ampliado com pedido, destinatário, destino, veículo, motorista e doca.
- Docker para a aplicação web adicionado.
- Visualização opcional via Chromium + Xvfb + noVNC adicionada, sem PyAutoGUI.
- README atualizado.
- `.gitattributes` e `.dockerignore` adicionados.

## Validação realizada nesta preparação

- Sintaxe TypeScript/TSX verificada por transpile.
- Sintaxe do shell `docker/start-visual.sh` verificada.
- `package.json` validado como JSON.
- Busca por referências antigas sensíveis executada.

## Próxima validação local

Executar primeiro:

```powershell
docker compose up --build app
```

Abrir:

```text
http://localhost:8080
```

Depois validar o fluxo manualmente.

A visualização via noVNC pode ser testada depois com:

```powershell
docker compose up --build visual
```

e:

```text
http://localhost:6080/vnc.html?autoconnect=1&resize=scale
```

> O `package-lock.json` antigo foi removido porque estava inconsistente com o `package.json`. Após o primeiro `npm install` bem-sucedido, ele pode ser regenerado e versionado novamente.
