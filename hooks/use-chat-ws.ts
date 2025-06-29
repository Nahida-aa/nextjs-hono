'use client';
import { useEffect } from "react";
import { SocketContextType, useSocket } from "~/components/providers/socket-provider";
import { ClientMessageI } from "~/app/(main)/chat/[name]/_comp/MessageList";
import { useMsgQuery } from "./use-chat-query";
import { SWRInfiniteKeyedMutator } from "swr/infinite";
import { MsgLsCursorI } from "~/lib/routes/chats/messages";
import { Socket } from "socket.io-client";

type MsgSocketProps = {
  socket: Socket|null;
  chatId: string;
  updateDate: (newMessage: ClientMessageI) => void;
}

// TODO: 不知道为啥 不能正常工作, 除非直接在组件中编写此逻辑
export const useMsgSocket = ({
  socket,
  chatId,
  updateDate,
}: MsgSocketProps) => {
  const wsChatRoomKey = `chat:${chatId}`;
  useEffect(() => {
    if (socket && chatId) {
      // socket.emit('joinChatRoom', chatId);
      // console.log('client send joinChatRoom', chatId)
      const handleMessage = (newMessage: ClientMessageI) => {
        console.log('client receive message', newMessage)
        updateDate(newMessage)
      };
      // socket.on('message', handleMessage); // 由于 socket room 机制 可能因为环境等问题 受到影响
      socket.on(`${wsChatRoomKey}:message`, handleMessage);
      return () => {
        socket.emit('leaveChatRoom', chatId);
        // socket.off('message', handleMessage);
      };
    }
  }, [socket, chatId, updateDate]); // socket, chatId, updateDate
}