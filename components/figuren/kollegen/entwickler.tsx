import { Bild, FLAECHE, GRUND, iso, Kopf, LEISE, LINIE, liste, punkte, Quader, RAND, ROT, RUMPF, Rund, STRICH, Strich, TINTE, ZT, Zylinder } from './basis'

/** Der Entwickler in den fünf Grafikarten.
 *  Er baut die Testfälle, an denen Prüfregeln und Grenzen gemessen werden:
 *  ein Prüfstand, kein Prüfcontainer (der gehört Theo, dem Tester).
 *  Rot trägt der Testfall, den er weitergibt; in der Grenze die Linie.
 *  Kennzeichen: Locken, Kopfhörer um den Hals, Jacke mit Reißverschluss. */

const r1 = (n: number) => Math.round(n * 10) / 10

/** Locken rund um den Kopf; sichtbar ist nur, was über den Umriss hinausragt. */
const LOCKEN = [156, 174, 192, 210, 228, 246, 264, 282, 299, 314].map((g, i) => {
  const w = (g * Math.PI) / 180
  return { cx: r1(136 + 40 * Math.cos(w)), cy: r1(90 + 40 * Math.sin(w)), r: i < 8 ? 8.5 : 7 }
})
/** Locken am Haaransatz, innerhalb des Kopfes */
const ANSATZ = [
  { cx: 166, cy: 64, r: 5.5 },
  { cx: 156, cy: 65, r: 6 },
  { cx: 145, cy: 66, r: 6 },
  { cx: 134, cy: 69, r: 6 },
  { cx: 124, cy: 75, r: 5.5 },
  { cx: 117, cy: 83, r: 4.5 },
]

/** Locken, Rumpf mit Jacke, Kopfhörer und Gesicht */
function EntwicklerFigur({ id, tasche = true }: { id: string; tasche?: boolean }) {
  return (
    <g>
      <g fill={TINTE} stroke="none">
        {LOCKEN.map((l, i) => (
          <circle key={i} cx={l.cx} cy={l.cy} r={l.r} />
        ))}
      </g>
      <path d={RUMPF} fill={GRUND} />
      <path d="M128 131 L126 146 M154 127 L156 142" />
      {/* Jacke: Stehkragen, Reißverschluss, Brusttasche mit Stift */}
      <path d="M124 133 L122 146 C128 150 134 153 140 156 C146 152 152 147 158 140 L156 128 C152 136 146 142 140 146 C134 143 128 139 124 133 Z" fill={GRUND} />
      <path d="M140 156 V198" strokeWidth="1.4" />
      <rect x="138" y="158" width="4" height="7" rx="1" fill={GRUND} strokeWidth="1.2" />
      {tasche ? (
        <g strokeWidth="1.3">
          <path d="M163 172 V162 M166 172 V164" strokeWidth="1.6" />
          <rect x="157" y="170" width="18" height="16" rx="1" fill={GRUND} />
          <path d="M157 175 H175" />
        </g>
      ) : null}
      {/* Kopfhörer um den Hals: der Bügel läuft hinter dem Hals, vorn liegen die Muscheln */}
      <path d="M119 138 C120 134 122 131 125 129 M164 131 C163 128 161 126 158 124" strokeWidth="3.2" />
      <g transform="rotate(-32 122 145)">
        <rect x="116" y="136" width="12" height="18" rx="5.5" fill={TINTE} />
        <ellipse cx="122" cy="145" rx="2.6" ry="5.6" fill="none" stroke={GRUND} strokeWidth="1.3" />
      </g>
      <g transform="rotate(30 162 139)">
        <rect x="156.5" y="131" width="11" height="16" rx="5" fill={TINTE} />
        <ellipse cx="162" cy="139" rx="2.3" ry="5" fill="none" stroke={GRUND} strokeWidth="1.2" />
      </g>
      <Kopf
        id={id}
        flaechen={
          <g fill={TINTE}>
            <path d="M174 62 C160 58 140 58 126 66 C118 72 114 80 113 88 C105 86 101 96 104 106 C106 114 108 120 113 124 L60 128 L60 20 L182 20 Z" />
            {ANSATZ.map((l, i) => (
              <circle key={i} cx={l.cx} cy={l.cy} r={l.r} />
            ))}
          </g>
        }
      />
      {/* Gesicht: konzentriert, ruhig */}
      <path d="M143 80 C148 78.5 154 78.5 159 80.5" strokeWidth="2.4" />
      <ellipse cx="152" cy="92" rx="2.3" ry="2.8" fill={TINTE} stroke="none" />
      <path d="M159 116 L166 115.5" />
    </g>
  )
}

