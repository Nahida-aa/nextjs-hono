import { relations } from "drizzle-orm/relations"

import { home, idCardInfo, identity, user } from "./user";
import { 
	// linkGroupFollow, 
	linkGroupIdentity, linkGroupProj, linkGroupResource, 
	// linkUserFollow, 
	linkUserIdentity, linkUserProj, linkUserResource } from "./link";
import { group_table } from "./group";
import { tag } from "./tag";
import { proj_table } from "./proj";
import { resource } from "./resource";






export const linkGroupProjRelations = relations(linkGroupProj, ({one}) => ({
	proj: one(proj_table, {
		fields: [linkGroupProj.proj_id],
		references: [proj_table.id]
	}),
	group: one(group_table, {
		fields: [linkGroupProj.group_id],
		references: [group_table.id]
	}),
}));

export const projRelations = relations(proj_table, ({many}) => ({
	linkGroupProjs: many(linkGroupProj),
	linkUserProjs: many(linkUserProj),
}));

export const linkGroupResourceRelations = relations(linkGroupResource, ({one}) => ({
	resource: one(resource, {
		fields: [linkGroupResource.resource_id],
		references: [resource.id]
	}),
	group: one(group_table, {
		fields: [linkGroupResource.group_id],
		references: [group_table.id]
	}),
}));

export const resourceRelations = relations(resource, ({many}) => ({
	linkGroupResources: many(linkGroupResource),
	linkUserResources: many(linkUserResource),
}));

export const linkUserProjRelations = relations(linkUserProj, ({one}) => ({
	proj: one(proj_table, {
		fields: [linkUserProj.proj_id],
		references: [proj_table.id]
	}),
	user: one(user, {
		fields: [linkUserProj.user_id],
		references: [user.id]
	}),
}));

export const linkUserResourceRelations = relations(linkUserResource, ({one}) => ({
	resource: one(resource, {
		fields: [linkUserResource.resource_id],
		references: [resource.id]
	}),
	user: one(user, {
		fields: [linkUserResource.user_id],
		references: [user.id]
	}),
}));



export const linkGroupIdentityRelations = relations(linkGroupIdentity, ({one}) => ({
	identity: one(identity, {
		fields: [linkGroupIdentity.identity_id],
		references: [identity.id]
	}),
	group: one(group_table, {
		fields: [linkGroupIdentity.group_id],
		references: [group_table.id]
	}),
}));

export const identityRelations = relations(identity, ({many}) => ({
	linkGroupIdentities: many(linkGroupIdentity),
	linkUserIdentities: many(linkUserIdentity),
}));

export const linkUserIdentityRelations = relations(linkUserIdentity, ({one}) => ({
	identity: one(identity, {
		fields: [linkUserIdentity.identity_id],
		references: [identity.id]
	}),
	user: one(user, {
		fields: [linkUserIdentity.user_id],
		references: [user.id]
	}),
}));