import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, className, ...props
}) {
  const variants = {
    primary: 'btn-primary', secondary: 'btn-secondary',
    danger: 'btn-danger', success: 'btn-success', ghost: 'btn-ghost',
  }
  const sizes = { sm: 'btn-sm', md: '', lg: 'btn-lg' }

  return (
    <button
      className={clsx(variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}
