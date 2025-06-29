import Link from 'next/link';
import { Suspense } from 'react';
import { server_auth } from '~/app/(auth)/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Loading } from '~/components/ui/loading/Loading';
import { listProjectByUser } from '~/lib/db/q/project/get';
import { DemoList } from './_comp/DemoList';
import { ProjectList } from './_comp/ProjectList';
import {ScrollShadow} from "@heroui/scroll-shadow";

const  ProjectListPage = async () => {
  const session = await server_auth();
  if (!session?.user) {
    return null; // TODO: redirect to login
  }
  const projects = await listProjectByUser({userId: session.user.id});
  console.log(`ProjectListPage: projects`, projects)
  return (
    <Suspense fallback={<Loading />}>
      <div className='min-h-12'></div>
      {/* <ScrollShadow hideScrollBar className="h-screen"> */}
      <section >
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>You can edit multiple projects at once by selecting them below.</CardDescription>
          </CardHeader>
          <CardContent>
            <DemoList />
            <ProjectList />
            <ul>
              {projects.records.map((project) => (
                <li key={project.id}>
                  <Link href={`/project/${project.slug}`}>
                    {project.name}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
        {/* </ScrollShadow> */}
    </Suspense>
  );
}

export default ProjectListPage;
