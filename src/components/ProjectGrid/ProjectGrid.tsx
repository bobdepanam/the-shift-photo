'use client'

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

import stylesDefault from '@/styles/components/ProjectGridDefault.module.scss'
import stylesAlt from '@/styles/components/ProjectGridAlt.module.scss'
import stylesFilters from '@/styles/components/ProjectFilters.module.scss'

import ProjectFilter from '@/components/ProjectGrid/ProjectFilter'
import shuffleArray from '@/utils/shuffleArray'
import { useRouter } from 'next/navigation'
import ViewToggle from '@/components/ViewToggle/ViewToggle'
import { useGsapScrollFade } from '@/hooks/useGsapScrollFade'
import FilterOn from '@/icons/filter_on.svg'
import FilterOff from '@/icons/filter_off.svg'
import HoverInfo from '@/components/ProjectGrid/HoverInfo'

// Nombre d'items visibles au chargement et par step (inclut les spacers)
const INITIAL_VISIBLE = 24
const LOAD_STEP = 16

type GridItem = {
  slug: string
  title?: string
  category: string
  mediaType: 'image' | 'video' | 'spacer'
  src: string
  year?: string
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
}

type ProjectGridProps = {
  projects: Project[]
  layout: 'default' | 'alt'
  onToggleLayout: () => void
}

export default function ProjectGrid({
  projects,
  layout,
  onToggleLayout,
}: ProjectGridProps): ReactElement {
  const router = useRouter()

  const enableHoverInfo = layout === 'alt'
  const [hoverInfo, setHoverInfo] = useState<{ title?: string; category?: string } | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [hoverSrc, setHoverSrc] = useState<string | null>(null)

  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useGsapScrollFade(`.${stylesDefault.gridItem}`)
  useGsapScrollFade(`.${stylesAlt.thumbItem}`)

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

    const filtered = sorted.filter((cat) => cat !== 'digital')

    return ['all', ...filtered]
  }, [projects])

  // ------------------------------
  // GRID + SPACERS (RATIO + RANDOM)
  // ------------------------------
  useEffect(() => {
    if (!projects?.length) return

    const allMedia: GridItem[] = projects.flatMap((project) => {
      const cat = project.category?.toLowerCase().trim()
      const limitFromMd = project.previewMediaLimit
      const limit =
        typeof limitFromMd === 'number'
          ? Math.max(0, limitFromMd)
          : cat === 'digital'
          ? 1
          : Infinity

      const list = (project.media ?? []).slice(0, limit)

      return list.map((media) => ({
        slug: project.slug,
        title: project.title,
        category: project.category,
        mediaType: media.type,
        src: media.src,
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
  }, [projects])

  // ------------------------------
  // RESPONSIVE + MOUNT
  // ------------------------------
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    setShowFilters(!isMobile)
    setHasMounted(true)
  }, [])

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
  // HOVER INFO
  // ------------------------------
  const onEnter = (item: GridItem) => {
    if (!enableHoverInfo || item.mediaType === 'spacer') return
    setHoverSrc(item.src ?? null)
    setHoverInfo({ title: item.title, category: item.category })
  }
  const onLeave = () => {
    if (!enableHoverInfo) return
    setHoverSrc(null)
    setHoverInfo(null)
  }
  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!enableHoverInfo) return
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleNavigate = (href: string) => router.push(href)

  // ---------------------------------------------------------
  // ------------------------ RENDER -------------------------
  // ---------------------------------------------------------
  return (
    <>
      <ViewToggle onToggleLayout={onToggleLayout} layout={layout} />

      {/* FILTRES */}
      <div className={stylesFilters.filtersWrapper}>
        <button
          className={stylesFilters.filtersButton}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Afficher/masquer les filtres"
          type="button"
        >
          {showFilters ? <FilterOff /> : <FilterOn />}
        </button>

        <AnimatePresence mode="wait">
          {hasMounted && showFilters && (
            <ProjectFilter
              key="filters"
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
              categories={categories}
            />
          )}
        </AnimatePresence>
      </div>

      {/* GRILLE */}
      <AnimatePresence mode="wait">
        {layout === 'default' ? (
          // ------------------------------
          // GRID DEFAULT
          // ------------------------------
          <motion.div
            key="default-grid"
            className={stylesDefault.gridDefault}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item, index) => {
                if (item.mediaType === 'spacer') {
                  return <div key={`spacer-${index}`} className={stylesDefault.gridSpacer} />
                }

                return (
                  <motion.div
                    key={`${item.slug}-${item.src}-${index}`}
                    className={`${stylesDefault.gridItem} string`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                    layout
                    onClick={() => handleNavigate(`/projects/${item.slug}`)}
                    onMouseEnter={() => onEnter(item)}
                    onMouseLeave={onLeave}
                    onMouseMove={onMove}
                  >
                    {item.mediaType === 'image' ? (
                      <Image
                        src={item.src}
                        alt={item.title ?? item.slug}
                        width={500}
                        height={600}
                        style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <video
                        src={item.src}
                        muted
                        playsInline
                        preload="metadata"
                        className={stylesDefault.video}
                      />
                    )}

                    <div className={stylesDefault.gridItemInfo}>
                      <div className={stylesDefault.projectTitle}>{item.title}</div>
                      <div className={stylesDefault.projectCategory}>{item.category}</div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                    layout
                    onClick={() => handleNavigate(`/projects/${item.slug}`)}
                    onMouseEnter={() => onEnter(item)}
                    onMouseLeave={onLeave}
                    onMouseMove={onMove}
                  >
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
