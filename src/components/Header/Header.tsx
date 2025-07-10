'use client'

import styles from '@/styles/components/Header.module.scss'
import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { opacity, background } from '@/scripts/anim'
import Navigation from '@/components/Nav/Navigation'
import DarkToggle from '@/components/DarkToggle/DarkToggle'

export default function Header(): JSX.Element {
  const [isActive, setIsActive] = useState<boolean>(false)

  return (
    <div className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.sideLeft}>
          <Link href="/">The Shift</Link>
        </div>

        <div className={styles.center}>
          <div
            onClick={() => setIsActive(!isActive)}
            className={styles.el}
            role="button"
            aria-label="Toggle menu"
          >
            <div
              className={`${styles.burger} ${
                isActive ? styles.burgerActive : ''
              }`}
            ></div>
            <div className={styles.label}>
              <motion.p variants={opacity} animate={!isActive ? 'open' : 'closed'} />
              <motion.p variants={opacity} animate={isActive ? 'open' : 'closed'} />
            </div>
          </div>
        </div>

        <div className={styles.sideRight}>
          <DarkToggle />
        </div>
      </div>

      <motion.div
        variants={background}
        initial="initial"
        animate={isActive ? 'open' : 'closed'}
        className={styles.background}
      ></motion.div>

<AnimatePresence mode="wait">
  {isActive && <Navigation onClose={() => setIsActive(false)} />}
</AnimatePresence>
    </div>
  )
}
