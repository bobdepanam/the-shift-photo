// next.config.ts

import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    // Permet d'importer des fichiers SCSS depuis 'src/styles' sans chemins relatifs
    includePaths: [path.resolve('./src/styles')],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    return config
  },
}

export default nextConfig
