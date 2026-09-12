# 05: Fatia Vertical de Listagem Paginada (GET /tasks)

**What to build:** A capacidade ponta a ponta de listar tarefas cadastradas de forma eficiente através do endpoint `GET /tasks`, com paginação zero-based (`page` e `pageSize`), contagem atômica de registros no banco de dados e exclusão automática de itens marcados como soft-deletados. A resposta retorna a coleção de tarefas junto com metadados de paginação `{ items, total, page, pageSize }`.

**Blocked by:** 03: Fatia Vertical de Criação de Tarefa (POST /tasks)

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] Definir o contrato `FindAllTasksParams` (`page`, `pageSize`) e o tipo de retorno paginado `PaginatedResult<Task>` no domínio.
- [ ] Extensão do contrato `TaskRepository` com o método abstrato `findAll(params: FindAllTasksParams): Promise<PaginatedResult<Task>>`.
- [ ] Implementação da query no Drizzle ORM combinando busca paginada (`limit` e `offset`) e agregação de contagem total (`count()`), aplicando o filtro `deleted_at IS NULL`.
- [ ] DTO de query `ListTasksQueryDto` no controller com conversão numérica (`@Type(() => Number)`), defaults defensivos (`page = 0`, `pageSize = 10`) e limite máximo de 100 itens por página.
- [ ] Caso de uso `ListTasksUseCase` orquestrando a listagem paginada.
- [ ] Rota `GET /tasks` retornando HTTP 200 com a estrutura `{ items, total, page, pageSize }`.
- [ ] Testes cobrindo:
  - Listagem padrão com parâmetros default.
  - Paginação com customização de página e tamanho.
  - Validação de rejeição caso `page < 0` ou `pageSize > 100` (HTTP 400).
