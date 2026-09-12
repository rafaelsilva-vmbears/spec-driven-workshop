# .scratch (Issue Tracker Local Markdown)

Este diretório armazena as especificações e tickets locais produzidos pelas skills de agente:
- `/to-spec` -> grava a especificação consolidada em `.scratch/<feature>/spec.md`
- `/to-tickets` -> grava os tickets atômicos em `.scratch/<feature>/issues/<NN>-<slug>.md`
- `/implement` -> consome os tickets em ordem topológica de dependências

Cada ticket possui o cabeçalho `Blocked by:` e o status (`ready-for-agent`, `in-progress`, `resolved`).
