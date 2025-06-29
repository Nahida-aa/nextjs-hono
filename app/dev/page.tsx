import React from 'react'
import { cookies } from 'next/headers';
import Link from 'next/link'; // 对 next 内的 router 的跳转
import { redirect } from 'next/navigation'
import {ScrollShadow} from "@heroui/scroll-shadow";
import { Button } from '@heroui/button';

export default async function Page() {
  return <>
    <Button color="primary" variant="shadow">
      <a href="/api/hono" target="_blank">
        api docs (Scalar UI)
      </a>
    </Button>
    <Button>
      <a href="/api/hono/openapi.json" target="_blank">
        openapi.json 
      </a>
    </Button>
  </>
}
