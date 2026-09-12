# ADR 0001: Clean Architecture e Inversão de Dependência com Classes Abstratas

- **Status**: Aceito
- **Data**: 2026-09-12
- **Contexto**: Projeto Task Management API (Workshop)

## Contexto e Problema

Em aplicações NestJS com TypeScript, é comum encontrar acoplamento forte entre a camada de domínio e o framework (decorators como `@Injectable`, `@Entity`, etc.) ou a utilização de interfaces TypeScript puras para inversão de dependência. Porém, interfaces TypeScript desaparecem em tempo de execução (*type erasure*), forçando o uso de strings arbitrárias ou `Symbol` como tokens de injeção (`@Inject('TASK_REPOSITORY')`), o que reduz a segurança de tipos e introduz ruído no código.

## Decisão

1. **Domínio Puro (Rich Domain Model)**:
   - As entidades de domínio (`src/domain/model/`) serão classes puras TypeScript que validam suas próprias invariantes no construtor.
   - Nenhuma biblioteca externa ou decorator de framework será importado no domínio.

2. **DIP com Classes Abstratas**:
   - Os contratos de repositório serão definidos como **classes abstratas** em `src/domain/ports/repository/`:
     ```typescript
     export abstract class TaskRepository {
       abstract create(task: Task): Promise<Task>
       abstract findById(id: string): Promise<Task | null>
       abstract findAll(params: FindAllTasksParams): Promise<PaginatedResult<Task>>
       abstract update(task: Task): Promise<Task>
       abstract delete(id: string): Promise<void>
     }
     ```
   - O NestJS usará a própria classe abstrata como token de injeção:
     ```typescript
     {
       provide: TaskRepository,
       useClass: TaskRepositoryImpl,
     }
     ```
   - Os use cases injetam diretamente via construtor tipado: `constructor(private readonly repository: TaskRepository) {}`.

## Consequências

- **Positivas**:
  - Código limpo, testável e sem necessidade de tokens mágicos em string.
  - O domínio é 100% isolado de mudanças em bancos de dados ou bibliotecas de ORM (Drizzle, Prisma, etc.).
  - Facilidade de mockar em testes unitários.
- **Negativas**:
  - Exige a escrita de mappers entre os registros de banco de dados e as instâncias de domínio.
