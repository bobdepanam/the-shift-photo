'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/components/ProjectClose.module.scss'
import navStyles from '@/styles/components/Navigation.module.scss'
import { resolveCloseTarget } from '@/utils/returnContext'

type Props = {
  slug: string
}

/** Échap ne ferme pas la page si une interaction plus locale doit le recevoir */
function shouldIgnoreEscape(e: KeyboardEvent) {
  if (e.defaultPrevented || e.isComposing) return true
  if (document.fullscreenElement) return true // sortie de plein écran (vidéo…)

  const target = e.target instanceof Element ? e.target : null
  if (
    target?.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"], video, audio, [role="dialog"], [role="menu"], [role="listbox"]'
    )
  ) {
    return true
  }

  // Menu de navigation du header ouvert (monté uniquement quand il est actif)
  if (navStyles.nav && document.querySelector(`.${CSS.escape(navStyles.nav)}`)) return true

  return false
}

/**
 * CLOSE des pages projet (modes classic et alt) : retour vers la grille d'origine
 * via un contexte explicite, sinon vers la Home. Jamais de router.back().
 */
export default function ProjectClose({ slug }: Props) {
  const router = useRouter()
  const closingRef = useRef(false)

  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true

    const { target, restoreHome } = resolveCloseTarget(slug)
    // replace : pas d'étape supplémentaire dans l'historique.
    // Restauration → la Home gère elle-même le scroll ; sinon comportement standard (haut de page).
    router.replace(target, { scroll: !restoreHome })
  }, [router, slug])

  useEffect(() => {
    closingRef.current = false
  }, [slug])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || shouldIgnoreEscape(e)) return
      e.preventDefault()
      close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close])

  return (
    <button
      type="button"
      className={styles.close}
      onClick={close}
      data-cursor-label="CLOSE"
      aria-label="Close project"
    >
      close
    </button>
  )
}
