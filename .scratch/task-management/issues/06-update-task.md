# 06: Fatia Vertical de Atualização Parcial Semântica (PATCH /tasks/:id)

**What to build:** A capacidade ponta a ponta de atualizar parcialmente atributos de uma tarefa existente através do endpoint `PATCH /tasks/:id`. O cliente pode enviar qualquer combinação de `title`, `description` e `status`. A entidade de domínio valida as invariantes dos campos alterados e atualiza o timestamp `updatedAt`. Enviar `null` em `description` limpa o texto opcional. Se a requisição não alterar nenhum campo (payload vazio ou com os mesmos valores), o caso de uso executa um *no-op* otimizado sem disparar query de update no banco.

**Blocked by:** 04: Fatia Vertical de Consulta de Tarefa por ID (GET /tasks/:id)

**Status:** completed

## Acceptance Criteria

- [x] Método de negócio `update(params)` na entidade `Task` que aplica alterações, revalida as regras (título entre 3 e 100 caracteres, descrição até 2000 caracteres, status válido) e renova `updatedAt = new Date()`.
- [x] Extensão do `TaskRepository` com o método abstrato `update(task: Task): Promise<Task>`.
- [x] DTO de entrada `UpdateTaskDto` com todos os campos opcionais e validações semânticas.
- [x] Caso de uso `UpdateTaskUseCase` que:
  - Recupera a tarefa ativa via repositório (lança 404 `TASK_NOT_FOUND` se inexistente ou soft-deletada).
  - Detecta se houve mudança real de estado (otimização *no-op* se nenhum campo mudou).
  - Aplica as mutações no domínio, persiste e retorna a tarefa atualizada.
- [x] Rota `PATCH /tasks/:id` retornando HTTP 200 com a tarefa atualizada.
- [x] Testes cobrindo:
  - Atualização com sucesso de campos individuais e combinados.
  - Envio de `null` para limpar a descrição.
  - Otimização *no-op* (não chama o update do repositório se os valores forem iguais).
  - Tentativa de atualizar tarefa inexistente ou excluída (HTTP 404).
  - Validação de formato UUID e dados inválidos (HTTP 400).

