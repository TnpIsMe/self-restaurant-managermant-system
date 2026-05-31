import { Outlet, NavLink } from 'react-router-dom'
import { ChefHat, BookOpen, List, LogOut, Utensils } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'
import clsx from 'clsx'

const navBase = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors'
const navActive = 'bg-orange-500 text-white'
const navInactive = 'text-gray-400 hover:bg-gray-700 hover:text-white'

export default function KitchenLayout() {
  const { user, logout } = useAuth()
  const isBepTruong = user?.vaiTro === ROLES.BEP_TRUONG

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-gray-800 flex flex-col border-r border-gray-700">
        {/* Logo */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Utensils size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-400">Self Restaurant</p>
              <p className="text-xs text-gray-400">Phân hệ bếp</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to="/kitchen/kds"
            className={({ isActive }) => clsx(navBase, isActive ? navActive : navInactive)}
          >
            <List size={16} /> KDS – Danh sách order
          </NavLink>

          {isBepTruong && (
            <>
              <NavLink
                to="/kitchen/food-catalog"
                className={({ isActive }) => clsx(navBase, isActive ? navActive : navInactive)}
              >
                <BookOpen size={16} /> Danh mục món ăn
              </NavLink>
              <NavLink
                to="/kitchen/daily-menu"
                className={({ isActive }) => clsx(navBase, isActive ? navActive : navInactive)}
              >
                <ChefHat size={16} /> Thực đơn ngày
              </NavLink>
            </>
          )}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
              {user?.hoTen?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-400">{user?.hoTen}</p>
              <p className="text-xs text-gray-400">{isBepTruong ? 'Bếp trưởng' : 'Đầu bếp'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
