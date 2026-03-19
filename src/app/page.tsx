import { ProjectMonitor } from "@/app/project-monitor";
import { ProjectService } from "@/modules/project/project.service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await ProjectService.findMany();

  return <ProjectMonitor initialProjects={projects} />;
}
