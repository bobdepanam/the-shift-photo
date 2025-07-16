// components/Breadcrumb/Breadcrumb.tsx
'use client'

import styles from '@/styles/components/Breadcrumb.module.scss'
import Link from 'next/link'

type BreadcrumbProps = {
  path: string[]
}

export default function Breadcrumb({ path }: BreadcrumbProps) {
  return (
    <div className={styles.breadcrumb}>
      <Link href="/">index</Link>
      {path.map((segment, index) => (
        <span key={index}>
          <span>.</span>
          <span>{segment}</span>
        </span>
      ))}
    </div>
  )
}
