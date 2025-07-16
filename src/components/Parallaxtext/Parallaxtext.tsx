'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import styles from '@/styles/components/Parallaxtext.module.scss'

interface Section {
  imageSrc: string
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
            <StickyImage src={section.imageSrc} />
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

interface StickyImageProps {
  src: string
}

const StickyImage = ({ src }: StickyImageProps) => {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['end end', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <motion.div
      ref={targetRef}
      className={styles.stickyImage}
      style={{
        backgroundImage: `url(${src})`,
        scale,
      }}
    >
      <motion.div className="absolute inset-0" style={{ opacity }} />
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
      style={{
        y,
        opacity,
      }}
    >
      <h5 style={{ color: subheadingColor }}>{subheading}</h5>
      <h1 style={{ color: headingColor }}>{heading}</h1>
    </motion.div>
  )
}
