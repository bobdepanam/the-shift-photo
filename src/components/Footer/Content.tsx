import { ReactElement } from 'react'
import Section1 from './Section1'
import Section2 from './Section2'
import styles from '@/styles/components/Footer.module.scss'

export default function Content(): ReactElement {
  return (
    <div className={styles.content}>
      <Section1 />
      <Section2 />
    </div>
  )
}
