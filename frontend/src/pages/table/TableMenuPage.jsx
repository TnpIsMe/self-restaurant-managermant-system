import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Search, ChevronRight, CreditCard, FileText, Info } from 'lucide-react'
import { menuService } from '@/services/menuService'
import { useCartStore } from '@/store/cartStore'
import { formatVND } from '@/utils/format'
import { PageSpinner } from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import { connectSocketAsTable } from '@/socket/socketClient'

const CATEGORIES = ['Tất cả', 'Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống']

export default function TableMenuPage() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const { items: cart, add, count, total } = useCartStore()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Tất cả')
  const [selectedDish, setSelectedDish] = useState(null)

  useEffect(() => { connectSocketAsTable(tableId) }, [tableId])

  const { data, isLoading } = useQuery({
    queryKey: ['menu', 'today'],
    queryFn: () => menuService.getToday().then((r) => r.data),
  })

  const menu = data?.dongThucDon ?? []

  const filtered = useMemo(() => menu.filter((d) => {
    const matchCat = cat === 'Tất cả' || d.monAn.danhMuc === cat
    const matchSearch = d.monAn.tenMon.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch && d.trangThai === 'CO_SAN'
  }), [menu, cat, search])

  if (isLoading) return <PageSpinner />

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-bold text-lg text-gray-900">Thực đơn hôm nay</h1>
            <p className="text-xs text-gray-400">Bàn {tableId}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/table/${tableId}/invoice`)}
              className="p-2 rounded-xl border border-gray-200 hover:bg-orange-500 hover:text-white flex items-center gap-1 text-sm text-orange-600 font-medium">
              <FileText size={16} />
            </button>
            <button onClick={() => navigate(`/table/${tableId}/member-card`)}
              className="p-2 rounded-xl border border-gray-200 hover:bg-orange-500 hover:text-white flex items-center gap-1 text-sm text-orange-600 font-medium">
              <CreditCard size={18}/>
            </button>
            <button onClick={() => navigate(`/table/${tableId}/order`)}
              className="relative btn-primary px-3 py-2 rounded-xl">
              <ShoppingCart size={18} />
              {count() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {count()}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 bg-gray-50" placeholder="Tìm món ăn..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-500 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-6 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-6 text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p>Không tìm thấy món phù hợp</p>
          </div>
        ) : filtered.map((dong) => {
          const mon = dong.monAn
          const inCart = cart.find((i) => i.maMon === mon.maMon)
          return (
            <div key={dong.id} onClick={() => setSelectedDish({ ...dong, mon })} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-5xl">
                {mon.hinhAnh ? <img src={mon.hinhAnh} alt={mon.tenMon} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} /> : '🍜'}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-900 line-clamp-1">{mon.tenMon}</p>
                {mon.moTa && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{mon.moTa}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-orange-600 font-bold text-sm">{formatVND(dong.giaBanTrongNgay)}</span>
                  <button onClick={() => add({ maMon: mon.maMon, tenMon: mon.tenMon, donGia: dong.giaBanTrongNgay })}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all ${inCart ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white'}`}>
                    {inCart ? inCart.soPhan : '+'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {count() > 0 && (
        <div className="fixed bottom-4 left-4 right-4">
          <button onClick={() => navigate(`/table/${tableId}/order`)}
            className="w-full bg-orange-500 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">{count()}</div>
            <span className="font-semibold">Xem giỏ hàng</span>
            <div className="flex items-center gap-1">
              <span className="font-bold">{formatVND(total())}</span>
              <ChevronRight size={16} />
            </div>
          </button>
        </div>
      )}

      {/* Dish Detail Modal */}
      <Modal open={!!selectedDish} onClose={() => setSelectedDish(null)} size="sm">
        {selectedDish && (
          <div className="space-y-4">
            {selectedDish.mon.hinhAnh && (
              <div className="rounded-2xl overflow-hidden bg-orange-50">
                <img src={selectedDish.mon.hinhAnh} alt={selectedDish.mon.tenMon}
                  className="w-full h-72 object-cover" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedDish.mon.tenMon}</h2>
              <p className="text-orange-600 font-bold text-lg mt-2">{formatVND(selectedDish.giaBanTrongNgay)}</p>
            </div>
            {selectedDish.mon.moTa && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Mô tả</p>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedDish.mon.moTa}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Danh mục</p>
                <p className="font-medium text-gray-900">{selectedDish.mon.danhMuc}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">Đơn vị</p>
                <p className="font-medium text-gray-900">{selectedDish.mon.donViTinh}</p>
              </div>
            </div>
            <button onClick={() => {
              add({ maMon: selectedDish.mon.maMon, tenMon: selectedDish.mon.tenMon, donGia: selectedDish.giaBanTrongNgay })
              setSelectedDish(null)
            }} className="w-full bg-orange-500 text-white rounded-xl py-3 font-semibold hover:bg-orange-600 transition-colors">
              + Thêm vào giỏ
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
