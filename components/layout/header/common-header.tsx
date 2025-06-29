'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

// import { ModelSelector } from '~/components/model-selector';
import { SidebarToggle } from '~/components/layout/sidebar/sidebar-toggle';
import { Button } from '~/components/ui/button';
import { BetterTooltip } from '~/components/common/BetterTooltip';
import { PlusIcon, VercelIcon } from '~/components/icons';
import { useSidebar } from '~/components/ui/sidebar';
import { UserMeta, UserSidebarToggle } from '../sidebar/user-side-toggle';
import { ModeToggle } from '~/components/common/ModeToggle';
import { Search, AlignRight, X, Sparkles, UserRound, House } from 'lucide-react';
// import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { MoreMenu } from './home-header';

export function CommonHeader(
  { user, className }: { user: UserMeta | undefined, className?: string; }
  // { selectedModelId }: { selectedModelId: string }
) {
  const router = useRouter();
  // const { open } = useSidebar();
  // const [more_open, set_more_open] = useState(false);
  // const [listMenu_open, set_listMenu_open] = useState(false);

  const { width: windowWidth } = useWindowSize();
  // const displayUser = user || { email: 'guest@example.com', name: 'Guest', image: null };
  const displayUser = user
  // const user_status = "online" // online, offline, away, 未登录
  let user_status
  if (user) {
    user_status = "online"
  } else {
    user_status = "未登录"
  }
  return (
    <header className={`flex sticky backdrop-blur-md px-1.5 py-1 items-center md:px-2 gap-2 justify-between bg-card ${className}`}>
      <div className='flex gap-1 items-center'>
        <UserSidebarToggle user={user} status={user_status} />
        {/* {windowWidth >= 768 && ( */}
        <div className=''>
          <div className="text-base font-medium">Friends</div>
        </div>
        {/* )} */}
      </div>

      {/* <ModelSelector
        selectedModelId={selectedModelId}
        className="order-1 md:order-2"
      /> */}
      <div className='space-x-1'>
        {/* 搜索按钮: {翻译: Search} */}
        <Button variant="outline" className='px-2 min-w-10 bg-background/20'>
          <Search />
        </Button>
        <BetterTooltip content="Chat Bot">
          <Button variant="outline" className='px-2 min-w-10 bg-background/20'>
            <Sparkles />
          </Button>
        </BetterTooltip>  

        {(windowWidth >= 768) && (
        <ModeToggle className='bg-background/20' />
        )}

        {/* {(!open || windowWidth < 768) && ( */}
        {/* add 已被我改装为 more */}
        {(windowWidth < 768) && (
        <BetterTooltip content="More">
          <Popover>
            <PopoverTrigger asChild>          
              <Button
                variant="outline"
                className="bg-background/20 order-2 md:order-1 md:px-2 px-2 ml-auto md:ml-0  min-w-10"
                onClick={() => {
                }}
              >
              
                <PlusIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='min-w-0 w-auto p-0'><MoreMenu /></PopoverContent>
          </Popover>
        </BetterTooltip>
        )}

        {/* {(windowWidth < 768) && (
          <Button
            variant="outline"
            className="order-2 md:order-1 md:px-2 px-2 ml-auto md:ml-0  min-w-10"
            onClick={() => {
              set_listMenu_open(!listMenu_open)
            }}
          >
            {listMenu_open ? <X /> : <AlignRight />}
          </Button>
        )} */}
      </div>
    </header>
  );
}
