import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, BookOpen, Code2, Utensils, DollarSign, FileText, Layers, Image, Power, Upload } from 'lucide-react'
import { foodService } from '@/services/foodService'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import SearchInput from '@/components/common/SearchInput'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { formatVND } from '@/utils/format'
import toast from 'react-hot-toast'

const CATEGORIES = ['Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống']

const EMPTY_FORM = { maMon: '', tenMon: '', danhMuc: 'Món chính', giaGoc: '', moTa: '', donViTinh: 'phần', hinhAnh: '', isActive: true }

export default function FoodCatalogPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | { food }
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data = [], isLoading } = useQuery({
    queryKey: ['foods'],
    queryFn: () => foodService.getAll().then((r) => r.data),
  })

  const foods = data.filter((f) =>
    f.tenMon.toLowerCase().includes(search.toLowerCase()) ||
    f.maMon.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }
  const openEdit = (food) => {
    setForm({ maMon: food.maMon, tenMon: food.tenMon, danhMuc: food.danhMuc, giaGoc: food.giaGoc, moTa: food.moTa ?? '', donViTinh: food.donViTinh, hinhAnh: food.hinhAnh ?? '', isActive: food.isActive })
    setModal({ food })
  }

  const saveMut = useMutation({
    mutationFn: () => {
      const data = {
        ...form,
        giaGoc: Number(form.giaGoc),
        isActive: Boolean(form.isActive),
      }
      console.log('📤 Saving:', data)
      return modal === 'create'
        ? foodService.create(data)
        : foodService.update(modal.food.id, data)
    },
    onSuccess: () => {
      qc.invalidateQueries(['foods'])
      setModal(null)
      toast.success(modal === 'create' ? 'Đã thêm món ăn!' : 'Đã cập nhật!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi lưu dữ liệu'),
  })

  const deleteMut = useMutation({
    mutationFn: () => foodService.remove(deleteTarget.id),
    onSuccess: () => {
      qc.invalidateQueries(['foods'])
      setDeleteTarget(null)
      toast.success('Đã xoá món ăn')
    },
  })

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const uploadMut = useMutation({
    mutationFn: (file) => {
      const formData = new FormData()
      formData.append('file', file)
      console.log('📤 Uploading:', file.name)
      return fetch('/api/upload', { method: 'POST', body: formData })
        .then((r) => {
          console.log('📊 Response status:', r.status)
          return r.json()
        })
        .then((data) => {
          console.log('✅ Upload response:', data)
          return data
        })
    },
    onSuccess: (data) => {
      console.log('🎉 Setting URL:', data.url)
      setForm({ ...form, hinhAnh: data.url })
      toast.success('✅ Upload ảnh thành công!')
    },
    onError: (err) => {
      console.error('❌ Upload error:', err)
      toast.error('Lỗi upload ảnh')
    },
  })

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) uploadMut.mutate(file)
  }

  return (
    <div className="min-h-full bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen size={24} className="text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold">Danh mục món ăn</h1>
            <p className="text-gray-400 text-sm">{data.length} món trong thực đơn</p>
          </div>
        </div>
        <Button onClick={openCreate} variant="primary" className="gap-2">
          <Plus size={16} /> Thêm món mới
        </Button>
      </div>

      {/* Search */}
      <SearchInput
        value={search} onChange={setSearch}
        placeholder="Tìm theo tên, mã món..."
        className="mb-4 max-w-sm [&_input]:bg-gray-800 [&_input]:border-gray-700 [&_input]:text-white [&_input]:placeholder-gray-500"
      />

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
              <th className="px-4 py-3 text-left">Mã món</th>
              <th className="px-4 py-3 text-left">Tên món</th>
              <th className="px-4 py-3 text-left">Danh mục</th>
              <th className="px-4 py-3 text-left">Đơn vị</th>
              <th className="px-4 py-3 text-right">Giá gốc</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">Đang tải...</td></tr>
            ) : foods.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">Chưa có món ăn nào</td></tr>
            ) : foods.map((food) => (
              <tr key={food.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3 font-mono text-orange-300">{food.maMon}</td>
                <td className="px-4 py-3 font-medium">{food.tenMon}</td>
                <td className="px-4 py-3 text-gray-400">{food.danhMuc}</td>
                <td className="px-4 py-3 text-gray-400">{food.donViTinh}</td>
                <td className="px-4 py-3 text-right text-orange-300 font-semibold">{formatVND(food.giaGoc)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`badge ${food.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {food.isActive ? 'Hoạt động' : 'Ẩn'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(food)}
                      className="p-1.5 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(food)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Thêm món ăn mới' : 'Chỉnh sửa món ăn'} size="md">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide px-3 py-1.5 bg-blue-50 rounded-lg w-fit">
                <Code2 size={14} /> Mã món
              </label>
              <input className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-gray-900 placeholder-gray-400 transition"
                placeholder="M007" value={form.maMon}
                onChange={f('maMon')} disabled={modal !== 'create'} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-purple-700 mb-2 uppercase tracking-wide px-3 py-1.5 bg-purple-50 rounded-lg w-fit">
                <Layers size={14} /> Đơn vị tính
              </label>
              <input className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-gray-900 placeholder-gray-400 transition"
                placeholder="phần" value={form.donViTinh} onChange={f('donViTinh')} />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-orange-700 mb-2 uppercase tracking-wide px-3 py-1.5 bg-orange-50 rounded-lg w-fit">
              <Utensils size={14} /> Tên món
            </label>
            <input className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 text-gray-900 placeholder-gray-400 transition"
              placeholder="Phở bò tái chín" value={form.tenMon} onChange={f('tenMon')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-green-700 mb-2 uppercase tracking-wide px-3 py-1.5 bg-green-50 rounded-lg w-fit">
                <Utensils size={14} /> Danh mục
              </label>
              <select className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 text-gray-900 bg-white transition font-medium"
                value={form.danhMuc} onChange={f('danhMuc')}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-red-700 mb-2 uppercase tracking-wide px-3 py-1.5 bg-red-50 rounded-lg w-fit">
                <DollarSign size={14} /> Giá gốc
              </label>
              <input className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 text-gray-900 placeholder-gray-400 transition font-semibold"
                type="number" min={0} placeholder="65000"
                value={form.giaGoc} onChange={f('giaGoc')} />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-cyan-700 mb-2 uppercase tracking-wide px-3 py-1.5 bg-cyan-50 rounded-lg w-fit">
              <FileText size={14} /> Mô tả
            </label>
            <textarea className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 text-gray-900 placeholder-gray-400 transition"
              rows={2} placeholder="Phở bò nước dùng, nước sốt chua cay, kèm nộm..."
              value={form.moTa} onChange={f('moTa')} />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wide px-3 py-1.5 bg-indigo-50 rounded-lg w-fit">
              <Upload size={14} /> Tải hình ảnh
            </label>
            <div className="flex gap-2">
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadMut.isPending}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              {uploadMut.isPending && <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />}
            </div>
            {form.hinhAnh && (
              <div className="mt-2 rounded-lg overflow-hidden border-2 border-gray-200">
                <img src={form.hinhAnh} alt="preview" className="w-full h-32 object-cover" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
            <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wide">
              <Power size={14} /> Trạng thái
            </label>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${form.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {form.isActive ? '✓ Hoạt động' : '✗ Ẩn'}
              </span>
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setModal(null)}>Hủy</Button>
            <Button variant="primary" loading={saveMut.isPending} onClick={() => saveMut.mutate()} className="gap-2">
              <Plus size={16} />
              {modal === 'create' ? 'Thêm món' : 'Lưu'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMut.mutate()} loading={deleteMut.isPending} danger
        title="Xoá món ăn"
        message={`Bạn có chắc muốn xoá "${deleteTarget?.tenMon}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá" />
    </div>
  )
}
