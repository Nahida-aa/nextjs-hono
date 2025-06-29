
import { Button } from '@heroui/button';
import { EditIcon, Trash2 } from 'lucide-react';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Loading } from '~/components/ui/loading/Loading';
import { releaseWithFilesById, releaseIdById } from '~/lib/db/q/project/release/get';
import { base64ToUuid } from '~/lib/utils/encode';


const ProjectReleasePage = async ({
  params,
}: {
  params: Promise<{ cid: string }>
}) => {
  const cid = (await params).cid
  const releaseId = await base64ToUuid(cid)
  const DBRelease = await releaseWithFilesById(releaseId)
  if (!DBRelease) {
    return <div>404</div> // TODO
  }
  return (
    <Suspense fallback={<Loading />}>
      <div className='min-h-12'></div>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <CardTitle>{DBRelease.name}</CardTitle>
        </CardContent>
        <CardFooter className='gap-2'>
          <Button color="primary" startContent={<EditIcon size={20} />}>Edit</Button>
          <Button color="danger" startContent={<Trash2 size={20} />}>Delete</Button>
        </CardFooter>
      </Card>
      <h1>{cid}</h1>
      <pre>
        {JSON.stringify(DBRelease, null, 2)}
      </pre>
    </Suspense>
  );
}

export default ProjectReleasePage;