'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { triggerTransitionIn } from './PixelTransition'

type Props = {
  href: string
  children: ReactNode
  className?: string
}

export default function TransitionLink({ href, children, className }: Props) {
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    await triggerTransitionIn?.()
    router.push(href)
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}
