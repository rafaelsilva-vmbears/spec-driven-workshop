# Task Management Domain Context

Glossário ubíquo e modelo de domínio da API de Gestão de Tarefas.

## Linguagem Ubíqua & Conceitos de Domínio

### Task (Tarefa)
A unidade atômica de trabalho gerenciada pelo sistema.
- **Identificador**: UUID v4 imutável (`id`).
- **Campos obrigatórios**: `title` (1 a 100 caracteres, não vazio), `status` (TaskStatus), `createdAt`, `updatedAt`.
- **Campos opcionais**: `description` (texto livre até 500 caracteres, pode ser `null` ou ausente).
- **Controle de exclusão**: `deletedAt` (data da exclusão lógica ou `null` se ativa).

### TaskStatus (Status da Tarefa)
Representa a fase do ciclo de vida da tarefa.
- `PENDING`: Tarefa criada e aguardando execução (estado padrão inicial).
- `IN_PROGRESS`: Tarefa em execução ativa.
- `COMPLETED`: Tarefa concluída com sucesso.

### Soft Delete (Exclusão Lógica)
Mecanismo de preservação de histórico onde tarefas excluídas não são removidas fisicamente da tabela `tasks`.
- Uma exclusão preenche `deletedAt = new Date()`.
- Consultas (`GET /tasks/:id`) e listagens (`GET /tasks`) ignoram tarefas onde `deletedAt IS NOT NULL`.
- Operações de mutação (`PATCH /tasks/:id` ou `DELETE /tasks/:id`) sobre uma tarefa já excluída disparam `TaskNotFoundException` (HTTP 404), garantindo interrupção de efeitos colaterais.

### ErrorResponse (Resposta Padronizada de Erro)
Contrato único de erro retornado pela API em falhas de validação, regras de negócio ou erros de infraestrutura:
```json
{
  "code": "TASK_NOT_FOUND",
  "message": "Task with id ... was not found",
  "details": {}
}
```

### ApiKeyAuth (Autenticação por API Key)
Mecanismo de segurança transversal onde todas as rotas exigem o envio do header `x-api-key` compatível com a variável `API_KEY` do ambiente.
- Rotas públicas (ex: documentação Swagger, health check) utilizam o decorator `@Public()`.
- Requisições sem chave ou com chave incorreta recebem HTTP 401 Unauthorized (`UNAUTHORIZED`).

### Pagination (Paginação)
Mecanismo de paginação 0-based para a listagem de tarefas:
- Query params: `page` (default: 0, min: 0) e `pageSize` (default: 10, min: 1, max: 100).
- Retorno: `{ items: Task[], total: number, page: number, pageSize: number }`.
