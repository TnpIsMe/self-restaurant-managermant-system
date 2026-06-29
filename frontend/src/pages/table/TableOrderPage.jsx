import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2, Minus, Plus, Send, FileText, ShoppingCart } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { useCartStore } from '@/store/cartStore'
import { formatVND } from '@/utils/format'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import toast from 'react-hot-toast'

export default function TableOrderPage() {
  const { tableId } = useParams()        // maBan: B01, B02...
  const navigate    = useNavigate()
  const qc          = useQueryClient()
  const { items, remove, restore, updateQty, updateNote, clear, total } = useCartStore()
  const [ghiChu, setGhiChu] = useState('')
  const [editNote, setEditNote] = useState(null)
  const [pendingRemoveItem, setPendingRemoveItem] = useState(null)
  const [undoItem, setUndoItem] = useState(null)
  const undoTimerRef = useRef(null)

  useEffect(() => () => {
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
  }, [])

  const clearUndoTimer = () => {
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
  }

  const handleRemoveClick = (item) => setPendingRemoveItem(item)

  const confirmRemoveItem = () => {
    if (!pendingRemoveItem) return

    try {
      const removed = remove(pendingRemoveItem.maMon)
      if (!removed) throw new Error('remove failed')

      clearUndoTimer()
      setPendingRemoveItem(null)
      setUndoItem(pendingRemoveItem)
      undoTimerRef.current = window.setTimeout(() => setUndoItem(null), 5000)
      toast.success(`Đã xóa "${pendingRemoveItem.tenMon}" khỏi order.`)
    } catch {
      toast.error('Có lỗi, vui lòng thử lại.')
    }
  }

  const handleUndoRemove = () => {
    if (!undoItem) return

    clearUndoTimer()
    restore(undoItem)
    setUndoItem(null)
    toast.success(`Đã khôi phục "${undoItem.tenMon}"`)
  }

  const mutation = useMutation({
    mutationFn: () => orderService.create(
      tableId,
      items.map((i) => ({ maMon: i.maMon, soPhan: i.soPhan, ghiChu: i.ghiChu || null })),
      ghiChu || null
    ),
    onSuccess: () => {
      qc.invalidateQueries(['invoice', tableId])
      clear()
      toast.success('Đã gửi order lên bếp! 🍳')
      navigate(`/table/${tableId}/invoice`)
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Gửi order thất bại'
      toast.error(msg)
    },
  })

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <ShoppingCart size={56} className="text-gray-200" />
        <p className="text-gray-500 font-medium text-lg">Giỏ hàng trống</p>
        <button onClick={() => navigate(`/table/${tableId}/menu`)} className="btn-primary btn-lg">
          Xem thực đơn
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(`/table/${tableId}/menu`)} className="btn-ghost p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900">Giỏ hàng</h1>
          <p className="text-xs text-gray-400">Bàn {tableId}</p>
        </div>
        <button
          onClick={() => navigate(`/table/${tableId}/invoice`)}
          className="flex items-center gap-1 text-sm text-orange-600 font-medium"
        >
          <FileText size={16} /> Hóa đơn
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-auto p-4 space-y-3 pb-36">
        {items.map((item) => (
          <div key={item.maMon} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">
                🍜
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{item.tenMon}</p>
                <p className="text-orange-600 font-semibold text-sm mt-0.5">{formatVND(item.donGia)}</p>
              </div>
              <button
                onClick={() => handleRemoveClick(item)}
                className="text-red-400 hover:text-red-600 p-1 transition-transform duration-200 active:scale-95"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Số lượng */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQty(item.maMon, item.soPhan - 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-semibold text-gray-900 text-lg">
                  {item.soPhan}
                </span>
                <button
                  onClick={() => updateQty(item.maMon, item.soPhan + 1)}
                  className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="font-bold text-gray-900">{formatVND(item.donGia * item.soPhan)}</span>
            </div>

            {/* Ghi chú từng món */}
            {editNote === item.maMon ? (
              <input
                className="input mt-2 text-sm"
                placeholder="Ghi chú cho món này (VD: không cay, ít hành...)"
                value={item.ghiChu || ''}
                autoFocus
                onChange={(e) => updateNote(item.maMon, e.target.value)}
                onBlur={() => setEditNote(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditNote(null)}
              />
            ) : (
              <button
                onClick={() => setEditNote(item.maMon)}
                className="mt-2 text-xs text-gray-400 hover:text-orange-500 transition-colors"
              >
                {item.ghiChu ? `📝 ${item.ghiChu}` : '+ Thêm ghi chú cho món'}
              </button>
            )}
          </div>
        ))}

        {/* Ghi chú chung cho bàn */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <label className="label text-xs text-gray-500">Ghi chú cho cả bàn</label>
          <textarea
            className="input text-sm resize-none mt-1"
            rows={2}
            placeholder="VD: Ngồi ngoài sân, ít đá, không hành..."
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingRemoveItem)}
        onClose={() => setPendingRemoveItem(null)}
        onConfirm={confirmRemoveItem}
        title="Xóa món khỏi order"
        message={`Bạn có chắc muốn xóa "${pendingRemoveItem?.tenMon || ''}" khỏi order?`}
        confirmLabel="Xóa"
        danger
      />

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 space-y-3">
        {undoItem && (
          <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
            <span>Đã xóa "{undoItem.tenMon}" khỏi order. (Hoàn tác)</span>
            <button onClick={handleUndoRemove} className="font-semibold underline transition-transform duration-200 active:scale-95">
              Hoàn tác
            </button>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">
            {items.reduce((s, i) => s + i.soPhan, 0)} món
          </span>
          <span className="font-bold text-xl text-gray-900">{formatVND(total())}</span>
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="btn-primary w-full btn-lg gap-2 justify-center"
        >
          <Send size={18} />
          {mutation.isPending ? 'Đang gửi lên bếp...' : 'Gửi order lên bếp'}
        </button>
      </div>
    </div>
  )
}
