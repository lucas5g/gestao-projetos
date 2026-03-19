import { prisma } from "@/lib/prisma";
import { ProjectModelCreate, ProjectModelUpdate } from "./project.model";

export class ProjectService {
  static create(data: ProjectModelCreate) {
    return prisma.project.create({
      data
    });
  }

  static findMany() {
    return prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  }

  static findUnique(id: string) {
    return prisma.project.findUnique({ where: { id } });
  }

  static update(id: string, data: ProjectModelUpdate) {
    return prisma.project.update({ where: { id }, data });
  }

  static delete(id: string) {
    return prisma.project.delete({ where: { id } });
  }
}
