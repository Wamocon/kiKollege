import { Bild, FLAECHE, GRUND, iso, KOPF, Kopf, LEISE, LINIE, punkte, Quader, RAND, ROT, RUMPF, Rund, STRICH, Strich, TINTE, ZT } from './basis'

/** Der Reporter in den fünf Grafikarten.
 *  Er setzt Befunde und Laufnotizen in Berichte im Erscheinungsbild des Hauses.
 *  Kürzen und umstellen darf er, jede Fundstelle bleibt stehen.
 *  Rot trägt der Bericht, den er weitergibt; in der Grenze die Linie.
 *  Kennzeichen: kurzes Haar, Augenschirm wie in einer Redaktion (nur Umriss),
 *  Bleistift hinter dem Ohr, Hemd mit Hosenträgern und hochgekrempelten Ärmeln. */

/** Kopf wie in basis.tsx, mit einem Platz unter dem Ohr: Der Bleistift steckt
 *  hinter dem Ohr, also liegt das Ohr über ihm. */
function KopfMitStift({ id, flaechen, stift }: { id: string; flaechen: React.ReactNode; stift: React.ReactNode }) {
  return (
    <g>
      <clipPath id={`${id}-kopf`}>
        <path d={KOPF} />
      </clipPath>
      <path d={KOPF} fill={GRUND} stroke="none" />
      <g clipPath={`url(#${id}-kopf)`}>{flaechen}</g>
      <path d={KOPF} />
      {stift}
      <path d="M114 92 C108 86 102 94 106 101 C108 105 113 105 115 102" fill={GRUND} />
    </g>
  )
}

