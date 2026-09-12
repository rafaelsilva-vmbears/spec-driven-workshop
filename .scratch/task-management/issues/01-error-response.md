# 01: Padronização Global de Respostas de Erro (ErrorResponse)

**What to build:** Um mecanismo unificado e transversal de captura e formatação de erros que assegura que qualquer falha na API (seja erro de negócio, falha de validação de entrada nos parâmetros/corpo ou erro inesperado de servidor) seja retornada com o contrato JSON padronizado `{ code, message, details? }`, registrando logs estruturados para erros 500 sem vazar stack trace.

**Blocked by:** None (can start immediately)

**Status:** resolved

## Acceptance Criteria

- [x] Criar a interface de contrato de erro contendo os campos `code` (string semântica em SCREAMING_SNAKE_CASE), `message` (string legível) e `details` (objeto ou array opcional com detalhes da falha).
- [x] Criar classe base para exceções de domínio permitindo que casos de uso e entidades definam códigos de erro de negócio específicos com o status HTTP correspondente.
- [x] Implementar filtro global de exceções registrado na aplicação que intercepta:
  - Exceções de domínio, mapeando para o status HTTP e payload correspondentes.
  - Exceções HTTP do framework e falhas de validação de DTOs, extraindo mensagens amigáveis no campo `details` com código `VALIDATION_ERROR`.
  - Exceções não tratadas, respondendo HTTP 500 (`INTERNAL_SERVER_ERROR`) com mensagem genérica e registrando log estruturado de erro.
- [x] Testes unitários para o filtro cobrindo erro de domínio, erro de validação HTTP e erro genérico não tratado.
