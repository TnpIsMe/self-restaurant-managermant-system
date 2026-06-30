import { Router } from 'express'
import { getByTable, getDetail, lockInvoice, unlockInvoice, getHistory, getReceiptPreview } from '../controllers/invoiceController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
const r = Router()
r.get('/history', authenticate, requireRole('THU_NGAN'), getHistory)
r.get('/table/:tableId', getByTable)
r.get('/:id/receipt', getReceiptPreview)
r.get('/:id', authenticate, getDetail)
r.post('/:id/lock', authenticate, requireRole('THU_NGAN'), lockInvoice)
r.post('/:id/unlock', authenticate, requireRole('THU_NGAN'), unlockInvoice)
export default r
