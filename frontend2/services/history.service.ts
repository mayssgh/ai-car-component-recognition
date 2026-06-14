import api from './api'

export const historyService = {
  getHistory: async () => {
    const res = await api.get('/history/')
    return res.data
  }
}