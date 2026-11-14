import { SHAPES, shapeById, shapeRadii } from './shapes'

/* ------------------------------ option lists ------------------------------ */

export interface Opt {
  id: string
  label: string
}

export const EYES: Opt[] = [
  { id: 'oval', label: 'Oval' },
  { id: 'dot', label: 'Dot' },
  { id: 'pill', label: 'Pill' },
  { id: 'shine', label: 'Shine' },
  { id: 'googly', label: 'Googly' },
  { id: 'ring', label: 'Ring' },
  { id: 'square', label: 'Pixel' },
  { id: 'arc', label: 'Smiley' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'cross', label: 'Cross' },
]

export const MOUTHS: Opt[] = [
  { id: 'none', label: 'None' },
  { id: 'smile', label: 'Line' },
  { id: 'open', label: 'Open' },
  { id: 'cat', label: 'Cat' },
  { id: 'o', label: 'Ooh' },
  { id: 'tongue', label: 'Tongue' },
  { id: 'fang', label: 'Fang' },
]

export const CHEEKS: Opt[] = [
  { id: 'none', label: 'None' },
  { id: 'blush', label: 'Blush' },
  { id: 'freckles', label: 'Freckles' },
  { id: 'lines', label: 'Lines' },
]

export const TOPS: Opt[] = [
  { id: 'none', label: 'None' },
  { id: 'sprout', label: 'Sprout' },
  { id: 'antenna', label: 'Antenna' },
  { id: 'twin', label: 'Twin' },
  { id: 'cat', label: 'Cat ears' },
  { id: 'bear', label: 'Bear ears' },
  { id: 'bunny', label: 'Bunny' },
  { id: 'horns', label: 'Horns' },
  { id: 'halo', label: 'Halo' },
  { id: 'crown', label: 'Crown' },
  { id: 'party', label: 'Party hat' },
  { id: 'bow', label: 'Bow' },
]

export const EYEWEAR: Opt[] = [
  { id: 'none', label: 'None' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'shades', label: 'Shades' },
]

export const AURAS: Opt[] = [
  { id: 'none', label: 'None' },
  { id: 'sparkles', label: 'Sparkles' },
  { id: 'orbit', label: 'Orbit' },
  { id: 'bubbles', label: 'Bubbles' },
  { id: 'hearts', label: 'Hearts' },
  { id: 'glow', label: 'Rays' },
]

export const FINISHES: Opt[] = [
  { id: 'flat', label: 'Flat' },
  { id: 'soft', label: 'Shaded' },
  { id: 'glossy', label: 'Shiny' },
  { id: 'outline', label: 'Outline' },
]

export const PATTERNS: Opt[] = [
  { id: 'none', label: 'None' },
  { id: 'dots', label: 'Dots' },
  { id: 'stripes', label: 'Stripes' },
  { id: 'checks', label: 'Checks' },
]

export const ANIMS: Opt[] = [
  { id: 'idle', label: 'Idle' },
  { id: 'float', label: 'Float' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'wiggle', label: 'Wiggle' },
  { id: 'jelly', label: 'Jelly' },
  { id: 'spin', label: 'Spin' },
  { id: 'nod', label: 'Nod' },
  { id: 'shake', label: 'Nope' },
  { id: 'look', label: 'Look' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'talk', label: 'Talk' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'none', label: 'Still' },
]

export const BODY_COLORS = [
  '#FF6B4A', '#FF9F1C', '#FFC93C', '#7ED957', '#2EC4A6', '#4DA8FF',
  '#6C7BFF', '#A78BFA', '#FF5C9A', '#C89B6D', '#17150F', '#F4F1EA',
]

export const ACCENT_COLORS = ['#3FB56B', '#FFC93C', '#FF6B4A', '#FF5C9A', '#4DA8FF', '#A78BFA', '#FFFFFF', '#17150F']

export const GRADIENTS: Record<string, { label: string; stops: string[] }> = {
  sunset: { label: 'Sunset', stops: ['#FFB199', '#FF6A88'] },
  sky: { label: 'Sky', stops: ['#A1C4FD', '#C2E9FB'] },
  mint: { label: 'Mint', stops: ['#D4FC79', '#96E6A1'] },
  grape: { label: 'Grape', stops: ['#A18CD1', '#FBC2EB'] },
  night: { label: 'Night', stops: ['#141627', '#3B2F7A'] },
}

