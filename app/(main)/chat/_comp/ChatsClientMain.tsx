'use client'
import React, { useEffect, useState } from 'react';
import { ChatsWithCount, listChat_by_userId } from '~/lib/db/q/user/chat';
// import { UserMeta } from '~/lib/types';
import { Button } from '~/components/ui/button';
import { UserMeta } from '~/components/layout/sidebar/user-side-toggle';
import { toast as sonner_toast } from "sonner"
import { ChatsWithCountApiResBody } from '~/lib/routes/chats';
import useSWR from 'swr';
import { fetcher } from '~/lib/utils';
import { NetworkIcon, WifiOffIcon } from 'lucide-react';
import { CodeBlock } from '~/components/common/md/pre';
import { ChatList} from './ChatItem';

export function ChatsClientMain({ 
  session, className 
}: { 
  session: { user: UserMeta, token: string };
  className?: string; 
}) {
  const { data: chatLsWithCount, error, isLoading } = useSWR<ChatsWithCount>('/api/hono/chats', fetcher)
  try {
    // const chats = await chatList_by_userId(session.user.id);
    // if (!chats || chats.length === 0) return <div>没有聊天记录</div>;
    return (
      <main className='space-y-2 bg-background/80'>
        {/* {isOnline ? (
          <>
            <NetworkIcon className="h-8 w-8 text-green-500" />
            <span className="text-green-500">Online</span>
          </>
        ) : (
          <>
            <WifiOffIcon className="h-8 w-8 text-red-500" />
            <span className="text-red-500">Offline</span>
          </>
        )} */}
        <ChatList chatsWithCount={chatLsWithCount} />
        <CodeBlock value={JSON.stringify(chatLsWithCount, null, 2)} language='json' 
          options={{ lineNumbers: 'on',
            wrapLines:true,
          }} />
        {/* <HomeHeader user={session?.user} /> */}
        <Button className='h-auto'>
          <a href="/api/hono" target="_blank">
            去 api 交互文档(Scalar UI)
          </a>
        </Button><br />
        <Button className='h-auto w-full'>
          <a href="/docs" target="_blank" className="w-full">
            去 api 交互文档(Swagger UI)<br />
            样式有问题, 我没完整的进行修复, 不建议使用, <br />
            因为我有提供 openapi.json 可以下载<br />
            或复制源代码
          </a>
        </Button><br />
        <Button>
          <a href="/api/hono/doc" target="_blank">
            去 openapi.json 
          </a>
        </Button><br />
        <Button>
          <a href="https://api.Nahida-aa.us.kg" target="_blank" >
            去 api 交互文档(FastApi)(已废弃)
          </a>
        </Button>
      </main>
    );
  } catch (error: any) {
    console.error('Error in LoggedInIndexPage:', error);
    return <div>发生错误: {error.message}</div>;
  }
}