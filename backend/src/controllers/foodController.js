import prisma from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'

export const listFoods = async (req, res, next) => {
  try {
    const { danhMuc, isActive } = req.query
    const where = {}
    if (danhMuc)         where.danhMuc  = danhMuc
    if (isActive !== undefined) where.isActive = isActive === 'true'
    const foods = await prisma.monAn.findMany({
      where,
      orderBy: [{ danhMuc: 'asc' }, { tenMon: 'asc' }],
    })
    res.json(foods)
  } catch (e) { next(e) }
}

export const getFood = async (req, res, next) => {
  try {
    const food = await prisma.monAn.findUnique({ where: { id: req.params.id } })
    if (!food) throw new AppError('Không tìm thấy món ăn', 404)
    res.json(food)
  } catch (e) { next(e) }
}

export const createFood = async (req, res, next) => {
  try {
    const { maMon, tenMon, danhMuc, giaGoc, moTa, donViTinh, hinhAnh, isActive } = req.body
    if (!maMon || !tenMon || giaGoc === undefined)
      throw new AppError('Thiếu thông tin bắt buộc: maMon, tenMon, giaGoc', 400)

    const exists = await prisma.monAn.findUnique({ where: { maMon } })
    if (exists) throw new AppError(`Mã món "${maMon}" đã tồn tại`, 409)

    const food = await prisma.monAn.create({
      data: {
        maMon,
        tenMon,
        danhMuc:   danhMuc   || 'Món chính',
        giaGoc:    Number(giaGoc),
        moTa:      moTa      || null,
        donViTinh: donViTinh || 'phần',
        hinhAnh:   hinhAnh   || null,
        isActive:  isActive !== undefined ? isActive : true,
      },
    })
    res.status(201).json(food)
  } catch (e) { next(e) }
}

export const updateFood = async (req, res, next) => {
  try {
    const { tenMon, danhMuc, giaGoc, moTa, donViTinh, hinhAnh, isActive } = req.body
    const food = await prisma.monAn.findUnique({ where: { id: req.params.id } })
    if (!food) throw new AppError('Không tìm thấy món ăn', 404)

    const updated = await prisma.monAn.update({
      where: { id: req.params.id },
      data: {
        ...(tenMon    !== undefined && { tenMon }),
        ...(danhMuc   !== undefined && { danhMuc }),
        ...(giaGoc    !== undefined && { giaGoc: Number(giaGoc) }),
        ...(moTa      !== undefined && { moTa }),
        ...(donViTinh !== undefined && { donViTinh }),
        ...(hinhAnh   !== undefined && { hinhAnh }),
        ...(isActive  !== undefined && { isActive }),
      },
    })
    res.json(updated)
  } catch (e) { next(e) }
}

export const deleteFood = async (req, res, next) => {
  try {
    const food = await prisma.monAn.findUnique({ where: { id: req.params.id } })
    if (!food) throw new AppError('Không tìm thấy món ăn', 404)
    // Soft delete — ẩn khỏi thực đơn
    await prisma.monAn.update({ where: { id: req.params.id }, data: { isActive: false } })
    res.json({ message: 'Đã ẩn món ăn' })
  } catch (e) { next(e) }
}
