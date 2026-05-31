import { Router } from 'express'

// Import tất cả routes — nếu có lỗi import sẽ log rõ ràng
let authRoutes, foodRoutes, menuRoutes, orderRoutes, invoiceRoutes,
    paymentRoutes, memberCardRoutes, reportRoutes, tableRoutes

try {
  authRoutes       = (await import('./authRoutes.js')).default
  foodRoutes       = (await import('./foodRoutes.js')).default
  menuRoutes       = (await import('./menuRoutes.js')).default
  orderRoutes      = (await import('./orderRoutes.js')).default
  invoiceRoutes    = (await import('./invoiceRoutes.js')).default
  paymentRoutes    = (await import('./paymentRoutes.js')).default
  memberCardRoutes = (await import('./memberCardRoutes.js')).default
  reportRoutes     = (await import('./reportRoutes.js')).default
  tableRoutes      = (await import('./tableRoutes.js')).default
} catch (err) {
  console.error('❌ Lỗi load routes:', err.message)
  throw err
}

export const router = Router()

router.use('/auth',         authRoutes)
router.use('/foods',        foodRoutes)
router.use('/menus',        menuRoutes)
router.use('/orders',       orderRoutes)
router.use('/invoices',     invoiceRoutes)
router.use('/payments',     paymentRoutes)
router.use('/member-cards', memberCardRoutes)
router.use('/reports',      reportRoutes)
router.use('/tables',       tableRoutes)
