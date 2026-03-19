import { GitHubModel } from "./github.model";

const GITHUB_API = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export class GitHubService {
  static extractRepo(url: string): GitHubModel["repo"] {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error("URL do GitHub invalida");
    }

    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }

  static async fetch<T>(path: string): Promise<T> {
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

  static async fetchLatestRelease(repo: GitHubModel["repo"]): Promise<string | null> {
    try {
      const data = await this.fetch<GitHubModel["latestRelease"]>(
        `/repos/${repo.owner}/${repo.repo}/releases/latest`
      );

      return data.tag_name?.replace(/^v/, "") ?? null;
    } catch {
      return null;
    }
  }

  static async fetchLatestTag(repo: GitHubModel["repo"]): Promise<string | null> {
    try {
      const data = await this.fetch<GitHubModel["latestTag"]>(
        `/repos/${repo.owner}/${repo.repo}/tags?per_page=1&page=1`
      );

      const tag = data[0]?.name;
      return tag ? tag.replace(/^v/, "") : null;
    } catch {
      return null;
    }
  }

  static async fetchLatestVersion(url: string): Promise<string> {
    const repo = this.extractRepo(url);
    const release = await this.fetchLatestRelease(repo);

    if (release) return release;

    const tag = await this.fetchLatestTag(repo);
    if (tag) return tag;

    throw new Error("Nenhuma release ou tag encontrada");
  }
}
