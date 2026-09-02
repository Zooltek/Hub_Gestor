# 📋 Especificação Técnica de Melhorias para o Backend (Hub API)

> **Destinatário:** Equipe de Engenharia de Backend (.NET / C# / MongoDB / Azure)  
> **Sistema:** Hub API (Hub Central de Produção)  
> **Objetivo:** Documentar as necessidades técnicas identificadas durante a auditoria e modernização do frontend **Hub Gestor**, visando escalabilidade, segurança, performance e consistência de dados.

---

## 1. 🛡️ Segurança & Autenticação

### 1.1 Emissão de Tokens JWT via Cookies `HttpOnly`

* **Situação Atual:**  
  O endpoint `/api/token` e `/api/admin/token` retorna o token JWT no corpo da resposta JSON (`{ token: "ey..." }`). Para autenticar requisições subsequentes, o frontend é forçado a armazenar o token em memória ou `sessionStorage`, enviando-o no header `Authorization: Bearer <token>`.
* **Risco:**  
  Qualquer script de terceiros ou vulnerabilidade de XSS pode, teoricamente, ler o token em memória/storage.
* **Alteração Necessária:**  
  Configurar o endpoint de autenticação para emitir o token em um cookie seguro gerenciado pelo browser:
  ```http
  Set-Cookie: hub_access_token=ey...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800
  ```
  - **`HttpOnly`**: Impede que o JavaScript do frontend acesse o token (proteção total contra roubo via XSS).
  - **`Secure`**: Força envio exclusivo via HTTPS.
  - **`SameSite=Strict` (ou `Lax`)**: Proteção nativa contra Cross-Site Request Forgery (CSRF).
* **Endpoints de Suporte:**
  - `POST /api/auth/refresh`: Renovação transparente de token via cookie de refresh token.
  - `POST /api/auth/logout`: Invalidação de cookie com `Max-Age=0`.

---

## 2. ⚡ Performance: Paginação Server-Side e Filtros Temporais

### 2.1 Paginação Server-Side em Pedidos e Catálogo

* **Situação Atual:**  
  - `/api/admin/orders/{customerId}/get-json` retorna um array bruto contendo todos os pedidos registrados de uma só vez.
  - `/api/admin/products/catalog` traz centenas de produtos em um único payload.
  - O frontend atualmente faz a paginação (10 itens por página) em memória. À medida que o cliente atinge milhares de pedidos, o payload ultrapassa dezenas de megabytes, causando lentidão no carregamento e alto consumo de banda.
* **Alteração Necessária:**  
  Implementar o padrão de resposta paginada com parâmetros na query string:
  ```
  GET /api/admin/orders/{customerId}?page=1&pageSize=20&status=1&channel=mercadolivre&search=12345
  ```
* **Contrato de Resposta Padronizado:**
  ```json
  {
    "items": [ /* Lista de pedidos da página */ ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 1542,
      "totalPages": 78,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
  ```

---

### 2.2 Filtros de Período Temporal na API de Pedidos

* **Situação Atual:**  
  O Dashboard possui filtros de período (Hoje, 7 dias, 15 dias, 30 dias, 90 dias, Ano). Atualmente, o frontend baixa os pedidos existentes e tenta calcular os intervalos localmente, o que distorce a evolução caso nem todo o histórico venha na chamada inicial.
* **Alteração Necessária:**  
  Adicionar suporte a datas na API de pedidos:
  ```
  GET /api/admin/orders/{customerId}?startDate=2026-08-01T00:00:00Z&endDate=2026-08-31T23:59:59Z
  ```
  - Adicionar índice composto no MongoDB para otimização de consulta:
    `{ customerId: 1, createdAt: -1 }`

---

## 3. 📦 Padronização de Contratos & Schemas (DTOs)

### 3.1 Eliminação de JSON Duplamente Serializado em `orderData`

* **Situação Atual:**  
  Na coleção de pedidos do MongoDB, o campo `orderData` frequentemente é gravado como uma **string contendo JSON escapado** (`"orderData": "{\"Order\":{\"Pedido\":\"123\"}}"`), enquanto em outros documentos já vem como **objeto nativo BSON/JSON**.
* **Problema:**  
  O frontend precisa implementar múltiplos blocos `try/catch` de `JSON.parse()` e lidar com payloads heterogêneos.
* **Alteração Necessária:**  
  - Gravar `orderData` sempre como subdocumento BSON/JSON tipado no MongoDB.
  - Criar uma rotina de migração/saneamento de dados legados no banco para descompactar strings serializadas.

---

### 3.2 Unificação de Nomenclatura (PascalCase vs camelCase e Idiomas)

* **Situação Atual:**  
  O payload de pedidos mistura convenções:
  - Campos em português e inglês no mesmo objeto: `Order.TotalPedido`, `Customer.Nome`, `itens.Descricao`, `product.sku`.
  - Produtos aninhados em estruturas imprevisíveis: às vezes `item.produto`, às vezes `item.Produto`, `item.product`, ou simplesmente os campos soltos na raiz do item.
* **Alteração Necessária:**  
  Definir um DTO C# explícito com serialização uniforme em `camelCase`:
  ```csharp
  public class OrderDto
  {
      public string Id { get; set; }
      public string MarketplaceOrderId { get; set; }
      public string Channel { get; set; }
      public string ChannelName { get; set; }
      public string CustomerName { get; set; }
      public string CustomerDocument { get; set; }
      public decimal TotalAmount { get; set; }
      public int StatusOrder { get; set; }
      public string ImportStatus { get; set; }
      public DateTime CreatedAtUtc { get; set; }
      public List<OrderItemDto> Items { get; set; }
  }

  public class OrderItemDto
  {
      public string Sku { get; set; }
      public string Reference { get; set; }
      public string Title { get; set; }
      public string Variation { get; set; }
      public string Color { get; set; }
      public string Size { get; set; }
      public int Quantity { get; set; }
      public decimal UnitPrice { get; set; }
      public decimal TotalPrice { get; set; }
  }
  ```

---

## 4. 🔄 Esteira de Produtos: Normalização de Status e Erros

### 4.1 Resolução de Falso Positivo de Erro em Lotes (`Status 0`)

* **Situação Identificada:**  
  No lote `20260825102022_Produtos.csv`, produtos sem divergência cadastral receberam status numérico `0` ("Sem alteração" / "Unchanged"). No entanto, a contagem de `errorItems` da importação contabilizava itens sem alteração ou campos de `dispatchFailed` residuais, fazendo com que o lote fosse exibido como "Erro" ou "Com Alertas" indevidamente.
* **Alteração Necessária:**  
  - No processamento do lote no backend:
    - `Status = 0`: **Sem alteração** (sucesso, nenhum envio necessário).
    - `Status = 1`: **Pendente** (novo ou modificado, aguardando aprovação).
    - `Status = 2`: **Aprovado**.
    - `Status = 6`: **Erro de validação**.
  - O cálculo do status geral do lote deve ser:
    ```csharp
    var hasErrors = batch.Items.Any(i => i.Status == 6);
    var isPending = batch.Items.Any(i => i.Status == 1 && i.RequiresReview);
    batch.Status = hasErrors ? BatchStatus.Erro : (isPending ? BatchStatus.Pendente : BatchStatus.Concluido);
    ```

---

## 5. 🔔 Notificações e Eventos em Tempo Real

### 5.1 Endpoint de Eventos em Tempo Real (SSE ou SignalR)

* **Situação Atual:**  
  O frontend precisa fazer polling (consultas repetidas a cada 30 segundos) para saber se um novo pedido chegou ou se um lote terminou de processar.
* **Alteração Necessária:**  
  Disponibilizar um Hub de notificações via **SignalR** ou **Server-Sent Events (SSE)**:
  - **Canal de Pedidos:** Dispara evento `{ type: "ORDER_RECEIVED", orderId: "..." }` quando uma venda entra via Webhook do Mercado Livre / Shopee / Shopify.
  - **Canal da Esteira:** Dispara evento `{ type: "BATCH_COMPLETED", batchId: "...", successCount: 150, errorCount: 0 }` ao concluir a validação de um arquivo CSV/ERP.
  - **Canal de Heartbeat / Locks:** Notifica operadores quando outro usuário assume o lock de um pedido.

---

## 6. 📊 Endpoint de Métricas Consolidadas (Otimização do Dashboard)

### 6.1 `GET /api/admin/metrics/dashboard`

* **Situação Atual:**  
  O frontend faz download da lista inteira de pedidos e de catálogo e calcula KPIs (Total de Vendas, Ticket Médio, Produtos Mais Vendidos e Participação de Canais) por meio de loops no cliente (`calculateSalesMetrics`).
* **Alteração Necessária:**  
  Criar um endpoint com agregação nativa no MongoDB (`$group`, `$sum`, `$sort`), retornando as métricas já consolidadas em milissegundos:
  ```
  GET /api/admin/metrics/dashboard?customerId={id}&period=7d
  ```
* **Exemplo de Resposta:**
  ```json
  {
    "revenue": { "current": 34520.80, "previous": 28310.00, "changePercent": 21.9 },
    "ordersCount": { "current": 142, "previous": 120, "changePercent": 18.3 },
    "averageTicket": { "current": 243.10, "previous": 235.90, "changePercent": 3.0 },
    "topProducts": [
      {
        "sku": "VEST-01",
        "title": "Vestido Midi Estampado",
        "unitsSold": 48,
        "revenue": 9600.00
      }
    ],
    "channelDistribution": [
      { "channel": "mercadolivre", "revenue": 18500.00, "sharePercent": 53.6 },
      { "channel": "shopify", "revenue": 16020.80, "sharePercent": 46.4 }
    ]
  }
  ```

---

## 7. 📑 Resumo dos Novos Endpoints Recomendados

| Método | Endpoint | Objetivo |
|---|---|---|
| `GET` | `/api/admin/orders/{customerId}` | Listagem de pedidos paginada, com filtros de data, status e canal |
| `GET` | `/api/admin/metrics/dashboard` | KPIs consolidados de vendas, top produtos e canais via agregação do banco |
| `POST` | `/api/auth/refresh` | Renovação segura de token JWT via cookie HttpOnly |
| `GET` | `/api/admin/notifications/stream` | Stream de eventos em tempo real (SSE) para pedidos e lotes |
| `GET` | `/api/admin/products/pipeline/imports/{id}/summary` | Resumo de status de lotes com contagem exata de pendentes vs sem alteração |
