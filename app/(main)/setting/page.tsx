// import { HomeHeader } from '~/components/layout/header/home-header'
import React from 'react'
import { cookies } from 'next/headers';
import Link from 'next/link'; // 对 next 内的 router 的跳转
import { Button } from '~/components/ui/button';
import { redirect } from 'next/navigation'
import { ScrollArea } from '~/components/ui/scroll-area';
import { server_auth } from '~/app/(auth)/auth';
import { SubHeader } from '~/components/layout/header/sub-header';
import { Bell, FileUser, LogIn, LogOut, MessageCircleQuestion, Palette, PencilLine, PersonStanding, Plus, QrCode, Search, Settings, Star, UserRound } from 'lucide-react';
import { Input } from "~/components/ui/input"
import SearchButton from '../user/friend/add/_comp/search-button';
import { Card } from '~/components/ui/card';
import { SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '~/components/ui/sidebar';
import { ShieldLockIcon } from '~/components/icons';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import LogoutButton from '~/app/(auth)/_comp/LogoutButton';

const baseSettings = [
  { name: 'Account and security', url: '/setting/account', icon: () => <UserRound /> },
  { name: 'social contact', url: '/setting/social', icon: () => <MessageCircleQuestion /> },
  { name: 'Data security', url: '/setting/security', icon: () => <ShieldLockIcon /> },
]
const accessSettings = [
]
const applicationSettings = [
  { name: 'Appearance', url: '/setting/appearance', icon: () => <Palette /> },
  { name: 'Accessibility', url: '/setting/accessibility', icon: () => <PersonStanding /> },
  { name: 'Notifications', url: '/setting/notifications', icon: () => <Bell /> },
]

export default async function SettingPage() {
  const [session, cookieStore] = await Promise.all([server_auth(), cookies()]);
  
  return (<>
    <SubHeader 
      justify='center'
      className='sticky top-0 z-10' > 
      Settings
    </SubHeader>
    <main className='bg-card/80 h-full '>
      <SearchButton router_push='/setting/search' />
      <SidebarGroup className='p-4 pb-0'>
        <SidebarGroupContent>
          <SidebarMenu className='bg-muted rounded-md'>
            {baseSettings.map((baseSetting) => (
              <SidebarMenuItem key={baseSetting.name}>
                <SidebarMenuButton asChild className='h-12 p-3'>
                  <a href={baseSetting.url}>
                    <baseSetting.icon />
                    <span>{baseSetting.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup className='p-4 pb-0'>
        <SidebarGroupLabel>Application settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className='bg-muted rounded-md'>
            {applicationSettings.map((applicationSetting) => (
              <SidebarMenuItem key={applicationSetting.name}>
                <SidebarMenuButton asChild className='h-12 p-3'>
                  <a href={applicationSetting.url}>
                    <applicationSetting.icon />
                    <span>{applicationSetting.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup className='p-4 pb-0'>
        <SidebarGroupContent>
        <SidebarMenu className='bg-muted rounded-md'>
              <SidebarMenuItem>
                <Dialog>
                  <DialogTrigger asChild>
                    <SidebarMenuButton className='h-12 p-3' >
                      <LogOut />
                      <span>Logout
                      </span>
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Logout</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to log off ?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className='flex-row justify-center gap-8'>
                        <DialogClose asChild>
                          <Button variant='outline'>Cancel</Button>
                        </DialogClose>
                        <LogoutButton />
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </main>
  </>)
}



