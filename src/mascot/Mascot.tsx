import { memo, useId, useMemo, type CSSProperties, type ReactNode } from 'react'
import { anchor, pointsToPath, radiiToPoints } from './shapes'
import { INK_DARK, inkFor, luminance, mix, resolve, type Config, type Model } from './model'
import { ANIM_CSS, LOOP_SECONDS } from './anim'

export const VIEWBOX = '-160 -178 320 320'

// House style: flat fills only. Every colour on the mascot is the body colour,
// a tone mixed from it, the face ink, or the single accent — nothing else.
// Lines are one weight (LINE) with round caps.
const LINE = 5.5

// glyph eyes read badly when a lid slices through them
const NO_LIDS = new Set(['arc', 'cross', 'star', 'heart'])

/* ---------------------------------- eyes ---------------------------------- */

const STAR4 = 'M0 -17Q2.5 -2.5 17 0Q2.5 2.5 0 17Q-2.5 2.5 -17 0Q-2.5 -2.5 0 -17Z'
const HEART = 'M0 13C-20 0 -15 -15 -6 -14C-2 -14 0 -11 0 -9C0 -11 2 -14 6 -14C15 -15 20 0 0 13Z'

function eyeShape(style: string, ink: string, body: string): ReactNode {
  const inkIsLight = luminance(ink) > 0.6
  switch (style) {
    case 'pill':
      return <rect x={-7.5} y={-19} width={15} height={38} rx={7.5} fill={ink} />
    case 'dot':
      return <circle r={8.5} fill={ink} />
    case 'googly':
      return (
        <>
          <circle r={17} fill="#FFFFFF" />
          <circle className="m-pupil" cx={1.5} cy={1.5} r={8} fill={INK_DARK} />
        </>
      )
    case 'shine':
      return (
        <>
          <circle r={13} fill={ink} />
          <circle cx={-4.5} cy={-4.5} r={4} fill={inkIsLight ? body : '#FFFFFF'} />
        </>
      )
    case 'ring':
      return <circle r={10.5} fill="none" stroke={ink} strokeWidth={LINE} />
    case 'square':
      return <rect x={-10} y={-10} width={20} height={20} rx={3.5} fill={ink} />
    case 'arc':
      return <path d="M-12 5Q0 -14 12 5" fill="none" stroke={ink} strokeWidth={LINE} strokeLinecap="round" />
    case 'star':
      return <path d={STAR4} fill={ink} transform="scale(.9)" />
    case 'heart':
      return <path d={HEART} fill={ink} />
    case 'cross':
      return <path d="M-9 -9L9 9M9 -9L-9 9" stroke={ink} strokeWidth={LINE} strokeLinecap="round" />
    default: // oval
      return <ellipse rx={9} ry={13.5} fill={ink} />
  }
}

/* ---------------------------------- mouth --------------------------------- */

function mouthShape(style: string, curve: number, open: number, ink: string, tongue: string): ReactNode {
  const c = curve * 9
  const e = (-c * 0.3).toFixed(1)
  const line = <path d={`M-11 ${e}Q0 ${c.toFixed(1)} 11 ${e}`} fill="none" stroke={ink} strokeWidth={LINE} strokeLinecap="round" />
  switch (style) {
    case 'none':
      return null
    case 'open': {
      const o = 5 + Math.max(open, 0.35) * 14
      const d =
        curve < -0.2
          ? `M-11 ${o * 0.7}Q-11 ${-o * 0.3} 0 ${-o * 0.3}Q11 ${-o * 0.3} 11 ${o * 0.7}Q0 ${o * 0.45} -11 ${o * 0.7}Z`
          : `M-12 -3Q0 0 12 -3Q11 ${o} 0 ${o}Q-11 ${o} -12 -3Z`
      return <path d={d} fill={ink} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
    }
    case 'cat':
      return <path d="M-13 -3Q-12 6 -6 6Q-1 6 0 -1Q1 6 6 6Q12 6 13 -3" fill="none" stroke={ink} strokeWidth={LINE - 1} strokeLinecap="round" strokeLinejoin="round" />
    case 'o':
      return <ellipse cy={2} rx={5 + open * 2} ry={6 + open * 4} fill={ink} />
    case 'tongue':
      return (
        <>
          <path d="M-1 3Q-1 15 5.5 15Q12 15 11 2Z" fill={tongue} />
          {line}
        </>
      )
    case 'fang':
      return (
        <>
          {line}
          <path d={`M-8 ${(c * 0.45 + 1).toFixed(1)}L-5 ${(c * 0.45 + 9).toFixed(1)}L-2 ${(c * 0.75 + 1).toFixed(1)}Z`} fill="#FFFFFF" />
        </>
      )
    default:
      return line
  }
}

