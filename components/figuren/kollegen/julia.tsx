import { Bild, bogen, FLAECHE, GRUND, iso, Kopf, LEISE, LINIE, liste, punkte, Quader, RAND, ROT, RUMPF, Rund, STRICH, Strich, TINTE, ZT, Zylinder } from './basis'

/** julia-trend, Researcherin, in den fünf
 *  Grafikarten. Kinnlanger Bob mit seitlichem Pony, Rollkragen. Rot trägt den
 *  Fund mit seiner Quelle: der Anhänger am Ausschnitt, auf dem Radar der
 *  Punkt, den sie weitergibt. Wie ihr Eintrag in den Daten ist sie intern; die öffentliche Fassung zeigt
 *  sie nicht. */

// ---------------------------------------------------------------------------
// Figur: Kopf und Kragen, gemeinsam für Linie, Grenze und Kopf
// ---------------------------------------------------------------------------

/** Bob mit seitlichem Pony: liegt über dem Umriss, verdeckt das Ohr und endet am Kinn. */
const HAAR =
  'M169 73 C168 64 160 54 150 50 C136 42 110 44 98 60 C88 74 86 102 90 120 C92 128 100 131 112 132 L132 134 C134 116 130 92 137 76 C146 66 160 66 169 73 Z'

function JuliaKopf({ id }: { id: string }) {
  return (
    <g>
      <Kopf id={id} flaechen={null} />
      <path d={HAAR} fill={TINTE} />
      <path d="M118 60 C108 74 104 98 108 122" stroke={GRUND} strokeWidth="1.3" opacity="0.7" />
      {/* Braue, Auge, Mund: aufmerksam, sachlich */}
      <path d="M143 79 C148 77 154 77 158 79" strokeWidth="2" />
      <ellipse cx="152" cy="91" rx="2.3" ry="2.8" fill={TINTE} stroke="none" />
      <path d="M160 115 C162 116.5 164 116.5 166 114.5" />
    </g>
  )
}

function Rollkragen() {
  return (
    <g>
      <path d="M118 124 L158 124 C162 128 162 132 162 136 L164 146 C150 152 134 153 118 148 Z" fill={GRUND} />
      <path d="M119 137 C134 142 150 141 162 135" />
      <path d="M126 142 V149 M134 143 V151 M142 143 V151 M150 142 V150 M157 140 V148" strokeWidth="1.1" opacity="0.5" />
    </g>
  )
}

/** Ein Ausschnitt mit gerissener Unterkante, wie er aus der Quelle kam */
const AUSSCHNITT =
  'M220 66 H268 V122 L264 125 L260 122 L256 125 L252 122 L248 125 L244 122 L240 125 L236 122 L232 125 L228 122 L224 125 L220 122 Z'

// ---------------------------------------------------------------------------
// Linie: bei der Arbeit
// ---------------------------------------------------------------------------

