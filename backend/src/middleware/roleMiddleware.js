export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.vaiTro))
    return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này' })
  next()
}
