import ExcelJS from 'exceljs'

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

export async function exportReportToExcel(report, outputPath) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Self Restaurant'
  wb.created = new Date()

  const ws = wb.addWorksheet('Báo cáo doanh thu')

  ws.columns = [
    { key: 'stt',  width: 6  },
    { key: 'ten',  width: 36 },
    { key: 'sl',   width: 14 },
    { key: 'dt',   width: 24 },
  ]

  const restaurantName = process.env.RESTAURANT_NAME || 'Self Restaurant'

  const addCenter = (row, text, bold = false, size = 11) => {
    ws.mergeCells(`A${row}:D${row}`)
    const cell = ws.getCell(`A${row}`)
    cell.value     = text
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.font      = { bold, size }
    ws.getRow(row).height = bold ? 22 : 16
  }

  addCenter(1, restaurantName,           true,  16)
  addCenter(2, process.env.RESTAURANT_ADDRESS || '', false, 10)
  addCenter(3, 'BÁO CÁO DOANH THU',     true,  14)
  addCenter(4, `Ngày: ${formatDate(report.ngayBaoCao)}`, false, 11)
  addCenter(5, `Mã báo cáo: ${report.maBaoCao}`,        false, 10)
  addCenter(6, `Người lập: ${report.nguoiLap?.hoTen ?? ''}`, false, 10)
  ws.addRow([])

  // Summary
  const addSummary = (label, value) => {
    const r = ws.addRow([label, value])
    r.getCell(1).font = { bold: true }
  }
  ws.addRow(['I. TỔNG HỢP']).getCell(1).font = { bold: true, size: 12 }
  addSummary('Tổng số hóa đơn:', report.tongSoHoaDon)
  addSummary('Tổng doanh thu:', formatVND(report.tongDoanhThu))
  if (report.tongSoHoaDon > 0)
    addSummary('Trung bình / HĐ:', formatVND(report.tongDoanhThu / report.tongSoHoaDon))
  ws.addRow([])

  // Detail header
  ws.addRow(['II. CHI TIẾT THEO MÓN ĂN']).getCell(1).font = { bold: true, size: 12 }

  const orange = 'FFEA580C'
  const hRow = ws.addRow(['STT', 'Tên món', 'Số lượng bán', 'Doanh thu'])
  hRow.height = 20
  hRow.eachCell((cell) => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: orange } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border    = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })

  ;(report.dongBaoCao ?? []).forEach((d, i) => {
    const row = ws.addRow([i + 1, d.tenMon, d.soLuongDaBan, formatVND(d.doanhThuMon)])
    row.getCell(3).alignment = { horizontal: 'center' }
    row.getCell(4).alignment = { horizontal: 'right' }
    row.eachCell((cell) => {
      cell.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'thin' }, right: { style: 'thin' } }
    })
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } }
      })
    }
  })

  const tRow = ws.addRow(['', 'TỔNG CỘNG', '', formatVND(report.tongDoanhThu)])
  tRow.getCell(4).alignment = { horizontal: 'right' }
  tRow.eachCell((cell) => {
    cell.font = { bold: true }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } }
    cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })

  ws.addRow([])
  const fRow = ws.addRow([`Xuất lúc ${formatNow()}`])
  ws.mergeCells(`A${fRow.number}:D${fRow.number}`)
  fRow.getCell(1).font = { italic: true, color: { argb: 'FF9CA3AF' }, size: 9 }
  fRow.getCell(1).alignment = { horizontal: 'right' }

  await wb.xlsx.writeFile(outputPath)
}
