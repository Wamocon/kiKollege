import { existsSync } from 'node:fs'
import { join } from 'node:path'

const kandidaten = ['logo.svg', 'logo.png', 'wamocon-logo.svg', 'wamocon-logo.png']

/** Sucht zur Bauzeit eine Logodatei unter public/. Liegt keine da, faellt die
 *  Seite auf die gesetzte Wortmarke zurueck, so wie es das CI-Blatt selbst tut.
 *  Es reicht also, die Originaldatei nach public/logo.svg zu legen. */
export function logoPfad(): string | null {
  const basis = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  for (const name of kandidaten) {
    if (existsSync(join(process.cwd(), 'public', name))) {
      return `${basis}/${name}`
    }
  }
  return null
}
