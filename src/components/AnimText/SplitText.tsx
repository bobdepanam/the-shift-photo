'use client'

import React from 'react'
import { motion } from 'framer-motion'

type SplitTextProps = {
  text: string
  delay?: number
  as?: keyof JSX.IntrinsicElements
}

export default function SplitText({ text, delay = 0.05, as = 'p' }: SplitTextProps) {
  const Tag = as

  const letters = text.split('')

  return (
    <Tag aria-label={text}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * delay, duration: 0.3 }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </Tag>
  )
}