/* ------------------------------- accessories ------------------------------ */

interface Paint {
  fill: string
  body: string
  /** lighter tone of the body, for inner ears */
  tone: string
  accent: string
  /** set only for the outline finish; applied to every part so the line reads as one */
  stroke: string | undefined
  sw: number
}

function At({ p, deg, flip, children }: { p: [number, number]; deg: number; flip?: boolean; children: ReactNode }) {
  return (
    <g transform={`translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${deg})${flip ? ' scale(-1 1)' : ''}`}>{children}</g>
  )
}

function topBack(kind: string, at: (deg: number) => [number, number], paint: Paint): ReactNode {
  const edge = { stroke: paint.stroke, strokeWidth: paint.sw, strokeLinejoin: 'round' as const }
  const pair = (deg: number, node: ReactNode) => (
    <>
      <At p={at(-deg)} deg={-deg}>{node}</At>
      <At p={at(deg)} deg={deg} flip>{node}</At>
    </>
  )
  const stalk = paint.stroke ?? paint.body
  switch (kind) {
    case 'cat':
      return pair(
        36,
        <>
          <path d="M-24 16Q-20 -20 -4 -38Q1 -43 6 -36Q21 -14 24 16Z" fill={paint.fill} {...edge} />
          <path d="M-10 12Q-8 -10 -1 -22Q7 -8 9 12Z" fill={paint.tone} />
        </>,
      )
    case 'bear':
      return pair(
        40,
        <>
          <circle cy={-8} r={24} fill={paint.fill} {...edge} />
          <circle cy={-8} r={11} fill={paint.tone} />
        </>,
      )
    case 'bunny':
      return pair(
        15,
        <>
          <ellipse cy={-38} rx={14} ry={46} fill={paint.fill} {...edge} />
          <ellipse cy={-40} rx={5.5} ry={29} fill={paint.tone} />
        </>,
      )
    case 'horns':
      return pair(34, <path d="M-11 10Q-14 -16 7 -36Q9 -10 13 10Z" fill={paint.accent} {...edge} />)
    case 'antenna':
      return (
        <At p={at(0)} deg={0}>
          <path d="M0 8L0 -28" stroke={stalk} strokeWidth={LINE} strokeLinecap="round" />
          <circle cy={-35} r={9.5} fill={paint.accent} {...edge} />
        </At>
      )
    case 'twin':
      return pair(
        20,
        <>
          <path d="M0 8Q-2 -10 -5 -25" fill="none" stroke={stalk} strokeWidth={LINE} strokeLinecap="round" />
          <circle cx={-6} cy={-31} r={7.5} fill={paint.accent} {...edge} />
        </>,
      )
    case 'sprout':
      return (
        <At p={at(0)} deg={0}>
          <path d="M0 8Q-2 -8 0 -20" fill="none" stroke={paint.accent} strokeWidth={LINE} strokeLinecap="round" />
          <path d="M0 -20Q-18 -40 -30 -24Q-16 -9 0 -20Z" fill={paint.accent} {...edge} />
          <path d="M0 -20Q12 -47 34 -37Q26 -13 0 -20Z" fill={paint.accent} {...edge} />
        </At>
      )
    default:
      return null
  }
}

