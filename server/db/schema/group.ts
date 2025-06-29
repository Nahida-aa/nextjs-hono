import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, varchar, index, timestamp, serial, integer, uniqueIndex, boolean, foreignKey, primaryKey, uuid } from "drizzle-orm/pg-core"
import { uuidCommon } from "./columnsHelpers";
import { 
  // linkGroupFollow, 
  linkGroupIdentity, linkGroupProj, linkGroupResource } from "./link";
import { follow_table } from "./follow";
import { user_table } from "./user";
import { linkUserGroup } from "./linkUserGroup";
import { chat_table } from "./message";

export const group_table = pgTable("Group", {
  ...uuidCommon,
  image: varchar(),
  nickname: varchar("nickname", { length: 32 }),
  description: varchar({ length: 65536 }),
  email: varchar('email', { length: 64 }),
  members_count: integer("members_count").default(1).notNull(),
  followers_count: integer("followers_count").default(0).notNull(),
  creator_id: uuid("creator_id").notNull().references(() => user_table.id), // 添加创建者字段
}, (table) => [
  // index("ix_Group_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
  index("ix_Group_name").on(table.name),
]);

export const groupRelations = relations(group_table, ({many, one }) => ({
  followers: many(follow_table, { // 粉丝
    relationName: "target_group",
  }),
  creator: one(user_table, {
    fields: [group_table.creator_id],
    references: [user_table.id]
  }),
  members: many(linkUserGroup),
  chat: one(chat_table, {
    fields: [group_table.id],
    references: [chat_table.group_id]
  }),
  linkGroupProjs: many(linkGroupProj),
  linkGroupResources: many(linkGroupResource),
  linkGroupIdentities: many(linkGroupIdentity),
}));

export type Group = InferSelectModel<typeof group_table>;