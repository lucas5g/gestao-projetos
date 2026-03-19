import type { Project } from "@/generated/prisma/client";
import { GitHubService } from "@/modules/github/github.service";
import { ProjectModelCreate } from "@/modules/project/project.model";
import { ProjectService } from "@/modules/project/project.service";
import { IntegrationModel } from "./integration.model";

async function sendTeamsNotification(
  projectName: string,
  currentVersion: string,
  githubUrl: string
): Promise<void> {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("Webhook do Teams nao configurado");
  }
  const payload = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: "0078D4",
    summary: `Nova versao disponivel para ${projectName}`,
    sections: [
      {
        activityTitle: `Nova versao disponivel: **${currentVersion}**`,
        facts: [
          { name: "Projeto", value: projectName },
          { name: "Versao atual", value: currentVersion },
          { name: "Repositorio", value: githubUrl },
        ],
        markdown: true,
      },
    ],
  };
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Falha ao enviar notificacao para Teams: ${res.status}`);
  }
}

async function checkSingleProject(project: Project): Promise<IntegrationModel["checkResult"]> {
    let currentVersion: string;
    try {
      currentVersion = await GitHubService.fetchLatestVersion(project.githubUrl);
  } catch (err) {
    return {
      projectId: project.id,
      projectName: project.name,
      currentVersion: "",
      previousVersion: project.version,
      updated: false,
      notified: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
  if (currentVersion === project.version) {
    return {
      projectId: project.id,
      projectName: project.name,
      currentVersion,
      previousVersion: project.version,
      updated: false,
      notified: false,
      error: null,
    };
  }
  try {
    await sendTeamsNotification(project.name, currentVersion, project.githubUrl);
  } catch (err) {
    return {
      projectId: project.id,
      projectName: project.name,
      currentVersion,
      previousVersion: project.version,
      updated: false,
      notified: false,
      error: err instanceof Error ? err.message : "Erro ao notificar Teams",
    };
  }
  try {
    await ProjectService.updateVersion(project.id, currentVersion);
  } catch {
    return {
      projectId: project.id,
      projectName: project.name,
      currentVersion,
      previousVersion: project.version,
      updated: false,
      notified: true,
      error: "Notificacao enviada, mas falhou ao atualizar versao no banco",
    };
  }
  return {
    projectId: project.id,
    projectName: project.name,
    currentVersion,
    previousVersion: project.version,
    updated: true,
    notified: true,
    error: null,
  };
}

export class IntegrationService {
  static async checkAllProjects() {
    const projects = await ProjectService.list();
    const results: IntegrationModel["checkResult"][] = [];
    let checked = 0;
    let updated = 0;
    let notified = 0;
    let errors = 0;
    for (const project of projects) {
      checked++;
      const result = await checkSingleProject(project);
      results.push(result);
      if (result.updated) updated++;
      if (result.notified) notified++;
      if (result.error) errors++;
    }
    return { checked, updated, notified, errors, results };
  }

  static async checkById(projectId: string) {
    const project = await ProjectService.getById(projectId);
    if (!project) {
      return {
        projectId,
        projectName: "",
        currentVersion: "",
        previousVersion: "",
        updated: false,
        notified: false,
        error: "Projeto nao encontrado",
      };
    }
    return checkSingleProject(project);
  }

  static async addWithInitialVersion(input: ProjectModelCreate) {
    return ProjectService.create({ githubUrl: input.githubUrl });
  }
}
