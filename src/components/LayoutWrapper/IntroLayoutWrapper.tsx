
'use client'

import { useState } from 'react'
import IntroReveal from '../HomeWithIntro/IntroReveal'

export default function IntroLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  return (
    <>
      {!ready && <IntroReveal onComplete={() => setReady(true)} />}
      {ready && children}
    </>
  )
}
