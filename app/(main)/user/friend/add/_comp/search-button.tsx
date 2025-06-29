"use client";
import { HomeHeader } from '~/components/layout/header/home-header'
import React, { useEffect, useState } from 'react'
// import { cookies } from 'next/headers';
import Link from 'next/link'; // 对 next 内的 router 的跳转
import { Button } from '~/components/ui/button';
import { redirect, useRouter } from 'next/navigation'
import { ScrollArea } from '~/components/ui/scroll-area';
import { server_auth } from '~/app/(auth)/auth';
import { SubHeader } from '~/components/layout/header/sub-header';
import { Search } from 'lucide-react';
import { Input } from "~/components/ui/input"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command"


const SearchButton = ({
  router_push = '/search',
  placeholder = 'Search...',
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    sessionStorage.removeItem(`searchResults`)
  }, [])

  return (<>
        {/* <Input
          type='text'
          placeholder='name\email\phone'
          className='w-full max-w-xs focus-visible:ring-1 focus-visible:ring-offset-0'
        /> */}
      <div className='px-4'>
        <Button variant='outline' className='bg-muted w-full md:w-64 lg:w-80 xl:w-96 justify-between h-8 '
          onClick={() => router.push(router_push)}
        >
          <div className='w-8'>
            <Search size={20} className='opacity-50 '/>
          </div>
          <span className="hidden lg:inline-flex opacity-50 text-xs">Search...</span>
          <span className="inline-flex lg:hidden opacity-50 text-xs">{placeholder}
          </span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      {/* <ScrollArea className='overflow-auto h-full flex w-full'> */}
      {/* </ScrollArea> */}
  </>)
}
export default SearchButton;