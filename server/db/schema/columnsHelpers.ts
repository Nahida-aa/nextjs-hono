// src/lib/db/schema/columnsHelpers.ts
import { serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const timestamps = {
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().$onUpdate(() => new Date()).notNull(),
  // deletedAt: timestamp("deleted_at"),
}

export const timestamps_with_deleted_at = {
  ...timestamps,
  deleted_at: timestamp(),
}

export const commonColumns = {
  name: varchar({ length: 255 }).notNull(),
  summary: varchar({ length: 2048 }), // 摘要
  ...timestamps
}

export const commonColumnsWithDeletedAt = {
}

export const autoIncrementCommon = {
  id: serial().primaryKey().notNull(),
  ...commonColumns
}

export const uuidCommon = {
  id: uuid().primaryKey().notNull().defaultRandom(),
  ...commonColumns
}

export const autoIncrementWithTimestamps = {
  id: serial().primaryKey().notNull(),
  ...timestamps
}

export const uuidWithTimestamps = {
  id: uuid().primaryKey().notNull().defaultRandom(),
  ...timestamps
}