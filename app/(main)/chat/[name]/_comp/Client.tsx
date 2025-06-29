'use client'
import { SubHeader } from '~/components/layout/header/sub-header'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { useMsgScroll, useScrollToBottom } from '~/hooks/use-scroll-to-bottom'
import { AlignJustify, CirclePlus, Mic, Plus, Send, Smile, Sparkles } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { MessageInput } from './MessageInput'
import { UserMeta } from '~/components/layout/sidebar/user-side-toggle'
import { useRouter } from 'next/navigation'
import {  MessageListComp, ClientMessage, ClientMessageI } from './MessageList'
import { toast as sonner_toast } from "sonner"
import { SocketIndicator } from '~/components/common/socket-indicator'
import { Input } from '~/components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useSWR from 'swr' //pnpm add swr SWR 的缓存是存储在内存中的，这意味着当页面刷新或应用重新加载时，缓存的数据会丢失
import { fetcher, generateUUID } from '~/lib/utils'
import { UserMetaWithStatus } from '~/lib/routes/users/get'
import { Textarea } from '~/components/ui/textarea'
import NextImage from 'next/image'
import { ListUserChatMessages } from '~/lib/db/q/user/msg'
import { ChatForDB } from '~/lib/db/q/user/chat'
import { useMsgQuery } from '~/hooks/use-chat-query'
import { MsgLsCursor } from '~/lib/routes/chats/messages'
import next from 'next'
import { useSocket } from '~/components/providers/socket-provider'
import { useMsgSocket } from '~/hooks/use-chat-ws'

type ApiSendMessageParm =  {
  message: ClientMessageI
  target_id: string
  target_type: string
}
export type ApiSendMessageBody = ApiSendMessageParm

const saveFailedMessage = (message: ClientMessage) => {
  const failedMessages = JSON.parse(localStorage.getItem('failedMessages') || '[]');
  failedMessages.push(message);
  localStorage.setItem('failedMessages', JSON.stringify(failedMessages));
};

