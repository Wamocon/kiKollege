import { Bild, FLAECHE, flaecheY, GRUND, iso, Kopf, LEISE, LINIE, liste, punkte, Quader, RAND, ROT, RUMPF, Rund, STRICH, Strich, TINTE, ZT } from './basis'

/** Arnold, Technischer Architekt, in den
 *  fünf Grafikarten. Er wägt ab und legt sich auf genau eine Empfehlung fest,
 *  mit dem Punkt, an dem sie kippt. Sein Bild ist die Wippe: Der Drehpunkt ist
 *  der Kipppunkt, und Rot trägt die eine Empfehlung, die schwerer wiegt.
 *  Er selbst: Glatze mit dunklem Haarkranz über den Ohren, kurzer dunkler
 *  Kinnbart, Poloshirt mit Kragen und zwei Knöpfen. */

// ---------------------------------------------------------------------------
// Figur
// ---------------------------------------------------------------------------

/** Oberkörper im Poloshirt: weicher Kragen, kurze Knopfleiste mit zwei Knöpfen */
function ArnoldPolo() {
  return (
    <g>
      <path d={RUMPF} fill={GRUND} />
      <path d="M128 131 L126 146 M154 127 L156 142" />
      <path d="M125.5 139 C134 143.5 148 142.5 156 135" />
      <path d="M138.5 148.5 V163 H143.5 V148" fill={GRUND} />
      <path d="M125.5 139 C123.5 145 124.5 151 129.5 156.5 L140 148.5 Z" fill={GRUND} />
      <path d="M156 135 C157.8 141 157.2 147 153 152.5 L142 148 Z" fill={GRUND} />
      <circle cx="141" cy="153.8" r="1.4" fill={TINTE} stroke="none" />
      <circle cx="141" cy="159.3" r="1.4" fill={TINTE} stroke="none" />
    </g>
  )
}

