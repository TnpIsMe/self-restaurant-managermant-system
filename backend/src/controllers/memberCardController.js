import prisma from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'

export const scanCard = async (req, res, next) => {
  try {
    const { maThe } = req.body
    if (!maThe) throw new AppError('Thiếu mã thẻ', 400)

    const card = await prisma.theThanhVien.findUnique({
      where:   { maThe },
      include: { lichSuTichDiem: { orderBy: { ngayGiao: 'desc' }, take: 10 } },
    })
    if (!card) throw new AppError('Không tìm thấy thẻ thành viên', 404)
    if (card.trangThai === 'LOCKED') throw new AppError('Thẻ đã bị khoá', 403)
    if (new Date(card.ngayHetHan) < new Date()) {
      await prisma.theThanhVien.update({ where: { maThe }, data: { trangThai: 'EXPIRED' } })
      throw new AppError('Thẻ đã hết hạn', 400)
    }
    res.json(card)
  } catch (e) { next(e) }
}

export const getCardDetail = async (req, res, next) => {
  try {
    const card = await prisma.theThanhVien.findUnique({
      where:   { id: req.params.id },
      include: { lichSuTichDiem: { orderBy: { ngayGiao: 'desc' }, take: 20 } },
    })
    if (!card) throw new AppError('Không tìm thấy thẻ thành viên', 404)
    res.json(card)
  } catch (e) { next(e) }
}

export const getPointsHistory = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const skip  = (page - 1) * limit
    const card  = await prisma.theThanhVien.findUnique({ where: { id: req.params.id } })
    if (!card) throw new AppError('Không tìm thấy thẻ thành viên', 404)
    const [items, total] = await prisma.$transaction([
      prisma.lichSuTichDiem.findMany({
        where: { theThanhVienId: req.params.id },
        skip, take: limit, orderBy: { ngayGiao: 'desc' },
      }),
      prisma.lichSuTichDiem.count({ where: { theThanhVienId: req.params.id } }),
    ])
    res.json({ items, total, tongDiem: card.tongDiem })
  } catch (e) { next(e) }
}
