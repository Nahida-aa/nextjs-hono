import { base64ToUuid } from "~/lib/utils/encode";
import { ProjectProvider } from "./_comp/project";
import { projectById, projectBySlug } from "~/lib/db/q/project/get";

export default async function Layout({ 
  children,
  params 
}: { 
  children: React.ReactNode,
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const project = await projectBySlug(slug);
  return <section>
    <ProjectProvider defaultState={project} >
      {children}
    </ProjectProvider>
  </section>
}