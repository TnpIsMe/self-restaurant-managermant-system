import prisma from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'
import { getIO } from '../config/socket.js'

// Tìm bàn theo maBan hoặc id
async function findBan(tableParam) {
  // Thử tìm theo maBan trước (dùng từ URL tablet)
  let ban = await prisma.ban.findUnique({ where: { maBan: tableParam } })
  // Nếu không có, thử tìm theo id (dùng từ cashier)
  if (!ban) ban = await prisma.ban.findUnique({ where: { id: tableParam } })
  return ban
}

export const createOrder = async (req, res, next) => {
  try {
    const { tableId, items, ghiChu } = req.body
    if (!tableId || !items?.length)
      return res.status(400).json({ message: 'Thiếu tableId hoặc danh sách món' })

    const ban = await findBan(tableId)
    if (!ban) return res.status(404).json({ message: `Không tìm thấy bàn: ${tableId}` })

    // Lấy hoặc tạo HoaDonTamTinh còn mở
    let hdTamTinh = await prisma.hoaDonTamTinh.findFirst({
      where: { banId: ban.id, daKhoa: false, hoaDonThanhToan: null },
    })
    if (!hdTamTinh) {
      const count = await prisma.hoaDonTamTinh.count()
      hdTamTinh = await prisma.hoaDonTamTinh.create({
        data: {
          maHoaDonTamTinh: `TMP-${ban.maBan}-${String(count + 1).padStart(4, '0')}`,
          banId: ban.id,
        },
      })
      await prisma.ban.update({ where: { id: ban.id }, data: { trangThai: 'DANG_PHUC_VU' } })
    }

    // Lấy giá từ thực đơn ngày hôm nay
    const now   = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

    const menu = await prisma.thucDonNgay.findFirst({
      where: { ngay: { gte: today, lt: tomorrow } },
      include: { dongThucDon: { include: { monAn: true } } },
    })

    const dongOrders = items.map((item) => {
      const menuItem = menu?.dongThucDon.find((d) => d.monAn.maMon === item.maMon)
      const donGia   = menuItem?.giaBanTrongNgay ?? Number(item.donGia) ?? 0
      return {
        monAnId:   menuItem?.monAnId,
        soPhan:    item.soPhan,
        donGia,
        thanhTien: donGia * item.soPhan,
        ghiChu:    item.ghiChu ?? null,
      }
    }).filter((d) => d.monAnId) // bỏ qua nếu không tìm được món

    if (!dongOrders.length)
      return res.status(400).json({ message: 'Không tìm thấy món nào trong thực đơn hôm nay' })

    const order = await prisma.phieuOrder.create({
      data: {
        hoaDonTamTinhId: hdTamTinh.id,
        ghiChu: ghiChu ?? null,
        dongOrders: { create: dongOrders },
      },
      include: {
        dongOrders: {
          include: { monAn: { select: { tenMon: true, maMon: true } } },
        },
      },
    })

    const tongThem = dongOrders.reduce((s, d) => s + d.thanhTien, 0)
    await prisma.hoaDonTamTinh.update({
      where: { id: hdTamTinh.id },
      data:  { tongTienTam: { increment: tongThem } },
    })

    getIO()?.to('kitchen').emit('order:new', {
      tableId: ban.id, orderId: order.id, banMa: ban.maBan,
    })
    res.status(201).json(order)
  } catch (e) { next(e) }
}

export const getOrderByTable = async (req, res, next) => {
  try {
    const ban = await findBan(req.params.tableId)
    if (!ban) return res.status(404).json({ message: 'Không tìm thấy bàn' })

    const orders = await prisma.phieuOrder.findMany({
      where: {
        hoaDonTamTinh: { banId: ban.id, hoaDonThanhToan: null },
      },
      include: {
        dongOrders: {
          include: { monAn: { select: { tenMon: true, maMon: true } } },
          where: { trangThaiCheBien: { not: 'DA_HUY' } },
        },
      },
      orderBy: { thoiDiemDat: 'asc' },
    })
    res.json(orders)
  } catch (e) { next(e) }
}

