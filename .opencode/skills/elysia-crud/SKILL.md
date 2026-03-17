---
name: elysia-crud
description: Gera ou expande modulos do backend em Bun/Elysia seguindo o contexto do projeto GitRadar
compatibility: opencode
metadata:
  stack: bun-elysia-postgres
  audience: backend
---

## Objetivo

- Criar ou expandir modulos do backend do GitRadar.
- Seguir Bun + Elysia + PostgreSQL.
- Priorizar simplicidade e padroes ja existentes no repositorio.

## Quando usar

Use quando o pedido for criar ou evoluir um modulo backend, como `projects`, `dependencies`, `sync` ou outro recurso do dominio.

## Padrao de pasta

Seguir o padrao de feature-based folder structure recomendado pelo Elysia:

```text
src/
  modules/
    <modulo>/
      index.ts
      service.ts
      model.ts
```

- `index.ts`: controller HTTP com instancia `Elysia`, rotas e validacao.
- `service.ts`: regra de negocio desacoplada do Elysia sempre que possivel.
- `model.ts`: schemas e tipos derivados da validacao.

Se o modulo precisar de mais arquivos, adicionar apenas quando houver necessidade real.

## Regras

- Tratar uma instancia `Elysia` como controller.
- Nao criar classe de controller acoplada ao `Context` do Elysia.
- Colocar regra de negocio em `service.ts`.
- Usar validacao do proprio Elysia em `model.ts` como fonte unica de verdade.
- Evitar overengineering e camadas desnecessarias.
- Reaproveitar nomes, convencoes e organizacao do projeto antes de propor algo novo.

## Fluxo

1. Ler o pedido e identificar o modulo do dominio.
2. Inspecionar a estrutura existente.
3. Criar ou atualizar `index.ts`, `service.ts` e `model.ts`.
4. Registrar o modulo no bootstrap principal, se necessario.
5. Rodar testes, lint ou build se existirem.

## Contexto do projeto

Usar `PRD.MD` como referencia de negocio. Priorizar modulos ligados a:

- `projects`
- `dependencies`
- `project_dependencies`
- `sync`
- vulnerabilidades e comparacao de versoes

## Entrega

Ao finalizar:

- informar os arquivos alterados;
- resumir o que foi criado;
- apontar qualquer passo pendente.
