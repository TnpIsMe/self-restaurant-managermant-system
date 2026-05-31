import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Star, User, Phone, Calendar } from 'lucide-react'
import { memberCardService } from '@/services/memberCardService'
import { formatDate } from '@/utils/format'
import toast from 'react-hot-toast'

export default function TableMemberCardPage() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [maThe, setMaThe] = useState('')
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleScan = async () => {
    if (!maThe.trim()) return toast.error('Vui lòng nhập mã thẻ')
    setLoading(true)
    try {
      const { data } = await memberCardService.scan(maThe.trim())
      setCard(data)
      toast.success('Đã nhận diện thẻ thành viên!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tìm thấy thẻ')
      setCard(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(`/table/${tableId}/menu`)} className="btn-ghost p-1">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-gray-900">Thẻ thành viên</h1>
          <p className="text-xs text-gray-400">Bàn {tableId}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Scan form */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Quét thẻ thành viên</p>
              <p className="text-xs text-gray-400">Nhập mã thẻ để tích điểm</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Nhập mã thẻ (VD: THE001)"
              value={maThe} onChange={(e) => setMaThe(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()} autoFocus />
            <button onClick={handleScan} disabled={loading} className="btn-primary px-5">
              {loading ? '...' : 'Tìm'}
            </button>
          </div>
        </div>

        {/* Card info */}
        {card && (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-orange-200 text-xs font-medium">THẺ THÀNH VIÊN</p>
                <p className="font-bold text-xl mt-1">{card.hoTen}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <CreditCard size={20} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-orange-200 text-xs">Mã thẻ</p>
                <p className="font-mono font-semibold">{card.maThe}</p>
              </div>
              <div>
                <p className="text-orange-200 text-xs">Trạng thái</p>
                <p className={`font-semibold ${card.trangThai === 'ACTIVE' ? 'text-green-200' : 'text-red-200'}`}>
                  {card.trangThai === 'ACTIVE' ? '✓ Hợp lệ' : '✗ Hết hạn'}
                </p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
              <Star size={20} className="text-yellow-300" />
              <div>
                <p className="text-orange-200 text-xs">Tổng điểm tích lũy</p>
                <p className="font-bold text-2xl">{card.tongDiem?.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-orange-200">
              <div className="flex items-center gap-1">
                <Phone size={12} /> {card.soDienThoai}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} /> HH: {formatDate(card.ngayHetHan)}
              </div>
            </div>
          </div>
        )}

        {/* Points table */}
        {card && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="font-semibold text-gray-900 mb-3">Lịch sử tích điểm gần đây</p>
            {card.lichSuTichDiem?.length > 0 ? (
              <div className="space-y-2">
                {card.lichSuTichDiem.slice(0, 5).map((ls) => (
                  <div key={ls.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-700">{ls.maHoaDon ?? 'Tích điểm'}</p>
                      <p className="text-xs text-gray-400">{formatDate(ls.ngayGiao)}</p>
                    </div>
                    <span className="font-semibold text-green-600">+{ls.diemCong} điểm</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">Chưa có lịch sử</p>
            )}
          </div>
        )}

        <button onClick={() => navigate(`/table/${tableId}/menu`)} className="btn-secondary w-full">
          Quay lại thực đơn
        </button>
      </div>
    </div>
  )
}
