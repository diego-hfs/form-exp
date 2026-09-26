# 📦 ExpediCheck — Double Check de Expedição

Projeto de portfólio desenvolvido em **React + TypeScript** para demonstrar um fluxo digital de double check no processo de expedição logística.

A aplicação simula as etapas **Separador → Conferente → Líder → Fiscal**, permitindo registrar dados de veículo, destinatário, pedido e produtos, comparar o físico com o previsto e controlar divergências antes da liberação da expedição.

> Todos os nomes, pedidos, veículos, destinatários, produtos e demais dados utilizados na demonstração são fictícios.

## 🎯 Objetivo

Criar uma barreira adicional de qualidade no outbound para reduzir erros de expedição, melhorar a rastreabilidade e identificar divergências antes que a carga deixe a operação.

O projeto também demonstra a aplicação de práticas de Engenharia de Software em um cenário inspirado em processos logísticos reais, mantendo a versão pública independente de sistemas corporativos, credenciais e serviços externos.

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

Realiza o double check e compara informações como código, descrição, lote, datas, embalagem, pallets e quantidade.

### Líder

Analisa o resultado da conferência e decide pela liberação ou bloqueio operacional quando existem divergências.

### Fiscal

Realiza a validação final e registra a decisão da expedição.

## 🧪 Modo demonstração

A versão pública funciona **sem banco externo, sem credenciais e sem serviços corporativos**.

Os dados da demonstração são persistidos apenas no `localStorage` do navegador. Ao entrar no modo demo, o usuário pode acessar os quatro perfis e percorrer o fluxo operacional.

O botão **Restaurar dados de exemplo** recria os cenários fictícios utilizados para demonstração.

## 🚚 Informações representadas

A demonstração contempla informações como:

- embarque e pedido;
- destinatário e destino;
- veículo, placa, motorista e doca;
- código e descrição do produto;
- lote, fabricação e validade;
- embalagem e pallets;
- quantidade prevista e conferida;
- divergências e status da etapa;
- decisão de liberação ou bloqueio.

## 🔐 Segurança e independência

A versão pública foi preparada especificamente para portfólio:

- sem Lovable / `lovable-tagger`;
- sem referências ao GPT Engineer;
- sem identidade ou logotipos corporativos;
- sem usuário master hard-coded;
- sem chaves privadas ou `service_role`;
- sem Supabase obrigatório;
- sem dados pessoais ou operacionais reais;
- sem dependência de ambiente corporativo.

## 🛠️ Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI / componentes no estilo shadcn/ui
- TanStack React Query
- React Router
- Vitest
- jsPDF / AutoTable
- Docker / Docker Compose
- Chromium + Xvfb + noVNC para visualização opcional em desktop virtual

## ▶️ Executar com Docker

Não é necessário instalar Node.js localmente.

### Aplicação web

```bash
docker compose up --build app
```

Acesse:

```text
http://localhost:8080
```

### Fluxo inicial

1. Entre no **modo demonstração**.
2. Escolha um dos perfis: **Separador, Conferente, Líder ou Fiscal**.
3. Percorra as etapas utilizando os dados fictícios locais.
4. Use **Restaurar dados de exemplo** quando quiser reiniciar os cenários.

## 🖥️ Visualização opcional via noVNC

O projeto também possui uma opção de desktop virtual Dockerizado:

```bash
docker compose up --build visual
```

Acesse:

```text
http://localhost:6080/vnc.html?autoconnect=1&resize=scale
```

O noVNC serve apenas para disponibilizar a aplicação em um ambiente gráfico virtual com Chromium.

**Este projeto não utiliza PyAutoGUI e não é um projeto de automação de cliques.**

## 🧪 Testes e build

Os comandos abaixo também podem ser executados em container:

```bash
docker run --rm -v "$PWD:/app" -w /app node:22 npm install
docker run --rm -v "$PWD:/app" -w /app node:22 npm test
docker run --rm -v "$PWD:/app" -w /app node:22 npm run build
```

No PowerShell, utilize `${PWD}` ou o caminho absoluto da pasta conforme a configuração do Docker Desktop.

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

## 📌 Status do projeto

| Componente | Status |
|---|---|
| Desvinculação do Lovable | ✅ Concluída |
| Remoção do Supabase obrigatório | ✅ Concluída |
| Identidade fictícia ExpediCheck | ✅ Concluída |
| Dados fictícios locais | ✅ Implementado |
| Persistência em `localStorage` | ✅ Implementado |
| Fluxo Separador → Conferente → Líder → Fiscal | ✅ Implementado |
| Dados de veículo / destinatário / pedido | ✅ Implementado |
| Aplicação React/Vite via Docker | ✅ Validado |
| Entrada no modo demonstração | ✅ Validado |
| Seleção dos quatro perfis | ✅ Validado |
| noVNC manual | 🧪 Disponível para validação opcional |
| Backend / banco de dados real | ⏳ Evolução futura |

## 🔮 Evoluções futuras

- integração com WMS/ERP via API;
- persistência em banco de dados;
- autenticação corporativa;
- leitura de código de barras ou QR Code;
- trilha de auditoria;
- dashboards de divergência e acuracidade;
- motivos padronizados de bloqueio;
- anexos e fotos de ocorrências;
- testes automatizados adicionais.

## 👨‍💻 Autor

**Diego Hernando Ferreira da Silva**

Projeto de portfólio que conecta experiência em **Logística, Supply Chain e WMS** com práticas de **Engenharia de Software**.
