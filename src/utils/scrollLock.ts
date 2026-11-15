// src/utils/scrollLock.ts
// Verrouillage de la page pendant un overlay plein écran :
// - scroll bloqué (overflow natif + Lenis stoppé), position mémorisée puis restaurée
// - le reste de la page passe en `inert` (ni focus, ni clavier, ni clic)
// Compteur de verrous : un overlay qui se ferme ne débloque jamais la page
// tant qu'un autre verrou est actif (ouvertures / fermetures répétées).

import { getLenis } from './lenisInstance'

let lockCount = 0
let savedScrollY = 0
let previousOverflow = ''
let inertedElements: HTMLElement[] = []

/** Attribut posé sur la racine d'un overlay : jamais rendu inert. */
export const OVERLAY_ROOT_ATTR = 'data-overlay-root'

export function lockPage() {
  lockCount += 1

  if (lockCount === 1) {
    savedScrollY = window.scrollY
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    getLenis()?.stop()
  }

  // Tout enfant direct de <body> hors overlay devient inert
  Array.from(document.body.children).forEach((el) => {
    if (!(el instanceof HTMLElement)) return
    if (el.hasAttribute(OVERLAY_ROOT_ATTR) || el.hasAttribute('inert')) return
    el.setAttribute('inert', '')
    inertedElements.push(el)
  })
}

export function unlockPage() {
  if (lockCount === 0) return
  lockCount -= 1
  if (lockCount > 0) return

  inertedElements.forEach((el) => el.removeAttribute('inert'))
  inertedElements = []

  document.body.style.overflow = previousOverflow

  // Filet de sécurité (iOS notamment) : retour exact, sans animation
  if (Math.abs(window.scrollY - savedScrollY) > 1) {
    window.scrollTo({ top: savedScrollY, behavior: 'instant' })
  }

  // Lenis repart de la position réelle (start() → reset())
  getLenis()?.start()
}
