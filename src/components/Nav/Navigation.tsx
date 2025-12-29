'use client'

import styles from '@/styles/components/Navigation.module.scss'
import { useState, type ReactElement } from 'react'
import { motion } from 'framer-motion'
import { height } from '@/scripts/anim'
import Body from '@/components/Nav/Body/Body'
import Subnav from './Subnav/Sub'
import Images from './images/Images'

type LinkItem = {
  title: string
  href: string
  src: string
}

type SelectedLink = {
  isActive: boolean
  index: number
}

type NavigationProps = {
  onClose: () => void
}

const links: LinkItem[] = [
  {
    title: 'index',
    href: '/',
    src: 'tokyo/windows-glow-forever.webp'
  },
  {
    title: 'statement',
    href: '/about',
    src: 'london/moving-even-when-still.webp'
  },
  {
    title: 'commissions',
    href: '/archive',
    src: 'shore/standing-against-nothing.webp'
  },
]

export default function Navigation({ onClose }: NavigationProps): ReactElement {
  const [selectedLink, setSelectedLink] = useState<SelectedLink>({
    isActive: false,
    index: 0
  })

  return (
    <motion.div
      variants={height}
      initial="initial"
      animate="enter"
      exit="exit"
      className={styles.nav}
    >
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <Body
            links={links}
            selectedLink={selectedLink}
            setSelectedLink={setSelectedLink}
            onClose={onClose}
          />
          <Subnav />
        </div>
        <Images
          src={links[selectedLink.index].src}
          isActive={selectedLink.isActive}
        />
      </div>
    </motion.div>
  )
}
