'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

import stylesDefault from '@/styles/components/ProjectGridDefault.module.scss'
import stylesAlt from '@/styles/components/ProjectGridAlt.module.scss'
import stylesFilters from '@/styles/components/ProjectFilters.module.scss'

import ProjectFilter from '@/components/ProjectGrid/ProjectFilter'
import { seededShuffle } from '@/utils/seededShuffle'
import { getLenis } from '@/utils/lenisInstance'
import { isVideoSrc, preloadProjectImage, skipOptimizer } from '@/utils/projectMedia'
import { HOME_FLIGHT_ENABLED, beginHomeFlight, prepareThumbFlightWhenIdle } from '@/utils/thumbFlight'
import {
  clearHomeRestore,
  randomSeed,
  saveReturnContext,
  type HomeReturnState,
} from '@/utils/returnContext'
import { useRouter } from 'next/navigation'
import ViewToggle from '@/components/ViewToggle/ViewToggle'
import FilterOn from '@/icons/filter_on.svg'
import FilterOff from '@/icons/filter_off.svg'
import HoverPreview, { type HoverPreviewHandle } from '@/components/ProjectGrid/HoverPreview'
import { BLUR_DATA_URL } from '@/utils/imageUtils'

// Nombre d'items visibles au chargement et par step (inclut les spacers)
const INITIAL_VISIBLE = 24

/**
 * Grille alt : atténuation légère des projets non survolés.
 * Variante réversible : passer à false pour revenir au comportement précédent.
 */
const DIM_ON_HOVER = true
/** Délai avant de rétablir la grille en quittant un projet (évite le clignotement entre deux cellules) */
const DIM_RELEASE_DELAY = 80
const LOAD_STEP = 16

type GridItem = {
  slug: string
  title?: string
  category: string
  mediaType: 'image' | 'video' | 'spacer'
  src: string
  mediaIndex?: number
  year?: string
  mediaCount?: number
}

