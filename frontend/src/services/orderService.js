import api from './api'

export const orderService = {
  create: (tableId, items, ghiChu) => api.post('/orders', { tableId, items, ghiChu }),
  getByTable: (tableId) => api.get(`/orders/table/${tableId}`),
  confirm: (orderId) => api.post(`/orders/${orderId}/confirm`),
  cancelItem: (orderId, itemId) => api.delete(`/orders/${orderId}/items/${itemId}`),
  completeItem: (orderId, itemId) => api.patch(`/orders/${orderId}/items/${itemId}/complete`),
  startCookingItem: (orderId, itemId) => api.patch(`/orders/${orderId}/items/${itemId}/start`),
  revertItem: (orderId, itemId) => api.patch(`/orders/${orderId}/items/${itemId}/revert`),
  getKds: () => api.get('/orders/kds'),
}
