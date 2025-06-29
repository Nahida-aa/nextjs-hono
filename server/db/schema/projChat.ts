import { InferSelectModel, relations, sql } from "drizzle-orm";
import { pgTable, varchar, index, timestamp, serial, integer, uniqueIndex, boolean, foreignKey, primaryKey, uuid, bigint, text, jsonb } from "drizzle-orm/pg-core"
import { timestamps, uuidCommon, uuidWithTimestamps } from "./columnsHelpers"
import { tag as tag_table } from "./tag";
import { group_table } from "./group";
import { user_table } from "./user";
import { db } from "..";
import { createSelectSchema } from "drizzle-zod";
import { proj_table } from "./proj";

// 频道表
export const channel_table = pgTable("Channel", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  project_id: uuid("project_id").notNull().references(() => proj_table.id),
  name: varchar("name", { length: 255 }).notNull(), // 
  class: varchar("class", { length: 64 }).notNull(), // 用户自定义分类, General
  type: varchar("type", { length: 64 }).notNull(), // 'text', 'voice', 'video', 'system'
  summary: varchar("summary", { length: 2048 }),
  description: varchar("description", { length: 65536 }),
  is_public: boolean("is_public").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  creator_id: uuid("created_by").notNull().references(() => user_table.id),
}, (table) => [
  index("ix_Channel_projectId").on(table.project_id),
]);

// 权限组表
export const permissionGroup_table = pgTable("PermissionGroup", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  channel_id: uuid("channel_id").notNull().references(() => channel_table.id),
  name: varchar("name", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  creator_id: uuid("created_by").notNull().references(() => user_table.id),
}, (table) => [
  index("ix_PermissionGroup_channelId").on(table.channel_id),
]);
// 权限组成员表
export const permissionGroupMember_table = pgTable("PermissionGroupMember", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  permission_group_id: uuid("permission_group_id").notNull().references(() => permissionGroup_table.id),
  user_id: uuid("user_id").notNull().references(() => user_table.id),
}, (table) => [
  index("ix_PermissionGroupMember_permissionGroupId").on(table.permission_group_id),
  index("ix_PermissionGroupMember_userId").on(table.user_id),
]);

// 权限表
export const permission_table = pgTable("Permission", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  permission_group_id: uuid("group_id").notNull().references(() => permissionGroup_table.id),
  slug: varchar("slug", { length: 255 }).notNull(),
}, (table) => [
  index("ix_Permission_permissionGroupId").on(table.permission_group_id),
]);

// 聊天记录表
export const channelMessage_table = pgTable("ChannelMessage", {
  ...uuidWithTimestamps,
  channel_id: uuid("channel_id").notNull().references(() => channel_table.id),
  sender_id: uuid("sender_id").notNull().references(() => user_table.id),
  content: varchar("content").notNull(),
}, (table) => [
  index("ix_ChannelMessage_channelId").on(table.channel_id),
]);