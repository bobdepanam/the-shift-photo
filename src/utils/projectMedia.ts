// src/utils/projectMedia.ts
// Réglages partagés des images des pages projet, utilisés par :
// - ProjectPageClient (rendu)
// - ProjectGrid (préchargement au clic sur une vignette)
// Mêmes `sizes` → même srcset → l'image préchargée est réutilisée par la page.

import { getImageProps } from 'next/image'

export type ProjectLayout = 'classic' | 'alt'

const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v|ogv)([?#]|$)/i
const GIF_EXTENSION = /\.gif([?#]|$)/i

/** Garde-fou : une vidéo ne doit jamais passer par next/image (même si le .md la déclare « image ») */
export const isVideoSrc = (src: string) => VIDEO_EXTENSION.test(src)

/**
 * GIF des projets (animés, ex. Craft/Skateboy) : servis tels quels. L'optimiseur Next ne les
 * transforme pas (il renvoie l'original avec un avertissement) ; `unoptimized` évite ce détour.
 */
export const skipOptimizer = (src: string) => GIF_EXTENSION.test(src)

/** Dimensions de repli quand les vraies dimensions sont inconnues */
export const PROJECT_IMAGE_FALLBACK = { width: 1600, height: 1000 }

/**
 * Largeur affichée des images :
 * - classic : colonne médias (flex 2 sur 3) ; pleine largeur en mobile
 * - alt : items "full" sur 2 colonnes, "half" sur 1 ; pleine largeur en mobile
 */
export function projectImageSizes(layout: ProjectLayout, index: number): string {
  if (layout === 'classic') return '(max-width: 768px) 100vw, 66vw'
  // full : plafonné à 1100px (marges 8vh) ; half : demi-largeur
  return index % 3 === 0
    ? '(max-width: 768px) 100vw, (max-width: 1250px) 90vw, 1100px'
    : '(max-width: 768px) 100vw, 50vw'
}

/** Index ciblé par une ancre `#m-<index>`, sinon null */
export function parseMediaHash(hash: string): number | null {
  const match = /^#m-(\d+)$/.exec(hash)
  return match ? Number(match[1]) : null
}

const preloaded = new Set<string>()

/**
 * Lance le téléchargement de l'image ciblée avant/pendant la navigation
 * (une seule image, priorité haute). La page projet s'ouvre en mode classic.
 */
export function preloadProjectImage(src: string, index: number) {
  if (typeof window === 'undefined' || preloaded.has(src) || isVideoSrc(src)) return
  preloaded.add(src)

  const { props } = getImageProps({
    src,
    alt: '',
    ...PROJECT_IMAGE_FALLBACK,
    sizes: projectImageSizes('classic', index),
    unoptimized: skipOptimizer(src),
  })

  const img = new window.Image()
  img.fetchPriority = 'high'
  if (props.sizes) img.sizes = props.sizes
  if (props.srcSet) img.srcset = props.srcSet
  img.src = props.src
}
