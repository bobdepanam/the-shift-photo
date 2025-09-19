'use client'

import Image from 'next/image'
import styles from '@/styles/components/About.module.scss'

import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import PerspectiveMask from '@/components/PerspectiveMask/PerspectiveMask'
import FadeInUpBlock from '@/components/AnimText/FadeInUpBlock'

export default function AboutPage() {
  return (
    <div className={styles.aboutWrapper}>
      {/* 🧭 Breadcrumb */}
      <Breadcrumb path={['about']} />

      {/* === HERO HEADER : "ABOUT" + kicker à droite === */}
      <header className={styles.headerHero}>
        <h1 className={styles.heroTitle}>ABOUT</h1>
        <p className={styles.heroKicker}>
          “In my craft or sullen art… I labour by singing light…” — Dylan Thomas
        </p>
      </header>

      <hr className={styles.rule} />

      {/* === META GRID : Texte / Services+Clients / Image === */}
      <section className={styles.metaGrid}>
        {/* Col A — Intro identité */}
        <div className={styles.metaColText}>
          <FadeInUpBlock>
            <p>
              I am a multi-disciplinary Creative Director and Visual Researcher working at the
              intersection of design, photography, illustration, and experimental media.
              My approach blends hand-crafted intuition with technological precision —
              from analogue film and ink to digital motion systems and AI-assisted workflows.
            </p>
          </FadeInUpBlock>

          <FadeInUpBlock>
            <p>
              Tools evolve — Adobe, AI, analogue cameras, or code — but curiosity is the constant.
              Each project becomes a crafted dialogue between form and atmosphere, illustration and motion,
              light and silence. The aim is simple: make work that feels inevitable.
            </p>
          </FadeInUpBlock>
        </div>

        {/* Col B — Services + Clients */}
        <div className={styles.metaColLists}>
          <FadeInUpBlock>
            <h3>Services</h3>
            <ul>
              <li>Creative Direction & Brand Positioning</li>
              <li>Art Direction & Campaign Concepts</li>
              <li>Visual Identity & Advanced Typography Systems</li>
              <li>Illustration & Editorial Compositions (Illustrator, Photoshop, Fresco)</li>
              <li>Photography — Film & Digital / Darkroom & Retouch</li>
              <li>Motion Design & Video Art (After Effects, Premiere Pro, DaVinci Resolve)</li>
              <li>Generative & AI-assisted Imagery (Midjourney, Stable Diffusion, Adobe Firefly)</li>
              <li>3D & Experimental Media (Cinema4D, Blender)</li>
              <li>Web & Interactive Design (Figma, Webflow, Next.js headless setups)</li>
              <li>Print & Editorial Production (InDesign, Risograph, Offset)</li>
            </ul>
          </FadeInUpBlock>

          <FadeInUpBlock>
            <h3>Selected Clients & Collaborations</h3>
            <ul>
              <li>Independent Fashion Designers & Studios</li>
              <li>Music Labels & Recording Artists</li>
              <li>Art Galleries, Cultural Institutions & Festivals</li>
              <li>Design Studios & Creative Agencies</li>
              <li>Tech Startups exploring AI-driven aesthetics</li>
              <li>Publishing Houses & Editorial Platforms</li>
            </ul>
          </FadeInUpBlock>
        </div>

        {/* Col C — Image forte */}
        <div className={styles.metaColImage}>
          <Image
            src="/images/craft/craft_03.webp"
            alt="Studio texture"
            width={920}
            height={1200}
            priority
          />
        </div>
      </section>

      <hr className={styles.rule} />

      {/* === BIG STATEMENT : deux colonnes typographiques === */}
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

      {/* === Bandeau de mini-vignettes (projets récents) === */}
      <section className={styles.thumbStrip}>
        <ul>
          <li>
            <Image src="/images/london/london_27.webp" alt="London" width={220} height={140} />
          </li>
          <li>
            <Image src="/images/craft/macshift_02.gif" alt="Tokyo" width={220} height={140} />
          </li>
          <li>
            <Image src="/images/tokyo/tokyo_16.webp" alt="Craft" width={220} height={140} />
          </li>
          <li>
            <Image src="/images/craft/craft_05.webp" alt="The Shift" width={220} height={140} />
          </li>
          <li>
            <Image src="/images/craft/craft_04.webp" alt="The Shift" width={220} height={140} />
          </li>
        </ul>
      </section>

      {/* 🎭 Outro animation (inchangé) */}
      <PerspectiveMask
        initialImage="/images/london/london_9.webp"
        title="Revealed"
        description="A trip through the light dunes and storms of memory."
      />
    </div>
  )
}
