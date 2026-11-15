// next.config.js
/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Les fichiers de public/ sont servis par le CDN : aucune fonction serverless n'en a besoin.
    // Sans cette exclusion, la lecture des dimensions (utils/imageSize) faisait embarquer
    // tout public/ (~600 Mo) dans les fonctions → dépassement de la limite Vercel (250 Mo).
    outputFileTracingExcludes: {
      '**': ['public/**/*'],
    },
  },
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