export const BG_SOLIDS = ['#FFFFFF', '#17150F', '#FFE8D6', '#DFF5E1', '#DCEBFF', '#F1E4FF']

/* ------------------------------- expressions ------------------------------ */

interface EyeExpr {
  sx?: number
  sy?: number
  top?: number
  ang?: number
  bot?: number
}
export interface ExprDef extends Opt {
  l?: EyeExpr
  r?: EyeExpr
  both?: EyeExpr
  curve: number
  open?: number
  brow?: number
  browAng?: number
  blush?: number
  dx?: number
  dy?: number
}

export const EXPRESSIONS: ExprDef[] = [
  { id: 'neutral', label: 'Chill', curve: 0.35 },
  { id: 'happy', label: 'Happy', both: { bot: 0.5 }, curve: 1 },
  { id: 'joy', label: 'Laughing', both: { bot: 0.62, sx: 1.08 }, curve: 1, open: 0.9 },
  { id: 'excited', label: 'Excited', both: { sx: 1.12, sy: 1.18 }, curve: 1, open: 0.6, blush: 0.5 },
  { id: 'love', label: 'In love', both: { bot: 0.32 }, curve: 0.9, blush: 0.9 },
  { id: 'wink', label: 'Wink', r: { sy: 0.14 }, curve: 0.9 },
  { id: 'curious', label: 'Curious', l: { sy: 0.88 }, r: { sy: 1.16, sx: 1.08 }, curve: 0.15, brow: 1, browAng: -10 },
  { id: 'surprised', label: 'Surprised', both: { sx: 1.16, sy: 1.2 }, curve: 0, open: 1, brow: 1, browAng: -6 },
  { id: 'shy', label: 'Shy', both: { top: 0.18 }, curve: 0.5, blush: 1, dx: 7, dy: 5 },
  { id: 'smug', label: 'Smug', both: { top: 0.46, ang: 8 }, curve: 0.75 },
  { id: 'sleepy', label: 'Sleepy', both: { top: 0.62 }, curve: 0.1 },
  { id: 'meh', label: 'Meh', both: { top: 0.5 }, curve: -0.05 },
  { id: 'suspicious', label: 'Sus', l: { top: 0.55, bot: 0.25 }, r: { top: 0.34, bot: 0.2 }, curve: -0.25, dx: 5 },
  { id: 'sad', label: 'Sad', both: { top: 0.32, ang: -20 }, curve: -0.85, brow: 0.9, browAng: -16 },
  { id: 'angry', label: 'Angry', both: { top: 0.38, ang: 22 }, curve: -0.7, brow: 1, browAng: 18 },
  { id: 'scared', label: 'Scared', both: { sx: 0.9, sy: 1.26 }, curve: -0.5, open: 0.45, brow: 1, browAng: -14 },
]

/* --------------------------------- config --------------------------------- */

export interface Config {
  name: string
  shape: string
  round: number
  wobble: number
  w: number
  h: number
  color: string
  color2: string
  fill: 'solid' | 'gradient'
  finish: string
  pattern: string
  ink: string // 'auto' | hex
  eyes: string
  eyeSize: number
  eyeGap: number
  eyeY: number
  expr: string
  mouth: string
  mouthSize: number
  cheeks: string
  top: string
  eyewear: string
  aura: string
  shadow: boolean
  sticker: boolean
  bg: string // 'none' | 'tint' | hex | 'g:<gradient>'
  anim: string
  speed: number
}

export const DEFAULT: Config = {
  name: 'Pip',
  shape: 'circle',
  round: 0.35,
  wobble: 0,
  w: 1.06,
  h: 0.96,
  color: '#FF6B4A',
  color2: '#3FB56B',
  fill: 'solid',
  finish: 'soft',
  pattern: 'none',
  ink: 'auto',
  eyes: 'oval',
  eyeSize: 0.95,
  eyeGap: 1.25,
  eyeY: 10,
  expr: 'neutral',
  mouth: 'smile',
  mouthSize: 0.85,
  cheeks: 'none',
  top: 'sprout',
  eyewear: 'none',
  aura: 'none',
  shadow: true,
  sticker: false,
  bg: 'tint',
  anim: 'idle',
  speed: 1,
}

