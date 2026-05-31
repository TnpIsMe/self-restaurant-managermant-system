import api from './api'

export const invoiceService = {
  getByTable: (tableId) => api.get(`/invoices/table/${tableId}`),
  getDetail: (id) => api.get(`/invoices/${id}`),
  lock: (id) => api.post(`/invoices/${id}/lock`),
  unlock: (id) => api.post(`/invoices/${id}/unlock`),
  getHistory: (params) => api.get('/invoices/history', { params }),
}
