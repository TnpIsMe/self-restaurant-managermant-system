import { Search } from 'lucide-react'
import clsx from 'clsx'

export default function SearchInput({ value, onChange, placeholder = 'Tìm kiếm...', className }) {
  return (
    <div className={clsx('relative', className)}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        className="input pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
