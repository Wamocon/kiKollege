import { Bild, FLAECHE, GRUND, iso, Kopf, LEISE, LINIE, punkte, Quader, RAND, ROT, RUMPF, Rund, STRICH, Strich, TINTE, ZT, Zylinder } from './basis'

/** Gregor Dev, Pfleger der Seiten, in den fünf Grafikarten. Er sieht sich die
 *  Seite hell und dunkel an, bevor er meldet. Rot trägt den Vorschlag, über den
 *  ein Mensch entscheidet. Kurzes Haar, Vollbart, Schürze mit Schlüssel. */

// Bei der Arbeit ------------------------------------------------------------

export function GregorLinie() {
  return (
    <Bild titel="Gregor Dev, als Strichzeichnung: sieht sich die Seite hell und dunkel an, ein roter Zettel wartet auf Freigabe" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        {/* Die Seite, die er pflegt: dieselbe Seite hell und dunkel */}
        <rect x="206" y="42" width="92" height="134" rx="4" fill={GRUND} />
        <path d="M252 56 H298 V172 C298 174 296 176 294 176 H252 Z" fill={TINTE} />
        <path d="M206 56 H298 M252 56 V176" />
        <circle cx="214" cy="49" r="1.8" fill={TINTE} />
        <circle cx="221" cy="49" r="1.8" />
        <circle cx="228" cy="49" r="1.8" />
        <g strokeWidth="1.4">
          <path d="M214 70 H244 M214 80 H238" />
          <rect x="214" y="92" width="30" height="24" />
          <path d="M214 128 H242 M214 138 H234" />
        </g>
        <g strokeWidth="1.4" stroke={GRUND}>
          <path d="M260 70 H290 M260 80 H284" />
          <rect x="260" y="92" width="30" height="24" />
          <path d="M260 128 H288 M260 138 H280" />
        </g>
        {/* Oberkörper mit Schürze, im Fach der Schlüssel */}
        <path d={RUMPF} fill={GRUND} />
        <path d="M128 146 L140 160 L154 142" strokeWidth="1.2" />
        <path d="M120 168 H162 L167 222 H115 Z" fill={GRUND} />
        <path d="M124 168 L130 147 M158 168 L152 143" />
        <path d="M128 180 H152 V196 H128 Z" />
        <path d="M144 180 V168" strokeWidth="2.4" />
        <path d="M140 166 A4.5 4.5 0 1 1 148 166" strokeWidth="2.4" />
        <path d="M128 131 L126 146 M154 127 L156 142" />
        <Kopf
          id="k-li-gregor"
          flaechen={
            <g fill={TINTE}>
              {/* Haar, kurz */}
              <path d="M182 72 C164 58 140 58 124 66 C116 72 112 80 112 88 C104 86 100 96 104 106 L60 130 L60 20 L182 20 Z" />
              {/* Bart, kurz geschnitten */}
              <path d="M60 104 L111 104 C118 113 130 117 142 115 C150 114 156 110 163 111 C167 111 170 110 173 110 L182 116 L182 160 L60 160 Z" />
            </g>
          }
        />
        <path d="M157 119 C160 121 163 121 166 119" stroke={GRUND} strokeWidth="1.6" />
        {/* Gesicht: wach, er sieht hin, bevor er meldet */}
        <path d="M143 79 C148 77 154 77 159 79" strokeWidth="2.4" />
        <ellipse cx="152" cy="91" rx="2.3" ry="2.8" fill={TINTE} stroke="none" />
        {/* Der Arm zeigt mit dem Stift auf die dunkle Hälfte */}
        <path d="M178 156 C192 146 204 138 213 128 L224 147 C212 158 202 168 192 177 Z" fill={GRUND} />
        <path d="M213 128 L224 147 M217 126 L228 145" strokeWidth="1.3" />
        <path d="M218 127 L234 112 C238 108 245 109 246 114 C247 120 242 125 237 127 L228 144 Z" fill={GRUND} />
        <path d="M243 112 L258 96" strokeWidth="2.6" />
      </g>
      {/* Der Vorschlag: angeheftet, bis ein Mensch entscheidet */}
      <g transform="rotate(8 292 44)">
        <rect x="281" y="33" width="23" height="23" rx="1" fill={ROT} />
        <path d="M285 41 H300 M285 47 H296" stroke={GRUND} strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </Bild>
  )
}
// Arbeitsplatz --------------------------------------------------------------

