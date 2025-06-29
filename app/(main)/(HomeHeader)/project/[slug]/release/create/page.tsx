
import { Suspense } from 'react';
import { Loading } from '~/components/ui/loading/Loading';
import { MainComp } from './client';
import { genUUIDonServer } from '~/server/utils/encode';
import { releaseIdById } from '~/lib/db/q/project/release/get';
import { uuidToBase64 } from '~/lib/utils/encode';
import { projectBySlug } from '~/lib/db/q/project/get';

const generateUniqueReleaseId = async () => {
  let releaseId;
  let isUnique = false;
  //  确保 生成的 releaseId 在数据库中是唯一的
  while (!isUnique) {
    releaseId = genUUIDonServer();
    const existingRelease = await releaseIdById(releaseId);
    if (!existingRelease) {
      isUnique = true;
    }
  }

  return releaseId;
};

const ProjectReleaseCreatePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  console.log(`ProjectReleaseCreatePage`)
  const slug = (await params).slug
  const [project, releaseId] = await Promise.all([projectBySlug(slug), generateUniqueReleaseId()]);
  const [clientProjectId, clientReleaseId] = await Promise.all([uuidToBase64(project.id), uuidToBase64(releaseId)]);
  const releaseFileDir = `project/${clientProjectId}/release/${clientReleaseId}`;

  return (
    <Suspense fallback={<Loading />}>
      <div className='h-12'></div>
      <MainComp clientReleaseId={clientReleaseId} releaseId={releaseId} releaseFileDir={releaseFileDir} />
    </Suspense>
  );
}

export default ProjectReleaseCreatePage;