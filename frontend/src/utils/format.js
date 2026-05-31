import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

export const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0)

export const parseVND = (str) => parseInt(String(str).replace(/[^\d]/g, ''), 10) || 0

export const formatDate = (date, fmt = 'dd/MM/yyyy') => {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: vi })
}

export const formatDateTime = (date) => formatDate(date, 'dd/MM/yyyy HH:mm')

export const formatTime = (date) => formatDate(date, 'HH:mm')

export const maskPhone = (phone) =>
  phone ? phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : ''
