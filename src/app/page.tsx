"use client";

import { useState, useTransition } from "react";
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

async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/projects`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default function Home() {
  const [projects, setProjects] = useState<ProjectWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isPending] = useTransition();

  async function loadProjects() {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data.map((p) => ({ ...p, status: "loaded" })));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!name.trim() || !githubUrl.trim()) {
      setFormError("Preencha todos os campos");
      return;
    }
    if (!githubUrl.includes("github.com")) {
      setFormError("URL do GitHub invalida");
      return;
    }
    const result = await createProjectAction({ name: name.trim(), githubUrl: githubUrl.trim() });
    if (result.success) {
      setName("");
      setGithubUrl("");
      setFormSuccess("Projeto adicionado com sucesso");
      loadProjects();
    } else {
      setFormError(result.error || "Erro ao adicionar projeto");
    }
  }

  async function handleCheck(projectId: string) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: "checking" as const } : p
      )
    );
    const result = await checkProjectAction(projectId);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        if (result.success && result.result) {
          return {
            ...p,
            version: result.result.currentVersion || p.version,
            status: result.result.updated
              ? ("updated" as const)
              : ("loaded" as const),
          };
        }
        return {
          ...p,
          status: "error" as const,
          checkError: result.error,
        };
      })
    );
  }

  async function handleDelete(projectId: string) {
    if (!confirm("Remover este projeto?")) return;
    const result = await deleteProjectAction(projectId);
    if (result.success) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  }

  useState(() => {
    loadProjects();
  });

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
              type="text"
              placeholder="Nome do projeto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
            <input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="flex-[2] rounded border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {isPending ? "Adicionando..." : "Adicionar"}
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
            onClick={loadProjects}
            disabled={loading}
            className="text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Atualizar lista"}
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
