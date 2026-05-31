import { Router } from 'express'
import { login, logout, refresh, getMe } from '../controllers/authController.js'
import { authenticate } from '../middleware/authMiddleware.js'
const r = Router()
r.post('/login', login)
r.post('/logout', authenticate, logout)
r.post('/refresh', refresh)
r.get('/me', authenticate, getMe)
export default r
