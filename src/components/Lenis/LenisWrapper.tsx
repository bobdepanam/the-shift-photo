'use client'

import { useEffect } from 'react'
import { destroyLenis, initLenis } from '@/utils/lenis'

export default function LenisWrapper() {
  useEffect(() => {
    initLenis()

    return () => destroyLenis()
  }, [])

  return null
}
