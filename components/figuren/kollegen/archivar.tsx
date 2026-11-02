import { Bild, FLAECHE, flaecheY, GRUND, iso, Kopf, LEISE, LINIE, punkte, Quader, RAND, ROT, RUMPF, Rund, STRICH, Strich, TINTE, ZT } from './basis'

/** Der Archivar in den fünf Grafikarten.
 *  Graues, zurückgekämmtes Haar, dunkle Weste über weißem Hemd mit Krawatte.
 *  Er hält das Gedächtnis der Ablage: Was eine Sitzung erarbeitet hat, kommt
 *  als Eintrag dazu. Rot trägt den neuen Eintrag, die Karte, die er einstellt. */

// ---------------------------------------------------------------------------
// Figur: Gesicht und Weste, gemeinsam für Linie, Grenze und Kopf
// ---------------------------------------------------------------------------

function ArchivarGesicht({ id }: { id: string }) {
  return (
    <g>
      <Kopf
        id={id}
        flaechen={
          <g>
            {/* Haar: grau, kurz, zurückgekämmt, die Stirn frei */}
            <path d="M168 60 C152 58 138 63 130 72 C125 78 122 84 120 92 L118 102 C114 110 114 120 120 131 L60 131 L60 20 L182 20 Z" fill={RAND} />
            <g strokeWidth="1.1" opacity="0.6">
              <path d="M156 54 C136 50 114 56 102 72" />
              <path d="M160 61 C140 59 120 66 108 80" />
              <path d="M140 68 C128 70 118 78 112 88" />
            </g>
          </g>
        }
      />
      {/* Braue, Auge, Mund: ruhig */}
      <path d="M143 80 C148 78 154 78 159 80" strokeWidth="2" />
      <ellipse cx="152" cy="91.5" rx="2.3" ry="2.7" fill={TINTE} stroke="none" />
      <path d="M159 116 C161 117 164 117 166 115" />
    </g>
  )
}

