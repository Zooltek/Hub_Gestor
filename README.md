# Hub Gestor (Hub Gerencial)

> **Portal Gerencial e Operacional de E-commerce & Marketplaces para Lojistas e Gestores**  
> Desenvolvido para integração nativa com o ecossistema **Amura Hub**, ERPs em Nuvem e Marketplaces (Mercado Livre, Shopee, Amazon, Magalu).

---

## 🚀 Visão Geral

O **Hub Gestor** é uma aplicação web moderna voltada para clientes finais, permitindo o acompanhamento em tempo real de vendas, saúde de integrações, gestão de pedidos, esteira de processamento de lotes de produtos e edição de catálogo em lote.

Projetado com foco em **performance, responsividade total (Mobile/Desktop) e proteção contra concorrência simultânea** (mecanismo anti-colisão de edições).

---

## 🎯 Principais Módulos & Recursos

### 1. 📊 Dashboard de 4 Perguntas
O painel responde diretamente às perguntas estratégicas do lojista:
1. **Quanto estou vendendo?** — Faturamento total, pedidos, itens vendidos e ticket médio com comparativo percentual em relação ao período anterior.
2. **Como minhas vendas estão evoluindo?** — Gráfico histórico e comparativo com alternância entre faturamento e volume de pedidos, com filtros rápidos:
   - *Hoje (24h)*, *7 Dias*, *15 Dias*, *30 Dias*, *90 Dias*, *Ano Atual (YTD)*.
3. **Está tudo funcionando?** — Monitoramento de integridade da nuvem, latência de pings, taxa de sucesso de lotes em 24h e central de alertas com ação rápida.
4. **O que está se destacando?** — Produto campeão de vendas, ranking Top 5 e distribuição de faturamento por canal/marketplace com identificação do melhor dia e horário de pico.

---

### 2. 🔌 Conexão com ERPs Online (API REST Cloud)
- **API REST Customizada (Seu Próprio ERP)** como 1ª opção para integrações diretas via HTTPS/Bearer Token/Webhooks.
- Conectores para **Bling, Tiny, Omie e ContaAzul**.
- Botão **"Testar Conexão na Hora"** com validação de latência, autenticação e resposta da API em tempo real.

---

### 3. 📦 Gestão de Pedidos (`/pedidos`)
- Listagem detalhada com busca rápida, filtros por canal e status de venda/envio ao ERP.
- Modal de detalhes com duas abas:
  - **Formulário**: Edição de dados do comprador, endereço, itens e status.
  - **JSON Bruto**: Editor com validação de payload JSON.
- **Proteção Anti-Colisão de Concorrência**: Bloqueio de edição exclusivo com banner em tempo real e expiração automática por heartbeat caso outro usuário tente editar o mesmo pedido.

---

### 4. 🗂️ Lotes & Pipeline de Produtos (`/lotes-produtos`)
- Histórico completo de sincronizações enviadas pelo ERP.
- Detalhamento de lote (`/lotes-produtos/:batchId`) com:
  - Cards de resumo de alterações (Aprovadas, Pendentes, Rejeitadas).
  - Agrupamento de itens por SKU/Referência e variações.
  - Seleção múltipla com botão **Aprovar Selecionados** e **Forçar Despacho**.
  - Visualizador de Snapshot JSON do payload original.

---

### 5. 🏷️ Catálogo & Estoque (`/catalogo`)
- Tabela de catálogo com filtros de busca, categoria e alerta de pendências.
- **Edição em Massa**: Aplicação de reajuste percentual de preços em lote para múltiplos produtos selecionados.
- Modal de edição por produto (Preço de tabela, Preço promocional, Estoque e status por marketplace).

---

### 6. 📱 Responsividade Total
- **Desktop (>= 1024px)**: Menu lateral fixo com navegação ergonômica.
- **Mobile / Tablet (< 1024px)**: Menu gaveta (*Slide-out Drawer*) com backdrop, tabelas com rolagem horizontal suave e modais com altura adaptável.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript 5.8](https://www.typescriptlang.org/), [Vite 6](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/), Radix UI Primitives, Lucide Icons, Fonte Inter Variable
- **Gráficos & Visualização**: [Recharts](https://recharts.org/)
- **Gerenciamento de Estado & Requisições**: [TanStack Query v5](https://tanstack.com/query/latest), Axios com interceptors JWT
- **Validação & Notificações**: Zod, Sonner
- **Servidor Web & Deploy**: Nginx 1.27 Alpine, Docker Multi-stage Build, Aspire AppHost

---

## 📦 Estrutura do Projeto

```
Hub-Gerencial/
├── public/                 # Assets públicos
├── src/
│   ├── app/                # Layout, Router e Providers
│   │   ├── layout/         # AppShell e AppSidebar responsivo
│   │   ├── providers/      # AuthProvider e ThemeProvider
│   │   └── router.tsx      # Configuração de rotas da aplicação
│   ├── components/         # Componentes UI (Radix + Tailwind)
│   │   ├── shared/         # ConcurrencyBanner, AuthGuard, etc.
│   │   └── ui/             # Button, Card, Dialog, Table, Badge...
│   ├── features/           # Módulos organizados por feature
│   │   ├── auth/           # Login e autenticação por usuário/chave
│   │   ├── catalog/        # Catálogo, estoque e edição em massa
│   │   ├── dashboard/      # Dashboard e widgets das 4 perguntas
│   │   ├── erp-connections/# Conexão com ERPs e API REST
│   │   ├── health/         # Saúde e conexões
│   │   ├── orders/         # Pedidos e editor Form/JSON
│   │   ├── products-pipeline/# Lotes e esteira de produtos
│   │   └── team/           # Gestão de equipe e usuários
│   ├── hooks/              # Hooks customizados (ex: useConcurrencyLock)
│   ├── lib/                # Configuração de API (http.ts, hub-client.ts)
│   └── test/               # Testes unitários (Vitest)
├── Dockerfile              # Build multi-stage para produção
├── docker-compose.yml      # Execução rápida do container
├── nginx.default.conf      # Configuração SPA + Gzip + Cache
├── .env.production         # Variáveis de ambiente de produção
└── package.json            # Dependências e scripts
```

---

## 💻 Como Executar Localmente

### Pré-requisitos
- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (`corepack enable && pnpm --version`)

### 1. Clonar o repositório
```bash
git clone https://github.com/Zooltek/Hub_Gestor.git
cd Hub_Gestor
```

### 2. Instalar dependências
```bash
pnpm install
```

### 3. Iniciar o servidor de desenvolvimento
```bash
pnpm dev
```
Acesse no seu navegador: **[http://localhost:5174](http://localhost:5174)**

### 4. Executar testes e build
```bash
# Executar testes unitários
pnpm test

# Gerar bundle de produção
pnpm build
```

---

## 🐳 Executando com Docker

```bash
# Build e inicialização via Docker Compose
docker compose up -d

# Visualizar logs da aplicação
docker compose logs -f
```

---

## 🔒 Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_HUB_API_URL` | `/` | URL base do backend Hub API |
| `VITE_API_PROXY_TARGET` | `https://localhost:5000` | Alvo do proxy de desenvolvimento |
| `VITE_APP_TITLE` | `Hub Gestor \| Amura` | Título da aplicação |

---

## 📄 Licença

Este projeto é de propriedade privada e confidencial da **Amura / Zooltek**. Todos os direitos reservados.
