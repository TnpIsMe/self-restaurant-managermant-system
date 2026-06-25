import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BarChart2, FileDown, Plus, Eye, TrendingUp, Receipt, DivideCircle } from 'lucide-react'
import { reportService } from '@/services/reportService'
import { formatVND, formatDate } from '@/utils/format'
import { PageSpinner } from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Button from '@/components/common/Button'
import { useDownload } from '@/hooks/useDownload'
import toast from 'react-hot-toast'

export default function RevenueReportPage() {
  const qc           = useQueryClient()
  const { download } = useDownload()
  const [detail,     setDetail]     = useState(null)
  const [confirmCreate, setConfirmCreate] = useState(false)
  const [exporting,  setExporting]  = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn:  () => reportService.getAll().then((r) => r.data),
  })

  const reports      = data?.items ?? []
  const totalRevenue = reports.reduce((s, r) => s + r.tongDoanhThu, 0)
  const totalInv     = reports.reduce((s, r) => s + r.tongSoHoaDon, 0)
  const avgPerDay    = reports.length ? totalRevenue / reports.length : 0
  const todayReport  = reports.find((report) => {
    if (!report?.ngayBaoCao) return false
    return new Date(report.ngayBaoCao).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
  })

  const createMut = useMutation({
    mutationFn: () => reportService.createDaily(),
    onSuccess:  (res) => {
      qc.invalidateQueries(['reports'])
      toast.success('✅ Đã lập báo cáo hôm nay!')
      setDetail(res.data)
    },
    onError: async (e) => {
      if (e.response?.status === 409) {
        try {
          const { data } = await reportService.getAll()
          qc.setQueryData(['reports'], data)
          const today = new Date().toISOString().split('T')[0]
          const existing = (data?.items ?? []).find((report) => new Date(report.ngayBaoCao).toISOString().split('T')[0] === today)
          if (existing) {
            setDetail(existing)
          }
          toast.success('Báo cáo hôm nay đã tồn tại')
        } catch {
          toast.success('Báo cáo hôm nay đã tồn tại')
        }
        return
      }
      toast.error(e.response?.data?.message || 'Lỗi lập báo cáo')
    },
  })

  const handleCreateReport = () => {
    if (createMut.isPending) return
    if (todayReport) {
      setDetail(todayReport)
      toast.success('📌 Báo cáo hôm nay đã tồn tại')
      setConfirmCreate(false)
      return
    }
    setConfirmCreate(false)
    createMut.mutate()
  }

  const handleExport = async (id, type) => {
    setExporting(`${id}-${type}`)
    try {
      const { data: blob } = type === 'pdf'
        ? await reportService.exportPdf(id)
        : await reportService.exportExcel(id)
      download(blob, `BaoCao_${id}.${type === 'pdf' ? 'pdf' : 'xlsx'}`)
      toast.success('Đã tải xuống!')
    } catch {
      toast.error('Xuất file thất bại')
    } finally {
      setExporting(null)
    }
  }

  if (isLoading) return <PageSpinner />

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart2 size={22} className="text-orange-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Báo cáo doanh thu</h1>
            <p className="text-sm text-gray-400">{reports.length} báo cáo</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setConfirmCreate(true)}
          loading={createMut.isPending} className="gap-2">
          <Plus size={16} /> Lập báo cáo hôm nay
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: TrendingUp,   label: 'Tổng doanh thu',       value: formatVND(totalRevenue), color: 'text-orange-600', bg: 'bg-orange-50' },
          { icon: Receipt,      label: 'Tổng hóa đơn',         value: totalInv.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: DivideCircle, label: 'Doanh thu TB / ngày',  value: formatVND(avgPerDay), color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart placeholder — top 5 ngày */}
      {reports.length > 0 && (
        <div className="card p-4 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Top doanh thu gần đây</p>
          <div className="space-y-2">
            {[...reports].slice(0, 5).map((r) => {
              const pct = totalRevenue ? (r.tongDoanhThu / Math.max(...reports.map((x) => x.tongDoanhThu))) * 100 : 0
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">{formatDate(r.ngayBaoCao)}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-28 text-right flex-shrink-0">
                    {formatVND(r.tongDoanhThu)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Mã báo cáo</th>
              <th className="px-4 py-3 text-left">Ngày</th>
              <th className="px-4 py-3 text-right">Số HĐ</th>
              <th className="px-4 py-3 text-right">Doanh thu</th>
              <th className="px-4 py-3 text-left">Người lập</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reports.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400">
                Chưa có báo cáo nào. Nhấn "Lập báo cáo hôm nay" để bắt đầu.
              </td></tr>
            ) : reports.map((rpt) => (
              <tr key={rpt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-orange-600 font-semibold text-xs">{rpt.maBaoCao}</td>
                <td className="px-4 py-3 font-medium text-gray-700">{formatDate(rpt.ngayBaoCao)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{rpt.tongSoHoaDon}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{formatVND(rpt.tongDoanhThu)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{rpt.nguoiLap?.hoTen}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => setDetail(rpt)} title="Chi tiết"
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => handleExport(rpt.id, 'pdf')} title="Xuất PDF"
                      disabled={!!exporting} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                      <FileDown size={14} />
                    </button>
                    <button onClick={() => handleExport(rpt.id, 'excel')} title="Xuất Excel"
                      disabled={!!exporting} className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600 transition-colors">
                      <FileDown size={14} className="text-green-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <ConfirmDialog open={confirmCreate} onClose={() => setConfirmCreate(false)}
        onConfirm={handleCreateReport}
        loading={createMut.isPending}
        title="Lập báo cáo hôm nay"
        message="Bạn có chắc muốn lập báo cáo doanh thu cho hôm nay?"
        confirmLabel="Lập báo cáo" />

      <Modal open={!!detail} onClose={() => setDetail(null)}
        title={`Chi tiết: ${detail?.maBaoCao}`} size="lg">
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Doanh thu', formatVND(detail.tongDoanhThu), 'text-orange-600', 'bg-orange-50'],
                ['Số hóa đơn', detail.tongSoHoaDon, 'text-blue-600', 'bg-blue-50'],
                ['TB / HĐ', detail.tongSoHoaDon > 0 ? formatVND(detail.tongDoanhThu / detail.tongSoHoaDon) : '—', 'text-green-600', 'bg-green-50'],
              ].map(([label, value, color, bg]) => (
                <div key={label} className={`rounded-xl p-4 text-center ${bg}`}>
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className={`font-bold text-lg ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-2 text-sm">Chi tiết theo món ăn</p>
              <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                {detail.dongBaoCao?.map((d, i) => (
                  <div key={d.id} className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <div>
                      <span className="font-medium text-gray-900">{d.tenMon}</span>
                      <span className="text-gray-400 text-xs ml-2">× {d.soLuongDaBan}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatVND(d.doanhThuMon)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => handleExport(detail.id, 'pdf')}
                loading={exporting === `${detail.id}-pdf`} className="gap-1.5">
                <FileDown size={13} /> Xuất PDF
              </Button>
              <Button variant="success" size="sm" onClick={() => handleExport(detail.id, 'excel')}
                loading={exporting === `${detail.id}-excel`} className="gap-1.5">
                <FileDown size={13} /> Xuất Excel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
