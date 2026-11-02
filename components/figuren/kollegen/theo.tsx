import { Bild, FLAECHE, flaecheY, GRUND, iso, Kopf, LEISE, LINIE, punkte, Quader, RAND, ROT, RUMPF, Rund, STRICH, Strich, TINTE, ZT } from './basis'

/** Theo, Tester, in den fünf Grafikarten.
 *  Er führt Tests aus und hakt ab, was er geprüft hat; was nicht besteht,
 *  meldet er. Rot trägt diesen Befund: das Kreuz auf dem Prüfprotokoll.
 *  Er selbst: dunkles Haar mit Stirnfransen, Kapuzenpullover mit Kordeln.
 *  Sein Prüfcontainer ist ein gerippter Container auf dem Tisch. */

type P = [number, number]

// ---------------------------------------------------------------------------
// Figur
// ---------------------------------------------------------------------------

/** Oberkörper im Kapuzenpullover: die Kapuze liegt hinter dem Nacken,
 *  vorn hängen zwei Kordeln. */
function TheoPulli() {
  return (
    <g>
      <path d="M96 170 C92 150 101 129 118 124.5 C123 123.5 127 126 128 131 L126 146 Z" fill={GRUND} />
      <path d="M106 150 C108 140 114 133 121 130 C124.5 129 126.8 130.5 127.6 133.5 L126.6 141 C118 141 110 145 106 150 Z" fill={FLAECHE} strokeWidth="1.1" />
      <path d={RUMPF} fill={GRUND} />
      <path d="M128 131 L126 146 M154 127 L156 142" />
      <path d="M121 148.5 C127 157 152 156 161 143" />
      <path d="M136.5 153.6 L135.5 172 M148 153.2 L149.2 171.5" strokeWidth="1.3" />
      <path d="M135.5 171 L135.3 176.5 M149.2 170.5 L149.4 176" strokeWidth="3.2" />
    </g>
  )
}

/** Stirnfransen, dunkel; der Blick freundlich und wach. */
function TheoGesicht({ id }: { id: string }) {
  return (
    <g>
      <Kopf
        id={id}
        flaechen={
          <path
            d="M182 80 L171 79 L166.5 82.5 C164 80 161.5 79.5 158.5 81.5 C156 78.8 152.5 78.3 149.5 80.5 C146.5 78 141.5 77.5 137.5 79.5 C133 76.5 128 74.5 123.5 76 C119 78.5 116.5 82.5 115 87 C106 86 100 96 104 106 C106 114 110 122 118 130 L60 130 L60 20 L182 20 Z"
            fill={TINTE}
          />
        }
      />
      <path d="M171 79 C176.5 65 167 50 150 48 C136 46.5 122 54.8 113 59.3 L120 70 C136 64 158 68 171 79 Z" fill={TINTE} stroke="none" />
      <path d="M147 87.5 C150.5 86 155 86 159 88" strokeWidth="2" />
      <ellipse cx="152.5" cy="95" rx="2.3" ry="2.8" fill={TINTE} stroke="none" />
      <path d="M158.5 114.5 C161.5 117 164.5 117 167 114" />
    </g>
  )
}

/** Haken für eine bestandene Zeile */
const haken = (x: number, y: number) => `M${x + 0.6} ${y} L${x + 2.8} ${y + 2.6} L${x + 7.4} ${y - 4}`

// ---------------------------------------------------------------------------
// Linie
// ---------------------------------------------------------------------------

