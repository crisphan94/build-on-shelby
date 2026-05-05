'use client'

import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { WalletButton } from '@/components/layout/WalletButton'
import { useShelbyUpload, UPLOAD_PHASE_LABELS, type UploadPhase } from '@/hooks/useShelbyUpload'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileUp,
  Loader2,
  Upload,
  Wallet,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

type WizardState =
  | { step: 1 }
  | { step: 2; file: File }
  | { step: 3; file: File; name: string; description: string; tags: string[] }
  | { step: 'success'; datasetId: string; txHash: string; merkleRoot: string }
  | {
      step: 'error'
      message: string
      file: File
      name: string
      description: string
      tags: string[]
    }

const MAX_BYTES = 5 * 1024 * 1024 * 1024 // 5 GB

const UPLOAD_STEPS: Array<{ phase: UploadPhase; label: string }> = [
  { phase: 'encoding', label: 'Encode file' },
  { phase: 'signing', label: 'Sign Aptos transaction' },
  { phase: 'confirming', label: 'On-chain confirmation' },
  { phase: 'uploading', label: 'Upload to Shelby network' },
  { phase: 'registering', label: 'Register dataset' },
]

export function UploadWizard() {
  const router = useRouter()
  const { connected, account } = useWallet()
  const { upload, phase, setPhase, reset } = useShelbyUpload()
  const [state, setState] = useState<WizardState>({ step: 1 })
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
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
  const [nameError, setNameError] = useState<string | null>('Name is required')
  const [nameTouched, setNameTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])

  function validateName(value: string): string | null {
    const trimmed = value.trim()
    if (!trimmed) return 'Name is required'
    if (trimmed.length < 3) return `Name must be at least 3 characters (${trimmed.length}/3)`
    return null
  }

  function addTag(value: string) {
    const t = value.trim().toLowerCase().slice(0, 32)
    if (t && !tags.includes(t) && tags.length < 20) setTags([...tags, t])
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
    const err = validateName(name)
    setNameError(err)
    setNameTouched(true)
    if (err) return
    setState({
      step: 3,
      file: state.file,
      name: name.trim(),
      description: description.trim(),
      tags,
    })
  }

  // ── Step 3: upload ───────────────────────────────────────
  async function handleUpload() {
    if (state.step !== 3) return
    setUploading(true)
    reset()

    try {
      const result = await upload({
        file: state.file,
        name: state.name,
        description: state.description,
        tags: state.tags,
      })
      setState({
        step: 'success',
        datasetId: result.datasetId,
        txHash: result.txHash,
        merkleRoot: result.merkleRoot,
      })
    } catch (err) {
      setPhase('error')
      setState({
        step: 'error',
        message: err instanceof Error ? err.message : 'Upload failed. Please try again.',
        file: state.file,
        name: state.name,
        description: state.description,
        tags: state.tags,
      })
    } finally {
      setUploading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────
  const currentStep = state.step === 'success' || state.step === 'error' ? 3 : state.step

  return (
    <div className='max-w-2xl mx-auto px-4 sm:px-6 py-12'>
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
            <FormField
              label='Name'
              required
              hint={`${name.length}/120`}
              error={nameTouched ? nameError : null}
            >
              <Input
                value={name}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 120)
                  setName(v)
                  setNameError(validateName(v))
                }}
                onBlur={() => {
                  setNameTouched(true)
                  setNameError(validateName(name))
                }}
                placeholder='e.g. English Wikipedia Subset 2025'
                autoFocus
                className={nameTouched && nameError ? 'border-red-500 focus:ring-red-500' : ''}
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
          </div>

          <div className='flex gap-3'>
            <Button variant='secondary' onClick={() => setState({ step: 1 })}>
              Back
            </Button>
            <Button variant='primary' onClick={goToStep3} disabled={!!nameError} className='flex-1'>
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
            <p className='text-sm text-slate-400'>
              Your file will be registered on Aptos and stored on Shelby network.
            </p>
          </div>

          {/* Summary */}
          <div className='bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3 text-sm'>
            <SummaryRow label='Name' value={state.name} />
            <SummaryRow
              label='File'
              value={`${state.file.name} (${(state.file.size / 1024 / 1024).toFixed(1)} MB)`}
            />
            {state.description && <SummaryRow label='Description' value={state.description} />}
            {state.tags.length > 0 && <SummaryRow label='Tags' value={state.tags.join(', ')} />}
            {account && <SummaryRow label='Uploader' value={String(account.address)} mono />}
          </div>

          {/* Wallet gate */}
          {!connected ? (
            <div className='flex flex-col items-center gap-3 py-6 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed'>
              <Wallet className='w-8 h-8 text-slate-500' />
              <p className='text-sm text-slate-400 text-center'>
                Connect your wallet to sign the Aptos transaction
              </p>
              <WalletButton />
            </div>
          ) : uploading ? (
            /* Upload progress */
            <div className='bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4'>
              <p className='text-sm font-medium text-slate-200'>Uploading…</p>
              <div className='space-y-3'>
                {UPLOAD_STEPS.map(({ phase: stepPhase, label }) => {
                  const stepIndex = UPLOAD_STEPS.findIndex((s) => s.phase === stepPhase)
                  const currentIndex = UPLOAD_STEPS.findIndex((s) => s.phase === phase)
                  const isDone = currentIndex > stepIndex
                  const isActive = phase === stepPhase

                  return (
                    <div key={stepPhase} className='flex items-center gap-3'>
                      {isDone ? (
                        <CheckCircle2 className='w-4 h-4 text-green-400 shrink-0' />
                      ) : isActive ? (
                        <Loader2 className='w-4 h-4 text-indigo-400 animate-spin shrink-0' />
                      ) : (
                        <Circle className='w-4 h-4 text-slate-600 shrink-0' />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          isDone && 'text-slate-500 line-through',
                          isActive && 'text-slate-100 font-medium',
                          !isDone && !isActive && 'text-slate-600',
                        )}
                      >
                        {isActive ? UPLOAD_PHASE_LABELS[phase] : label}
                      </span>
                    </div>
                  )
                })}
              </div>
              {phase === 'signing' && (
                <p className='text-xs text-amber-400 mt-2'>
                  ✦ Check your wallet for a transaction to approve.
                </p>
              )}
            </div>
          ) : (
            /* Action buttons */
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
            onClick={() => {
              reset()
              setState({
                step: 3,
                file: state.file,
                name: state.name,
                description: state.description,
                tags: state.tags,
              })
            }}
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
              Stored on Shelby network and registered on Aptos testnet.
            </p>
          </div>

          {/* Tx info */}
          <div className='w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-left space-y-3'>
            <div>
              <p className='text-xs text-slate-500 mb-1'>Transaction Hash</p>
              <p className='font-mono text-xs text-slate-300 break-all'>{state.txHash}</p>
            </div>
            <div>
              <p className='text-xs text-slate-500 mb-1'>Merkle Root</p>
              <p className='font-mono text-xs text-slate-300 break-all'>{state.merkleRoot}</p>
            </div>
            <a
              href={`https://explorer.aptoslabs.com/txn/${state.txHash}?network=testnet`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors'
            >
              <ExternalLink className='w-3 h-3' />
              View on Aptos Explorer
            </a>
          </div>

          <div className='flex gap-3'>
            <Button
              variant='secondary'
              onClick={() => {
                reset()
                setState({ step: 1 })
                setName('')
                setDescription('')
                setTags([])
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

// ── Sub-components ────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Select file' },
    { n: 2, label: 'Details' },
    { n: 3, label: 'Upload' },
  ]
  return (
    <div className='flex items-center gap-2'>
      {steps.map(({ n, label }, i) => (
        <div key={n} className='flex items-center gap-2'>
          <div className='flex items-center gap-1.5'>
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                n < current && 'bg-indigo-500 text-white',
                n === current && 'bg-indigo-500 text-white ring-2 ring-indigo-400/40',
                n > current && 'bg-slate-700 text-slate-500',
              )}
            >
              {n < current ? <CheckCircle2 className='w-3.5 h-3.5' /> : n}
            </div>
            <span
              className={cn(
                'text-xs hidden sm:block',
                n === current ? 'text-slate-200 font-medium' : 'text-slate-500',
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && <div className='flex-1 h-px bg-slate-700 min-w-[24px]' />}
        </div>
      ))}
    </div>
  )
}

function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string | null
  children: React.ReactNode
}) {
  return (
    <div>
      <div className='flex items-baseline justify-between mb-1.5'>
        <label className='text-sm font-medium text-slate-300'>
          {label}
          {required && <span className='text-red-400 ml-0.5'>*</span>}
        </label>
        {hint && <span className='text-xs text-slate-600'>{hint}</span>}
      </div>
      {children}
      {error && (
        <p className='mt-1.5 text-xs text-red-400 flex items-center gap-1'>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className='flex gap-3'>
      <span className='text-slate-500 shrink-0 w-24'>{label}</span>
      <span className={cn('text-slate-300 break-all', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}
