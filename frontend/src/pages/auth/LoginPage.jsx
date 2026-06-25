import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Utensils, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ maNV: '', matKhau: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.maNV || !form.matKhau) return toast.error('Vui lòng nhập đầy đủ thông tin')
    setLoading(true)
    try { await login(form.maNV, form.matKhau) }
    catch (err) { toast.error(err.response?.data?.message || 'Sai mã nhân viên hoặc mật khẩu') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-500 rounded-2xl shadow-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
              <rect width="100%" height="100%" fill="#f97316" />

              <g stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <g transform="rotate(-45 100 100)">
                  <path d="M 104 88 L 104 15 C 80 25 80 80 88 88" />
                  <path d="M 98 110 L 100 165" />
                </g>

                <g transform="rotate(45 100 100)">
                  <path d="M 100 165 L 100 100 L 100 35 L 100 15" />
                  <path d="M 76 35 L 76 60 C 76 85 124 85 124 60 L 124 35" />
                </g>
              </g>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Self Restaurant</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Đăng nhập hệ thống quản lý</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Mã nhân viên</label>
              <input className="input border border-gray-300 focus:ring-orange-500 focus:border-orange-500" placeholder="VD: BT001" value={form.maNV}
                onChange={(e) => setForm({ ...form, maNV: e.target.value.toUpperCase() })} autoFocus />
            </div>
            <div>
              <label className="label">Mật khẩu</label>
              <div className="relative">
                <input className="input border border-gray-300 focus:ring-orange-500 focus:border-orange-500 pr-10" type={showPass ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu" value={form.matKhau}
                  onChange={(e) => setForm({ ...form, matKhau: e.target.value })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">Demo (mật khẩu: 123456)</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ maNV: 'BT001', label: 'Bếp trưởng' }, { maNV: 'DB001', label: 'Đầu bếp' }, { maNV: 'TN001', label: 'Thu ngân' }].map(({ maNV, label }) => (
                <button key={maNV} type="button" onClick={() => setForm({ maNV, matKhau: '123456' })}
                  className="text-xs text-gray-400 py-1.5 px-2 rounded-lg bg-gray-50 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
