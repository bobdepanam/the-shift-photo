import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Media } from '@/types/project'
import styles from '@/styles/components/ArchivePreviewOverlay.module.scss'
import { BLUR_DATA_URL } from '@/utils/imageUtils'
import { getLenis } from '@/utils/lenisInstance'

type Props = {
  image: Media
  onClose: () => void
  onNext: () => void
}

export default function ArchivePreviewOverlay({ image, onClose, onNext }: Props) {
  // Ref pour ne pas relancer l'effet à chaque rendu du parent (onClose est une closure inline)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    // 🔒 Blocage du scroll : overflow natif + arrêt de Lenis (qui scrolle via window.scrollTo)
    const lenis = getLenis()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    lenis?.stop()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      lenis?.start()
    }
  }, [])

  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onNext()
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={onClose}
        className={styles.closeButton}
        aria-label="Close"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        ×
      </motion.button>
      <motion.div
        onClick={handleBackdropClick}
        className={styles.overlay}
        aria-modal="true"
        role="dialog"
        data-lenis-prevent
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.div
          className={styles.mediaWrapper}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 6 }}
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
        >
          <Image
            src={image.src}
            alt=""
            width={1200}
            height={1200}
            sizes="(min-width: 1280px) 90vw, 100vw"
            className={styles.media}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        </motion.div>
      </motion.div>
    </>
  )
}
