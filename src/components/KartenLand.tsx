// Die Karte oberhalb der Startinsel: Meer, Inseln, Sandweg und Bäume werden im Stil des Inselbilds
// per SVG gezeichnet – beliebig lang, ohne das Bild zu wiederholen.

import { LAND_W, landLayout } from './kartenLandLayout'

type Pt = { x: number; y: number }

/** Kleiner Zufallsgenerator mit festem Startwert: die Karte sieht bei jedem Öffnen gleich aus. */
function rng(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Glatte Kurve durch alle Punkte (Catmull-Rom als Bézier). */
function smooth(p: Pt[]) {
  let d = `M${p[0].x},${p[0].y}`
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)]
    d += ` C${b.x + (c.x - a.x) / 6},${b.y + (c.y - a.y) / 6} ${c.x - (e.x - b.x) / 6},${c.y - (e.y - b.y) / 6} ${c.x},${c.y}`
  }
  return d
}

type Deco = { kind: 'baum' | 'tanne' | 'busch' | 'stein' | 'blume'; x: number; y: number; s: number }
type Blob = { x: number; y: number; rx: number; ry: number }

function scene(n: number) {
  const { height, stops } = landLayout(n)
  const r = rng(7)
  // Weg beginnt unten aus den Wolken und endet oben im Meer
  const way = [{ x: 700, y: height + 40 }, ...stops, { x: stops.at(-1)!.x * 0.6 + 190, y: 30 }]
  const blobs: Blob[] = []
  const decos: Deco[] = []
  for (let i = 0; i < way.length - 1; i++) {
    const a = way[i], b = way[i + 1]
    for (let k = 0; k < 3; k++) {
      const t = (k + r()) / 3
      const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t
      const side = r() < 0.5 ? -1 : 1
      blobs.push({ x: x + side * (60 + r() * 110), y: y + (r() - 0.5) * 60, rx: 120 + r() * 90, ry: 85 + r() * 50 })
      for (let j = 0; j < 3; j++) {
        const off = (r() < 0.5 ? -1 : 1) * (90 + r() * 120)
        const kinds: Deco['kind'][] = ['baum', 'baum', 'tanne', 'tanne', 'busch', 'stein', 'blume', 'blume']
        decos.push({ kind: kinds[Math.floor(r() * kinds.length)], x: x + off, y: y + (r() - 0.5) * 70, s: 1.1 + r() * 0.6 })
      }
    }
  }
  // nur auf dem Bild, nicht auf dem Weg
  const near = (d: Deco) => stops.some((p) => Math.hypot(p.x - d.x, p.y - d.y) < 80)
  const visible = decos.filter((d) => d.x > 30 && d.x < LAND_W - 30 && !near(d)).sort((a, b) => a.y - b.y)
  return { height, way: smooth(way), blobs, decos: visible }
}

function Baum({ x, y, s }: Deco) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="30" ry="9" fill="#2F6E2A" opacity=".35" />
      <rect x="-6" y="-26" width="12" height="30" rx="4" fill="#8A5A2B" />
      <circle cx="-17" cy="-40" r="22" fill="url(#lk-blatt)" />
      <circle cx="17" cy="-40" r="22" fill="url(#lk-blatt)" />
      <circle cx="0" cy="-58" r="26" fill="url(#lk-blatt)" />
      <circle cx="-8" cy="-66" r="9" fill="#9BE06A" opacity=".7" />
    </g>
  )
}

function Tanne({ x, y, s }: Deco) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="22" ry="7" fill="#2F6E2A" opacity=".35" />
      <rect x="-4" y="-12" width="8" height="15" rx="2" fill="#7A4E25" />
      <path d="M0,-78 L24,-36 L14,-36 L30,-10 L-30,-10 L-14,-36 L-24,-36 Z" fill="url(#lk-tanne)" stroke="#1D6B3A" strokeWidth="2" strokeLinejoin="round" />
      <path d="M0,-70 L-10,-48" stroke="#7FD38F" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </g>
  )
}

function Busch({ x, y, s }: Deco) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="26" ry="7" fill="#2F6E2A" opacity=".3" />
      <circle cx="-12" cy="-8" r="13" fill="url(#lk-blatt)" />
      <circle cx="12" cy="-8" r="13" fill="url(#lk-blatt)" />
      <circle cx="0" cy="-16" r="15" fill="url(#lk-blatt)" />
      <circle cx="-4" cy="-20" r="3" fill="#FF6B8B" />
      <circle cx="9" cy="-12" r="3" fill="#FFFFFF" />
    </g>
  )
}

