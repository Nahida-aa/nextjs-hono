// 未登录: 的主页: src/app/(main)/not_login.tsx

import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";

// 未登录状态下 显示
export default function NotLoginIndexPage() {
  return (
    <main className='space-y-2'>
      <span>注意当前未登录哦</span>
      {/* <HomeHeader user={session?.user} /> */}
      <Button className='h-auto'>
        <a href="/api/hono" target="_blank">
          去 api 交互文档(Scalar UI)
        </a>
      </Button><br />
      <Button className='h-auto'>
        <a href="/docs" target="_blank">
          去 api 交互文档(Swagger UI)<br />
          样式有问题, 我没完整的进行修复, 不建议使用, <br />
          因为我有提供 openapi.json 可以下载或复制源代码
        </a>
      </Button><br />
      <Button >
      <a href="/api/hono/doc" target="_blank">
          去 openapi.json 
      </a>
      </Button><br />
      <Button>
        <a href="https://api.Nahida-aa.us.kg" target="_blank" >
          去 api 交互文档(FastApi)(已废弃)
        </a>
      </Button><br />
      <ScrollArea></ScrollArea>
    </main>
  );
}