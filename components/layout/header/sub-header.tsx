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
import { Search, AlignRight, X, Sparkles, UserRound, House, ChevronLeft } from 'lucide-react';
// import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { MoreMenu } from './home-header';

export function SubHeader({
  user, className, children, justify,
}: { 
  user?: UserMeta, className?: string; children: React.ReactNode; 
  justify?: 'center' | 'between' | 'start' | 'end' | 'evenly' | 'around' ;
}
  // { selectedModelId }: { selectedModelId: string }
) {
  const router = useRouter();

  const { width: windowWidth } = useWindowSize();

  // sticky
  return (
    <header className={`flex  absolute w-full px-1.5 py-1 items-center justify-between backdrop-blur-md ${className} bg-card/80 z-10 top-0`}>
      <div className='flex  items-center'>
        <Button variant='ghost' size="icon" className=' p-0 gap-0 size-8 ml-1' onClick={() => {
          console.log('back')
          router.back()
        }}>
          <ChevronLeft size={32} className='min-w-8 min-h-8 opacity-50' />
        </Button>
      </div>

      <div className={`  w-full h-10 flex items-center ${justify ? `justify-${justify}` : ''}`}>
        {children}
      </div>
      <div className={`${justify==='center' ? 'w-9' : ''}`}></div>
    </header>
  );
}
