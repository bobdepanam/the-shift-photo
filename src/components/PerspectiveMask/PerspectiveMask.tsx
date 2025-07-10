'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import styles from '@/styles/components/PerspectiveMask.module.scss'
import Image from 'next/image'
import MaskVideo from './MaskVideo'

type PerspectiveMaskProps = {
  initialImage: string
  title?: string
  description?: string
}

export default function PerspectiveMask({
  initialImage,
  title,
  description,
}: PerspectiveMaskProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [showMask, setShowMask] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const containerTop = containerRef.current.getBoundingClientRect().top
      setShowMask(containerTop <= 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className={styles.main}>
      <div ref={containerRef} className={styles.container}>
        {/* 🖼 Étape 1 : Image + texte */}
        <motion.div
          className={styles.initialImage}
          initial={{ opacity: 1 }}
          animate={{ opacity: showMask ? 1 : 1 }}
          transition={{ duration: 1 }}
        >
          <Image
            src={initialImage}
            alt="Initial visual"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          {title && <AnimatedText className={styles.title}>{title}</AnimatedText>}
          {description && (
            <AnimatedText className={styles.description}>{description}</AnimatedText>
          )}
        </motion.div>

        {/* 🎥 Étape 2 : Vidéo masquée */}
        {showMask && (
          <div className={styles.maskWrapper}>
            <MaskVideo src="/images/video/TTSxBSTRDZ.mp4" />
          </div>
        )}
      </div>
    </main>
  )
}

// 🔠 Texte animé au scroll
type AnimatedTextProps = {
  children: ReactNode
  className?: string
}

const AnimatedText = ({ children, className = '' }: AnimatedTextProps) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0])

  return (
    <motion.div ref={ref} style={{ y, opacity }} className={className}>
      {children}
    </motion.div>
  )
}