const RANGES: Partial<Record<keyof Config, [number, number]>> = {
  round: [0, 1],
  wobble: [0, 1],
  w: [0.75, 1.3],
  h: [0.75, 1.3],
  eyeSize: [0.6, 1.6],
  eyeGap: [0.5, 1.7],
  eyeY: [-30, 30],
  mouthSize: [0.6, 1.8],
  speed: [0.5, 2],
}

const ENUMS: Partial<Record<keyof Config, string[]>> = {
  shape: SHAPES.map((s) => s.id),
  fill: ['solid', 'gradient'],
  finish: FINISHES.map((o) => o.id),
  pattern: PATTERNS.map((o) => o.id),
  eyes: EYES.map((o) => o.id),
  expr: EXPRESSIONS.map((o) => o.id),
  mouth: MOUTHS.map((o) => o.id),
  cheeks: CHEEKS.map((o) => o.id),
  top: TOPS.map((o) => o.id),
  eyewear: EYEWEAR.map((o) => o.id),
  aura: AURAS.map((o) => o.id),
  anim: ANIMS.map((o) => o.id),
}

const HEX = /^#[0-9a-fA-F]{6}$/

/** Accept only known keys with valid values — share links are untrusted input. */
export function sanitize(input: unknown): Config {
  const out: Config = { ...DEFAULT }
  if (!input || typeof input !== 'object') return out
  const src = input as Record<string, unknown>
  for (const key of Object.keys(DEFAULT) as (keyof Config)[]) {
    const v = src[key]
    if (v === undefined) continue
    const range = RANGES[key]
    const list = ENUMS[key]
    let ok = false
    let val: unknown = v
    if (range) {
      ok = typeof v === 'number' && Number.isFinite(v)
      if (ok) val = Math.min(range[1], Math.max(range[0], v as number))
    } else if (list) ok = typeof v === 'string' && list.includes(v)
    else if (key === 'name') {
      ok = typeof v === 'string'
      if (ok) val = (v as string).slice(0, 18)
    } else if (key === 'color' || key === 'color2') ok = typeof v === 'string' && HEX.test(v)
    else if (key === 'ink') ok = v === 'auto' || (typeof v === 'string' && HEX.test(v))
    else if (key === 'bg')
      ok =
        v === 'none' ||
        v === 'tint' ||
        (typeof v === 'string' && (HEX.test(v) || (v.startsWith('g:') && v.slice(2) in GRADIENTS)))
    else if (key === 'shadow' || key === 'sticker') ok = typeof v === 'boolean'
    if (ok) (out as unknown as Record<string, unknown>)[key] = val
  }
  return out
}

