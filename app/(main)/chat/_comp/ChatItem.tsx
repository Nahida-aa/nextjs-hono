import type { ChatsWithCount } from '~/lib/db/q/user/chat';
import {Listbox, ListboxItem} from "@heroui/react";
import NextImage from 'next/image'
import {Button} from "@heroui/react";
import { toast as sonner_toast } from "sonner"
import { useRouter } from 'next/navigation';
import { formatTimestamp } from '~/lib/utils';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '~/components/ui/context-menu';
import { useEffect, useRef, useState } from 'react';
import { GroupAvatar } from '~/components/common/avatar';

interface ChatListProps {
  chatsWithCount?: ChatsWithCount
}
export const ChatList = ({ 
  chatsWithCount 
} : ChatListProps) => {
  return (
    <ul className=" bg-content">
      {chatsWithCount?.items.map(item => (
        <ChatItem key={item.chat.id} item={item} />
      ))}
    </ul>
  );
};

export const ChatItem = ({
  item
}: {
  item: ChatsWithCount['items'][0]
}) => {
  const type = item.chat.type;
  const target = type === 'group' ? item.target_group : item.target_user
  const avatar_url = target?.image
  const avatar_url_ls = type === 'group' ? item.target_group?.members?.map((m) => m.image) as string[] : []
  const images = ["https://avatar.vercel.sh/test1", "https://avatars.githubusercontent.com/u/96083926?s=80&v=4", "https://avatars.githubusercontent.com/u/188596056?v=4"]
  const timestamp = new Date(item.chat.latest_message_timestamp);
  const formattedTime = formatTimestamp(timestamp);
  const router = useRouter();

  const handlePressEnd = () => {
    router.push(`/chat/${target?.name}`)
  }
  return (
    <li className='flex'>
      <ContextMenu >
      <ContextMenuTrigger asChild onClick={handlePressEnd}>
        <Button variant="light" className='w-full h-auto rounded-none hover:bg-sidebar-accent justify-start px-3 py-2 data-[focus-visible=true]:bg-sidebar-accent data-[focus-visible=true]:outline-0' 
        // onPressStart={handlePressStart}
        // onPressEnd={handlePressEnd}
        // onPressUp={handlePressEnd}
        >
          {type === 'group' && !avatar_url ? (<GroupAvatar images={avatar_url_ls} size={48} />):(<NextImage src={target?.image || ''} width={48} height={48} alt={target?.name || 'no'} fill={false} className={`rounded-full min-w-12`} />)}

          <div className='flex flex-col flex-1'>
            <div className='flex justify-between'>
              <span>{target?.name}</span>
              <span className='text-sm  text-muted-foreground'>
              {formattedTime}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>{item.chat.latest_message}</span>
            </div>
          </div>
        </Button>
      </ContextMenuTrigger>
        <ContextMenuContent>
          右键菜单
        </ContextMenuContent>
      </ContextMenu>
    </li>
  );
}
