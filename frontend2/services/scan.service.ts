import api from './api'

export const scanService = {
  scanImage: async (imageUri: string) => {
    const formData = new FormData()
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    } as any)
    const res = await api.post('/scan/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  }
}