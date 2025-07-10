'use client'

import { motion, MotionProps } from 'framer-motion'
import { ElementType } from 'react'

interface SplitTextProps {
  text: string
  delay?: number
  as?: keyof JSX.IntrinsicElements
}

export default function SplitText({ text, delay = 0.05, as = 'p' }: SplitTextProps) {
  const Tag = motion[as as keyof typeof motion] as ElementType<MotionProps>
  const words = text.split(' ')

  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: delay,
          },
        },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
          variants={{
            hidden: { opacity: 0, y: '100%' },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  )
}
