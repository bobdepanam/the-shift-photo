'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Project } from '@/types/project'

import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import ViewToggle from '@/components/ViewToggle/ViewToggle'

import { useGsapScrollFade } from '@/hooks/useGsapScrollFade'
import { useGsapParallax } from '@/hooks/useGsapParallax'
import { useGsapHorizontalScroll } from '@/hooks/useGsapHorizontalScroll'

import stylesClassic from '@/styles/components/ProjectPageClassic.module.scss'
import stylesAlt from '@/styles/components/ProjectPageAlt.module.scss'

// ✅ Enregistrement de ScrollTrigger dans GSAP (important)
gsap.registerPlugin(ScrollTrigger)

type Props = {
  project: Project
}

export default function ProjectPageClient({ project }: Props) {
  const mediaRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<'classic' | 'alt'>('classic')

  // ✅ Animation GSAP spécifique au layout "classic"
  useEffect(() => {
    if (!mediaRef.current || layout !== 'classic') return

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

      gsap.to(mediaRef.current, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: mediaRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, mediaRef)

    return () => ctx.revert()
  }, [layout])

  // ✅ Hooks personnalisés GSAP (animations génériques)
  useGsapScrollFade(`.${stylesClassic.sidebar}`)
  useGsapParallax(`.${stylesClassic.image}`)
  useGsapHorizontalScroll(`.${stylesAlt.layout}`, `.${stylesAlt.altTrack}`)

  return (
    <>
      <ViewToggle
        layout={layout === 'classic' ? 'default' : 'alt'}
        onToggleLayout={() =>
          setLayout((prev) => (prev === 'classic' ? 'alt' : 'classic'))
        }
      />

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
                <h1>{project.title}</h1>
                <p className={stylesClassic.category}>{project.category}</p>

                {project.content && (
                  <div className={stylesClassic.description}>
                    <p>{project.content}</p>
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
                {project.media.map((media, index) => (
                  <motion.div
                    key={`${media.src}-${index}`}
                    className={
                      index === 0
                        ? stylesClassic.mediaItemFull
                        : index % 5 === 1 || index % 5 === 2
                        ? stylesClassic.mediaItemHalf
                        : stylesClassic.mediaItemFull
                    }
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    {media.type === 'image' ? (
                      <Image
                        src={media.src}
                        alt={`${project.title} ${index + 1}`}
                        width={1600}
                        height={1000}
                        className={stylesClassic.image}
                      />
                    ) : (
                      <video
                        src={media.src}
                        controls
                        muted
                        className={stylesClassic.video}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        // ✅ Layout ALT avec scroll horizontal et visuels en track
        <div className={stylesAlt.projectPage}>
          <div className={stylesAlt.layout}>
            <aside className={stylesAlt.sidebar}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              >
                <h1>{project.title}</h1>
                <p className={stylesAlt.category}>{project.category}</p>

                {project.content && (
                  <div className={stylesAlt.description}>
                    <p>{project.content}</p>
                  </div>
                )}
              </motion.div>
            </aside>

            <div className={stylesAlt.altWrapper}>
              <div className={stylesAlt.altTrack}>
                {project.media.map((media, index) => (
                  <motion.div
                    key={`${media.src}-${index}`}
                    className={
                      index % 3 === 0
                        ? stylesAlt.mediaItemFull
                        : stylesAlt.mediaItemHalf
                    }
                  >
                    {media.type === 'image' ? (
                      <Image
                        src={media.src}
                        alt={`${project.title} ${index + 1}`}
                        width={1600}
                        height={1000}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <video
                        src={media.src}
                        muted
                        autoPlay
                        loop
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}
