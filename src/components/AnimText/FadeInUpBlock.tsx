// src/components/FadeInUpBlock.tsx
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function FadeInUpBlock({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </motion.div>
  )
}
