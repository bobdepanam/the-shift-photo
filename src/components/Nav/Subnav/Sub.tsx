'use client'

import styles from '@/styles/components/Sub.module.scss'
import { translate } from '@/scripts/anim'
import { motion } from 'framer-motion'
import React, { type ReactElement } from 'react'

export default function Subnav(): ReactElement {
  return (
    <div className={styles.footer}>
      <ul>
        <motion.li
          custom={[0.3, 0]}
          variants={translate}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <span>The</span>Shift
        </motion.li>
      </ul>

      <ul>
        <motion.li
          custom={[0.3, 0]}
          variants={translate}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <span>Art</span>Director
        </motion.li>
      </ul>

      <ul>
        <motion.li
          custom={[0.3, 0]}
          variants={translate}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          360°
        </motion.li>
      </ul>

      <ul>
        <motion.li
          custom={[0.3, 0]}
          variants={translate}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <span>inst</span> bastardz.paris
        </motion.li>
        {/* <motion.li
          custom={[0.3, 0]}
          variants={translate}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          Terms & Conditions
        </motion.li> */}
      </ul>
    </div>
  )
}
