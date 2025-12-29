import type { Metadata } from 'next'
import Image from 'next/image'
import styles from '@/styles/components/About.module.scss'
import ParallaxText from '@/components/Parallaxtext/Parallaxtext'
import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import PerspectiveMask from '@/components/PerspectiveMask/PerspectiveMask'
import FadeInUpBlock from '@/components/AnimText/FadeInUpBlock'

export const metadata: Metadata = {
  title: 'statement',
  description: 'Statement of approach, posture, and profile in art direction and image.',
}

export default function AboutPage() {
  return (
    <div className={styles.aboutWrapper}>
      {/* 🧭 Breadcrumb */}
      <Breadcrumb path={['statement']} />

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
            <p>Senior Art Director working across image, motion and digital craft.</p>
            <p>I design visual systems, identities and atmospheres with a precise, restrained and multidisciplinary approach.</p>
            <p>My practice moves between photography, editorial design, motion direction and digital platforms. I focus on building coherent visual languages where form, clarity and emotion align — from crafted images to functional interfaces.</p>
            <p>I use AI as part of my creative toolkit when it serves the process: for research, iteration and controlled experimentation. It remains an assistive tool, never a shortcut. The idea, the direction and the final responsibility stay human.</p>
          </FadeInUpBlock>

          <FadeInUpBlock>
            <h3>Experience</h3>
            <p>I balance agency work and independent practice, collaborating with brands, studios and creative teams on image-led and digital projects.</p>
            <p>My experience includes senior art direction for visual identities, campaigns and digital platforms, as well as long-term collaborations on brand systems, photography, motion and web-based experiences.</p>
            <p>Under The Shift, I develop personal and commissioned projects at the intersection of image, design and digital craft, exploring new production methods while maintaining a strong sense of authorship and execution.</p>
          </FadeInUpBlock>
        </div>

        {/* Col B — Services & Clients */}
        <div className={styles.metaColLists}>
          <FadeInUpBlock>
            <h3>Skills</h3>
            <ul>
              <li>Art Direction, visual concepts and graphic systems.</li>
              <li>Brand identity, visual languages and long-term design frameworks.</li>
              <li>Campaign concepts and visual narratives.</li>
              <li>Photography — editorial, lifestyle and product.</li>
              <li>Motion direction and video compositions.</li>
            </ul>

            <h3>Digital &amp; AI</h3>
            <ul>
              <li>Digital design across UX, UI and web-based experiences.</li>
              <li>Creative development and prototyping using Next.js, TypeScript, Three.js and WordPress.</li>
              <li>Research and visual exploration occasionally supported by AI-assisted tools, within a clearly defined creative framework.</li>
              <li>I also provide creative consulting and training on AI-assisted workflows, focusing on practical, ethical and production-ready applications rather than speculative hype.</li>
            </ul>

            <h3>Print &amp; Craft</h3>
            <ul>
              <li>Print design, screen printing and editorial layouts.</li>
              <li>Posters, booklets and object-based visuals, with close attention to materials, scale and production constraints.</li>
            </ul>
          </FadeInUpBlock>
        </div>

        {/* Col C — Image forte */}
        <div className={`${styles.metaColImage} ${styles.metaColLists}`}>
          {/* <Image
            src="/images/craft/craft_03.webp"
            alt="Studio texture"
            width={920}
            height={1200}
            priority
          /> */}
          <FadeInUpBlock>
            <h3>Clients & Collaborations</h3>
            <p>I work with teams that value image, detail and consistency across every touchpoint.</p>
            <ul>
              <li>Creative agencies and independent studios.</li>
              <li>Innovation, tech and healthcare brands.</li>
              <li>Fashion, lifestyle and food projects.</li>
              <li>Music, culture and editorial platforms.</li>
            </ul>
            <p>I’m particularly comfortable collaborating with teams looking to bridge strong visual direction with digital and technical execution.</p>
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
