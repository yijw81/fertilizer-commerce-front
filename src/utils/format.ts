export const formatPrice = (value: number) => new Intl.NumberFormat('ko-KR').format(value)

export const nutrientColor = (type: 'n' | 'p' | 'k') => {
  if (type === 'n') return 'bg-blue-100 text-blue-700'
  if (type === 'p') return 'bg-orange-100 text-orange-700'
  return 'bg-purple-100 text-purple-700'
}