function topFront(kind: string, at: (deg: number) => [number, number], paint: Paint): ReactNode {
  const edge = { stroke: paint.stroke, strokeWidth: paint.sw, strokeLinejoin: 'round' as const }
  switch (kind) {
    case 'halo':
      return (
        <At p={at(0)} deg={0}>
          <ellipse cy={-24} rx={36} ry={10} fill="none" stroke={paint.accent} strokeWidth={6.5} />
        </At>
      )
    case 'crown':
      return (
        <At p={at(0)} deg={0}>
          <path d="M-30 8L-35 -22L-17 -8L0 -30L17 -8L35 -22L30 8Z" fill={paint.accent} stroke={paint.stroke ?? paint.accent} strokeWidth={paint.sw || 4} strokeLinejoin="round" />
        </At>
      )
    case 'party':
      return (
        <At p={at(20)} deg={20}>
          <path d="M-23 10L2 -50L25 10Z" fill={paint.accent} stroke={paint.stroke ?? paint.accent} strokeWidth={paint.sw || 4} strokeLinejoin="round" />
          <path d="M-12 -15L14 -17M-18 0L20 -3" stroke="#FFFFFF" strokeWidth={LINE} strokeLinecap="round" />
          <circle cx={2} cy={-54} r={7.5} fill="#FFFFFF" {...edge} />
        </At>
      )
    case 'bow':
      return (
        <At p={at(38)} deg={38}>
          <g transform="translate(0 8)">
            <path d="M0 0Q-29 -23 -30 0Q-29 23 0 0Z" fill={paint.accent} {...edge} />
            <path d="M0 0Q29 -23 30 0Q29 23 0 0Z" fill={paint.accent} {...edge} />
            <circle r={7} fill={mix(paint.accent, '#000000', 0.22)} />
          </g>
        </At>
      )
    default:
      return null
  }
}

function eyewear(kind: string, gap: number, size: number, ink: string): ReactNode {
  if (kind === 'none') return null
  const r = 20 * Math.max(size, 0.85)
  const x = gap
  if (kind === 'shades')
    return (
      <g>
        <path d={`M${-x + r} -5L${x - r} -5`} stroke={INK_DARK} strokeWidth={LINE} />
        {[-x, x].map((cx) => (
          <path
            key={cx}
            transform={`translate(${cx} 0)`}
            d={`M${-r} ${-r * 0.5}H${r}V${r * 0.1}Q${r} ${r * 0.8} 0 ${r * 0.8}Q${-r} ${r * 0.8} ${-r} ${r * 0.1}Z`}
            fill={INK_DARK}
            stroke={INK_DARK}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        ))}
      </g>
    )
  return (
    <g fill="none" stroke={ink} strokeWidth={LINE - 1}>
      <path d={`M${-x + r} 0Q0 -6 ${x - r} 0`} />
      {[-x, x].map((cx) =>
        kind === 'round' ? <circle key={cx} cx={cx} r={r} /> : <rect key={cx} x={cx - r} y={-r * 0.8} width={r * 2} height={r * 1.6} rx={6} />,
      )}
    </g>
  )
}

/* ----------------------------------- aura --------------------------------- */

const delay = (fr: number): CSSProperties => ({ ['--d' as string]: `calc(var(--L) * ${-fr})` })

const SPOTS: [number, number, number, number][] = [
  [-120, -92, 1, 0],
  [126, -66, 0.7, 0.3],
  [118, 64, 0.55, 0.6],
  [-132, 34, 0.6, 0.8],
  [62, -146, 0.5, 0.45],
]

function auraBack(kind: string, accent: string): ReactNode {
  if (kind === 'glow')
    // a flat sunburst rather than a blurry glow
    return (
      <g className="m-orbit" stroke={accent} strokeWidth={LINE} strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={i % 2 ? 'M0 -126L0 -136' : 'M0 -128L0 -150'} transform={`translate(0 -4) rotate(${i * 30})`} />
        ))}
      </g>
    )
  if (kind === 'orbit')
    return (
      <g transform="rotate(-18)">
        <path className="m-orbit" d="M-150 0A150 42 0 0 1 150 0" fill="none" stroke={accent} strokeWidth={LINE} strokeLinecap="round" />
      </g>
    )
  return null
}

