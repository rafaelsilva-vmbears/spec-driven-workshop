# ADR 0002: Estratégia de Soft Delete para Ciclo de Vida de Tarefas

- **Status**: Aceito
- **Data**: 2026-09-12
- **Contexto**: US-005 (Remover Tarefa) e US-003/US-004 (Integridade do Domínio)

## Contexto e Problema

A User Story US-005 deixou aberta a escolha entre remoção física (*hard delete*) e remoção lógica (*soft delete*). Em sistemas corporativos de gerenciamento de tarefas, auditoria e rastreabilidade são requisitos frequentes. A remoção física destruiria irrevogavelmente o histórico de criação, atualizações e timestamps de encerramento da tarefa.

## Decisão

1. **Persistência do Timestamp de Exclusão**:
   - A tabela `tasks` conterá a coluna `deleted_at TIMESTAMP WITH TIME ZONE NULL`.
   - Uma tarefa ativa possui `deleted_at IS NULL`.
   - A exclusão preenche `deleted_at = new Date()`.

2. **Comportamento em Consultas e Mutações**:
   - `GET /tasks` e `GET /tasks/:id` filtram estritamente `isNull(tasks.deletedAt)`.
   - Consultar ou tentar alterar (`PATCH` / `DELETE`) uma tarefa já excluída resulta imediatamente em erro **HTTP 404 Not Found** com o código semântico `TASK_NOT_FOUND`.
   - A entidade de domínio `Task` protege essa invariante: o método `task.delete()` lança uma exceção caso a tarefa já esteja marcada como excluída, interrompendo efeitos colaterais antes de qualquer comando no banco.

## Consequências

- **Positivas**:
  - Histórico transacional totalmente preservado para fins de auditoria e compliance.
  - Segurança contra perdas acidentais de dados.
  - Demonstração prática no workshop de invariantes de domínio e testes de propagação de erro.
- **Negativas**:
  - Todas as consultas de leitura precisam incluir a cláusula `isNull(tasks.deletedAt)`.
  - Índices futuros no banco devem considerar índices parciais (`WHERE deleted_at IS NULL`).
