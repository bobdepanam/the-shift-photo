// src/components/Slow/Description/description.tsx
'use client'

import styles from '@/styles/components/Description.module.scss'
import Image from 'next/image'

type DescriptionProps = {
  imageSrc: string
  title: string
  text: string
  textColor?: string // ← nouvelle prop optionnelle
}

export default function Description({ imageSrc, title, text, textColor = '#000' }: DescriptionProps) {
  return (
    <section className={styles.descriptionWrapper}>
      <div className={styles.descriptionBackground}>
        <div className="imageWrapper">
          <Image src={imageSrc} alt="Background" fill style={{ objectFit: 'cover' }} />
        </div>
      </div>

      <div className={styles.descriptionContent}>
        <h2 className={styles.descriptionTitle} style={{ color: textColor }}>
          {title}
        </h2>
        <p className={styles.descriptionText} style={{ color: textColor }}>
          {text}
        </p>
      </div>
    </section>
  )
}
