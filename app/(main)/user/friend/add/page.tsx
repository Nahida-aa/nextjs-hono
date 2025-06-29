import { HomeHeader } from '~/components/layout/header/home-header'
import React from 'react'
import { cookies } from 'next/headers';
import Link from 'next/link'; // 对 next 内的 router 的跳转
import { Button } from '~/components/ui/button';
import { redirect } from 'next/navigation'
import { ScrollArea } from '~/components/ui/scroll-area';
import { server_auth } from '~/app/(auth)/auth';
import { SubHeader } from '~/components/layout/header/sub-header';
import { Search } from 'lucide-react';
import { Input } from "~/components/ui/input"
import SearchButton from './_comp/search-button';

export default async function AddFriendPage() {
  const [session, cookieStore] = await Promise.all([server_auth(), cookies()]);



  return (<>
    <SubHeader justify='center'
      className='sticky top-0 z-10' > 
      Find Friend 
    </SubHeader>
    <main className='bg-card/80 h-full'>
        {/* <Input
          type='text'
          placeholder='name\email\phone'
          className='w-full max-w-xs focus-visible:ring-1 focus-visible:ring-offset-0'
        /> */}
      <SearchButton router_push='/user/friend/add/search' placeholder='name\nickname\email\phone...' />
    </main>
  </>)
}
