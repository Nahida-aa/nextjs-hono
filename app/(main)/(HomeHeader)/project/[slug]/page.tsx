import { Suspense } from 'react';
import { server_auth } from '~/app/(auth)/auth';
import { Loading } from '~/components/ui/loading/Loading';

export default async function ProjectPage ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>, 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params;
  const { page = '1', sort = 'asc', query = '' } = await searchParams

  return (
    <Suspense fallback={<Loading />}>
      <section className='mt-12'></section>
      <h1>ProjectPage slug: {slug}</h1>
      <p>This is the ProjectPage page.</p>
    </Suspense>
  );
}