declare module '@studio-freight/lenis' {
    export interface LenisScrollEvent {
      scroll: number
      progress: number
      velocity: number
      direction: 1 | -1
    }
  
    export default class Lenis {
      constructor(options?: {
        duration?: number
        easing?: (t: number) => number
        direction?: 'vertical' | 'horizontal'
        gestureDirection?: 'vertical' | 'horizontal'
        smooth?: boolean
        mouseMultiplier?: number
        smoothTouch?: boolean
        touchMultiplier?: number
        infinite?: boolean
      })
  
      on(event: 'scroll', callback: (args: LenisScrollEvent) => void): void
      raf(time: number): void
      scrollTo(
        target: number | string | HTMLElement,
        options?: {
          offset?: number
          immediate?: boolean
          duration?: number
          easing?: (t: number) => number
        }
      ): void
      destroy(): void
    }
  }
  