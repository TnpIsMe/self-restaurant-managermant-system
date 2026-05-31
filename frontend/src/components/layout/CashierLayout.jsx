import { Outlet, NavLink } from 'react-router-dom'
import { CreditCard, FileText, BarChart2, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'
import Logo from '@/components/common/Logo'

const navBase = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors'
const navActive = 'bg-orange-500 text-white shadow-sm'
const navInactive = 'text-gray-600 hover:bg-gray-100'

export default function CashierLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-white flex flex-col border-r border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Logo />
            <div>
              <p className="font-bold text-sm text-gray-800">Self Restaurant</p>
              <p className="text-xs text-gray-400">POS Thu ngân</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to="/cashier/payment"
            className={({ isActive }) => clsx(navBase, isActive ? navActive : navInactive)}
          >
            <CreditCard size={16} /> Thanh toán
          </NavLink>
          <NavLink
            to="/cashier/invoice-history"
            className={({ isActive }) => clsx(navBase, isActive ? navActive : navInactive)}
          >
            <FileText size={16} /> Lịch sử hóa đơn
          </NavLink>
          <NavLink
            to="/cashier/report"
            className={({ isActive }) => clsx(navBase, isActive ? navActive : navInactive)}
          >
            <BarChart2 size={16} /> Báo cáo doanh thu
          </NavLink>
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
              {user?.hoTen?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.hoTen}</p>
              <p className="text-xs text-gray-400">Thu ngân</p>
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

      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
