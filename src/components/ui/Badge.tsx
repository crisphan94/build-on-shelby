import { cn } from '@/lib/utils'
import * as React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
}

const variantStyles = {
  default: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/30',
  error: 'bg-red-500/10 text-red-400 border-red-500/30',
  warning: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  )
}