export function GregorIso() {
  // Bildschirm: eine dünne Platte, die Vorderseite links vorn
  const s = { x: 30, y: 10, b: 96, t: 4, h: 62, z: ZT + 12 }
  const vorn = s.y + s.t
  const mitte = s.x + s.b / 2
  const [px, py] = iso(150, 24, ZT + 12)
  return (
    <Bild titel="Der Arbeitsplatz von Gregor Dev: ein Bildschirm mit derselben Seite hell und dunkel, ein roter Zettel, Werkzeugkasten, eine Pflanze">
      <Quader x={0} y={0} z={0} b={168} t={118} h={ZT} />
      {/* Fuß des Bildschirms */}
      <Quader x={66} y={6} z={ZT} b={24} t={16} h={2} />
      <Quader x={73} y={9} z={ZT + 2} b={10} t={4} h={10} />
      {/* Bildschirm: links hell, rechts dunkel */}
      <Quader x={s.x} y={s.y} z={s.z} b={s.b} t={s.t} h={s.h} />
      <polygon fill={GRUND} {...STRICH} strokeWidth={1} points={flaecheY(vorn, s.x + 3, mitte, s.z + 3, s.z + s.h - 8)} />
      <polygon fill={TINTE} {...STRICH} strokeWidth={1} points={flaecheY(vorn, mitte, s.x + s.b - 3, s.z + 3, s.z + s.h - 8)} />
      <g strokeWidth="1.3" strokeLinecap="round">
        {[s.h - 16, s.h - 22, s.h - 34, s.h - 40].map((dz) => {
          const z = s.z + dz
          const [a1, b1] = iso(s.x + 8, vorn, z)
          const [a2, b2] = iso(mitte - 6, vorn, z)
          const [c1, d1] = iso(mitte + 5, vorn, z)
          const [c2, d2] = iso(s.x + s.b - 9, vorn, z)
          return (
            <g key={dz}>
              <line x1={a1} y1={b1} x2={a2} y2={b2} stroke={LEISE} />
              <line x1={c1} y1={d1} x2={c2} y2={d2} stroke={GRUND} />
            </g>
          )
        })}
      </g>
      {/* Der Vorschlag, angeheftet an den Rand */}
      <polygon fill={ROT} {...STRICH} strokeWidth={1.1} points={flaecheY(vorn + 0.5, s.x + s.b - 16, s.x + s.b + 2, s.z + s.h - 12, s.z + s.h + 4)} />
      {/* Werkzeugkasten mit Griff */}
      <Quader x={14} y={74} z={ZT} b={44} t={26} h={16} />
      {(() => {
        const [g1x, g1y] = iso(26, 87, ZT + 16)
        const [g2x, g2y] = iso(46, 87, ZT + 16)
        return <path d={`M${g1x} ${g1y} C${g1x} ${g1y - 12} ${g2x} ${g2y - 12} ${g2x} ${g2y}`} fill="none" stroke={TINTE} strokeWidth="2.6" />
      })()}
      {/* Eine Pflanze; Pflege ist sein Beruf */}
      <Zylinder x={150} y={24} z={ZT} r={8} h={12} seite={FLAECHE} />
      <g fill={GRUND} {...STRICH} strokeWidth={1.4}>
        <path d={`M${px} ${py - 2} C${px - 14} ${py - 8} ${px - 18} ${py - 22} ${px - 12} ${py - 30} C${px - 4} ${py - 22} ${px - 2} ${py - 12} ${px} ${py - 2} Z`} />
        <path d={`M${px} ${py - 2} C${px + 12} ${py - 10} ${px + 18} ${py - 22} ${px + 12} ${py - 34} C${px + 4} ${py - 26} ${px + 1} ${py - 14} ${px} ${py - 2} Z`} />
        <path d={`M${px} ${py - 2} C${px - 3} ${py - 16} ${px - 1} ${py - 30} ${px + 2} ${py - 40} C${px + 6} ${py - 30} ${px + 4} ${py - 16} ${px} ${py - 2} Z`} />
      </g>
      {/* Karte mit dem Auftrag */}
      <Quader x={96} y={62} z={ZT} b={32} t={24} h={1.2} />
      <g stroke={LEISE} strokeWidth="1.2" strokeLinecap="round">
        <Strich von={[102, 69]} bis={[122, 69]} z={ZT + 1.2} />
        <Strich von={[102, 75]} bis={[118, 75]} z={ZT + 1.2} />
        <Strich von={[102, 81]} bis={[120, 81]} z={ZT + 1.2} />
      </g>
    </Bild>
  )
}

