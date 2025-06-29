'server-only';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
const client = postgres(`${process.env.DATABASE_URL!}`);
const db = drizzle(client);
import { user as usersTable, identity, idCardInfo as idCardInfoTable, home  } from './schema/user';
import { 
  // linkUserFollow, linkGroupFollow, 
  linkUserProj, linkUserResource, linkUserIdentity } from './schema/link';
import { proj_table } from './schema/proj';
import { resource } from './schema/resource';
import { tag } from './schema/tag';
import * as qUser from "./q/qUser"
// import { QLinkUserFollow } from './q/qUserFollow';
import { console } from 'inspector';
import { ReqRegisterUserBody } from '../routes/auth/register';

const localhost = 'http://localhost:3000';
async function createUserLines() {
  const testUsers: ReqRegisterUserBody[] = [
    {
      name: "test1",
      password: "string",
      phone: "124567890",
      id_card_info: {
        id_card_number: "124567890"
      }
    },{
      name: "test2",
      password: "string",
      image: 'https://avatars.githubusercontent.com/u/96083926?s=80&v=4',
      phone: "124567890",
      id_card_info: {
        id_card_number: "124567890"
      }
    },{
      name: "测试用户",
      password: "string",
      image: 'https://avatars.githubusercontent.com/u/188596056?v=4',
      phone: "124567890",
      id_card_info: {
        id_card_number: "124567890"
      }
    }
  ]
  // const res = await fetch("/api/hono/auth/register", {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(testUsers[0]),
  // });
  // 初始创建三个用户
  const user1 = await qUser.create({
    name: 'test1',
    password: 'string',
    image: 'https://avatars.githubusercontent.com/u/96083926?s=80&v=4',
    idCardInfo: {
      id_card_number: 'string123456',
    },
  });
  console.log('user1:', user1);
  console.log('user1.idCardInfo:', user1.idCardInfo);
  const user2 = await qUser.create({
    name: 'test2',
    password: '123456',
    image: 'https://avatars.githubusercontent.com/u/96083926?s=80&v=4',
    idCardInfo: {
      id_card_number: '123456123456',
    },
  });
  console.log('user2:', user2);
  const user3 = await qUser.create({
    name: '测试用户',
    password: '1234ts',
    image: 'https://avatars.githubusercontent.com/u/188596056?v=4',
    idCardInfo: {
      id_card_number: '1234ts123456',
    },
  });
  console.log('user3:', user3);
}

async function followUserTest(){
  // const result = await QLinkUserFollow.followUserByNames('test1', 'test2');
  // console.log('followUserByNames:', result);
  // const result2 = await QLinkUserFollow.followUserByNames('测试用户', 'test2');
  // console.log('followUserByNames:', result2);
  // const result3 = await QLinkUserFollow.followUserByNames('test1', '测试用户');
  // console.log('followUserByNames:', result3);
}

async function main() {
  // await dropAllTables();
  // await createUserLines();
  await followUserTest();
}

main().catch(console.error);