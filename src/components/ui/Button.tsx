'use client'

import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.3)] hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] focus-visible:ring-indigo-500',
        secondary:
          'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 focus-visible:ring-slate-500',
        accent:
          'bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold focus-visible:ring-amber-400',
        ghost:
          'hover:bg-slate-800 text-slate-300 hover:text-slate-100 focus-visible:ring-slate-500',
        danger: 'bg-red-600 hover:bg-red-500 text-white focus-visible:ring-red-500',
        outline:
          'border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-200 focus-visible:ring-slate-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2 w-9 h-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)

Button.displayName = 'Button'
