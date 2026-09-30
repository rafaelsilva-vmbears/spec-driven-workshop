# US-002 – Listar tarefas com paginação

**Como** Cliente da API  
**Eu quero** listar tarefas ativas de forma paginada  
**Para** visualizar o catálogo de forma organizada, com paginação previsível e alta performance.

## Critérios de Aceitação

1. Deve existir o endpoint `GET /tasks` protegido por API Key.
2. O endpoint deve aceitar parâmetros de query para paginação:
   - `page`: número inteiro 0-based, opcional, default 0, mínimo 0.
   - `pageSize`: número inteiro, opcional, default 10, mínimo 1, máximo 100.
3. A consulta deve considerar **exclusivamente tarefas ativas** (`deletedAt IS NULL`). O filtro fica no port (`TaskRepository.findActivePage`).
4. A ordenação é fixa e determinística: `createdAt DESC, id DESC` (mais recentes primeiro, com desempate estável).
5. A contagem total (`total`) e a página de registros (`items`) são duas queries executadas **em paralelo** (`Promise.all`). Uma divergência momentânea entre `total` e `items` sob escrita concorrente é aceita.
6. A resposta deve retornar HTTP 200 OK com o contrato:
   ```json
   {
     "items": [
       {
         "id": "uuid",
         "title": "Minha Tarefa",
         "description": "Detalhes",
         "status": "PENDING",
         "createdAt": "2026-09-20T19:00:00.000Z",
         "updatedAt": "2026-09-20T19:00:00.000Z"
       }
     ],
     "total": 42,
     "page": 0,
     "pageSize": 10
   }
   ```
7. Parâmetros de query inválidos (ex.: `page < 0` ou `pageSize > 100`) ou desconhecidos devem retornar HTTP 400 Bad Request com `code: "VALIDATION_ERROR"`.
8. Página além do fim retorna HTTP 200 com `items: []` e o `total` real.

## Notas de Negócio

- Não há isolamento por cliente no MVP: todas as tarefas ativas do ambiente são visíveis ([ADR-0001](../../docs/adr/0001-chave-de-api-global-sem-multi-tenancy.md)).
- Tarefas removidas nunca são retornadas nem contabilizadas no `total` ([ADR-0003](../../docs/adr/0003-remocao-logica-invisivel-com-404.md)).
