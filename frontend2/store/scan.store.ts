import { create } from 'zustand'
import { scanService } from '../services/scan.service'

interface ScanState {
  result: any | null
  loading: boolean
  error: string | null
  scan: (imageUri: string) => Promise<void>
  clearResult: () => void
}

export const useScanStore = create<ScanState>((set) => ({
  result: null,
  loading: false,
  error: null,
  scan: async (imageUri) => {
    set({ loading: true, error: null })
    try {
      const data = await scanService.scanImage(imageUri)
      set({ result: data, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  clearResult: () => set({ result: null })
}))