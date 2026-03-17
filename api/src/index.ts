import { Elysia } from "elysia";

const port = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  .get("/", () => ({
    name: "gestao-projetos-api",
    status: "ok",
  }))
  .get("/health", () => ({
    status: "ok",
  }))
  .listen(port);

console.log(`API running at http://${app.server?.hostname ?? "localhost"}:${app.server?.port ?? port}`);
