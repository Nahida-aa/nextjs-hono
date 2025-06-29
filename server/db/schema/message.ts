import { relations, type InferSelectModel } from 'drizzle-orm';
import { pgTable, varchar, index, timestamp, serial, integer, uniqueIndex, boolean, foreignKey, primaryKey, uuid, json, jsonb } from "drizzle-orm/pg-core"
import { timestamps, uuidCommon } from "./columnsHelpers"
import { user_table } from "./user";
import { group_table } from "./group";

export const message_table = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chat_id: uuid("chat_id").notNull().references(() => chat_table.id),
  sender_id: uuid("sender_id").notNull().references(() => user_table.id),
  content: varchar("content").notNull(),
  ...timestamps,
}, (table) => [
  index('created_at_idx').on(table.created_at),
]);

export const messageRelations = relations(message_table, ({ one }) => ({
  chat: one(chat_table, {
    fields: [message_table.chat_id],
    references: [chat_table.id]
  }),
  sender: one(user_table, {
    fields: [message_table.sender_id],
    references: [user_table.id]
  }),
}));

export const chat_table = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  latest_message: varchar("latest_message", { length: 256 }), // 最新消息内容
  latest_message_count: integer("latest_message_count").default(0).notNull(), // 最新消息数量
  latest_message_timestamp: timestamp("latest_message_timestamp").defaultNow().notNull(), // 最新消息时间戳
  latest_sender_type: varchar("latest_sender_type", { length: 64 }).notNull(), // user, system
  latest_sender_id: uuid("latest_sender_id").references(() => user_table.id), // 最新消息发送者ID
  type: varchar("type", { length: 64 }).notNull(), // 'user' or 'group' or self
  group_id: uuid("group_id").references(() => group_table.id), // 仅在群聊时使用
  created_at: timestamp("created_at").defaultNow().notNull(),
});


export const chatRelations = relations(chat_table, ({ many, one }) => ({
  users: many(link_chat_user_table),
  messages: many(message_table),
  latest_sender: one(user_table, {
    fields: [chat_table.latest_sender_id],
    references: [user_table.id]
  }),
  group: one(group_table, {
    fields: [chat_table.group_id],
    references: [group_table.id]
  }),
}));

export const link_chat_user_table = pgTable("LinkChatUser", {
  chat_id: uuid("chat_id").notNull().references(() => chat_table.id),
  user_id: uuid("user_id").notNull().references(() => user_table.id),
  is_pinned: boolean("is_pinned").default(false).notNull(),
  target_user_id: uuid("target_user_id").references(() => user_table.id), // 新增字段
  target_group_id: uuid("target_group_id").references(() => group_table.id), // 新增字段
}, (table) => [
  primaryKey({columns:[table.chat_id, table.user_id]})
]);

export const link_chat_user_relations = relations(link_chat_user_table, ({ one }) => ({
  chat: one(chat_table, {
    fields: [link_chat_user_table.chat_id],
    references: [chat_table.id]
  }),
  user: one(user_table, {
    fields: [link_chat_user_table.user_id],
    references: [user_table.id]
  }),
  target_user: one(user_table, {
    fields: [link_chat_user_table.target_user_id],
    references: [user_table.id]
  }),
  target_group: one(group_table, {
    fields: [link_chat_user_table.target_group_id],
    references: [group_table.id]
  }),
}))