function auraFront(kind: string, accent: string): ReactNode {
  switch (kind) {
    case 'sparkles':
      return SPOTS.map(([x, y, s, d], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path className="m-tw" style={delay(d)} d={STAR4} fill={accent} />
        </g>
      ))
    case 'bubbles':
      return SPOTS.map(([x, y, s, d], i) => (
        <g key={i} transform={`translate(${x} ${y + 20}) scale(${s})`}>
          <circle className="m-rise" style={delay(d)} r={12} fill="none" stroke={accent} strokeWidth={LINE / s ** 0.5} />
        </g>
      ))
    case 'hearts':
      return SPOTS.map(([x, y, s, d], i) => (
        <g key={i} transform={`translate(${x} ${y + 20}) scale(${s})`}>
          <path className="m-rise" style={delay(d)} d={HEART} fill={accent} />
        </g>
      ))
    case 'orbit':
      return (
        <g transform="rotate(-18)">
          <g className="m-orbit">
            <path d="M150 0A150 42 0 0 1 -150 0" fill="none" stroke={accent} strokeWidth={LINE} strokeLinecap="round" />
            <circle cx={106} cy={30} r={9} fill={accent} />
          </g>
        </g>
      )
    default:
      return null
  }
}

const ZED = 'M-7 -8H7L-7 8H7'

/* ---------------------------------- art ----------------------------------- */

interface ArtProps {
  cfg: Config
  m: Model
  uid: string
  /** thumbnails skip the costly bits */
  lite?: boolean
}

