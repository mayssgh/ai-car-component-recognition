import { useState, useEffect } from 'react'
import { historyService } from '../services/history.service'
import { Scan } from '../types/scan.types'

export const useHistory = () => {
  const [history, setHistory] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    historyService.getHistory()
      .then(setHistory)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { history, loading, error }
}