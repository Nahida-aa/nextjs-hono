"use client";
// app/providers.tsx

import {HeroUIProvider} from '@heroui/react'

export function UIProviders({children}: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  )
}