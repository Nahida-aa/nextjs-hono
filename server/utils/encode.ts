import SQIds, { defaultOptions } from "sqids";

export const djb2 = (s: string) => {
  let h = 5381;
  let i = s.length;
  while (i) {
    h = (h * 33) ^ s.charCodeAt(--i);
  }
  return (h & 0xbfffffff) | ((h >>> 1) & 0x40000000);
}

// A simple function to shuffle the alphabet for the Sqids
export const shuffle = (str: string, seed: string) => {
  const chars = str.split("");
  const seedNum = djb2(seed);

  let temp: string;
  let j: number;
  for (let i = 0; i < chars.length; i++) {
    j = ((seedNum % (i + 1)) + i) % chars.length;
    temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }

  return chars.join("");
}

// 初始化 SQIds 实例
const sqids = new SQIds(); // 这样写在模块中可能会导致每次调用都会创建一个新的实例

// UUID 是 128 位的数字 8-4-4-4-12 的格式，其中包含 32 个十六进制字符和 4 个连字符。UUID 是一种全局唯一标识符，通常用于标识数据记录、会话和其他实体。UUID 通常用于数据库主键、API 令牌和其他标识符。
export const uuidToSlug = (uuid: string): string => {
  // 将 UUID 转换为无连字符的字符串
  const cleanUuid = uuid.replace(/-/g, "");
  // 将无连字符的 UUID 转换为数字数组
  const numbers = cleanUuid.match(/.{1,8}/g)?.map((hex) => parseInt(hex, 16)) || [];
  // 使用 sqids 编码数字数组为短 slug
  return sqids.encode(numbers);
};

export const slugToUuid = (slug: string): string => {
  // 使用 sqids 解码短 slug 为数字数组
  const numbers = sqids.decode(slug);
  // 将数字数组转换为无连字符的 UUID 字符串
  const cleanUuid = numbers.map((num) => num.toString(16).padStart(8, "0")).join("");
  // 将无连字符的 UUID 字符串转换为标准 UUID 格式
  return `${cleanUuid.slice(0, 8)}-${cleanUuid.slice(8, 12)}-${cleanUuid.slice(12, 16)}-${cleanUuid.slice(16, 20)}-${cleanUuid.slice(20)}`;
};

// ULID（Universally Unique Lexicographically Sortable Identifier）是一种比 UUID 更简洁且可排序的唯一标识符。ULID 由 26 个字符组成，使用 Base32 字符集（0-9 和 A-Z），并且可以按字典顺序排序。
// ---------------------------------------------

// 将 UUID 转换为 URL 安全的 Base64 编码
export const uuidToBase64 = async (uuid: string): Promise<string> => {
  // 将 UUID 转换为无连字符的字符串
  const cleanUuid = uuid.replace(/-/g, "");
  // 将无连字符的 UUID 转换为字节数组
  const bytes = Buffer.from(cleanUuid, "hex");
  // 将字节数组转换为 Base64 编码，并替换 URL 不安全的字符
  return bytes.toString("base64url");
};

// 将 URL 安全的 Base64 编码转换为 UUID
export const base64ToUuid = async (base64: string): Promise<string> => {
  // 将 Base64 编码转换为字节数组
  const bytes = Buffer.from(base64, "base64url");
  // 将字节数组转换为无连字符的 UUID 字符串
  const cleanUuid = bytes.toString("hex");
  // 将无连字符的 UUID 字符串转换为标准 UUID 格式
  return `${cleanUuid.slice(0, 8)}-${cleanUuid.slice(8, 12)}-${cleanUuid.slice(12, 16)}-${cleanUuid.slice(16, 20)}-${cleanUuid.slice(20)}`;
};

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function genUUIDonClient(): string {
  const cryptoObj = window.crypto || (window as any).msCrypto; // 兼容性处理
  const array = new Uint8Array(16);
  cryptoObj.getRandomValues(array);

  array[6] = (array[6] & 0x0f) | 0x40; // 设置版本号为 4
  array[8] = (array[8] & 0x3f) | 0x80; // 设置 variant 为 10

  const hexArray = Array.from(array, byte => byte.toString(16).padStart(2, '0'));
  return `${hexArray.slice(0, 4).join('')}-${hexArray.slice(4, 6).join('')}-${hexArray.slice(6, 8).join('')}-${hexArray.slice(8, 10).join('')}-${hexArray.slice(10, 16).join('')}`;
}
