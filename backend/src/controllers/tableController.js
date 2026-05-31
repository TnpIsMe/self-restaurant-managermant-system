import prisma from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'

export const getTables = async (req, res, next) => {
  try {
    const tables = await prisma.ban.findMany({
      orderBy: { maBan: 'asc' },
    })
    res.json(tables)
  } catch (e) { next(e) }
}

export const getTableDetail = async (req, res, next) => {
  try {
    // Hỗ trợ tìm theo id hoặc maBan
    const { id } = req.params
    let table = await prisma.ban.findUnique({ where: { id } })
    if (!table) table = await prisma.ban.findUnique({ where: { maBan: id } })
    if (!table) throw new AppError('Không tìm thấy bàn', 404)
    res.json(table)
  } catch (e) { next(e) }
}
