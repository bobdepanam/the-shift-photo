// src/utils/motionTokens.ts
// Helpers to read motion tokens from CSS variables with safe fallbacks.

const parseDuration = (value: string, fallback: number) => {
  const trimmed = value.trim()
  if (!trimmed) return fallback

  const numeric = parseFloat(trimmed)
  if (Number.isNaN(numeric)) return fallback

  if (trimmed.endsWith('ms')) return numeric / 1000
  if (trimmed.endsWith('s')) return numeric

  return numeric
}

export const getMotionTokens = () => {
  if (typeof window === 'undefined') {
    return {
      durationFast: 0.15,
      durationBase: 0.25,
      durationSlow: 0.4,
      easingOut: 'power3.out',
      easingInOut: 'power2.inOut',
    }
  }

  const styles = getComputedStyle(document.documentElement)

  const easingOut = styles.getPropertyValue('--easing-out').trim() || 'power3.out'
  const easingInOut = styles.getPropertyValue('--easing-in-out').trim() || 'power2.inOut'

  return {
    durationFast: parseDuration(styles.getPropertyValue('--duration-fast'), 0.15),
    durationBase: parseDuration(styles.getPropertyValue('--duration-base'), 0.25),
    durationSlow: parseDuration(styles.getPropertyValue('--duration-slow'), 1),
    easingOut,
    easingInOut,
  }
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
