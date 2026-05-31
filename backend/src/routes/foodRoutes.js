import { Router } from 'express'
import { listFoods, getFood, createFood, updateFood, deleteFood } from '../controllers/foodController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
const r = Router()
r.get('/', listFoods)
r.get('/:id', getFood)
r.post('/', authenticate, requireRole('BEP_TRUONG'), createFood)
r.put('/:id', authenticate, requireRole('BEP_TRUONG'), updateFood)
r.delete('/:id', authenticate, requireRole('BEP_TRUONG'), deleteFood)
export default r
