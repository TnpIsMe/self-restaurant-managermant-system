import clsx from 'clsx'

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="label">{label}</label>}
      <input className={clsx('input', error && 'input-error', className)} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
