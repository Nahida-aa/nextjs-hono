import { foreignKey, pgTable, primaryKey, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./columnsHelpers";
import { group_table } from "./group";
import { user_table } from "./user";
import { relations } from "drizzle-orm/relations";

export const linkUserGroup = pgTable("LinkUserGroup", {
  ...timestamps,
  user_id: uuid("user_id").notNull(),
  group_id: uuid("group_id").notNull(),
  role: varchar({ length: 16 }).notNull(), // owner, admin, member, 
}, (table) => [
  foreignKey({
      columns: [table.group_id],
      foreignColumns: [group_table.id],
      name: "LinkUserGroup_group_id_fkey"
    }),
  foreignKey({
      columns: [table.user_id],
      foreignColumns: [user_table.id],
      name: "LinkUserGroup_user_id_fkey"
    }),
  primaryKey({ columns: [table.user_id, table.group_id], name: "LinkUserGroup_pkey"}),
]);

export const linkUserGroupRelations = relations(linkUserGroup, ({one}) => ({
  group: one(group_table, {
    fields: [linkUserGroup.group_id],
    references: [group_table.id]
  }),
  user: one(user_table, {
    fields: [linkUserGroup.user_id],
    references: [user_table.id]
  }),
}));