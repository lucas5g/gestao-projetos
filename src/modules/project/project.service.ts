import { prisma } from "@/lib/prisma";
import { GitHubService } from "@/modules/github/github.service";
import { ProjectModelCreate, ProjectModelUpdate } from "./project.model";

function getProjectNameFromGithubUrl(githubUrl: string) {
  const repoName = githubUrl
    .replace(/\.git$/, "")
    .replace(/\/+$/, "")
    .split("/")
    .pop();

  if (!repoName) {
    throw new Error("URL do GitHub invalida");
  }

  return repoName;
}

export class ProjectService {
  static async create(data: ProjectModelCreate) {
    const version = await GitHubService.fetchLatestVersion(data.githubUrl);

    return prisma.project.create({
      data: {
        githubUrl: data.githubUrl,
        name: getProjectNameFromGithubUrl(data.githubUrl),
        version,
      },
    });
  }

  static findMany() {
    return prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  }

  static list() {
    return this.findMany();
  }

  static findUnique(id: string) {
    return prisma.project.findUnique({ where: { id } });
  }

  static getById(id: string) {
    return this.findUnique(id);
  }

  static update(id: string, data: ProjectModelUpdate) {
    return prisma.project.update({ where: { id }, data });
  }

  static updateVersion(id: string, version: string) {
    return prisma.project.update({ where: { id }, data: { version } });
  }

  static delete(id: string) {
    return prisma.project.delete({ where: { id } });
  }
}
