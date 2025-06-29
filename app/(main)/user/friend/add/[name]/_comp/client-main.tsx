'use client';
import { ShadcnAvatar } from '~/components/common/avatar';
import { User_whenAddFriend, UserLsWithCount_whenAddFriend } from '~/lib/db/q/user/friend';
import React, { useEffect, useState } from 'react'
import { ClientFrom } from './from';

export const ClientMain =  ({
  name,
}: {
  name: string
}) => {
  const [userData, setUserData] = useState<User_whenAddFriend | null>(null)
  useEffect(() => {
    const storedResults = sessionStorage.getItem('searchResults');
    if (storedResults) {
      const results = JSON.parse(storedResults) as UserLsWithCount_whenAddFriend
      const user = results.users.find((user) => user.name === name) ?? null
      setUserData(user);
    }
  }, []);
  if (!userData) {
    return <div>loading...</div>
  }
  const img_src = userData?.image ?? `https://avatar.vercel.sh/${name}`
  return <main className='max-w-[400px] mx-auto'>
    <div className="flex gap-4 pb-6">
      <ShadcnAvatar src={img_src} size={14} className='size-14' />
      <span className="text-xl">
        {name} 
      </span>
    </div>
    <ClientFrom receiver_id={userData?.id}  />
  </main>
}
