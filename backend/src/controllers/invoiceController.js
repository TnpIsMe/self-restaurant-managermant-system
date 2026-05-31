import prisma from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'
import { getIO } from '../config/socket.js'

// Tìm bàn theo maBan hoặc id
async function findBan(tableParam) {
  let ban = await prisma.ban.findUnique({ where: { maBan: tableParam } })
  if (!ban) ban = await prisma.ban.findUnique({ where: { id: tableParam } })
  return ban
}

const invoiceInclude = {
  ban: true,
  theThanhVien: true,
  phieuOrders: {
    include: {
      dongOrders: {
        include: { monAn: { select: { tenMon: true, maMon: true } } },
        where: { trangThaiCheBien: { not: 'DA_HUY' } },
      },
    },
    orderBy: { thoiDiemDat: 'asc' },
  },
}

export const getByTable = async (req, res, next) => {
  try {
    const ban = await findBan(req.params.tableId)
    if (!ban) return res.json(null)

    const invoice = await prisma.hoaDonTamTinh.findFirst({
      where:   { banId: ban.id, hoaDonThanhToan: null },
      include: invoiceInclude,
      orderBy: { thoiDiemMo: 'desc' },
    })
    res.json(invoice)
  } catch (e) { next(e) }
}

export const getDetail = async (req, res, next) => {
  try {
    const invoice = await prisma.hoaDonTamTinh.findUnique({
      where:   { id: req.params.id },
      include: invoiceInclude,
    })
    if (!invoice) throw new AppError('Không tìm thấy hóa đơn', 404)
    res.json(invoice)
  } catch (e) { next(e) }
}

export const lockInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.hoaDonTamTinh.findUnique({ where: { id: req.params.id } })
    if (!invoice) throw new AppError('Không tìm thấy hóa đơn', 404)
    const updated = await prisma.hoaDonTamTinh.update({
      where: { id: req.params.id },
      data:  { daKhoa: true },
    })
    getIO()?.to(`table:${invoice.banId}`).emit('invoice:locked', { invoiceId: invoice.id })
    res.json(updated)
  } catch (e) { next(e) }
}

export const unlockInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.hoaDonTamTinh.findUnique({ where: { id: req.params.id } })
    if (!invoice) throw new AppError('Không tìm thấy hóa đơn', 404)
    const updated = await prisma.hoaDonTamTinh.update({
      where: { id: req.params.id },
      data:  { daKhoa: false },
    })
    getIO()?.to(`table:${invoice.banId}`).emit('invoice:unlocked', { invoiceId: invoice.id })
    res.json(updated)
  } catch (e) { next(e) }
}

export const getHistory = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const skip  = (page - 1) * limit

    const [items, total] = await prisma.$transaction([
      prisma.hoaDonThanhToan.findMany({
        skip, take: limit,
        include: {
          hoaDonTamTinh: { include: { ban: true } },
          thuNgan:       { select: { hoTen: true } },
          dongHoaDon:    true,
        },
        orderBy: { thoiGianThanhToan: 'desc' },
      }),
      prisma.hoaDonThanhToan.count(),
    ])
    res.json({ items, total, page, totalPages: Math.ceil(total / limit) })
  } catch (e) { next(e) }
}
