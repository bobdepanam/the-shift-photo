// src/components/PageIntro/PageIntro.tsx
import { type ReactElement } from 'react'
import styles from '@/styles/components/PageIntro.module.scss'

type PageIntroProps = {
  title: string
  subtitle?: string
}

export default function PageIntro({ title, subtitle }: PageIntroProps): ReactElement {
  return (
    <div className={styles.pageIntro}>
      <h1>{title}</h1>
      {subtitle && <p dangerouslySetInnerHTML={{ __html: subtitle }} />}
    </div>
  )
}
