import type { Project } from "@prisma/client";
import { ProjectModelCreate } from "@/modules/project/project.model";
import { ProjectService } from "@/modules/project/project.service";
import { IntegrationModel } from "./integration.model";

const GITHUB_API = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

type GitHubRepo = {
  owner: string;
  repo: string;
};

function extractGitHubRepo(url: string): GitHubRepo {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("URL do GitHub invalida");
  }
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function fetchGitHub<T>(path: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "gestao-projetos-monitor",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Repositorio nao encontrado");
    }
    if (res.status === 403) {
      throw new Error("Limite de requisicoes excedido");
    }
    throw new Error(`Erro ao acessar GitHub: ${res.status}`);
  }
  return res.json();
}

async function fetchLatestRelease(repo: GitHubRepo): Promise<string | null> {
  try {
    const data = await fetchGitHub<{ tag_name: string }>(
      `/repos/${repo.owner}/${repo.repo}/releases/latest`
    );
    return data.tag_name?.replace(/^v/, "") ?? null;
  } catch {
    return null;
  }
}

async function fetchLatestTag(repo: GitHubRepo): Promise<string | null> {
  try {
    const data = await fetchGitHub<{ items: Array<{ name: string }> }>(
      `/repos/${repo.owner}/${repo.repo}/tags?per_page=1&page=1`
    );
    const tag = data.items?.[0]?.name;
    return tag ? tag.replace(/^v/, "") : null;
  } catch {
    return null;
  }
}

async function fetchLatestVersion(url: string): Promise<string> {
  const repo = extractGitHubRepo(url);
  const release = await fetchLatestRelease(repo);
  if (release) return release;
  const tag = await fetchLatestTag(repo);
  if (tag) return tag;
  throw new Error("Nenhuma release ou tag encontrada");
}

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
    currentVersion = await fetchLatestVersion(project.githubUrl);
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
    const version = await fetchLatestVersion(input.githubUrl);
    const project = await ProjectService.create({
      name: input.name,
      githubUrl: input.githubUrl,
    });
    return ProjectService.updateVersion(project.id, version);
  }
}
