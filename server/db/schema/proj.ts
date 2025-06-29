import { InferSelectModel, relations, sql } from "drizzle-orm";
import { pgTable, varchar, index, timestamp, serial, integer, uniqueIndex, boolean, foreignKey, primaryKey, uuid, bigint, text, jsonb } from "drizzle-orm/pg-core"
import { timestamps, uuidCommon, uuidWithTimestamps } from "./columnsHelpers"
import { group_table } from "./group";
import { user_table } from "./user";
import { createSelectSchema } from "drizzle-zod";

// 查询时 必带过滤字段: type
// 查询时 过滤字段: query, tags, game_versions, loaders, environment, is_open_source
// 查询时 分页字段: limit, offset, sort
// e.g. : 
const listProj_params = {
  type: "mod",
  query: "test",
  tags: ["恐怖", "写实"],
  game_versions: ["1.17.1", "1.16.5"],
  loaders: ["forge", "fabric"],
  environment: "client",
  is_open_source: true,
  limit: 10,
  offset: 0,
  sort: "download_count",
}
const getReleaseFile_params = {
  release_id: "xxxx",
  loader: "forge",
  game_version: "1.17.1",
}


// The visibility of your project after it has been approved. :项目在被批准后的可见性。 public, unlisted, private
export const proj_table = pgTable("Proj", {
  ...uuidCommon,
  // 一级分类 字段
  type: varchar({ length: 128 }).default("project").notNull(), // mod, resource_pack, data_pack, shader, mod_pack, plugin, theme, texture_pack, world, server, project, unknown, website, app, tool, library, other
  // meta 字段
  slug: varchar({ length: 255 }).notNull(), // /project/${slug}
  icon_url: varchar({ length: 2048 }), // 项目图标
  download_count: integer().default(0).notNull(),// 所有版本的所有文件下载次数之和
  follow_count: integer().default(0).notNull(),
  environment: varchar({ length: 128 }), // client, server, both
  license: varchar({ length: 128 }),
  is_open_source: boolean(),
  owner_type: varchar({ length: 128 }).notNull(), // 'user' 或 'group'
  owner_id: uuid().notNull(), // user 或 group 的 ID
  creator_id: uuid().notNull().references(() => user_table.id), // 创建者的用户 ID
  game_versions: jsonb("game_versions").$type<string[]>().default([]).notNull(),
  loaders: jsonb("loaders").$type<string[]>().default([]).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  // detail 字段
  description: varchar({ length: 65536 }), // 详细描述 .md
  license_url: varchar({ length: 2048 }), // 项目许可证
  // action 字段
  status: varchar({ length: 128 }).default("draft").notNull(), // draft, published, archived, deleted, approved, archived, rejected, draft, Unlisted, processing, Withheld, Scheduled, Private, Unknown
  visibility: varchar({ length: 128 }).default("public").notNull(), // public, unlisted, private
}, (table) => [
  // index("ix_Proj_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
  index("ix_Proj_type").on(table.type),
  uniqueIndex("ix_Proj_slug").on(table.slug),
  index("ix_Proj_name").on(table.name),
  index("ix_Proj_summary").on(table.summary),
]);



export const proj_relations = relations(proj_table, ({ many, one }) => ({
  // // meta 字段
  owner_group: one(group_table),
  owner_user: one(user_table),
  // detail 字段
  members: many(projectMember_table),
  releases: many(projectRelease_table),
}));

export const projectRelease_table = pgTable("ProjectRelease", {
	id: uuid().primaryKey().notNull().defaultRandom(),
  created_at: timestamp().defaultNow().notNull(),
	name: varchar({ length: 255 }).notNull(),
	proj_id: uuid().notNull(),
	version_number: varchar({ length: 255 }).notNull(),
  loaders: jsonb().$type<string[]>().notNull(),
  game_versions: jsonb().$type<string[]>().notNull(), 
	creator_id: uuid().notNull(),
	featured: boolean().default(false).notNull(),
	description: varchar({ length: 65536 }),
	type: varchar({ length: 255 }).default("release").notNull(), // release, beta, alpha
	status: varchar({ length: 128 }).default('listed').notNull(), // listed, archived, draft, unlisted, scheduled, unknown
	visibility: varchar({ length: 128 }),
}, (table) => [
	index("ProjectRelease_proj_id").on(table.proj_id),
	foreignKey({
			columns: [table.proj_id],
			foreignColumns: [proj_table.id],
			name: "ProjectRelease_proj_id_fkey"
		}),
	foreignKey({
			columns: [table.creator_id],
			foreignColumns: [user_table.id],
			name: "ProjectRelease_creator_id_fkey"
		}),
]);
export const projectRelease_relations = relations(projectRelease_table, ({ many }) => ({
  files: many(releaseFile_table),
}));

export const releaseFile_table = pgTable("ReleaseFile", {
	id: uuid().primaryKey().notNull().defaultRandom(),
	release_id: uuid().notNull(),
	pathname: varchar({ length: 2048 }).notNull(), // /project/${proj_cid}/release/${release_cid}/${filename}
	name: varchar({ length: 2048 }).notNull(),
	size: integer().default(0).notNull(),

	metadata: jsonb(),
	type: varchar({ length: 128 }), // required-resource-pack, optional-resource-pack, unknown
  download_count: integer().default(0).notNull(),
  loaders: jsonb().$type<string[]>().notNull(),
  game_versions: jsonb().$type<string[]>().notNull(),
}, (table) => [
	index("ix_ReleaseFile_id").on(table.id),
	foreignKey({
			columns: [table.release_id],
			foreignColumns: [projectRelease_table.id],
			name: "ReleaseFile_release_id_fkey"
		}),
]);
export const releaseFile_relations = relations(releaseFile_table, ({ one }) => ({
  release: one(projectRelease_table, { fields: [releaseFile_table.release_id], references: [projectRelease_table.id] }),
}));

export const projectMember_table = pgTable("ProjectMember", {
  id: uuid().primaryKey().defaultRandom(),
  project_id: uuid().notNull().references(() => proj_table.id), // 外键引用 proj 表
  member_id: uuid().notNull().references(() => user_table.id), // 成员 ID
  role: varchar().notNull(), // 成员在项目中的角色，例如 owner, member
}, (table) => [
  index("ix_ProjectMember_projectId").on(table.project_id),
  index("ix_ProjectMember_memberId").on(table.member_id),
]);

export type ProjectMember = InferSelectModel<typeof projectMember_table>;