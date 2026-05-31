import { Router } from 'express'
import { createDailyReport, getReports, getReportDetail, exportPdf, exportExcel } from '../controllers/reportController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
const r = Router()
r.use(authenticate, requireRole('THU_NGAN'))
r.post('/daily', createDailyReport)
r.get('/', getReports)
r.get('/:id', getReportDetail)
r.get('/:id/export/pdf', exportPdf)
r.get('/:id/export/excel', exportExcel)
export default r
