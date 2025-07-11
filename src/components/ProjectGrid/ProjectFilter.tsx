'use client'

import styles from '@/styles/components/ProjectFilters.module.scss'
import { motion, Variants } from 'framer-motion'

const categories = [
  'all',
  'bastardz',
  'photography',
  'custom',
  'theshift'
]

type Props = {
  activeCategory: string
  onSelect: (category: string) => void
}

// ✅ Easing cubic bezier typé correctement
const easing: [number, number, number, number] = [0.76, 0, 0.24, 1]

// ✅ Typage explicite des variants pour éviter les erreurs TS
const filterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easing
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: easing
    }
  }
}

export default function ProjectFilter({ activeCategory, onSelect }: Props): JSX.Element {
  return (
    <motion.div
      className={styles.filters}
      variants={filterVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`${styles.filterBtn} ${
            activeCategory === cat ? styles.active : ''
          }`}
        >
          {cat}
        </button>
      ))}
    </motion.div>
  )
}
