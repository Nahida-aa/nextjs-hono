import { eq, and, ilike, inArray, exists, sql, asc, desc, arrayContains, SQL } from "drizzle-orm";
import { db } from "../..";
import { proj_table } from "../../schema/proj";


// export const listProject = async (params: ListProjectParams) => {
//   const { type, limit=20, offset=0, sort = "relevance", keyword, tags, game_versions, loaders, environment, is_open_source } = params;

//   let whereConditions = [
//     eq(proj_table.type, type),
//     keyword ? ilike(proj_table.name, `%${keyword}%`) : undefined,
//     environment ? eq(proj_table.environment, environment) : undefined,
//     is_open_source !== undefined ? eq(proj_table.is_open_source, is_open_source) : undefined,
//   ];

//   if (tags && tags.length > 0) {
//     whereConditions.push(
//       exists(
//         db.select()
//           .from(projectLinkTag_table)
//           .where(
//             and(
//               eq(projectLinkTag_table.project_id, proj_table.id),
//               inArray(projectLinkTag_table.tag, tags)
//             )
//           )
//       )
//     );
//   }

//   let queryBuilder = db
//     .select()
//     .from(proj_table)
//     .where(and(...whereConditions.filter(Boolean)));

//   const count = (await queryBuilder).length
//   const projects = await queryBuilder.limit(limit).offset(offset)
//   return { count, items: projects }
// }

type ListProjectParams = {
  type: string;
  limit?: number;
  offset?: number;
  sort?: string; // relevance, download_count, follow_count, published_at, updated_at
  keyword?: string; // 搜索关键字
  tags?: string[];
  game_versions?: string[]
  loaders?: string[];
  environment?: string; // client, server, both
  is_open_source?: boolean;
  sortDirection?: "asc" | "desc"
};
export const listProject = async (params: ListProjectParams) => {
  const { type, limit=20, offset=0, 
    sort = "relevance", // 即根据 follow_count, download_count, published_at, updated_at 综合评估
    keyword, tags, game_versions, loaders, environment, is_open_source, sortDirection = "desc", } = params;

  const filters: SQL[] = [];

  if (type) filters.push(eq(proj_table.type, type));
  if (keyword) filters.push(ilike(proj_table.name, `%${keyword}%`));
  // Add other conditions similarly
  if (tags && tags.length > 0) filters.push(sql`${proj_table.tags} @> ${tags}`)
  if (game_versions && game_versions.length > 0) filters.push(arrayContains(proj_table.game_versions, game_versions))
  if (loaders && loaders.length > 0) filters.push(arrayContains(proj_table.loaders, loaders))
  if (environment) filters.push(eq(proj_table.environment, environment));
  if (is_open_source !== undefined) filters.push(eq(proj_table.is_open_source, is_open_source));

  let query = db.select({  record: proj_table, 
      count: sql<number>`count(*) over()` })
    .from(proj_table).where(and(...filters))
    .$dynamic() // 启用动态查询模式 // 根据 sort 参数动态添加排序

  // 处理排序逻辑
  if (sort === "relevance") { // 根据 follow_count, download_count, published_at, updated_at 综合评估
    query = query.orderBy(
      desc(proj_table.follow_count),
      desc(proj_table.download_count),
      desc(proj_table.updated_at)
    );
  } else if (sort && sort in proj_table) {
    query = query.orderBy(
      sortDirection === "desc" ? desc(proj_table[sort]) : asc(proj_table[sort])
    );
  } 

  const results = await query.limit(limit).offset(offset)

  return {  records: results.map(result => result.record),
    count: results[0].count }
}

export const listProjectByUser = async ({userId, limit=20, offset=0}: {userId: string, limit?: number, offset?: number}) => {

  const results = await db.select({
    record: proj_table,
    count: sql<number>`count(*) over()`
  }).from(proj_table).where(eq(proj_table.creator_id, userId));
  return { records: results.map(result => result.record), count: results[0].count }
}
export type ListProjectByUserResult = Awaited<ReturnType<typeof listProjectByUser>>

export const projectById = async (id: string) => {
  const [project] = await db.select().from(proj_table).where(eq(proj_table.id, id)).limit(1);
  return project;
}

export const projectBySlug = async (slug: string) => {
  const [project] = await db.select().from(proj_table).where(eq(proj_table.slug, slug)).limit(1);
  return project;
}