'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

import stylesDefault from '@/styles/components/ProjectGridDefault.module.scss'
import stylesAlt from '@/styles/components/ProjectGridAlt.module.scss'
import stylesFilters from '@/styles/components/ProjectFilters.module.scss'

import ProjectFilter from '@/components/ProjectGrid/ProjectFilter'
import shuffleArray from '@/utils/shuffleArray'
import { useRouter } from 'next/navigation'
import ViewToggle from '@/components/ViewToggle/ViewToggle'
import HoverPreview from './HoverPreview'
import useHoverPreview from '@/hooks/useHoverPreview'
import { useGsapScrollFade } from '@/hooks/useGsapScrollFade'

import FilterOn from '@/icons/filter_on.svg'
import FilterOff from '@/icons/filter_off.svg'

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
  media: {
    type: 'image' | 'video'
    src: string
  }[]
  content: string
}

type ProjectGridProps = {
  projects: Project[]
  layout: 'default' | 'alt'
  onToggleLayout: () => void
}

export default function ProjectGrid({ projects, layout, onToggleLayout }: ProjectGridProps): JSX.Element {
  const router = useRouter()
  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [hasMounted, setHasMounted] = useState(false)
  const { media, position, isMobile, setMedia, clearMedia } = useHoverPreview()

  useGsapScrollFade(`.${stylesDefault.gridItem}`)
  useGsapScrollFade(`.${stylesAlt.thumbItem}`)

  useEffect(() => {
    if (!projects || projects.length === 0) return

    const allMedia: GridItem[] = projects.flatMap((project) =>
      project.media.map((media) => ({
        slug: project.slug,
        title: project.title,
        category: project.category,
        mediaType: media.type,
        src: media.src
      }))
    )

    const shuffled = shuffleArray(allMedia)
    const total = shuffled.length
    const spacerCount = Math.floor(total * 0.1)

    for (let i = 0; i < spacerCount; i++) {
      const index = Math.floor(Math.random() * shuffled.length)
      shuffled.splice(index, 0, {
        slug: `spacer-${i}`,
        category: 'spacer',
        mediaType: 'spacer',
        src: ''
      })
    }

    setGridItems(shuffled)
  }, [projects])

  useEffect(() => {
    const isMobileScreen = window.innerWidth < 768
    setShowFilters(!isMobileScreen)
    setHasMounted(true)
  }, [])

  const visibleItems =
    activeCategory === 'all'
      ? gridItems
      : gridItems.filter((item) => item.category === activeCategory)

  const handleNavigate = (href: string) => {
    router.push(href)
  }

  return (
    <>
      <ViewToggle onToggleLayout={onToggleLayout} layout={layout} />

      {/* Zone boutons filtre + catégories */}
      <div className={stylesFilters.filtersWrapper}>
        <button
          className={stylesFilters.filtersButton}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
        >
          {showFilters ? <FilterOff /> : <FilterOn />}
        </button>

        <AnimatePresence mode="wait">
          {hasMounted && showFilters && (
            <ProjectFilter
              key="filters"
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Zone affichage grilles avec AnimatePresence */}
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
                  return <div key={`spacer-${index}`} className={stylesDefault.gridSpacer}></div>
                }

                return (
                  <motion.div
                    key={`project-${item.slug}-${item.src}-${index}`}
                    className={`${stylesDefault.gridItem} string`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                    layout
                    onClick={() => handleNavigate(`/projects/${item.slug}`)}
                  >
                    {item.mediaType === 'image' ? (
                      <Image
                        src={item.src}
                        alt={item.slug}
                        width={500}
                        height={600}
                        style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                      />
                    ) : (
                      <video
                        src={item.src}
                        controls
                        muted
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
                      onMouseEnter={() => {
                        if (!isMobile && (item.mediaType === 'image' || item.mediaType === 'video')) {
                          setMedia({ type: item.mediaType, src: item.src })
                        }
                      }}
                      onMouseLeave={clearMedia}
                    >
                      {item.mediaType === 'image' ? (
                        <Image
                          src={item.src}
                          alt={item.slug}
                          width={300}
                          height={300}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      ) : (
                        <video
                          src={item.src}
                          muted
                          autoPlay
                          loop
                          playsInline
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              <HoverPreview media={media} position={position} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
