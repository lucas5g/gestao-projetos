import { NextResponse } from "next/server";
import { ProjectService } from "@/modules/project/project.service";

export async function GET() {
  try {
    const projects = await ProjectService.list();
    return NextResponse.json(projects);
  } catch (err) {
    console.error("[projects]", err);
    return NextResponse.json(
      { error: "Erro ao listar projetos" },
      { status: 500 }
    );
  }
}
