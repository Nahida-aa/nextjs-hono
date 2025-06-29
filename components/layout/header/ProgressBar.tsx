'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
import '~/style/nprogress.css'

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false })
  }, [])

  useEffect(() => {
    console.log('%c ProgressBar: Pathname changed to', 'background: #222; color: #bada55', pathname)
    NProgress.done()
    return () => {
      console.log('%c ProgressBar: Cleanup', 'background: #222; color: #bada55', pathname)
      NProgress.start()
    }
  }, [pathname, searchParams])

  return null
}