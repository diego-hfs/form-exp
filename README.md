# 📦 ExpediCheck — Double Check de Expedição

Projeto de portfólio desenvolvido em **React + TypeScript** para demonstrar um fluxo digital de double check no processo de expedição logística.

A aplicação simula as etapas **Separador → Conferente → Líder → Fiscal**, permitindo registrar dados de veículo, destinatário, pedido e produtos, comparar o físico com o previsto e controlar divergências antes da liberação da expedição.

> Todos os nomes, pedidos, veículos, destinatários, produtos e demais dados da demonstração são fictícios.

## 🎯 Objetivo

Criar uma barreira adicional de qualidade no outbound para reduzir erros de expedição, melhorar a rastreabilidade e identificar divergências antes que a carga deixe a operação.

## 🔄 Fluxo demonstrado

```text
Separador
   ↓
Conferente / Double Check
   ↓
Líder / análise de divergência
   ↓
Fiscal / validação final
   ↓
Expedição aprovada ou bloqueada
```

### Separador
Registra o embarque, pedido, destinatário, cidade/UF, veículo, motorista, doca e os itens separados.

### Conferente
Realiza o double check sem depender dos dados digitados pelo separador e compara código, descrição, lote, datas, embalagem, pallets e quantidade.

### Líder
Analisa o resultado da conferência e decide pela liberação ou bloqueio operacional.

### Fiscal
Faz a validação final e registra a decisão da expedição.

## 🧪 Modo demonstração

A versão pública funciona **sem banco externo, sem credenciais e sem serviços corporativos**. Os dados são persistidos apenas no `localStorage` do navegador.

Ao entrar, o usuário de demonstração possui acesso aos quatro perfis para percorrer o processo completo. O botão **Restaurar dados de exemplo** recria cenários em diferentes etapas do fluxo.

## 🔐 Segurança e independência

Esta versão pública foi preparada para portfólio:

- sem Lovable / `lovable-tagger`;
- sem referências ao GPT Engineer;
- sem identidade ou logotipos corporativos;
- sem usuário master hard-coded;
- sem chaves privadas ou `service_role`;
- sem Supabase obrigatório;
- sem dados pessoais ou operacionais reais.

## 🛠️ Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI / shadcn-style components
- TanStack React Query
- React Router
- Vitest
- jsPDF / AutoTable
- Docker / Docker Compose
- Chromium + Xvfb + noVNC (visualização opcional em desktop virtual)

## ▶️ Executar com Docker

Não é necessário instalar Node.js no Windows.

### Aplicação web

```bash
docker compose up --build app
```

Abra:

```text
http://localhost:8080
```

### Visualização opcional via noVNC

```bash
docker compose up --build visual
```

Abra:

```text
http://localhost:6080/vnc.html?autoconnect=1&resize=scale
```

O noVNC apenas disponibiliza a aplicação dentro de um desktop virtual Docker. **Não existe automação de cliques ou PyAutoGUI neste projeto.**

## 🧪 Testes e build

```bash
docker run --rm -v "$PWD:/app" -w /app node:22 npm install
docker run --rm -v "$PWD:/app" -w /app node:22 npm test
docker run --rm -v "$PWD:/app" -w /app node:22 npm run build
```

No PowerShell, use o caminho absoluto ou `${PWD}` conforme seu ambiente Docker Desktop.

## 📁 Estrutura principal

```text
src/
├── components/
├── hooks/
├── lib/
├── pages/
│   ├── SeparadorPage.tsx
│   ├── ConferentePage.tsx
│   ├── LiderPage.tsx
│   └── FiscalPage.tsx
├── services/
│   └── storage.ts
└── types/
    └── conferencia.ts

docker/
└── start-visual.sh

Dockerfile
Dockerfile.visual
docker-compose.yml
```

## 📌 Status

| Componente | Status |
|---|---|
| Desvinculação do Lovable | ✅ Concluída |
| Identidade fictícia | ✅ Concluída |
| Dados fictícios locais | ✅ Implementado |
| Fluxo Separador → Conferente → Líder → Fiscal | ✅ Mantido |
| Dados de veículo / destinatário / pedido | ✅ Implementado |
| Persistência demo em localStorage | ✅ Implementado |
| Docker web | 🧪 Pronto para validação local |
| noVNC manual | 🧪 Pronto para validação local |
| Integração com backend real | ⏳ Evolução futura |

## 🔮 Evoluções futuras

- integração com WMS/ERP via API;
- persistência em banco de dados;
- autenticação corporativa;
- leitura de código de barras/QR Code;
- trilha de auditoria;
- dashboards de divergência e acuracidade;
- observações e motivos padronizados de bloqueio;
- anexos/fotos da ocorrência.

## 👨‍💻 Autor

**Diego Hernando Ferreira da Silva**

Projeto de portfólio que conecta experiência em Logística, Supply Chain e WMS com práticas de Engenharia de Software.