export function JuliaLinie() {
  return (
    <Bild
      titel="julia-trend, als Strichzeichnung: hält einen Ausschnitt mit seiner Quelle hoch und vergleicht ihn mit der Mappe zum eigenen Aufbau"
      rahmen="48 30 256 192"
      papier
    >
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        {/* Tisch */}
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Die Mappe zum eigenen Aufbau, aufgeschlagen */}
        <path d="M232 197 L240 184 L266 184 L264 197 Z" fill={GRUND} />
        <path d="M264 197 L266 184 L296 184 L292 197 Z" fill={GRUND} />
        <path d="M243 188 H261 M240 193 H259 M270 188 H291 M269 193 H286" strokeWidth="1.1" opacity="0.5" />
        {/* Oberkörper im Rollkragen */}
        <path d={RUMPF} fill={GRUND} />
        <Rollkragen />
        <JuliaKopf id="k-li-julia" />
        {/* Die Hand hinter dem Ausschnitt */}
        <path d="M218 146 C214 136 216 120 224 114 C232 110 240 114 240 122 L240 134 C240 142 234 148 226 148 Z" fill={GRUND} />
        {/* Der Ausschnitt */}
        <g transform="rotate(4 246 98)">
          <path d={AUSSCHNITT} fill={GRUND} />
          <path d="M226 74 H262" strokeWidth="3" />
          <rect x="226" y="82" width="16" height="14" fill={FLAECHE} strokeWidth="1.2" />
          <path d="M246 84 H264 M246 89 H262 M246 94 H264 M226 102 H264 M226 107 H260 M226 112 H264 M226 117 H254" strokeWidth="1.1" opacity="0.55" />
        </g>
        {/* Daumen vorn auf dem Blatt */}
        <path d="M226 130 C226 122 230 114 236 113 C241 113 242 118 239 122 L232 132" fill={GRUND} />
        {/* Unterarm: der Ellbogen liegt auf dem Tisch */}
        <path d="M193 180 C194 192 200 198 208 198 H213 C216 197 217 194 216 191 L238 150 L222 142 L201 172 C197 174 194 177 193 180 Z" fill={GRUND} />
        <path d="M220 147 L235 155" strokeWidth="1.1" opacity="0.5" />
        {/* Der Faden zum Anhänger */}
        <path d="M265 69 C273 63 282 69 286 80" strokeWidth="1.2" />
      </g>
      {/* Die Quelle: Herkunft und Abrufdatum hängen am Fund */}
      <g transform="translate(285 76) rotate(-16)">
        <path d="M-7 5 L-3 0 H3 L7 5 V26 H-7 Z" fill={ROT} />
        <circle cx="0" cy="5" r="1.8" fill={GRUND} />
        <path d="M-4 13 H4 M-4 18 H2" stroke={GRUND} strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Radar: das Sinnbild, auch auf dem Arbeitsplatz
// ---------------------------------------------------------------------------

function Radar({ x, y, z, r, h, dick = 1 }: { x: number; y: number; z: number; r: number; h: number; dick?: number }) {
  const zo = z + h
  const schirm = r * 0.86
  const an = (rr: number, w: number) => iso(x + rr * Math.cos(w), y + rr * Math.sin(w), zo)
  const [mx, my] = iso(x, y, zo)
  const [kx, ky] = an(schirm, -1.6)
  const keil = [iso(x, y, zo), ...bogen(x, y, zo, schirm, -2.6, -1.6, 12)]
  const [rx, ry] = an(schirm * 0.6, -1.95)
  const leise = [an(schirm * 0.42, 0.7), an(schirm * 0.74, 2.5)]
  return (
    <g>
      <Zylinder x={x} y={y} z={z} r={r} h={h} seite={FLAECHE} />
      <polygon fill={TINTE} points={liste(bogen(x, y, zo, schirm))} />
      <g fill="none" stroke={GRUND} strokeWidth={dick} opacity="0.5">
        <polygon points={liste(bogen(x, y, zo, schirm * 0.66))} />
        <polygon points={liste(bogen(x, y, zo, schirm * 0.33))} />
        <Strich von={[x - schirm, y]} bis={[x + schirm, y]} z={zo} />
        <Strich von={[x, y - schirm]} bis={[x, y + schirm]} z={zo} />
      </g>
      <polygon fill={GRUND} opacity="0.32" points={liste(keil)} />
      <line x1={mx} y1={my} x2={kx} y2={ky} stroke={GRUND} strokeWidth={dick * 1.6} strokeLinecap="round" />
      {leise.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={1.5 * dick} fill={GRUND} />
      ))}
      <circle cx={rx} cy={ry} r={3 * dick} fill={ROT} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Isometrisch: der Arbeitsplatz
// ---------------------------------------------------------------------------

/** Eine flache Sprechblase auf dem Tisch: ein Beitrag aus einem Forum */
function blase(x: number, y: number, z: number, b: number, t: number) {
  const r = 4
  const p: [number, number, number][] = []
  const ecke = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 4; i++) {
      const w = a0 + (Math.PI / 2) * (i / 4)
      p.push([cx + r * Math.cos(w), cy + r * Math.sin(w), z])
    }
  }
  ecke(x + r, y + r, Math.PI)
  ecke(x + b - r, y + r, Math.PI * 1.5)
  ecke(x + b - r, y + t - r, 0)
  p.push([x + b * 0.42, y + t, z], [x + b * 0.2, y + t + 8, z], [x + b * 0.24, y + t, z])
  ecke(x + r, y + t - r, Math.PI / 2)
  return punkte(...p)
}

