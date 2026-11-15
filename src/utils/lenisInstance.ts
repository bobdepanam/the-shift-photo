// src/utils/lenisInstance.ts
// Référence partagée vers l'instance Lenis, sans importer Lenis ni ScrollTrigger :
// les composants qui ont seulement besoin de stop()/start() restent légers.

import type Lenis from 'lenis'

let instance: Lenis | null = null

export const getLenis = () => instance

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis
}
