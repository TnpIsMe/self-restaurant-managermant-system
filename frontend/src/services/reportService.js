import api from './api'

export const reportService = {
  createDaily: () => api.post('/reports/daily'),
  getAll: (params) => api.get('/reports', { params }),
  getDetail: (id) => api.get(`/reports/${id}`),
  exportPdf: (id) => api.get(`/reports/${id}/export/pdf`, { responseType: 'blob' }),
  exportExcel: (id) => api.get(`/reports/${id}/export/excel`, { responseType: 'blob' }),
}
