import { ShadcnAvatar } from '~/components/common/avatar';
import { UserMeta } from '~/lib/schema/user';
import React, { Fragment } from 'react';
import NextImage from 'next/image'
import { useMsgQuery } from '~/hooks/use-chat-query';
import { ChatForDB } from '~/lib/db/q/user/chat';
import { Markdown } from '~/components/common/markdown';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "~/components/ui/context-menu"
import { MsgLsCursor } from '~/lib/routes/chats/messages';

export type ClientMessage =  {
  id: string;
  chat_id: string;
  sender_id: string;
  sender: UserMeta | null;
  content: string;
  created_at: Date; // utc
  status?: string
}
export interface ClientMessageI {
  id: string;
  chat_id: string;
  sender_id: string;
  sender: UserMeta | null;
  content: string;
  created_at: Date; // utc
  status?: string
}

interface MessageListProps {
  messages: ClientMessage[];
  targetUser: UserMeta;
  currentUser: UserMeta
  chat: ChatForDB
}

export const MessageListComp: React.FC<MessageListProps> = ({ messages,  targetUser, currentUser, chat }) => {
  const { data: msgLists, error, isLoading, size, setSize, mutate: mutateMsgs } = useMsgQuery(`/api/hono/chats/${chat.id}/msgs/cursor`)
  // console.log('data', data)
  // const msgs = data ? data.map((item) => item.items).flat() : []
  const msgs = msgLists ? msgLists.map((item) => item.items).flat() : messages
  return (
    <section className='flex flex-col-reverse  gap-6'>
      {/* {messages.map((message, index) => (
        <Fragment key={index}>
        <MessageItem
          id={message.id}
          senderId={message.sender_id}
          targetUser={targetUser}
          currentUser={currentUser}
          content={message.content}
          created_at={message.created_at}
        />
        </Fragment>
      ))} */}
      {msgs?.map((msg, index) => (
        <Fragment key={index}>
        <MessageItem
          id={msg.id}
          senderId={msg.sender_id}
          targetUser={targetUser}
          currentUser={currentUser}
          content={msg.content}
          created_at={msg.created_at}
        />
        </Fragment>
      ))}
      
    </section>
  );
};


interface MessageItemProps {
  id?: string;
  senderId: string;
  targetUser: UserMeta;
  currentUser: UserMeta;
  content: string;
  fileUrl?: string;
  created_at: Date;
  isUpdated?: boolean;
  deleted?: boolean;
  // 撤回的
  recall?: boolean;
}
export const MessageItem= ( {
  id, senderId, targetUser, currentUser, content, fileUrl, created_at, isUpdated, deleted, recall
}: MessageItemProps) => {
  const fileType = fileUrl?.split('.').pop()
  const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType?.toLowerCase() || '')
  const isOwn = senderId === currentUser.id
  // console.log('isOwn', isOwn, senderId, currentUser.id)
  const canRecall = isOwn && !recall
  return (
    <div className={`flex w-full  ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn ? <MsgAvatar src={targetUser.image?? `https://avatar.vercel.sh/${targetUser.name}`} alt={targetUser.name} />: <div className='min-w-10' />}
      <ContextMenu>
      <ContextMenuTrigger>
        <div className={`p-2 rounded-lg mx-2  ${isOwn ? 'bg-blue-500 text-white ' : 'bg-gray-200 text-black'}`}>
          {/* <div className="text-sm">{content}</div> */}
          <div className='flex flex-col' style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            {/* <Markdown> */}
              {content}
            {/* </Markdown> */}
          </div>
          <div className={`flex items-end ${isOwn ?'justify-end':''}`}>
          <small className={`text-xs opacity-50 ${isOwn ? 'text-end items-end ' : ''}`}>{new Date(created_at).toLocaleTimeString()}</small>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        右键菜单
      </ContextMenuContent>
      </ContextMenu>
      {isOwn ? <MsgAvatar src={currentUser.image?? `https://avatar.vercel.sh/${currentUser.name}`} alt={currentUser.name} />:<div className='min-w-10' />}
    </div>
  );
}

export const MsgAvatar = ({ src, alt, className, size, mdSize }: { src: string, alt: string, className?: string, size?: number, mdSize?: number, }) => {
  return <div className={`size-8 md:size-10  ${className}`}>
    <NextImage src={src} width={(size || 10)*4} height={(size || 10)*4} alt={alt} fill={false} className={`rounded-full min-w-8 md:min-w-10`} />
  </div>
}

