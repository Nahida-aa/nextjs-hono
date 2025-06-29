import { HomeHeader } from '~/components/layout/header/home-header'
import React from 'react'
import { cookies } from 'next/headers';
import Link from 'next/link'; // 对 next 内的 router 的跳转
import { Button } from '~/components/ui/button';
import { redirect } from 'next/navigation'
import { ScrollArea } from '~/components/ui/scroll-area';
import { Footer } from './_comp/Footer';


export default async function FriendPage() {
  // const [session, cookieStore] = await Promise.all([server_auth(), cookies()]);


  return (
    <main className=''>
      <section>
      user status
      </section>
      <Footer />
    </main>
  )
}
