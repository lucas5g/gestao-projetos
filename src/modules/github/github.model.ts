import { z } from "zod";

export const GitHubModel = {
  repo: z.object({
    owner: z.string(),
    repo: z.string(),
  }),
  latestRelease: z.object({
    tag_name: z.string(),
  }),
  latestTag: z.array(
    z.object({
      name: z.string(),
    })
  ),
} as const;

export type GitHubModel = {
  [K in keyof typeof GitHubModel]: z.infer<typeof GitHubModel[K]>;
};
