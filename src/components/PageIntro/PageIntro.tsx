// src/components/PageIntro/PageIntro.tsx
import styles from '@/styles/components/PageIntro.module.scss'

type PageIntroProps = {
  title: string
  subtitle?: string
}

export default function PageIntro({ title, subtitle }: PageIntroProps): JSX.Element {
  return (
    <div className={styles.pageIntro}>
      <h1>{title}</h1>
      {subtitle && <p dangerouslySetInnerHTML={{ __html: subtitle }} />}
    </div>
  )
}