export function TheoLinie() {
  const zeilen = [122, 133, 144, 155]
  return (
    <Bild
      titel="Theo, als Strichzeichnung: hält das Prüfprotokoll, drei Zeilen abgehakt, eine rot angekreuzt; neben ihm der Prüfcontainer"
      rahmen="48 30 256 192"
      papier
    >
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Der Prüfcontainer: fest, gerippt, darin laufen die Tests */}
        <path d="M244 172 L254 164 H298 L288 172 Z" fill={GRUND} />
        <path d="M288 172 L298 164 V190 L288 198 Z" fill={GRUND} />
        <rect x="244" y="172" width="44" height="26" fill={GRUND} />
        <path d={[249, 253, 257, 261, 265, 269, 273, 277, 281, 285].map((x) => `M${x - 1.5} 175 V195`).join(' ')} strokeWidth="1" opacity="0.5" />
        <path d="M291 171 V194.5 M294.5 168.2 V191.7" strokeWidth="1.5" />
        <TheoPulli />
        <TheoGesicht id="k-li-theo" />
        {/* Unterarm aufgestützt, die Hand hält das Klemmbrett */}
        <path d="M187.9 191.9 L196.9 165.9 L209.1 170.1 L200.1 196.1 C198 199 189 198.5 187.9 191.9 Z" fill={GRUND} />
        <path d="M194.9 171.6 L207.1 175.8" strokeWidth="1.1" opacity="0.6" />
        <path d="M197 166 C195 160 199 156 205 157 L210 159 L210 171 C205 174 199 172 197 166 Z" fill={GRUND} />
        <g transform="rotate(-8 220 136)">
          <rect x="198" y="104" width="44" height="62" rx="3" fill={GRUND} />
          <rect x="202.5" y="112" width="35" height="50" rx="1" strokeWidth="1.1" />
          <rect x="211" y="99" width="18" height="10" rx="2" fill={GRUND} />
          <circle cx="220" cy="102.5" r="1.6" />
          {zeilen.map((y) => (
            <g key={y}>
              <rect x="205" y={y - 3.5} width="7" height="7" strokeWidth="1.1" />
              <path d={`M216 ${y} H234`} strokeWidth="1.2" opacity="0.5" />
            </g>
          ))}
          <path d={[0, 1, 3].map((i) => haken(205, zeilen[i])).join(' ')} strokeWidth="1.7" />
        </g>
        <path d="M202 161.5 C204 158 209.5 158 211 161 C212 163.5 209 165.5 205 165 Z" fill={GRUND} />
      </g>
      {/* Der Befund: was nicht bestanden hat, meldet er */}
      <g transform="rotate(-8 220 136)" stroke={ROT} strokeWidth="2.4" strokeLinecap="round">
        <path d="M205 140.5 L212 147.5 M212 140.5 L205 147.5" />
      </g>
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Isometrisch
// ---------------------------------------------------------------------------

export function TheoIso() {
  const c = { x: 10, y: 8, b: 66, t: 30, h: 30 }
  const cv = c.y + c.t
  const cr = c.x + c.b
  const k = { x: 100, y: 10, b: 28, t: 40, h: 12 }
  const karten = [16, 22, 28, 34, 40, 46]
  const zk = ZT + 1.6
  const zeilen = [68, 79, 90, 101]
  const linie = (a: [number, number, number], b: [number, number, number]) => {
    const [x1, y1] = iso(...a)
    const [x2, y2] = iso(...b)
    return `M${x1} ${y1} L${x2} ${y2}`
  }
  const [s1x, s1y] = iso(106, 64, ZT + 1.5)
  const [s2x, s2y] = iso(114, 102, ZT + 1.5)
  return (
    <Bild titel="Der Arbeitsplatz von Theo: der Prüfcontainer, ein Kasten mit Testfällen, jeder mit seinem Reiter, und das Prüfprotokoll mit einer rot angekreuzten Zeile">
      <Quader x={0} y={0} z={0} b={168} t={118} h={ZT} />
      {/* Prüfcontainer: gerippte Wand, Türen an der Stirnseite */}
      <Quader x={c.x} y={c.y} z={ZT} b={c.b} t={c.t} h={c.h} />
      <path
        d={Array.from({ length: 15 }, (_, i) => c.x + 5 + i * 4).map((x) => linie([x, cv, ZT + 3], [x, cv, ZT + c.h - 3])).join(' ')}
        stroke={TINTE}
        strokeWidth="0.9"
        opacity="0.5"
      />
      <path d={linie([cr, c.y + c.t / 2, ZT + 1], [cr, c.y + c.t / 2, ZT + c.h - 1])} stroke={TINTE} strokeWidth="1.3" />
      <path
        d={[c.y + 6, c.y + 11, c.y + 19, c.y + 24].map((y) => linie([cr, y, ZT + 4], [cr, y, ZT + c.h - 4])).join(' ')}
        stroke={TINTE}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Kasten mit Testfällen: jeder Testfall trägt den Reiter seiner Anforderung */}
      <polygon {...STRICH} fill={RAND} points={punkte([k.x, k.y, ZT + k.h], [k.x + k.b, k.y, ZT + k.h], [k.x + k.b, k.y + k.t, ZT + k.h], [k.x, k.y + k.t, ZT + k.h])} />
      {karten.map((y, i) => {
        const r = k.x + 3 + (i % 3) * 7
        return (
          <polygon
            key={y}
            {...STRICH}
            strokeWidth={1.1}
            fill={GRUND}
            points={punkte(
              [k.x + 2, y, ZT + 6], [k.x + k.b - 2, y, ZT + 6], [k.x + k.b - 2, y, ZT + 18],
              [r + 7, y, ZT + 18], [r + 7, y, ZT + 21], [r, y, ZT + 21], [r, y, ZT + 18], [k.x + 2, y, ZT + 18],
            )}
          />
        )
      })}
      <polygon {...STRICH} fill={FLAECHE} points={punkte([k.x, k.y + k.t, ZT], [k.x + k.b, k.y + k.t, ZT], [k.x + k.b, k.y + k.t, ZT + k.h], [k.x, k.y + k.t, ZT + k.h])} />
      <polygon {...STRICH} fill={RAND} points={punkte([k.x + k.b, k.y, ZT], [k.x + k.b, k.y + k.t, ZT], [k.x + k.b, k.y + k.t, ZT + k.h], [k.x + k.b, k.y, ZT + k.h])} />
      {/* Das Prüfprotokoll auf dem Klemmbrett */}
      <Quader x={42} y={54} z={ZT} b={54} t={58} h={1.6} oben={RAND} />
      <polygon {...STRICH} strokeWidth={1.1} fill={GRUND} points={punkte([45, 59, zk], [93, 59, zk], [93, 108, zk], [45, 108, zk])} />
      <Quader x={60} y={51} z={zk} b={18} t={8} h={3} />
      <g stroke={LEISE} strokeWidth="1.4" strokeLinecap="round">
        {zeilen.map((y) => (
          <Strich key={y} von={[62, y]} bis={[88, y]} z={zk} />
        ))}
      </g>
      <g fill="none" stroke={TINTE} strokeWidth="1.1" strokeLinejoin="round">
        {zeilen.map((y) => (
          <polygon key={y} points={punkte([50, y - 3.5, zk], [57, y - 3.5, zk], [57, y + 3.5, zk], [50, y + 3.5, zk])} />
        ))}
      </g>
      <g fill="none" stroke={TINTE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {[0, 1, 3].map((i) => (
          <polyline key={i} points={punkte([50.5, zeilen[i] + 0.5, zk], [53, zeilen[i] + 3, zk], [58.5, zeilen[i] - 4, zk])} />
        ))}
      </g>
      <g stroke={ROT} strokeWidth="2.2" strokeLinecap="round">
        <path d={linie([50, zeilen[2] - 3.5, zk], [57, zeilen[2] + 3.5, zk]) + ' ' + linie([57, zeilen[2] - 3.5, zk], [50, zeilen[2] + 3.5, zk])} />
      </g>
      {/* Ein Stift */}
      <path d={`M${s1x} ${s1y} L${s2x} ${s2y}`} stroke={TINTE} strokeWidth="3.2" strokeLinecap="round" />
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Sinnbild
// ---------------------------------------------------------------------------

export function TheoSinnbild() {
  const Y = 50
  const zeilen = [52, 40, 28, 16]
  const p = (x: number, z: number): P => iso(x, Y + 0.2, z)
  const zug = (...q: P[]) => q.map((r) => r.join(',')).join(' ')
  return (
    <Bild titel="Sinnbild für Theo: ein Klemmbrett mit Prüfprotokoll, drei Zeilen abgehakt, eine rot angekreuzt" rahmen="84 22 112 112">
      <Quader x={10} y={Y - 3} z={0} b={56} t={3} h={70} links={RAND} />
      <polygon {...STRICH} strokeWidth={1.3} fill={GRUND} points={flaecheY(Y + 0.1, 14, 62, 4, 62)} />
      <Quader x={29} y={Y - 4.5} z={63} b={18} t={6} h={9} />
      <g stroke={LEISE} strokeWidth="2.6" strokeLinecap="round">
        {zeilen.map((z) => {
          const [a, b] = p(29, z)
          const [c, d] = p(57, z)
          return <line key={z} x1={a} y1={b} x2={c} y2={d} />
        })}
      </g>
      <g fill="none" stroke={TINTE} strokeWidth="1.6" strokeLinejoin="round">
        {zeilen.map((z) => (
          <polygon key={z} points={zug(p(17, z - 3.5), p(24, z - 3.5), p(24, z + 3.5), p(17, z + 3.5))} />
        ))}
      </g>
      <g fill="none" stroke={TINTE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {[0, 1, 3].map((i) => (
          <polyline key={i} points={zug(p(17.5, zeilen[i] + 0.5), p(20, zeilen[i] - 2.8), p(25.5, zeilen[i] + 5))} />
        ))}
      </g>
      <g stroke={ROT} strokeWidth="2.8" strokeLinecap="round">
        {(() => {
          const z = zeilen[2]
          const [a, b] = p(17, z + 3.5)
          const [c, d] = p(24, z - 3.5)
          const [e, f] = p(17, z - 3.5)
          const [g, h] = p(24, z + 3.5)
          return <path d={`M${a} ${b} L${c} ${d} M${e} ${f} L${g} ${h}`} />
        })()}
      </g>
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Grenze: Er testet und berichtet; den Produktcode repariert er nicht.
// ---------------------------------------------------------------------------

/** Zahnrad in der Bildebene */
function zahnrad(cx: number, cy: number, ra: number, ri: number, n: number) {
  const p: string[] = []
  for (let i = 0; i < n; i++) {
    const w = (Math.PI * 2 * i) / n - Math.PI / 2
    const s = Math.PI / n
    const pkt = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`
    p.push(pkt(ri, w - s * 0.62), pkt(ra, w - s * 0.36), pkt(ra, w + s * 0.36), pkt(ri, w + s * 0.62))
  }
  return `M${p.join(' L')} Z`
}

export function TheoGrenze() {
  return (
    <Bild titel="Theo repariert nichts: Er hebt die Hand, Zahnrad und Schraubenschlüssel liegen jenseits der roten Linie" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Das Werk und der Schlüssel dazu: Er schraubt nicht daran */}
        <path d={zahnrad(262, 177, 21, 15.5, 9)} fill={GRUND} />
        <circle cx="262" cy="177" r="7" fill={GRUND} />
        <circle cx="262" cy="177" r="2.6" fill={TINTE} />
        <g transform="translate(296 196) rotate(-115)">
          <path d="M-1 -3 H40 L42 -6.5 C46 -9.5 52 -9 55 -4.5 L49 -2.6 V2.6 L55 4.5 C52 9 46 9.5 42 6.5 L40 3 H-1 C-4 3 -4 -3 -1 -3 Z" fill={GRUND} />
        </g>
        {/* Sein Protokoll bleibt auf seiner Seite */}
        <path d="M150 197 L160 186 L212 186 L208 197 Z" fill={GRUND} />
        <path d="M176 186 L177.5 182.5 H191.5 L193 186" fill={GRUND} />
        <path d="M168 190 H204 M164 194 H198" strokeWidth="1.1" opacity="0.5" />
        <TheoPulli />
        <TheoGesicht id="k-gr-theo" />
        {/* Die Hand: offen, ruhig, deutlich */}
        <path d="M180 158 C190 156 198 158 204 162 L210 176 C200 180 190 182 184 180 Z" fill={GRUND} />
        <path d="M197 158.5 L203 178.5" strokeWidth="1.1" opacity="0.55" />
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

export function TheoAvatar() {
  return (
    <Rund titel="Theo, Tester" id="k-av-theo">
      <TheoPulli />
      <TheoGesicht id="k-av-theo-kopf" />
    </Rund>
  )
}
