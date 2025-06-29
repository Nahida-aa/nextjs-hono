import { relations, type InferSelectModel } from 'drizzle-orm';
import { pgTable, varchar, index, timestamp, serial, integer, uniqueIndex, boolean, foreignKey, primaryKey, uuid, json, jsonb } from "drizzle-orm/pg-core"
import { timestamps, uuidCommon } from "./columnsHelpers"
import { user_table } from "./user";

export const systemNotification_table = pgTable("SystemNotification", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  type: varchar("type", { length: 32 }).notNull(), // e.g., 'system'
  content: varchar("content", { length: 256 }).notNull(),
  receiver_id: uuid("receiver_id").notNull().references(() => user_table.id),
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const friendNotification_table = pgTable("FriendNotification", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  status: varchar("status", { length: 32 }).notNull().default('pending'), // e.g., 'pending', 'accepted', 'rejected'
  content: varchar("content", { length: 256 }).notNull(),
  receiver_id: uuid("receiver_id").notNull().references(() => user_table.id),
  sender_id: uuid("sender_id").notNull().references(() => user_table.id),
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const friendNotificationRelations = relations(friendNotification_table, ({ one }) => ({
  receiver: one(user_table, {
    fields: [friendNotification_table.receiver_id],
    references: [user_table.id]
  }),
  sender: one(user_table, {
    fields: [friendNotification_table.sender_id],
    references: [user_table.id]
  }),
}));

import { group_table } from "./group";

export const groupNotification_table = pgTable("GroupNotification", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  type: varchar("type", { length: 32 }).notNull(), // e.g., 'invite', 'exit', 'disband'
  content: varchar("content", { length: 256 }).notNull(),
  receiver_id: uuid("receiver_id").notNull().references(() => user_table.id),
  sender_id: uuid("sender_id").notNull().references(() => user_table.id),
  group_id: uuid("group_id").notNull().references(() => group_table.id),
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const interactionMessage_table = pgTable("InteractionMessage", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  type: varchar("type", { length: 32 }).notNull(), // e.g., 'like', 'mention'
  content: varchar("content", { length: 256 }).notNull(),
  receiver_id: uuid("receiver_id").notNull().references(() => user_table.id),
  sender_id: uuid("sender_id").notNull().references(() => user_table.id),
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

