'use client'

import styles from '@/styles/components/DarkToggle.module.scss'
import SwitchDark from '@/icons/Switch_dark.svg'
import SwitchWhite from '@/icons/Switch_white.svg'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

export default function DarkToggle() {
  const { theme, toggleTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <button onClick={toggleTheme} className={styles.toggle} aria-label="Toggle dark mode">
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="dark"
            initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 0, scale: 0.9 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
          >
            <SwitchDark />
          </motion.div>
        ) : (
          <motion.div
            key="light"
            initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 0, scale: 0.9 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
          >
            <SwitchWhite />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