/** Ein Bleistift mit Radiergummi, Zwinge, Kante, Holzspitze und Mine. Liegt von (x, y) im Winkel w. */
function Bleistift({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${w})`}>
      <rect x="0" y="-4" width="6.5" height="8" rx="2.2" fill={FLAECHE} strokeWidth="1.4" />
      <rect x="6.5" y="-4" width="5" height="8" fill={GRUND} strokeWidth="1.4" />
      <path d="M9 -4 V4" strokeWidth="1" />
      <rect x="11.5" y="-4" width="22.5" height="8" fill={GRUND} strokeWidth="1.4" />
      <path d="M11.5 -1.4 H34 M11.5 1.4 H34" strokeWidth="0.8" opacity="0.55" />
      <path d="M34 -4 L42 -1.3 V1.3 L34 4 Z" fill={FLAECHE} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M42 -1.3 L46.5 0 L42 1.3 Z" fill={TINTE} strokeWidth="1" strokeLinejoin="round" />
    </g>
  )
}

/** Kurzes Haar, Augenschirm, Bleistift hinter dem Ohr, Hemd mit Hosenträgern. */
function ReporterFigur({ id }: { id: string }) {
  return (
    <g>
      <path d={RUMPF} fill={GRUND} />
      <path d="M128 131 L126 146 M154 127 L156 142" />
      {/* Hosenträger, über die Schultern nach unten */}
      <path d="M113 150 L121 147 L118 198 L109 198 Z" fill={TINTE} />
      <path d="M161 143 L169 146 L173 198 L164 198 Z" fill={TINTE} />
      {/* Hemdkragen, offen, ohne Krawatte */}
      <path d="M126 145 L131 160 L140 152 Z" fill={GRUND} />
      <path d="M156 141 L151 158 L140 152 Z" fill={GRUND} />
      <path d="M140 160 V198" strokeWidth="1.2" opacity="0.5" />
      <KopfMitStift
        id={id}
        flaechen={
          <g>
            {/* Kurzes Haar: oben über dem Band, hinten bis zum Nacken */}
            <path
              d="M182 58 C160 60 132 68 113 83 C112 86 112.5 88 113 90 C105 86 101 96 104 106 C106 113 108 117 111 121 L60 124 L60 20 L182 20 Z"
              fill={TINTE}
            />
            {/* Band des Augenschirms rund um den Kopf */}
            <path d="M92 79 C118 71 148 63 180 59 L181 67 C150 70 120 78 92 87 Z" fill={GRUND} strokeWidth="1.5" />
          </g>
        }
        stift={<Bleistift x={82} y={80.5} w={22} />}
      />
      {/* Gesicht: aufmerksam, freundlich */}
      <path d="M144 80 C149 78 154 78 158 80" strokeWidth="2" />
      <ellipse cx="151.5" cy="92" rx="2.3" ry="2.8" fill={TINTE} stroke="none" />
      <path d="M158 115 C161 117 164 116.5 166 114.5" />
      {/* Der Schirm: nur Umriss, er schattet die Augen beim Lesen */}
      <path d="M147 69 C160 64 175 63 184 66 C192 70 197 76 198 83 C188 85 175 82 166 77 C159 74 152 72 147 71 Z" fill={GRUND} strokeWidth="1.6" />
      <path d="M170 66.5 C182 68 191 74 194 81" strokeWidth="1" opacity="0.5" />
    </g>
  )
}

/** Eine Karte mit einem Befund: zwei Zeilen und die Fundstelle in Klammern */
function Karte({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="28" height="22" rx="1" fill={GRUND} />
      <path d={`M${x + 5} ${y + 7} h-1.5 v8 h1.5 M${x + 23} ${y + 7} h1.5 v8 h-1.5 M${x + 8} ${y + 11} H${x + 20}`} strokeWidth="1.2" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Linie: setzt einen Befund in den Bericht
// ---------------------------------------------------------------------------

export function ReporterLinie() {
  return (
    <Bild titel="Der Reporter, als Strichzeichnung: setzt einen Befund an seinen Platz im Bericht, der Bericht trägt den roten Kopf des Hauses" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Der Bericht auf einem Aufsteller */}
        <path d="M232 182 L226 198 M274 182 L280 198" />
        <rect x="212" y="46" width="82" height="136" rx="2" fill={GRUND} />
        <g strokeWidth="1.2">
          <path d="M222 74 H266" strokeWidth="2.4" />
          <path d="M222 84 H284 M222 91 H276" opacity="0.55" />
          {/* Die Zahlen kommen aus den Läufen; er setzt sie nur */}
          <rect x="225" y="114" width="6" height="14" fill={FLAECHE} />
          <rect x="235" y="103" width="6" height="25" fill={FLAECHE} />
          <rect x="245" y="109" width="6" height="19" fill={FLAECHE} />
          <path d="M221 128 H255" />
          <path d="M262 105 H286 M262 112 H284 M262 119 H286 M262 126 H280" opacity="0.55" />
          {/* Ein Befund steht schon, der Platz für den nächsten ist frei */}
          <rect x="222" y="140" width="28" height="22" rx="1" strokeDasharray="3 3" opacity="0.55" />
          <path d="M222 172 H262" opacity="0.4" />
        </g>
        <Karte x={258} y={140} />
        <ReporterFigur id="k-li-reporter" />
        {/* Der Arm bringt den nächsten Befund an seinen Platz */}
        <g transform="rotate(-7 238 162)">
          <Karte x={224} y={151} />
        </g>
        {/* Hemdsärmel hochgekrempelt, darunter der Unterarm */}
        <path d="M203 161 C207 161.5 211 162 215 163 L214 179 C210 179 206 179.5 203 180 Z" fill={GRUND} />
        <path d="M180 160 C186 158.5 192 158.5 197 159.5 L197 181.5 C194 182 192 183 190 184 Z" fill={GRUND} />
        <path d="M196 158.5 L204 159.5 L204 181 L196 182 Z" fill={GRUND} />
        <path d="M200 159 V181.5" strokeWidth="1" opacity="0.55" />
        <path d="M215 163 C221 160 229 161 231 167 C233 174 227 179 214 179 Z" fill={GRUND} />
        <path d="M219 168 C223 166 227 167 229 170" strokeWidth="1.1" />
      </g>
      {/* Der Bericht trägt den Kopf des Hauses */}
      <rect x="213" y="47" width="80" height="16" rx="1" fill={ROT} />
      <path d="M221 55 H252" stroke={GRUND} strokeWidth="2.2" strokeLinecap="round" />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Isometrisch: der Arbeitsplatz
// ---------------------------------------------------------------------------

/** Ein gedrehtes Rechteck flach in der Ebene z, Mitte (cx, cy), Winkel w */
function blatt(cx: number, cy: number, b: number, t: number, w: number, z: number) {
  const c = Math.cos(w)
  const s = Math.sin(w)
  const ecken: [number, number][] = [[-b / 2, -t / 2], [b / 2, -t / 2], [b / 2, t / 2], [-b / 2, t / 2]]
  return ecken.map(([u, v]) => iso(cx + u * c - v * s, cy + u * s + v * c, z).join(',')).join(' ')
}

/** Eine Strecke auf einem gedrehten Blatt, in dessen eigenen Koordinaten */
function aufBlatt(cx: number, cy: number, w: number, z: number, u1: number, v1: number, u2: number, v2: number) {
  const c = Math.cos(w)
  const s = Math.sin(w)
  const [x1, y1] = iso(cx + u1 * c - v1 * s, cy + u1 * s + v1 * c, z)
  const [x2, y2] = iso(cx + u2 * c - v2 * s, cy + u2 * s + v2 * c, z)
  return <line x1={x1} y1={y1} x2={x2} y2={y2} />
}

/** Eine Karteikarte flach auf dem Tisch, mit zwei Zeilen und der Fundstelle */
function KarteFlach({ cx, cy, w, z }: { cx: number; cy: number; w: number; z: number }) {
  return (
    <g>
      <polygon {...STRICH} strokeWidth={1.2} fill={GRUND} points={blatt(cx, cy, 24, 16, w, z)} />
      <g stroke={TINTE} strokeWidth="1.1" strokeLinecap="round">
        {aufBlatt(cx, cy, w, z, -7, -3, 7, -3)}
        {aufBlatt(cx, cy, w, z, -9, -6, -9, 0)}
        {aufBlatt(cx, cy, w, z, 9, -6, 9, 0)}
      </g>
      <g stroke={LEISE} strokeWidth="1.1" strokeLinecap="round">
        {aufBlatt(cx, cy, w, z, -8, 4, 6, 4)}
      </g>
    </g>
  )
}

export function ReporterIso() {
  const zb = ZT + 1.5
  // Karteikasten mit den Befunden, hinten rechts
  const kasten = { x: 124, y: 8, b: 34, t: 44, h: 14 }
  const kz = ZT + kasten.h
  // Farbfächer vorn links: Streifen um einen Drehpunkt
  const dreh: [number, number] = [8, 110]
  const facher = [0, 1, 2, 3, 4].map((i) => {
    const w = -1.3 + i * 0.2
    const c = Math.cos(w)
    const s = Math.sin(w)
    const n = [-s * 4.5, c * 4.5]
    const l = 42
    const z = ZT + 0.6 * i
    const [px, py] = dreh
    return {
      farbe: [TINTE, LEISE, RAND, FLAECHE, GRUND][i],
      punkte: punkte(
        [px + n[0], py + n[1], z],
        [px + c * l + n[0], py + s * l + n[1], z],
        [px + c * l - n[0], py + s * l - n[1], z],
        [px - n[0], py - n[1], z],
      ),
    }
  })
  const [dx, dy] = iso(dreh[0], dreh[1], ZT + 3.5)
  // Bleistift vorn rechts
  const stift = (() => {
    const a: [number, number] = [122, 112]
    const b: [number, number] = [160, 100]
    const l = Math.hypot(b[0] - a[0], b[1] - a[1])
    const e = [(b[0] - a[0]) / l, (b[1] - a[1]) / l]
    const n = [-e[1] * 1.8, e[0] * 1.8]
    const s = [b[0] - e[0] * 7, b[1] - e[1] * 7]
    const z = ZT + 1.8
    return {
      schaft: punkte([a[0] + n[0], a[1] + n[1], z], [s[0] + n[0], s[1] + n[1], z], [s[0] - n[0], s[1] - n[1], z], [a[0] - n[0], a[1] - n[1], z]),
      spitze: punkte([s[0] + n[0], s[1] + n[1], z], [b[0], b[1], z], [s[0] - n[0], s[1] - n[1], z]),
      mine: iso(b[0] - e[0] * 2, b[1] - e[1] * 2, z),
    }
  })()
  return (
    <Bild titel="Der Arbeitsplatz des Reporters: Laufnotizen, ein Karteikasten mit Befunden, ein Bericht mit rotem Kopf und einer Grafik, lose Karten, ein Farbfächer, ein Bleistift">
      <Quader x={0} y={0} z={0} b={168} t={118} h={ZT} />
      {/* Laufnotizen, gestapelt */}
      <Quader x={12} y={14} z={ZT} b={34} t={42} h={7} />
      <g stroke={TINTE} strokeWidth="0.9" opacity="0.45">
        {[2.4, 4.8].map((h) => (
          <Strich key={h} von={[12, 56]} bis={[46, 56]} z={ZT + h} />
        ))}
      </g>
      <polygon {...STRICH} strokeWidth={1.2} fill={GRUND} points={blatt(30, 34, 30, 38, 0.14, ZT + 7.6)} />
      <g stroke={LEISE} strokeWidth="1.3" strokeLinecap="round">
        {[-10, -4, 2, 8].map((v) => (
          <g key={v}>{aufBlatt(30, 34, 0.14, ZT + 7.6, -10, v, 10, v)}</g>
        ))}
      </g>
      {/* Der Bericht: Kopf des Hauses, Grafik, Text, ein freier Platz */}
      <Quader x={54} y={30} z={ZT} b={62} t={76} h={1.5} />
      <polygon fill={ROT} {...STRICH} strokeWidth={1.1} points={punkte([54, 30, zb], [116, 30, zb], [116, 42, zb], [54, 42, zb])} />
      <g stroke={TINTE} strokeWidth="2" strokeLinecap="round">
        <Strich von={[62, 50]} bis={[94, 50]} z={zb} />
      </g>
      {[0, 1, 2].map((i) => (
        <Quader key={i} x={62 + i * 12} y={58} z={zb} b={7} t={7} h={[10, 18, 13][i]} />
      ))}
      <g stroke={LEISE} strokeWidth="1.5" strokeLinecap="round">
        {[76, 83].map((y) => (
          <Strich key={y} von={[62, y]} bis={[108, y]} z={zb} />
        ))}
      </g>
      <polygon fill="none" stroke={TINTE} strokeWidth="1.1" strokeDasharray="3 3" opacity="0.6" points={punkte([62, 89, zb], [86, 89, zb], [86, 104, zb], [62, 104, zb])} />
      <KarteFlach cx={101} cy={96.5} w={0} z={zb + 0.4} />
      {/* Karteikasten mit den Befunden, Karten stehen hoch */}
      <Quader {...kasten} z={ZT} oben={RAND} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const x = kasten.x + 4 + i * 4.4
        const hoch = i === 4 ? 9 : 6
        return (
          <polygon
            key={i}
            {...STRICH}
            strokeWidth={1.1}
            fill={GRUND}
            points={punkte([x, kasten.y + 3, kz - 3], [x, kasten.y + kasten.t - 3, kz - 3], [x, kasten.y + kasten.t - 3, kz + hoch], [x, kasten.y + 3, kz + hoch])}
          />
        )
      })}
      <polygon {...STRICH} fill={RAND} points={punkte([kasten.x + kasten.b, kasten.y, ZT], [kasten.x + kasten.b, kasten.y + kasten.t, ZT], [kasten.x + kasten.b, kasten.y + kasten.t, kz], [kasten.x + kasten.b, kasten.y, kz])} />
      <polygon {...STRICH} fill={FLAECHE} points={punkte([kasten.x, kasten.y + kasten.t, ZT], [kasten.x + kasten.b, kasten.y + kasten.t, ZT], [kasten.x + kasten.b, kasten.y + kasten.t, kz], [kasten.x, kasten.y + kasten.t, kz])} />
      {/* Lose Karten: eine kommt aus dem Kasten, eine rückt an ihren Platz */}
      <KarteFlach cx={136} cy={72} w={0.3} z={ZT + 0.6} />
      <KarteFlach cx={68} cy={109} w={-0.22} z={zb + 0.8} />
      {/* Farbfächer: das Erscheinungsbild des Hauses */}
      {facher.map((f, i) => (
        <polygon key={i} {...STRICH} strokeWidth={1.2} fill={f.farbe} points={f.punkte} />
      ))}
      <circle cx={dx} cy={dy} r="2.4" fill={GRUND} stroke={TINTE} strokeWidth="1.2" />
      {/* Bleistift */}
      <polygon {...STRICH} strokeWidth={1.2} fill={GRUND} points={stift.schaft} />
      <polygon {...STRICH} strokeWidth={1.2} fill={FLAECHE} points={stift.spitze} />
      <circle cx={stift.mine[0]} cy={stift.mine[1]} r="1.2" fill={TINTE} />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Grenze: Er erfindet keine Zahl. Die Würfel liegen jenseits der roten Linie.
// ---------------------------------------------------------------------------

export function ReporterGrenze() {
  return (
    <Bild titel="Der Reporter erfindet keine Zahl: Er hebt die Hand, die Würfel liegen jenseits der roten Linie" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Zwei Würfel: Zahlen, die niemand gemessen hat */}
        <path d="M250 178 L257 171 H277 L270 178 Z" fill={GRUND} />
        <path d="M270 178 L277 171 V191 L270 198 Z" fill={FLAECHE} />
        <rect x="250" y="178" width="20" height="20" rx="1.5" fill={GRUND} />
        <g fill={TINTE} stroke="none">
          <circle cx="255" cy="183" r="1.8" />
          <circle cx="265" cy="183" r="1.8" />
          <circle cx="260" cy="188" r="1.8" />
          <circle cx="255" cy="193" r="1.8" />
          <circle cx="265" cy="193" r="1.8" />
          <ellipse cx="263.5" cy="174.5" rx="2" ry="1.2" />
          <ellipse cx="273.5" cy="180" rx="1.1" ry="1.8" />
          <ellipse cx="273.5" cy="189" rx="1.1" ry="1.8" />
        </g>
        <path d="M281 186 L285 182 H298 L294 186 Z" fill={GRUND} />
        <path d="M294 186 L298 182 V194 L294 198 Z" fill={FLAECHE} />
        <rect x="281" y="186" width="13" height="12" rx="1.2" fill={GRUND} />
        <g fill={TINTE} stroke="none">
          <circle cx="284.5" cy="189.5" r="1.4" />
          <circle cx="287.5" cy="192" r="1.4" />
          <circle cx="290.5" cy="194.5" r="1.4" />
        </g>
        <ReporterFigur id="k-gr-reporter" />
        {/* Sein Bericht liegt vor ihm, auf seiner Seite */}
        <path d="M156 198 L163 189 H226 L223 198 Z" fill={GRUND} />
        <path d="M163 189 H226 L224.8 192.6 H160.2 Z" fill={FLAECHE} strokeWidth="1.2" />
        <path d="M166 195.5 H212" strokeWidth="1.1" opacity="0.5" />
        {/* Die Hand: offen, freundlich, deutlich */}
        <path d="M180 158 C190 156 198 158 204 162 L210 176 C200 180 190 182 184 180 Z" fill={GRUND} />
        {/* Der Ärmel ist hochgekrempelt */}
        <path d="M194 157 L201.5 159.5 L207.5 177.5 L199 180 Z" fill={GRUND} />
        <path d="M197.8 158.2 L203.2 178.8" strokeWidth="1" opacity="0.55" />
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
// Sinnbild: der Bericht mit dem roten Kopf des Hauses
// ---------------------------------------------------------------------------

export function ReporterSinnbild() {
  const z = 1.5
  const zb = z * 2
  return (
    <Bild titel="Sinnbild für den Reporter: ein Bericht mit dem roten Kopf des Hauses und einer Grafik" rahmen="79 56 134 134">
      <Quader x={24} y={16} z={0} b={60} t={78} h={z} />
      <Quader x={20} y={20} z={z} b={60} t={78} h={z} />
      <polygon fill={ROT} {...STRICH} strokeWidth={1.4} points={punkte([20, 20, zb], [80, 20, zb], [80, 37, zb], [20, 37, zb])} />
      {/* Zeilen hinter, Säulen vor der Mitte: Die rote Kopfleiste bleibt frei */}
      <g stroke={LEISE} strokeWidth="3" strokeLinecap="round">
        {[47, 56, 65].map((y) => (
          <Strich key={y} von={[28, y]} bis={[72, y]} z={zb} />
        ))}
      </g>
      {[0, 1, 2].map((i) => (
        <Quader key={i} x={28 + i * 15} y={76} z={zb} b={10} t={10} h={[18, 32, 24][i]} />
      ))}
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Kopf
// ---------------------------------------------------------------------------

export function ReporterAvatar() {
  return (
    <Rund titel="Reporter" id="k-av-reporter">
      <ReporterFigur id="k-av-reporter-kopf" />
    </Rund>
  )
}
