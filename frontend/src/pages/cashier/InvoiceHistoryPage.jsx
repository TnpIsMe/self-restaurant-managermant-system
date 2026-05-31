import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Search, Eye, Download } from 'lucide-react'
import { invoiceService } from '@/services/invoiceService'
import { formatVND, formatDateTime } from '@/utils/format'
import { PageSpinner } from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import Badge from '@/components/common/Badge'
import clsx from 'clsx'

const HTTT_LABEL = { TIEN_MAT: 'Tiền mặt', CHUYEN_KHOAN: 'Chuyển khoản' }
const HTTT_VAR   = { TIEN_MAT: 'green',    CHUYEN_KHOAN: 'blue' }

export default function InvoiceHistoryPage() {
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const [detail, setDetail] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', 'history', page],
    queryFn:  () => invoiceService.getHistory({ page, limit: 20 }).then((r) => r.data),
    keepPreviousData: true,
  })

  const invoices   = data?.items ?? []
  const total      = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const filtered = invoices.filter((inv) =>
    !search ||
    inv.maHoaDon?.toLowerCase().includes(search.toLowerCase()) ||
    inv.hoaDonTamTinh?.ban?.maBan?.toLowerCase().includes(search.toLowerCase()) ||
    inv.hoaDonTamTinh?.ban?.tenBan?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={22} className="text-orange-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lịch sử hóa đơn</h1>
            <p className="text-sm text-gray-400">Tổng {total.toLocaleString()} hóa đơn</p>
          </div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 w-60" placeholder="Tìm mã HD, tên bàn..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Mã hóa đơn</th>
              <th className="px-4 py-3 text-left">Bàn</th>
              <th className="px-4 py-3 text-left">Thời gian</th>
              <th className="px-4 py-3 text-right">Tổng tiền</th>
              <th className="px-4 py-3 text-center">Hình thức</th>
              <th className="px-4 py-3 text-left">Thu ngân</th>
              <th className="px-4 py-3 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={7} className="py-12"><PageSpinner /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-gray-400">Không có hóa đơn nào</td></tr>
            ) : filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-orange-600 font-semibold text-xs">{inv.maHoaDon}</td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {inv.hoaDonTamTinh?.ban?.tenBan ?? inv.hoaDonTamTinh?.ban?.maBan ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(inv.thoiGianThanhToan)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{formatVND(inv.tongTienHoaDon)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={HTTT_VAR[inv.hinhThucThanhToan] ?? 'gray'}>
                    {HTTT_LABEL[inv.hinhThucThanhToan] ?? inv.hinhThucThanhToan}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.thuNgan?.hoTen}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => setDetail(inv)}
                    className="p-1.5 hover:bg-orange-50 rounded-lg text-gray-400 hover:text-orange-500 transition-colors">
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Trang {page}/{totalPages} · {total} kết quả
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary btn-sm">← Trước</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={clsx('btn-sm w-8', p === page ? 'btn-primary' : 'btn-secondary')}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="btn-secondary btn-sm">Sau →</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)}
        title={`Chi tiết hóa đơn ${detail?.maHoaDon}`} size="md">
        {detail && (
          <div className="space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Bàn', detail.hoaDonTamTinh?.ban?.tenBan],
                ['Thời gian', formatDateTime(detail.thoiGianThanhToan)],
                ['Thu ngân', detail.thuNgan?.hoTen],
                ['Hình thức', HTTT_LABEL[detail.hinhThucThanhToan]],
                ['Tiền khách', formatVND(detail.tienKhachDua)],
                ['Tiền thừa', formatVND(detail.tienTraLai)],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-0.5">{k}</p>
                  <p className="font-medium text-gray-800">{v}</p>
                </div>
              ))}
            </div>

            {/* Items */}
            <div>
              <p className="font-semibold text-gray-800 mb-2 text-sm">Danh sách món</p>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {detail.dongHoaDon?.map((d, i) => (
                  <div key={d.id}
                    className={clsx('flex justify-between items-center px-4 py-2.5 text-sm',
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    )}>
                    <span className="text-gray-700">{d.tenMon} <span className="text-gray-400">×{d.soPhan}</span></span>
                    <span className="font-medium text-gray-900">{formatVND(d.thanhTien)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between font-bold text-xl bg-orange-50 rounded-xl p-4">
              <span className="text-gray-700">Tổng cộng</span>
              <span className="text-orange-600">{formatVND(detail.tongTienHoaDon)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
