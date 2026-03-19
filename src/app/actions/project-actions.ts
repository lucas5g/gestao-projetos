"use server";

import { revalidatePath } from "next/cache";
import { ProjectModelCreate } from "@/modules/project/project.model";
import { IntegrationModel } from "@/modules/integration/integration.model";
import { ProjectService } from "@/modules/project/project.service";
import { IntegrationService } from "@/modules/integration/integration.service";

export async function createProjectAction(
  input: unknown
): Promise<{ success: boolean; error?: string }> {
  const parsed = ProjectModelCreate.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    await IntegrationService.addWithInitialVersion(parsed.data);
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}

export async function checkProjectAction(
  projectId: string
): Promise<{ success: boolean; result?: IntegrationModel["checkByIdResponse"]; error?: string }> {
  try {
    const result = await IntegrationService.checkById(projectId);
    revalidatePath("/");
    return { success: true, result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}

export async function deleteProjectAction(
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await ProjectService.delete(projectId);
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}
