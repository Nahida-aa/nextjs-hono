import { pgTable, varchar, index, timestamp, serial, integer, uniqueIndex, boolean, foreignKey, primaryKey, uuid, text } from "drizzle-orm/pg-core"

export const tag = pgTable("Tag", {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar().notNull(),
  description: text(),
}, (table) => [
  // uniqueIndex("ix_Tag_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
  uniqueIndex("ix_Tag_name").on(table.name),
]);