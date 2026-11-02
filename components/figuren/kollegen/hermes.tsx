import { Bild, FLAECHE, flaecheY, GRUND, iso, Kopf, LEISE, LINIE, liste, punkte, Quader, RAND, ROT, RUMPF, Rund, STRICH, Strich, TINTE, ZT, Zylinder } from './basis'

/** Hermes, Orchestrator, in den fünf Grafikarten. Er nimmt Aufträge an und
 *  gibt sie unverändert weiter; Rot trägt den Auftrag. Botenmütze mit Band und
 *  Schirm, Jacke mit Revers, Namensschild. Ohne Flügel an der Mütze: Der würde
 *  als Federschmuck gelesen. */

// Bei der Arbeit ------------------------------------------------------------

export function HermesLinie() {
  return (
    <Bild titel="Hermes, als Strichzeichnung: reicht am Tresen einen Auftrag weiter, hinter ihm die Fächer" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        {/* Fächer an der Wand: die Tabelle sagt, in welches */}
        <rect x="214" y="40" width="84" height="60" fill={GRUND} />
        <path d="M242 40 V100 M270 40 V100 M214 70 H298" />
        <rect x="219" y="56" width="18" height="11" rx="1" fill={GRUND} strokeWidth="1.2" />
        <rect x="247" y="86" width="18" height="11" rx="1" fill={GRUND} strokeWidth="1.2" />
        {/* Tresen */}
        <path d="M52 198 H300 M52 204 H300" />
        <path d="M120 204 V222 M200 204 V222 M280 204 V222" strokeWidth="1.2" opacity="0.4" />
        {/* Oberkörper mit Jacke und Namensschild */}
        <path d={RUMPF} fill={GRUND} />
        <path d="M126 146 L134 172 L140 160 L148 172 L156 142" />
        <path d="M128 146 L140 160 L154 142" strokeWidth="1.2" />
        <rect x="100" y="170" width="17" height="9" rx="1.5" strokeWidth="1.3" />
        <path d="M128 131 L126 146 M154 127 L156 142" />
        <Kopf
          id="k-li-hermes"
          flaechen={<path d="M60 86 L110 84 C108 92 110 98 112 102 C104 100 100 106 102 114 C104 120 110 126 118 130 L60 130 Z" fill={TINTE} />}
        />
        {/* Botenmütze: rund, mit Band und Schirm. Ohne Flügel, der würde als
            Federschmuck gelesen. */}
        <path d="M100 85 C96 56 118 40 144 42 C164 44 175 58 174 76 Z" fill={TINTE} />
        <path d="M101 79 L173 70" stroke={GRUND} strokeWidth="1.6" />
        <circle cx="140" cy="43" r="2.4" fill={GRUND} />
        <path d="M168 76 C179 75 189 77 192 82 C185 86 175 86 165 83 Z" fill={TINTE} />
        {/* Gesicht: offen, freundlich */}
        <path d="M144 80 C149 78 154 78 158 81" strokeWidth="2" />
        <ellipse cx="151" cy="92" rx="2.3" ry="2.8" fill={TINTE} stroke="none" />
        <path d="M155 113 C158 117 162 117 166 113" />
        {/* Der Arm reicht den Auftrag nach vorn */}
        <g transform="rotate(-10 263 139)">
          <rect x="240" y="124" width="46" height="30" rx="2" fill={GRUND} />
          <path d="M242 127 L263 142 L284 127" />
          <circle cx="263" cy="142" r="4.5" fill={ROT} stroke="none" />
        </g>
        <path d="M178 156 C196 150 212 146 228 144 L230 162 C218 166 206 172 192 178 Z" fill={GRUND} />
        <path d="M230 146 C238 142 246 144 247 150 C247 157 240 162 231 162 Z" fill={GRUND} />
        <path d="M234 152 C238 151 241 152 243 154" strokeWidth="1.1" />
      </g>
      {/* Der Weg ins zuständige Fach */}
      <g fill="none" stroke={ROT} strokeLinecap="round" strokeLinejoin="round">
        <rect x="275" y="52" width="18" height="12" rx="1" fill={ROT} stroke="none" />
        <path d="M274 116 C282 104 286 90 284 74" strokeWidth="1.8" strokeDasharray="4 4" />
        <path d="M279 79 L284 72 L289 79" strokeWidth="1.8" />
      </g>
    </Bild>
  )
}
// Arbeitsplatz --------------------------------------------------------------

