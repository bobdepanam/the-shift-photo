'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/components/HoverInfo.module.scss'

type Info = { title?: string; category?: string }
type Pos = { x: number; y: number }

export default function HoverInfo({
  info,
  position,
}: {
  info: Info | null
  position: Pos | null
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({ left: -9999, top: -9999 })
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!info || !position || isMobile) return
    if (raf.current) cancelAnimationFrame(raf.current)

    raf.current = requestAnimationFrame(() => {
      const pad = 16
      const vw = window.innerWidth
      const vh = window.innerHeight
      const estW = 240 // estimation pour empêcher le débordement
      const estH = 72

      let left = position.x + pad
      let top = position.y + pad
      if (left + estW > vw - 8) left = vw - estW - 8
      if (top + estH > vh - 8) top = vh - estH - 8

      setStyle({ left, top })
    })

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [info, position, isMobile])

  if (!info || !position || isMobile) return null

  return (
    <div className={styles.tooltip} style={style} aria-hidden="true">
      {info.title ? <strong className={styles.title}>{info.title}</strong> : null}
      {info.category ? <span className={styles.category}>{info.category}</span> : null}
    </div>
  )
}
