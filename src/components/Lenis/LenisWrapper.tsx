'use client'

import { useEffect } from 'react'
import { initLenis } from '@/utils/lenis'

export default function LenisWrapper() {
  useEffect(() => {
    const lenisInstance = initLenis()

    return () => lenisInstance.destroy()
  }, [])

  return null
}
