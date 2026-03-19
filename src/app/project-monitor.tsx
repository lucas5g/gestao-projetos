"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProjectAction,
  checkProjectAction,
  deleteProjectAction,
} from "@/app/actions/project-actions";
import type { Project } from "@/types/project";

type ProjectWithStatus = Project & {
  status: "loaded" | "checking" | "updated" | "error";
  checkError?: string;
};

type ProjectMonitorProps = {
  initialProjects: Project[];
};

function withStatus(projects: Project[]): ProjectWithStatus[] {
  return projects.map((project) => ({ ...project, status: "loaded" }));
}

export function ProjectMonitor({ initialProjects }: ProjectMonitorProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithStatus[]>(() => withStatus(initialProjects));
  const [githubUrl, setGithubUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();

  useEffect(() => {
    setProjects(withStatus(initialProjects));
  }, [initialProjects]);

  function refreshProjects() {
    startRefreshTransition(() => {
      router.refresh();
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const normalizedGithubUrl = githubUrl.trim();

    if (!normalizedGithubUrl) {
      setFormError("Preencha a URL do projeto");
      return;
    }

    if (!normalizedGithubUrl.includes("github.com")) {
      setFormError("URL do GitHub invalida");
      return;
    }

    startSubmitTransition(async () => {
      const result = await createProjectAction({ githubUrl: normalizedGithubUrl });

      if (result.success) {
        setGithubUrl("");
        setFormSuccess("Projeto adicionado com sucesso");
        router.refresh();
        return;
      }

      setFormError(result.error || "Erro ao adicionar projeto");
    });
  }

  async function handleCheck(projectId: string) {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, status: "checking" } : project
      )
    );

    const result = await checkProjectAction(projectId);

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        if (result.success && result.result) {
          return {
            ...project,
            version: result.result.currentVersion || project.version,
            status: result.result.updated ? "updated" : "loaded",
            checkError: undefined,
          };
        }

        return {
          ...project,
          status: "error",
          checkError: result.error || result.result?.error || "Erro ao verificar",
        };
      })
    );

    router.refresh();
  }

  async function handleDelete(projectId: string) {
    if (!confirm("Remover este projeto?")) return;

    const result = await deleteProjectAction(projectId);

    if (result.success) {
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      router.refresh();
      return;
    }

    setFormError(result.error || "Erro ao remover projeto");
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-zinc-900">
          Monitor de Versoes
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-lg bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-zinc-800">
            Adicionar Projeto
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="flex-1 rounded border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {isSubmitting ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
          {formError && (
            <p className="mt-2 text-sm text-red-600">{formError}</p>
          )}
          {formSuccess && (
            <p className="mt-2 text-sm text-green-600">{formSuccess}</p>
          )}
        </form>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-800">
            Projetos Monitorados
          </h2>
          <button
            onClick={refreshProjects}
            disabled={isRefreshing}
            className="text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
          >
            {isRefreshing ? "Carregando..." : "Atualizar lista"}
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="rounded-lg bg-white p-6 text-center text-zinc-500 shadow-sm">
            Nenhum projeto cadastrado ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900">
                    {project.name}
                  </p>
                  <p className="truncate text-sm text-zinc-500">
                    {project.githubUrl}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium text-zinc-700">
                      v{project.version || "?"}
                    </p>
                    {project.status === "updated" && (
                      <p className="text-xs text-green-600">Atualizado</p>
                    )}
                    {project.status === "error" && (
                      <p className="text-xs text-red-600">
                        {project.checkError || "Erro"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCheck(project.id)}
                    disabled={project.status === "checking"}
                    className="rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50"
                  >
                    {project.status === "checking" ? "Verificando..." : "Verificar"}
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="rounded px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-lg bg-zinc-100 p-4">
          <p className="text-sm text-zinc-600">
            <strong>Integracao n8n:</strong> POST{" "}
            <code className="rounded bg-zinc-200 px-1">
              /api/projects/checks
            </code>{" "}
            com header{" "}
            <code className="rounded bg-zinc-200 px-1">
              Authorization: Bearer &lt;CHECKS_API_TOKEN&gt;
            </code>
          </p>
        </div>
      </div>
    </main>
  );
}
