import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, CheckCircle, Play, RefreshCw, ChefHat, Utensils } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { useSocket } from '@/hooks/useSocket'
import { EVENTS } from '@/socket/socketClient'
import { formatTime } from '@/utils/format'
import toast from 'react-hot-toast'

const STATUS = {
  CHO_CHE_BIEN: { label: 'Chờ',     dot: 'bg-yellow-400', card: 'border-l-yellow-400' },
  DANG_LAM:     { label: 'Đang làm', dot: 'bg-orange-400', card: 'border-l-orange-400' },
  HOAN_TAT:     { label: 'Xong',     dot: 'bg-green-400',  card: 'border-l-green-400'  },
}

function groupByOrder(items) {
  const map = {}
  for (const item of items) {
    const oid = item.phieuOrderId
    if (!map[oid]) {
      map[oid] = {
        orderId:   oid,
        banMa:     item.phieuOrder?.hoaDonTamTinh?.ban?.maBan ?? '?',
        banTen:    item.phieuOrder?.hoaDonTamTinh?.ban?.tenBan ?? '',
        thoiDiem:  item.phieuOrder?.thoiDiemDat,
        orderNote: item.phieuOrder?.ghiChu ?? '',
        items:     [],
      }
    }
    map[oid].items.push(item)
  }
  return Object.values(map).sort((a, b) => new Date(a.thoiDiem) - new Date(b.thoiDiem))
}

function isOrderComplete(order) {
  return order.items?.length > 0 && order.items.every((item) => item.trangThaiCheBien === 'HOAN_TAT')
}

function calculateDishSummary(groups) {
  const first5Orders = groups.slice(0, 5)
  const allItems = first5Orders.flatMap((o) => o.items)

  const dishMap = {}
  for (const item of allItems) {
    const name = item.monAn?.tenMon ?? 'Không xác định'
    if (!dishMap[name]) dishMap[name] = 0
    dishMap[name] += item.soPhan
  }

  return Object.entries(dishMap)
    .map(([tenMon, totalSoPhan]) => ({ tenMon, totalSoPhan }))
    .sort((a, b) => b.totalSoPhan - a.totalSoPhan)
}

function getOrderNoteText(group) {
  return group?.orderNote?.toString().trim() ? [group.orderNote.toString().trim()] : []
}