/** Zifferblatt einer Messuhr, von vorn: Skala und Zeiger */
function Messuhr({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const striche = Array.from({ length: 11 }, (_, i) => {
    const w = ((-135 + i * 27) * Math.PI) / 180
    const a = r * 0.62
    const b = r * 0.8
    return `M${r1(cx + Math.sin(w) * a)} ${r1(cy - Math.cos(w) * a)} L${r1(cx + Math.sin(w) * b)} ${r1(cy - Math.cos(w) * b)}`
  }).join(' ')
  const w = (40 * Math.PI) / 180
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={GRUND} />
      <circle cx={cx} cy={cy} r={r * 0.85} strokeWidth="0.9" opacity="0.45" />
      <path d={striche} strokeWidth="1.1" />
      <path d={`M${cx} ${cy} L${r1(cx + Math.sin(w) * r * 0.66)} ${r1(cy - Math.cos(w) * r * 0.66)}`} strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r="1.6" fill={TINTE} stroke="none" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Linie: setzt einen Testfall in den Prüfstand
// ---------------------------------------------------------------------------

export function EntwicklerLinie() {
  return (
    <Bild titel="Der Entwickler, als Strichzeichnung: setzt einen roten Testfall unter die Messuhr, an der Wand die Zeichnung dazu" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Die Zeichnung des Testfalls: Form und Maße */}
        <g transform="rotate(-3 214 58)">
          <rect x="194" y="38" width="42" height="40" rx="1" fill={GRUND} />
          <path d="M201 66 V55 H212 V49 H226 V66 Z" strokeWidth="1.2" />
          <path d="M201 72 H226 M201 70 V74 M226 70 V74" strokeWidth="0.9" opacity="0.7" />
          <path d="M231 49 V66 M229 49 H233 M229 66 H233" strokeWidth="0.9" opacity="0.7" />
        </g>
        {/* Prüfstand: Messplatte, Säule, Arm, Messuhr */}
        <rect x="210" y="188" width="88" height="10" rx="1.5" fill={GRUND} />
        <rect x="282" y="64" width="7" height="124" fill={GRUND} />
        <rect x="276" y="76" width="19" height="13" rx="2" fill={GRUND} />
        <rect x="246" y="79" width="30" height="6" fill={GRUND} />
        <path d="M252 85 V92" strokeWidth="2.6" />
        <Messuhr cx={252} cy={108} r={16} />
        <rect x="249" y="124" width="6" height="10" fill={GRUND} strokeWidth="1.4" />
        <path d="M252 134 V152" strokeWidth="1.5" />
        <circle cx="252" cy="154" r="2" fill={TINTE} stroke="none" />
        <EntwicklerFigur id="k-li-entwickler" />
        {/* Der Unterarm liegt auf, die Hand rückt den Testfall zurecht */}
        <path d="M184 174 C196 171 206 171 214 172 L214 190 C206 192 196 194 190 194 Z" fill={GRUND} />
        <path d="M210 172 V190" strokeWidth="1.2" />
        <path d="M214 172 C220 169 227 171 229 176 L229 186 C225 190 219 190 214 190 Z" fill={GRUND} />
        <path d="M218 178 C222 177 226 178 228 180" strokeWidth="1.1" />
      </g>
      {/* Der Testfall: gebaut nach der Zeichnung, gemessen unter der Uhr */}
      <path d="M229.5 188 V167 H242 V156 H266 V188 Z" fill={ROT} />
      <path d="M229.5 188 V167 H242 V156 H266 V188" fill="none" stroke={TINTE} strokeWidth="1.4" strokeLinejoin="round" />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Isometrisch: der Arbeitsplatz
// ---------------------------------------------------------------------------

/** Kreis in der senkrechten Ebene y = konstant, zur linken Vorderseite gewandt */
function scheibeY(x: number, y: number, z: number, r: number, n = 36) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const w = (2 * Math.PI * i) / n
    return iso(x + r * Math.cos(w), y, z + r * Math.sin(w))
  })
}

