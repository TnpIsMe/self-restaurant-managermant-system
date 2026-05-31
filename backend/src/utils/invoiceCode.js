import prisma from '../config/database.js'

function yyyymmdd(d) {
  const y   = d.getFullYear()
  const m   = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

export async function generateInvoiceCode() {
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

  const count = await prisma.hoaDonThanhToan.count({
    where: { thoiGianThanhToan: { gte: today, lt: tomorrow } },
  })
  return `INV-${yyyymmdd(today)}-${String(count + 1).padStart(4, '0')}`
}
