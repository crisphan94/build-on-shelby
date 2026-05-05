import { cn } from '@/lib/utils'
import * as React from 'react'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500',
      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors duration-150',
      className,
    )}
    {...props}
  />
))

Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 resize-none',
      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors duration-150',
      className,
    )}
    {...props}
  />
))

Textarea.displayName = 'Textarea'
