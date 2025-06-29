import { Suspense } from 'react';
import { Loading } from '~/components/ui/loading/Loading';
import { ProjectHeader } from './_comp/ProjectHeader';
import { PublishingChecklist } from './_comp/PublishingChecklist';
import { UploadRelease } from './_comp/ReleaseList';
import { listReleaseByProjectId, listReleaseByProjectSlug, releaseIdById } from '~/lib/db/q/project/release/get';
import { projectBySlug } from '~/lib/db/q/project/get';

const ProjectReleasePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const slug = (await params).slug
  const project = await projectBySlug(slug);
  const DBReleaseLs = await listReleaseByProjectId(project.id);
  console.log(`ProjectReleasePage: ${slug}, ${DBReleaseLs.length}`)
  return (
    <Suspense fallback={<Loading />}>
      <ProjectHeader />
      <h1>{slug}</h1>
      <PublishingChecklist />
      <UploadRelease slug={slug} />
      <pre>
        {JSON.stringify(project, null, 2)}
      </pre>
      <pre>
        {JSON.stringify(DBReleaseLs, null, 2)}
      </pre>
    </Suspense>
  );
}

export default ProjectReleasePage;