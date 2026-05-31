import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Chưa đăng nhập' })
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_ACCESS_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}
