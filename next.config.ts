import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16; WASM is supported natively.
  // Setting turbopack: {} silences the "webpack config present" warning.
  turbopack: {},
}

export default nextConfig
