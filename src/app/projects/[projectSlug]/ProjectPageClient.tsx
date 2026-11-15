'use client'

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Project } from '@/types/project'

import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import ViewToggle from '@/components/ViewToggle/ViewToggle'
import ProjectClose from '@/components/ProjectClose/ProjectClose'

import { useGsapScrollFade } from '@/hooks/useGsapScrollFade'
import { useGsapParallax } from '@/hooks/useGsapParallax'
import { useGsapHorizontalScroll } from '@/hooks/useGsapHorizontalScroll'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import {
  PROJECT_IMAGE_FALLBACK,
  isVideoSrc,
  parseMediaHash,
  projectImageSizes,
  skipOptimizer,
} from '@/utils/projectMedia'

import { cancelHomeFlight, hasPendingHomeFlight, landHomeFlight } from '@/utils/thumbFlight'
import { getLenis } from '@/utils/lenisInstance'
import stylesClassic from '@/styles/components/ProjectPageClassic.module.scss'
import stylesAlt from '@/styles/components/ProjectPageAlt.module.scss'

// ✅ Enregistrement de ScrollTrigger dans GSAP
gsap.registerPlugin(ScrollTrigger)

type Props = {
  project: Project
}

export default function ProjectPageClient({ project }: Props) {
  const mediaRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [layout, setLayout] = useState<'classic' | 'alt'>('classic')

  // Média ciblé par #m-index (arrivée depuis une vignette) : lu dès le premier rendu.
  // NB : ce composant n'est rendu que côté client (IntroLayoutWrapper), pas de risque d'hydratation.
  const [targetIndex, setTargetIndex] = useState<number | null>(() =>
    typeof window === 'undefined' ? null : parseMediaHash(window.location.hash)
  )
  // Cible au-delà des 8 premiers médias : montée directement, sans rendu intermédiaire
  const [visibleMediaCount, setVisibleMediaCount] = useState<number>(() =>
    Math.min(project.media.length, Math.max(8, (targetIndex ?? 0) + 1))
  )
  // Image à charger en priorité : la cible, sinon la première (hero)
  const priorityIndex = targetIndex ?? 0

  // ✈️ Vol Home → projet en attente pour CE média ? (décidé au premier rendu, synchrone)
  const [arrivingByFlight] = useState(() => hasPendingHomeFlight(project.slug, targetIndex))
  // Le défilement doux vers l'ancre et l'intro GSAP de la colonne sont sautés une fois
  const skipAnchorScrollRef = useRef(false)
  // Devient true dès que le mode change : l'intro GSAP habituelle reprend alors normalement
  const layoutChangedRef = useRef(false)

  useLayoutEffect(() => {
    // Aucun vol pour cette page : un éventuel clone orphelin s'efface (navigation actuelle)
    if (!arrivingByFlight || targetIndex === null) {
      cancelHomeFlight()
      return
    }
    const target = document.getElementById(`m-${targetIndex}`)
    const column = mediaRef.current
    if (!target || !column) {
      cancelHomeFlight()
      return
    }

    // Positionnement INSTANTANÉ sur la cible (même formule que le défilement doux habituel),
    // avant le premier affichage, uniquement parce qu'un vol prend le relais
    const offset = Math.max(0, column.getBoundingClientRect().top + window.scrollY)
    const y = target.getBoundingClientRect().top + window.scrollY - offset
    const lenis = getLenis()
    lenis?.stop()
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' })
    lenis?.start()

    const landed = landHomeFlight({
      slug: project.slug,
      index: targetIndex,
      itemEl: target,
      imgEl: target.querySelector('img'),
    })
    // (StrictMode rejoue l'effet en dev : on ne repasse jamais à false ici)
    if (landed) skipAnchorScrollRef.current = true
    // Montage unique : la décision est prise au premier rendu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const isDesktop = useIsDesktop()

  const visibleMedia = useMemo(
    () => project.media.slice(0, visibleMediaCount),
    [project.media, visibleMediaCount]
  )

  // Changement de projet dans la même instance : on repart de l'ancre courante.
  // Le premier passage est ignoré (l'état initial tient déjà compte de l'ancre).
  const isFirstSlugRef = useRef(true)
  useEffect(() => {
    if (isFirstSlugRef.current) {
      isFirstSlugRef.current = false
      return
    }
    const nextTarget = parseMediaHash(window.location.hash)
    setTargetIndex(nextTarget)
    setVisibleMediaCount(Math.min(project.media.length, Math.max(8, (nextTarget ?? 0) + 1)))
  }, [project.slug, project.media.length])

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Arrivée par vol : déjà positionné instantanément (une seule fois ; un changement de mode
    // classic/alt retrouve ensuite le comportement habituel)
    if (skipAnchorScrollRef.current) {
      skipAnchorScrollRef.current = false
      return
    }
    const containerTop = mediaRef.current?.getBoundingClientRect().top ?? 0
    const OFFSET = Math.max(0, containerTop + window.scrollY)

    const hash = window.location.hash
    if (!hash || !/^#m-\d+$/.test(hash)) return

    const targetIndex = Number(hash.replace('#m-', ''))
    if (Number.isNaN(targetIndex)) return

    if (visibleMediaCount <= targetIndex) {
      setVisibleMediaCount((prev) =>
        Math.min(project.media.length, Math.max(prev, targetIndex + 1))
      )
      return
    }

    const target = document.getElementById(hash.slice(1))
    if (target) {
      const scrollToTarget = () => {
        const y = target.getBoundingClientRect().top + window.scrollY - OFFSET
        window.scrollTo({ top: y, behavior: 'smooth' })
      }

      requestAnimationFrame(() => requestAnimationFrame(scrollToTarget))

      const img = target.querySelector('img')
      if (img) {
        if (typeof img.decode === 'function') {
          img.decode().finally(scrollToTarget)
        } else {
          const onLoad = () => {
            img.removeEventListener('load', onLoad)
            scrollToTarget()
          }
          img.addEventListener('load', onLoad, { once: true })
        }
      }
    }
  }, [layout, project.slug, visibleMediaCount, project.media.length])

  useEffect(() => {
    if (!loadMoreRef.current) return
    if (visibleMediaCount >= project.media.length) return
    const target = loadMoreRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleMediaCount((prev) =>
              Math.min(prev + 6, project.media.length)
            )
          }
        })
      },
      { rootMargin: '400px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [visibleMediaCount, project.media.length])

  // ✅ Animation GSAP spécifique au layout "classic"
  useEffect(() => {
    if (layout !== 'classic') layoutChangedRef.current = true
    if (!mediaRef.current || layout !== 'classic') return
    // Arrivée par vol : la colonne est déjà en place sous le clone (pas d'intro qui la déplace)
    if (arrivingByFlight && !layoutChangedRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mediaRef.current,
        { scale: 1.05, y: 60, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power4.out',
        }
      )

    }, mediaRef)

    return () => ctx.revert()
  }, [layout, arrivingByFlight])

  // ✅ Hooks personnalisés GSAP (animations génériques)
  useGsapScrollFade(`.${stylesClassic.sidebar}`)
  useGsapParallax(`.${stylesClassic.heroImage}`)
  useGsapHorizontalScroll(`.${stylesAlt.layout}`, `.${stylesAlt.altTrack}`)

  return (
    <>
      {/* CLOSE commun aux modes classic et alt : retour vers la grille d'origine */}
      <ProjectClose slug={project.slug} />

      {(() => {
        if (!isDesktop) return null
        return (
          <ViewToggle
            layout={layout === 'classic' ? 'default' : 'alt'}
            onToggleLayout={() =>
              setLayout((prev) => (prev === 'classic' ? 'alt' : 'classic'))
            }
          />
        )
      })()}

      {layout === 'classic' ? (
        // ✅ Layout CLASSIC avec sidebar à gauche et grille d’images
        <div className={stylesClassic.projectPage}>
          <div className={stylesClassic.layout}>
            <aside className={stylesClassic.sidebar} ref={sidebarRef}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              >
                <Breadcrumb path={['projects', project.slug]} />
                <h3>{project.title}</h3>
                <p className={stylesClassic.category}>{project.category}</p>

                {project.content && (
                  <div className={stylesClassic.description}>
                    <ReactMarkdown
                      components={{
                        a: (props) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {project.content}
                    </ReactMarkdown>
                  </div>
                )}
              </motion.div>
            </aside>

            <div className={stylesClassic.mediaColumn} ref={mediaRef}>
              <motion.div
                className={stylesClassic.mediaGrid}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.15 } },
                }}
              >
                {visibleMedia.map((media, index) => (
                  <motion.div
                    id={`m-${index}`}
                    key={`${media.src}-${index}`}
                    className={
                      index === 0
                        ? stylesClassic.heroItem
                        : index % 5 === 1 || index % 5 === 2
                        ? stylesClassic.mediaItemHalf
                        : stylesClassic.mediaItemFull
                    }
                    // Le média ciblé par l'ancre est visible d'emblée (pas de reveal qui le masque)
                    initial={index === targetIndex ? false : { opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    {media.type === 'image' && !isVideoSrc(media.src) ? (
                      <Image
                        src={media.src}
                        unoptimized={skipOptimizer(media.src)}
                        alt={`${project.title} ${index + 1}`}
                        width={media.width ?? PROJECT_IMAGE_FALLBACK.width}
                        height={media.height ?? PROJECT_IMAGE_FALLBACK.height}
                        sizes={projectImageSizes('classic', index)}
                        priority={index === priorityIndex}
                        className={index === 0 ? stylesClassic.heroImage : undefined}
                      />
                    ) : (
                      <video
                        src={media.src}
                        controls
                        muted
                        poster={media.poster}
                        preload="metadata"
                        playsInline
                        className={stylesClassic.video}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
              <div ref={loadMoreRef} style={{ height: 1, width: '100%' }} />
            </div>
          </div>
        </div>
      ) : (
        // ✅ Layout ALT avec header inline (titre + breadcrumb + contenu) puis track média
        <div className={stylesAlt.projectPage}>
          <div className={stylesAlt.layout}>
            <aside className={stylesAlt.sidebar}>
              <motion.div
                className={stylesAlt.sidebarRow}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              >
                {/* Colonne 1 : titre + catégorie */}
                <div className={stylesAlt.sidebarTitle}>
                  <h1>{project.title}</h1>
                  <p className={stylesAlt.category}>{project.category}</p>
                </div>

                {/* Colonne 2 : breadcrumb */}
                <div className={stylesAlt.sidebarBreadcrumb}>
                  <Breadcrumb path={['projects', project.slug]} />
                </div>

                {/* Colonne 3 : contenu */}
                {project.content && (
                  <div className={stylesAlt.sidebarDescription}>
                    <ReactMarkdown
                      components={{
                        a: (props) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {project.content}
                    </ReactMarkdown>
                  </div>
                )}
              </motion.div>
            </aside>

            <div className={stylesAlt.altWrapper}>
              <div className={stylesAlt.altTrack}>
                {visibleMedia.map((media, index) => (
                  <motion.div
                    id={`m-${index}`}
                    key={`${media.src}-${index}`}
                    className={
                      index % 3 === 0
                        ? stylesAlt.mediaItemFull
                        : stylesAlt.mediaItemHalf
                    }
                  >
                    {media.type === 'image' && !isVideoSrc(media.src) ? (
                      <Image
                        src={media.src}
                        unoptimized={skipOptimizer(media.src)}
                        alt={`${project.title} ${index + 1}`}
                        width={media.width ?? PROJECT_IMAGE_FALLBACK.width}
                        height={media.height ?? PROJECT_IMAGE_FALLBACK.height}
                        sizes={projectImageSizes('alt', index)}
                        priority={index === targetIndex}
                        // Dimensions gérées par ProjectPageAlt.module.scss (limite 85vh, ratio d'origine)
                      />
                    ) : (
                      <video
                        src={media.src}
                        muted
                        autoPlay
                        loop
                        poster={media.poster}
                        preload="metadata"
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
              <div ref={loadMoreRef} style={{ height: 1, width: '100%' }} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
