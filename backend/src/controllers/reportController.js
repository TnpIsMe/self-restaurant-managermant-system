import prisma from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'
import { exportReportToPDF } from '../utils/pdfExporter.js'
import { exportReportToExcel } from '../utils/excelExporter.js'
import fs from 'fs'
import path from 'path'
import os from 'os'

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
function getLocalDateString(d = new Date()) {
  const year  = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day   = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
function startOfDay(d) {
  const r = new Date(d); r.setUTCHours(0,0,0,0); return r
}
function endOfDay(d) {
  const r = new Date(d); r.setUTCHours(23,59,59,999); return r
}
function yyyymmdd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

const reportInclude = {
  nguoiLap:   { select: { hoTen: true, maNV: true } },
  dongBaoCao: { orderBy: { doanhThuMon: 'desc' } },
}

export const createDailyReport = async (req, res, next) => {
  try {
    const todayStr = getLocalDateString()
    const today    = parseDate(todayStr)
    const todayEnd = endOfDay(today)
    const maBaoCao = `RPT-${todayStr}`

    const report = await prisma.$transaction(async (tx) => {
      const hoaDons = await tx.hoaDonThanhToan.findMany({
        where: { thoiGianThanhToan: { gte: today, lte: todayEnd } },
        include: { dongHoaDon: true },
      })
      if (!hoaDons.length) throw new AppError('Không có hóa đơn nào trong ngày hôm nay', 400)

      const tongDoanhThu = hoaDons.reduce((s, h) => s + h.tongTienHoaDon, 0)
      const monMap = {}
      hoaDons.forEach((hd) => {
        hd.dongHoaDon.forEach((d) => {
          if (!monMap[d.tenMon]) {
            monMap[d.tenMon] = { tenMon: d.tenMon, soLuong: 0, doanhThu: 0, hoaDonId: hd.id }
          }
          monMap[d.tenMon].soLuong  += d.soPhan
          monMap[d.tenMon].doanhThu += d.thanhTien
        })
      })

      await tx.baoCaoDoanhThu.deleteMany({
        where: { ngayBaoCao: { gte: today, lte: todayEnd } },
      })

      return await tx.baoCaoDoanhThu.create({
        data: {
          maBaoCao,
          ngayBaoCao:   today,
          nguoiLapId:   req.user.id,
          tongSoHoaDon: hoaDons.length,
          tongDoanhThu,
          dongBaoCao: {
            create: Object.values(monMap).map((m) => ({
              hoaDonThanhToanId: m.hoaDonId,
              maMon:             m.tenMon,
              tenMon:            m.tenMon,
              soLuongDaBan:      m.soLuong,
              doanhThuMon:       m.doanhThu,
            })),
          },
        },
        include: reportInclude,
      })
    })

    res.status(201).json(report)
  } catch (e) { next(e) }
}

export const getReports = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const skip  = (page - 1) * limit
    const [items, total] = await prisma.$transaction([
      prisma.baoCaoDoanhThu.findMany({
        skip, take: limit, include: reportInclude, orderBy: { ngayBaoCao: 'desc' },
      }),
      prisma.baoCaoDoanhThu.count(),
    ])
    res.json({ items, total })
  } catch (e) { next(e) }
}

export const getReportDetail = async (req, res, next) => {
  try {
    const report = await prisma.baoCaoDoanhThu.findUnique({
      where: { id: req.params.id }, include: reportInclude,
    })
    if (!report) throw new AppError('Không tìm thấy báo cáo', 404)
    res.json(report)
  } catch (e) { next(e) }
}

export const exportPdf = async (req, res, next) => {
  try {
    const report = await prisma.baoCaoDoanhThu.findUnique({
      where: { id: req.params.id }, include: reportInclude,
    })
    if (!report) throw new AppError('Không tìm thấy báo cáo', 404)
    const filePath = path.join(os.tmpdir(), `${report.maBaoCao}.pdf`)
    await exportReportToPDF(report, filePath)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${report.maBaoCao}.pdf"`)
    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
    stream.on('end', () => fs.unlink(filePath, () => {}))
  } catch (e) { next(e) }
}

export const exportExcel = async (req, res, next) => {
  try {
    const report = await prisma.baoCaoDoanhThu.findUnique({
      where: { id: req.params.id }, include: reportInclude,
    })
    if (!report) throw new AppError('Không tìm thấy báo cáo', 404)
    const filePath = path.join(os.tmpdir(), `${report.maBaoCao}.xlsx`)
    await exportReportToExcel(report, filePath)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${report.maBaoCao}.xlsx"`)
    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
    stream.on('end', () => fs.unlink(filePath, () => {}))
  } catch (e) { next(e) }
}
