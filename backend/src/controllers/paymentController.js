import prisma from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'
import { getIO } from '../config/socket.js'
import { generateInvoiceCode } from '../utils/invoiceCode.js'
import { generateVietQR } from '../utils/qrCode.js'

async function getOpenInvoice(invoiceId) {
  return prisma.hoaDonTamTinh.findUnique({
    where: { id: invoiceId },
    include: {
      ban: true,
      theThanhVien: true,
      phieuOrders: {
        include: {
          dongOrders: {
            include: { monAn: true },
            where: { trangThaiCheBien: { not: 'DA_HUY' } },
          },
        },
      },
    },
  })
}

async function buildHoaDon(invoiceId, thuNganId, hinhThuc, tienKhachDua) {
  const hd = await getOpenInvoice(invoiceId)
  if (!hd) throw new AppError('Không tìm thấy hóa đơn tạm tính', 404)
  if (hd.hoaDonThanhToan) throw new AppError('Hóa đơn đã được thanh toán', 400)

  const allItems = hd.phieuOrders.flatMap((o) => o.dongOrders)
  const tongTien = allItems.reduce((s, d) => s + d.thanhTien, 0)

  if (Number(tienKhachDua) < tongTien)
    throw new AppError(`Tiền khách đưa (${tienKhachDua}) không đủ, cần ${tongTien}`, 400)

  const maHoaDon = await generateInvoiceCode()

  const hoaDon = await prisma.hoaDonThanhToan.create({
    data: {
      maHoaDon,
      hoaDonTamTinhId:   invoiceId,
      thuNganId,
      tenNhaHang:        process.env.RESTAURANT_NAME   || 'Self Restaurant',
      diaChi:            process.env.RESTAURANT_ADDRESS || '',
      tongTienHoaDon:    tongTien,
      hinhThucThanhToan: hinhThuc,
      tienKhachDua:      Number(tienKhachDua),
      tienTraLai:        Number(tienKhachDua) - tongTien,
      maTheThanhVien:    hd.maTheThanhVien ?? null,
      dongHoaDon: {
        create: allItems.map((d) => ({
          tenMon:    d.monAn.tenMon,
          soPhan:    d.soPhan,
          donGia:    d.donGia,
          thanhTien: d.thanhTien,
        })),
      },
    },
    include: { dongHoaDon: true, thuNgan: { select: { hoTen: true } } },
  })

  // Cập nhật bàn → TRONG
  await prisma.ban.update({ where: { id: hd.banId }, data: { trangThai: 'TRONG' } })

  // Tích điểm thẻ thành viên
  if (hd.theThanhVien) {
    const diemCong = Math.floor(tongTien / 1000)
    await prisma.$transaction([
      prisma.theThanhVien.update({
        where: { maThe: hd.maTheThanhVien },
        data:  { tongDiem: { increment: diemCong } },
      }),
      prisma.lichSuTichDiem.create({
        data: {
          theThanhVienId:  hd.theThanhVien.id,
          maHoaDon:        hoaDon.maHoaDon,
          soTien:          tongTien,
          diemCong,
          tongDiemSauCong: hd.theThanhVien.tongDiem + diemCong,
        },
      }),
    ])
  }

  getIO()?.to('cashier').emit('table:statusChanged', { tableId: hd.banId, trangThai: 'TRONG' })
  getIO()?.to(`table:${hd.banId}`).emit('invoice:paid', { maHoaDon })

  return hoaDon
}

export const payCash = async (req, res, next) => {
  try {
    const hoaDon = await buildHoaDon(
      req.params.invoiceId, req.user.id, 'TIEN_MAT', req.body.tienKhachDua
    )
    res.json(hoaDon)
  } catch (e) { next(e) }
}

export const initiateTransfer = async (req, res, next) => {
  try {
    const hd = await getOpenInvoice(req.params.invoiceId)
    if (!hd) throw new AppError('Không tìm thấy hóa đơn', 404)

    const tongTien = hd.phieuOrders
      .flatMap((o) => o.dongOrders)
      .reduce((s, d) => s + d.thanhTien, 0)

    const qrUrl = await generateVietQR({ amount: tongTien, invoiceCode: hd.maHoaDonTamTinh })
    res.json({
      qrUrl,
      noiDung:    `TT ${hd.maHoaDonTamTinh}`,
      tongTien,
      maGiaoDich: `TF-${hd.maHoaDonTamTinh}-${Date.now()}`,
    })
  } catch (e) { next(e) }
}

export const confirmTransfer = async (req, res, next) => {
  try {
    const hd = await getOpenInvoice(req.params.invoiceId)
    if (!hd) throw new AppError('Không tìm thấy hóa đơn', 404)

    const tongTien = hd.phieuOrders
      .flatMap((o) => o.dongOrders)
      .reduce((s, d) => s + d.thanhTien, 0)

    const hoaDon = await buildHoaDon(req.params.invoiceId, req.user.id, 'CHUYEN_KHOAN', tongTien)
    await prisma.hoaDonThanhToan.update({
      where: { id: hoaDon.id },
      data:  { tienKhachDua: tongTien, tienTraLai: 0 },
    })
    res.json(hoaDon)
  } catch (e) { next(e) }
}

export const getQr = async (req, res, next) => {
  try {
    const hd = await getOpenInvoice(req.params.invoiceId)
    if (!hd) throw new AppError('Không tìm thấy hóa đơn', 404)
    const tongTien = hd.phieuOrders
      .flatMap((o) => o.dongOrders)
      .reduce((s, d) => s + d.thanhTien, 0)
    const qrUrl = await generateVietQR({ amount: tongTien, invoiceCode: hd.maHoaDonTamTinh })
    res.json({ qrUrl, tongTien })
  } catch (e) { next(e) }
}