function Stein({ x, y, s }: Deco) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-22,2 C-24,-14 -8,-24 4,-22 C18,-20 26,-8 22,2 Z" fill="#9AA3B2" stroke="#6E7788" strokeWidth="2" />
      <path d="M-10,-14 C-4,-19 4,-19 8,-17" stroke="#D6DBE4" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>
  )
}

function Blume({ x, y, s }: Deco) {
  const c = x % 2 > 1 ? '#FFFFFF' : '#FFD84D'
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 5} cy={Math.sin((a * Math.PI) / 180) * 5 - 6} r="4.5" fill={c} />)}
      <circle cx="0" cy="-6" r="3.5" fill="#F29A1D" />
    </g>
  )
}

/** Eine Landschicht: Weg-Band plus Inselflecken, optional vergrößert und nach unten versetzt. */
function Lage({ d, blobs, grow, dy, fill, opacity = 1 }: { d: string; blobs: Blob[]; grow: number; dy: number; fill: string; opacity?: number }) {
  return (
    <g transform={`translate(0 ${dy})`} opacity={opacity}>
      <path d={d} stroke={fill} strokeWidth={320 + grow * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {blobs.map((b, i) => <ellipse key={i} cx={b.x} cy={b.y} rx={Math.max(10, b.rx + grow)} ry={Math.max(10, b.ry + grow)} fill={fill} />)}
    </g>
  )
}

const DECO = { baum: Baum, tanne: Tanne, busch: Busch, stein: Stein, blume: Blume }

export function KartenLand({ n }: { n: number }) {
  const { height, way, blobs, decos } = scene(n)
  return (
    <svg className="land-svg" viewBox={`0 0 ${LAND_W} ${height}`} preserveAspectRatio="none" overflow="visible" aria-hidden="true">
      <defs>
        <linearGradient id="lk-meer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E9BE6" />
          <stop offset="1" stopColor="#35B6F0" />
        </linearGradient>
        <radialGradient id="lk-blatt" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#7DD35A" />
          <stop offset="1" stopColor="#2F8F3A" />
        </radialGradient>
        <linearGradient id="lk-tanne" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3FAE5E" />
          <stop offset="1" stopColor="#1E7A43" />
        </linearGradient>
        <pattern id="lk-wellen" width="120" height="80" patternUnits="userSpaceOnUse">
          <path d="M10,20 q12,-8 24,0 M70,60 q12,-8 24,0" stroke="#FFFFFF" strokeOpacity=".35" strokeWidth="4" strokeLinecap="round" fill="none" />
        </pattern>
      </defs>
      <rect width={LAND_W} height={height} fill="url(#lk-meer)" />
      <rect width={LAND_W} height={height} fill="url(#lk-wellen)" />

      {/* Inseln: Brandung, Felskante (zwei Töne), Wiese (dunkler Rand, helle Mitte) */}
      <Lage d={way} blobs={blobs} grow={30} dy={8} fill="#D9F3FF" opacity={0.55} />
      <Lage d={way} blobs={blobs} grow={0} dy={46} fill="#6B6255" />
      <Lage d={way} blobs={blobs} grow={0} dy={30} fill="#9C907C" />
      <Lage d={way} blobs={blobs} grow={0} dy={0} fill="#4FA83A" />
      <Lage d={way} blobs={blobs} grow={-34} dy={-6} fill="#73C64C" />
      <g opacity=".5">
        {blobs.map((b, i) => <ellipse key={i} cx={b.x - b.rx * 0.2} cy={b.y - b.ry * 0.3} rx={b.rx * 0.55} ry={b.ry * 0.4} fill="#93DA66" />)}
      </g>

      {/* Sandweg mit Mittellinie */}
      <path d={way} stroke="#D7B36A" strokeWidth="98" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={way} stroke="#F3DCA2" strokeWidth="84" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={way} stroke="#FFFFFF" strokeOpacity=".85" strokeWidth="5" strokeDasharray="22 22" strokeLinecap="round" fill="none" />

      {decos.map((d, i) => {
        const C = DECO[d.kind]
        return <C key={i} {...d} />
      })}

      {/* Wolkenband als Übergang zur Startinsel */}
      <g filter="drop-shadow(0 8px 6px rgba(30,90,160,.25))">
        {Array.from({ length: 14 }, (_, i) => {
          const x = i * 72 + (i % 2) * 14
          const r = 40 + ((i * 37) % 28)
          return <circle key={i} cx={x} cy={height + 14 + ((i * 29) % 22)} r={r} fill="#FFFFFF" />
        })}
        {Array.from({ length: 9 }, (_, i) => <circle key={`b${i}`} cx={20 + i * 112} cy={height - 18 + ((i * 17) % 20)} r={34 + ((i * 23) % 22)} fill="#FFFFFF" />)}
      </g>
    </svg>
  )
}