export const confirmOrder = async (req, res, next) => {
  try {
    const order = await prisma.phieuOrder.update({
      where: { id: req.params.id },
      data:  { daXacNhan: true },
    })
    res.json(order)
  } catch (e) { next(e) }
}

export const startCookingItem = async (req, res, next) => {
  try {
    const dong = await prisma.dongOrder.update({
      where: { id: req.params.itemId },
      data:  { trangThaiCheBien: 'DANG_LAM' },
      include: {
        monAn: { select: { tenMon: true } },
        phieuOrder: { include: { hoaDonTamTinh: true } },
      },
    })
    const tableId = dong.phieuOrder.hoaDonTamTinh.banId
    getIO()?.to(`table:${tableId}`).emit('order:item:statusChanged', {
      itemId: dong.id, newStatus: 'DANG_LAM',
    })
    res.json(dong)
  } catch (e) { next(e) }
}

export const completeOrderItem = async (req, res, next) => {
  try {
    const dong = await prisma.dongOrder.update({
      where: { id: req.params.itemId },
      data:  { trangThaiCheBien: 'HOAN_TAT', thoiDiemHoanTat: new Date() },
      include: {
        monAn: { select: { tenMon: true } },
        phieuOrder: { include: { hoaDonTamTinh: true } },
      },
    })
    const tableId = dong.phieuOrder.hoaDonTamTinh.banId
    getIO()?.to(`table:${tableId}`).emit('order:item:completed', { itemId: dong.id })
    getIO()?.to(`table:${tableId}`).emit('invoice:updated', { tableId })
    res.json(dong)
  } catch (e) { next(e) }
}

export const revertOrderItem = async (req, res, next) => {
  try {
    const dong = await prisma.dongOrder.update({
      where: { id: req.params.itemId },
      data:  { trangThaiCheBien: 'DANG_LAM', thoiDiemHoanTat: null },
      include: {
        monAn: { select: { tenMon: true } },
        phieuOrder: { include: { hoaDonTamTinh: true } },
      },
    })
    const tableId = dong.phieuOrder.hoaDonTamTinh.banId
    getIO()?.to(`table:${tableId}`).emit('order:item:statusChanged', {
      itemId: dong.id, newStatus: 'DANG_LAM',
    })
    res.json(dong)
  } catch (e) { next(e) }
}

export const cancelOrderItem = async (req, res, next) => {
  try {
    const dong = await prisma.dongOrder.findUnique({ where: { id: req.params.itemId } })
    if (!dong) return res.status(404).json({ message: 'Không tìm thấy dòng order' })
    if (dong.trangThaiCheBien !== 'CHO_CHE_BIEN')
      return res.status(400).json({ message: 'Chỉ có thể huỷ món chưa chế biến' })

    await prisma.dongOrder.update({
      where: { id: req.params.itemId },
      data:  { trangThaiCheBien: 'DA_HUY' },
    })
    await prisma.hoaDonTamTinh.updateMany({
      where: { phieuOrders: { some: { id: req.params.orderId } } },
      data:  { tongTienTam: { decrement: dong.thanhTien } },
    })
    res.json({ message: 'Đã huỷ món' })
  } catch (e) { next(e) }
}

export const getKds = async (req, res, next) => {
  try {
    const now   = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const items = await prisma.dongOrder.findMany({
      where: {
        trangThaiCheBien: { in: ['CHO_CHE_BIEN', 'DANG_LAM', 'HOAN_TAT'] },
        createdAt: { gte: today },
      },
      include: {
        monAn: { select: { tenMon: true, maMon: true } },
        phieuOrder: {
          include: {
            hoaDonTamTinh: { include: { ban: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    res.json(items)
  } catch (e) { next(e) }
}
