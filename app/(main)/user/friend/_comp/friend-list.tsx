'use client'
import { ShadcnAvatar } from '~/components/common/avatar';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '~/components/ui/sidebar';
import { UserLsWithCount } from '~/lib/db/q/user/friend';
import { UserListIsFriend_ApiResBody } from '~/lib/routes/friend/list';
import { useEffect, useState } from 'react';
import { toast as sonner_toast } from "sonner"

export const FriendList = () => {
  const [friends, setFriends] = useState<UserLsWithCount['users']>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch('/api/hono/user/list/is_friend');
        const data: UserListIsFriend_ApiResBody = await res.json()
        if (res.ok) {
          const userData = data as UserLsWithCount;
          // sonner_toast.success('Friends loaded');
          setFriends(userData.users)
        } else {
          const errorData = data as { message: string };
          sonner_toast.warning(errorData.message);
        }
      } catch (error: any) {
        sonner_toast.error(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [])
  
  return <SidebarGroup className='p-0 bg-muted/60'>
    <SidebarGroupLabel>A</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu className=' '>
        {friends.map((friend) => (
          <SidebarMenuItem key={friend.id}>
            <SidebarMenuButton className='p-3 h-12 rounded-none'>
              <ShadcnAvatar src={friend.image??`https://avatar.vercel.sh/${friend.name}`} size={8} className='my-3 ' />
              <div className='h-8'>
                <div className='text-xs'>{friend.nickname || friend.name}</div>
                <div className='text-xs opacity-50'>[离线]</div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
}