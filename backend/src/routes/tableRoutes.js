import { Router } from 'express'
import { getTables, getTableDetail } from '../controllers/tableController.js'
const r = Router()
r.get('/', getTables)
r.get('/:id', getTableDetail)
export default r
