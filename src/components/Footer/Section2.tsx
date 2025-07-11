// components/Footer/Section2.tsx
import { ReactElement } from 'react'
import styles from '@/styles/components/Footer.module.scss'

export default function Section2(): ReactElement {
  return (
    <div className={styles.section2}>
      <h1 className={styles.footerTitle}>The Shift</h1>
      <p className={styles.footerCopyright}>©BSTRDZ</p>
    </div>
  )
}
