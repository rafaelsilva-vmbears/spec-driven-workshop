# User Stories – Task Management (MVP)

Índice das User Stories oficiais do MVP de Gestão de Tarefas, alinhadas à Clean Architecture e aos padrões de engenharia do repositório.

| US | Título | Arquivo | Tipo | Escopo | Endpoint / Componente |
|---|---|---|---|---|---|
| **US-007** | Padronizar respostas de erro | [us-007-padronizar-erros.md](./us-007-padronizar-erros.md) | Enabler Transversal | Infra / API | `GlobalExceptionFilter` (`ErrorResponse`) |
| **US-006** | Autenticação universal via API Key | [us-006-autenticacao-api-key.md](./us-006-autenticacao-api-key.md) | Enabler Transversal | Segurança | `ApiKeyGuard` (`x-api-key`) |
| **US-001** | Criar tarefa | [us-001-criar-tarefa.md](./us-001-criar-tarefa.md) | Core Domain | CRUD | `POST /tasks` |
| **US-003** | Consultar detalhes de uma tarefa | [us-003-consultar-tarefa.md](./us-003-consultar-tarefa.md) | Core Domain | CRUD | `GET /tasks/:id` |
| **US-002** | Listar tarefas com paginação | [us-002-listar-tarefas.md](./us-002-listar-tarefas.md) | Core Domain | CRUD | `GET /tasks` |
| **US-004** | Atualizar parcialmente uma tarefa | [us-004-atualizar-tarefa.md](./us-004-atualizar-tarefa.md) | Core Domain | CRUD | `PATCH /tasks/:id` |
| **US-005** | Remover tarefa | [us-005-remover-tarefa.md](./us-005-remover-tarefa.md) | Core Domain | CRUD | `DELETE /tasks/:id` |

Vocabulário em [`CONTEXT.md`](../../CONTEXT.md), decisões duráveis em [`docs/adr/`](../../docs/adr/) e especificação técnica consolidada em `.scratch/task-management-mvp/spec.md`.

---

## Grafo de Dependências entre USs

```text
       [US-007: Padronização de Erros]
                     │
                     ▼
       [US-006: API Key Guard]
                     │
                     ▼
       [US-001: Criar Tarefa] ◄── Fronteira inicial do domínio
         │           │           │
         ▼           ▼           ▼
   [US-003]     [US-002]    [US-004]
  (Consultar)   (Listar)   (Atualizar)
         │
         ▼
   [US-005] (Remover)
```

- **US-007 e US-006** são enablers fundacionais que devem proteger e padronizar toda a camada de transporte antes da exposição dos endpoints de domínio.
- **US-001** é o ponto de partida do domínio: define o schema Drizzle (`task.schema.ts`), a entidade de domínio (`Task`), o port abstrato (`TaskRepository`) e o primeiro caso de uso.
- **US-003, US-002 e US-004** dependem de dados existentes para consulta, paginação e atualização.
- **US-005** conclui o ciclo de vida com a remoção da tarefa.
