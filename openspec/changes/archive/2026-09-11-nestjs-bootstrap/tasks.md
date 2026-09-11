## 1. Verificação de Ambiente e Dependências

- [x] 1.1 Validar instalação das dependências do projeto e integridade do lockfile executando `pnpm install --frozen-lockfile`.
- [x] 1.2 Validar integridade das configurações de ambiente comparando `.env.example` com o suporte provido pelo `ConfigModule` em `src/app.module.ts`.

## 2. Qualidade de Código e Compilação

- [x] 2.1 Executar verificação de linting executando `pnpm lint` e assegurar zero erros estáticos no código.
- [x] 2.2 Executar a compilação do projeto via `pnpm build` e verificar que o bundle em `dist/` é gerado sem erros de tipagem.

## 3. Validação dos Testes e Inicialização do NestJS

- [x] 3.1 Executar a suíte de testes unitários com `pnpm test` e verificar que o runner Vitest inicializa e conclui com sucesso.
- [x] 3.2 Criar um teste de sanidade inicial para bootstrapping do `AppModule` em `tests/unit/app.module.spec.ts` e verificar que o contexto do NestJS compila.
