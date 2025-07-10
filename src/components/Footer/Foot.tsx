// components/Footer/Foot.tsx
import React from 'react'
import styles from '@/styles/components/Footer.module.scss'
import Link from 'next/link'

export default function Foot(): JSX.Element {
  return (
    <div className={styles.footContainer}>
      <div className={styles.footColumn}>
        <h3 className={styles.footTitle}></h3>
        <Link href="/archive">Archive</Link>
      </div>
      <div className={styles.footColumn}>
        <h3 className={styles.footTitle}></h3>
        <Link href="mailto:hello@bastardz.fr">hello@bastardz.fr</Link>
      </div>
    </div>
  )
}
