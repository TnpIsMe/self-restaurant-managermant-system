import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ShoppingBag, Clock, CheckCircle, ChefHat, AlertCircle } from 'lucide-react'
import { invoiceService } from '@/services/invoiceService'
import { formatVND, formatTime } from '@/utils/format'
import { useSocket } from '@/hooks/useSocket'
import { EVENTS } from '@/socket/socketClient'

const STATUS_CONFIG = {
  CHO_CHE_BIEN: { label: 'Chờ chế biến', cls: 'bg-yellow-100 text-yellow-700',  icon: '⏳' },
  DANG_LAM:     { label: 'Đang làm',     cls: 'bg-orange-100 text-orange-700',  icon: '👨‍🍳' },
  HOAN_TAT:     { label: 'Hoàn tất',     cls: 'bg-green-100  text-green-700',   icon: '✅' },
  DA_HUY:       { label: 'Đã huỷ',       cls: 'bg-gray-100   text-gray-500',    icon: '❌' },
}

export default function TableInvoicePage() {
  const { tableId } = useParams()
  const navigate    = useNavigate()
  const qc          = useQueryClient()

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', tableId],
    queryFn:  () => invoiceService.getByTable(tableId).then((r) => r.data),
    refetchInterval: 20000,
  })

  // Realtime update khi bếp hoàn tất món
  useSocket(EVENTS.INVOICE_UPDATED,      () => qc.invalidateQueries(['invoice', tableId]), [tableId])
  useSocket(EVENTS.ORDER_ITEM_COMPLETED, () => qc.invalidateQueries(['invoice', tableId]), [tableId])
  useSocket(EVENTS.ORDER_ITEM_CHANGED,   () => qc.invalidateQueries(['invoice', tableId]), [tableId])

  const orders   = invoice?.phieuOrders ?? []
  const allItems = orders.flatMap((o) => o.dongOrders ?? [])
  const tongTien = allItems.reduce((s, i) => s + (i.thanhTien ?? 0), 0)

  const doneCount    = allItems.filter((i) => i.trangThaiCheBien === 'HOAN_TAT').length
  const pendingCount = allItems.filter((i) => ['CHO_CHE_BIEN', 'DANG_LAM'].includes(i.trangThaiCheBien)).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(`/table/${tableId}/menu`)} className="btn-ghost p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900">Hóa đơn tạm tính</h1>
          <p className="text-xs text-gray-400">Bàn {tableId}</p>
        </div>
        {allItems.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400">{doneCount}/{allItems.length} món xong</p>
            {pendingCount > 0 && (
              <p className="text-xs text-orange-500 flex items-center gap-1 justify-end">
                <ChefHat size={11} /> {pendingCount} đang làm
              </p>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : !invoice || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3 px-6">
          <ShoppingBag size={52} className="text-gray-200" />
          <p className="font-medium text-gray-500">Chưa có order nào</p>
          <p className="text-sm text-center">Hãy chọn món từ thực đơn và gửi order lên bếp</p>
          <button onClick={() => navigate(`/table/${tableId}/menu`)} className="btn-primary mt-2">
            Xem thực đơn
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-3 pb-32">
          {/* Progress bar */}
          {allItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Tiến độ chế biến</span>
                <span>{doneCount}/{allItems.length} món</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${allItems.length ? (doneCount / allItems.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Orders */}
          {orders.map((order, idx) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Lần gọi #{idx + 1}</span>
                  {order.ghiChu && (
                    <span className="text-xs text-gray-400">· {order.ghiChu}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} />
                  {formatTime(order.thoiDiemDat)}
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {(order.dongOrders ?? []).map((dong) => {
                  const cfg = STATUS_CONFIG[dong.trangThaiCheBien] ?? STATUS_CONFIG.CHO_CHE_BIEN
                  return (
                    <div key={dong.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-lg">{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {dong.monAn?.tenMon}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-400">
                            ×{dong.soPhan} · {formatVND(dong.donGia)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                            {cfg.label}
                          </span>
                          {dong.ghiChu && (
                            <span className="text-xs text-gray-400">📝 {dong.ghiChu}</span>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm flex-shrink-0">
                        {formatVND(dong.thanhTien)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Tổng tiền */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
            {invoice.theThanhVien && (
              <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                <span className="text-orange-600 font-medium">
                  🎫 {invoice.theThanhVien.hoTen}
                </span>
                <span className="text-orange-500 text-xs">
                  +{Math.floor(tongTien / 1000)} điểm dự kiến
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Số lượng món</span>
              <span>{allItems.reduce((s, i) => s + i.soPhan, 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t border-gray-100 pt-2">
              <span className="text-gray-900">Tổng tiền</span>
              <span className="text-orange-600">{formatVND(tongTien)}</span>
            </div>
            {invoice.daKhoa && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-xl p-3 mt-2">
                <CheckCircle size={16} />
                <span>Hóa đơn đã khoá — Thu ngân đang chuẩn bị thanh toán</span>
              </div>
            )}
          </div>

          {/* Nút gọi thêm */}
          {!invoice.daKhoa && (
            <button
              onClick={() => navigate(`/table/${tableId}/menu`)}
              className="btn-secondary w-full btn-lg"
            >
              + Gọi thêm món
            </button>
          )}

          {invoice.daKhoa && (
            <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 rounded-xl p-3">
              <AlertCircle size={16} />
              <span>Hóa đơn đã bị khoá, không thể gọi thêm món</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
