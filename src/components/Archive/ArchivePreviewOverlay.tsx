'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, useIsPresent, useReducedMotion } from 'framer-motion'
import styles from '@/styles/components/ArchivePreviewOverlay.module.scss'
import { lockPage, unlockPage, OVERLAY_ROOT_ATTR } from '@/utils/scrollLock'
import { canFly, flyClose, flyOpen, type Flight } from '@/utils/thumbFlight'
import type { ArchiveImage, ArchiveProjectMeta } from './ArchiveGrid'

type Props = {
  project: ArchiveProjectMeta
  /** Image cliquée dans la mosaïque : la galerie s'ouvre à sa position */
  initialIndex: number
  /** Cadre 4:5 de la vignette cliquée (transition aller / retour), si disponible */
  sourceThumb?: HTMLElement | null
  onClose: () => void
}

// Easing signature du site + durées déjà utilisées par l'aperçu
const EASE_SIGNATURE = [0.76, 0, 0.24, 1] as const
const SIZES = '(min-width: 900px) min(1100px, 62vw), 100vw'
const FALLBACK_RATIO = 16 / 10
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

const ratioOf = (image: ArchiveImage) =>
  image.width && image.height ? image.width / image.height : FALLBACK_RATIO

/** Position verticale d'un élément dans le conteneur scrollable (transforms ignorés) */
function offsetWithin(el: HTMLElement, container: HTMLElement) {
  let top = 0
  let node: HTMLElement | null = el
  while (node && node !== container) {
    top += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return top
}

const refreshCursor = () => window.dispatchEvent(new Event('cursor:refresh'))

export default function ArchivePreviewOverlay({ project, initialIndex, sourceThumb, onClose }: Props) {
  const reduceMotion = useReducedMotion()
  const isPresent = useIsPresent()
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const frameRefs = useRef<(HTMLDivElement | null)[]>([])
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Rendu uniquement côté client (ouvert au clic) : le portail vers <body> est direct
  const startIndex = Math.min(Math.max(0, initialIndex), project.images.length - 1)

  // ✈️ Transition depuis la vignette : décidée au premier rendu pour que la galerie
  // n'ait pas son décalage d'entrée (y) pendant le vol (mesure exacte de la cible)
  const [willFly] = useState(() => Boolean(sourceThumb?.isConnected) && canFly())
  const flightRef = useRef<{ kind: 'open' | 'close'; flight: Flight } | null>(null)
  const initialScrollTopRef = useRef(0)
  const closingRef = useRef(false)

  /** Toutes les fermetures passent ici : vol retour si possible, sinon fondu actuel */
  const requestClose = () => {
    if (closingRef.current) return
    closingRef.current = true
    if (flightRef.current?.kind === 'open') {
      flightRef.current.flight.abort()
      flightRef.current = null
    }
    const back = flyClose(frameRefs.current[startIndex], sourceThumb)
    if (back) flightRef.current = { kind: 'close', flight: back }
    onCloseRef.current()
  }
  const requestCloseRef = useRef(requestClose)
  requestCloseRef.current = requestClose

  // 📍 Avant le premier affichage : verrou de la page, position sur l'image cliquée, focus
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    lockPage()

    // Hauteurs réservées (aspect-ratio) → mise en page connue avant tout chargement.
    // Affectation directe de scrollTop : aucun scroll animé, aucun saut.
    const target = frameRefs.current[startIndex]
    if (target && startIndex > 0) {
      const centred = offsetWithin(target, root) - (root.clientHeight - target.offsetHeight) / 2
      root.scrollTop = Math.max(0, centred)
    }

    root.focus({ preventScroll: true })
    initialScrollTopRef.current = root.scrollTop

    // Vol aller (si décidé et toujours possible) ; sinon ouverture actuelle
    if (willFly) {
      const flight = flyOpen(sourceThumb, frameRefs.current[startIndex])
      if (flight) flightRef.current = { kind: 'open', flight }
    }

    // Souris immobile au-dessus de l'overlay : CLOSE s'affiche sans attendre un mouvement
    const openRaf = requestAnimationFrame(refreshCursor)

    return () => {
      cancelAnimationFrame(openRaf)
      // Un vol aller encore en cours est interrompu ; le vol retour, lui, continue seul
      if (flightRef.current?.kind === 'open') flightRef.current.flight.abort()
      flightRef.current = null
      unlockPage()
      // Retour à la vignette d'origine, sans faire bouger la mosaïque
      previouslyFocused?.focus({ preventScroll: true })
      // Le curseur reprend l'état de ce qui se trouve désormais sous la souris
      requestAnimationFrame(refreshCursor)
    }
    // Montage unique : la position initiale ne doit pas être recalculée
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ⌨️ Échap + focus trap (le reste de la page est déjà inert)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        requestCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return

      const root = rootRef.current
      if (!root) return
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (item) => item.getClientRects().length > 0 // visibles uniquement (fixed inclus)
      )
      if (!items.length) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (!root.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && (active === first || active === root)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // 🖱️ Pendant le défilement, le libellé du curseur suit ce qui passe sous la souris
  // (au plus un recalcul par frame, uniquement pendant le scroll de l'overlay)
  const scrollRafRef = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current)
    },
    []
  )
  const handleScroll = () => {
    // L'utilisateur fait défiler pendant le vol aller → relève immédiate par l'image réelle
    const root = rootRef.current
    if (
      flightRef.current?.kind === 'open' &&
      root &&
      Math.abs(root.scrollTop - initialScrollTopRef.current) > 2
    ) {
      flightRef.current.flight.abort()
      flightRef.current = null
    }
    if (scrollRafRef.current !== null) return
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null
      refreshCursor()
    })
  }

  // Clic sur une zone vide → fermeture. Images, infos, liens et boutons ne ferment pas.
  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as Element
    if (target.closest('[data-cursor-default], a, button')) return
    if (window.getSelection()?.toString()) return // fin d'une sélection de texte
    requestClose()
  }

  const info = (
    <>
      <p className={styles.meta}>
        <span>{project.category}</span>
        {project.year ? <span>{project.year}</span> : null}
      </p>
      <h2 id={titleId} className={styles.title}>
        {project.title}
      </h2>
      {project.summary ? <p className={styles.summary}>{project.summary}</p> : null}
      {project.url ? (
        <a className={styles.link} href={project.url} target="_blank" rel="noopener noreferrer">
          visit site ↗
        </a>
      ) : null}
    </>
  )

  return createPortal(
    <motion.div
      ref={rootRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onClick={handleClick}
      onScroll={handleScroll}
      data-lenis-prevent
      data-cursor-label="CLOSE"
      {...{ [OVERLAY_ROOT_ATTR]: '' }}
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE_SIGNATURE }}
    >
      {/* Contrôles fixes : fermeture explicite + titre discret (mobile) */}
      <button type="button" className={styles.closeButton} onClick={requestClose}>
        close
      </button>
      <p className={styles.mobileTitle} aria-hidden="true">
        {project.title}
      </p>

      <div className={styles.layout}>
        {/* 📝 Infos du projet : sticky à gauche (desktop), en tête (mobile) */}
        <motion.aside
          className={styles.info}
          data-cursor-default
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_SIGNATURE, delay: reduceMotion ? 0 : 0.1 }}
        >
          {info}
        </motion.aside>

        {/* 🖼️ Images empilées, ratio d'origine, place réservée avant chargement */}
        <motion.div
          className={styles.gallery}
          initial={reduceMotion || willFly ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_SIGNATURE }}
        >
          {project.images.map((image, i) => (
            <GalleryFrame
              key={image.src}
              frameRef={(node) => {
                frameRefs.current[i] = node
              }}
              image={image}
              alt={`${project.title} — ${i + 1} / ${project.images.length}`}
              priority={i === startIndex}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>,
    document.body
  )
}

type FrameProps = {
  image: ArchiveImage
  alt: string
  priority: boolean
  frameRef: (node: HTMLDivElement | null) => void
}

/** Une image de la galerie : boîte au ratio exact, fondu discret au chargement */
function GalleryFrame({ image, alt, priority, frameRef }: FrameProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      ref={frameRef}
      className={styles.frame}
      style={{ '--ratio': ratioOf(image) } as React.CSSProperties}
      data-cursor-default
    >
      <Image
        src={image.src}
        alt={alt}
        fill
        sizes={SIZES}
        priority={priority}
        className={`${styles.media} ${loaded ? styles.isLoaded : ''}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
