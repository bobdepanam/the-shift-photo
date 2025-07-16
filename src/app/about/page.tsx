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
      subtitle={`“In my craft or sullen art… I labour by singing light…” – Dylan Thomas`}/>

      {/* ✍️ Intro line */}
<FadeInUpBlock>
      <div className={styles.statementSection}>
    <h1>To create is to sense. To assemble is to listen.</h1>
          </div>
        </FadeInUpBlock>

      {/* 📄 Statements */}
<FadeInUpBlock>
      <div className={styles.statementSection}>    
        <p>A multi‑disciplinary maker exploring analogue & digital realms: photography, visual experiments, typography, textures, light & shadow.
</p>
    <p>Tools evolve—but curiosity is the constant. Each project is a dialogue between instinct and craft, form and atmosphere.</p>
    <p>These works are small moments; glimpses shared with anyone open to pause, to feel, and to wander. </p> </div>
        </FadeInUpBlock>
        <FadeInUpBlock>
  <div className={styles.statementSection}>
      <h2>“A visual whisper in pursuit of quiet resonance and handcrafted alchemy.”</h2>         
       </div>
        </FadeInUpBlock>
      {/* 🧩 Blocks grid */}
      <div className={styles.gridBlocks}>
        <FadeInUpBlock>
          <div>
            <Image
              src="/images/bastardz/bastardz_18.png"
              alt="Portrait"
              width={500}
              height={600}
              style={{ width: '20%', height: 'auto' }}
            />
          </div>
        </FadeInUpBlock>
        <FadeInUpBlock>
          <div>
            <Image
              src="/images/theshift/theshift_116.jpg"
              alt="Portrait"
              width={500}
              height={600}
              style={{ width: '30%', height: 'auto' }}
            />
          </div>
        </FadeInUpBlock>
        <FadeInUpBlock>
          <div>
            <Image
              src="/images/tokyo/tokyo_37.jpg"
              alt="Portrait"
              width={500}
              height={600}
              style={{ width: '40%', height: 'auto' }}
            />
          </div>
        </FadeInUpBlock>
        <FadeInUpBlock>
          <div>
            <Image
              src="/images/craft/craft_03.jpg"
              alt="Portrait"
              width={500}
              height={600}
              style={{ width: '10%', height: 'auto' }}
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
