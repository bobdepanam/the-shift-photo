'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from '@/styles/components/HoverInfo.module.scss'

type Info = { title?: string; category?: string }
type Pos = { x: number; y: number }

export default function HoverInfo({
  info,
  position,
  src,
}: {
  info: Info | null
  position: Pos | null
  src?: string | null
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
    if ((!info && !src) || !position || isMobile) return
    if (raf.current) cancelAnimationFrame(raf.current)

    raf.current = requestAnimationFrame(() => {
      const pad = 16
      const vw = window.innerWidth
      const vh = window.innerHeight
      const estW = src ? 380 : 240 // estimation pour empêcher le débordement
      const estH = src ? 300 : 72

      let left = position.x + pad
      let top = position.y + pad
      if (left + estW > vw - 8) left = vw - estW - 8
      if (top + estH > vh - 8) top = vh - estH - 8

      setStyle({ left, top })
    })

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [info, position, isMobile, src])

  if ((!info && !src) || !position || isMobile) return null

  return (
    <div className={styles.tooltip} style={style} aria-hidden="true">
      {src ? (
        <div className={styles.preview}>
          <Image
              src={src}
              alt=""
              width={380}
              height={300}
              className={styles.previewImg}
              style={{ objectFit: 'cover' }}
              sizes="380px"
            />
        </div>
      ) : (
        <>
          {info?.title ? <strong className={styles.title}>{info.title}</strong> : null}
          {info?.category ? <span className={styles.category}>{info.category}</span> : null}
        </>
      )}
    </div>
  )
}
