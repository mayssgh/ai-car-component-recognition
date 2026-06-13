import api from './api'

export const componentService = {
  getAll: async () => {
    const res = await api.get('/components/')
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get(`/components/${id}`)
    return res.data
  }
}