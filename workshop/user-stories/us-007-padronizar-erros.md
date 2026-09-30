# US-007 – Padronizar respostas de erro da API

**Como** Cliente da API  
**Eu quero** receber respostas de erro em um formato padronizado e previsível  
**Para** tratar falhas de validação, de negócio e de infraestrutura de forma consistente.

## Critérios de Aceitação

1. Todas as respostas de erro da API (4xx e 5xx) devem seguir estritamente a estrutura ([ADR-0004](../../docs/adr/0004-envelope-de-erro-proprio.md)):
   ```json
   {
     "code": "STRING_IDENTIFIER",
     "message": "Descrição legível do erro",
     "details": [{ "field": "title", "message": "title must be longer than or equal to 3 characters" }]
   }
   ```
2. O campo `details` é opcional e preenchido em erros de validação: uma entrada `{ field, message }` por violação, com `field` em notação de ponto para campos aninhados. O `ValidationPipe` global usa `exceptionFactory` para produzir esse formato.
3. Códigos semânticos canônicos obrigatórios:
   - `VALIDATION_ERROR` (HTTP 400): falha de validação de DTOs, pipes de conversão, campos não permitidos ou `InvalidTaskException` vinda do domínio.
   - `UNAUTHORIZED` (HTTP 401): ausência ou invalidade da chave de API.
   - `TASK_NOT_FOUND` (HTTP 404): tarefa inexistente ou removida.
   - `INTERNAL_SERVER_ERROR` (HTTP 500): erros inesperados (nunca expor stack trace ao cliente).
4. `HttpException` fora do catálogo (ex.: rota inexistente, 405, 413, 415) recebe um `code` derivado do status em `UPPER_SNAKE_CASE` (`NOT_FOUND`, `METHOD_NOT_ALLOWED`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`), preservando o status HTTP.
5. O tratamento de erros é implementado na camada de Adapters via `GlobalExceptionFilter` (registrado globalmente como `APP_FILTER`), interceptando:
   - `DomainException`: exceções puras de negócio vindas da camada de domínio. Carregam só `code` e `message`, e o filter mantém a tabela que traduz `code` em status HTTP.
   - `HttpException`: exceções nativas do NestJS, como as do `ValidationPipe`.
   - `Error` genérico: logado de forma estruturada via Pino e respondido como 500 `INTERNAL_SERVER_ERROR`.

## Notas de Negócio

- A padronização desacopla os contratos da API das mensagens internas do framework, facilitando a integração por front-ends e microsserviços.
- Exceções de domínio são classes puras em `src/domain/exception/`, sem nenhum conceito HTTP.