export function encode(cfg: Config): string {
  const diff: Record<string, unknown> = {}
  for (const k of Object.keys(DEFAULT) as (keyof Config)[]) {
    const v = cfg[k]
    if (v !== DEFAULT[k]) diff[k] = typeof v === 'number' ? Math.round(v * 100) / 100 : v
  }
  const json = JSON.stringify(diff)
  const bytes = new TextEncoder().encode(json)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decode(hash: string): Config | null {
  try {
    const b64 = hash.replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return sanitize(JSON.parse(new TextDecoder().decode(bytes)))
  } catch {
    return null
  }
}

/* --------------------------------- colour --------------------------------- */

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

export function mix(a: string, b: string, t: number): string {
  const A = rgb(a)
  const B = rgb(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const INK_DARK = '#17150F'
export const inkFor = (cfg: Config) =>
  cfg.ink !== 'auto' ? cfg.ink : luminance(cfg.color) > 0.22 ? INK_DARK : '#FFFFFF'

export function hsl(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export type Bg = { kind: 'none' } | { kind: 'solid'; color: string } | { kind: 'grad'; stops: string[] }

export function resolveBg(cfg: Config): Bg {
  if (cfg.bg === 'none') return { kind: 'none' }
  if (cfg.bg === 'tint') return { kind: 'solid', color: mix(cfg.color, '#FFFFFF', 0.8) }
  if (cfg.bg.startsWith('g:')) return { kind: 'grad', stops: GRADIENTS[cfg.bg.slice(2)].stops }
  return { kind: 'solid', color: cfg.bg }
}

export const bgCss = (bg: Bg) =>
  bg.kind === 'none' ? 'transparent' : bg.kind === 'solid' ? bg.color : `linear-gradient(160deg, ${bg.stops.join(', ')})`

/* ---------------------------------- model --------------------------------- */

// The numeric, interpolatable half of a mascot. Everything here is springed
// when the config changes; discrete styles (eye type, hat…) swap instantly.
export const NUM_KEYS = [
  'w', 'h', 'eyeSize', 'eyeGap', 'eyeY', 'mouthSize', 'faceY', 'faceS',
  'lsx', 'lsy', 'ltop', 'lang', 'lbot', 'rsx', 'rsy', 'rtop', 'rang', 'rbot',
  'curve', 'open', 'brow', 'browAng', 'blush', 'dx', 'dy',
] as const
export type NumKey = (typeof NUM_KEYS)[number]

export interface Model {
  r: number[]
  v: Record<NumKey, number>
}

export function resolve(cfg: Config): Model {
  const shape = shapeById(cfg.shape)
  const e = EXPRESSIONS.find((x) => x.id === cfg.expr) ?? EXPRESSIONS[0]
  const L = { ...e.both, ...e.l }
  const R = { ...e.both, ...e.r }
  return {
    r: shapeRadii(cfg.shape, cfg.round, cfg.wobble),
    v: {
      w: cfg.w,
      h: cfg.h,
      eyeSize: cfg.eyeSize,
      eyeGap: cfg.eyeGap,
      eyeY: cfg.eyeY,
      mouthSize: cfg.mouthSize,
      faceY: (shape.faceY ?? 0) * cfg.h,
      faceS: shape.faceS ?? 1,
      lsx: L.sx ?? 1, lsy: L.sy ?? 1, ltop: L.top ?? 0, lang: L.ang ?? 0, lbot: L.bot ?? 0,
      rsx: R.sx ?? 1, rsy: R.sy ?? 1, rtop: R.top ?? 0, rang: R.ang ?? 0, rbot: R.bot ?? 0,
      curve: e.curve,
      open: e.open ?? 0,
      brow: e.brow ?? 0,
      browAng: e.browAng ?? 0,
      blush: e.blush ?? 0,
      dx: e.dx ?? 0,
      dy: e.dy ?? 0,
    },
  }
}

export function lerpModel(a: Model, b: Model, t: number): Model {
  const r = a.r.map((x, i) => x + (b.r[i] - x) * t)
  const v = {} as Record<NumKey, number>
  for (const k of NUM_KEYS) v[k] = a.v[k] + (b.v[k] - a.v[k]) * t
  return { r, v }
}

/* ----------------------------- random + presets ---------------------------- */

const NAMES = [
  'Pip', 'Mochi', 'Nori', 'Boba', 'Miso', 'Kiwi', 'Lulu', 'Zap', 'Boo', 'Momo', 'Tofu', 'Zuzu', 'Pixel', 'Bean',
  'Yuzu', 'Dot', 'Gus', 'Olive', 'Pesto', 'Wren', 'Fig', 'Juno', 'Bub', 'Taro', 'Nimbus', 'Soba', 'Pudding', 'Blip',
]

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)]
const rnd = (a: number, b: number) => a + Math.random() * (b - a)
const chance = (p: number) => Math.random() < p
const ids = (o: Opt[], skipNone = false) => o.map((x) => x.id).filter((id) => !skipNone || id !== 'none')

export function randomConfig(prev?: Config): Config {
  const color = chance(0.6) ? pick(BODY_COLORS) : hsl(rnd(0, 360), rnd(0.6, 0.85), rnd(0.55, 0.68))
  let shape = pick(SHAPES).id
  if (prev && shape === prev.shape) shape = pick(SHAPES).id
  const eyes = pick(['oval', 'oval', 'dot', 'dot', 'pill', ...ids(EYES)])
  return {
    name: pick(NAMES.filter((n) => n !== prev?.name)),
    shape,
    round: rnd(0.2, 0.55),
    wobble: chance(0.25) ? rnd(0.2, 0.7) : 0,
    w: rnd(0.94, 1.1),
    h: rnd(0.92, 1.06),
    color,
    color2: pick(ACCENT_COLORS.filter((c) => c !== color)),
    fill: chance(0.08) ? 'gradient' : 'solid',
    finish: pick(['flat', 'flat', 'soft', 'soft', 'soft', 'glossy', 'outline']),
    pattern: chance(0.1) ? pick(ids(PATTERNS, true)) : 'none',
    ink: 'auto',
    eyes,
    eyeSize: rnd(0.85, 1.15),
    eyeGap: rnd(0.95, 1.4),
    eyeY: rnd(0, 14),
    expr: pick(ids(EXPRESSIONS)),
    mouth: chance(0.15) ? 'none' : pick(['smile', 'smile', ...ids(MOUTHS, true)]),
    mouthSize: rnd(0.75, 1.05),
    cheeks: chance(0.3) ? pick(ids(CHEEKS, true)) : 'none',
    top: chance(0.6) ? pick(ids(TOPS, true)) : 'none',
    eyewear: chance(0.12) ? pick(ids(EYEWEAR, true)) : 'none',
    aura: chance(0.2) ? pick(ids(AURAS, true)) : 'none',
    shadow: true,
    sticker: chance(0.1),
    bg: chance(0.8) ? 'tint' : pick(['#FFFFFF', '#17150F', ...BG_SOLIDS.slice(2)]),
    anim: prev?.anim ?? 'idle',
    speed: prev?.speed ?? 1,
  }
}

const preset = (p: Partial<Config>): Config => ({ ...DEFAULT, w: 1, h: 1, eyeGap: 1.15, eyeY: 6, top: 'none', color2: '#FFC93C', ...p })

export const PRESETS: Config[] = [
  DEFAULT,
  preset({ name: 'Nori', shape: 'squircle', color: '#17150F', finish: 'flat', eyes: 'pill', eyeGap: 0.95, mouth: 'none', top: 'antenna', bg: '#FFFFFF' }),
  preset({ name: 'Boba', shape: 'egg', color: '#C89B6D', color2: '#8C5E3C', eyes: 'googly', expr: 'surprised', mouth: 'o', top: 'bear', cheeks: 'freckles' }),
  preset({ name: 'Miso', shape: 'cloud', color: '#4DA8FF', eyes: 'dot', expr: 'sleepy', top: 'halo', aura: 'sparkles', anim: 'float' }),
  preset({ name: 'Kiwi', shape: 'hexagon', color: '#7ED957', finish: 'outline', eyes: 'square', expr: 'curious', top: 'twin', mouth: 'fang' }),
  preset({ name: 'Lulu', shape: 'heart', round: 0.12, color: '#FF8FB3', color2: '#E63D80', finish: 'glossy', eyes: 'heart', expr: 'love', mouth: 'cat', top: 'bow', aura: 'hearts', anim: 'pulse' }),
  preset({ name: 'Zap', shape: 'star', color: '#FFC93C', color2: '#FF6B4A', finish: 'glossy', expr: 'excited', mouth: 'open', aura: 'glow', anim: 'wiggle', bg: '#17150F' }),
  preset({ name: 'Boo', shape: 'ghost', color: '#F4F1EA', color2: '#A78BFA', expr: 'scared', mouth: 'o', aura: 'bubbles', anim: 'float', bg: '#F1E4FF' }),
  preset({ name: 'Momo', shape: 'capsule', color: '#A78BFA', color2: '#FF5C9A', finish: 'glossy', eyes: 'dot', expr: 'wink', mouth: 'cat', top: 'cat', cheeks: 'blush', anim: 'jelly' }),
  preset({ name: 'Taro', shape: 'droplet', color: '#2EC4A6', eyes: 'dot', expr: 'smug', mouth: 'tongue', eyewear: 'round', top: 'crown', anim: 'bounce' }),
]
