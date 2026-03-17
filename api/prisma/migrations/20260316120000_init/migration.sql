-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "gitlabUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependencies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_dependencies" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "dependencyId" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_gitlabUrl_key" ON "projects"("gitlabUrl");

-- CreateIndex
CREATE UNIQUE INDEX "dependencies_name_key" ON "dependencies"("name");

-- CreateIndex
CREATE INDEX "project_dependencies_projectId_idx" ON "project_dependencies"("projectId");

-- CreateIndex
CREATE INDEX "project_dependencies_dependencyId_idx" ON "project_dependencies"("dependencyId");

-- CreateIndex
CREATE UNIQUE INDEX "project_dependencies_projectId_dependencyId_key" ON "project_dependencies"("projectId", "dependencyId");

-- AddForeignKey
ALTER TABLE "project_dependencies" ADD CONSTRAINT "project_dependencies_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_dependencies" ADD CONSTRAINT "project_dependencies_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "dependencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