/** Ein roter Quader; die rechte Seite etwas dunkler, damit er Körper hat */
function RoterQuader({ x, y, z, b, t, h }: { x: number; y: number; z: number; b: number; t: number; h: number }) {
  return (
    <g>
      <Quader x={x} y={y} z={z} b={b} t={t} h={h} oben={ROT} links={ROT} rechts={ROT} />
      <polygon fill={TINTE} opacity="0.22" points={punkte([x + b, y, z], [x + b, y + t, z], [x + b, y + t, z + h], [x + b, y, z + h])} />
      <polygon fill={GRUND} opacity="0.18" points={punkte([x, y, z + h], [x + b, y, z + h], [x + b, y + t, z + h], [x, y + t, z + h])} />
    </g>
  )
}

/** Messstand mit Messuhr über dem roten Testfall; (x, y, z) ist die Ecke der Platte. */
function Messstand({ x, y, z }: { x: number; y: number; z: number }) {
  const p = { b: 56, t: 46, h: 6 }
  const zp = z + p.h
  const teil = { x: x + 28, y: y + 12, b: 18, t: 18, h: 12 }
  const m = { x: teil.x + teil.b / 2, y: teil.y + teil.t / 2 }
  const saeule = { x: x + 10, y: m.y - 2, r: 4 }
  const ru = 13
  const zu = zp + teil.h + 11 + ru
  const za = zu + ru + 6
  const [hx1, hy1] = iso(m.x, m.y - 2, za)
  const [hx2, hy2] = iso(m.x, m.y, zu + ru)
  const [tx1, ty1] = iso(m.x, m.y, zu - ru)
  const [tx2, ty2] = iso(m.x, m.y, zp + teil.h)
  const [zx, zy] = iso(m.x, m.y + 1, zu)
  const zeiger = iso(m.x + ru * 0.62 * Math.cos(1.1), m.y + 1, zu + ru * 0.62 * Math.sin(1.1))
  return (
    <g>
      <Quader x={x} y={y} z={z} b={p.b} t={p.t} h={p.h} oben={FLAECHE} links={RAND} rechts={LEISE} />
      <Zylinder x={saeule.x} y={saeule.y} z={zp} r={saeule.r} h={za - zp + 10} />
      <Quader x={saeule.x - 5} y={saeule.y - 5} z={za - 3} b={10} t={10} h={8} />
      <Quader x={saeule.x + 5} y={m.y - 4} z={za - 1} b={m.x - saeule.x - 3} t={4} h={4} />
      <line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke={TINTE} strokeWidth="2.6" />
      <RoterQuader {...teil} z={zp} />
      <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={TINTE} strokeWidth="2" strokeLinecap="round" />
      {/* Messuhr: Gehäuse, Zifferblatt, Zeiger */}
      <polygon fill={RAND} {...STRICH} points={liste(scheibeY(m.x, m.y - 2, zu, ru))} />
      <polygon fill={GRUND} {...STRICH} points={liste(scheibeY(m.x, m.y + 1, zu, ru))} />
      <g stroke={TINTE} strokeWidth="1" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => {
          const w = Math.PI / 2 + (i - 3.5) * 0.42
          const [a1, b1] = iso(m.x + ru * 0.7 * Math.cos(w), m.y + 1, zu + ru * 0.7 * Math.sin(w))
          const [a2, b2] = iso(m.x + ru * 0.88 * Math.cos(w), m.y + 1, zu + ru * 0.88 * Math.sin(w))
          return <line key={i} x1={a1} y1={b1} x2={a2} y2={b2} />
        })}
      </g>
      <line x1={zx} y1={zy} x2={zeiger[0]} y2={zeiger[1]} stroke={TINTE} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx={zx} cy={zy} r="1.6" fill={TINTE} />
    </g>
  )
}

/** Ein Stufenblock: zwei Quader übereinander, der obere kürzer */
function Stufe({ x, y, z, b, t, h, oben = GRUND }: { x: number; y: number; z: number; b: number; t: number; h: number; oben?: string }) {
  return (
    <g>
      <Quader x={x} y={y} z={z} b={b} t={t} h={h / 2} oben={oben} />
      <Quader x={x + b / 2} y={y} z={z + h / 2} b={b / 2} t={t} h={h / 2} oben={oben} />
    </g>
  )
}

