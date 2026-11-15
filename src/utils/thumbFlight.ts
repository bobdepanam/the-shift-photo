// src/utils/thumbFlight.ts
// Transition « vol de vignette » Commissions : mosaïque (4:5 recadré) ↔ galerie verticale (ratio réel).
//
// Anti-déformation : un seul clone, construit au ratio RÉEL de l'image (géométrie de la galerie).
// Il n'est jamais étiré : translaté le long d'une courbe douce et mis à l'échelle de façon UNIFORME.
// Côté vignette, un masque clip-path recadre l'image en 4:5 centré — comme le `cover` de la mosaïque.
//
// Trajectoire : courbe de Bézier quadratique (départ → point de contrôle décalé → arrivée), soit la
// même courbe à 3 points qu'un MotionPath, sans MotionPathPlugin (8 Ko de moins).
//
// Chargement : le cœur GSAP n'est pas dans le bundle initial de /archive (Lenis n'importe que
// ScrollTrigger). Il est préparé par anticipation — au repos du navigateur après l'affichage,
// puis au survol / pointerdown en secours — pour être prêt AVANT le premier clic. Auparavant, le
// chargement ne démarrait qu'au survol : au premier clic, le plugin n'était pas prêt → fondu.
//
// Impératif et hors React : le clone survit au démontage de l'overlay (vol retour), une seule
// transition active à la fois, nettoyage systématique, aucune boucle permanente.

type Gsap = typeof import('gsap').gsap
type Timeline = ReturnType<Gsap['timeline']>

let gsap: Gsap | null = null
let loading: Promise<void> | null = null

/** Interrupteur global : false → aucun code de vol n'est exécuté (comportement précédent). */
export const THUMB_FLIGHT_ENABLED = true

const OPEN_DURATION = 0.75 // s
const CLOSE_DURATION = 0.75 // s (uniquement pour le vol retour ; le fondu de repli est inchangé)
const EASE = 'power3.inOut' // proche de l'easing signature, sans rebond
const CURVE = 0.08 // flèche de la courbe : 8 % de la distance (trajectoire courte et subtile)
const LAND_FADE = 0.15 // relève clone → image réelle
const LAND_TIMEOUT = 1200 // ms : on n'attend jamais plus l'image réelle
const Z_INDEX = 2050 // au-dessus de l'overlay (2000), sous le curseur

/* ---------------------------- Instrumentation (dev uniquement) ---------------------------- */

const debug = (message: string, detail?: unknown) => {
  if (process.env.NODE_ENV === 'production') return // éliminé du bundle de production
  // Niveau « verbose » de la console Chrome : invisible par défaut
  console.debug(`[thumbFlight] ${message}`, detail ?? '')
}

/* ------------------------------------------------------------------------------------------ */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Au moins une transition active (Commissions ou Home) ? */
const anyFlightEnabled = () => THUMB_FLIGHT_ENABLED || HOME_FLIGHT_ENABLED

/** Charge le cœur GSAP (une fois, en arrière-plan). Sans effet si les vols sont désactivés. */
export function prepareThumbFlight(): Promise<void> {
  if (!anyFlightEnabled() || typeof window === 'undefined' || prefersReducedMotion()) {
    return Promise.resolve()
  }
  if (!loading) {
    loading = import('gsap')
      .then((mod) => {
        gsap = mod.gsap
        debug('GSAP prêt')
      })
      .catch((error) => {
        loading = null // nouvel essai au prochain survol ; en attendant : fondu
        debug('échec du chargement de GSAP', error)
      })
  }
  return loading
}

/** Préparation au repos du navigateur (ne retarde jamais l'affichage de la page) */
export function prepareThumbFlightWhenIdle(enabled = anyFlightEnabled()): () => void {
  if (!enabled || typeof window === 'undefined') return () => {}
  const run = () => void prepareThumbFlight()
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(run, { timeout: 2000 })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(run, 800)
  return () => clearTimeout(id)
}