export function JuliaIso() {
  const zb = ZT + 0.8
  // Ausschnitt mit gerissener Vorderkante
  const a = { x: 64, y: 26, b: 32, t: 46 }
  const riss = Array.from({ length: 9 }, (_, i) => [a.x + a.b - (i * a.b) / 8, a.y + a.t - (i % 2 ? 3 : 0), zb] as [number, number, number])
  const [fx, fy] = iso(a.x + a.b - 2, a.y + a.t - 1, zb)
  const za = ZT + 0.6
  const [hx, hy] = iso(91, 84, za)
  // Aufstellkalender: Vorderseite schräg, Ringe am First
  const k = { x: 10, y: 8, b: 26, t: 16, h: 24 }
  const schraeg = (x: number, v: number) => [x, k.y + k.t - (k.t / 2) * v, ZT + k.h * v] as [number, number, number]
  return (
    <Bild titel="Der Arbeitsplatz von julia-trend: ein Radar mit einem markierten Fund, ein Ausschnitt mit seiner Quelle neben der Mappe zum eigenen Aufbau, Beiträge aus Foren, ein Kalender">
      <Quader x={0} y={0} z={0} b={168} t={118} h={ZT} />
      {/* Kalender: jede Angabe mit Abrufdatum */}
      <polygon {...STRICH} fill={RAND} points={punkte([k.x + k.b, k.y, ZT], [k.x + k.b, k.y + k.t, ZT], [k.x + k.b, k.y + k.t / 2, ZT + k.h])} />
      <polygon {...STRICH} fill={GRUND} points={punkte(schraeg(k.x, 0), schraeg(k.x + k.b, 0), schraeg(k.x + k.b, 1), schraeg(k.x, 1))} />
      <polygon {...STRICH} strokeWidth={1.1} fill={TINTE} points={punkte(schraeg(k.x, 0.78), schraeg(k.x + k.b, 0.78), schraeg(k.x + k.b, 1), schraeg(k.x, 1))} />
      <g fill={LEISE}>
        {[15, 20, 25, 30].flatMap((x) =>
          [0.2, 0.4, 0.6].map((v) => {
            const [px, py] = iso(...schraeg(x, v))
            return <circle key={`${x}-${v}`} cx={px} cy={py} r="1.2" />
          }),
        )}
      </g>
      {/* Mappe: der eigene Aufbau, aufgeschlagen */}
      <Quader x={104} y={18} z={ZT} b={58} t={52} h={1.5} />
      <g stroke={LEISE} strokeWidth="1.3" strokeLinecap="round">
        <Strich von={[133, 18]} bis={[133, 70]} z={ZT + 1.5} />
        {[28, 36, 44, 52, 60].map((y) => (
          <g key={y}>
            <Strich von={[109, y]} bis={[128, y]} z={ZT + 1.5} />
            <Strich von={[138, y]} bis={[157, y]} z={ZT + 1.5} />
          </g>
        ))}
      </g>
      {/* Der Ausschnitt daneben */}
      <polygon {...STRICH} fill={GRUND} points={punkte([a.x, a.y, zb], [a.x + a.b, a.y, zb], ...riss)} />
      <g stroke={TINTE} strokeWidth="2.4" strokeLinecap="round">
        <Strich von={[a.x + 5, a.y + 6]} bis={[a.x + a.b - 5, a.y + 6]} z={zb} />
      </g>
      <g stroke={LEISE} strokeWidth="1.2" strokeLinecap="round">
        {[14, 20, 26, 32, 38].map((d) => (
          <Strich key={d} von={[a.x + 5, a.y + d]} bis={[a.x + a.b - 5, a.y + d]} z={zb} />
        ))}
      </g>
      {/* Beiträge aus Foren: Hinweise, noch ohne Quelle */}
      <polygon {...STRICH} strokeWidth={1.3} fill={FLAECHE} points={blase(116, 80, ZT + 0.6, 34, 20)} />
      <polygon {...STRICH} strokeWidth={1.3} fill={GRUND} points={blase(110, 86, ZT + 1.6, 34, 20)} />
      <g stroke={LEISE} strokeWidth="1.2" strokeLinecap="round">
        <Strich von={[116, 93]} bis={[138, 93]} z={ZT + 1.6} />
        <Strich von={[116, 99]} bis={[132, 99]} z={ZT + 1.6} />
      </g>
      {/* Die Quelle am Fund: ein Anhänger am Faden */}
      <path d={`M${fx} ${fy} C${fx + 2} ${fy + 8} ${hx + 6} ${hy - 6} ${hx} ${hy}`} fill="none" stroke={TINTE} strokeWidth="1.2" />
      <polygon fill={ROT} stroke={TINTE} strokeWidth={1} strokeLinejoin="round" points={punkte([86, 84, za], [90, 80, za], [108, 80, za], [108, 90, za], [90, 90, za], [86, 87, za])} />
      <circle cx={hx} cy={hy} r="1.5" fill={GRUND} />
      <g stroke={GRUND} strokeWidth="1.3" strokeLinecap="round">
        <Strich von={[95, 83]} bis={[105, 83]} z={za} />
        <Strich von={[95, 87]} bis={[102, 87]} z={za} />
      </g>
      {/* Das Radar: was gerade aufkommt */}
      <Radar x={38} y={78} z={ZT} r={26} h={5} />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Sinnbild
// ---------------------------------------------------------------------------

export function JuliaSinnbild() {
  return (
    <Bild titel="Sinnbild für julia-trend: ein Radar mit einem markierten Fund" rahmen="82 47 136 136">
      <Radar x={50} y={50} z={0} r={52} h={10} dick={2.2} />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Grenze: was sie nie tut. Nach außen sendet sie nichts.
// ---------------------------------------------------------------------------

export function JuliaGrenze() {
  return (
    <Bild titel="julia-trend sendet nichts nach außen: Sie hebt die Hand, das Megafon steht jenseits der roten Linie, ihre Ausschnitte bleiben bei ihr" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Das Megafon: in den Raum hinaus spricht sie nicht */}
        <rect x="262" y="170" width="9" height="27" rx="2" fill={GRUND} />
        <path d="M271 176 C277 176 278 184 272 186" />
        <rect x="244" y="157" width="12" height="13" rx="2.5" fill={GRUND} />
        <path d="M256 158 L289 145 V183 L256 169 Z" fill={GRUND} />
        <ellipse cx="289" cy="164" rx="5" ry="19" fill={GRUND} />
        {/* Ihre Ausschnitte bleiben auf ihrer Seite */}
        <path d="M150 197 L160 186 L212 186 L208 197 Z" fill={GRUND} />
        <path d="M166 190 H204 M162 194 H198" strokeWidth="1.1" opacity="0.5" />
        <path d={RUMPF} fill={GRUND} />
        <Rollkragen />
        <JuliaKopf id="k-gr-julia" />
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

export function JuliaAvatar() {
  return (
    <Rund titel="julia-trend, Researcherin" id="k-av-julia">
      <path d={RUMPF} fill={GRUND} />
      <Rollkragen />
      <JuliaKopf id="k-av-julia-kopf" />
    </Rund>
  )
}