export function MascotArt({ cfg, m, uid, lite }: ArtProps) {
  const { v } = m
  const d = pointsToPath(radiiToPoints(m.r, v.w, v.h))
  const at = (deg: number) => anchor(m.r, v.w, v.h, deg)

  const body = cfg.color
  const ink = inkFor(cfg)
  const dark = luminance(body) < 0.08
  const outline = cfg.finish === 'outline'
  const shaded = cfg.finish === 'soft' || cfg.finish === 'glossy'
  const strokeCol = outline ? mix(body, '#000000', 0.68) : undefined
  const fill = cfg.fill === 'gradient' ? `url(#${uid}-fill)` : body
  const paint: Paint = {
    fill,
    body,
    tone: dark ? mix(body, '#FFFFFF', 0.22) : mix(body, '#FFFFFF', 0.42),
    accent: cfg.color2,
    stroke: strokeCol,
    sw: outline ? 6.5 : 0,
  }
  // blush and tongue are warm tones of the body, not a stock pink
  const warm = mix(body, '#FF4D6D', 0.6)
  const tongue = mix('#FF6F86', body, 0.12)

  const gap = 27 * v.eyeGap
  const faceT = `translate(${v.dx.toFixed(2)} ${(v.faceY + v.eyeY + v.dy).toFixed(2)}) scale(${v.faceS.toFixed(3)})`
  const blush = cfg.cheeks === 'blush' ? Math.max(0.9, v.blush) : v.blush
  const cheekX = gap + 19 * v.eyeSize
  const mouthY = 22 + 8 * v.eyeSize
  const topPivot: CSSProperties = { transformOrigin: `0px ${(at(0)[1] + 12).toFixed(1)}px` }

  const eye = (side: 'l' | 'r') => {
    const sgn = side === 'l' ? -1 : 1
    const sx = v[`${side}sx`]
    const sy = v[`${side}sy`]
    const top = v[`${side}top`]
    const ang = v[`${side}ang`] * -sgn
    const bot = v[`${side}bot`]
    const masked = (top > 0.01 || bot > 0.01) && !NO_LIDS.has(cfg.eyes)
    const id = `${uid}-e${side}`
    return (
      <g transform={`translate(${(sgn * gap).toFixed(2)} 0) scale(${v.eyeSize.toFixed(3)})`}>
        <g className="m-blink">
          {masked && (
            <mask id={id} maskUnits="userSpaceOnUse" x={-44} y={-44} width={88} height={88}>
              <rect x={-44} y={-44} width={88} height={88} fill="#fff" />
              <rect x={-60} y={-90} width={120} height={90} fill="#000" transform={`translate(0 ${(-22 + top * 44).toFixed(2)}) rotate(${ang.toFixed(2)})`} />
              <circle cy={(58 - bot * 44).toFixed(2)} r={36} fill="#000" />
            </mask>
          )}
          <g mask={masked ? `url(#${id})` : undefined}>
            <g transform={`scale(${sx.toFixed(3)} ${sy.toFixed(3)})`}>{eyeShape(cfg.eyes, ink, body)}</g>
          </g>
        </g>
        {v.brow > 0.02 && (
          <path
            d="M-11 0Q0 -4 11 0"
            fill="none"
            stroke={ink}
            strokeWidth={LINE - 1}
            strokeLinecap="round"
            opacity={v.brow}
            transform={`translate(0 ${(-27 * Math.max(sy, 1)).toFixed(1)}) rotate(${(v.browAng * -sgn).toFixed(1)})`}
          />
        )}
      </g>
    )
  }

  const cheek = (sgn: number) => (
    <g key={sgn} transform={`translate(${(sgn * cheekX).toFixed(1)} ${(13 * v.eyeSize).toFixed(1)})`}>
      {blush > 0.02 && cfg.cheeks !== 'freckles' && cfg.cheeks !== 'lines' && <ellipse rx={8.5} ry={5} fill={warm} opacity={Math.min(1, blush)} />}
      {cfg.cheeks === 'freckles' && (
        <g fill={ink} opacity={0.55}>
          <circle cx={-5.5} cy={0} r={1.7} />
          <circle cx={0} cy={-3.5} r={1.7} />
          <circle cx={5.5} cy={1} r={1.7} />
        </g>
      )}
      {cfg.cheeks === 'lines' && <path d="M-6 4L-3 -3M-0.5 4L2.5 -3M5 4L8 -3" stroke={warm} strokeWidth={2.4} strokeLinecap="round" />}
    </g>
  )

  const core = (
    <g className="m-squash">
      {/* die-cut border: the silhouette redrawn in white with a fat stroke — no filter, so it stays cheap to animate */}
      {cfg.sticker && !lite && (
        <g className="m-sticker">
          <g className="m-top" style={topPivot}>
            {topBack(cfg.top, at, paint)}
            {topFront(cfg.top, at, paint)}
          </g>
          <path d={d} />
        </g>
      )}
      <g className="m-top" style={topPivot}>{topBack(cfg.top, at, paint)}</g>
      <path className="m-body" d={d} fill={fill} stroke={strokeCol} strokeWidth={paint.sw} strokeLinejoin="round" />
      {cfg.pattern !== 'none' && <path d={d} fill={`url(#${uid}-pat)`} />}
      {/* cel shading: one hard-edged crescent, no blur */}
      {shaded && <path d={d} fill={dark ? '#FFFFFF' : '#000000'} opacity={dark ? 0.1 : 0.13} mask={`url(#${uid}-shade)`} />}
      {cfg.finish === 'glossy' && (
        <path
          d={d}
          pathLength={100}
          transform="scale(.8)"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={dark ? 0.35 : 0.6}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray="9 3.5 0.1 87.4"
          strokeDashoffset={-56}
        />
      )}
      <g clipPath={`url(#${uid}-clip)`}>
        <g className="m-look">
          <g className="m-face">
            <g transform={faceT}>
              {cheek(-1)}
              {cheek(1)}
              {eye('l')}
              {eye('r')}
              <g transform={`translate(0 ${mouthY.toFixed(1)}) scale(${v.mouthSize.toFixed(3)})`}>
                <g className="m-mouth">{mouthShape(cfg.mouth, v.curve, v.open, ink, tongue)}</g>
              </g>
            </g>
          </g>
        </g>
      </g>
      {cfg.eyewear !== 'none' && (
        <g className="m-look">
          <g className="m-face">
            <g transform={faceT}>{eyewear(cfg.eyewear, gap, v.eyeSize, ink)}</g>
          </g>
        </g>
      )}
      <g className="m-top" style={topPivot}>{topFront(cfg.top, at, paint)}</g>
    </g>
  )

  return (
    <>
      <defs>
        <clipPath id={`${uid}-clip`}>
          <path d={d} />
        </clipPath>
        {cfg.fill === 'gradient' && (
          <linearGradient id={`${uid}-fill`} gradientUnits="userSpaceOnUse" x1={0} y1={-105} x2={0} y2={105}>
            <stop offset="0" stopColor={cfg.color} />
            <stop offset="1" stopColor={cfg.color2} />
          </linearGradient>
        )}
        {shaded && (
          <mask id={`${uid}-shade`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={400} height={400}>
            <path d={d} fill="#fff" />
            <path d={d} fill="#000" transform="translate(-13 -15)" />
          </mask>
        )}
        {cfg.pattern === 'dots' && (
          <pattern id={`${uid}-pat`} width={26} height={26} patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
            <circle cx={6} cy={6} r={3.6} fill={ink} opacity={0.14} />
            <circle cx={19} cy={19} r={3.6} fill={ink} opacity={0.14} />
          </pattern>
        )}
        {cfg.pattern === 'stripes' && (
          <pattern id={`${uid}-pat`} width={24} height={24} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width={11} height={24} fill={ink} opacity={0.11} />
          </pattern>
        )}
        {cfg.pattern === 'checks' && (
          <pattern id={`${uid}-pat`} width={36} height={36} patternUnits="userSpaceOnUse">
            <rect width={18} height={18} fill={ink} opacity={0.11} />
            <rect x={18} y={18} width={18} height={18} fill={ink} opacity={0.11} />
          </pattern>
        )}
      </defs>
      {cfg.shadow && <ellipse className="m-shadow" cy={122} rx={64 * v.w} ry={7} fill="#000000" fillOpacity={0.12} />}
      <g className="m-root">
        {auraBack(cfg.aura, paint.accent)}
        <g className="m-lean">{core}</g>
        {auraFront(cfg.aura, paint.accent)}
        {cfg.anim === 'sleep' && !lite &&
          [0, 0.33, 0.66].map((fr) => (
            <g key={fr} transform={`translate(${(at(40)[0] + 14).toFixed(1)} ${(at(40)[1] - 12).toFixed(1)})`}>
              <path className="m-z" style={delay(fr)} d={ZED} fill="none" stroke={paint.accent} strokeWidth={LINE - 1} strokeLinecap="round" strokeLinejoin="round" opacity={0} />
            </g>
          ))}
      </g>
    </>
  )
}

/* ----------------------------- convenience SVGs ---------------------------- */

type View = 'full' | 'face' | 'tight' | 'top'

/** Static, non-animated mascot — used for option thumbnails and the crew rail. */
export const Thumb = memo(function Thumb({ cfg, size = 56, view = 'full' }: { cfg: Config; size?: number; view?: View }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const m = useMemo(() => resolve(cfg), [cfg])
  const fy = m.v.faceY + m.v.eyeY + 8
  const box = view === 'face' ? `-78 ${(fy - 72).toFixed(0)} 156 156` : view === 'tight' ? '-128 -128 256 256' : view === 'top' ? '-132 -196 264 264' : VIEWBOX
  return (
    <svg className={`thumb-${view}`} width={size} height={size} viewBox={box} aria-hidden="true">
      <MascotArt cfg={cfg} m={m} uid={`t${uid}`} lite />
    </svg>
  )
})

export const animStyle = (cfg: Config): CSSProperties => ({ ['--L' as string]: `${(LOOP_SECONDS / cfg.speed).toFixed(3)}s` })

export { ANIM_CSS }
