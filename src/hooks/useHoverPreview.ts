'use client'

import { useCallback, useRef, useState } from 'react'
import type React from 'react'

type HoverItem = {
  mediaType: string
  src?: string
  title?: string
  category?: string
}

export function useHoverPreview(enabled: boolean) {
  const [hoverInfo, setHoverInfo] = useState<{ title?: string; category?: string } | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [hoverSrc, setHoverSrc] = useState<string | null>(null)
  const mousePosRef = useRef<{ x: number; y: number } | null>(null)
  const rafMouseRef = useRef<number | null>(null)

  const onEnter = useCallback((item: HoverItem) => {
    if (!enabled || item.mediaType === 'spacer') return
    setHoverSrc(item.src ?? null)
    setHoverInfo({ title: item.title, category: item.category })
  }, [enabled])

  const onLeave = useCallback(() => {
    if (!enabled) return
    setHoverSrc(null)
    setHoverInfo(null)
  }, [enabled])

  const onMove: React.MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    if (!enabled) return
    mousePosRef.current = { x: e.clientX, y: e.clientY }
    if (rafMouseRef.current) return
    rafMouseRef.current = requestAnimationFrame(() => {
      setMousePos(mousePosRef.current)
      rafMouseRef.current = null
    })
  }, [enabled])

  return { hoverInfo, mousePos, hoverSrc, onEnter, onLeave, onMove }
}
