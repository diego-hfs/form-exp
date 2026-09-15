📦 Double Check de Expedição

Sistema web desenvolvido para apoiar o processo de conferência de mercadorias na expedição, criando uma segunda camada de validação entre o material físico movimentado pela operação e as informações registradas no sistema.

O projeto nasceu a partir de uma necessidade comum em operações logísticas: reduzir divergências entre o estoque físico e o estoque sistêmico antes que a mercadoria deixe o Centro de Distribuição.

🎯 Objetivo

O principal objetivo da aplicação é permitir que a operação realize um Double Check das mercadorias durante a expedição.

A proposta é adicionar uma etapa de conferência antes da conclusão do processo, ajudando a identificar possíveis divergências entre aquilo que está fisicamente sendo expedido e aquilo que foi registrado no sistema.

Com isso, a solução busca contribuir para:

* redução de erros de expedição;
* maior acuracidade entre físico e sistêmico;
* prevenção de divergências antes do envio da mercadoria;
* maior rastreabilidade das conferências;
* padronização do processo operacional;
* redução de retrabalho;
* apoio à melhoria da qualidade do processo logístico.

🔄 Conceito do processo

O fluxo proposto é baseado em uma validação adicional da expedição:

Separação da mercadoria → Conferência → Double Check → Validação → Expedição

A ideia é que a mercadoria passe por uma segunda validação antes de deixar a operação.

Caso as informações estejam corretas, o processo pode seguir normalmente.

Caso exista alguma divergência, ela pode ser identificada antes da expedição, permitindo que a operação realize a análise e correção necessária.

💡 Problema de negócio

Em operações de armazenagem e distribuição, uma divergência entre o material físico e o registro sistêmico pode gerar diversos impactos, como:

* envio de produto incorreto;
* quantidade divergente;
* diferenças de estoque;
* retrabalho operacional;
* devoluções;
* reclamações de clientes;
* custos adicionais de transporte;
* necessidade de ajustes sistêmicos.

Identificar o problema antes da saída da mercadoria tende a ser mais eficiente do que realizar a correção depois que o produto já foi expedido.

Por isso, o projeto utiliza o conceito de Double Check como uma barreira adicional de qualidade dentro do processo de Outbound.

🖥️ Solução

A aplicação foi desenvolvida como uma interface web para apoiar a operação durante o processo de conferência.

O sistema busca transformar uma etapa operacional de validação em um processo digital, estruturado e rastreável.

Além do desenvolvimento técnico, o projeto foi pensado a partir de uma visão de processo logístico, conectando conceitos de Supply Chain, Expedição, Sistemas e Engenharia de Software.

🛠️ Tecnologias utilizadas

Front-end

* React
* TypeScript
* Vite
* Tailwind CSS
* Radix UI
* React Hook Form
* Zod
* TanStack React Query

Back-end / Banco de Dados

* Supabase

Relatórios e visualização

* jsPDF
* jsPDF AutoTable
* Recharts

Qualidade e testes

* ESLint
* Vitest
* Testing Library

🏗️ Arquitetura

O projeto utiliza uma arquitetura web baseada em componentes React.

De forma simplificada:

┌─────────────────────────┐
│      Operação           │
│ Conferência / Expedição │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      Aplicação Web      │
│   React + TypeScript    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│        Supabase         │
│ Backend / Persistência  │
└─────────────────────────┘

Essa estrutura permite separar a interface utilizada pela operação da camada responsável pelo armazenamento e gerenciamento dos dados.

🚀 Executando o projeto localmente

Pré-requisitos

Tenha instalado:

* Node.js
* npm
* Git

Clone o repositório

git clone https://github.com/diego-hfs/form-exp.git

Entre no diretório

cd form-exp

Instale as dependências

npm install

Execute o ambiente de desenvolvimento

npm run dev

Executar testes

npm test

Gerar versão de produção

npm run build

📊 Visão de negócio

Mais do que desenvolver uma aplicação, este projeto procura demonstrar como a tecnologia pode ser utilizada para resolver um problema real de uma operação logística.

O conceito pode ser aplicado em ambientes como:

* Centros de Distribuição;
* armazéns;
* indústrias;
* operadores logísticos;
* e-commerce;
* operações de fulfillment;
* operações integradas a WMS e ERP.

Uma possível evolução seria integrar diretamente a aplicação com sistemas corporativos, permitindo comparar automaticamente as informações conferidas fisicamente com os registros existentes em um WMS ou ERP.

🔮 Possíveis evoluções

Entre as evoluções possíveis para o projeto estão:

* integração com WMS/ERP via API;
* leitura de código de barras ou QR Code;
* validação automática entre físico e sistêmico;
* registro de divergências;
* trilha de auditoria das conferências;
* dashboards com indicadores de acuracidade;
* indicadores de divergência por produto ou operação;
* identificação do usuário responsável pela conferência;
* relatórios gerenciais;
* alertas para divergências críticas.

📚 Conceitos aplicados

O projeto envolve conhecimentos de diferentes áreas:

Logística

* Expedição / Outbound
* Conferência
* Acuracidade de estoque
* Controle operacional
* Prevenção de divergências

Tecnologia

* Desenvolvimento Web
* Front-end
* Banco de Dados
* Validação de dados
* Testes de Software
* Integração de Sistemas

Negócio

* Melhoria de processos
* Redução de erros
* Rastreabilidade
* Padronização operacional
* Transformação digital

👨‍💻 Autor

Diego Hernando Ferreira da Silva

Profissional com experiência em Logística, Supply Chain, WMS, Dados e Tecnologia, desenvolvendo soluções voltadas à melhoria de processos e à integração entre operação e sistemas.

Este projeto faz parte do meu processo de desenvolvimento em Engenharia de Software, aplicando tecnologia a problemas reais encontrados em operações logísticas.

Bash

git clone https://github.com/diego-hfs/form-exp.git
cd form-exp
npm install
npm run dev