function Weste() {
  return (
    <g>
      <path d={RUMPF} fill={TINTE} />
      {/* Hemd und Krawatte im Ausschnitt der Weste */}
      <path d="M126 146 L141 178 L156 142 Z" fill={GRUND} />
      <path d="M139 152 L144 152 L146 169 L141.5 175 L137 169 Z" fill={TINTE} stroke="none" />
      <path d="M126 146 L132 158 L141 151 Z M156 142 L151 157 L142 151 Z" fill={GRUND} />
      <circle cx="141" cy="186" r="1.7" fill={GRUND} stroke="none" />
      <circle cx="141" cy="194" r="1.7" fill={GRUND} stroke="none" />
      <path d="M128 131 L126 146 M154 127 L156 142" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Linie: bei der Arbeit
// ---------------------------------------------------------------------------

/** Karteikarten im Kasten, von hinten nach vorn; f ist die Tiefe (1 hinten, 0 vorn). */
const KARTEN = [
  { f: 0.85, reiter: 40 },
  { f: 0.62, reiter: 8 },
  { f: 0.2, reiter: 26 },
  { f: 0.02, reiter: 44 },
]

function Karte({ f, oben, reiter, fill = GRUND }: { f: number; oben: number; reiter?: number; fill?: string }) {
  const x0 = 225 + 10 * f
  const x1 = 281 + 10 * f
  const unten = 186
  const d =
    reiter === undefined
      ? `M${x0} ${unten} V${oben} H${x1} V${unten} Z`
      : `M${x0} ${unten} V${oben} H${x0 + reiter} V${oben - 4} H${x0 + reiter + 10} V${oben} H${x1} V${unten} Z`
  return <path d={d} fill={fill} />
}

export function ArchivarLinie() {
  return (
    <Bild titel="Der Archivar, als Strichzeichnung: stellt eine neue Karte in den Karteikasten" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        {/* Tisch */}
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Karteikasten: das Gedächtnis der Ablage */}
        <path d="M222 172 L232 164 H294 L284 172 Z" fill={RAND} />
        {KARTEN.slice(0, 2).map((k) => (
          <Karte key={k.f} f={k.f} oben={158 - 8 * k.f} reiter={k.reiter} />
        ))}
        {/* Die neue Karte: der Eintrag aus der Sitzung */}
        <Karte f={0.42} oben={124} fill={ROT} />
        <path d="M237 132 H264 M237 138 H258" stroke={GRUND} strokeWidth="1.5" />
        {KARTEN.slice(2).map((k) => (
          <Karte key={k.f} f={k.f} oben={158 - 8 * k.f} reiter={k.reiter} />
        ))}
        <path d="M222 172 H284 V198 H222 Z" fill={GRUND} />
        <path d="M284 172 L294 164 V190 L284 198 Z" fill={FLAECHE} />
        <rect x="246" y="178" width="14" height="7" rx="1" strokeWidth="1.3" />
        <path d="M249 189 C249 193 257 193 257 189" strokeWidth="1.4" />
        {/* Oberkörper */}
        <Weste />
        <ArchivarGesicht id="k-li-archivar" />
        {/* Die Hand hält die Karte an der Kante, der Daumen liegt vorn */}
        <path d="M214 140 C213 132 218 126 226 125 L231 125 C234 125 235 128 233 130 L231 131 L233 134 C235 136 234 139 231 140 L230 141 C232 143 231 146 228 147 L222 148 C218 148 215 145 214 140 Z" fill={GRUND} />
        <path d="M224 133 C228 129 233 127 238 127 C242 127 243 131 240 132.5 C236 134.5 232 136 228 138" fill={GRUND} />
        <path d="M218 136 C221 135 224 136 226 138 M219 142 C222 141 225 142 227 144" strokeWidth="1.1" opacity="0.6" />
        <path d="M176 158 C188 148 200 140 212 132 L224 146 C212 154 202 164 194 178 C188 176 182 168 176 158 Z" fill={GRUND} />
      </g>
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Isometrisch: der Arbeitsplatz
// ---------------------------------------------------------------------------

/** Eine Fläche in der senkrechten Ebene x = konstant (die rechte Vorderseite) */
function flaecheX(x: number, y1: number, y2: number, z1: number, z2: number) {
  return punkte([x, y1, z1], [x, y2, z1], [x, y2, z2], [x, y1, z2])
}

/** Ein offener Karteikasten; die Karten stehen quer zur Länge, eine ist rot und
 *  steht höher: der neue Eintrag. */
function Karteikasten({ x, y, z, b, t, h, n, rot, dick = 1 }: {
  x: number; y: number; z: number; b: number; t: number; h: number; n: number; rot: number; dick?: number
}) {
  const strich = { ...STRICH, strokeWidth: 1.6 * dick }
  const reiter = [t - 14, t / 2 - 4, 4]
  const ym = y + t / 2
  return (
    <g>
      {/* Innen: Boden und die beiden hinteren Wände */}
      <polygon {...strich} fill={RAND} points={punkte([x, y, z], [x + b, y, z], [x + b, y + t, z], [x, y + t, z])} />
      <polygon {...strich} fill={RAND} points={flaecheY(y, x, x + b, z, z + h)} />
      <polygon {...strich} fill={FLAECHE} points={flaecheX(x, y, y + t, z, z + h)} />
      {/* Karten, von hinten nach vorn */}
      {Array.from({ length: n }, (_, i) => {
        const xc = x + 4 + (i * (b - 8)) / (n - 1)
        const neu = i === rot
        const zo = z + h + (neu ? 20 : 7)
        const yr = y + reiter[i % 3]
        const y1 = y + 2
        const y2 = y + t - 2
        return (
          <g key={i}>
            <polygon
              {...strich}
              strokeWidth={1.2 * dick}
              fill={neu ? ROT : GRUND}
              points={
                neu
                  ? punkte([xc, y1, z + 1], [xc, y2, z + 1], [xc, y2, zo], [xc, y1, zo])
                  : punkte([xc, y1, z + 1], [xc, y2, z + 1], [xc, y2, zo], [xc, yr + 10, zo], [xc, yr + 10, zo + 3], [xc, yr, zo + 3], [xc, yr, zo], [xc, y1, zo])
              }
            />
            {neu ? (
              <g stroke={GRUND} strokeWidth={1.4 * dick} strokeLinecap="round">
                <Strich von={[xc, y + 6]} bis={[xc, y + t - 8]} z={zo - 5} />
                <Strich von={[xc, y + 6]} bis={[xc, y + t - 14]} z={zo - 10} />
              </g>
            ) : null}
          </g>
        )
      })}
      {/* Vorn: die beiden Außenwände, auf der Stirnseite Schild und Griff */}
      <polygon {...strich} fill={FLAECHE} points={flaecheY(y + t, x, x + b, z, z + h)} />
      <polygon {...strich} fill={RAND} points={flaecheX(x + b, y, y + t, z, z + h)} />
      <polygon {...strich} strokeWidth={1.1 * dick} fill={GRUND} points={flaecheX(x + b, ym - 7, ym + 7, z + h - 9, z + h - 4)} />
      <polyline
        fill="none"
        stroke={TINTE}
        strokeWidth={1.6 * dick}
        strokeLinecap="round"
        points={Array.from({ length: 9 }, (_, i) => {
          const w = (Math.PI * i) / 8
          return iso(x + b, ym + 4 * Math.cos(w), z + h - 12 - 3 * Math.sin(w)).join(',')
        }).join(' ')}
      />
    </g>
  )
}

export function ArchivarIso() {
  // Archivschachteln: zwei übereinander, auf der Stirnseite Schild und Griffloch
  const schachteln = [ZT, ZT + 20]
  return (
    <Bild titel="Der Arbeitsplatz des Archivars: ein Karteikasten mit einer neuen roten Karte, das Logbuch, Archivschachteln, das Tagesprotokoll mit Stift">
      <Quader x={0} y={0} z={0} b={168} t={118} h={ZT} />
      {/* Archivschachteln */}
      {schachteln.map((z) => (
        <g key={z}>
          <Quader x={110} y={8} z={z} b={34} t={40} h={20} />
          <polygon {...STRICH} strokeWidth={1.1} fill={GRUND} points={flaecheX(144, 14, 30, z + 9, z + 15)} />
          <polygon
            fill={TINTE}
            points={Array.from({ length: 17 }, (_, i) => {
              const w = (Math.PI * 2 * i) / 16
              return iso(144, 40 + 3.5 * Math.cos(w), z + 11 + 2.2 * Math.sin(w)).join(',')
            }).join(' ')}
          />
        </g>
      ))}
      {/* Der Karteikasten */}
      <Karteikasten x={16} y={30} z={ZT} b={60} t={36} h={18} n={7} rot={4} />
      {/* Tagesprotokoll und Stift */}
      <Quader x={18} y={78} z={ZT} b={40} t={32} h={1.2} />
      <g stroke={LEISE} strokeWidth="1.3" strokeLinecap="round">
        {[84, 90, 96, 102].map((y) => (
          <Strich key={y} von={[24, y]} bis={[y === 102 ? 40 : 52, y]} z={ZT + 1.2} />
        ))}
      </g>
      <g stroke={TINTE} strokeWidth="3.6" strokeLinecap="round">
        <Strich von={[66, 80]} bis={[70, 108]} z={ZT + 2} />
      </g>
      {/* Das Logbuch: Entscheidungen im Wortlaut */}
      <Quader x={96} y={62} z={ZT} b={40} t={46} h={7} oben={TINTE} links={GRUND} rechts={GRUND} />
      <g stroke={LEISE} strokeWidth="0.9">
        {[2.3, 4.6].map((dz) => (
          <g key={dz}>
            <Strich von={[98, 108]} bis={[135, 108]} z={ZT + dz} />
            <Strich von={[136, 64]} bis={[136, 107]} z={ZT + dz} />
          </g>
        ))}
      </g>
      <polygon fill={GRUND} points={punkte([106, 74, ZT + 7], [126, 74, ZT + 7], [126, 86, ZT + 7], [106, 86, ZT + 7])} />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Sinnbild
// ---------------------------------------------------------------------------

export function ArchivarSinnbild() {
  return (
    <Bild titel="Sinnbild für den Archivar: ein Karteikasten, eine neue rote Karte steht heraus" rahmen="83 24 136 136">
      <Karteikasten x={20} y={30} z={0} b={64} t={40} h={26} n={6} rot={3} dick={1.6} />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Grenze: was er nie tut. Bestehenden Text schreibt er nicht um.
// ---------------------------------------------------------------------------

export function ArchivarGrenze() {
  return (
    <Bild
      titel="Der Archivar schreibt nichts um: Er hebt die Hand, das aufgeschlagene Buch mit dem Stift liegt jenseits der roten Linie, sein Vorschlag bleibt bei ihm"
      rahmen="48 30 256 192"
      papier
    >
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Der bestehende Text: ein aufgeschlagenes Buch, darauf ein Stift mit Radierer */}
        <path d="M240 197 L248 172 C256 169 264 169 270 173 L269 197 C260 193 249 193 240 197 Z" fill={GRUND} />
        <path d="M269 197 L270 173 C276 169 284 169 292 172 L300 197 C291 193 279 193 269 197 Z" fill={GRUND} />
        <path d="M252 177 H266 M250 182 H266 M248 187 H266 M246 192 H265 M273 177 H288 M273 182 H290 M273 187 H292 M272 192 H294" strokeWidth="1.1" opacity="0.5" />
        <g transform="translate(252 194) rotate(-30)">
          <path d="M0 0 L9 -3.5 V3.5 Z" fill={GRUND} />
          <path d="M0 0 L3.5 -1.4 V1.4 Z" fill={TINTE} stroke="none" />
          <path d="M9 -3.5 H38 V3.5 H9 Z" fill={GRUND} />
          <path d="M9 0 H38" strokeWidth="1" opacity="0.5" />
          <path d="M38 -3.5 H43 V3.5 H38 Z" fill={TINTE} />
          <path d="M43 -3.5 H46 C49 -3.5 49 3.5 46 3.5 H43 Z" fill={FLAECHE} />
        </g>
        {/* Sein Vorschlag bleibt auf seiner Seite */}
        <path d="M198 197 L203 189 L230 189 L227 197 Z" fill={GRUND} />
        <path d="M206 192 H226 M203 195 H221" strokeWidth="1.1" opacity="0.5" />
        <Weste />
        <ArchivarGesicht id="k-gr-archivar" />
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

export function ArchivarAvatar() {
  return (
    <Rund titel="Der Archivar" id="k-av-archivar">
      <Weste />
      <ArchivarGesicht id="k-av-archivar-kopf" />
    </Rund>
  )
}
