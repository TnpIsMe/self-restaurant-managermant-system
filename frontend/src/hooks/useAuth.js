import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { connectSocket, disconnectSocket } from '@/socket/socketClient'
import { ROLE_HOME } from '@/constants/roles'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(async (maNV, matKhau) => {
    const { data } = await authService.login({ maNV, matKhau })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setAuth(data.user)
    connectSocket(data.accessToken)
    navigate(ROLE_HOME[data.user.vaiTro] ?? '/login')
    toast.success(`Chào mừng, ${data.user.hoTen}!`)
  }, [setAuth, navigate])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch {}
    clearAuth()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    disconnectSocket()
    navigate('/login')
    toast.success('Đã đăng xuất')
  }, [clearAuth, navigate])

  return { user, isAuthenticated, login, logout }
}
