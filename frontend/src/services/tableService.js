import api from './api'

export const tableService = {
  getAll: () => api.get('/tables'),
  getById: (id) => api.get(`/tables/${id}`),
}
