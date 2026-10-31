import { Bild, bogen, FLAECHE, GRUND, iso, KOPF, Kopf, LEISE, LINIE, liste, punkte, Quader, ROT, RUMPF, Rund, STRICH, Strich, TINTE, Zylinder } from './basis'

/** Fritz, Reviewer, in den fünf Grafikarten. Er liest genau, markiert die
 *  Fundstelle und ändert nichts; Rot trägt die Fundstelle. Brille,
 *  Seitenscheitel, Hemd mit Knöpfen. Seine Figuren sind die Vorlage für alle. */

// Bei der Arbeit ------------------------------------------------------------

export function FritzLinie() {
  return (
    <Bild titel="Fritz, als Strichzeichnung: liest mit der Lupe und markiert eine Fundstelle" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g fill="none" stroke={TINTE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Tisch */}
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Oberkörper */}
        <path d="M126 146 C102 150 86 170 84 198 H196 C196 186 194 178 192 172 C188 158 176 146 156 142 Z" fill={GRUND} />
        <path d="M126 146 L140 158 L156 142" />
        <path d="M140 164 V196" strokeDasharray="0.1 9" strokeWidth="2.8" />
        <path d="M128 131 L126 146 M154 127 L156 142" />
        {/* Kopf, leicht nach vorn geneigt, der Blick auf das Blatt */}
        <clipPath id="k-li-fritz-kopf">
          <path d={KOPF} />
        </clipPath>
        <path d={KOPF} fill={GRUND} stroke="none" />
        {/* Haar: kurz, dunkel, ordentlich gescheitelt */}
        <path
          clipPath="url(#k-li-fritz-kopf)"
          d="M182 76 C162 62 140 62 126 70 C118 76 114 82 112 88 C104 86 100 96 104 106 C106 114 110 122 118 130 L60 130 L60 20 L182 20 Z"
          fill={TINTE}
          stroke="none"
        />
        <path d="M128 50 C134 56 138 62 140 64" stroke={GRUND} strokeWidth="1.6" clipPath="url(#k-li-fritz-kopf)" />
        <path d={KOPF} />
        <path d="M114 92 C108 86 102 94 106 101 C108 105 113 105 115 102" fill={GRUND} />
        {/* Brille, Braue, Auge, Mund: konzentriert, nicht verschlafen */}
        <ellipse cx="150" cy="90" rx="10" ry="9" fill={GRUND} />
        <path d="M160 88 C161 87 163 87 164 88" />
        <path d="M164 84 C168 84 171 87 170 92" />
        <path d="M140 88 L114 93" />
        <path d="M143 76 C148 74 154 75 158 78" strokeWidth="2" />
        <path d="M145 90 C148 88.5 152 88.5 155 90" strokeWidth="1.3" />
        <ellipse cx="151" cy="92.5" rx="2.3" ry="2.6" fill={TINTE} stroke="none" />
        <path d="M161 115 L166 114" />
        {/* Das Blatt, flach auf dem Tisch */}
        <path d="M200 197 L212 180 L292 180 L286 197 Z" fill={GRUND} />
        <path d="M218 185 H282 M213 191 H276" strokeWidth="1.1" opacity="0.5" />
        {/* Unterarm auf dem Tisch, die Hand hält die Lupe */}
        <path d="M186 197 C186 192 190 188 198 188 H212 V197" fill={GRUND} />
        <path d="M222 186 L234 172" strokeWidth="4" />
        <path d="M210 188 C214 182 224 182 227 187 C230 192 226 197 219 197 H210 Z" fill={GRUND} />
        <path d="M214 189 C217 188 220 189 222 191" strokeWidth="1.2" />
        <circle cx="244" cy="160" r="16" fill={GRUND} />
        <circle cx="244" cy="160" r="12.5" strokeWidth="0.9" opacity="0.45" />
      </g>
      {/* Die Fundstelle: unter der Lupe vergrößert, auf dem Blatt klein */}
      <g fill="none" stroke={ROT} strokeLinecap="round">
        <path d="M235 154 h-3 v12 h3 M253 154 h3 v12 h-3" strokeWidth="2" />
        <path d="M237 160 H251" strokeWidth="2.6" />
        <path d="M246 183 h-2 v5 h2 M262 183 h2 v5 h-2" strokeWidth="1.4" />
      </g>
    </Bild>
  )
}
// Arbeitsplatz --------------------------------------------------------------

