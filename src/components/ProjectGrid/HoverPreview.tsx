'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { getImageProps } from 'next/image'
import styles from '@/styles/components/HoverPreview.module.scss'
import { isVideoSrc, skipOptimizer } from '@/utils/projectMedia'

/**
 * Aperçu flottant de la grille alt (Home).
 * - Piloté impérativement : la grille ne re-rend jamais pour un survol ou un mouvement de souris.
 * - Position écrite directement en transform (rAF), écouteur pointermove actif seulement pendant le survol.
 * - <img> persistant ; l'image n'apparaît qu'une fois chargée et décodée (pas de cadre vide).
 * - Même srcset/sizes pour le préchargement et l'affichage → l'image préchargée est réutilisée.
 */

export type HoverPreviewHandle = {
  /** Survol d'un élément : src image (null pour une vidéo → pas d'aperçu) + position de la souris */
  show: (src: string | null, x: number, y: number) => void
  hide: () => void
  /** Préchargement discret (dédupliqué) */
  preload: (src: string) => void
  /** Source du vol Home → projet : la carte visible affichant `src`, sinon null */
  getFlightSource: (src: string) => { imgEl: HTMLImageElement; clipEl: HTMLElement } | null
}

// Boîte de l'aperçu : clamp(375px, 22vw, 500px) en 4:3 (cf. HoverPreview.module.scss)
const PREVIEW_SIZES = 'clamp(375px, 22vw, 500px)'
const OFFSET = 24
const EDGE = 8
const HIDE_DELAY = 80 // évite le clignotement en passant d'un projet à l'autre

type ImgAttrs = { src: string; srcSet?: string; sizes?: string }

const attrsCache = new Map<string, ImgAttrs>()
const readyCache = new Map<string, Promise<void>>()

function imgAttrs(src: string): ImgAttrs {
  let attrs = attrsCache.get(src)
  if (!attrs) {
    const { props } = getImageProps({
      src,
      alt: '',
      width: 500,
      height: 375,
      sizes: PREVIEW_SIZES,
      unoptimized: skipOptimizer(src), // GIF animés servis tels quels
    })
    attrs = { src: props.src, srcSet: props.srcSet, sizes: props.sizes }
    attrsCache.set(src, attrs)
  }
  return attrs
}

function ensureReady(src: string): Promise<void> {
  let ready = readyCache.get(src)
  if (!ready) {
    const attrs = imgAttrs(src)
    const img = new window.Image()
    if (attrs.sizes) img.sizes = attrs.sizes
    if (attrs.srcSet) img.srcset = attrs.srcSet
    img.src = attrs.src
    ready = img.decode().catch(() => {
      readyCache.delete(src) // nouvel essai au prochain survol
    })
    readyCache.set(src, ready)
  }
  return ready
}

const HoverPreview = forwardRef<HoverPreviewHandle>(function HoverPreview(_, ref) {
  const rootRef = useRef<HTMLDivElement>(null)
  const enabledRef = useRef(false)
  const activeSrcRef = useRef<string | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const sizeRef = useRef({ w: 0, h: 0 })
  const rafRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)
  const listeningRef = useRef(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Desktop à pointeur fin uniquement (comme l'ancien HoverInfo, masqué < 768px)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)')
    const update = () => {
      enabledRef.current = mq.matches
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const place = useCallback(() => {
    rafRef.current = null
    const root = rootRef.current
    if (!root) return
    const { x, y } = pointerRef.current
    const { w, h } = sizeRef.current
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Au-dessus à droite du curseur : le titre du projet survolé (bas de cellule) reste lisible
    let left = x + OFFSET
    let top = y - h - OFFSET
    if (left + w > vw - EDGE) left = x - w - OFFSET
    if (top < EDGE) top = Math.min(y + OFFSET, vh - h - EDGE)

    root.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`
  }, [])

  const schedulePlace = useCallback(() => {
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(place)
  }, [place])

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY }
      schedulePlace()
    },
    [schedulePlace]
  )

  const stopListening = useCallback(() => {
    if (!listeningRef.current) return
    window.removeEventListener('pointermove', onPointerMove)
    listeningRef.current = false
  }, [onPointerMove])

  const hideNow = useCallback(() => {
    activeSrcRef.current = null
    if (rootRef.current) rootRef.current.dataset.visible = 'false'
    stopListening()
  }, [stopListening])

  useImperativeHandle(
    ref,
    () => ({
      show(src, x, y) {
        if (!enabledRef.current) return
        if (hideTimerRef.current !== null) {
          window.clearTimeout(hideTimerRef.current)
          hideTimerRef.current = null
        }
        if (!src || isVideoSrc(src)) {
          hideNow()
          return
        }

        activeSrcRef.current = src
        pointerRef.current = { x, y }
        if (!listeningRef.current) {
          window.addEventListener('pointermove', onPointerMove, { passive: true })
          listeningRef.current = true
        }

        ensureReady(src).then(() => {
          const root = rootRef.current
          const img = imgRef.current
          if (!root || !img || activeSrcRef.current !== src) return
          // Mise à jour impérative : l'image est déjà décodée, aucun rendu React
          if (img.dataset.src !== src) {
            const a = imgAttrs(src)
            if (a.sizes) img.sizes = a.sizes
            img.srcset = a.srcSet ?? ''
            img.src = a.src
            img.dataset.src = src
          }
          sizeRef.current = { w: root.offsetWidth, h: root.offsetHeight }
          place()
          root.dataset.visible = 'true'
        })
      },
      hide() {
        if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
        hideTimerRef.current = window.setTimeout(() => {
          hideTimerRef.current = null
          hideNow()
        }, HIDE_DELAY)
      },
      preload(src) {
        if (!enabledRef.current || isVideoSrc(src)) return
        void ensureReady(src)
      },
      getFlightSource(src) {
        const root = rootRef.current
        const img = imgRef.current
        const card = cardRef.current
        if (!root || !img || !card) return null
        if (root.dataset.visible !== 'true' || img.dataset.src !== src) return null
        return { imgEl: img, clipEl: card }
      },
    }),
    [hideNow, onPointerMove, place]
  )

  // Nettoyage complet au démontage (changement de mode, navigation)
  useEffect(
    () => () => {
      stopListening()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
    },
    [stopListening]
  )

  return (
    <div ref={rootRef} className={styles.root} data-visible="false" aria-hidden="true">
      <div ref={cardRef} className={styles.card}>
        {/* src/srcset posés impérativement (getImageProps) : même URL que le préchargement */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} className={styles.img} alt="" decoding="async" />
      </div>
    </div>
  )
})

export default HoverPreview