/** Glatze, dunkler Haarkranz über den Ohren, kurzer Kinnbart; Blick ruhig, nach vorn. */
function ArnoldGesicht({ id }: { id: string }) {
  return (
    <g>
      <Kopf
        id={id}
        flaechen={
          <g fill={TINTE}>
            {/* Haarkranz: hinten und über dem Ohr, oben frei */}
            <path d="M125 85 C118 79 108 78 96 80 L60 80 L60 124 L108 124 C110 118 111 112 113 107 L117 98 C120 93 123.5 89 125 85 Z" />
            {/* Kinnbart, kurz */}
            <path d="M153 140 L153 130 C153.5 125 154.5 121 157 118.5 C160 116.2 166 115.6 170 115.2 L182 114.6 L182 140 Z" />
          </g>
        }
      />
      {/* Das Ohr sichtbar machen, ein Glanz auf der Glatze */}
      <path d="M110.5 93.5 C108.2 95.5 108.2 99 110.8 100.6" strokeWidth="1.4" />
      <path d="M127 63 C132 59.5 139 58 145 58.5" strokeWidth="1.2" opacity="0.35" />
      {/* Braue dunkel, Blick wach, Mund freundlich */}
      <path d="M143 79 C148 76.5 154 76.5 159.5 79.5" strokeWidth="2.6" />
      <ellipse cx="151.5" cy="90.5" rx="2.3" ry="2.7" fill={TINTE} stroke="none" />
      <path d="M160 112.2 C162.5 113.2 165 113 167.5 111.6" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Linie
// ---------------------------------------------------------------------------

export function ArnoldLinie() {
  return (
    <Bild
      titel="Arnold, als Strichzeichnung: zeigt mit dem Stift auf den Drehpunkt einer Wippe, auf der die eine Empfehlung schwerer wiegt"
      rahmen="48 30 256 192"
      papier
    >
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        <ArnoldPolo />
        <ArnoldGesicht id="k-li-arnold" />
        {/* Die Wippe: Bock, Brett, links das leichtere Gewicht */}
        <path d="M230 198 L244 160.5 L258 198 Z" fill={GRUND} />
        <g transform="rotate(11 244 158)">
          <rect x="200" y="155" width="92" height="5.5" rx="1.5" fill={GRUND} />
          <rect x="204" y="139" width="16" height="16" rx="1" fill={GRUND} />
        </g>
        <circle cx="244" cy="161" r="2" fill={TINTE} stroke="none" />
        {/* Unterarm auf dem Tisch, der Stift zeigt auf den Drehpunkt */}
        <path d="M186 197 C186 192 190 188 198 188 H212 V197" fill={GRUND} />
        <path d="M220.5 187.5 L235.6 168.8" strokeWidth="3.4" />
        <path d="M235.6 168.8 L238.6 165.1" strokeWidth="1.4" />
        <path d="M210 188 C214 182 224 182 227 187 C230 192 226 197 219 197 H210 Z" fill={GRUND} />
        <path d="M214 189 C217 188 220 189 222 191" strokeWidth="1.2" />
      </g>
      {/* Die eine Empfehlung: wiegt schwerer, die Wippe neigt sich zu ihr */}
      <g transform="rotate(11 244 158)">
        <rect x="262" y="129" width="26" height="26" rx="1" fill={ROT} stroke={TINTE} strokeWidth="1.7" strokeLinejoin="round" />
      </g>
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Isometrisch
// ---------------------------------------------------------------------------

/** Ein Quader, dessen Boden entlang x mit der Steigung k fällt oder steigt:
 *  das Brett der Wippe und was darauf liegt. */
function Schraeg({ x, y, z, b, t, h, k, oben = GRUND, links = FLAECHE, rechts = RAND }: {
  x: number; y: number; z: number; b: number; t: number; h: number; k: number; oben?: string; links?: string; rechts?: string
}) {
  const z1 = z + k * b
  return (
    <g>
      <polygon {...STRICH} fill={links} points={punkte([x, y + t, z], [x + b, y + t, z1], [x + b, y + t, z1 + h], [x, y + t, z + h])} />
      <polygon {...STRICH} fill={rechts} points={punkte([x + b, y, z1], [x + b, y + t, z1], [x + b, y + t, z1 + h], [x + b, y, z1 + h])} />
      <polygon {...STRICH} fill={oben} points={punkte([x, y, z + h], [x + b, y, z1 + h], [x + b, y + t, z1 + h], [x, y + t, z + h])} />
    </g>
  )
}

/** Die Wippe: Bock mit Drehpunkt bei x = f, Brett, links das leichte Gewicht,
 *  rechts die Empfehlung (rot), zu der sie sich neigt. */
function Wippe({ f, y, z, lang = 84, breit = 12, hoehe = 16, k = -0.2, klein = 12, gross = 17 }: {
  f: number; y: number; z: number; lang?: number; breit?: number; hoehe?: number; k?: number; klein?: number; gross?: number
}) {
  const fuss = hoehe * 0.6
  const vorn = y + breit
  const zp = z + hoehe
  const dicke = 3
  const xa = f - lang / 2
  const brett = (x: number) => zp + k * (x - f)
  const xl = xa + 3
  const xr = xa + lang - gross - 3
  const mitte = y + breit / 2
  const [dx, dy] = iso(f, vorn + 4, zp)
  return (
    <g>
      <polygon {...STRICH} fill={RAND} points={punkte([f, y, zp], [f + fuss, y, z], [f + fuss, vorn, z], [f, vorn, zp])} />
      <polygon {...STRICH} fill={FLAECHE} points={punkte([f - fuss, vorn, z], [f + fuss, vorn, z], [f, vorn, zp])} />
      <Schraeg x={xa} y={y - 4} z={brett(xa)} b={lang} t={breit + 8} h={dicke} k={k} />
      {/* Der Drehpunkt: hier kippt die Empfehlung */}
      <circle cx={dx} cy={dy - 1.5} r="1.9" fill={TINTE} />
      <Schraeg x={xl} y={mitte - klein / 2} z={brett(xl) + dicke} b={klein} t={klein} h={klein} k={k} />
      <Schraeg x={xr} y={mitte - gross / 2} z={brett(xr) + dicke} b={gross} t={gross} h={gross} k={k} oben={ROT} links={ROT} rechts={ROT} />
    </g>
  )
}

export function ArnoldIso() {
  const ordner = [0, 1, 2, 3].map((i) => 10 + i * 9)
  const oy = 4
  const ot = 30
  const oh = 42
  const zb = ZT + 1.2
  const [s1x, s1y] = iso(96, 112, ZT + 1.5)
  const [s2x, s2y] = iso(136, 100, ZT + 1.5)
  return (
    <Bild titel="Der Arbeitsplatz von Arnold: eine Reihe Ordner, eine Wippe, die sich zur roten Empfehlung neigt, die Vorlage mit der einen markierten Zeile, ein Zeichendreieck und ein Stift">
      <Quader x={0} y={0} z={0} b={168} t={118} h={ZT} />
      {/* Seine Ordner: hier legt er die Vorlagen ab */}
      {ordner.map((x) => (
        <g key={x}>
          <Quader x={x} y={oy} z={ZT} b={8} t={ot} h={oh} />
          <polygon {...STRICH} strokeWidth={1} fill={GRUND} points={flaecheY(oy + ot, x + 1.6, x + 6.4, ZT + 22, ZT + 36)} />
          <polygon {...STRICH} strokeWidth={1} fill={GRUND} points={liste(Array.from({ length: 19 }, (_, i) => {
            const w = (Math.PI * 2 * i) / 18
            return iso(x + 4 + 2.2 * Math.cos(w), oy + ot, ZT + 11 + 3 * Math.sin(w))
          }))} />
        </g>
      ))}
      {/* Die Vorlage: eine Zeile ist die Empfehlung */}
      <Quader x={18} y={54} z={ZT} b={52} t={48} h={1.2} />
      <g stroke={LEISE} strokeWidth="1.5" strokeLinecap="round">
        {[62, 70, 86, 94].map((y) => (
          <Strich key={y} von={[25, y]} bis={[62, y]} z={zb} />
        ))}
      </g>
      <g stroke={ROT} strokeWidth="2.4" strokeLinecap="round">
        <Strich von={[25, 78]} bis={[62, 78]} z={zb} />
      </g>
      {/* Zeichendreieck */}
      <polygon {...STRICH} strokeWidth={1.3} fill={GRUND} fillOpacity="0.55" points={punkte([92, 66, ZT + 0.8], [140, 66, ZT + 0.8], [92, 96, ZT + 0.8])} />
      <polygon {...STRICH} strokeWidth={1} fill="none" points={punkte([100, 71, ZT + 0.8], [120, 71, ZT + 0.8], [100, 83.5, ZT + 0.8])} />
      <g stroke={TINTE} strokeWidth="0.9">
        {[100, 108, 116, 124, 132].map((x) => (
          <Strich key={x} von={[x, 66]} bis={[x, 68.5]} z={ZT + 0.8} />
        ))}
      </g>
      {/* Ein Stift */}
      <path d={`M${s1x} ${s1y} L${s2x} ${s2y}`} stroke={TINTE} strokeWidth="3.2" strokeLinecap="round" />
      {/* Die Wippe auf dem Tisch */}
      <Wippe f={118} y={24} z={ZT} lang={92} breit={16} hoehe={22} klein={14} gross={21} />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Sinnbild
// ---------------------------------------------------------------------------

export function ArnoldSinnbild() {
  return (
    <Bild titel="Sinnbild für Arnold: eine Wippe, die sich zur roten Empfehlung neigt" rahmen="103 29 111 111">
      <Wippe f={50} y={34} z={0} lang={86} breit={12} hoehe={26} k={-0.2} klein={13} gross={19} />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Grenze: Er bereitet vor, er entscheidet nicht.
// ---------------------------------------------------------------------------

export function ArnoldGrenze() {
  return (
    <Bild titel="Arnold entscheidet nicht: Er hebt die Hand, der Hammer, mit dem entschieden wird, liegt jenseits der roten Linie" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Der Hammer, der entscheidet, auf seinem Block: Er nimmt ihn nicht */}
        <rect x="240" y="188" width="42" height="10" rx="3" fill={GRUND} />
        <path d="M243 192 H279" strokeWidth="1" opacity="0.5" />
        <g transform="translate(258 170) rotate(33.3)">
          <rect x="6" y="-2.6" width="37" height="5.2" rx="2.6" fill={GRUND} />
          <circle cx="44" cy="0" r="3.6" fill={GRUND} />
          <rect x="-7.5" y="-17" width="15" height="34" rx="5" fill={GRUND} />
          <path d="M-7.5 -10.5 H7.5 M-7.5 10.5 H7.5" />
          <rect x="-9" y="-3.2" width="18" height="6.4" rx="1.5" fill={GRUND} />
        </g>
        {/* Seine Vorlage bleibt auf seiner Seite */}
        <path d="M150 197 L160 186 L212 186 L208 197 Z" fill={GRUND} />
        <path d="M166 190 H204 M162 194 H198" strokeWidth="1.1" opacity="0.5" />
        <ArnoldPolo />
        <ArnoldGesicht id="k-gr-arnold" />
        {/* Die Hand: offen, ruhig, deutlich */}
        <path d="M180 158 C190 156 198 158 204 162 L210 176 C200 180 190 182 184 180 Z" fill={GRUND} />
        <path
          d="M204 170 L202 142 C202 136 209 135 210 140 L210 132 C210 126 218 126 218 132 L219 136 C219 131 226 131 226 137 L225 160 C224 168 218 172 210 172 Z"
          fill={GRUND}
        />
        <path d="M204 156 C198 152 194 156 196 160 L203 166" fill={GRUND} />
        <path d="M210 140 V152 M218 136 V152" strokeWidth="1.1" opacity="0.6" />
      </g>
      <path d="M234 112 V206" stroke={ROT} strokeWidth="2.2" strokeDasharray="5 5" strokeLinecap="round" />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Kopf
// ---------------------------------------------------------------------------

export function ArnoldAvatar() {
  return (
    <Rund titel="Arnold, Technischer Architekt" id="k-av-arnold">
      <ArnoldPolo />
      <ArnoldGesicht id="k-av-arnold-kopf" />
    </Rund>
  )
}
