'use client'

import Image from 'next/image'
import styles from '@/styles/components/About.module.scss'
import ParallaxText from '@/components/Parallaxtext/Parallaxtext'
import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import PerspectiveMask from '@/components/PerspectiveMask/PerspectiveMask'
import FadeInUpBlock from '@/components/AnimText/FadeInUpBlock'

export default function AboutPage() {
  return (
    <div className={styles.aboutWrapper}>
      {/* 🧭 Breadcrumb */}
      <Breadcrumb path={['about']} />

      {/* 🌀 Parallax header */}
      <ParallaxText
        sections={[
          {
            imageSrc: '/images/craft/macshift_03.gif',
            subheading: '',
            heading: 'Go ask Alice',
            headingColor: 'white',
            subheadingColor: 'inherit',
          },
        ]}
      />

      <hr className={styles.rule} />

      {/* === META GRID : Approach / Services / Experience / Clients / Image === */}
      <section className={styles.metaGrid}>
        {/* Col A — Approach & Experience */}
        <div className={styles.metaColText}>
          <FadeInUpBlock>
            <h3>Approach</h3>
            <p>
              Senior Art Director working across image, motion and digital craft.
              I design visual systems, identities and atmospheres with a precise,
              minimal and multidisciplinary approach.
            </p>
            <p>
              My practice spans photography, editorial design, motion direction and
              digital platforms. I build brands and experiences where form, clarity
              and emotion align from crafted visuals to functional interfaces.
            </p>
            <p>
              I integrate AI-driven processes into classic art-direction workflows,
              using generative tools for research, iteration and refinement rather
              than shortcuts. Technology amplifies the idea, it never replaces it.
            </p>
          </FadeInUpBlock>

          <FadeInUpBlock>
            <h3>Experience</h3>
            <p>
              I balance agency work and independent practice, moving between brand,
              digital and image-led projects. Senior Art Direction for brands, studios and agencies</p>
            <p>Ongoing collaborations on visual identities and campaigns. Image, motion and web projects under The Shift studio. Exploration of AI-enhanced creative workflows in production</p>
          </FadeInUpBlock>
        </div>

        {/* Col B — Services & Clients */}
        <div className={styles.metaColText}>
          <FadeInUpBlock>
            <h3>Skills</h3>

            <p>Art Direction & graphic overlays,
            Brand Identity & Visual Systems,
            Campaign Concepts & Visual Narratives,
            Photography : Editorial, Lifestyle & Product,
            Motion Direction & Video Compositions</p>

            <h3>Digital & AI</h3>
            <p>Digital Design / UX, UI & Web design,
            Next, TypeScript, Three.js, Wordpress...
            Creative consulting & training on AI workflows</p>

            <h3>Print & Craft</h3>
            <p>Print, Screen Printing & Editorial Layouts,
            Posters, booklets and object-based visuals</p>
          </FadeInUpBlock>


        </div>

        {/* Col C — Image forte */}
        <div className={styles.metaColImage}>
          {/* <Image
            src="/images/craft/craft_03.webp"
            alt="Studio texture"
            width={920}
            height={1200}
            priority
          /> */}
                    <FadeInUpBlock>
            <h3>Clients & Collaborations</h3>
            <p>
              I work with teams that care about image, detail and consistency across
              every touchpoint
            </p>
            <p>Creative agencies & independent design studios,
            Innovation, tech & healthcare brands,
            Fashion, lifestyle & food projects,
            Music, culture & editorial platforms,
            Teams exploring AI-enhanced visual workflows</p>
          </FadeInUpBlock>
        </div>
        
      </section>

      <hr className={styles.rule} />

      {/* === Bandeau de mini-vignettes === */}
      <section className={styles.thumbStrip}>
        <ul>
          <li>
            <Image src="/images/london/still-inside-the-flow.webp" alt="London" width={220} height={140} />
          </li>
          <li>
            <Image src="/images/craft/macshift_02.gif" alt="Craft" width={220} height={140} />
          </li>
          <li>
            <Image src="/images/tokyo/moving-without-touch.webp" alt="Tokyo" width={220} height={140} />
          </li>
          <li>
            <Image src="/images/craft/slow-precise-movements.webp" alt="The Shift" width={220} height={140} />
          </li>
          <li>
            <Image src="/images/craft/nothing-is-rushed.webp" alt="The Shift" width={220} height={140} />
          </li>
        </ul>
      </section>

      {/* === BIG STATEMENT === */}
      <section className={styles.bigStatement}>
        <div className={styles.bigLeft}>
          <h2>
            ALL<br />
            EXTREMES<br />
            OF FEELING<br />
            ARE ALLIED
          </h2>
        </div>
        <div className={styles.bigRight}>
          <h3>WITH<br />MADNESS</h3>
        </div>
      </section>

      {/* 🎭 Outro animation */}
      <PerspectiveMask
        initialImage="/images/london/time-moves-sideways.webp"
        title="Revealed"
        description="A trip through the light dunes and storms of memory."
      />
    </div>
  )
}
