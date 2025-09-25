'use client'

import { useEffect, useMemo, useState, type ReactElement } from 'react'
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

type GridItem = {
  slug: string
  title?: string
  category: string
  mediaType: 'image' | 'video' | 'spacer'
  src: string
  year?: string
}

export type Project = {
  title: string
  slug: string
  category: string
  media: { type: 'image' | 'video'; src: string }[]
  content: string
  /** Optionnel: limite de vignettes à afficher dans la grille */
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

  // Tooltip uniquement en vue "alt"
  const enableHoverInfo = layout === 'alt'

  const [hoverInfo, setHoverInfo] = useState<{ title?: string; category?: string } | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  // === Grid / filters state ===
  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [hasMounted, setHasMounted] = useState(false)

  useGsapScrollFade(`.${stylesDefault.gridItem}`)
  useGsapScrollFade(`.${stylesAlt.thumbItem}`)

  // ✅ Catégories dynamiques
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

  // ✅ Items + spacers (avec limite par projet)
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

    const shuffled = shuffleArray(allMedia.slice())
    const total = shuffled.length
    const spacerCount = Math.floor(total * 0.1)
    const interval = Math.max(8, Math.floor(total / Math.max(1, spacerCount)))
    const withSpacers: GridItem[] = []
    shuffled.forEach((it, i) => {
      if (i > 0 && i % interval === 0) {
        withSpacers.push({ slug: `spacer-${i}`, category: 'spacer', mediaType: 'spacer', src: '' })
      }
      withSpacers.push(it)
    })
    setGridItems(withSpacers)
  }, [projects])

  // Mount / responsive filters
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    setShowFilters(!isMobile)
    setHasMounted(true)
  }, [])

  // Reset catégorie si invalide
  useEffect(() => {
    if (!categories.includes(activeCategory)) setActiveCategory('all')
  }, [categories, activeCategory])

  // Filtrage visible
  const visibleItems = useMemo(
    () => (activeCategory === 'all' ? gridItems : gridItems.filter((i) => i.category === activeCategory)),
    [gridItems, activeCategory]
  )

  const handleNavigate = (href: string) => router.push(href)

  // === Handlers hover (tooltip) ===
  const onEnter = (item: GridItem) => {
    if (!enableHoverInfo || item.mediaType === 'spacer') return
    setHoverInfo({ title: item.title, category: item.category })
  }
  const onLeave = () => {
    if (!enableHoverInfo) return
    setHoverInfo(null)
  }
  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!enableHoverInfo) return
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <ViewToggle onToggleLayout={onToggleLayout} layout={layout} />

      {/* Filtres */}
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

      {/* Grilles */}
      <AnimatePresence mode="wait">
        {layout === 'default' ? (
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
                  if (item.mediaType === 'spacer') return null
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
                      {item.mediaType === 'image' ? (
                        <Image
                          src={item.src}
                          alt={item.title ?? item.slug}
                          width={300}
                          height={300}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          loading="lazy"
                          unoptimized
                        />
                      ) : (
                        <video
                          src={item.src}
                          muted
                          autoPlay
                          loop
                          playsInline
                          preload="metadata"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip titre/catégorie qui suit la souris */}
      {enableHoverInfo && <HoverInfo info={hoverInfo} position={mousePos} />}
    </>
  )
}
