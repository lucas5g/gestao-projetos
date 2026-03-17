# gestao-projetos

Base inicial do projeto organizada em `api` e `web`, com o banco da API configurado em PostgreSQL + Prisma.

## Requisitos

- Bun
- Docker com Docker Compose

## Setup

1. Copie as variaveis de ambiente da API, se necessario:

```bash
cp api/.env.example api/.env
```

2. Suba o Postgres:

```bash
bun run db:up
```

3. Gere o client do Prisma:

```bash
bun run db:generate
```

4. Aplique as migrations:

```bash
bun run db:migrate
```

## Estrutura inicial

- `docker-compose.yml`: Postgres local para desenvolvimento
- `api/`: backend e camada de banco da aplicacao
- `api/prisma/schema.prisma`: models `Project`, `Dependency` e `ProjectDependency`
- `api/prisma/migrations/`: migration inicial do banco
- `api/src/lib/prisma.ts`: instancia compartilhada do Prisma Client
- `web/`: pasta reservada para o frontend

## Comandos uteis

```bash
bun run api:dev
bun run api:start
bun run db:up
bun run db:down
bun run db:generate
bun run db:migrate
bun run db:studio
```

## Organizacao

- `docker-compose.yml` fica na raiz para atender a stack inteira
- `api` concentra Prisma, futuras rotas e integracoes do backend
- `web` fica pronto para receber a aplicacao frontend

## API local

- desenvolvimento: `bun run api:dev`
- servidor local: `http://localhost:3000`
- healthcheck: `http://localhost:3000/health`