/** Moteur prêt (GSAP chargé, mouvement autorisé) ? (synchrone, jamais d'attente) */
function engineReady(): boolean {
  if (prefersReducedMotion()) {
    debug('repli : prefers-reduced-motion')
    return false
  }
  if (!gsap) {
    debug('repli : GSAP pas encore chargé au moment du clic')
    void prepareThumbFlight()
    return false
  }
  return true
}

/** Vol Commissions possible immédiatement ? */
export function canFly(): boolean {
  return THUMB_FLIGHT_ENABLED && engineReady()
}

type Rect = { left: number; top: number; width: number; height: number }
type Point = { x: number; y: number }

const toRect = (r: DOMRect): Rect => ({ left: r.left, top: r.top, width: r.width, height: r.height })

/** Élément présent, mesurable et au moins partiellement visible (aucun scroll forcé) */
function usableReason(el: Element | null | undefined): string | null {
  if (!el || !(el instanceof HTMLElement)) return 'élément absent'
  if (!el.isConnected) return 'élément détaché du DOM'
  const r = el.getBoundingClientRect()
  if (r.width < 2 || r.height < 2) return `dimensions invalides (${r.width}x${r.height})`
  if (r.bottom <= 0 || r.right <= 0 || r.top >= window.innerHeight || r.left >= window.innerWidth) {
    return 'hors écran'
  }
  return null
}

/**
 * État « vignette » du clone, relatif à sa géométrie finale `full` (ratio réel) :
 * translation des centres, échelle uniforme « cover », masque recadrant la zone visible.
 */
function thumbState(thumb: Rect, full: Rect) {
  const scale = Math.max(thumb.width / full.width, thumb.height / full.height)
  const insetX = Math.max(0, (full.width - thumb.width / scale) / 2)
  const insetY = Math.max(0, (full.height - thumb.height / scale) / 2)
  return {
    x: thumb.left + thumb.width / 2 - (full.left + full.width / 2),
    y: thumb.top + thumb.height / 2 - (full.top + full.height / 2),
    scale,
    clipPath: `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px)`,
  }
}

/** Point de contrôle : milieu décalé perpendiculairement (flèche réelle = CURVE × distance) */
function controlPoint(from: Point, to: Point): Point {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.hypot(dx, dy) || 1
  const offset = 2 * CURVE * dist // une Bézier quadratique atteint la moitié de l'écart du contrôle
  return {
    x: (from.x + to.x) / 2 + (-dy / dist) * offset,
    y: (from.y + to.y) / 2 + (dx / dist) * offset,
  }
}