export function FritzIso() {
  const zt = 12
  const zb = zt + 1.5
  // Leuchte: Fuß, Gelenk, Kopf
  const [fx, fy] = iso(140, 8, zt + 3)
  const [gx, gy] = iso(140, 8, zt + 60)
  const [kx, ky] = iso(118, 30, zt + 70)
  return (
    <Bild titel="Der Arbeitsplatz von Fritz: ein Stapel Unterlagen mit Lesezeichen, ein Blatt mit markierter Fundstelle, die Lupe, eine Tasse">
      {/* Tischplatte */}
      <Quader x={0} y={0} z={0} b={168} t={118} h={zt} />
      {/* Stapel Unterlagen, rote Lesezeichen an den Fundstellen */}
      <Quader x={14} y={12} z={zt} b={44} t={58} h={26} />
      <g stroke={TINTE} strokeWidth="0.9" opacity="0.45">
        {[6, 11, 16, 21].map((h) => (
          <Strich key={h} von={[14, 70]} bis={[58, 70]} z={zt + h} />
        ))}
      </g>
      <polygon fill={ROT} {...STRICH} strokeWidth={1.1} points={punkte([40, 70, zt + 21], [48, 70, zt + 21], [48, 70, zt + 9], [40, 70, zt + 9])} />
      <polygon fill={ROT} {...STRICH} strokeWidth={1.1} points={punkte([40, 70, zt + 21], [48, 70, zt + 21], [48, 62, zt + 26], [40, 62, zt + 26])} />
      {/* Eine Tasse; Prüfen dauert */}
      <Zylinder x={28} y={96} z={zt} r={8} h={15} />
      <polygon fill={TINTE} opacity="0.75" points={liste(bogen(28, 96, zt + 13, 6.4))} />
      <path
        d={(() => {
          const [ax, ay] = iso(28 + 8 * Math.cos(1.2), 96 + 8 * Math.sin(1.2), zt + 11)
          const [bx, by] = iso(28 + 8 * Math.cos(1.2), 96 + 8 * Math.sin(1.2), zt + 4)
          return `M${ax} ${ay} C${ax - 8} ${ay + 1} ${bx - 8} ${by - 1} ${bx} ${by}`
        })()}
        fill="none"
        stroke={TINTE}
        strokeWidth="2.4"
      />
      {/* Das offene Blatt */}
      <Quader x={76} y={30} z={zt} b={62} t={78} h={1.5} />
      <g stroke={LEISE} strokeWidth="1.6" strokeLinecap="round">
        {[42, 52, 74, 84, 94].map((y) => (
          <Strich key={y} von={[84, y]} bis={[128, y]} z={zb} />
        ))}
      </g>
      {/* Die Fundstelle: markiert, nicht verändert */}
      <polygon fill={ROT} opacity="0.2" points={punkte([80, 58, zb], [134, 58, zb], [134, 68, zb], [80, 68, zb])} />
      <g stroke={ROT} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Strich von={[86, 63]} bis={[126, 63]} z={zb} />
        <polyline points={punkte([86, 58, zb], [80, 58, zb], [80, 68, zb], [86, 68, zb])} />
        <polyline points={punkte([128, 58, zb], [134, 58, zb], [134, 68, zb], [128, 68, zb])} />
      </g>
      {/* Die Lupe liegt daneben */}
      <polygon fill={GRUND} fillOpacity="0.6" stroke={TINTE} strokeWidth="4.5" points={liste(bogen(152, 76, zt + 2, 12))} />
      <g stroke={TINTE} strokeWidth="6" strokeLinecap="round">
        <Strich von={[161, 85]} bis={[174, 100]} z={zt + 2} />
      </g>
      {/* Leuchte, auf das Blatt gerichtet */}
      <Zylinder x={140} y={8} z={zt} r={11} h={3} seite={FLAECHE} />
      <path d={`M${fx} ${fy} L${gx} ${gy} L${kx} ${ky}`} fill="none" stroke={TINTE} strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx={gx} cy={gy} r="3.2" fill={TINTE} />
      <path d={`M${kx + 4} ${ky - 4} L${kx - 18} ${ky + 10} L${kx + 4} ${ky + 18} Z`} fill={TINTE} stroke={TINTE} strokeWidth="1.6" strokeLinejoin="round" />
      {/* Der Bericht: was geprüft wurde und was nicht */}
      <Quader x={86} y={-4} z={zt} b={38} t={28} h={1.2} />
      <g stroke={LEISE} strokeWidth="1.4" strokeLinecap="round">
        <Strich von={[96, 4]} bis={[118, 4]} z={zt + 1.2} />
        <Strich von={[96, 11]} bis={[114, 11]} z={zt + 1.2} />
        <Strich von={[96, 18]} bis={[116, 18]} z={zt + 1.2} />
      </g>
      <g fill={ROT}>
        {[4, 11].map((y) => {
          const [px, py] = iso(92, y, zt + 1.2)
          return <circle key={y} cx={px} cy={py} r="1.8" />
        })}
      </g>
    </Bild>
  )
}

