export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500
  const message = err.message || 'Lỗi hệ thống'
  if (status >= 500) console.error(`[ERROR] ${req.method} ${req.url}:`, err)
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}
