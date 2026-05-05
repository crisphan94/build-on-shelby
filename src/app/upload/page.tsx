import { UploadWizard } from '@/components/dataset/UploadWizard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upload Dataset — DataShelf',
  description: 'Upload your AI training dataset to Shelby decentralized storage.',
}

export default function UploadPage() {
  return <UploadWizard />
}
