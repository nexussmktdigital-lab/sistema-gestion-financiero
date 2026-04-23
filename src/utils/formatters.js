export const formatCurrency = (amount, currency = 'ARS') => {
  if (amount == null || isNaN(amount)) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T12:00:00')
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export const formatPhone = (phone) => {
  if (!phone) return '—'
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')
}

export const formatCUIT = (cuit) => {
  if (!cuit) return '—'
  const clean = cuit.replace(/\D/g, '')
  if (clean.length === 11) return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`
  return cuit
}

export const getDaysUntil = (dateStr) => {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  return diff
}

export const calcCuotaCredito = (importe, cuotas, interes) => {
  if (!importe || !cuotas || interes == null) return 0
  const totalConInteres = importe * (1 + interes / 100)
  return totalConInteres / cuotas
}
