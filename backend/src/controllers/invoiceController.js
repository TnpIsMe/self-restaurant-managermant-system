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

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatMoney(value = 0) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)
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

export const getReceiptPreview = async (req, res, next) => {
  try {
    const invoice = await prisma.hoaDonThanhToan.findUnique({
      where: { id: req.params.id },
      include: {
        hoaDonTamTinh: { include: { ban: true } },
        thuNgan: { select: { hoTen: true } },
        dongHoaDon: true,
      },
    })

    if (!invoice) throw new AppError('Không tìm thấy hóa đơn', 404)

    const printCount = (invoice.soLanIn ?? 0) + 1
    await prisma.hoaDonThanhToan.update({
      where: { id: invoice.id },
      data: { soLanIn: printCount, thoiGianInGanNhat: new Date() },
    })

    const paymentLabel = invoice.hinhThucThanhToan === 'TIEN_MAT' ? 'Tiền mặt' : 'Chuyển khoản'
    const itemsHtml = invoice.dongHoaDon.map((d) => `
      <tr>
        <td>${escapeHtml(d.tenMon)}</td>
        <td class="text-right">${d.soPhan}</td>
        <td class="text-right">${formatMoney(d.donGia)}</td>
        <td class="text-right">${formatMoney(d.thanhTien)}</td>
      </tr>
    `).join('')

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Hóa đơn ${escapeHtml(invoice.maHoaDon)}</title>
    <style>
      body { margin: 0; padding: 0; background: #fff; }
      .receipt { width: 80mm; margin: 0 auto; padding: 8px; font-family: 'Arial', sans-serif; font-size: 11px; line-height: 1.3; color: #000; }
      .center { text-align: center; }
      .bold { font-weight: 700; }
      .small { font-size: 9px; }
      table { width: 100%; border-collapse: collapse; margin: 6px 0; }
      td { vertical-align: top; padding: 2px 0; }
      .text-right { text-align: right; }
      .divider { border-top: 1px dashed #000; margin: 6px 0; }
      .summary { display: flex; justify-content: space-between; padding: 2px 0; }
      @media print { body { margin: 0; } .receipt { width: 80mm; } }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="center bold">${escapeHtml(invoice.tenNhaHang)}</div>
      <div class="center small">${escapeHtml(invoice.diaChi || '')}</div>
      <div class="divider"></div>
      <div class="summary"><span>Mã HD:</span><span>${escapeHtml(invoice.maHoaDon)}</span></div>
      <div class="summary"><span>Ngày:</span><span>${new Date(invoice.thoiGianThanhToan).toLocaleString('vi-VN')}</span></div>
      <div class="summary"><span>Bàn:</span><span>${escapeHtml(invoice.hoaDonTamTinh?.ban?.maBan || '')}</span></div>
      <div class="summary"><span>Thu ngân:</span><span>${escapeHtml(invoice.thuNgan?.hoTen || '')}</span></div>
      <div class="divider"></div>
      <table>
        <thead>
          <tr>
            <th align="left">Tên món</th>
            <th class="text-right">SL</th>
            <th class="text-right">Đ.Giá</th>
            <th class="text-right">T.Tiền</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div class="divider"></div>
      <div class="summary"><span>Tổng tiền:</span><span>${formatMoney(invoice.tongTienHoaDon)}</span></div>
      <div class="summary"><span>HTTT:</span><span>${escapeHtml(paymentLabel)}</span></div>
      <div class="summary"><span>Khách đưa:</span><span>${formatMoney(invoice.tienKhachDua)}</span></div>
      <div class="summary"><span>Tiền thừa:</span><span>${formatMoney(invoice.tienTraLai)}</span></div>
      ${invoice.maTheThanhVien ? `<div class="summary"><span>Mã thẻ:</span><span>${escapeHtml(invoice.maTheThanhVien)}</span></div>` : ''}
      ${invoice.diemCongThem ? `<div class="summary"><span>Điểm cộng:</span><span>+${invoice.diemCongThem}</span></div>` : ''}
      <div class="divider"></div>
      <div class="center small">Cảm ơn quý khách!</div>
    </div>
    <script>
      window.onload = function () { window.print() }
    </script>
  </body>
</html>`

    res.type('html')
    res.send(html)
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
