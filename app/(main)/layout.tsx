import { cookies } from 'next/headers';

import { AppSidebar } from '~/components/layout/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';

import { server_auth } from '../(auth)/auth';
import { HomeHeader } from '~/components/layout/header/home-header';
import { NavigationSidebar } from './chat/_comp/side';
import { Separator } from '~/components/ui/separator';
import { ScrollArea } from '~/components/ui/scroll-area';

// export const experimental_ppr = true; // next

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([server_auth(), cookies()]);
  console.log(`app/(main)/layout.tsx: Layout: session.user: ${JSON.stringify(session?.user)}`);
  let user_status
  if (session?.user) {
    user_status = "online"
  } else {
    user_status = "未登录"
  }
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  console.log(`app/(main)/layout.tsx: Layout: isCollapsed: ${isCollapsed}`);

  return (
    <SidebarProvider defaultOpen={!isCollapsed} className='h-screen SidebarProvider  '> 
    {/* 模糊背景 */}
      <AppSidebar user={session?.user} />
      <SidebarInset className='h-screen bg-opacity'>
        {/* <HomeHeader user={session?.user} /> */}
        {/* <HomeHeader user={session?.user} className='sticky top-0 z-10' /> */}
        {/* 下划线、间隔线 */}
        {/* <Separator className='mx-2'></Separator> */}
        {/* <div className='overflow-auto h-full flex w-full'> */}
          {/* <ScrollArea> */}
          {/* <aside className="flex z-30 w-14 h-full flex-col fixed inset-y-14"> */}
          {/* <aside className="flex  w-14 h-full flex-col">
            <NavigationSidebar></NavigationSidebar>
          </aside> */}
          {/* <main className='flex-1 w-full'> */}
            {children}
          {/* </main> */}
          {/* </ScrollArea> */}
        {/* </div> */}
      </SidebarInset>
    </SidebarProvider>
  );
}
