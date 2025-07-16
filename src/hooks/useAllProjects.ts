'use client' // <-- Ajoute cette ligne en haut du fichier

// src/hooks/useAllProjects.ts
import { useEffect, useState } from 'react'

export type MediaItem = {
  type: 'image' | 'video'
  src: string
}

export type Project = {
  title: string
  slug: string
  category: string
  media: MediaItem[]
  content: string
}

export const useAllProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }
        const data = await response.json()
        setProjects(data)
      } catch {
        setError('Error loading projects') // Erreur sans utiliser 'err'
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return { projects, loading, error }
}