/** Haar, Brille und Gesicht von Fritz; der Blick geht nach vorn. */
function FritzGesicht({ id }: { id: string }) {
  return (
    <g>
      <Kopf
        id={id}
        flaechen={
          <path
            d="M182 76 C162 62 140 62 126 70 C118 76 114 82 112 88 C104 86 100 96 104 106 C106 114 110 122 118 130 L60 130 L60 20 L182 20 Z"
            fill={TINTE}
          />
        }
      />
      <path d="M128 50 C134 56 138 62 140 64" stroke={GRUND} strokeWidth="1.6" />
      <ellipse cx="150" cy="90" rx="10" ry="9" fill={GRUND} />
      <path d="M160 88 C161 87 163 87 164 88" />
      <path d="M164 84 C168 84 171 87 170 92" />
      <path d="M140 88 L114 93" />
      <path d="M143 77 C148 75 154 75 158 77" strokeWidth="2" />
      <ellipse cx="152" cy="89.5" rx="2.3" ry="2.7" fill={TINTE} stroke="none" />
      <path d="M160 115 C162 116 164 116 166 114" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Kopf: rund, für Chat, Listen und Steckbrief; muss bei 40 Pixeln lesbar sein
// ---------------------------------------------------------------------------



export function FritzAvatar() {
  return (
    <Rund titel="Fritz, Reviewer" id="k-av-fritz">
      <path d={RUMPF} fill={GRUND} />
      <path d="M126 146 L140 158 L156 142" />
      <path d="M128 131 L126 146 M154 127 L156 142" />
      <FritzGesicht id="k-av-fritz-kopf" />
    </Rund>
  )
}

// ---------------------------------------------------------------------------
// Sinnbild: der eine Gegenstand, der für die Rolle steht, isometrisch
// ---------------------------------------------------------------------------

export function FritzSinnbild() {
  const z = 1.5
  const lupe = { x: 50, y: 58, z: 16, r: 17 }
  return (
    <Bild titel="Sinnbild für Fritz: eine Lupe über einer markierten Fundstelle" rahmen="74 46 136 136">
      <Quader x={20} y={20} z={0} b={60} t={78} h={z} />
      <g stroke={LEISE} strokeWidth="1.6" strokeLinecap="round">
        {[32, 42, 70, 80, 90].map((y) => (
          <Strich key={y} von={[28, y]} bis={[72, y]} z={z} />
        ))}
      </g>
      <polygon fill={ROT} opacity="0.2" points={punkte([24, 51, z], [76, 51, z], [76, 61, z], [24, 61, z])} />
      <g stroke={ROT} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Strich von={[30, 56]} bis={[70, 56]} z={z} />
        <polyline points={punkte([30, 51, z], [24, 51, z], [24, 61, z], [30, 61, z])} />
        <polyline points={punkte([70, 51, z], [76, 51, z], [76, 61, z], [70, 61, z])} />
      </g>
      {/* Schatten der Lupe auf dem Blatt, dann die Lupe selbst */}
      <polygon fill={TINTE} opacity="0.08" points={liste(bogen(lupe.x + 3, lupe.y + 3, z, lupe.r))} />
      <polygon fill={GRUND} fillOpacity="0.35" stroke={TINTE} strokeWidth="5" points={liste(bogen(lupe.x, lupe.y, lupe.z, lupe.r))} />
      <g stroke={TINTE} strokeWidth="7" strokeLinecap="round">
        <Strich von={[lupe.x, lupe.y + lupe.r + 2]} bis={[lupe.x, lupe.y + lupe.r + 30]} z={lupe.z - 2} />
      </g>
    </Bild>
  )
}

// ---------------------------------------------------------------------------
// Grenze: was er nie tut. Rot gestrichelt ist die Linie, die er nicht überschreitet.
// ---------------------------------------------------------------------------

export function FritzGrenze() {
  return (
    <Bild titel="Fritz gibt nichts frei: Er hebt die Hand, der Stempel liegt jenseits der roten Linie" rahmen="48 30 256 192" papier>
      <circle cx="140" cy="112" r="68" fill={FLAECHE} />
      <g {...LINIE}>
        <path d="M52 198 H300" />
        <path d="M70 198 V220 M280 198 V220" strokeWidth="1.3" opacity="0.5" />
        {/* Der Stempel für die Freigabe: liegt da, er nimmt ihn nicht */}
        <rect x="250" y="186" width="36" height="12" rx="2" fill={GRUND} />
        <path d="M258 186 V174 H278 V186" fill={GRUND} />
        <path d="M266 174 V164 M270 174 V164" />
        <circle cx="268" cy="158" r="7" fill={GRUND} />
        {/* Die geprüfte Unterlage bleibt auf seiner Seite */}
        <path d="M150 197 L160 186 L212 186 L208 197 Z" fill={GRUND} />
        <path d="M166 190 H204 M162 194 H198" strokeWidth="1.1" opacity="0.5" />
        <path d={RUMPF} fill={GRUND} />
        <path d="M126 146 L140 158 L156 142" />
        <path d="M140 164 V196" strokeDasharray="0.1 9" strokeWidth="2.8" />
        <path d="M128 131 L126 146 M154 127 L156 142" />
        <FritzGesicht id="k-gr-fritz-kopf" />
        {/* Die Hand: offen, freundlich, deutlich */}
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
