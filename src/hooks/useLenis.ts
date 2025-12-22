'use client'

import { useEffect } from 'react'
import { destroyLenis, initLenis } from '@/utils/lenis'

export default function useLenis() {
  useEffect(() => {
    const lenis = initLenis()

    return () => {
      destroyLenis()
    }
  }, [])
}
