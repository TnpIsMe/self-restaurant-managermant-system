import api from './api'

export const paymentService = {
  payCash: (invoiceId, tienKhachDua) => api.post(`/payments/${invoiceId}/cash`, { tienKhachDua }),
  initiateTransfer: (invoiceId) => api.post(`/payments/${invoiceId}/transfer`),
  confirmTransfer: (invoiceId, maGiaoDich) => api.post(`/payments/${invoiceId}/confirm`, { maGiaoDich }),
  getQr: (invoiceId) => api.get(`/payments/${invoiceId}/qr`),
}
