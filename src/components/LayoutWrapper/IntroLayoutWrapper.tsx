
'use client'

import { useEffect, useState } from 'react'
import IntroReveal from '../HomeWithIntro/IntroReveal'

export default function IntroLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('intro-seen')) {
      setReady(true)
    }
    setChecked(true)
  }, [])

  const handleComplete = () => {
    sessionStorage.setItem('intro-seen', '1')
    setReady(true)
  }

  return (
    <>
      {checked && !ready && <IntroReveal onComplete={handleComplete} />}
      {ready && children}
    </>
  )
}
