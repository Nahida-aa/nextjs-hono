import { SubHeader } from "~/components/layout/header/sub-header"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { AlignJustify } from "lucide-react"
import { useState } from "react"
import { MessageInput } from "./_comp/MessageInput"
import { ChatMain } from "./_comp/Client"
import * as qUser from '~/lib/db/q/qUser'
import * as qChat from '~/lib/db/q/user/chat'

import { Loading } from "~/components/ui/loading/Loading"
import { redirect } from 'next/navigation'
import { db } from "~/lib/db"
import { user_table } from "~/lib/db/schema/user"
import { eq } from "drizzle-orm";
import { listMessageWithSender_by_chatId_cursor, listUserChatMessages } from "~/lib/db/q/user/msg"
import { SWRProvider } from "~/components/providers/swr-provider"
import { server_auth } from "~/app/(auth)/auth"
import { MsgLsCursor } from "~/lib/routes/chats/messages"

export default async function AddFriendByNamePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  'use server'
  const { name } = await params
  console.log('name', name)
  const decodeURLComponentName = decodeURIComponent(name)
  const [session, dbUser] = await Promise.all([server_auth(), qUser.getMetaByName(decodeURLComponentName)]);
  if (!session) return redirect('/sign-in')
  if (!dbUser) return <div>Not Found user: {decodeURLComponentName}</div>

  const dbChat = await qChat.getOrCreateChat(session.user.id, dbUser.id)
  console.log('dbChat', dbChat)
  // const msgLs_forServer = await listUserChatMessages(session.user.id, dbUser.id, 0, 30)
  // console.log('msgLs_forServer', msgLs_forServer)
  const msgListKey = `/api/hono/chats/${dbChat.id}/msgs/cursor`

  const [msgList,]: [MsgLsCursor,] = await Promise.all([listMessageWithSender_by_chatId_cursor(dbChat.id),]);
  const fallback = {
    [msgListKey]: msgList
  }
  return <SWRProvider 
  value={{ fallback }}
  ><main className="flex flex-col h-dvh">
    <ChatMain decodeURLComponentName={decodeURLComponentName} sessionUser={session.user} targetUser_forServer={dbUser}
      msgListForDB={msgList}
      dbChat={dbChat}
    /> 
  </main>
  </SWRProvider>
}