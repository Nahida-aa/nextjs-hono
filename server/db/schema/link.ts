import { pgTable, varchar, index, timestamp, serial, integer, uniqueIndex, boolean, foreignKey, primaryKey, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm/relations"
import { group_table } from "./group";
import { identity, user_table } from "./user";
import { tag } from "./tag";
import { proj_table } from "./proj";
import { resource } from "./resource";
import { timestamps, uuidCommon } from "./columnsHelpers"


export const linkGroupProj = pgTable("LinkGroupProj", {
	...timestamps,
	group_id: uuid("group_id").notNull(),
	proj_id: uuid("proj_id").notNull(),
	role: varchar().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.proj_id],
			foreignColumns: [proj_table.id],
			name: "LinkGroupProj_proj_id_fkey"
		}),
	foreignKey({
			columns: [table.group_id],
			foreignColumns: [group_table.id],
			name: "LinkGroupProj_group_id_fkey"
		}),
	primaryKey({ columns: [table.group_id, table.proj_id], name: "LinkGroupProj_pkey"}),
]);

export const linkGroupResource = pgTable("LinkGroupResource", {
	...timestamps,
	group_id: uuid("group_id").notNull(),
	resource_id: uuid("resource_id").notNull(),
	role: varchar().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.resource_id],
			foreignColumns: [resource.id],
			name: "LinkGroupResource_resource_id_fkey"
		}),
	foreignKey({
			columns: [table.group_id],
			foreignColumns: [group_table.id],
			name: "LinkGroupResource_group_id_fkey"
		}),
	primaryKey({ columns: [table.group_id, table.resource_id], name: "LinkGroupResource_pkey"}),
]);

export const linkUserProj = pgTable("LinkUserProj", {
	...timestamps,
	user_id: uuid("user_id").notNull(),
	proj_id: uuid("proj_id").notNull(),
	role: varchar().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.proj_id],
			foreignColumns: [proj_table.id],
			name: "LinkUserProj_proj_id_fkey"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [user_table.id],
			name: "LinkUserProj_user_id_fkey"
		}),
	primaryKey({ columns: [table.user_id, table.proj_id], name: "LinkUserProj_pkey"}),
]);

export const linkUserResource = pgTable("LinkUserResource", {
	...timestamps,
	user_id: uuid("user_id").notNull(),
	resource_id: uuid("resource_id").notNull(),
	role: varchar().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.resource_id],
			foreignColumns: [resource.id],
			name: "LinkUserResource_resource_id_fkey"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [user_table.id],
			name: "LinkUserResource_user_id_fkey"
		}),
	primaryKey({ columns: [table.user_id, table.resource_id], name: "LinkUserResource_pkey"}),
]);



export const linkGroupIdentity = pgTable("LinkGroupIdentity", {
	...timestamps,
	group_id: uuid("group_id").notNull(),
	identity_id: uuid("identity_id").notNull(),
	level: integer().notNull(),
	status: varchar().notNull(),
	motivation: varchar().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.identity_id],
			foreignColumns: [identity.id],
			name: "LinkGroupIdentity_identity_id_fkey"
		}),
	foreignKey({
			columns: [table.group_id],
			foreignColumns: [group_table.id],
			name: "LinkGroupIdentity_group_id_fkey"
		}),
	primaryKey({ columns: [table.group_id, table.identity_id], name: "LinkGroupIdentity_pkey"}),
]);

export const linkUserIdentity = pgTable("LinkUserIdentity", {
	...timestamps,
	user_id: uuid("user_id").notNull(),
	identity_id: uuid("identity_id").notNull(),
	level: integer().notNull(),
	status: varchar().notNull(),
	motivation: varchar().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.identity_id],
			foreignColumns: [identity.id],
			name: "LinkUserIdentity_identity_id_fkey"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [user_table.id],
			name: "LinkUserIdentity_user_id_fkey"
		}),
	primaryKey({ columns: [table.user_id, table.identity_id], name: "LinkUserIdentity_pkey"}),
]);