function createClone(full: Rect, src: string): HTMLDivElement {
  const clone = document.createElement('div')
  clone.setAttribute('aria-hidden', 'true')
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${full.left}px`,
    top: `${full.top}px`,
    width: `${full.width}px`,
    height: `${full.height}px`,
    zIndex: String(Z_INDEX),
    pointerEvents: 'none',
    overflow: 'hidden',
    willChange: 'transform, clip-path',
    transformOrigin: '50% 50%',
  } satisfies Partial<CSSStyleDeclaration>)

  const img = document.createElement('img')
  img.alt = ''
  img.decoding = 'sync'
  img.src = src
  Object.assign(img.style, {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover', // même ratio que le cadre → aucun recadrage, aucune déformation
  } satisfies Partial<CSSStyleDeclaration>)

  clone.appendChild(img)
  document.body.appendChild(clone)
  return clone
}

/** Anime la position du clone le long de la courbe (même ease que l'échelle et le masque) */
function addCurve(g: Gsap, tl: Timeline, clone: HTMLElement, from: Point, to: Point, duration: number) {
  const ctrl = controlPoint(from, to)
  const setX = g.quickSetter(clone, 'x', 'px') as (v: number) => void
  const setY = g.quickSetter(clone, 'y', 'px') as (v: number) => void
  const state = { t: 0 }
  tl.to(
    state,
    {
      t: 1,
      duration,
      ease: EASE,
      onUpdate: () => {
        const t = state.t
        const a = (1 - t) * (1 - t)
        const b = 2 * (1 - t) * t
        const c = t * t
        setX(a * from.x + b * ctrl.x + c * to.x)
        setY(a * from.y + b * ctrl.y + c * to.y)
      },
    },
    0
  )
}

/* ------------------------------------------------------------------------------------------ */

export type Flight = { abort: () => void }

type Register = (cleanup: () => void) => void

let active: Flight | null = null

function startFlight(label: string, run: (g: Gsap, register: Register, finish: () => void) => void): Flight | null {
  const g = gsap
  if (!g) return null
  active?.abort() // une seule transition à la fois (clics rapides)

  const cleanups: (() => void)[] = []
  let done = false
  const finish = () => {
    if (done) return
    done = true
    cleanups.splice(0).reverse().forEach((fn) => {
      try {
        fn()
      } catch {
        // nettoyage best-effort
      }
    })
    if (active === flight) active = null
  }
  const flight: Flight = { abort: finish }
  active = flight

  // Mise en page modifiée pendant le vol → relève immédiate
  window.addEventListener('resize', finish, { once: true })
  cleanups.push(() => window.removeEventListener('resize', finish))

  try {
    run(g, (fn) => cleanups.push(fn), finish)
  } catch (error) {
    debug(`repli : erreur pendant le ${label}`, error)
    finish() // nettoyage complet, comportement actuel
    return null
  }
  debug(`${label} démarré`)
  return flight
}

/** Masque temporairement un élément (rétabli à la fin du vol, quoi qu'il arrive) */
function hideDuring(el: HTMLElement, register: Register) {
  const previous = el.style.visibility
  el.style.visibility = 'hidden'
  register(() => {
    el.style.visibility = previous
  })
}

function waitForImage(img: HTMLImageElement | null, timeout: number): Promise<void> {
  if (!img || (img.complete && img.naturalWidth > 0)) return Promise.resolve()
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, timeout)
    const done = () => {
      window.clearTimeout(timer)
      resolve()
    }
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
  })
}

/**
 * Ouverture : la vignette rejoint sa place dans la galerie.
 * `thumbEl` = cadre 4:5 de la mosaïque, `frameEl` = cadre au ratio réel dans la galerie.
 * Retourne null (→ ouverture actuelle en fondu) si le vol n'est pas possible.
 */
export function flyOpen(thumbEl: HTMLElement | null | undefined, frameEl: HTMLElement | null | undefined): Flight | null {
  if (!canFly()) return null
  const thumbIssue = usableReason(thumbEl)
  if (thumbIssue || !thumbEl) {
    debug(`repli ouverture : vignette ${thumbIssue}`)
    return null
  }
  if (!frameEl) {
    debug('repli ouverture : cadre de destination absent')
    return null
  }
  const thumbImg = thumbEl.querySelector('img')
  const src = thumbImg?.currentSrc || thumbImg?.src
  if (!src) {
    debug('repli ouverture : image de la vignette non chargée')
    return null
  }

  const full = toRect(frameEl.getBoundingClientRect())
  if (full.width < 2 || full.height < 2) {
    debug('repli ouverture : cadre de destination non mesurable', full)
    return null
  }
  const thumb = toRect(thumbEl.getBoundingClientRect())
  const from = thumbState(thumb, full)
  debug('géométrie ouverture', { thumb, full, from })

  return startFlight('vol aller', (gsap, register, finish) => {
    const clone = createClone(full, src)
    register(() => {
      gsap.killTweensOf(clone)
      clone.remove()
    })
    hideDuring(thumbEl, register)
    hideDuring(frameEl, register)

    gsap.set(clone, { x: from.x, y: from.y, scale: from.scale, clipPath: from.clipPath })

    const tl = gsap.timeline({
      onComplete: () => {
        // Atterrissage : l'image réelle reprend la main dès qu'elle est prête (≤ 1,2 s), sans saut
        frameEl.style.visibility = ''
        waitForImage(frameEl.querySelector('img'), LAND_TIMEOUT).then(() => {
          if (!clone.isConnected) return
          gsap.to(clone, { opacity: 0, duration: LAND_FADE, ease: 'none', onComplete: finish })
        })
      },
    })
    register(() => tl.kill())

    addCurve(gsap, tl, clone, from, { x: 0, y: 0 }, OPEN_DURATION)
    tl.to(clone, { scale: 1, clipPath: 'inset(0px 0px 0px 0px)', duration: OPEN_DURATION, ease: EASE }, 0)
  })
}

/**
 * Fermeture : l'image de la galerie retourne à sa vignette, uniquement si la vignette d'origine
 * existe, est visible et mesurable, et si l'image correspondante est visible dans la galerie.
 * Sinon null → fermeture actuelle en fondu (durée inchangée). La mosaïque n'est jamais défilée.
 */
export function flyClose(frameEl: HTMLElement | null | undefined, thumbEl: HTMLElement | null | undefined): Flight | null {
  if (!canFly()) return null
  const frameIssue = usableReason(frameEl)
  const thumbIssue = usableReason(thumbEl)
  if (frameIssue || !frameEl) {
    debug(`repli fermeture : image de la galerie ${frameIssue}`)
    return null
  }
  if (thumbIssue || !thumbEl) {
    debug(`repli fermeture : vignette ${thumbIssue}`)
    return null
  }
  const frameImg = frameEl.querySelector('img')
  const thumbImg = thumbEl.querySelector('img')
  const src =
    (frameImg?.complete && frameImg.naturalWidth > 0 ? frameImg.currentSrc : '') ||
    thumbImg?.currentSrc ||
    thumbImg?.src
  if (!src) {
    debug('repli fermeture : aucune image disponible pour le clone')
    return null
  }

  const full = toRect(frameEl.getBoundingClientRect())
  const to = thumbState(toRect(thumbEl.getBoundingClientRect()), full)

  return startFlight('vol retour', (gsap, register, finish) => {
    const clone = createClone(full, src)
    register(() => {
      gsap.killTweensOf(clone)
      clone.remove()
    })
    hideDuring(thumbEl, register)
    hideDuring(frameEl, register)

    const tl = gsap.timeline({ onComplete: finish }) // la vignette réapparaît exactement sous le clone
    register(() => tl.kill())

    addCurve(gsap, tl, clone, { x: 0, y: 0 }, { x: to.x, y: to.y }, CLOSE_DURATION)
    tl.to(clone, { scale: to.scale, clipPath: to.clipPath, duration: CLOSE_DURATION, ease: EASE }, 0)
  })
}

/* ============================================================================================
   VOL ENTRE PAGES : Home → page projet (prototype réversible)
   --------------------------------------------------------------------------------------------
   1. Clic sur la Home : le clone est posé exactement sur la source (vignette ou carte d'aperçu),
      la navigation Next part IMMÉDIATEMENT (aucune attente imposée).
   2. Le clone reste immobile au-dessus pendant le changement de route (au plus ABANDON_AFTER).
   3. La page projet, si un vol valide l'attend (même projet, même #m-index), se positionne
      instantanément sur la cible puis appelle landHomeFlight() : le clone rejoint l'image.
   4. Sinon (délai dépassé, autre destination, Précédent, erreur) : fondu du clone et
      navigation actuelle inchangée.
   ============================================================================================ */

/** Interrupteur du vol Home → Projet (indépendant de Commissions). */
export const HOME_FLIGHT_ENABLED = true

const HOME_ABANDON_AFTER = 1200 // ms : au-delà, la navigation actuelle reprend seule
const HOME_ABANDON_FADE = 0.2 // s
const HOME_SETTLE = 0.15 // s : correction finale si la cible a bougé pendant le vol (parallax)

/** Une extrémité du vol : où l'image entière est dessinée, et quelle fenêtre en est visible */
type FlightEnd = { image: Rect; clip: Rect }

/** Rectangle d'une image de ratio `ratio` en `object-fit: cover` (centré) dans `box` */
function coverRect(box: Rect, ratio: number): Rect {
  const boxRatio = box.width / box.height
  const width = boxRatio > ratio ? box.width : box.height * ratio
  const height = width / ratio
  return {
    left: box.left + (box.width - width) / 2,
    top: box.top + (box.height - height) / 2,
    width,
    height,
  }
}

function intersect(a: Rect, b: Rect): Rect {
  const left = Math.max(a.left, b.left)
  const top = Math.max(a.top, b.top)
  const right = Math.min(a.left + a.width, b.left + b.width)
  const bottom = Math.min(a.top + a.height, b.top + b.height)
  return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) }
}

/**
 * Extrémité décrite par un <img> en object-fit cover (ou au ratio exact) et son conteneur
 * qui la recadre (overflow hidden). Les transforms (hover, parallax) sont pris en compte.
 */
function endFromElements(imgEl: HTMLElement, clipEl: HTMLElement, ratio: number): FlightEnd | null {
  const imgBox = toRect(imgEl.getBoundingClientRect())
  if (imgBox.width < 2 || imgBox.height < 2) return null
  const clip = intersect(imgBox, toRect(clipEl.getBoundingClientRect()))
  if (clip.width < 2 || clip.height < 2) return null
  return { image: coverRect(imgBox, ratio), clip }
}

/** État du clone (géométrie de référence `ref.image`) pour représenter l'extrémité `end` */
function stateFor(end: FlightEnd, ref: Rect) {
  const scale = end.image.width / ref.width // uniforme : même ratio des deux côtés
  const inset = (v: number) => Math.max(0, v / scale)
  const top = inset(end.clip.top - end.image.top)
  const left = inset(end.clip.left - end.image.left)
  const right = inset(end.image.left + end.image.width - (end.clip.left + end.clip.width))
  const bottom = inset(end.image.top + end.image.height - (end.clip.top + end.clip.height))
  return {
    x: end.image.left + end.image.width / 2 - (ref.left + ref.width / 2),
    y: end.image.top + end.image.height / 2 - (ref.top + ref.height / 2),
    scale,
    clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px)`,
  }
}

