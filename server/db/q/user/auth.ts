import { hash_password } from '~/lib/core/auth';
import * as QUser  from '~/lib/db/q/qUser';

export async function changePassword(userName: string, newPassword: string)
// : Promise<boolean> 
{
  // 获取用户信息
  const user = await QUser.getByName(userName);
  if (!user) {
    throw new Error('User not found');
  }

  // 更新密码
  const result = await QUser.updatePassword_withHash(userName, newPassword);
  return result;
}