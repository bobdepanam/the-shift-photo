'use client'

import styles from '@/styles/components/Header.module.scss'
import Link from 'next/link'
import { useState, useLayoutEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { opacity, background } from '@/scripts/anim'
import Navigation from '@/components/Nav/Navigation'
import DarkToggle from '@/components/DarkToggle/DarkToggle'
import type { ReactElement } from 'react'

/** Seuil de scroll (px) au-delà duquel la signature passe de « the shift » à « s. » */
const SIGNATURE_COMPACT_AT = 100

export default function Header(): ReactElement {
  const [isActive, setIsActive] = useState<boolean>(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    // Un seul écouteur (existant) : fond du header + signature « the shift » → « s. »
    const sync = () => {
      const el = headerRef.current
      if (!el) return
      const y = window.scrollY
      el.dataset.scrolled = y > 10 ? 'true' : 'false'
      el.dataset.compact = y > SIGNATURE_COMPACT_AT ? 'true' : 'false'
    }

    // État initial posé avant le premier affichage : aucune transition au chargement
    sync()

    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        sync()
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
          {/* Signature : les deux libellés partagent la même cellule → largeur fixe, aucun décalage */}
          <Link href="/" className={styles.signature} aria-label="the shift — home">
            <span className={styles.signatureFull} aria-hidden="true">
              the shift
            </span>
            <span className={styles.signatureShort} aria-hidden="true">
              s.
            </span>
          </Link>
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
