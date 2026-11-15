'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import styles from '@/styles/components/ArchiveGrid.module.scss'
import { BLUR_DATA_URL } from '@/utils/imageUtils'

type Props = {
  src: string
  /** Libellé accessible (ex. « Open Libul ») */
  label?: string
  /** Reçoit le cadre 4:5 de la vignette (point de départ de la transition) */
  onClick?: (thumbBox: HTMLElement | null) => void
}

export default function ScrollImageItem({ src, label, onClick }: Props) {
  const [isLoaded, setIsLoaded] = useState(false)
  const thumbBoxRef = useRef<HTMLDivElement>(null)
  const open = () => onClick?.(thumbBoxRef.current)

  // Accès clavier : Entrée / Espace ouvrent l'aperçu, comme le clic
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!onClick) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open()
    }
  }

  return (
    <motion.div
      className={styles.gridItem}
      onClick={onClick ? open : undefined}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? label : undefined}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ position: 'relative' }}
    >
      <div ref={thumbBoxRef} className={styles.thumbBox}>
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 1400px) 12vw, (min-width: 900px) 18vw, 32vw"
          className={`${styles.thumb} ${isLoaded ? styles.isLoaded : ''}`}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </motion.div>
  )
}
