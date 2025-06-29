'use client'

import { useSocket } from '~/components/providers/socket-provider'
import { Badge } from '~/components/ui/badge'
import { useEffect, useState } from 'react'

export const SocketIndicator = () => {
  const { isConnected } = useSocket()
  const [onlineSeconds, setOnlineSeconds] = useState(0)
  const [offlineSeconds, setOfflineSeconds] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isConnected) {
      setOfflineSeconds(0) // 重置离线计时器
      timer = setInterval(() => {
        setOnlineSeconds((prevSeconds) => prevSeconds + 1)
      }, 1000)
    } else {
      setOnlineSeconds(0) // 重置在线计时器
      timer = setInterval(() => {
        setOfflineSeconds((prevSeconds) => prevSeconds + 1)
      }, 1000)
    }

    return () => {
      clearInterval(timer)
    }
  }, [isConnected])

  return (
    <Badge
      className={isConnected ? 'bg-emerald-600' : 'bg-yellow-600'}
    >
      {isConnected ? `Live: Real-time updates -(${onlineSeconds}s)` : `Fallback: Polling every 1s -(${offlineSeconds}s)`}
    </Badge>
  )
}