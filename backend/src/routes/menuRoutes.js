import { Router } from 'express'
import { getTodayMenu, getMenuByDate, createMenu, updateMenu, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
const r = Router()
r.get('/today', getTodayMenu)
r.get('/:date', getMenuByDate)
r.post('/', authenticate, requireRole('BEP_TRUONG'), createMenu)
r.put('/:id', authenticate, requireRole('BEP_TRUONG'), updateMenu)
r.patch('/:menuId/items/:itemId', authenticate, requireRole('BEP_TRUONG', 'DAU_BEP'), updateMenuItem)
r.delete('/:menuId/items/:itemId', authenticate, requireRole('BEP_TRUONG'), deleteMenuItem)
export default r
