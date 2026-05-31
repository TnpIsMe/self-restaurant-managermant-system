import { Router } from 'express'
import { createOrder, getOrderByTable, confirmOrder, cancelOrderItem, completeOrderItem, revertOrderItem, startCookingItem, getKds } from '../controllers/orderController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
const r = Router()
r.get('/kds', authenticate, requireRole('DAU_BEP', 'BEP_TRUONG'), getKds)
r.get('/table/:tableId', getOrderByTable)
r.post('/', createOrder)
r.post('/:id/confirm', confirmOrder)
r.patch('/:orderId/items/:itemId/start', authenticate, requireRole('DAU_BEP', 'BEP_TRUONG'), startCookingItem)
r.patch('/:orderId/items/:itemId/complete', authenticate, requireRole('DAU_BEP', 'BEP_TRUONG'), completeOrderItem)
r.patch('/:orderId/items/:itemId/revert', authenticate, requireRole('DAU_BEP', 'BEP_TRUONG'), revertOrderItem)
r.delete('/:orderId/items/:itemId', cancelOrderItem)
export default r
