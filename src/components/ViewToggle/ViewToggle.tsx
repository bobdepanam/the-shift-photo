'use client'

import styles from '@/styles/components/ViewToggle.module.scss'
import GridIcon from '@/icons/grid.svg'
import ListIcon from '@/icons/list.svg'

interface ViewToggleProps {
  onToggleLayout: () => void
  layout: 'default' | 'alt'
}

export default function ViewToggle({ onToggleLayout, layout }: ViewToggleProps) {
  return (
    <div className={styles.viewToggleContainer}>
      <button
        className={`${styles.toggleButton} ${layout === 'alt' ? styles.active : ''}`}
        onClick={onToggleLayout}
        aria-label="Liste view"
      >
        <ListIcon />
      </button>
      <button
        className={`${styles.toggleButton} ${layout === 'default' ? styles.active : ''}`}
        onClick={onToggleLayout}
        aria-label="Grille view"
      >
        <GridIcon />
      </button>
    </div>
  )
}
