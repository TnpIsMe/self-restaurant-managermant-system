import prisma from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'

function startOfDay(d) {
  const r = new Date(d); r.setUTCHours(0,0,0,0); return r
}
function endOfDay(d) {
  const r = new Date(d); r.setUTCHours(23,59,59,999); return r
}
function parseDate(str) {
  // str: 'YYYY-MM-DD'
  const [y, m, d] = str.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function normalizePrice(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

async function validateMenuItems(items, tx = prisma) {
  const validated = []
  for (const item of items || []) {
    const monAn = await tx.monAn.findUnique({ where: { id: item.monAnId } })
    if (!monAn) continue

    const price = normalizePrice(item.giaBanTrongNgay)
    if (price < monAn.giaGoc) {
      throw new AppError(`Giá bán của ${monAn.tenMon} không được thấp hơn giá gốc`, 400)
    }

    validated.push({
      monAnId: item.monAnId,
      giaBanTrongNgay: price,
    })
  }
  return validated
}

const menuInclude = {
  dongThucDon: {
    include: { monAn: true },
    orderBy: [{ monAn: { danhMuc: 'asc' } }, { monAn: { tenMon: 'asc' } }],
  },
}

export const getTodayMenu = async (req, res, next) => {
  try {
    const today = startOfDay(new Date())
    const menu = await prisma.thucDonNgay.findFirst({
      where:   { ngay: { gte: today, lt: endOfDay(today) }, isActive: true },
      include: menuInclude,
    })
    res.json(menu)
  } catch (e) { next(e) }
}

export const getMenuByDate = async (req, res, next) => {
  try {
    const date = startOfDay(parseDate(req.params.date))
    const menu = await prisma.thucDonNgay.findFirst({
      where:   { ngay: { gte: date, lt: endOfDay(date) } },
      include: menuInclude,
    })
    res.json(menu)
  } catch (e) { next(e) }
}

export const createMenu = async (req, res, next) => {
  try {
    const { items, addItems } = req.body
    let ngay = req.body.ngay

    if (!ngay) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      ngay = `${year}-${month}-${day}`
    }

    const date = startOfDay(parseDate(ngay))

    if (addItems) {
      const existing = await prisma.thucDonNgay.findFirst({
        where: { ngay: { gte: date, lt: endOfDay(date) } },
      })

      if (!existing) throw new AppError(`Thực đơn ngày ${ngay} không tồn tại`, 404)

      const validatedItems = await validateMenuItems(addItems)
      if (!validatedItems.length) throw new AppError('Không có món hợp lệ để thêm vào thực đơn', 400)

      await prisma.dongThucDonNgay.createMany({
        data: validatedItems.map((i) => ({
          thucDonNgayId:   existing.id,
          monAnId:         i.monAnId,
          giaBanTrongNgay: i.giaBanTrongNgay,
        })),
      })
      return res.json(
        await prisma.thucDonNgay.findUnique({ where: { id: existing.id }, include: menuInclude })
      )
    }

    const menu = await prisma.$transaction(async (tx) => {
      const existing = await tx.thucDonNgay.findFirst({
        where: { ngay: { gte: date, lt: endOfDay(date) } },
      })

      if (existing) {
        return await tx.thucDonNgay.update({
          where: { id: existing.id },
          data: {
            dongThucDon: {
              deleteMany: {},
              create: await validateMenuItems(items || []),
            },
          },
          include: menuInclude,
        })
      }

      return await tx.thucDonNgay.create({
        data: {
          ngay: date,
          dongThucDon: {
            create: await validateMenuItems(items || []),
          },
        },
        include: menuInclude,
      })
    })
    res.status(201).json(menu)
  } catch (e) { next(e) }
}

export const updateMenu = async (req, res, next) => {
  try {
    const { addItems } = req.body
    if (addItems?.length) {
      const validatedItems = await validateMenuItems(addItems)
      if (!validatedItems.length) throw new AppError('Không có món hợp lệ để thêm vào thực đơn', 400)

      await prisma.dongThucDonNgay.createMany({
        data: validatedItems.map((i) => ({
          thucDonNgayId:   req.params.id,
          monAnId:         i.monAnId,
          giaBanTrongNgay: i.giaBanTrongNgay,
        })),
      })
    }
    res.json(
      await prisma.thucDonNgay.findUnique({ where: { id: req.params.id }, include: menuInclude })
    )
  } catch (e) { next(e) }
}

export const updateMenuItem = async (req, res, next) => {
  try {
    const { trangThai, giaBanTrongNgay } = req.body
    const valid = ['CO_SAN', 'HET_MON']
    if (trangThai && !valid.includes(trangThai))
      throw new AppError(`trangThai phải là: ${valid.join(' | ')}`, 400)

    const existingItem = await prisma.dongThucDonNgay.findUnique({
      where: { id: req.params.itemId },
      include: { monAn: true },
    })

    if (!existingItem) throw new AppError('Không tìm thấy món trong thực đơn', 404)

    const parsedPrice = giaBanTrongNgay !== undefined ? normalizePrice(giaBanTrongNgay) : undefined
    if (parsedPrice !== undefined && parsedPrice < existingItem.monAn.giaGoc) {
      throw new AppError(`Giá bán của ${existingItem.monAn.tenMon} không được thấp hơn giá gốc`, 400)
    }

    const item = await prisma.dongThucDonNgay.update({
      where: { id: req.params.itemId },
      data: {
        ...(trangThai       && { trangThai }),
        ...(parsedPrice !== undefined && { giaBanTrongNgay: parsedPrice }),
      },
      include: { monAn: true },
    })
    res.json(item)
  } catch (e) { next(e) }
}

export const deleteMenuItem = async (req, res, next) => {
  try {
    await prisma.dongThucDonNgay.delete({ where: { id: req.params.itemId } })
    res.json({ message: 'Đã xoá khỏi thực đơn' })
  } catch (e) { next(e) }
}
