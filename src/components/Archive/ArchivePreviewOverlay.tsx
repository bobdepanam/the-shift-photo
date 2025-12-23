import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Media } from '@/types/project'
import styles from '@/styles/components/ArchivePreviewOverlay.module.scss'

type Props = {
  image: Media
  onClose: () => void
  onNext: () => void
}

export default function ArchivePreviewOverlay({ image, onClose, onNext }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onNext()
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className={styles.closeButton}
        aria-label="Close"
      >
        ×
      </button>
      <div
        onClick={handleBackdropClick}
        className={`${styles.overlay} ${visible ? styles.visible : ''}`}
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.mediaWrapper}>
          <Image
            src={image.src}
            alt=""
            width={1200}
            height={1200}
            sizes="(min-width: 1280px) 90vw, 100vw"
            className={styles.media}
            unoptimized
          />
        </div>
      </div>
    </>
  )
}
