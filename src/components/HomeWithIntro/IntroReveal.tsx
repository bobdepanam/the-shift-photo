'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '@/styles/components/IntroReveal.module.scss'
import { translate } from '@/scripts/anim'

const images = [
  '/images/london/london_1.jpg',
  '/images/london/london_2.jpg',
  '/images/london/london_3.jpg',
  '/images/london/london_4.jpg',
  '/images/london/london_5.jpg',
  '/images/london/london_6.jpg',
  '/images/london/london_7.jpg',
  '/images/london/london_8.jpg',
  '/images/london/london_9.jpg',
]

type IntroRevealProps = {
  onComplete: () => void
}

export default function IntroReveal({ onComplete }: IntroRevealProps) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'images' | 'text' | 'slide'>('images')

  useEffect(() => {
    if (phase === 'images') {
      if (index < images.length - 1) {
        const timer = setTimeout(() => setIndex(i => i + 1), 300)
        return () => clearTimeout(timer)
      } else {
        const showText = setTimeout(() => setPhase('text'), 500)
        return () => clearTimeout(showText)
      }
    }

    if (phase === 'text') {
      const startSlide = setTimeout(() => setPhase('slide'), 1200)
      return () => clearTimeout(startSlide)
    }

    if (phase === 'slide') {
      const revealHome = setTimeout(() => onComplete(), 1200)
      return () => clearTimeout(revealHome)
    }
  }, [index, phase, onComplete])

  return (
    <AnimatePresence>
      {phase !== 'slide' && (
        <motion.div
          className={styles.introWrapper}
          variants={translate}
          initial="initial"
          animate="enter"
          exit="exit"
          custom={[0, 0]} // slide-up à la fin
        >
          {phase === 'images' && (
            <motion.img
              key={index}
              src={images[index]}
              alt="Intro"
              className={styles.introImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {phase === 'text' && (
            <motion.h1
              key="text"
              className={styles.introText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            >
              {'{ The Shift }'}
            </motion.h1>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
