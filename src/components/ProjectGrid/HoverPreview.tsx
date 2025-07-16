// src/components/HoverPreview.tsx
'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '@/styles/components/HoverPreview.module.scss'

type Media = {
  type: 'image' | 'video'
  src: string
}

type Position = {
  x: number
  y: number
}

type HoverPreviewProps = {
  media: Media | null
  position: Position
}

export default function HoverPreview({ media, position }: HoverPreviewProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!media || isMobile) return null

  const previewStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`
  }

  return media.type === 'image' ? (
    <Image
      src={media.src}
      alt="Preview"
      width={400}
      height={500}
      className={styles.preview}
      style={previewStyle}
    />
  ) : (
    <video
      src={media.src}
      muted
      autoPlay
      loop
      playsInline
      className={styles.preview}
      style={previewStyle}
    />
  )
}
