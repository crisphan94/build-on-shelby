'use client'

import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, FileUp, Loader2, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

type WizardState =
  | { step: 1 }
  | { step: 2; file: File }
  | { step: 3; file: File; name: string; description: string; tags: string[]; uploaderAddr: string }
  | { step: 'success'; datasetId: string }
  | { step: 'error'; message: string; prevStep: 3 }

const MAX_BYTES = 5 * 1024 * 1024 * 1024 // 5 GB

export function UploadWizard() {
  const router = useRouter()
  const [state, setState] = useState<WizardState>({ step: 1 })
  const [tagInput, setTagInput] = useState('')
  const dropRef = useRef<HTMLDivElement>(null)

  // ── Step 1 ──────────────────────────────────────────────
  function onFileSelect(file: File) {
    if (file.size > MAX_BYTES) {
      alert('File is too large. Maximum size is 5 GB.')
      return
    }
    setState({ step: 2, file })
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  // ── Step 2 ──────────────────────────────────────────────
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [uploaderAddr, setUploaderAddr] = useState('')

  function addTag(value: string) {
    const t = value.trim().toLowerCase().slice(0, 32)
    if (t && !tags.includes(t) && tags.length < 20) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  function goToStep3() {
    if (state.step !== 2) return
    if (!name.trim() || name.trim().length < 3) {
      alert('Dataset name must be at least 3 characters.')
      return
    }
    setState({
      step: 3,
      file: state.file,
      name: name.trim(),
      description: description.trim(),
      tags,
      uploaderAddr: uploaderAddr.trim(),
    })
  }

  // ── Step 3: upload ───────────────────────────────────────
  const [uploading, setUploading] = useState(false)

  async function handleUpload() {
    if (state.step !== 3) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', state.file)
    formData.append('name', state.name)
    formData.append('description', state.description)
    formData.append('tags', state.tags.join(','))
    formData.append('uploaderAddr', state.uploaderAddr)

    try {
      const res = await fetch('/api/datasets/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }))
        throw new Error(err.message ?? 'Upload failed')
      }

      const data = await res.json()
      setState({ step: 'success', datasetId: data.id })
    } catch (err) {
      setState({
        step: 'error',
        message: err instanceof Error ? err.message : 'Upload failed. Please try again.',
        prevStep: 3,
      })
    } finally {
      setUploading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────
  const currentStep = state.step === 'success' || state.step === 'error' ? 3 : state.step

  return (
    <div className='max-w-2xl mx-auto px-4 sm:px-6 py-12'>
      {/* Step indicator */}
      {state.step !== 'success' && <StepIndicator current={currentStep as 1 | 2 | 3} />}

      {/* Step 1: File selection */}
      {state.step === 1 && (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold text-slate-100 mb-2'>Select a file</h2>
          <p className='text-sm text-slate-400 mb-6'>
            Upload any file up to 5 GB. CSV, JSON, ZIP, Parquet, and more.
          </p>
          <label>
            <div
              ref={dropRef}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className='flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl p-12 cursor-pointer transition-colors duration-200 bg-slate-800/50 hover:bg-slate-800'
            >
              <div className='w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center'>
                <FileUp className='w-7 h-7 text-slate-400' />
              </div>
              <div className='text-center'>
                <p className='text-sm font-medium text-slate-200'>
                  Drag & drop or <span className='text-indigo-400 underline'>browse</span>
                </p>
                <p className='text-xs text-slate-500 mt-1'>Max size: 5 GB</p>
              </div>
            </div>
            <input
              type='file'
              className='sr-only'
              onChange={onFileChange}
              aria-label='Select file to upload'
            />
          </label>
        </div>
      )}

      {/* Step 2: Metadata */}
      {state.step === 2 && (
        <div className='mt-8 space-y-6'>
          <div>
            <h2 className='text-xl font-semibold text-slate-100 mb-1'>Dataset details</h2>
            <p className='text-sm text-slate-400'>
              Selected file:{' '}
              <span className='text-slate-200 font-mono text-xs'>{state.file.name}</span>
            </p>
          </div>

          <div className='space-y-4'>
            <FormField label='Name' required hint={`${name.length}/120`}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 120))}
                placeholder='e.g. English Wikipedia Subset 2025'
                autoFocus
              />
            </FormField>

            <FormField label='Description' hint={`${description.length}/2000`}>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                placeholder='Describe the dataset contents, source, and intended use…'
                rows={4}
              />
            </FormField>

            <FormField label='Tags' hint='Press Enter or comma to add (max 20)'>
              <div className='flex flex-wrap gap-1.5 p-2.5 bg-slate-800 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent min-h-[44px]'>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-300'
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className='hover:text-white cursor-pointer'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => tagInput && addTag(tagInput)}
                  placeholder={tags.length === 0 ? 'nlp, english, classification…' : ''}
                  className='flex-1 min-w-[120px] bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none'
                />
              </div>
            </FormField>

            <FormField label='Your Aptos Address' hint='Optional — for attribution'>
              <Input
                value={uploaderAddr}
                onChange={(e) => setUploaderAddr(e.target.value)}
                placeholder='0x…'
                className='font-mono text-xs'
              />
            </FormField>
          </div>

          <div className='flex gap-3'>
            <Button variant='secondary' onClick={() => setState({ step: 1 })}>
              Back
            </Button>
            <Button
              variant='primary'
              onClick={goToStep3}
              disabled={name.trim().length < 3}
              className='flex-1'
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Upload */}
      {state.step === 3 && (
        <div className='mt-8 space-y-6'>
          <div>
            <h2 className='text-xl font-semibold text-slate-100 mb-1'>Ready to upload</h2>
            <p className='text-sm text-slate-400'>Review and confirm your upload to Shelby.</p>
          </div>

          <div className='bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3 text-sm'>
            <SummaryRow label='Name' value={state.name} />
            <SummaryRow
              label='File'
              value={`${state.file.name} (${(state.file.size / 1024 / 1024).toFixed(1)} MB)`}
            />
            {state.description && <SummaryRow label='Description' value={state.description} />}
            {state.tags.length > 0 && <SummaryRow label='Tags' value={state.tags.join(', ')} />}
            {state.uploaderAddr && <SummaryRow label='Uploader' value={state.uploaderAddr} mono />}
          </div>

          {!uploading && (
            <div className='flex gap-3'>
              <Button variant='secondary' onClick={() => setState({ step: 2, file: state.file })}>
                Back
              </Button>
              <Button variant='primary' onClick={handleUpload} className='flex-1'>
                <Upload className='w-4 h-4' />
                Upload to Shelby
              </Button>
            </div>
          )}

          {uploading && (
            <div className='flex flex-col items-center gap-4 py-4'>
              <Loader2 className='w-10 h-10 text-indigo-400 animate-spin' />
              <div className='text-center'>
                <p className='text-sm font-medium text-slate-200'>Uploading to Shelby…</p>
                <p className='text-xs text-slate-500 mt-1'>Please don&apos;t close this page.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {state.step === 'error' && (
        <div className='mt-8 space-y-6'>
          <div className='flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30'>
            <AlertCircle className='w-5 h-5 text-red-400 shrink-0 mt-0.5' />
            <div>
              <p className='text-sm font-semibold text-red-400'>Upload failed</p>
              <p className='text-sm text-slate-400 mt-1'>{state.message}</p>
            </div>
          </div>
          <Button
            variant='primary'
            onClick={() =>
              setState({
                step: 3,
                file: (state as { file?: File }).file!,
                name,
                description,
                tags,
                uploaderAddr,
              })
            }
            className='w-full'
          >
            Retry
          </Button>
        </div>
      )}

      {/* Success */}
      {state.step === 'success' && (
        <div className='mt-16 flex flex-col items-center text-center gap-6'>
          <div className='w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center'>
            <CheckCircle2 className='w-10 h-10 text-green-400' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-slate-100 mb-2'>Dataset uploaded!</h2>
            <p className='text-slate-400'>
              Your dataset is now stored on Shelby and available globally.
            </p>
          </div>
          <div className='flex gap-3'>
            <Button
              variant='secondary'
              onClick={() => {
                setState({ step: 1 })
                setName('')
                setDescription('')
                setTags([])
                setUploaderAddr('')
              }}
            >
              Upload another
            </Button>
            <Button variant='primary' onClick={() => router.push(`/dataset/${state.datasetId}`)}>
              View dataset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Select file', 'Details', 'Upload']
  return (
    <div className='flex items-center gap-2'>
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div key={label} className='flex items-center gap-2 flex-1 last:flex-none'>
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border',
                done
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : active
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-slate-700 text-slate-600',
              )}
            >
              {done ? <CheckCircle2 className='w-4 h-4' /> : num}
            </div>
            <span
              className={cn(
                'text-sm hidden sm:block',
                active ? 'text-slate-200 font-medium' : 'text-slate-500',
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={cn('flex-1 h-px', done ? 'bg-indigo-600' : 'bg-slate-700')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between'>
        <label className='text-sm font-medium text-slate-300'>
          {label}
          {required && <span className='text-red-400 ml-1'>*</span>}
        </label>
        {hint && <span className='text-xs text-slate-500'>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className='flex gap-3'>
      <span className='text-slate-500 w-24 shrink-0'>{label}</span>
      <span className={cn('text-slate-200 break-all', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}
