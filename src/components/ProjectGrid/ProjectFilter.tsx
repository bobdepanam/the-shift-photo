'use client'

import styles from '@/styles/components/ProjectFilters.module.scss'
import { motion } from 'framer-motion'

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

const filterVariants = {
  hidden: {
    opacity: 0,
    y: -10
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.76, 0, 0.24, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: [0.76, 0, 0.24, 1]
    }
  }
}

export default function ProjectFilter({ activeCategory, onSelect }: Props) {
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
