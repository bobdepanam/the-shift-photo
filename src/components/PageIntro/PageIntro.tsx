// src/components/PageIntro/PageIntro.tsx
import { type ReactElement, type ReactNode } from 'react'
import styles from '@/styles/components/PageIntro.module.scss'

type PageIntroProps = {
  title: string
  subtitle?: ReactNode
  breadcrumb?: string
  meta?: string
}

export default function PageIntro({ title, subtitle, breadcrumb, meta }: PageIntroProps): ReactElement {
  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.left}>
          <h1>{title}</h1>
          {meta ? <p className={styles.meta}>{meta}</p> : null}
        </div>
        <div className={styles.right}>
          {breadcrumb ? <p className={styles.breadcrumb}>{breadcrumb}</p> : null}
          {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
        </div>
      </div>
    </div>
  )
}