type PendingHomeFlight = {
  slug: string
  index: number
  ratio: number
  ref: Rect
  clone: HTMLDivElement
  sourceEl: HTMLElement
  abandon: (fade?: boolean) => void
  /** Neutralise le minuteur d'abandon et l'écoute de Précédent (l'atterrissage prend la main) */
  disarm: () => void
}

let pendingHome: PendingHomeFlight | null = null

/** Vol Home possible maintenant ? (synchrone) */
export function canFlyHome(): boolean {
  return HOME_FLIGHT_ENABLED && engineReady()
}

/**
 * Au clic sur la Home, AVANT router.push : pose le clone sur la source.
 * `imgEl` = l'image affichée (cover), `clipEl` = son cadre visible.
 * Retourne false si le vol n'est pas possible (navigation actuelle, rien d'autre à faire).
 */
export function beginHomeFlight(params: {
  slug: string
  index: number
  imgEl: HTMLImageElement | null | undefined
  clipEl: HTMLElement | null | undefined
}): boolean {
  const { slug, index, imgEl, clipEl } = params
  pendingHome?.abandon(false) // navigation rapide et répétée : un seul vol

  if (!canFlyHome()) return false
  if (!imgEl || !clipEl || usableReason(clipEl)) {
    debug('repli Home : source indisponible')
    return false
  }
  if (!imgEl.complete || !imgEl.naturalWidth || !imgEl.naturalHeight) {
    debug('repli Home : image source non chargée')
    return false
  }
  const src = imgEl.currentSrc || imgEl.src
  const ratio = imgEl.naturalWidth / imgEl.naturalHeight
  const start = endFromElements(imgEl, clipEl, ratio)
  if (!src || !start) {
    debug('repli Home : géométrie source invalide')
    return false
  }

  const g = gsap
  if (!g) return false

  // Référence géométrique du clone : l'image entière côté source
  const ref = start.image
  const clone = createClone(ref, src)
  g.set(clone, stateFor(start, ref))
  const previousVisibility = clipEl.style.visibility
  clipEl.style.visibility = 'hidden'

  let timer = 0
  const disarm = () => {
    window.clearTimeout(timer)
    window.removeEventListener('popstate', onPopState)
  }
  const cleanup = () => {
    disarm()
    g.killTweensOf(clone)
    clone.remove()
    if (clipEl.isConnected) clipEl.style.visibility = previousVisibility
    if (pendingHome?.clone === clone) pendingHome = null
  }
  const abandon = (fade = true) => {
    if (pendingHome?.clone === clone) pendingHome = null
    if (fade && clone.isConnected) {
      g.to(clone, { opacity: 0, duration: HOME_ABANDON_FADE, ease: 'none', onComplete: cleanup })
    } else {
      cleanup()
    }
  }
  // Bouton Précédent pendant l'attente → abandon immédiat
  const onPopState = () => abandon(false)
  window.addEventListener('popstate', onPopState)
  timer = window.setTimeout(() => {
    debug('abandon Home : la page projet a tardé')
    abandon(true)
  }, HOME_ABANDON_AFTER)

  pendingHome = { slug, index, ratio, ref, clone, sourceEl: clipEl, abandon, disarm }
  debug('vol Home préparé', { slug, index })
  return true
}

