'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

type Props = {
  href: string
  children: ReactNode
  className?: string
}

export default function TransitionLink({ href, children, className }: Props) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    // Lance la transition pixel si visible
    const pixel = document.querySelector('.' + 'pixelBackground') as HTMLElement
    if (pixel) {
      pixel.style.zIndex = '9999'
      pixel.style.opacity = '1'
    }

    const page = document.getElementById('pageContent')
    if (page) {
      page.classList.remove('page-visible')
      page.classList.add('page-hidden')
    }

    // Attend que la transition joue
    setTimeout(() => {
      router.push(href)
    }, 800)
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}
