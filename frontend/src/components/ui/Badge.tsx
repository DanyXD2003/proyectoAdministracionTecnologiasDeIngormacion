import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'red' | 'blue' | 'orange' | 'slate'
  className?: string
}

export function Badge({ children, variant = 'blue', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-green-100 text-green-700': variant === 'green',
          'bg-red-100 text-red-700': variant === 'red',
          'bg-blue-100 text-blue-700': variant === 'blue',
          'bg-orange-100 text-orange-700': variant === 'orange',
          'bg-slate-100 text-slate-600': variant === 'slate',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}
