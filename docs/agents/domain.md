# Domain Docs

Como as engineering skills devem consumir a documentação de domínio deste repositório ao explorar a base de código.

## Antes de explorar, leia:

- **`CONTEXT.md`** na raiz do repositório
- **`docs/adr/`**: leia os ADRs que tocam a área em que você vai trabalhar

Se algum desses arquivos não existir, **prossiga silenciosamente**. Não aponte sua ausência nem sugira criá-los antecipadamente. A skill `/domain-modeling` (acionada via `/grill-with-docs` e `/improve-codebase-architecture`) os cria sob demanda quando termos ou decisões são efetivamente resolvidos.

## Estrutura de Arquivos

Repositório single-context:

```text
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-clean-architecture-and-dip.md
│   └── ...
└── src/
```

## Use o vocabulário do glossário

Quando sua saída nomear um conceito de domínio (no título de uma issue, proposta de refatoração, hipótese, nome de teste), utilize o termo conforme definido em `CONTEXT.md`. Evite sinônimos que o glossário explicitamente não adota.

Se o conceito necessário ainda não estiver no glossário, encare isso como um sinal: ou você está inventando uma terminologia que o projeto não utiliza (reconsidere), ou há uma lacuna real (registre para o `/domain-modeling`).

## Aponte conflitos de ADR

Se a sua solução contradisser um ADR existente, exponha isso explicitamente em vez de sobrescrever silenciosamente:

> _Contradiz o ADR-0001 (Clean Architecture e DIP), mas vale reavaliar porque…_
