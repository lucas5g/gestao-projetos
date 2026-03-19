import { NextResponse } from "next/server";
import { IntegrationService } from "@/modules/integration/integration.service";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CHECKS_API_TOKEN;

  if (!expectedToken) {
    return NextResponse.json(
      { error: "Token de integracao nao configurado" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  try {
    const summary = await IntegrationService.checkAllProjects();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[checks/run]", err);
    return NextResponse.json(
      { error: "Erro interno ao executar checagens" },
      { status: 500 }
    );
  }
}
