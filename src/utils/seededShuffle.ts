export function seededShuffle<T>(items: T[], seed: string): T[] {
  const hash = seed
    .split('')
    .reduce((acc, char) => {
      acc ^= char.charCodeAt(0)
      acc = Math.imul(acc, 0x5bd1e995) ^ (acc >>> 15)
      return acc >>> 0
    }, 0x811c9dc5) >>> 0

  let state = hash || 1
  const rand = () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const result = items.slice()

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}
