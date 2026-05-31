import api from './api'

export const memberCardService = {
  scan: (maThe) => api.post('/member-cards/scan', { maThe }),
  getDetail: (id) => api.get(`/member-cards/${id}`),
  getPoints: (id) => api.get(`/member-cards/${id}/points`),
}
