import { z } from "zod";

export const IntegrationModel = {
  checkAllProjectsResponse: z.object({
    checked: z.number(),
    updated: z.number(),
    notified: z.number(),
    errors: z.number(),
    results: z.array(z.object({
      projectId: z.string(),
      projectName: z.string(),
      currentVersion: z.string(),
      previousVersion: z.string(),
      updated: z.boolean(),
      notified: z.boolean(),
      error: z.string().nullable(),
    })),
  }),
  checkByIdResponse: z.object({
    projectId: z.string(),
    projectName: z.string(),
    currentVersion: z.string(),
    previousVersion: z.string(),
    updated: z.boolean(),
    notified: z.boolean(),
    error: z.string().nullable(),
  }),
  checkResult: z.object({
    projectId: z.string(),
    projectName: z.string(),
    currentVersion: z.string(),
    previousVersion: z.string(),
    updated: z.boolean(),
    notified: z.boolean(),
    error: z.string().nullable(),
  }),
} as const;

export type IntegrationModel = {
  [K in keyof typeof IntegrationModel]: z.infer<typeof IntegrationModel[K]>;
};
