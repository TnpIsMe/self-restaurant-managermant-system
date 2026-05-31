import PDFDocument from 'pdfkit'
import fs from 'fs'

function formatVND(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0)
}
function formatDate(d) {
  const date = new Date(d)
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`
}
function formatNow() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${formatDate(d)}`
}

export async function exportReportToPDF(report, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

    const restaurantName = process.env.RESTAURANT_NAME || 'Self Restaurant'

    // ── Header ──────────────────────────────────────────────
    doc.fontSize(18).font('Helvetica-Bold').text(restaurantName, { align: 'center' })
    doc.fontSize(9).font('Helvetica').fillColor('#666')
       .text(process.env.RESTAURANT_ADDRESS || '', { align: 'center' })
    doc.fillColor('black').moveDown(0.5)
    doc.fontSize(15).font('Helvetica-Bold').text('BÁO CÁO DOANH THU', { align: 'center' })
    doc.fontSize(11).font('Helvetica')
       .text(`Ngày: ${formatDate(report.ngayBaoCao)}`, { align: 'center' })
       .text(`Mã báo cáo: ${report.maBaoCao}`, { align: 'center' })
       .text(`Người lập: ${report.nguoiLap?.hoTen ?? ''}`, { align: 'center' })
    doc.moveDown(0.5)

    // ── Divider ──────────────────────────────────────────────
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke()
    doc.moveDown(0.5)

    // ── Summary ──────────────────────────────────────────────
    doc.fontSize(13).font('Helvetica-Bold').text('I. TỔNG HỢP')
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica')
    doc.text(`Tổng số hóa đơn :  ${report.tongSoHoaDon}`)
    doc.text(`Tổng doanh thu  :  ${formatVND(report.tongDoanhThu)}`)
    if (report.tongSoHoaDon > 0)
      doc.text(`Trung bình / HĐ :  ${formatVND(report.tongDoanhThu / report.tongSoHoaDon)}`)
    doc.moveDown()

    // ── Detail ──────────────────────────────────────────────
    doc.fontSize(13).font('Helvetica-Bold').text('II. CHI TIẾT THEO MÓN ĂN')
    doc.moveDown(0.3)

    const colX = { stt: 50, ten: 75, sl: 370, dt: 430 }

    doc.fontSize(10).font('Helvetica-Bold')
    doc.text('STT', colX.stt, doc.y, { width: 20 })
    const hy = doc.y - doc.currentLineHeight()
    doc.text('Tên món',    colX.ten, hy, { width: 285 })
    doc.text('SL',         colX.sl,  hy, { width: 50, align: 'center' })
    doc.text('Doanh thu',  colX.dt,  hy, { width: 115, align: 'right' })
    doc.moveDown(0.2)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown(0.3)

    doc.fontSize(10).font('Helvetica')
    ;(report.dongBaoCao ?? []).forEach((d, i) => {
      const y = doc.y
      doc.text(String(i + 1),          colX.stt, y, { width: 20 })
      doc.text(d.tenMon,               colX.ten, y, { width: 285 })
      doc.text(String(d.soLuongDaBan), colX.sl,  y, { width: 50, align: 'center' })
      doc.text(formatVND(d.doanhThuMon), colX.dt, y, { width: 115, align: 'right' })
      doc.moveDown()
    })

    doc.moveDown(0.3)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown(0.3)
    doc.fontSize(12).font('Helvetica-Bold')
    doc.text('TỔNG DOANH THU', colX.ten, doc.y, { width: 285 })
    doc.text(formatVND(report.tongDoanhThu), colX.dt, doc.y - doc.currentLineHeight(), { width: 115, align: 'right' })

    doc.moveDown(2)
    doc.fontSize(8).font('Helvetica').fillColor('#aaa')
       .text(`Xuất lúc ${formatNow()}`, { align: 'right' })

    doc.end()
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}
