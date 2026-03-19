import { z } from "zod";

export const ProjectModelCreate = z.object({
  githubUrl: z.url(),  
});

export const ProjectModelUpdate = ProjectModelCreate.partial();

export type ProjectModelCreate = z.infer<typeof ProjectModelCreate>;
export type ProjectModelUpdate = z.infer<typeof ProjectModelUpdate>;
