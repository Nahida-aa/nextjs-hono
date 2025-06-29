// 查询时 必带过滤字段: type
// 查询时 过滤字段: query, tags, game_versions, loaders, environment, is_open_source
// 查询时 分页字段: limit, offset, sort

// Scheduled - Project is scheduled to be released in the future : 项目计划在未来发布
// Withheld - Same as unlisted, but set by a moderator. Cannot be switched to another type without moderator approval: 与未列出相同，但由管理员设置。 未经管理员批准，无法切换到另一种类型
// ---
// Unlisted - Project is not displayed on search, but accessible by URL : 项目不在搜索中显示，但可以通过 URL 访问
// 定义项目模型
interface Project {
  // 一级分类 字段
  type: string; // mod, resource_pack, data_pack, shader, mod_pack, plugin, theme, texture_pack, world, server, project, unknown, website, app, tool, library, other
  // meta 字段
  id: string;
  slug: string; // /project/${slug}
  icon_url: string;
  name: string; // title
  summary: string; // A sentence or two that describes your project. :描述项目的一两句话
  download_count: number;
  follow_count: number;
  created_at: string;
  updated_at: string;
  loaders?: string[];
  tags?: string[];
  license?: string;
  license_url?: string;
  creator_type: string; // user, group
  creator_id: string;
  status: string; // draft, processing, approved, rejected, archived, deleted, withheld, scheduled, unknown
  visibility: string; // publish, unlisted, private
  game_versions?: string[];
  environment?: string; // client, server, both

  // detail 字段
  description: string;
  members?: ProjectMember[];
}

// 定义发布版本模型
interface Release {
  id: string;
  project_id: string;
  created_at: string;
  name: string;
  release_number: string;
  download_count: number;
  creator_type: string; // user, group
  creator_id: string;
  featured: boolean;
  description?: string;
  type: string; // release, beta, alpha
  status: string; // listed, archived, draft, unlisted, scheduled, unknown
  visibility: string; // public, unlisted, private
  loaders?: string[];
  game_versions?: string[];
  files?: ReleaseFile[];
}

// 定义项目成员模型
interface ProjectMember {
  id: string;
  project_id: string;
  member_type: string; // user, group
  member_id: string;
  role: string; // member, owner
}
// 定义发布版本文件模型
interface ReleaseFile {
  id: string;
  version_id: string;
  url: string;
  filename: string;
  is_primary: boolean;
  size: number;
  type?: string; // required-resource-pack, optional-resource-pack, unknown
  metadata?: Record<string, any>;
}
interface Dependency {
  /// The specific version id that the dependency uses
  version_id: string
  /// The project ID that the dependency is synced with and auto-updated
  project_id: string
  /// The filename of the dependency. Used exclusively for external mods on modpacks
  file_name: string
  /// The type of the dependency
  dependency_type: string // required, optional, incompatible, embedded
}

// // 定义版本模型
// interface GameVersion {
// }


export const defaultChannels = [
  {
    name: "general-chat", // 一般讨论
    class: "General",
    type: "text",
    summary: "General chat",
    description: "# Welcome to the general chat channel",
  },
  {
    name: "announcements", // 公告和更新
    class: "General",
    type: "text",
    summary: "Announcements",
    description: "# Announcements and updates",
  },
  {
    class: "Internal", // 内部
    name: "internal-chat", // 内部讨论
    type: "text",
    summary: "Internal chat",
    description: "# Welcome to the internal chat channel",
  }
]