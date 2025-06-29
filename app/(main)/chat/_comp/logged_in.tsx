import React from 'react';
import { ChatsWithCount, listChat_by_userId } from '~/lib/db/q/user/chat';
// import { UserMeta } from '~/lib/types';
import { Button } from '~/components/ui/button';
import { UserMeta } from '~/components/layout/sidebar/user-side-toggle';

export default async function LoggedInIndexPage({ 
  session, className, chats
}: { 
  session: { user: UserMeta, token: string };
  className?: string; 
  chats: ChatsWithCount;
}) {
  try {
    console.log('chats: ', chats);
    if (!chats || chats.count === 0) return <div>没有聊天记录</div>;
    return (
      <main className='space-y-2'>
        <span>server当前登录了哦</span>
        <pre>
          <code>
            {JSON.stringify(chats.count, null, 2)}
          </code>
        </pre>
      </main>
    );
  } catch (error: any) {
    console.error('Error in LoggedInIndexPage:', error);
    return <div>发生错误: {error.message}</div>;
  }
}