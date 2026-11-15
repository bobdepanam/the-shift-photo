// src/utils/imageSize.ts
// Server-only : lit les dimensions d'une image de /public depuis son en-tête
// (WebP, PNG, JPEG, GIF), sans dépendance. Sert à réserver le bon ratio
// dans l'aperçu Commissions avant le chargement de l'image.

import fs from 'fs'
import path from 'path'

export type ImageSize = { width: number; height: number }

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const HEADER_BYTES = 64 * 1024

function parse(b: Buffer): ImageSize | null {
  // PNG
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47) {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }
  }

  // GIF
  if (b.length >= 10 && b.toString('ascii', 0, 3) === 'GIF') {
    return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) }
  }

  // WebP
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16)
    if (chunk === 'VP8X') {
      return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) }
    }
    if (chunk === 'VP8 ') {
      return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff }
    }
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21)
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
    }
    return null
  }

  // JPEG : parcours des segments jusqu'au SOF
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i++
        continue
      }
      const marker = b[i + 1]
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) }
      }
      i += 2 + b.readUInt16BE(i + 2)
    }
  }

  return null
}

/** Dimensions d'une image publique (`/images/...`), ou null si illisible. */
export function getPublicImageSize(src: string): ImageSize | null {
  try {
    const filePath = path.join(PUBLIC_DIR, decodeURI(src))
    if (!filePath.startsWith(PUBLIC_DIR)) return null

    const fd = fs.openSync(filePath, 'r')
    try {
      const buffer = Buffer.alloc(HEADER_BYTES)
      const read = fs.readSync(fd, buffer, 0, HEADER_BYTES, 0)
      return parse(buffer.subarray(0, read))
    } finally {
      fs.closeSync(fd)
    }
  } catch {
    return null
  }
}
