## 1. Definição de Schemas e DTOs OpenAPI

- [x] 1.1 Criar o DTO padronizado de erro `ErrorResponseDto` em `src/adapters/api/dto/error-response.dto.ts` com propriedades documentadas para Swagger e verificar compilação com `pnpm build`.
- [x] 1.2 Criar enum `TaskStatus` e DTOs de entrada e saída (`CreateTaskDto`, `UpdateTaskDto`, `TaskResponseDto`, `PaginatedTasksResponseDto`) em `src/adapters/api/dto/` com decorators OpenAPI e verificar compilação com `pnpm build`.

## 2. Documentação de Endpoints e Rastreabilidade

- [x] 2.1 Criar o esqueleto do `TasksController` em `src/adapters/api/controllers/tasks.controller.ts` com as anotações OpenAPI completas (`@ApiTags`, `@ApiSecurity`, `@ApiOperation`, `@ApiResponse`) e rastreabilidade `x-us-id` para cada endpoint da US-001 à US-005.
- [x] 2.2 Registrar o controller no `AppModule` e validar que o build do projeto compila via `pnpm build`.

## 3. Validação e Qualidade do Contrato

- [x] 3.1 Criar teste unitário de definição do controller em `src/adapters/api/controllers/tasks.controller.spec.ts` validando a estrutura do controller e execução do Vitest.
- [x] 3.2 Executar as validações de qualidade (`pnpm lint` e `pnpm test`) garantindo conformidade total de tipagem e estilo.