/** La page projet a-t-elle un vol en attente pour elle ? (synchrone, au premier rendu) */
export function hasPendingHomeFlight(slug: string, index: number | null): boolean {
  return !!pendingHome && index !== null && pendingHome.slug === slug && pendingHome.index === index
}

/** Abandonne un vol en attente qui ne correspond pas à la page affichée */
export function cancelHomeFlight() {
  pendingHome?.abandon(true)
}

/**
 * Atterrissage, appelé par la page projet APRÈS positionnement instantané sur la cible.
 * `itemEl` = conteneur du média ciblé (masqué pendant le vol), `imgEl` = son image.
 * Retourne false si l'atterrissage est impossible (le clone s'efface, page normale).
 */
export function landHomeFlight(params: {
  slug: string
  index: number
  itemEl: HTMLElement | null
  imgEl: HTMLElement | null
}): boolean {
  const pending = pendingHome
  if (!pending || pending.slug !== params.slug || pending.index !== params.index) return false
  pendingHome = null
  pending.disarm()

  const { itemEl, imgEl } = params
  const end = itemEl && imgEl ? endFromElements(imgEl, itemEl, pending.ratio) : null
  if (!itemEl || !imgEl || !end) {
    debug('repli Home : destination non mesurable')
    pending.abandon(true)
    return false
  }

  const { clone, ref, ratio } = pending
  const flight = startFlight('vol Home → projet', (g, register, finish) => {
    // Le clone appartient désormais à ce vol (le minuteur d'abandon est neutralisé)
    register(() => {
      g.killTweensOf(clone)
      clone.remove()
    })
    register(() => {
      if (pending.sourceEl.isConnected) pending.sourceEl.style.visibility = ''
    })
    hideDuring(itemEl, register)

    const from = { x: Number(g.getProperty(clone, 'x')) || 0, y: Number(g.getProperty(clone, 'y')) || 0 }
    const to = stateFor(end, ref)

    const reveal = () => {
      itemEl.style.visibility = ''
      waitForImage(itemEl.querySelector('img'), LAND_TIMEOUT).then(() => {
        if (!clone.isConnected) return
        g.to(clone, { opacity: 0, duration: LAND_FADE, ease: 'none', onComplete: finish })
      })
    }

    const tl = g.timeline({
      onComplete: () => {
        // La cible a pu bouger pendant le vol (parallax de l'en-tête, ScrollTrigger) : correction
        const settled = endFromElements(imgEl, itemEl, ratio)
        if (!settled) return reveal()
        const fix = stateFor(settled, ref)
        if (Math.abs(fix.x - to.x) < 1 && Math.abs(fix.y - to.y) < 1 && Math.abs(fix.scale - to.scale) < 0.005) {
          return reveal()
        }
        g.to(clone, { x: fix.x, y: fix.y, scale: fix.scale, clipPath: fix.clipPath, duration: HOME_SETTLE, ease: 'power2.out', onComplete: reveal })
      },
    })
    register(() => tl.kill())

    addCurve(g, tl, clone, from, { x: to.x, y: to.y }, OPEN_DURATION)
    tl.to(clone, { scale: to.scale, clipPath: to.clipPath, duration: OPEN_DURATION, ease: EASE }, 0)
  })

  if (!flight) {
    pending.abandon(true)
    return false
  }
  return true
}
