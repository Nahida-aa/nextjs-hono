'use client';
import { ChevronUp } from 'lucide-react';
import Image from 'next/image';
// import type { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';
import { client_logout, client_sign_out } from '~/app/(auth)/client';
import { UserMeta } from '~/components/layout/sidebar/user-side-toggle';

interface UserAvatarProps {
  user?: UserMeta 
  className?: string;
  status?: string;
}
export const UserAvatar = ({   
  user,
  className,
  status = "offline",
}: UserAvatarProps
)=> {
  const img_src = user?.image ?? `https://avatar.vercel.sh/${user?.email}`
  return (
<div className='relative size-10 p-1'>
  <Image
    src={img_src}
    alt={user?.name ?? 'User Avatar'}
    width={32}
    height={32}
    className="rounded-full hover:glow-purple-box-shadow"
  />
    <span className={`absolute bottom-1 right-1 w-2 h-2  border-1 rounded-full 
${status === "online" ? 'bg-green-500' : 'bg-gray-500'}
`}></span>
</div>
  )
}
export interface SidebarUserNavProps {
  user?: UserMeta 
  className?: string;
  status?: string;
}
export function SidebarUserNav({ 
  user,
  className,
  status = "offline",
}: SidebarUserNavProps
) {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const isGuest = !user;
  const img_src = user?.image ?? `https://avatar.vercel.sh/${user?.email}`
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background/20 data-[state=open]:text-sidebar-accent-foreground h-10 p-1">
              <UserAvatar user={user} status={status} />
              <span className="truncate">{isGuest ? "未登录" : user?.name}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => {
                  if (isGuest) {
                    router.push('/sign-in'); // 导航到登录页面
                    // router.push('/login'); // 导航到登录页面
                  } else {
                    // signOut({
                    // client_sign_out({
                    client_logout({
                      redirectTo: '/',
                    })
                  }
                }}
              >
                {isGuest ? 'Sign in' : 'Sign out'}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
