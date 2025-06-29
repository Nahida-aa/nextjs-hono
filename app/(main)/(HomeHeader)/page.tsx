import { HomeHeader } from '~/components/layout/header/home-header'
import React from 'react'
import { server_auth } from '../../(auth)/auth';
import { cookies } from 'next/headers';
import Link from 'next/link'; // 对 next 内的 router 的跳转
import { Button } from '~/components/ui/button';
import { redirect } from 'next/navigation'
import { ScrollArea } from '~/components/ui/scroll-area';
import NotLoginIndexPage from '../chat/_comp/not_login';
import LoggedInIndexPage from '../chat/_comp/logged_in';
import { ChatsClientMain } from '../chat/_comp/ChatsClientMain';
import { SWRProvider } from '~/components/providers/swr-provider';
import { ChatsWithCount, listChat_by_userId } from '~/lib/db/q/user/chat';
import {ScrollShadow} from "@heroui/scroll-shadow";

export default async function AA() {
  const session = await server_auth();
  if (!session){
    return (
      <main className=''>
        <HomeHeader />
        <div className='overflow-auto h-full w-full'>
          <div className='min-h-12' />
          <NotLoginIndexPage />
        </div>
      </main>
    )
  }
  const chats: ChatsWithCount = await listChat_by_userId(session.user.id);
  const fallback = {
    '/api/hono/chats': chats
  }
  return (
  <SWRProvider value={{ fallback }}>
    <ScrollShadow hideScrollBar  className="h-screen absolute top-0 w-full">
      <div className='min-h-12' />
        {/* <LoggedInIndexPage session={session} chats={chats} /> */}
      <ChatsClientMain session={session} />
      {/* <Content /> */}
    </ScrollShadow>
  </SWRProvider>
  )
}
