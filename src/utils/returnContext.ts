// src/utils/returnContext.ts
// Contexte de retour explicite pour le CLOSE des pages projet (sessionStorage, par onglet).
//
// 1. Ouverture d'un projet depuis une grille → saveReturnContext()
// 2. CLOSE sur la page projet → resolveCloseTarget() : cible + restauration à faire
// 3. Page d'origine → peekHomeRestore() puis clearHomeRestore() une fois appliquée
//
// Sans contexte valide (accès direct, autre projet, contexte expiré) : retour vers '/'.

export type HomeLayout = 'default' | 'alt'

export type HomeReturnState = {
  layout: HomeLayout
  /** Graine du mélange de la grille alt au moment de l'ouverture */
  seed: string
  visibleCount: number
  scrollY: number
}

type ReturnOrigin = '/' | '/archive'

type ReturnContext = {
  from: ReturnOrigin
  slug: string
  ts: number
  home?: HomeReturnState
}

type PendingRestore = { ts: number; home: HomeReturnState }

const CONTEXT_KEY = 'shift:return-context'
const RESTORE_KEY = 'shift:home-restore'
/** Durée de validité d'un contexte d'ouverture */
const CONTEXT_MAX_AGE = 30 * 60 * 1000
/** La restauration doit suivre immédiatement le CLOSE */
const RESTORE_MAX_AGE = 15 * 1000

const ORIGINS: ReturnOrigin[] = ['/', '/archive']

function read<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // stockage indisponible (navigation privée stricte…) : CLOSE retombera sur '/'
  }
}

function remove(key: string) {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // ignoré
  }
}

const isHomeState = (value: unknown): value is HomeReturnState => {
  const v = value as HomeReturnState
  return (
    !!v &&
    (v.layout === 'default' || v.layout === 'alt') &&
    typeof v.seed === 'string' &&
    Number.isFinite(v.visibleCount) &&
    Number.isFinite(v.scrollY)
  )
}

export const randomSeed = () => Math.random().toString(36).slice(2, 10)

/** À l'ouverture d'un projet depuis une grille */
export function saveReturnContext(context: Omit<ReturnContext, 'ts'>) {
  write(CONTEXT_KEY, { ...context, ts: Date.now() })
}

/**
 * Cible du CLOSE pour la page `slug`. Le contexte est toujours consommé.
 * `restoreHome` indique qu'une restauration de la Home a été programmée.
 */
export function resolveCloseTarget(slug: string): { target: ReturnOrigin; restoreHome: boolean } {
  const context = read<ReturnContext>(CONTEXT_KEY)
  remove(CONTEXT_KEY)

  const valid =
    !!context &&
    context.slug === slug &&
    ORIGINS.includes(context.from) &&
    Number.isFinite(context.ts) &&
    Date.now() - context.ts < CONTEXT_MAX_AGE

  if (!valid) {
    remove(RESTORE_KEY)
    return { target: '/', restoreHome: false }
  }

  if (context.from === '/' && isHomeState(context.home)) {
    write(RESTORE_KEY, { ts: Date.now(), home: context.home } satisfies PendingRestore)
    return { target: '/', restoreHome: true }
  }

  // '/archive' : retour simple (restauration à prévoir avec le premier lien explicite)
  remove(RESTORE_KEY)
  return { target: context.from, restoreHome: false }
}

/** Lecture non destructive (sûre en StrictMode) de la restauration programmée */
export function peekHomeRestore(): HomeReturnState | null {
  if (typeof window === 'undefined') return null
  const pending = read<PendingRestore>(RESTORE_KEY)
  if (!pending) return null

  const fresh = Number.isFinite(pending.ts) && Date.now() - pending.ts < RESTORE_MAX_AGE
  if (!fresh || !isHomeState(pending.home)) {
    remove(RESTORE_KEY)
    return null
  }
  return pending.home
}

/** À appeler une fois la restauration appliquée (ou abandonnée) */
export function clearHomeRestore() {
  remove(RESTORE_KEY)
}
