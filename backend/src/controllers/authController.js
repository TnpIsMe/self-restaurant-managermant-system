import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/database.js'

function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  })
}
function signRefresh(id) {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  })
}

export const login = async (req, res, next) => {
  try {
    const { maNV, matKhau } = req.body
    if (!maNV || !matKhau)
      return res.status(400).json({ message: 'Vui lòng nhập mã nhân viên và mật khẩu' })

    const nv = await prisma.nhanVien.findUnique({ where: { maNV } })
    if (!nv || !(await bcrypt.compare(matKhau, nv.matKhauHash)))
      return res.status(401).json({ message: 'Sai mã nhân viên hoặc mật khẩu' })

    const payload = { id: nv.id, maNV: nv.maNV, hoTen: nv.hoTen, vaiTro: nv.vaiTro }
    const accessToken  = signAccess(payload)
    const refreshToken = signRefresh(nv.id)

    await prisma.refreshToken.upsert({
      where:  { nhanVienId: nv.id },
      update: { token: refreshToken },
      create: { nhanVienId: nv.id, token: refreshToken },
    })

    res.json({ user: payload, accessToken, refreshToken })
  } catch (e) { next(e) }
}

export const logout = async (req, res, next) => {
  try {
    await prisma.refreshToken.deleteMany({ where: { nhanVienId: req.user.id } })
    res.json({ message: 'Đăng xuất thành công' })
  } catch (e) { next(e) }
}

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken)
      return res.status(400).json({ message: 'Thiếu refresh token' })

    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch {
      return res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' })
    }

    const stored = await prisma.refreshToken.findFirst({
      where: { nhanVienId: decoded.id, token: refreshToken },
    })
    if (!stored)
      return res.status(401).json({ message: 'Refresh token không hợp lệ' })

    const nv = await prisma.nhanVien.findUnique({ where: { id: decoded.id } })
    if (!nv) return res.status(404).json({ message: 'Nhân viên không tồn tại' })

    const accessToken = signAccess({
      id: nv.id, maNV: nv.maNV, hoTen: nv.hoTen, vaiTro: nv.vaiTro,
    })
    res.json({ accessToken })
  } catch (e) { next(e) }
}

export const getMe = async (req, res, next) => {
  try {
    const nv = await prisma.nhanVien.findUnique({
      where:  { id: req.user.id },
      select: { id: true, maNV: true, hoTen: true, vaiTro: true, ngayVaoLam: true },
    })
    if (!nv) return res.status(404).json({ message: 'Nhân viên không tồn tại' })
    res.json(nv)
  } catch (e) { next(e) }
}
