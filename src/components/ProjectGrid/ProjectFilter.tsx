'use client'

import styles from '@/styles/components/ProjectFilters.module.scss'
import { motion, Variants } from 'framer-motion'
import type { FC } from 'react'

type Props = {
  activeCategory: string
  onSelect: (category: string) => void
  /** Liste déjà filtrée + ordonnée (incluant 'all') */
  categories: string[]
}

const easing: [number, number, number, number] = [0.76, 0, 0.24, 1]

const filterVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easing },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3, ease: easing },
  },
}

const ProjectFilter: FC<Props> = ({ activeCategory, onSelect, categories }) => {
  return (
    <motion.div
      className={styles.filters}
      variants={filterVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      aria-label="Filtres de projets"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={`${styles.filterBtn} ${isActive ? styles.active : ''}`}
            aria-pressed={isActive}   // ✅ bouton toggle accessible, pas de rôle "tab"
          >
            {cat}
          </button>
        )
      })}
    </motion.div>
  )
}

export default ProjectFilter