export const ChatMain = ({
  decodeURLComponentName,
  dbChat,
  sessionUser,
  targetUser_forServer,
  msgListForDB,
}: {
  decodeURLComponentName: string,
  dbChat: ChatForDB,
  sessionUser: UserMeta,
  targetUser_forServer: UserMetaWithStatus,
  msgListForDB: MsgLsCursor
}) => {  
  const msgListKey = `/api/hono/chats/${dbChat.id}/msgs/cursor`
  const { data: msgLists, error, isLoading: msgsIsLoading, size, setSize, mutate: mutateMsgLists, hasNextPage, fetchNextPage } = useMsgQuery(msgListKey)
  console.log('ChatMain::msgLists', msgLists)
  // const msgs = data ? data.map((item) => item.items).flat() : []

  const [clientMessageList, setClientMessageList] = useState<MsgLsCursor>(msgListForDB)
  
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    adjustHeight()
  }, []);
  
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>()
  useMsgScroll({ msgLsRef: messagesContainerRef, bottomRef: messagesEndRef, shouldLoadMore: hasNextPage, loadMore: fetchNextPage, count: size })

  const adjustHeight = () => {
    if (textareaRef.current) {
      console.log('resizeTextarea', textareaRef.current.scrollHeight)
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      messagesEndRef.current!.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  const resetHeight = () => {
    textareaRef.current!.style.height = 'auto';
    messagesEndRef.current!.style.height = 'auto';
  }
  
  const updateDate = (newMessage: ClientMessageI) => {
    const newClientMessageList = {items:[newMessage, ...clientMessageList.items], next_cursor: clientMessageList.next_cursor}
    console.log('updateDate::newClientMessageList', newClientMessageList)  // 变成 1+30
    setClientMessageList(newClientMessageList); // react state 更新 
    console.log('updatedDate::clientMessageList', clientMessageList) // 会变成: 30
    mutateMsgLists((oldMsgLists) => {
      if (!oldMsgLists) return [{items: [newMessage]}]
      return [{items: [newMessage]}, ...oldMsgLists]
    }, false); // 乐观更新
    console.log('updateDate::mutateMsgLists::data', msgLists)
    console.log('updateDate::mutateMsgLists::size: ', size)
  }
    
  const { socket } = useSocket();
  // useMsgSocket({ socket, chatId: dbChat.id, updateDate })
  useEffect(() => {
    if (socket && dbChat.id) {
      // socket.emit('joinChatRoom', chatId);
      // console.log('client send joinChatRoom', chatId)
      const handleMessage = (newMessage: ClientMessageI) => {
        console.log('client receive message', newMessage)
        updateDate(newMessage)
      };
      // socket.on('message', handleMessage); // 由于 socket room 机制 可能因为环境等问题 受到影响
      socket.on(`$chat:${dbChat.id}:message`, handleMessage);
      return () => {
        // socket.emit('leaveChatRoom', chatId);
        // socket.off('message', handleMessage);
      };
    }
  }, [socket, dbChat.id]);
    
  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length <= 4500) {
      setContent(event.target.value);
      adjustHeight();
    } else {
      sonner_toast.info('Message is too long!');
    }
  };
  

  const apiSendMessage = async ({
    message, target_id, target_type
  }:ApiSendMessageParm) => {
    try {
      // const res = await fetch(`/api/hono/chats/messages`, {
        const res = await fetch(`/api/socket/msg`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message, target_id, target_type }),
        });
        const ret = await res.json();
        if (res.ok) {
          sonner_toast.success(`Message sent: ${content}`);
          return ret;
        } else {
          sonner_toast.warning(`An error occurred: ${ret.message}`);
        }
    } catch (error: any) {
      
      console.error(error.message)
      sonner_toast.error(`An error occurred: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }
  async function onSend() {
    setContent('')
    resetHeight();
    setIsLoading(true)
    sonner_toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify({
            target_id: targetUser_forServer.id,
            content: content,
            target_type: 'user'
          }, null, 2)}</code>
        </pre>
      ),
    })
    const newMessage: ClientMessageI = {
      id: Date.now().toString(),
      chat_id: dbChat.id,
      sender_id: sessionUser.id,
      sender: sessionUser,
      content: content,
      created_at: new Date(),
      status: 'pending' // 'pending' | 'sent' | 'received' | 'read' | 'failed' | 'resending'
    };
  
    updateDate(newMessage)
  
    await apiSendMessage({message: newMessage,target_id: targetUser_forServer.id,target_type: 'user'})
  }
  
  return <>
    <SubHeader justify="between"> 
      <div className="flex gap-2 items-center">
        <Badge variant="secondary" className="px-1.5 min-w-6 h-6">13</Badge>
        {/* <NextImage src={targetUser_forServer.image} width={32} height={32} alt={targetUser_forServer.name} className='rounded-full' /> */}
        <Button 
        className='flex pt-0 
        pb-[0.125rem]
        px-1 mt-[0.125rem] h-8 gap-0 flex-col items-start ' 
        variant={'ghost'} onClick={() => {
          router.push(`/${decodeURLComponentName}`)
        }}
        >
          <div className="text-[0.8rem] font-medium leading-[1.25rem]">{targetUser_forServer?.nickname || targetUser_forServer?.name || "Guest"}</div>
          <div className='text-xs text-gray-400 leading-3'>{targetUser_forServer.status}</div>
        </Button>

      </div>
      <SocketIndicator />
      <div className="flex items-center">
        <Button variant='ghost' size="icon" className='p-0 gap-0 size-8 mr-1'>
          <AlignJustify size={24} className='min-w-6 min-h-6 opacity-50' />
        </Button>
      </div>
    </SubHeader>
    {/* overflow-y-auto */}
    <div 
      ref={messagesContainerRef}
      className=" h-screen  w-full top-0  px-4 flex flex-col flex-1  gap-6 overflow-y-scroll aa-scroll " 
    >
      <div className='h-12 py-1.5 min-h-12' />
      <MessageListComp
        messages={clientMessageList.items}
        targetUser={targetUser_forServer} currentUser={sessionUser} chat={dbChat} />
      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] h-auto min-h-12 max-h-[calc(75dvh)]"
      />
    </div>
    <footer className="w-full absolute bottom-0 h-auto p-2 px-3 bg-card/80 backdrop-blur-md z-10">
      <div  className="w-full flex gap-2">
          {content ? <Button
            className={`size-8 min-w-8 p-0 bg-muted absolute bottom-2 text-primary-foreground rounded-full [&>svg]:size-5 [&_svg]:size-5  `}
            size='icon' variant='ghost'
            disabled={content===''}
          >
            <Sparkles
              size={20}
              className={` opacity-75 cursor-pointer `}
              onClick={() => {}}
            />
          </Button> : <Button
            className={`size-8 min-w-8  p-0 bg-muted absolute bottom-2 text-primary-foreground rounded-full [&>svg]:size-5 [&_svg]:size-5  `}
            size='icon' variant='ghost'
          >
            <Mic
              size={20}
              className={` opacity-75 cursor-pointer}`}
              onClick={() => {}}
            />
          </Button>}
          <div className='relative w-full ml-10'>
            <Textarea
              className=' min-h-8 max-h-[calc(75dvh)]   py-1 pl-2 pr-9 border-0  outline-0 rounded-2xl md:text-base
              focus-visible:ring-0 resize-none
              focus-visible:ring-offset-0 bg-muted aa-scroll-hidden'
              rows={1}
              ref={textareaRef}
              value={content}
              onChange={handleInput}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  // if (isLoading) {
                  //   sonner_toast.error('Please wait for the model to finish its response!');
                  // } else 
                  if (content) {
                    onSend();
                  }
                }
              }}
            />
            {/* <small className='absolute right-0 bottom-8 text-xs'>{content.length}</small> */}
            <Button
              className="size-8 min-w-8 p-0  rounded-full [&>svg]:size-5 [&_svg]:size-5 absolute  bg-muted right-0 bottom-0"
              variant='ghost'
              ><Smile className=' absolute  transform opacity-75 cursor-pointer' />
            </Button>
          </div>
          <div className='size-8 min-w-8'>
            {content ? <Button
              className="size-8 min-w-8 p-0  rounded-full [&>svg]:size-5 [&_svg]:size-5 
              absolute bottom-2"
              size='icon' 
              disabled={content==='' || isLoading}
              onClick={onSend}
            >
              <Send className='absolute bottom-[5px] left-[5px] opacity-80 ' size={20}  />
            </Button> : 
            <Button
              className="size-8 min-w-8 p-0 rounded-full [&>svg]:size-5 [&_svg]:size-5 absolute bottom-2 bg-muted"
              variant='ghost'
              ><Plus className='opacity-75' /></Button>
            }
          </div>
      </div>
    </footer>
  </>
}