/** Haar, Bart und Gesicht wie in GregorLinie, damit es dieselbe Person ist. */
function GregorGesicht({ id }: { id: string }) {
  return (
    <g>
      <Kopf
        id={id}
        flaechen={
          <g fill={TINTE}>
            <path d="M182 72 C164 58 140 58 124 66 C116 72 112 80 112 88 C104 86 100 96 104 106 L60 130 L60 20 L182 20 Z" />
            <path d="M60 104 L111 104 C118 113 130 117 142 115 C150 114 156 110 163 111 C167 111 170 110 173 110 L182 116 L182 160 L60 160 Z" />
          </g>
        }
      />
      <path d="M157 119 C160 121 163 121 166 119" stroke={GRUND} strokeWidth="1.6" />
      <path d="M143 79 C148 77 154 77 159 79" strokeWidth="2.4" />
      <ellipse cx="152" cy="91" rx="2.3" ry="2.8" fill={TINTE} stroke="none" />
    </g>
  )
}

/** Hemd und Schürze mit dem Schlüssel im Fach, wie in GregorLinie */
function GregorSchuerze() {
  return (
    <g>
      <path d={RUMPF} fill={GRUND} />
      <path d="M128 146 L140 160 L154 142" strokeWidth="1.2" />
      <path d="M120 168 H162 L167 222 H115 Z" fill={GRUND} />
      <path d="M124 168 L130 147 M158 168 L152 143" />
      <path d="M128 180 H152 V196 H128 Z" />
      <path d="M144 180 V168" strokeWidth="2.4" />
      <path d="M140 166 A4.5 4.5 0 1 1 148 166" strokeWidth="2.4" />
      <path d="M128 131 L126 146 M154 127 L156 142" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Kopf
// ---------------------------------------------------------------------------

export function GregorAvatar() {
  return (
    <Rund titel="Gregor Dev, Pfleger der Seiten" id="k-av-gregor">
      <path d={RUMPF} fill={GRUND} />
      <path d="M128 146 L140 160 L154 142" strokeWidth="1.6" />
      <path d="M124 168 L130 147 M158 168 L152 143" />
      <path d="M128 131 L126 146 M154 127 L156 142" />
      <GregorGesicht id="k-av-gregor-gesicht" />
    </Rund>
  )
}

// ---------------------------------------------------------------------------
// Sinnbild: die Seite hell und dunkel, am Rand der rote Vorschlag
// ---------------------------------------------------------------------------

/** Wie Quader aus basis.tsx, aber mit kräftigerem Strich für 48 Pixel. */
function Platte({ x, y, z, b, t, h, oben = GRUND, links = GRUND, rechts = RAND, sw = 2.4 }: {
  x: number; y: number; z: number; b: number; t: number; h: number; oben?: string; links?: string; rechts?: string; sw?: number
}) {
  const s = { stroke: TINTE, strokeWidth: sw, strokeLinejoin: 'round' as const }
  return (
    <g>
      <polygon {...s} fill={links} points={punkte([x, y + t, z], [x + b, y + t, z], [x + b, y + t, z + h], [x, y + t, z + h])} />
      <polygon {...s} fill={rechts} points={punkte([x + b, y, z], [x + b, y + t, z], [x + b, y + t, z + h], [x + b, y, z + h])} />
      <polygon {...s} fill={oben} points={punkte([x, y, z + h], [x + b, y, z + h], [x + b, y + t, z + h], [x, y + t, z + h])} />
    </g>
  )
}

/** Eine Fläche in der senkrechten Ebene y = konstant */
const flaecheY = (y: number, x1: number, x2: number, z1: number, z2: number) => punkte([x1, y, z1], [x2, y, z1], [x2, y, z2], [x1, y, z2])

export function GregorSinnbild() {
  const s = { x: 0, y: 40, b: 104, t: 5, h: 62, z: 26 }
  const v = s.y + s.t
  const mitte = s.x + s.b / 2
  const unten = s.z + 5
  const leiste = s.z + s.h - 13
  const zeilen = [leiste - 9, leiste - 17, leiste - 31, leiste - 39]
  return (
    <Bild titel="Sinnbild für Gregor Dev: ein Bildschirm mit derselben Seite hell und dunkel, am Rand ein roter Zettel" rahmen="88 -4 140 140">
      {/* Fuß und Hals */}
      <Platte x={mitte - 20} y={s.y - 14} z={0} b={40} t={28} h={3} links={FLAECHE} />
      <Platte x={mitte - 6} y={s.y - 4} z={3} b={12} t={4} h={s.z} />
      {/* Bildschirm */}
      <Platte {...s} />
      <polygon fill={GRUND} stroke={TINTE} strokeWidth="1.4" strokeLinejoin="round" points={flaecheY(v, s.x + 5, mitte, unten, leiste)} />
      <polygon fill={TINTE} stroke={TINTE} strokeWidth="1.4" strokeLinejoin="round" points={flaecheY(v, mitte, s.x + s.b - 5, unten, leiste)} />
      <g strokeWidth="2.6" strokeLinecap="round">
        {zeilen.map((z, i) => {
          const kurz = i % 2 ? 10 : 4
          const [a1, b1] = iso(s.x + 11, v, z)
          const [a2, b2] = iso(mitte - kurz, v, z)
          const [c1, d1] = iso(mitte + 6, v, z)
          const [c2, d2] = iso(s.x + s.b - 5 - kurz, v, z)
          return (
            <g key={z}>
              <line x1={a1} y1={b1} x2={a2} y2={b2} stroke={LEISE} />
              <line x1={c1} y1={d1} x2={c2} y2={d2} stroke={GRUND} />
            </g>
          )
        })}
      </g>
      {/* Titelleiste mit drei Punkten */}
      <g fill={TINTE}>
        {[10, 17, 24].map((x) => {
          const [px, py] = iso(s.x + x, v, leiste + 6)
          return <circle key={x} cx={px} cy={py} r="2" />
        })}
      </g>
      {/* Der Vorschlag, angeheftet: darüber entscheidet ein Mensch */}
      <polygon fill={ROT} points={flaecheY(v + 0.5, s.x + s.b - 22, s.x + s.b + 5, s.z + s.h - 20, s.z + s.h + 7)} />
      <g stroke={GRUND} strokeWidth="2" strokeLinecap="round">
        {[s.z + s.h - 2, s.z + s.h - 9].map((z, i) => {
          const [a1, b1] = iso(s.x + s.b - 16, v + 0.5, z)
          const [a2, b2] = iso(s.x + s.b - (i ? 4 : 1), v + 0.5, z)
          return <line key={z} x1={a1} y1={b1} x2={a2} y2={b2} />
        })}
      </g>
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Grenze: er entfernt nichts. Der Papierkorb steht jenseits der roten Linie.
// ---------------------------------------------------------------------------

export function GregorGrenze() {
  return (
    <Bild titel="Gregor Dev löscht nichts: Er hebt die Hand, der Papierkorb steht jenseits der roten Linie" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        {/* Jenseits: der Papierkorb, mit Deckel */}
        <path d="M240 216 H296" strokeWidth="1.3" opacity="0.5" />
        <path d="M250 172 L254 216 H282 L286 172 Z" fill={GRUND} />
        <path d="M261 179 L262.5 209 M268 179 V209 M275 179 L273.5 209" strokeWidth="1.3" />
        <path d="M245 172 H291 V167 C291 165.3 290 164.5 288.5 164.5 H247.5 C246 164.5 245 165.3 245 167 Z" fill={GRUND} />
        <path d="M261 164.5 V159 H275 V164.5" />
        <GregorSchuerze />
        <GregorGesicht id="k-gr-gregor" />
        {/* Die Hand: offen, freundlich, deutlich */}
        <path d="M180 158 C190 156 198 158 204 162 L210 176 C200 180 190 182 184 180 Z" fill={GRUND} />
        <path
          d="M204 170 L202 142 C202 136 209 135 210 140 L210 132 C210 126 218 126 218 132 L219 136 C219 131 226 131 226 137 L225 160 C224 168 218 172 210 172 Z"
          fill={GRUND}
        />
        <path d="M204 156 C198 152 194 156 196 160 L203 166" fill={GRUND} />
        <path d="M210 140 V152 M218 136 V152" strokeWidth="1.1" opacity="0.6" />
      </g>
      <path d="M234 112 V218" stroke={ROT} strokeWidth="2.2" strokeDasharray="5 5" strokeLinecap="round" />
    </Bild>
  )
}
