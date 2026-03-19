'use client'

import styles from '@/styles/components/Header.module.scss'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { opacity, background } from '@/scripts/anim'
import Navigation from '@/components/Nav/Navigation'
import DarkToggle from '@/components/DarkToggle/DarkToggle'
import type { ReactElement } from 'react'

export default function Header(): ReactElement {
  const [isActive, setIsActive] = useState<boolean>(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const el = headerRef.current
        if (el) el.dataset.scrolled = window.scrollY > 10 ? 'true' : 'false'
        rafRef.current = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={headerRef} className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.sideLeft}>
                    <Link href="/">S</Link>

        </div>

        <div className={styles.center}>
<div
            onClick={() => setIsActive(!isActive)}
            className={styles.el}
            role="button"
            aria-label="Toggle menu">
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
