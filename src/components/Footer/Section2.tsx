// components/Footer/Section2.tsx
import React from 'react'
import styles from '@/styles/components/Footer.module.scss'

export default function Section2(): JSX.Element {
  return (
    <div className={styles.section2}>
      <h1 className={styles.footerTitle}>The Shift</h1>
      <p className={styles.footerCopyright}>©BSTRDZ</p>
    </div>
  )
}