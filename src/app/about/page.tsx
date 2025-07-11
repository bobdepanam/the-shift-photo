'use client'

import Image from 'next/image'
import styles from '@/styles/components/About.module.scss'

import PageIntro from '@/components/PageIntro/PageIntro'
import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import PerspectiveMask from '@/components/PerspectiveMask/PerspectiveMask'
import FadeInUpBlock from '@/components/AnimText/FadeInUpBlock'

export default function AboutPage() {
  return (
    <div className={styles.aboutWrapper}>
      {/* 🧭 Breadcrumb */}
      <Breadcrumb path={['about']} />

      {/* 🔠 Page introduction */}
      <PageIntro
        title="About"
        subtitle="A visual vault of sketches, drafts, snapshots, and fragments—<br />curated chaos from the edges of the shift."
      />

      {/* ✍️ Intro line */}
<FadeInUpBlock>
      <div className={styles.statementSection}>
            <h1>I’m a multidisciplinary art director crafting motion design, digital experiences, brand identities, and bold illustrations—blending concept, precision, and instinct.</h1>
          </div>
        </FadeInUpBlock>

      {/* 📄 Statements */}
<FadeInUpBlock>
      <div className={styles.statementSection}>
            <p>I develop a versatile creative practice that spans branding, digital design, motion graphics, and illustration. My work combines structure, striking aesthetics, and narrative rhythm to build impactful visual systems.</p>
            <p>I master the full spectrum of design tools—from the Adobe Creative Suite to Figma and 3D workflows—allowing me to shape projects from concept to execution with autonomy and attention to detail.</p>
            <p>My approach bridges strategy and experimentation, always aiming to create immersive and intentional design experiences. Whether it’s a brand, an interface, or a visual story, I bring form and depth to every layer.</p>
          </div>
        </FadeInUpBlock>

      {/* 🧩 Blocks grid */}
      <div className={styles.gridBlocks}>
        <FadeInUpBlock>
          <div>
            <h4>Partners</h4>
            <ul>
              <li>AndAfter</li>
              <li>HR Partners</li>
              <li>Mairie de Nanterre</li>
              <li>Edites 360°</li>
              <li>Dragon Rouge</li>
              <li>ASB Architecture</li>
              <li>Bouvier et Associés</li>
              <li>Nouveau Casino</li>
              <li>MC Saatchi GAD</li>
              <li>Meglio Pasta</li>
            </ul>
          </div>
        </FadeInUpBlock>

        <FadeInUpBlock>
          <div>
            <h4>Expertise</h4>
            <ul>
              <li>Art Direction</li>
              <li>Brand Design</li>
              <li>Editorial Design</li>
              <li>Motion Design</li>
              <li>Digital & UX</li>
              <li>Visual Strategy</li>
              <li>Illustration & Typography</li>
            </ul>
          </div>
        </FadeInUpBlock>

        <FadeInUpBlock>
          <div>
            <h4>Toolset & Technologies</h4>
            <ul>
              <li>
                Adobe Creative Suite <br />
                (Photoshop, Illustrator, InDesign, After Effects)
              </li>
              <li>WordPress, JS, Next.js</li>
              <li>Figma</li>
              <li>Premiere Pro / Resolve</li>
              <li>Lottie / Spline</li>
              <li>Notion / Jira / Airtable</li>
              <li>
                AI Prompt Crafting <br />
                (ChatGPT, Midjourney, Firefly, Runway)
              </li>
              <li>Basic HTML, CSS, Framer, Webflow</li>
            </ul>
          </div>
        </FadeInUpBlock>

        <FadeInUpBlock>
          <div>
            <Image
              src="/images/bastardz/bastardz_18.png"
              alt="Portrait"
              width={500}
              height={600}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </FadeInUpBlock>
      </div>

      {/* 🎭 Outro animation */}
      <PerspectiveMask
        initialImage="/images/london/london_9.jpg"
        title="Revealed"
        description="A trip through the light dunes and storms of memory."
      />
    </div>
  )
}
