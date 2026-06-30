import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Banknote, QrCode, Lock, Unlock, CheckCircle, RefreshCw, Users } from 'lucide-react'
import { tableService } from '@/services/tableService'
import { invoiceService } from '@/services/invoiceService'
import { paymentService } from '@/services/paymentService'
import { memberCardService } from '@/services/memberCardService'
import { formatVND, formatDateTime } from '@/utils/format'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { PageSpinner } from '@/components/common/Spinner'
import { useSocket } from '@/hooks/useSocket'
import { EVENTS } from '@/socket/socketClient'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TABLE_COLOR = {
  TRONG:        'bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700 hover:border-green-500 dark:hover:border-green-400 text-gray-800 dark:text-white',
  DANG_PHUC_VU: 'bg-orange-50 dark:bg-orange-900 border-orange-300 dark:border-orange-700 hover:border-orange-500 dark:hover:border-orange-400 text-gray-800 dark:text-white',
  DONG_CUA:     'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed text-gray-600 dark:text-gray-400',
}
const TABLE_LABEL = { TRONG: 'Trống', DANG_PHUC_VU: 'Đang phục vụ', DONG_CUA: 'Đóng cửa' }

export default function PaymentPage() {
  const qc = useQueryClient()

  const [selectedTableId, setSelectedTableId] = useState(null) // db id
  const [payModal,  setPayModal]  = useState(null)  // 'cash' | 'transfer' | null
  const [cashInput, setCashInput] = useState('')
  const [qrData,    setQrData]    = useState(null)
  const [cardInput, setCardInput] = useState('')
  const [cardInfo,  setCardInfo]  = useState(null)

  // Nhận sự kiện bàn thay đổi realtime
  useSocket(EVENTS.TABLE_STATUS_CHANGED, () => qc.invalidateQueries(['tables']))

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn:  () => tableService.getAll().then((r) => r.data),
    refetchInterval: 15000,
  })

  const { data: invoice, isLoading: invLoading } = useQuery({
    queryKey: ['invoice', selectedTableId],
    queryFn:  () => invoiceService.getByTable(selectedTableId).then((r) => r.data),
    enabled:  !!selectedTableId,
  })

  const allItems = invoice?.phieuOrders?.flatMap((o) => o.dongOrders ?? []) ?? []
  const tongTien = allItems.reduce((s, i) => s + (i.thanhTien ?? 0), 0)
  const tienThua = cashInput ? Math.max(0, Number(cashInput) - tongTien) : 0

  // Mutations
  const lockMut = useMutation({
    mutationFn: () => invoiceService.lock(invoice.id),
    onSuccess:  () => { qc.invalidateQueries(['invoice', selectedTableId]); toast.success('Đã khoá hóa đơn') },
    onError:    () => toast.error('Lỗi khoá hóa đơn'),
  })
  const unlockMut = useMutation({
    mutationFn: () => invoiceService.unlock(invoice.id),
    onSuccess:  () => { qc.invalidateQueries(['invoice', selectedTableId]); toast.success('Đã mở khoá') },
    onError:    () => toast.error('Lỗi mở khoá'),
  })
  const cashMut = useMutation({
    mutationFn: () => paymentService.payCash(invoice.id, Number(cashInput)),
    onSuccess:  (res) => {
      toast.success('💰 Thanh toán thành công!')
      window.open(`/api/invoices/${res.data.id}/receipt`, '_blank', 'noopener,noreferrer')
      qc.invalidateQueries(['tables'])
      setPayModal(null); setCashInput(''); setCardInput(''); setCardInfo(null)
      setSelectedTableId(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi thanh toán'),
  })
  const transferMut = useMutation({
    mutationFn: () => paymentService.initiateTransfer(invoice.id),
    onSuccess:  (res) => setQrData(res.data),
    onError:    () => toast.error('Lỗi tạo mã QR'),
  })
  const confirmMut = useMutation({
    mutationFn: () => paymentService.confirmTransfer(invoice.id),
    onSuccess:  (res) => {
      toast.success('✅ Xác nhận chuyển khoản thành công!')
      window.open(`/api/invoices/${res.data.id}/receipt`, '_blank', 'noopener,noreferrer')
      qc.invalidateQueries(['tables'])
      setPayModal(null); setQrData(null); setCardInput(''); setCardInfo(null)
      setSelectedTableId(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi xác nhận'),
  })

  const handleScanCard = async () => {
    if (!cardInput.trim()) return
    try {
      const { data } = await memberCardService.scan(cardInput.trim())
      setCardInfo(data)
      toast.success(`Thẻ: ${data.hoTen} — ${data.tongDiem} điểm`)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không tìm thấy thẻ')
      setCardInfo(null)
    }
  }

  const selectedTable = tables.find((t) => t.id === selectedTableId)

  if (isLoading) return <PageSpinner />

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* ── Cột trái: Danh sách bàn ── */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        <div className="card">
          <div className="card-header flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-400 dark:text-gray-500" />
              <h2 className="font-semibold text-gray-800 dark:text-white text-sm">Sơ đồ bàn</h2>
            </div>
            <button onClick={() => qc.invalidateQueries(['tables'])}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors">
              <RefreshCw size={13} />
            </button>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {tables.map((table) => (
              <button
                key={table.id}
                disabled={table.trangThai === 'DONG_CUA'}
                onClick={() => {
                  if (table.trangThai === 'DONG_CUA') return
                  setSelectedTableId(table.id === selectedTableId ? null : table.id)
                }}
                className={clsx(
                  'p-3 rounded-xl border-2 text-left transition-all',
                  TABLE_COLOR[table.trangThai],
                  selectedTableId === table.id && 'ring-2 ring-orange-400 ring-offset-1'
                )}
              >
                <p className="font-bold text-sm">{table.maBan}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{table.tenBan}</p>
                <span className={clsx('text-xs font-medium block mt-1',
                  table.trangThai === 'TRONG' ? 'text-green-600 dark:text-green-300' :
                  table.trangThai === 'DANG_PHUC_VU' ? 'text-orange-600 dark:text-orange-300' : 'text-gray-400'
                )}>
                  {TABLE_LABEL[table.trangThai]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Thẻ thành viên */}
        {selectedTableId && invoice && (
          <div className="card p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Thẻ thành viên</p>
            <div className="flex gap-2">
              <input className="input text-sm flex-1" placeholder="Mã thẻ..." value={cardInput}
                onChange={(e) => setCardInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleScanCard()} />
              <button onClick={handleScanCard} className="btn-secondary btn-sm px-3">Tìm</button>
            </div>
            {cardInfo && (
              <div className="mt-2 bg-orange-50 dark:bg-orange-900 rounded-lg p-2 text-xs">
                <p className="font-medium text-orange-700 dark:text-orange-200">{cardInfo.hoTen}</p>
                <p className="text-orange-500 dark:text-orange-300">⭐ {cardInfo.tongDiem} điểm · +{Math.floor(tongTien/1000)} sẽ cộng</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Cột phải: Hóa đơn ── */}
      <div className="flex-1 min-w-0">
        {!selectedTableId ? (
          <div className="card h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <CreditCard size={52} className="mx-auto mb-3 text-gray-200 dark:text-gray-600" />
              <p className="font-medium text-gray-500 dark:text-gray-400">Chọn bàn để xem hóa đơn</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Bàn <span className="text-orange-500">cam</span> đang có khách
              </p>
            </div>
          </div>
        ) : invLoading ? (
          <div className="card h-full flex items-center justify-center"><PageSpinner /></div>
        ) : !invoice || allItems.length === 0 ? (
          <div className="card h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-4xl mb-3">🪑</p>
              <p className="font-medium text-gray-600 dark:text-gray-400">Bàn {selectedTable?.maBan} chưa có order</p>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col h-full max-h-full overflow-hidden">
            {/* Invoice header */}
            <div className="card-header flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                  {selectedTable?.tenBan ?? selectedTable?.maBan}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  HD: {invoice.maHoaDonTamTinh} · Mở lúc {formatDateTime(invoice.thoiDiemMo)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {invoice.daKhoa ? (
                  <Button variant="secondary" size="sm" onClick={() => unlockMut.mutate()}
                    loading={unlockMut.isPending} className="gap-1.5">
                    <Unlock size={13} /> Mở khoá
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => lockMut.mutate()}
                    loading={lockMut.isPending} className="gap-1.5">
                    <Lock size={13} /> Khoá HD
                  </Button>
                )}
              </div>
            </div>

            {/* Items list */}
            <div className="overflow-y-auto flex-1 px-6 py-3 space-y-1">
              {allItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.monAn?.tenMon}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">×{item.soPhan} · {formatVND(item.donGia)}</span>
                      <span className={clsx('text-xs px-1.5 py-0.5 rounded-full',
                        item.trangThaiCheBien === 'HOAN_TAT' ? 'bg-green-100 text-green-600' :
                        item.trangThaiCheBien === 'DANG_LAM'  ? 'bg-orange-100 text-orange-600' :
                        'bg-yellow-100 text-yellow-600'
                      )}>
                        {item.trangThaiCheBien === 'HOAN_TAT' ? 'Xong' :
                         item.trangThaiCheBien === 'DANG_LAM'  ? 'Đang làm' : 'Chờ'}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 ml-3">{formatVND(item.thanhTien)}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Tổng cộng</span>
                <span className="text-2xl font-bold text-orange-600">{formatVND(tongTien)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setPayModal('cash'); setCashInput('') }}
                  className="btn-success btn-lg gap-2 justify-center">
                  <Banknote size={18} /> Tiền mặt
                </button>
                <button onClick={() => { setPayModal('transfer'); transferMut.mutate() }}
                  className="btn-primary btn-lg gap-2 justify-center">
                  <QrCode size={18} /> Chuyển khoản
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal tiền mặt */}
      <Modal open={payModal === 'cash'} onClose={() => setPayModal(null)} title="Thanh toán tiền mặt" size="sm">
        <div className="space-y-4">
          <div className="bg-orange-50 rounded-2xl p-5 text-center">
            <p className="text-gray-500 text-sm mb-1">Số tiền cần thanh toán</p>
            <p className="text-4xl font-bold text-orange-600">{formatVND(tongTien)}</p>
          </div>
          <div>
            <label className="label">Tiền khách đưa (VNĐ)</label>
            <input className="input text-xl font-bold text-center py-3" type="number"
              min={tongTien} placeholder={String(tongTien)}
              value={cashInput} onChange={(e) => setCashInput(e.target.value)} autoFocus />
          </div>
          {cashInput && Number(cashInput) >= tongTien && (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-sm mb-1">Tiền thừa trả lại</p>
              <p className="text-3xl font-bold text-green-600">{formatVND(tienThua)}</p>
            </div>
          )}
          {cashInput && Number(cashInput) < tongTien && (
            <p className="text-red-500 text-sm text-center font-medium">
              ⚠️ Tiền đưa chưa đủ (thiếu {formatVND(tongTien - Number(cashInput))})
            </p>
          )}
          <Button variant="success" className="w-full btn-lg gap-2 justify-center"
            disabled={!cashInput || Number(cashInput) < tongTien}
            loading={cashMut.isPending} onClick={() => cashMut.mutate()}>
            <CheckCircle size={18} /> Xác nhận thanh toán
          </Button>
        </div>
      </Modal>

      {/* Modal chuyển khoản / QR */}
      <Modal open={payModal === 'transfer'} onClose={() => { setPayModal(null); setQrData(null) }}
        title="Thanh toán chuyển khoản" size="sm">
        {transferMut.isPending ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="animate-spin w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full" />
            <p className="text-gray-400 text-sm">Đang tạo mã QR...</p>
          </div>
        ) : qrData ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-3">Khách quét mã để chuyển khoản</p>
              <img src={qrData.qrUrl} alt="QR VietQR"
                className="mx-auto w-56 h-56 object-contain border border-gray-200 rounded-2xl p-2" />
              <p className="text-3xl font-bold text-orange-600 mt-3">{formatVND(qrData.tongTien)}</p>
              <p className="text-xs text-gray-400 mt-1">Nội dung: {qrData.noiDung}</p>
            </div>
            <Button variant="primary" className="w-full btn-lg gap-2 justify-center"
              loading={confirmMut.isPending} onClick={() => confirmMut.mutate()}>
              <CheckCircle size={18} /> Xác nhận đã nhận tiền
            </Button>
          </div>
        ) : (
          <div className="text-center py-10 text-red-400">
            <p>Không tạo được mã QR</p>
            <button onClick={() => transferMut.mutate()} className="btn-secondary mt-3">Thử lại</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
