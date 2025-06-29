import { db } from "../..";
import { proj_table, projectMember_table } from "../../schema/proj";

interface CreateDBProjectInput {
  name: string;
  slug: string;
  summary?: string;
  owner_type: string; //'user' | 'group';
  owner_id: string;
  creator_id: string;
  visibility?: string; // public, unlisted, private
}
export type CreateDBProjectOutput = Awaited<ReturnType<typeof createDBProject>>

export const createDBProject = async (input: CreateDBProjectInput) => {
  const { name, slug, summary, owner_type, owner_id, creator_id, visibility } = input;

  await db.transaction(async (tx) => {
    const [project] = await tx.insert(proj_table)
    .values({
      name,
      slug,
      summary,
      owner_type,
      owner_id,
      creator_id,
      status: 'draft',
      visibility,
    }).returning({ id: proj_table.id });

    await tx.insert(projectMember_table)
    .values({
      project_id: project.id,
      member_id: creator_id,
      role: "admin", // admin, maintain, write, triage, read
    })
  });

  return {slug}
}