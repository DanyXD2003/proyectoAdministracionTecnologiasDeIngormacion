import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-2xl border border-slate-200 shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={clsx('px-6 py-5 border-b border-slate-100 bg-slate-50/60 rounded-t-2xl', className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={clsx('px-6 py-5', className)}>
      {children}
    </div>
  )
}

export function CardSection({ children, className }: CardProps) {
  return (
    <div className={clsx('px-6 py-4 border-t border-slate-100 first:border-t-0', className)}>
      {children}
    </div>
  )
}
