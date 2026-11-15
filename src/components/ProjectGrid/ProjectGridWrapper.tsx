'use client'

import { useState, type ReactElement } from 'react'
import ProjectGrid from './ProjectGrid'
import type { Project } from './ProjectGrid'
import { peekHomeRestore } from '@/utils/returnContext'

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
  // Retour CLOSE depuis une page projet : état de la grille à restaurer (sinon null).
  // Lecture non destructive ; ProjectGrid efface la restauration une fois appliquée.
  // NB : ce composant n'est rendu que côté client (IntroLayoutWrapper), pas de risque d'hydratation.
  const [restore] = useState(() => peekHomeRestore())

  // Layout géré ici, le toggle est passé à ProjectGrid (un seul ViewToggle dans l'UI)
  const [layout, setLayout] = useState<'default' | 'alt'>(restore?.layout ?? defaultLayout)

  const handleToggleLayout = () =>
    setLayout((prev) => (prev === 'default' ? 'alt' : 'default'))

  return (
    <ProjectGrid
      projects={projects}
      layout={layout}
      onToggleLayout={handleToggleLayout}
      showFilters={showFilters}
      restore={restore}
    />
  )
}
