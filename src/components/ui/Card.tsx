import { cn } from '@/lib/utils'
import * as React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div className={cn('bg-slate-800 rounded-xl border border-slate-700', className)} {...props} />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('px-6 pt-6 pb-4', className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('px-6 pb-6', className)} {...props} />
}
