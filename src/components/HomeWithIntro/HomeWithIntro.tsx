// src/components/Intro/HomeWithIntro.tsx
'use client'

import { useState } from 'react'
import IntroReveal from '@/components/HomeWithIntro/IntroReveal'

export default function HomeWithIntro({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(false)

  return (
    <>
      {!introDone && <IntroReveal onComplete={() => setIntroDone(true)} />}
      {introDone && children}
    </>
  )
}
