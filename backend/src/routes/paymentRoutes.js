import { Router } from 'express'
import { payCash, initiateTransfer, confirmTransfer, getQr } from '../controllers/paymentController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
const r = Router()
r.use(authenticate, requireRole('THU_NGAN'))
r.post('/:invoiceId/cash', payCash)
r.post('/:invoiceId/transfer', initiateTransfer)
r.post('/:invoiceId/confirm', confirmTransfer)
r.get('/:invoiceId/qr', getQr)
export default r
