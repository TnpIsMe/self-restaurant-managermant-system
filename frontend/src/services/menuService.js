import api from './api'

export const menuService = {
  getToday: () => api.get('/menus/today'),
  getByDate: (date) => api.get(`/menus/${date}`),
  create: (data) => api.post('/menus', data),
  update: (id, data) => api.put(`/menus/${id}`, data),
  updateItem: (menuId, itemId, data) => api.patch(`/menus/${menuId}/items/${itemId}`, data),
  deleteItem: (menuId, itemId) => api.delete(`/menus/${menuId}/items/${itemId}`),
}
