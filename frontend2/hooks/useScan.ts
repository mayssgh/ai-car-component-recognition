import { useScanStore } from '../store/scan.store'
import { compressImage } from '../utils/imageUtils'

export const useScan = () => {
  const { result, loading, error, scan, clearResult } = useScanStore()

  const scanImage = async (uri: string) => {
    const compressed = await compressImage(uri)
    await scan(compressed)
  }

  return { result, loading, error, scanImage, clearResult }
}