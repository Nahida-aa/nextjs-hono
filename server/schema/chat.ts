import { Group } from "../db/schema/group";


type User = {
  id: string;
  chats: Chat[]; // ChatLinkUser
  groups: Group[];
}

// msg 通知逻辑: 
// type=='user'时

type Chat = {
  id: string;
  latest_message: string;
  latest_message_count: number;
  latest_message_timestamp: Date;
  latest_sender_id: string;
  latest_sender: User;
  type: string; // 'user' or 'group' or self
  group_id?: string;
  group?: Group;
  created_at: Date;
  users: User[]; // ChatLinkUser
  messages: Message[];
}

type Message = {
  id: string;
  chat: Chat;
  chat_id: string;
  sender_id: string;
  sender: User;
  content: string;
  created_at: Date;
  updated_at: Date;
}