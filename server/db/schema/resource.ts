import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, varchar, index, timestamp, serial, integer, uniqueIndex, boolean, foreignKey, primaryKey, uuid, jsonb } from "drizzle-orm/pg-core"
import { timestamps, uuidCommon } from "./columnsHelpers"
import { tag } from "./tag";

// export type ResourceEnvironment = string[];
// export type ResourceCompatibility = Record<string, string>; // == { key: value, ... }
export type ResourceCompatibility = {
  version: string; // 
  gameVersions: string[];
}[];

export const resource = pgTable("Resource", {
  ...uuidCommon,
  downloadCount: integer("download_count").default(0).notNull(),
  favoriteCount: integer("favorite_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  image: varchar("image"), // 头像图片
  banner: varchar("banner"), // 横幅图片
  compatibility: jsonb("compatibility").$type<ResourceCompatibility>(),
  platforms: jsonb("platforms").$type<string[]>().notNull(), // [ NeoForge , Forge , Fabric , Quilt ]
  environments: jsonb("environments").$type<string[]>().notNull(), // [client, server, both]
}, (table) => [
  // index("ix_Resource_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
  index("ix_Resource_name").on(table.name),
]);

export const resourceRelations = relations(resource, ({ many, one }) => ({
  tags: many(tag),
}));

export const linkResourceTag = pgTable("LinkResourceTag", {
  resourceId: uuid("resource_id").notNull().references(() => resource.id),
  tagId: uuid("tag_id").notNull().references(() => tag.id),
}, (table) => [
  primaryKey({ columns: [table.resourceId, table.tagId], name: "ResourceTag_pkey" }),
]);

export const resourceTagRelations = relations(linkResourceTag, ({one}) => ({
  resource: one(resource, {
    fields: [linkResourceTag.resourceId],
    references: [resource.id]
  }),
  tag: one(tag, {
    fields: [linkResourceTag.tagId],
    references: [tag.id]
  }),
}))
