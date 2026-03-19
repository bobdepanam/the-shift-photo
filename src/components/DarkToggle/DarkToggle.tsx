'use client'

import { useState } from 'react'
import styles from '@/styles/components/DarkToggle.module.scss'
import SwitchDark from '@/icons/Switch_dark.svg'
import SwitchWhite from '@/icons/Switch_white.svg'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

export default function DarkToggle() {
  const { theme, toggleTheme } = useTheme()
  const [rippleKey, setRippleKey] = useState(0)

  const isDark = theme === 'dark'

  const handleToggle = () => {
    setRippleKey(k => k + 1)
    toggleTheme()
  }

  return (
    <button onClick={handleToggle} className={styles.toggle} aria-label="Toggle dark mode">
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="dark"
            initial={{ opacity: 0, rotate: -180, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 180, scale: 0.8 }}
            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
          >
            <SwitchDark />
          </motion.div>
        ) : (
          <motion.div
            key="light"
            initial={{ opacity: 0, rotate: -180, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 180, scale: 0.8 }}
            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
          >
            <SwitchWhite />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rippleKey > 0 && (
          <motion.span
            key={rippleKey}
            className={styles.ripple}
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 22, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>
    </button>
  )
}
