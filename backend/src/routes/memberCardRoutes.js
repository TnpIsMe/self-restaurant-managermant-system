import { Router } from 'express'
import { scanCard, getCardDetail, getPointsHistory } from '../controllers/memberCardController.js'
const r = Router()
r.post('/scan', scanCard)
r.get('/:id', getCardDetail)
r.get('/:id/points', getPointsHistory)
export default r
