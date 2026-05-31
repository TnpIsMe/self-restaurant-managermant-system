import { useEffect } from 'react'
import { socket } from '@/socket/socketClient'

export function useSocket(event, handler, deps = []) {
  useEffect(() => {
    socket.on(event, handler)
    return () => { socket.off(event, handler) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps])
}
