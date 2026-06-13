export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export const formatConfidence = (score: number): string => {
  return `${Math.round(score * 100)}%`
}

export const getConfidenceColor = (score: number): string => {
  if (score >= 0.8) return '#22C55E'
  if (score >= 0.5) return '#F59E0B'
  return '#EF4444'
}