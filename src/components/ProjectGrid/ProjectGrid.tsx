'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { useHoverPreview } from '@/hooks/useHoverPreview'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

import stylesDefault from '@/styles/components/ProjectGridDefault.module.scss'
import stylesAlt from '@/styles/components/ProjectGridAlt.module.scss'
import stylesFilters from '@/styles/components/ProjectFilters.module.scss'

import ProjectFilter from '@/components/ProjectGrid/ProjectFilter'
import shuffleArray from '@/utils/shuffleArray'
import { useRouter } from 'next/navigation'
import ViewToggle from '@/components/ViewToggle/ViewToggle'
import FilterOn from '@/icons/filter_on.svg'
import FilterOff from '@/icons/filter_off.svg'
import HoverInfo from '@/components/ProjectGrid/HoverInfo'
import { BLUR_DATA_URL } from '@/utils/imageUtils'

// Nombre d'items visibles au chargement et par step (inclut les spacers)
const INITIAL_VISIBLE = 24
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
}

export default function ProjectGrid({
  projects,
  layout,
  onToggleLayout,
  showFilters: showFiltersProp,
}: ProjectGridProps): ReactElement {
  const router = useRouter()

  const enableHoverInfo = layout === 'alt'
  const { hoverInfo, mousePos, hoverSrc, onEnter, onLeave, onMove } = useHoverPreview(enableHoverInfo)

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

    // Mélange des médias
    const shuffled = shuffleArray(allMedia.slice())

    // 🔥 Config : proportion de trous
    const SPACER_RATIO = 0.3 // 30% de trous environ
    const spacerCount = Math.floor(shuffled.length * SPACER_RATIO)

    // On choisit des positions aléatoires dans la liste mélangée
    const spacerPositions = new Set<number>()
    while (spacerPositions.size < spacerCount && spacerPositions.size < shuffled.length) {
      const randIndex = Math.floor(Math.random() * shuffled.length)
      spacerPositions.add(randIndex)
    }

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
    setVisibleCount(Math.min(INITIAL_VISIBLE, filteredItems.length))
  }, [activeCategory, filteredItems.length])

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
  const handleNavigate = useCallback((slug: string, mediaIndex?: number) => {
    const hash = typeof mediaIndex === 'number' ? `#m-${mediaIndex}` : ''
    router.push(`/projects/${slug}${hash}`)
  }, [router])

  const handleItemEnter = useCallback((item: GridItem) => {
    if (item.mediaType === 'spacer') return
    setActiveSlug(item.slug)
    onEnter(item)
  }, [onEnter])

  const handleItemLeave = useCallback(() => {
    setActiveSlug(null)
    onLeave()
  }, [onLeave])

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
                              handleNavigate(project.slug, mediaIndex)
                            }}
                          >
                            {media.type === 'image' ? (
                              <Image
                                src={media.src}
                                alt={project.title}
                                width={400}
                                height={500}
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                sizes="(max-width: 768px) 50vw, 33vw"
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
            <div className={stylesAlt.gridAltThumbs}>
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
                    onMouseEnter={() => onEnter(item)}
                    onMouseLeave={onLeave}
                    onMouseMove={onMove}
                  >
                    {item.mediaType === 'image' ? (
                      <Image
                        src={item.src}
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

      {layout === 'alt' && <HoverInfo info={hoverInfo} position={mousePos} src={hoverSrc} />}
    </>
  )
}