export function EntwicklerIso() {
  const zb = ZT + 1.2
  // Endmaße im Kasten, aufsteigend; ein Platz ist leer
  const kasten = { x: 10, y: 66, b: 48, t: 30, h: 6 }
  const hoehen = [5, 7, 9, 11, 0, 15]
  return (
    <Bild titel="Der Arbeitsplatz des Entwicklers: ein Prüfstand mit Messuhr über einem roten Testfall, Probestücke in Arbeit, ein Kasten mit Endmaßen, die Zeichnung des Testfalls, ein Messschieber">
      <Quader x={0} y={0} z={0} b={168} t={118} h={ZT} />
      {/* Probestücke in Arbeit, auf einem Brett hinten rechts */}
      <Quader x={116} y={8} z={ZT} b={42} t={30} h={3} oben={FLAECHE} />
      <Stufe x={120} y={14} z={ZT + 3} b={14} t={10} h={10} />
      <Zylinder x={146} y={18} z={ZT + 3} r={5} h={8} />
      <Quader x={128} y={26} z={ZT + 3} b={9} t={8} h={6} />
      <Messstand x={52} y={14} z={ZT} />
      {/* Kasten mit Endmaßen */}
      <Quader {...kasten} z={ZT} oben={RAND} />
      {[0, 1].flatMap((reihe) =>
        hoehen.map((h, i) =>
          h === 0 || (reihe === 1 && i > 3) ? null : (
            <Quader key={`${reihe}-${i}`} x={kasten.x + 4 + i * 7} y={kasten.y + 4 + reihe * 12} z={ZT + kasten.h} b={5} t={9} h={reihe === 0 ? h : h - 3} />
          ),
        ),
      )}
      {/* Die Zeichnung des Testfalls: Form und Maße */}
      <Quader x={110} y={68} z={ZT} b={46} t={40} h={1.2} />
      <g stroke={TINTE} strokeWidth="1.4" fill="none" strokeLinejoin="round">
        <polygon points={punkte([118, 96, zb], [118, 84, zb], [128, 84, zb], [128, 78, zb], [144, 78, zb], [144, 96, zb])} />
      </g>
      <g stroke={LEISE} strokeWidth="1" strokeLinecap="round">
        <Strich von={[118, 102]} bis={[144, 102]} z={zb} />
        <Strich von={[118, 100]} bis={[118, 104]} z={zb} />
        <Strich von={[144, 100]} bis={[144, 104]} z={zb} />
        <Strich von={[150, 78]} bis={[150, 96]} z={zb} />
        <Strich von={[148, 78]} bis={[152, 78]} z={zb} />
        <Strich von={[148, 96]} bis={[152, 96]} z={zb} />
      </g>
      {/* Messschieber, flach auf dem Tisch */}
      <g {...STRICH} strokeWidth={1.2}>
        <polygon fill={GRUND} points={punkte([16, 104, zb], [96, 104, zb], [96, 110, zb], [16, 110, zb])} />
        <polygon fill={GRUND} points={punkte([16, 92, zb], [23, 92, zb], [23, 104, zb], [16, 104, zb])} />
        <polygon fill={FLAECHE} points={punkte([40, 93, zb + 1.5], [47, 93, zb + 1.5], [47, 103, zb + 1.5], [40, 103, zb + 1.5])} />
        <polygon fill={FLAECHE} points={punkte([38, 103, zb + 1.5], [60, 103, zb + 1.5], [60, 111, zb + 1.5], [38, 111, zb + 1.5])} />
      </g>
      <g stroke={TINTE} strokeWidth="0.8">
        {[64, 68, 72, 76, 80, 84, 88, 92].map((x) => (
          <Strich key={x} von={[x, 104]} bis={[x, x % 8 === 0 ? 107 : 106]} z={zb} />
        ))}
      </g>
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Grenze: Er ändert keine Akte und keine Regel. Die Ordner stehen jenseits der Linie.
// ---------------------------------------------------------------------------

export function EntwicklerGrenze() {
  return (
    <Bild titel="Der Entwickler ändert keine Akte und keine Regel: Er hebt die Hand, die Ordner stehen jenseits der roten Linie" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Zwei Ordner: Regeln und Akten */}
        <g transform="rotate(-6 296 198)">
          <rect x="272" y="128" width="24" height="70" rx="2" fill={GRUND} />
          <rect x="277" y="137" width="14" height="22" rx="1" strokeWidth="1.2" />
          <path d="M280 144 H288 M280 150 H286" strokeWidth="1" opacity="0.6" />
          <circle cx="284" cy="181" r="4.5" strokeWidth="1.3" />
        </g>
        <rect x="246" y="122" width="25" height="76" rx="2" fill={GRUND} />
        <rect x="251" y="131" width="15" height="24" rx="1" strokeWidth="1.2" />
        <path d="M254 139 H263 M254 145 H261" strokeWidth="1" opacity="0.6" />
        <circle cx="258.5" cy="180" r="4.5" strokeWidth="1.3" />
        {/* Sein Testfall bleibt auf seiner Seite */}
        <path d="M198 198 V186 H208 V179 H224 V198" fill={FLAECHE} />
        <EntwicklerFigur id="k-gr-entwickler" />
        {/* Die Hand: offen, freundlich, deutlich */}
        <path d="M180 158 C190 156 198 158 204 162 L210 176 C200 180 190 182 184 180 Z" fill={GRUND} />
        <path d="M200 160 L205 176" strokeWidth="1.2" />
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
// Sinnbild: Messuhr über dem roten Testfall, kräftig gezeichnet für 48 Pixel
// ---------------------------------------------------------------------------

export function EntwicklerSinnbild() {
  const zp = 7
  const teil = { x: 18, y: 18, b: 22, t: 22, h: 14 }
  const m = { x: teil.x + teil.b / 2, y: teil.y + teil.t / 2 }
  const ru = 16
  const zu = zp + teil.h + 10 + ru
  const za = zu + ru + 6
  const s = { x: 4, y: m.y - 2 }
  const [a1x, a1y] = iso(s.x, s.y, za)
  const [a2x, a2y] = iso(m.x, s.y, za)
  const [h2x, h2y] = iso(m.x, m.y, zu + ru)
  const [t1x, t1y] = iso(m.x, m.y, zu - ru)
  const [t2x, t2y] = iso(m.x, m.y, zp + teil.h)
  const [zx, zy] = iso(m.x, m.y + 1.5, zu)
  const zeiger = iso(m.x + ru * 0.6 * Math.cos(1.0), m.y + 1.5, zu + ru * 0.6 * Math.sin(1.0))
  return (
    <Bild titel="Sinnbild für den Entwickler: eine Messuhr über einem roten Testfall" rahmen="82 -1 128 128">
      <Quader x={-6} y={6} z={0} b={60} t={46} h={zp} oben={FLAECHE} links={RAND} rechts={LEISE} />
      <Zylinder x={s.x} y={s.y} z={zp} r={5} h={za - zp + 9} />
      <line x1={a1x} y1={a1y} x2={a2x} y2={a2y} stroke={TINTE} strokeWidth="7" strokeLinecap="round" />
      <line x1={a2x} y1={a2y} x2={h2x} y2={h2y} stroke={TINTE} strokeWidth="4" strokeLinecap="round" />
      <RoterQuader {...teil} z={zp} />
      <line x1={t1x} y1={t1y} x2={t2x} y2={t2y} stroke={TINTE} strokeWidth="3.5" strokeLinecap="round" />
      <polygon fill={TINTE} points={liste(scheibeY(m.x, m.y - 2.5, zu, ru))} />
      <polygon fill={GRUND} stroke={TINTE} strokeWidth="4" strokeLinejoin="round" points={liste(scheibeY(m.x, m.y + 1.5, zu, ru))} />
      <g stroke={TINTE} strokeWidth="2.2" strokeLinecap="round">
        {Array.from({ length: 7 }, (_, i) => {
          const w = Math.PI / 2 + (i - 3) * 0.5
          const [a1, b1] = iso(m.x + ru * 0.6 * Math.cos(w), m.y + 1.5, zu + ru * 0.6 * Math.sin(w))
          const [a2, b2] = iso(m.x + ru * 0.8 * Math.cos(w), m.y + 1.5, zu + ru * 0.8 * Math.sin(w))
          return <line key={i} x1={a1} y1={b1} x2={a2} y2={b2} />
        })}
      </g>
      <line x1={zx} y1={zy} x2={zeiger[0]} y2={zeiger[1]} stroke={TINTE} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={zx} cy={zy} r="3" fill={TINTE} />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Kopf
// ---------------------------------------------------------------------------

export function EntwicklerAvatar() {
  return (
    <Rund titel="Entwickler" id="k-av-entwickler">
      <EntwicklerFigur id="k-av-entwickler-kopf" tasche={false} />
    </Rund>
  )
}
