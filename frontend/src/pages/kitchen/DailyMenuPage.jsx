import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Plus, Trash2, ToggleLeft, ToggleRight, Save } from 'lucide-react'
import { menuService } from '@/services/menuService'
import { foodService } from '@/services/foodService'
import { formatVND, formatDate } from '@/utils/format'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import toast from 'react-hot-toast'

export default function DailyMenuPage() {
  const qc = useQueryClient()
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedFoods, setSelectedFoods] = useState([]) // [{ foodId, giaBan }]
  const [prices, setPrices] = useState({})
  const [priceWarnings, setPriceWarnings] = useState([])
  const [isWarningVisible, setIsWarningVisible] = useState(false)

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu', selectedDate],
    queryFn: () => menuService.getByDate(selectedDate).then((r) => r.data).catch(() => null),
  })

  const { data: allFoods = [] } = useQuery({
    queryKey: ['foods'],
    queryFn: () => foodService.getAll().then((r) => r.data),
  })

  // Những món chưa có trong menu ngày
  const availableToAdd = allFoods.filter(
    (f) => f.isActive && !menu?.dongThucDon?.some((d) => d.monAnId === f.id)
  )

  const createMut = useMutation({
    mutationFn: (items) => menuService.create({ ngay: selectedDate, items }),
    onSuccess: () => { qc.invalidateQueries(['menu', selectedDate]); toast.success('Đã tạo thực đơn!') },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi tạo thực đơn'),
  })

  const updateItemMut = useMutation({
    mutationFn: ({ itemId, data }) => menuService.updateItem(menu.id, itemId, data),
    onSuccess: () => qc.invalidateQueries(['menu', selectedDate]),
  })

  const deleteItemMut = useMutation({
    mutationFn: (itemId) => menuService.deleteItem(menu.id, itemId),
    onSuccess: () => { qc.invalidateQueries(['menu', selectedDate]); toast.success('Đã xoá khỏi thực đơn') },
  })

  const handleToggleAvailability = (item) => {
    updateItemMut.mutate({
      itemId: item.id,
      data: { trangThai: item.trangThai === 'CO_SAN' ? 'HET_MON' : 'CO_SAN' },
    })
  }

  const handleAddToMenu = () => {
    if (selectedFoods.length === 0) return toast.error('Chọn ít nhất 1 món')

    const warnings = []
    const items = []
    for (const foodId of selectedFoods) {
      const food = allFoods.find((f) => f.id === foodId)
      const minPrice = Number(food?.giaGoc ?? 0)
      const rawPrice = Number(prices[foodId] ?? food?.giaGoc ?? 0)
      const price = Number.isFinite(rawPrice) ? rawPrice : minPrice

      if (price < minPrice) {
        warnings.push({ foodId, foodName: food?.tenMon || 'Món này', message: 'Giá bán phải lớn hơn hoặc bằng giá gốc.' })
        continue
      }

      items.push({ monAnId: foodId, giaBanTrongNgay: price })
    }

    setPriceWarnings(warnings)
    if (warnings.length > 0) return

    if (!menu) {
      createMut.mutate(items)
    } else {
      menuService.update(menu.id, { addItems: items })
        .then(() => { qc.invalidateQueries(['menu', selectedDate]); toast.success('Đã thêm món vào thực đơn!') })
        .catch((e) => toast.error(e.response?.data?.message || 'Lỗi thêm món'))
    }
    setShowAddModal(false)
    setSelectedFoods([])
    setPrices({})
  }

  const toggleFoodSelect = (id) => {
    setSelectedFoods((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
    setPriceWarnings((prev) => prev.filter((warning) => warning.foodId !== id))
    setIsWarningVisible(false)
  }

  useEffect(() => {
    if (priceWarnings.length === 0) {
      setIsWarningVisible(false)
      return
    }

    setIsWarningVisible(true)
    const hideTimer = window.setTimeout(() => setIsWarningVisible(false), 4000)
    const clearTimer = window.setTimeout(() => setPriceWarnings([]), 4300)

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(clearTimer)
    }
  }, [priceWarnings])

  const dongThucDon = menu?.dongThucDon ?? []

  return (
    <div className="min-h-full bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays size={24} className="text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold">Thực đơn ngày</h1>
            <p className="text-gray-400 text-sm">{dongThucDon.length} món trong ngày</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus size={16} /> Thêm món
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Đang tải...</div>
      ) : !menu && selectedDate === today ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">Chưa có thực đơn cho ngày hôm nay</p>
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus size={16} /> Tạo thực đơn hôm nay
          </Button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                <th className="px-4 py-3 text-left">Mã món</th>
                <th className="px-4 py-3 text-left">Tên món</th>
                <th className="px-4 py-3 text-left">Danh mục</th>
                <th className="px-4 py-3 text-right">Giá bán</th>
                <th className="px-4 py-3 text-center">Tình trạng</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {dongThucDon.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Chưa có món nào</td></tr>
              ) : dongThucDon.map((dong) => (
                <tr key={dong.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-orange-300">{dong.monAn?.maMon}</td>
                  <td className="px-4 py-3 font-medium">{dong.monAn?.tenMon}</td>
                  <td className="px-4 py-3 text-gray-400">{dong.monAn?.danhMuc}</td>
                  <td className="px-4 py-3 text-right">
                    <PriceCell dong={dong} onSave={(val) => updateItemMut.mutate({ itemId: dong.id, data: { giaBanTrongNgay: val } })} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggleAvailability(dong)}
                      className={`flex items-center gap-1.5 mx-auto text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        dong.trangThai === 'CO_SAN'
                          ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                          : 'bg-red-500/20 text-red-400 hover:bg-green-500/20 hover:text-green-400'
                      }`}>
                      {dong.trangThai === 'CO_SAN'
                        ? <><ToggleRight size={14} /> Còn món</>
                        : <><ToggleLeft size={14} /> Hết món</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => deleteItemMut.mutate(dong.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add food modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Thêm món vào thực đơn" size="lg">
        <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
          {availableToAdd.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Tất cả món đã có trong thực đơn</p>
          ) : availableToAdd.map((food) => (
            <div key={food.id}
              onClick={() => toggleFoodSelect(food.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                selectedFoods.includes(food.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <input type="checkbox" readOnly checked={selectedFoods.includes(food.id)}
                className="w-4 h-4 accent-orange-500" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{food.tenMon}</p>
                <p className="text-xs text-gray-400">{food.danhMuc} · Giá gốc: {formatVND(food.giaGoc)}</p>
              </div>
              {selectedFoods.includes(food.id) && (
                <div onClick={(e) => e.stopPropagation()} className="relative z-10 flex w-32 flex-col items-end gap-1">
                  <input type="number" min={0}
                    className="input w-full text-sm"
                    placeholder="Nhập giá bán"
                    value={prices[food.id] ?? ''}
                    onChange={(e) => {
                      setPrices({ ...prices, [food.id]: e.target.value })
                      setPriceWarnings((prev) => prev.filter((warning) => warning.foodId !== food.id))
                      setIsWarningVisible(false)
                    }} />
                  {priceWarnings.some((warning) => warning.foodId === food.id) && (
                    <div className={`absolute top-full right-0 z-20 mt-2 w-56 rounded-xl border bg-white/95 px-2.5 py-2 text-[13px] leading-5 text-red-600 shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-300 ${isWarningVisible ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0 pointer-events-none'}`}>
                      <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t bg-white"></div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-sm">⚠️</span>
                        <span>{priceWarnings.find((warning) => warning.foodId === food.id)?.message}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Hủy</Button>
          <Button variant="primary" loading={createMut.isPending} onClick={handleAddToMenu}
            className="gap-2">
            <Save size={16} /> Lưu ({selectedFoods.length} món)
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function PriceCell({ dong, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(dong.giaBanTrongNgay)
  const minPrice = Number(dong.monAn?.giaGoc ?? 0)

  const saveValue = () => {
    const parsed = Number(val)
    const nextValue = Number.isFinite(parsed) ? parsed : minPrice

    if (parsed < minPrice) {
      setVal(dong.giaBanTrongNgay)
      setEditing(false)
      return
    }

    setEditing(false)
    if (nextValue !== dong.giaBanTrongNgay) onSave(nextValue)
    setVal(nextValue)
  }

  if (editing) return (
    <input type="number" min={0} className="w-28 bg-gray-700 border border-orange-500 rounded px-2 py-1 text-sm text-right"
      value={val} onChange={(e) => setVal(e.target.value)} autoFocus
      onBlur={saveValue}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
  )
  return (
    <button onClick={() => setEditing(true)} className="text-orange-300 font-semibold hover:text-orange-200 hover:underline">
      {formatVND(dong.giaBanTrongNgay)}
    </button>
  )
}
