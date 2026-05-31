import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function Spinner({ size = 24, className }) {
  return <Loader2 size={size} className={clsx('animate-spin text-orange-500', className)} />
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner size={36} />
    </div>
  )
}
