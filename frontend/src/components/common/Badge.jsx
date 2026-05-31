import clsx from 'clsx'

export default function Badge({ children, variant = 'gray', className }) {
  const variants = {
    gray: 'badge-gray', orange: 'badge-orange', green: 'badge-green',
    red: 'badge-red', yellow: 'badge-yellow', blue: 'badge-blue',
  }
  return <span className={clsx(variants[variant], className)}>{children}</span>
}
