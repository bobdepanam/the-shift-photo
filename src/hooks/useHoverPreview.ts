// src/hooks/useHoverPreview.ts
import { useEffect, useState } from 'react'

type Media = {
  type: 'image' | 'video'
  src: string
}

export default function useHoverPreview() {
  const [media, setMedia] = useState<Media | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const previewWidth = 300
      const previewHeight = 300
      const padding = 20

      const isNearRight = e.clientX > window.innerWidth - previewWidth - padding
      const isNearBottom = e.clientY > window.innerHeight - previewHeight - padding

      const newX = isNearRight ? e.clientX - previewWidth - padding : e.clientX + padding
      const newY = isNearBottom ? e.clientY - previewHeight - padding : e.clientY + padding

      setPosition({ x: newX, y: newY })
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    document.addEventListener('mousemove', handleMove)
    window.addEventListener('resize', handleResize)

    handleResize()

    return () => {
      document.removeEventListener('mousemove', handleMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    media,
    position,
    isMobile,
    setMedia,
    clearMedia: () => setMedia(null),
  }
}
