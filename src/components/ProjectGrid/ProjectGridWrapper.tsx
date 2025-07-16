'use client'

import { useState } from 'react'
import ProjectGrid from './ProjectGrid'
import type { Project } from './ProjectGrid'
import ViewToggle from '@/components/ViewToggle/ViewToggle'

type Props = {
  projects: Project[]
}

export default function ProjectGridWrapper({ projects }: Props) {
  const [layout, setLayout] = useState<'default' | 'alt'>('default')

  const toggleLayout = () => {
    setLayout(prev => (prev === 'default' ? 'alt' : 'default'))
  }

  return (
    <>
      <ProjectGrid projects={projects} layout={layout} onToggleLayout={toggleLayout} />
      <ViewToggle layout={layout} onToggleLayout={toggleLayout} />
    </>
  )
}
