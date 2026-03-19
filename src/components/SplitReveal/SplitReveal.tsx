'use client'

import { motion, useReducedMotion } from 'framer-motion'

type Props = {
  text: string
  className?: string
  delay?: number
  stagger?: number
}

export default function SplitReveal({ text, className, delay = 0, stagger = 0.07 }: Props) {
  const reduceMotion = useReducedMotion()
  const words = text.split(' ')

  if (reduceMotion) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          style={{ display: 'inline-block', marginRight: '0.25em' }}
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{
            duration: 0.6,
            ease: [0.76, 0, 0.24, 1],
            delay: delay + i * stagger,
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}