export default function KDSPage() {
  const qc = useQueryClient()
  const [confirmedOrders, setConfirmedOrders] = useState(() => {
    const saved = localStorage.getItem('confirmedOrders')
    return saved ? JSON.parse(saved) : []
  })

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['kds'],
    queryFn:  () => orderService.getKds().then((r) => r.data),
    refetchInterval: 30000,
  })

  // Nhận order mới qua socket
  useSocket(EVENTS.ORDER_NEW, (payload) => {
    qc.invalidateQueries(['kds'])
    toast(`🔔 Bàn ${payload.banMa} gọi thêm món!`, {
      style: { background: '#1f2937', color: '#fff', fontWeight: 600 },
      duration: 5000,
    })
  })

  const startMut = useMutation({
    mutationFn: ({ orderId, itemId }) => orderService.startCookingItem(orderId, itemId),
    onSuccess:  () => qc.invalidateQueries(['kds']),
    onError:    () => toast.error('Lỗi cập nhật trạng thái'),
  })

  const doneMut = useMutation({
    mutationFn: ({ orderId, itemId }) => orderService.completeItem(orderId, itemId),
    onSuccess:  () => { qc.invalidateQueries(['kds']); toast.success('✅ Món đã hoàn tất!') },
    onError:    () => toast.error('Lỗi cập nhật trạng thái'),
  })

  const revertMut = useMutation({
    mutationFn: ({ orderId, itemId }) => orderService.revertItem(orderId, itemId),
    onSuccess:  () => { qc.invalidateQueries(['kds']); toast('↩️ Hoàn tác thành công') },
    onError:    () => toast.error('Lỗi hoàn tác'),
  })

  const confirmOrderMut = useMutation({
    mutationFn: (orderId) => orderService.confirm(orderId),
    onSuccess:  () => { qc.invalidateQueries(['kds']); toast.success('✅ Hóa đơn đã xác nhận!') },
    onError:    () => toast.error('Lỗi xác nhận hóa đơn'),
  })

  useEffect(() => {
    localStorage.setItem('confirmedOrders', JSON.stringify(confirmedOrders))
  }, [confirmedOrders])

  const pending = data.filter((d) => ['CHO_CHE_BIEN', 'DANG_LAM', 'HOAN_TAT'].includes(d.trangThaiCheBien))
  const groups = groupByOrder(pending).filter((g) => !confirmedOrders.includes(g.orderId))
  const allOrders = groupByOrder(data)
  const completedOrders = allOrders.filter((o) => confirmedOrders.includes(o.orderId))
  const dishSummary = calculateDishSummary(groups)

  return (
    <div className="min-h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <Utensils size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Kitchen Display System</h1>
            <p className="text-gray-400 text-sm">
              {pending.length} món đang chờ / làm
              {completedOrders.length > 0 && ` · ${completedOrders.length} order hoàn tất`}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : groups.length === 0 && completedOrders.length === 0 ? (
          <div className="text-center py-24">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <p className="text-2xl font-bold text-gray-300">Tất cả đã hoàn tất!</p>
            <p className="text-gray-500 mt-2">Không có order nào đang chờ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Column 1: Pending Orders */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-4">
                <ChefHat size={14} className="text-orange-500" />
                Danh sách Order ({groups.length} order)
              </div>
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {groups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Không có order mới</div>
                ) : (
                  groups.map((group) => (
                    <OrderCard
                      key={group.orderId}
                      group={group}
                      onStart={(itemId) => startMut.mutate({ orderId: group.orderId, itemId })}
                      onDone={(itemId) => doneMut.mutate({ orderId: group.orderId, itemId })}
                      onRevert={(itemId) => revertMut.mutate({ orderId: group.orderId, itemId })}
                      onOrderComplete={(orderId) => {
                        confirmOrderMut.mutate(orderId)
                        setConfirmedOrders((prev) => [...prev, orderId])
                      }}
                      startLoading={startMut.isPending}
                      doneLoading={doneMut.isPending}
                      revertLoading={revertMut.isPending}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 2: Dish Summary */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-4">
                <Utensils size={14} className="text-blue-500" />
                Danh sách món ăn Order
              </div>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {dishSummary.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Không có món nào</div>
                ) : (
                  dishSummary.map((dish) => {
                    const first5Orders = groups.slice(0, 5)
                    const dishItems = first5Orders.flatMap((o) => o.items).filter((i) => i.monAn?.tenMon === dish.tenMon && ['CHO_CHE_BIEN', 'DANG_LAM', 'HOAN_TAT'].includes(i.trangThaiCheBien))
                    const choItems = dishItems.filter((i) => i.trangThaiCheBien === 'CHO_CHE_BIEN')
                    const dangItems = dishItems.filter((i) => i.trangThaiCheBien === 'DANG_LAM')
                    const xongItems = dishItems.filter((i) => i.trangThaiCheBien === 'HOAN_TAT')

                    return (
                      <div key={dish.tenMon} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-white truncate">{dish.tenMon}</p>
                          <span className="text-lg font-bold text-blue-400">×{dish.totalSoPhan}</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-2 space-y-1">
                          {choItems.length > 0 && <div className="text-yellow-400">⏳ {choItems.length} chờ</div>}
                          {dangItems.length > 0 && <div className="text-orange-400">🔥 {dangItems.length} đang làm</div>}
                          {xongItems.length > 0 && <div className="text-green-400">✓ {xongItems.length} xong</div>}
                        </div>
                        {choItems.length > 0 && (
                          <button
                            onClick={() => {
                              toast.loading(`Đang bắt đầu nấu ${choItems.length} phần...`)
                              choItems.forEach((item) => {
                                startMut.mutate({ orderId: item.phieuOrderId, itemId: item.id })
                              })
                            }}
                            disabled={startMut.isPending}
                            className="w-full px-2 py-2 bg-orange-500 hover:bg-orange-400 rounded text-xs font-medium text-white transition-colors disabled:opacity-50"
                          >
                            <Play size={12} className="inline mr-1" />
                            Làm món
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Column 3: Completed Orders */}
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-4">
                <CheckCircle size={14} className="text-green-500" />
                Đã hoàn tất ({completedOrders.length})
              </div>
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {completedOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Chưa có order xong</div>
                ) : (
                  completedOrders.map((order) => {
                    const lastCompletedTime = Math.max(
                      ...order.items.map((i) => new Date(i.thoiDiemHoanTat || 0).getTime())
                    )
                    const noteTexts = getOrderNoteText(order)
                    return (
                      <div key={order.orderId} className="bg-gray-800 border border-green-600/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-green-400">{order.banMa}</span>
                          <span className="text-xs text-gray-500">{order.banTen}</span>
                        </div>
                        {noteTexts.length > 0 && (
                          <div className="mb-2 rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-2">
                            <div className="flex items-start gap-1 text-xs text-yellow-200">
                              <span>📝</span>
                              <span className="break-words">{noteTexts[0]}</span>
                            </div>
                          </div>
                        )}
                        <div className="space-y-1 mb-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                              <span className="text-gray-300 truncate">{item.monAn?.tenMon}</span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-gray-500">×{item.soPhan}</span>
                                {item.ghiChu && (
                                  <span className="text-yellow-200 whitespace-nowrap">📝 {item.ghiChu}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-green-500 pt-2 border-t border-gray-700">
                          {lastCompletedTime > 0 && formatTime(new Date(lastCompletedTime))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderCard({ group, onStart, onDone, onRevert, startLoading, doneLoading, revertLoading, onOrderComplete }) {
  // Màu border trái theo trạng thái nặng nhất
  const hasCho    = group.items.some((i) => i.trangThaiCheBien === 'CHO_CHE_BIEN')
  const hasDang   = group.items.some((i) => i.trangThaiCheBien === 'DANG_LAM')
  const borderCls = hasDang ? 'border-l-orange-400' : hasCho ? 'border-l-yellow-400' : 'border-l-green-400'

  // Thời gian chờ (phút)
  const waitMins = group.thoiDiem
    ? Math.floor((Date.now() - new Date(group.thoiDiem)) / 60000)
    : 0
  const isUrgent = waitMins >= 15

  // Order status summary
  const choCnt = group.items.filter((i) => i.trangThaiCheBien === 'CHO_CHE_BIEN').length
  const dangCnt = group.items.filter((i) => i.trangThaiCheBien === 'DANG_LAM').length
  const xongCnt = group.items.filter((i) => i.trangThaiCheBien === 'HOAN_TAT').length
  const isAllDone = xongCnt === group.items.length && group.items.length > 0
  const noteTexts = getOrderNoteText(group)

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 border-l-4 ${borderCls} overflow-hidden`}>
      {/* Card header */}
      <div className="px-4 py-3 bg-gray-750 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ChefHat size={16} className="text-orange-400" />
            <span className="font-bold text-white">{group.banMa}</span>
            {group.banTen !== group.banMa && (
              <span className="text-gray-400 text-xs">{group.banTen}</span>
            )}
          </div>
          {isAllDone && (
            <button
              onClick={() => onOrderComplete?.(group.orderId)}
              className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-medium text-white transition-colors"
            >
              ✓ Hoàn tất order
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <Clock size={12} />
            {group.thoiDiem ? formatTime(group.thoiDiem) : '--'}
            {waitMins > 0 && <span className={isUrgent ? 'text-red-400' : ''}>{waitMins}p</span>}
          </div>
          <div className="flex items-center gap-1">
            {choCnt > 0 && <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs">{choCnt} chờ</span>}
            {dangCnt > 0 && <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-300 rounded text-xs">{dangCnt} làm</span>}
            {xongCnt > 0 && <span className="px-1.5 py-0.5 bg-green-500/20 text-green-300 rounded text-xs">{xongCnt} xong</span>}
          </div>
        </div>
        {noteTexts.length > 0 && (
          <div className="mt-2 rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-2">
            <div className="flex items-start gap-1 text-xs text-yellow-200">
              <span>📝</span>
              <span className="break-words">{noteTexts[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-3 space-y-2">
        {group.items.map((item) => {
          const cfg = STATUS[item.trangThaiCheBien] ?? STATUS.CHO_CHE_BIEN
          const isCho  = item.trangThaiCheBien === 'CHO_CHE_BIEN'
          const isDang = item.trangThaiCheBien === 'DANG_LAM'

          return (
            <div key={item.id} className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-white truncate">{item.monAn?.tenMon}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-orange-300 font-bold text-sm">×{item.soPhan}</span>
                    {item.ghiChu && (
                      <span className="text-yellow-200 text-xs whitespace-nowrap">📝 {item.ghiChu}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-500 text-xs">{cfg.label}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1.5 flex-shrink-0">
                {isCho && (
                  <button
                    onClick={() => onStart(item.id)}
                    disabled={startLoading}
                    title="Bắt đầu làm"
                    className="w-8 h-8 bg-orange-500 hover:bg-orange-400 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Play size={13} />
                  </button>
                )}
                {isDang && (
                  <button
                    onClick={() => onDone(item.id)}
                    disabled={doneLoading}
                    title="Hoàn tất"
                    className="w-8 h-8 bg-green-500 hover:bg-green-400 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={13} />
                  </button>
                )}
                {item.trangThaiCheBien === 'HOAN_TAT' && (
                  <>
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle size={13} className="text-green-400" />
                    </div>
                    <button
                      onClick={() => onRevert(item.id)}
                      disabled={revertLoading}
                      title="Hoàn tác"
                      className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 text-gray-400 text-xs"
                    >
                      ↩️
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