const getDisplayFilename = (src: string) => {
  if (!src) return ''
  const filenameWithParams = src.split('/').pop() ?? ''
  const filename = filenameWithParams.split(/[?#]/)[0]
  const withoutExt = filename.replace(/\.[^.]+$/, '')
  return withoutExt.replace(/[-_]+/g, ' ') || ''
}

export type Project = {
  title: string
  slug: string
  category: string
  media: { type: 'image' | 'video'; src: string }[]
  content: string
  previewMediaLimit?: number
  featured?: boolean
  date?: string
  home?: boolean
  homeOrder?: number | null
}

type ProjectGridProps = {
  projects: Project[]
  layout: 'default' | 'alt'
  onToggleLayout: () => void
  showFilters?: boolean
  /** Retour CLOSE depuis une page projet : état à restaurer (sinon null) */
  restore?: HomeReturnState | null
}

export default function ProjectGrid({
  projects,
  layout,
  onToggleLayout,
  showFilters: showFiltersProp,
  restore = null,
}: ProjectGridProps): ReactElement {
  const router = useRouter()

  // Graine du mélange de la grille alt : nouvelle à chaque visite et à chaque
  // changement de mode (comme l'ancien Math.random), reprise uniquement au retour CLOSE.
  const seedRef = useRef<string | null>(null)
  if (seedRef.current === null) seedRef.current = restore?.seed ?? randomSeed()
  const seedLayoutRef = useRef(layout)

  // Restauration en attente (nombre d'éléments visibles + scroll), appliquée une seule fois
  const pendingRestoreRef = useRef<HomeReturnState | null>(restore)

  // Survol de la grille alt : piloté sans état React (aucun re-rendu de la grille au survol)
  const previewRef = useRef<HoverPreviewHandle>(null)
  const altThumbsRef = useRef<HTMLDivElement | null>(null)
  // La grille alt est montée après l'animation de sortie (AnimatePresence "wait") :
  // ref callback stable → l'effet de préchargement se branche quand l'élément existe vraiment
  const [altThumbsEl, setAltThumbsEl] = useState<HTMLDivElement | null>(null)
  const setAltThumbsRef = useCallback((el: HTMLDivElement | null) => {
    altThumbsRef.current = el
    setAltThumbsEl(el)
  }, [])
  const dimTimerRef = useRef<number | null>(null)
  const preloadArmedRef = useRef(false)

  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showFiltersState, setShowFiltersState] = useState<boolean>(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)


  // ------------------------------
  // CATÉGORIES
  // ------------------------------
  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of projects || []) if (p?.category) set.add(p.category)

    const order = ['photography', 'digital', 'branding']
    const sorted = Array.from(set).sort((a, b) => {
      const ia = order.indexOf(a), ib = order.indexOf(b)
      return (ia === -1 ? 1e9 : ia) - (ib === -1 ? 1e9 : ib) || a.localeCompare(b)
    })

    return ['all', ...sorted]
  }, [projects])

  // ------------------------------
  // GRID + SPACERS (RATIO + RANDOM)
  // ------------------------------
  useEffect(() => {
    if (!projects?.length) return

    const allMedia: GridItem[] = projects.flatMap((project) => {
      const limitFromMd = project.previewMediaLimit
      const isAlt = layout === 'alt'
      const limit = isAlt
        ? Math.min(project.media?.length ?? 0, 50)
        : typeof limitFromMd === 'number'
          ? Math.min(Math.max(0, limitFromMd), 2)
          : 1

      const list = (project.media ?? []).slice(0, limit)
      const mediaCount = project.media?.length ?? 0

      return list.map((media, mediaIndex) => ({
        slug: project.slug,
        title: project.title,
        category: project.category,
        mediaType: media.type,
        src: media.src,
        mediaIndex,
        mediaCount,
      }))
    })

    // Nouveau mode → nouvelle graine (même comportement qu'avant : remélange au changement)
    if (seedLayoutRef.current !== layout) {
      seedLayoutRef.current = layout
      seedRef.current = randomSeed()
    }
    const seed = seedRef.current ?? randomSeed()

    // Mélange des médias (aléatoire uniforme, mais reproductible à partir de la graine)
    const shuffled = seededShuffle(allMedia, seed)

    // 🔥 Config : proportion de trous
    const SPACER_RATIO = 0.3 // 30% de trous environ
    const spacerCount = Math.floor(shuffled.length * SPACER_RATIO)

    // Positions des trous : sous-ensemble aléatoire uniforme, lui aussi issu de la graine
    const spacerPositions = new Set<number>(
      seededShuffle(
        Array.from({ length: shuffled.length }, (_, i) => i),
        `${seed}:spacers`
      ).slice(0, spacerCount)
    )

    const withSpacers: GridItem[] = []

    shuffled.forEach((item, index) => {
      // Si cette position est marquée pour un trou → on insère un spacer avant l'item
      if (spacerPositions.has(index)) {
        withSpacers.push({
          slug: `spacer-${index}`,
          category: 'spacer',
          mediaType: 'spacer',
          src: '',
        })
      }
      withSpacers.push(item)
    })

    setGridItems(withSpacers)
  }, [projects, layout])

  // ------------------------------
  // RESPONSIVE + MOUNT
  // ------------------------------
  useEffect(() => {
    if (typeof showFiltersProp === 'boolean') {
      setShowFiltersState(showFiltersProp)
      setHasMounted(true)
      return
    }
    const isMobile = window.innerWidth < 768
    setShowFiltersState(!isMobile)
    setHasMounted(true)
  }, [showFiltersProp])

  // ------------------------------
  // FILTRAGE + VISIBLE
  // ------------------------------
  useEffect(() => {
    if (!categories.includes(activeCategory)) setActiveCategory('all')
  }, [categories, activeCategory])

  const filteredItems = useMemo(
    () =>
      activeCategory === 'all'
        ? gridItems
        : gridItems.filter((i) => i.mediaType === 'spacer' || i.category === activeCategory),
    [gridItems, activeCategory]
  )

  const filteredProjects = useMemo(
    () =>
      activeCategory === 'all'
        ? projects
        : projects.filter((p) => p.category === activeCategory),
    [projects, activeCategory]
  )

  useEffect(() => {
    // Retour CLOSE : on recharge autant d'éléments qu'au moment de l'ouverture
    const pending = pendingRestoreRef.current
    if (pending && filteredItems.length > 0) {
      setVisibleCount(Math.min(Math.max(INITIAL_VISIBLE, pending.visibleCount), filteredItems.length))
      return
    }
    setVisibleCount(Math.min(INITIAL_VISIBLE, filteredItems.length))
  }, [activeCategory, filteredItems.length])

  // Retour CLOSE : position de scroll restaurée une fois la grille montée, sans animation.
  // Scroll natif instantané → Lenis se resynchronise sur la position réelle.
  useEffect(() => {
    const pending = pendingRestoreRef.current
    if (!pending || !gridItems.length) return
    const expected = Math.min(Math.max(INITIAL_VISIBLE, pending.visibleCount), filteredItems.length)
    if (layout === 'alt' && visibleCount < expected) return

    // Effacement après application seulement (StrictMode rejoue l'effet en dev)
    const raf = requestAnimationFrame(() => {
      // stop() annule un éventuel scroll lissé encore en cours (venu de la page projet),
      // start() recale Lenis sur la position restaurée
      const lenis = getLenis()
      lenis?.stop()
      window.scrollTo({ top: pending.scrollY, behavior: 'instant' })
      lenis?.start()
      pendingRestoreRef.current = null
      clearHomeRestore()
    })
    return () => cancelAnimationFrame(raf)
  }, [gridItems.length, filteredItems.length, visibleCount, layout])

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  )

  // IntersectionObserver pour charger plus d'items en bas de page
  useEffect(() => {
    if (!loadMoreRef.current) return
    if (visibleCount >= filteredItems.length) return
    const target = loadMoreRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => {
              if (prev >= filteredItems.length) return prev
              return Math.min(prev + LOAD_STEP, filteredItems.length)
            })
          }
        })
      },
      { rootMargin: '600px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [filteredItems.length, visibleCount])

  // ------------------------------
  // NAVIGATION + ITEM EVENTS
  // ------------------------------
  // Vol Home → projet : GSAP préparé au repos du navigateur (prêt avant le premier clic)
  useEffect(() => prepareThumbFlightWhenIdle(HOME_FLIGHT_ENABLED), [])

  /**
   * Source visuelle du vol : vignette cliquée (mode default) ou carte d'aperçu (mode alt).
   * Absente → navigation actuelle.
   */
  const handleNavigate = useCallback((slug: string, mediaIndex?: number, sourceEl?: HTMLElement | null) => {
    // Contexte de retour pour le CLOSE de la page projet (mode, mélange, chargement, scroll)
    saveReturnContext({
      from: '/',
      slug,
      home: {
        layout,
        seed: seedRef.current ?? randomSeed(),
        visibleCount,
        scrollY: window.scrollY,
      },
    })

    // Une seule image préchargée : celle sur laquelle la page projet va s'ouvrir
    // (même srcset/sizes que la page → réutilisée). Pas de préchargement pour les vidéos.
    const targetIndex = mediaIndex ?? 0
    const targetMedia = projects.find((p) => p.slug === slug)?.media?.[targetIndex]
    if (targetMedia?.type === 'image') preloadProjectImage(targetMedia.src, targetIndex)

    // Prototype : continuité visuelle vers la photo ciblée (#m-index uniquement, images uniquement)
    if (typeof mediaIndex === 'number' && targetMedia?.type === 'image' && !isVideoSrc(targetMedia.src)) {
      const source =
        layout === 'alt'
          ? previewRef.current?.getFlightSource(targetMedia.src) ?? null
          : sourceEl
            ? { imgEl: sourceEl.querySelector('img'), clipEl: sourceEl }
            : null
      if (source) beginHomeFlight({ slug, index: mediaIndex, imgEl: source.imgEl, clipEl: source.clipEl })
    }

    const hash = typeof mediaIndex === 'number' ? `#m-${mediaIndex}` : ''
    router.push(`/projects/${slug}${hash}`)
  }, [router, layout, visibleCount, projects])

  const handleItemEnter = useCallback((item: GridItem) => {
    if (item.mediaType === 'spacer') return
    setActiveSlug(item.slug)
  }, [])

  const handleItemLeave = useCallback(() => {
    setActiveSlug(null)
  }, [])

  const handleAltEnter = useCallback((item: GridItem, e: React.MouseEvent) => {
    previewRef.current?.show(item.mediaType === 'image' ? item.src : null, e.clientX, e.clientY)
    if (!DIM_ON_HOVER) return
    if (dimTimerRef.current !== null) {
      window.clearTimeout(dimTimerRef.current)
      dimTimerRef.current = null
    }
    altThumbsRef.current?.setAttribute('data-hovering', 'true')
  }, [])

  const handleAltLeave = useCallback(() => {
    previewRef.current?.hide()
    if (!DIM_ON_HOVER) return
    if (dimTimerRef.current !== null) window.clearTimeout(dimTimerRef.current)
    dimTimerRef.current = window.setTimeout(() => {
      dimTimerRef.current = null
      altThumbsRef.current?.removeAttribute('data-hovering')
    }, DIM_RELEASE_DELAY)
  }, [])

  // Préchargement raisonnable des aperçus : seulement après un premier signe d'intention
  // (pointeur sur la grille), et uniquement pour les projets visibles à l'écran.
  useEffect(() => {
    const container = altThumbsEl
    if (layout !== 'alt' || !container) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const src = (entry.target as HTMLElement).dataset.previewSrc
          observer.unobserve(entry.target)
          if (src) previewRef.current?.preload(src)
        })
      },
      { rootMargin: '0px' }
    )

    const observeAll = () => {
      container
        .querySelectorAll<HTMLElement>('[data-preview-src]')
        .forEach((el) => observer.observe(el))
    }

    const arm = () => {
      preloadArmedRef.current = true
      observeAll()
    }

    if (preloadArmedRef.current) observeAll()
    else container.addEventListener('pointerenter', arm, { once: true })

    return () => {
      container.removeEventListener('pointerenter', arm)
      observer.disconnect()
    }
  }, [layout, altThumbsEl, visibleItems.length])

  useEffect(
    () => () => {
      if (dimTimerRef.current !== null) window.clearTimeout(dimTimerRef.current)
    },
    []
  )

  // ---------------------------------------------------------
  // ------------------------ RENDER -------------------------
  // ---------------------------------------------------------
  return (
    <>
      <ViewToggle onToggleLayout={onToggleLayout} layout={layout} />

      {/* FILTRES */}
      {showFiltersProp !== false && (
        <div className={stylesFilters.filtersWrapper}>
          <button
            className={stylesFilters.filtersButton}
            onClick={() =>
              typeof showFiltersProp === 'boolean'
                ? null
                : setShowFiltersState((prev) => !prev)
            }
            aria-label="Afficher/masquer les filtres"
            type="button"
            disabled={typeof showFiltersProp === 'boolean'}
          >
            {showFiltersState ? <FilterOff /> : <FilterOn />}
          </button>

          <AnimatePresence mode="wait">
            {hasMounted && showFiltersState && (
              <ProjectFilter
                key="filters"
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
                categories={categories}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* GRILLE */}
      <AnimatePresence mode="wait">
        {layout === 'default' ? (
          // ------------------------------
          // GRID DEFAULT
          // ------------------------------
          <motion.div
            key="default-grid"
            className={stylesDefault.gridDefault}
            data-has-active={activeSlug ? 'true' : 'false'}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className={stylesDefault.inner}>
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => {
                  const limitFromMd = project.previewMediaLimit
                  const limit =
                    typeof limitFromMd === 'number' ? Math.max(0, limitFromMd) : 10
                  const previewMedia = (project.media ?? []).slice(0, limit)
                  const mediaCount = project.media?.length ?? 0

                  return (
                    <motion.article
                      key={project.slug}
                    className={stylesDefault.gridItem}
                    data-active={activeSlug === project.slug ? 'true' : 'false'}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                    layout
                      onClick={() => handleNavigate(project.slug)}
                      onMouseEnter={() =>
                        handleItemEnter({
                          slug: project.slug,
                          title: project.title,
                          category: project.category,
                          mediaType: 'image',
                          src: '',
                        })
                      }
                      onMouseLeave={handleItemLeave}
                    >
                      <header className={stylesDefault.gridItemInfo}>
                        <p className={stylesDefault.projectTitle}>{project.title}</p>
                        <p className={stylesDefault.projectCategory}>{project.category}</p>
                        <p className={stylesDefault.mediaCount}>{mediaCount}</p>
                        <p className={stylesDefault.projectDate}>{project.date ?? ''}</p>
                      </header>

                      <div className={stylesDefault.mediaRow}>
                        {previewMedia.map((media, mediaIndex) => (
                          <div
                            key={`${project.slug}-${media.src}-${mediaIndex}`}
                            className={stylesDefault.mediaThumb}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNavigate(project.slug, mediaIndex, e.currentTarget)
                            }}
                          >
                            {media.type === 'image' && !isVideoSrc(media.src) ? (
                              <Image
                                src={media.src}
                                unoptimized={skipOptimizer(media.src)}
                                alt={project.title}
                                width={400}
                                height={500}
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 200px, 160px"
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={BLUR_DATA_URL}
                              />
                            ) : (
                              <video
                                src={media.src}
                                muted
                                playsInline
                                preload="metadata"
                                className={stylesDefault.video}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          // ------------------------------
          // GRID ALT
          // ------------------------------
          <motion.div
            key="alt-grid"
            className={stylesAlt.gridAltWrapper}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div ref={setAltThumbsRef} className={stylesAlt.gridAltThumbs}>
              <AnimatePresence mode="popLayout">
                {visibleItems.map((item, index) => {
                  if (item.mediaType === 'spacer') {
                    return (
                      <div
                        key={`spacer-${index}`}
                        className={stylesAlt.thumbSpacer}
                      />
                    )
                  }

                  return (
                    <motion.div
                      key={`${item.slug}-${item.src}-${index}`}
                      className={`${stylesAlt.thumbItem} string`}
                      data-reveal
                      data-cursor-label="VIEW"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: Math.min(index * 0.04, 0.6) }}
                    layout
                    onClick={() => handleNavigate(item.slug, item.mediaIndex)}
                    data-preview-src={item.mediaType === 'image' ? item.src : undefined}
                    onMouseEnter={(e) => handleAltEnter(item, e)}
                    onMouseLeave={handleAltLeave}
                  >
                    {item.mediaType === 'image' && !isVideoSrc(item.src) ? (
                      <Image
                        src={item.src}
                        unoptimized={skipOptimizer(item.src)}
                        alt={item.title || getDisplayFilename(item.src) || item.slug}
                        width={72}
                        height={72}
                        className={stylesAlt.thumbMini}
                        sizes="(max-width: 768px) 72px, 72px"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <video
                        src={item.src}
                        muted
                        playsInline
                        preload="metadata"
                        className={stylesAlt.thumbMini}
                      />
                    )}
                    <div className={stylesAlt.thumbText}>
                      <p className={stylesAlt.thumbFilename}>{getDisplayFilename(item.src) || '-'}</p>
                      <p className={stylesAlt.thumbCategory}>{item.category}</p>
                    </div>
                  </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={loadMoreRef} aria-hidden style={{ height: 1 }} />

      {layout === 'alt' && <HoverPreview ref={previewRef} />}
    </>
  )
}
