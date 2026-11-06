import { daten, datum } from '@/lib/daten'
import { BEREICHE_ERKLAERT } from '@/lib/gedaechtnis'
import netz from '@/data/ablage-netz.json'

import { NetzBild, type NetzBereich } from './NetzBild'

/** Das Netz der Ablage, wie Obsidian es zeigt: jede Notiz ein Punkt, jeder Verweis eine Linie,
 *  in Bereiche geclustert und erklärt. Die Lage ist vorberechnet (npm run abbild:netz), ohne
 *  Namen und ohne Pfade. Bedienen lässt es sich in NetzBild. */

type Netz = { gezaehltAm: string; bereiche: string[]; knoten: number[][]; kanten: number[][] }
const n = netz as Netz

/** Notizen ohne Verweis liegen in der Vorlage auf einem weiten Ring; hier rücken sie dicht an
 *  das Netz heran, damit das Netz die Breite füllt. Der Rahmen umschließt danach alles. */
const MITTE = 500
const rand = Math.max(...n.knoten.filter((k) => k[3] > 0).map((k) => Math.hypot(k[0] - MITTE, k[1] - MITTE)))
const punkte = n.knoten.map((k) => {
  if (k[3] > 0) return k
  const w = Math.atan2(k[1] - MITTE, k[0] - MITTE)
  return [Math.round(MITTE + (rand + 22) * Math.cos(w)), Math.round(MITTE + (rand + 22) * Math.sin(w)), k[2], k[3]]
})
/** Ab dieser Größe trägt ein Bereich seinen Namen im Bild */
const MIT_NAMEN = 7

/** Schiebt die Namen senkrecht auseinander, bis sich keine zwei mehr überdecken */
function schilder(namen: { text: string; x: number; y: number }[]) {
  const breite = (t: string) => t.length * 11.5 + 10
  const HOEHE = 28
  const lage = namen.map((n) => ({ ...n }))
  for (let runde = 0; runde < 200; runde++) {
    let bewegt = false
    for (let i = 0; i < lage.length; i++) {
      for (let j = i + 1; j < lage.length; j++) {
        const a = lage[i]
        const b = lage[j]
        const ueberX = (breite(a.text) + breite(b.text)) / 2 - Math.abs(a.x - b.x)
        const ueberY = HOEHE - Math.abs(a.y - b.y)
        if (ueberX <= 0 || ueberY <= 0) continue
        const schub = ueberY / 2 + 0.5
        const oben = a.y <= b.y ? a : b
        const unten = oben === a ? b : a
        oben.y -= schub
        unten.y += schub
        bewegt = true
      }
    }
    if (!bewegt) break
  }
  return lage.map((l) => [Math.round(l.x), Math.round(l.y)] as [number, number])
}

const RAHMEN = (() => {
  const xs = punkte.map((k) => k[0])
  const ys = punkte.map((k) => k[1])
  const luft = 14
  const x = Math.round(Math.min(...xs) - luft)
  const y = Math.round(Math.min(...ys) - luft)
  return [x, y, Math.round(Math.max(...xs) + luft - x), Math.round(Math.max(...ys) + luft - y)] as [number, number, number, number]
})()

export function AblageNetz() {
  const info = new Map(daten.ablage.bereiche.map((b) => [b.id, b]))
  const roh = n.bereiche.map((id, b) => {
    const alle = punkte.filter((k) => k[2] === b)
    const verbunden = alle.filter((k) => k[3] > 0)
    const basis = verbunden.length ? verbunden : alle
    const summe = basis.reduce((s, k) => [s[0] + k[0], s[1] + k[1]], [0, 0])
    const z = Math.max(1, basis.length)
    return {
      id,
      name: info.get(id)?.name ?? id,
      kurz: info.get(id)?.kurz ?? id,
      gruppe: info.get(id)?.gruppe ?? 'werkstatt',
      erklaerung: BEREICHE_ERKLAERT[id] ?? '',
      anzahl: alle.length,
      mitte: [Math.round(summe[0] / z), Math.round(summe[1] / z)] as [number, number],
    }
  })
  const benannt = roh.filter((b) => b.anzahl >= MIT_NAMEN)
  const lagen = schilder(benannt.map((b) => ({ text: b.kurz, x: b.mitte[0], y: b.mitte[1] })))
  const bereiche: NetzBereich[] = roh.map((b) => {
    const i = benannt.indexOf(b)
    return { ...b, schild: i < 0 ? null : lagen[i] }
  })
  return (
    <figure className="lb-netz" data-lb-netz>
      <NetzBild punkte={punkte} kanten={n.kanten} rahmen={RAHMEN} bereiche={bereiche} />
      <figcaption>
        {n.knoten.length.toLocaleString('de-DE')} Notizen und {n.kanten.length.toLocaleString('de-DE')} Verweise, gezählt am {datum(n.gezaehltAm)}. Jede
        Notiz ist ein Punkt, jeder Verweis eine Linie; je mehr Verweise, desto größer der Punkt. Weiß ist Wissen, rot das Gedächtnis, grau die
        Werkstatt. Namen und Inhalte der Notizen stehen nicht auf dieser Seite.
      </figcaption>
    </figure>
  )
}
