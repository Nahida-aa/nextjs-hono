import { db } from "~/lib/db";
import { proj_table, projectRelease_table, releaseFile_table } from "~/lib/db/schema/proj";
import { eq, and, ilike, inArray, exists, getTableColumns } from "drizzle-orm";
import { files } from "jszip";

export const releaseIdById = async (id: string) => {
  const [release] = await db.select({
    id: projectRelease_table.id
  }).from(projectRelease_table).where(eq(projectRelease_table.id, id)).limit(1);
  return release;
}
export const releaseWithFilesById = async (id: string) => {
  const result = await db.query.projectRelease_table.findFirst({
    where: (table) => eq(table.id, id),
    with: {
      files: true
    }
  })
  
  return result;
}

export const listReleaseByProjectId = async (project_id: string) => {
  return await db.select().from(projectRelease_table).where(eq(projectRelease_table.proj_id, project_id));
}
export const listReleaseByProjectSlug = async (slug: string) => {
  // INFO: 暂时不需要
}