export function HermesIso() {
  // Fächer: ein Regal hinten links, die Öffnungen auf der Vorderseite
  const regal = { x: 10, y: 4, b: 72, t: 24, h: 54 }
  const vorn = regal.y + regal.t
  const spalten = [0, 1, 2].map((i) => regal.x + 4 + i * 22)
  const reihen = [ZT + 4, ZT + 29]
  const [kx, ky] = iso(30, 100, ZT + 3)
  const [ax, ay] = iso(136, 78, ZT + 12)
  const [zx, zy] = iso(regal.x + 4 + 44 + 9, vorn, ZT + 29 + 10)
  return (
    <Bild titel="Der Arbeitsplatz von Hermes: Fächer, ein Eingangskorb mit Aufträgen, die Tabelle, eine Klingel">
      <Quader x={0} y={0} z={0} b={168} t={118} h={ZT} />
      {/* Fächerregal */}
      <Quader {...regal} z={ZT} />
      {spalten.flatMap((x) =>
        reihen.map((z) => <polygon key={`${x}-${z}`} {...STRICH} strokeWidth={1.2} fill={RAND} points={flaecheY(vorn, x, x + 18, z, z + 21)} />),
      )}
      {/* Im Fach oben rechts: der Auftrag, der gerade zugewiesen wurde */}
      <polygon {...STRICH} strokeWidth={1.2} fill={ROT} points={flaecheY(vorn + 1, spalten[2] + 3, spalten[2] + 15, ZT + 31, ZT + 40)} />
      <polygon {...STRICH} strokeWidth={1.1} fill={GRUND} points={flaecheY(vorn + 1, spalten[0] + 3, spalten[0] + 15, ZT + 6, ZT + 13)} />
      {/* Die Zuordnungstabelle */}
      <Quader x={62} y={42} z={ZT} b={40} t={46} h={1.2} />
      <g stroke={LEISE} strokeWidth="1.2">
        {[54, 66, 78].map((y) => (
          <Strich key={y} von={[62, y]} bis={[102, y]} z={ZT + 1.2} />
        ))}
        <Strich von={[78, 42]} bis={[78, 88]} z={ZT + 1.2} />
      </g>
      <g fill={ROT}>
        {(() => {
          const [px, py] = iso(70, 60, ZT + 1.2)
          return <circle cx={px} cy={py} r="2" />
        })()}
      </g>
      {/* Eingangskorb mit Aufträgen */}
      <Quader x={118} y={62} z={ZT} b={42} t={32} h={8} />
      {[0, 1, 2].map((i) => (
        <Quader key={i} x={122 + i * 2} y={66 - i * 2} z={ZT + 8 + i * 1.4} b={32} t={24} h={1.2} />
      ))}
      <polyline fill="none" {...STRICH} strokeWidth={1.2} points={punkte([126, 62, ZT + 12.4], [142, 74, ZT + 12.4], [158, 62, ZT + 12.4])} />
      {(() => {
        const [sx, sy] = iso(142, 74, ZT + 12.4)
        return <circle cx={sx} cy={sy} r="2.6" fill={ROT} />
      })()}
      {/* Der Weg vom Korb ins Fach */}
      <path
        d={`M${ax} ${ay - 8} C${ax} ${ay - 50} ${zx + 34} ${zy + 24} ${zx + 5} ${zy + 3}`}
        fill="none"
        stroke={ROT}
        strokeWidth="1.8"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      {/* Tischklingel: wer etwas will, meldet sich */}
      <Zylinder x={30} y={100} z={ZT} r={9} h={3} seite={FLAECHE} />
      <path d={`M${kx - 8} ${ky} A8 7.5 0 0 1 ${kx + 8} ${ky} Z`} fill={GRUND} {...STRICH} />
      <circle cx={kx} cy={ky - 9} r="2.2" fill={TINTE} />
    </Bild>
  )
}

/** Haar, Botenmütze und Gesicht wie in HermesLinie, damit es dieselbe Person ist. */
function HermesGesicht({ id }: { id: string }) {
  return (
    <g>
      <Kopf
        id={id}
        flaechen={<path d="M60 86 L110 84 C108 92 110 98 112 102 C104 100 100 106 102 114 C104 120 110 126 118 130 L60 130 Z" fill={TINTE} />}
      />
      <path d="M100 85 C96 56 118 40 144 42 C164 44 175 58 174 76 Z" fill={TINTE} />
      <path d="M101 79 L173 70" stroke={GRUND} strokeWidth="1.6" />
      <circle cx="140" cy="43" r="2.4" fill={GRUND} />
      <path d="M168 76 C179 75 189 77 192 82 C185 86 175 86 165 83 Z" fill={TINTE} />
      <path d="M144 80 C149 78 154 78 158 81" strokeWidth="2" />
      <ellipse cx="151" cy="92" rx="2.3" ry="2.8" fill={TINTE} stroke="none" />
      <path d="M155 113 C158 117 162 117 166 113" />
    </g>
  )
}

