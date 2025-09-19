'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import styles from '@/styles/components/Parallaxtext.module.scss'

/** Backward compatible:
 * - imageSrc: string (image ou .gif)
 * - OU videoSrc (+ poster)
 */
type Section =
  | {
      imageSrc: string
      subheading?: string
      heading?: string
      headingColor?: string
      subheadingColor?: string
    }
  | {
      videoSrc: string
      poster?: string
      subheading?: string
      heading?: string
      headingColor?: string
      subheadingColor?: string
    }

interface ParallaxTextProps {
  sections: Section[]
}

export default function ParallaxText({ sections }: ParallaxTextProps) {
  return (
    <div className={styles.wrapper}>
      {sections.map((section, index) => (
        <div key={index} className={styles.section}>
          <div className={styles.parallaxContainer}>
            {'imageSrc' in section ? (
              <StickyMedia imageSrc={section.imageSrc} />
            ) : (
              <StickyMedia videoSrc={section.videoSrc} poster={section.poster} />
            )}

            <OverlayCopy
              heading={section.heading}
              subheading={section.subheading}
              headingColor={section.headingColor}
              subheadingColor={section.subheadingColor}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

type StickyMediaProps =
  | { imageSrc: string; videoSrc?: never; poster?: never }
  | { videoSrc: string; poster?: string; imageSrc?: never }

/** Colle l’image (y compris GIF) en background,
 * ou rend une <video> en full cover. */
const StickyMedia = (props: StickyMediaProps) => {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['end end', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
  const fade = useTransform(scrollYProgress, [0, 1], [1, 0])

  const isImage = 'imageSrc' in props

  return (
    <motion.div
      ref={targetRef}
      className={styles.stickyImage}
      style={{
        // pour les images (y compris .gif), on conserve background-image
        ...(isImage ? { backgroundImage: `url(${props.imageSrc})` } : {}),
        scale,
      }}
    >
      {/* vidéo en couche absolute, quand videoSrc présent */}
      {'videoSrc' in props && (
        <video
          className={styles.media}
          src={props.videoSrc}
          poster={props.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}

      {/* overlay pour le fade out progressif */}
      <motion.div className={styles.fade} style={{ opacity: fade }} />
    </motion.div>
  )
}

interface OverlayCopyProps {
  subheading?: string
  heading?: string
  headingColor?: string
  subheadingColor?: string
}

const OverlayCopy = ({
  subheading,
  heading,
  headingColor = 'white',
  subheadingColor = 'white',
}: OverlayCopyProps) => {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [250, -250])
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0])

  return (
    <motion.div
      ref={targetRef}
      className={styles.overlay}
      style={{ y, opacity }}
    >
      {subheading && <h5 style={{ color: subheadingColor }}>{subheading}</h5>}
      {heading && <h1 style={{ color: headingColor }}>{heading}</h1>}
    </motion.div>
  )
}
