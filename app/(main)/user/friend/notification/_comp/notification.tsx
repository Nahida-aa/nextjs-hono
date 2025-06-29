'use client'
import { ShadcnAvatar } from '~/components/common/avatar'
import { Button } from '~/components/ui/button'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '~/components/ui/sidebar'
import { FriendNotificationList_ApiResBody, FriendNotificationList_ApiResBody_OK } from '~/lib/routes/friend/notification'
import router from '~/lib/routes/test'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { Suspense, useEffect } from 'react'
import {Button as UIButton} from "@heroui/react";
import { toast as sonner_toast } from "sonner"

export const FriendNotificationList = ({
  sessionUserId,
}: {
  sessionUserId: string
}) => {
  const router = useRouter()
  const [items, setItems] = React.useState<FriendNotificationList_ApiResBody_OK['notifications']>([])
  const [isLoading, setIsLoading] = React.useState(true)
  useEffect(() => {
    console.log('FriendNotificationList')
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/hono/friend/notification/list')
        const data: FriendNotificationList_ApiResBody = await res.json()
        if (res.ok) {
          const okData = data as FriendNotificationList_ApiResBody_OK
          setItems(okData.notifications)
          console.log(data)
        } else {
          const errorData = data as { message: string }
          sonner_toast.warning(errorData.message)
          // console.error(errorData.message)
        }
      } catch (error: any) {
        sonner_toast.error(error.message)
        console.error(error)
      }
      setIsLoading(false)
    }
    fetchNotifications()
  }, [])
  if (isLoading) return <div>Loading...</div>
  return <SidebarMenu className='gap-0'>
      <Suspense fallback={<div>Loading...</div>}>
      {items.slice(0, 3).map((item) => {
        const isSender = item.notification.sender_id === sessionUserId
        const img_src = isSender ? item.receiver.image : item.sender.image
        const nickname = isSender ? item.receiver.nickname : item.sender.nickname
        const name = isSender ? item.receiver.name : item.sender.name
        const msg = isSender ? '请求添加对方为好友' : item.notification.content
        return (
          <SidebarMenuItem key={item.notification.id}>
            <SidebarMenuButton className='flex cursor-pointer hover:bg-sidebar-accent p-3 h-auto rounded-none justify-between'>
              <div className='flex  gap-3'>
                <ShadcnAvatar src={img_src} size={12} className='' />
                <div className=' flex flex-col justify-center gap-1'>
                  <div className='text-xs'>{nickname || name}</div>
                  <div className='text-xs opacity-50'>{msg}</div>
                </div>
              </div>
              {isSender ? (<>{item.notification.status === 'pending' ? (<>
                <div className='px-4 py-2'>
                  <span className='opacity-50'>等待验证</span>
                </div>
              </>):(<></>)}
              </>) : (<>{item.notification.status === 'pending' ? (<>
                <Button variant='outline' className='bg-background/20' onClick={async(e: any) => {
                  // 阻止事件冒泡
                  e.stopPropagation()
                  try {
                    const res = await fetch("/api/hono/user/friend/request/accept", {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ notification_id: item.notification.id, sender_id: item.notification.sender_id, content: "我们已经成功添加为好友,现在可以开始聊天啦~" }),
                    })
                    if (res.ok) {
                      sonner_toast("添加成功")
                      sessionStorage.setItem(`/user/friend/add/${name}/setting`, JSON.stringify(item.sender));
                      router.push(`/user/friend/add/${name}/setting`) // 好友设置(备注, 分组, 权限(聊天+动态等\仅聊天), 动态(不让ta看,不看ta), 完成)
                    } else {
                      const result = await res.json()
                      sonner_toast.warning(`An error occurred: ${result.message}`)
                    }
                  } catch (error: any) {
                    console.error(error);
                    sonner_toast.error(`An error occurred: ${error.message}`)
                  }
                }}>accept</Button>
              </>):(<>
                <div className='px-4 py-2'>
                  <span className='opacity-50'>
                    accepted
                  </span>
                </div></>)}
              </>)}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      )}
      {items.length > 3 && (
        <SidebarMenuItem >
          <SidebarMenuButton  className=' h-8 p-3 justify-center rounded-none'>
              <span className='opacity-65'> View more
              </span><ChevronRight className='opacity-65' />
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
  </Suspense>
    </SidebarMenu>
}