/** Jacke mit Revers; das Namensschild nur, wo der Rahmen es zeigt. */
function HermesJacke({ schild = true }: { schild?: boolean }) {
  return (
    <g>
      <path d={RUMPF} fill={GRUND} />
      <path d="M126 146 L134 172 L140 160 L148 172 L156 142" />
      <path d="M128 146 L140 160 L154 142" strokeWidth="1.2" />
      {schild ? <rect x="100" y="170" width="17" height="9" rx="1.5" strokeWidth="1.3" /> : null}
      <path d="M128 131 L126 146 M154 127 L156 142" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Kopf
// ---------------------------------------------------------------------------

export function HermesAvatar() {
  return (
    <Rund titel="Hermes, Orchestrator" id="k-av-hermes">
      <HermesJacke schild={false} />
      <HermesGesicht id="k-av-hermes-gesicht" />
    </Rund>
  )
}

// ---------------------------------------------------------------------------
// Sinnbild: der verschlossene Umschlag, unterwegs
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

/** Ein Kreis in der senkrechten Ebene y = konstant */
function kreisY(x: number, y: number, z: number, r: number, n = 32) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const w = (Math.PI * 2 * i) / n
    return iso(x + r * Math.cos(w), y, z + r * Math.sin(w))
  })
}

export function HermesSinnbild() {
  const u = { x: 10, y: 56, z: 8, b: 84, t: 5, h: 56 }
  const v = u.y + u.t
  const m = u.x + u.b / 2
  const zo = u.z + u.h
  const spitze = zo - 28
  return (
    <Bild titel="Sinnbild für Hermes: ein verschlossener Umschlag mit rotem Siegel, unterwegs" rahmen="81 31 128 128">
      {/* Schatten auf dem Boden: der Umschlag schwebt, er ist unterwegs */}
      <polygon fill={TINTE} opacity="0.1" points={punkte([u.x + 2, u.y - 3, 0], [u.x + u.b + 2, u.y - 3, 0], [u.x + u.b + 2, u.y + u.t + 5, 0], [u.x + 2, u.y + u.t + 5, 0])} />
      <Platte {...u} />
      {/* Die Klappe, geschlossen */}
      <polygon fill={GRUND} stroke={TINTE} strokeWidth="2.4" strokeLinejoin="round" points={punkte([u.x, v, zo], [m, v, spitze], [u.x + u.b, v, zo])} />
      {/* Das Siegel: der Auftrag geht so weiter, wie er kam */}
      <polygon fill={ROT} points={liste(kreisY(m, v, spitze, 8))} />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Grenze: er schreibt nichts um. Der Stift liegt jenseits der roten Linie.
// ---------------------------------------------------------------------------

export function HermesGrenze() {
  return (
    <Bild titel="Hermes schreibt nichts um: Er hebt die Hand, der Stift bleibt jenseits der roten Linie, der Umschlag bleibt zu" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        {/* Tresen */}
        <path d="M52 198 H300 M52 204 H300" />
        <path d="M120 204 V222 M200 204 V222 M280 204 V222" strokeWidth="1.2" opacity="0.4" />
        {/* Jenseits: ein Blatt und der Stift, der umschreiben würde. Er nimmt ihn nicht. */}
        <path d="M240 197 L248 185 L298 185 L294 197 Z" fill={GRUND} />
        <path d="M256 189 H292 M268 193 H288" strokeWidth="1.1" opacity="0.5" />
        <path d="M249 193 C251 190 253 194 255 192 C257 190 259 193 262 191" strokeWidth="1.2" />
        <g transform="translate(262 191) rotate(-55)">
          <path d="M52 -4 H54.5 C57 -4 58.5 -2.2 58.5 0 C58.5 2.2 57 4 54.5 4 H52 Z" fill={TINTE} />
          <path d="M46 -4 H52 V4 H46 Z" fill={GRUND} />
          <path d="M49 -4 V4" strokeWidth="1.1" />
          <path d="M11 -4 H46 V4 H11 Z" fill={GRUND} />
          <path d="M12 1.3 H45" strokeWidth="0.9" opacity="0.5" />
          <path d="M11 -4 L0 0 L11 4 Z" fill={GRUND} />
          <path d="M4 -1.45 L0 0 L4 1.45 Z" fill={TINTE} />
        </g>
        {/* Der Umschlag bleibt auf seiner Seite und bleibt zu */}
        <path d="M188 197 L196 187 L230 187 L226 197 Z" fill={GRUND} />
        <path d="M196 187 L212 193 L230 187" strokeWidth="1.2" />
        <HermesJacke />
        <HermesGesicht id="k-gr-hermes" />
        {/* Die Hand: offen, freundlich, deutlich */}
        <path d="M180 158 C190 156 198 158 204 162 L210 176 C200 180 190 182 184 180 Z" fill={GRUND} />
        <path d="M199 160 L205 177" strokeWidth="1.2" />
        <path
          d="M204 170 L202 142 C202 136 209 135 210 140 L210 132 C210 126 218 126 218 132 L219 136 C219 131 226 131 226 137 L225 160 C224 168 218 172 210 172 Z"
          fill={GRUND}
        />
        <path d="M204 156 C198 152 194 156 196 160 L203 166" fill={GRUND} />
        <path d="M210 140 V152 M218 136 V152" strokeWidth="1.1" opacity="0.6" />
      </g>
      <path d="M234 112 V212" stroke={ROT} strokeWidth="2.2" strokeDasharray="5 5" strokeLinecap="round" />
    </Bild>
  )
}
