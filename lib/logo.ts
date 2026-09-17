import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { pfad } from './pfad'

const kandidaten = ['logo.svg', 'logo.png', 'wamocon-logo.svg', 'wamocon-logo.png']

/** Sucht zur Bauzeit eine Logodatei unter public/. Liegt keine da, faellt die
 *  Seite auf die gesetzte Wortmarke zurueck, so wie es das CI-Blatt selbst tut.
 *  Es reicht also, die Originaldatei nach public/logo.svg zu legen. */
export function logoPfad(): string | null {
  for (const name of kandidaten) {
    if (existsSync(join(process.cwd(), 'public', name))) {
      return pfad(`/${name}`)
    }
  }
  return null
}
