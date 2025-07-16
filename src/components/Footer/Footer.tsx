'use client'

import { ReactElement } from 'react'
import Content from './Content'
import styles from '@/styles/components/Footer.module.scss'

export default function Footer(): ReactElement {
  return (
    <div className={styles.footerWrapper}>
      <div className={styles.footerStickyContainer}>
        <div className={styles.footerStickyContent}>
          <Content />
        </div>
      </div>
    </div>
  )
}
