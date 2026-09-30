# US-001 – Criar tarefa

**Como** Cliente da API  
**Eu quero** criar uma tarefa informando título e descrição opcional  
**Para** registrar atividades que preciso executar e acompanhar seu ciclo de vida.

## Critérios de Aceitação

1. Deve existir o endpoint `POST /tasks` protegido por API Key.
2. O corpo da requisição (`CreateTaskDto`) deve ser validado:
   - `title`: obrigatório, string de 3 a 100 caracteres **após `trim`**.
   - `description`: opcional, string de no máximo 2000 caracteres após `trim`. Vazia ou só espaços é normalizada para `null`.
3. O status inicial de qualquer nova tarefa é SEMPRE `PENDING`. Qualquer campo fora de `title`/`description`, incluindo `status`, resulta em HTTP 400 `VALIDATION_ERROR` (`ValidationPipe` com `whitelist` + `forbidNonWhitelisted`).
4. O modelo rico de domínio (`Task`) é criado por factory e valida suas próprias invariantes na criação ([ADR-0002](../../docs/adr/0002-modelo-de-dominio-rico.md)):
   - `id` gerado pelo domínio como UUID v4 aleatório (`crypto.randomUUID()`).
   - Timestamps `createdAt` e `updatedAt` gerados pelo domínio em UTC, com o mesmo valor na criação.
   - `deletedAt` inicializado como `null`.
   - Violação de invariante lança `InvalidTaskException` (`DomainException`) → HTTP 400 `VALIDATION_ERROR`.
5. Em caso de sucesso, retornar HTTP 201 Created com o payload da tarefa:
   - `id`, `title`, `description` (`null` quando ausente), `status`, `createdAt`, `updatedAt`.
6. Em caso de payload inválido, retornar HTTP 400 Bad Request com `code: "VALIDATION_ERROR"` e `details` no formato `[{ field, message }]`.
7. Persistência via Drizzle ORM, desacoplada do domínio pela classe abstrata `TaskRepository` (`create(task)`).

## Notas de Negócio

- A criação de tarefas é a base do sistema. Deve ser simples, previsível e sem acoplamento a frameworks na camada de domínio.
- Status permitidos no domínio: `PENDING` (Pendente), `IN_PROGRESS` (Em andamento) e `COMPLETED` (Concluída). Veja `CONTEXT.md`.
- Testes unitários da entidade controlam o relógio com `vi.useFakeTimers()`. O id é verificado pelo formato UUID v4, não por valor fixo.
