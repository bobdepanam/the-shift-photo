// next.config.js
/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig
