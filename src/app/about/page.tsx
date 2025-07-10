'use client'

import styles from '@/styles/components/About.module.scss'
import Image from 'next/image'
import PageIntro from '@/components/PageIntro/PageIntro'
import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import PerspectiveMask from '@/components/PerspectiveMask/PerspectiveMask'
import SplitText from '@/components/AnimText/SplitText'
import FadeInUpBlock from '@/components/AnimText/FadeInUpBlock'

export default function AboutPage(): JSX.Element {
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
      <SplitText
        text="I’m a multidisciplinary art director crafting motion design, digital experiences, brand identities, and bold illustrations—blending concept, precision, and instinct."
        as="h2"
      />

      {/* 📄 Statements */}
      <div className={styles.statementSection}>
        <SplitText text="I develop a versatile creative practice that spans branding, digital design, motion graphics, and illustration. My work combines structure, striking aesthetics, and narrative rhythm to build impactful visual systems." />
        <SplitText text="I master the full spectrum of design tools—from the Adobe Creative Suite to Figma and 3D workflows—allowing me to shape projects from concept to execution with autonomy and attention to detail." />
        <SplitText text="My approach bridges strategy and experimentation, always aiming to create immersive and intentional design experiences. Whether it’s a brand, an interface, or a visual story, I bring form and depth to every layer." />
      </div>

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
              <li>Adobe Creative Suite <br></br>(Photoshop, Illustrator, InDesign, After Effects)</li>
               <li>wordpress,js, Next.js</li>
              <li>Figma</li>
              <li>Premiere Pro / Resolve</li>
              <li>Lottie / Spline</li>
              <li>Notion / Jira / Airtable</li>
              <li>AI Prompt Crafting <br></br>(ChatGPT, Midjourney, Firefly, Runway)</li>
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

      {/* 📫 Contact */}
      {/* <FadeInUpBlock>
        <div className={styles.contactSection}>
          <h4>Further Information</h4>
          <ul>
            <li>Passion in visual & digital culture</li>
            <li>Available for collaborations and commissions</li>
            <li>
              Contact:{' '}
              <a href="mailto:hello@bastardz.fr">hello@bastardz.fr</a>
            </li>
          </ul>
        </div>
      </FadeInUpBlock> */}

      {/* 🎭 Outro animation */}
      <PerspectiveMask
        initialImage="/images/london/london_9.jpg"
        title="Revealed"
        description="A trip through the light dunes and storms of memory."
      />
    </div>
  )
}
