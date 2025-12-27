'use client'

import { useState, type ReactElement } from 'react'
import ProjectGrid from './ProjectGrid'
import type { Project } from './ProjectGrid'

type Props = {
  projects: Project[]
  /** Permet de forcer un layout initial si besoin (par défaut "alt") */
  defaultLayout?: 'default' | 'alt'
  showFilters?: boolean
}

export default function ProjectGridWrapper({
  projects,
  defaultLayout = 'alt',
  showFilters,
}: Props): ReactElement {
  // Layout géré ici, le toggle est passé à ProjectGrid (un seul ViewToggle dans l'UI)
  const [layout, setLayout] = useState<'default' | 'alt'>(defaultLayout)

  const handleToggleLayout = () =>
    setLayout((prev) => (prev === 'default' ? 'alt' : 'default'))

  return (
    <ProjectGrid
      projects={projects}
      layout={layout}
      onToggleLayout={handleToggleLayout}
      showFilters={showFilters}
    />
  )
}
