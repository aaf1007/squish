// Every body is a star-convex outline sampled as N radii around the centre.
// Sharing one representation is what lets any shape morph into any other.

export const N = 180
const TAU = Math.PI * 2

type Inside = (x: number, y: number) => boolean
type Polar = (theta: number) => number

export interface ShapeDef {
  id: string
  label: string
  inside?: Inside
  polar?: Polar
  /** vertical nudge of the face, in body units (100 = radius) */
  faceY?: number
  faceS?: number
}

const polygon = (normalsDeg: number[], apothem: number, cy = 0): Inside => {
  const ns = normalsDeg.map((d) => [Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180)])
  return (x, y) => ns.every(([nx, ny]) => x * nx + (y - cy) * ny < apothem)
}

const starPolar = (points: number, outer: number, inner: number): Polar => {
  const half = Math.PI / points
  const p1x = inner * Math.cos(half)
  const p1y = inner * Math.sin(half)
  const dx = p1x - outer
  const dy = p1y
  return (theta) => {
    let a = (((theta + Math.PI / 2) % (2 * half)) + 2 * half) % (2 * half)
    if (a > half) a = 2 * half - a
    return (-dy * outer) / (dx * Math.sin(a) - dy * Math.cos(a))
  }
}

const cloudCircles = [
  [-0.5, 0.22, 0.52],
  [0.5, 0.22, 0.52],
  [0.02, 0.3, 0.6],
  [-0.2, -0.3, 0.56],
  [0.34, -0.2, 0.46],
]

// droplet: circle + tangent cone up to the tip
const DROP = (() => {
  const cy = 0.26
  const R = 0.74
  const tip = -1.08
  const d = cy - tip
  const alpha = Math.acos(R / d)
  // tangent points measured from the "up" direction
  const tx = R * Math.sin(alpha)
  const ty = cy - R * Math.cos(alpha)
  return { cy, R, tip, tx, ty }
})()

export const SHAPES: ShapeDef[] = [
  { id: 'circle', label: 'Circle', polar: () => 0.98 },
  {
    id: 'pebble',
    label: 'Pebble',
    polar: (t) => 0.96 + 0.08 * Math.cos(t - 0.5) + 0.07 * Math.cos(2 * t + 0.9) + 0.025 * Math.cos(3 * t + 0.3),
  },
  { id: 'squircle', label: 'Squircle', inside: (x, y) => Math.abs(x) ** 5 + Math.abs(y) ** 5 < 0.93 ** 5 },
  {
    id: 'capsule',
    label: 'Capsule',
    inside: (x, y) => {
      const r = 0.68
      const qx = Math.abs(x) - (1.12 - r)
      const qy = Math.abs(y)
      return Math.hypot(Math.max(qx, 0), qy) < r
    },
    faceS: 0.95,
  },
  {
    id: 'egg',
    label: 'Egg',
    inside: (x, y) => (x / (0.84 * (1 + 0.13 * y))) ** 2 + (y / 1.04) ** 2 < 1,
    faceY: 8,
  },
  {
    id: 'droplet',
    label: 'Droplet',
    inside: (x, y) => {
      if (x * x + (y - DROP.cy) ** 2 < DROP.R ** 2) return true
      if (y > DROP.ty || y < DROP.tip) return false
      return Math.abs(x) < ((y - DROP.tip) / (DROP.ty - DROP.tip)) * DROP.tx
    },
    faceY: 26,
    faceS: 0.9,
  },
  { id: 'triangle', label: 'Triangle', inside: polygon([90, -30, 210], 0.62, 0.3), faceY: 32, faceS: 0.85 },
  { id: 'diamond', label: 'Diamond', inside: (x, y) => Math.abs(x) / 1.02 + Math.abs(y) / 1.1 < 1, faceS: 0.85 },
  { id: 'hexagon', label: 'Hexagon', inside: polygon([30, 90, 150, 210, 270, 330], 0.9) },
  { id: 'star', label: 'Star', polar: starPolar(5, 1.22, 0.74), faceY: 6, faceS: 0.8 },
  { id: 'flower', label: 'Flower', polar: (t) => 0.9 + 0.13 * Math.cos(6 * (t + Math.PI / 2)), faceS: 0.95 },
  {
    id: 'cloud',
    label: 'Cloud',
    inside: (x, y) => cloudCircles.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 < r * r),
    faceY: 6,
  },
  {
    id: 'ghost',
    label: 'Ghost',
    inside: (x, y) => {
      const top = -0.14
      if (y < top) return x * x + (y - top) ** 2 < 0.86 ** 2
      return Math.abs(x) < 0.86 && y < 0.82 + 0.1 * Math.cos((x / 0.86) * Math.PI * 3)
    },
    faceY: -12,
  },
  {
    id: 'heart',
    label: 'Heart',
    inside: (x, y) => {
      const X = x * 1.18
      const Y = -y * 1.18 + 0.2
      return (X * X + Y * Y - 1) ** 3 - X * X * Y ** 3 < 0
    },
    faceY: -8,
    faceS: 0.9,
  },
]

export const shapeById = (id: string) => SHAPES.find((s) => s.id === id) ?? SHAPES[0]

const rawCache = new Map<string, number[]>()

function rawRadii(def: ShapeDef): number[] {
  const hit = rawCache.get(def.id)
  if (hit) return hit
  const out: number[] = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * TAU
    if (def.polar) {
      out.push(def.polar(t))
      continue
    }
    const c = Math.cos(t)
    const s = Math.sin(t)
    let lo = 0
    let hi = 1.8
    for (let k = 0; k < 22; k++) {
      const mid = (lo + hi) / 2
      if (def.inside!(c * mid, s * mid)) lo = mid
      else hi = mid
    }
    out.push(lo)
  }
  rawCache.set(def.id, out)
  return out
}

function blur(r: number[], k: number): number[] {
  if (k < 1) return r
  const out = new Array<number>(N)
  for (let i = 0; i < N; i++) {
    let sum = 0
    for (let j = -k; j <= k; j++) sum += r[(i + j + N) % N]
    out[i] = sum / (2 * k + 1)
  }
  return out
}

/** radii for a shape, softened by `round` (0..1) and organically bent by `wobble` (0..1) */
export function shapeRadii(id: string, round: number, wobble: number): number[] {
  const k = Math.round(round * 11)
  let r = blur(blur(rawRadii(shapeById(id)), k), k)
  if (wobble > 0.001) {
    r = r.map((v, i) => {
      const t = (i / N) * TAU
      return v * (1 + wobble * (0.07 * Math.sin(2 * t + 1.3) + 0.055 * Math.sin(3 * t + 0.4) + 0.03 * Math.sin(5 * t + 2.1)))
    })
  }
  return r
}

export function radiiToPoints(r: number[], w: number, h: number): [number, number][] {
  return r.map((v, i) => {
    const t = (i / N) * TAU
    return [Math.cos(t) * v * 100 * w, Math.sin(t) * v * 100 * h]
  })
}

const f = (n: number) => n.toFixed(1)

export function pointsToPath(p: [number, number][]): string {
  const n = p.length
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const s = mid(p[n - 1], p[0])
  let d = `M${f(s[0])} ${f(s[1])}`
  for (let i = 0; i < n; i++) {
    const m = mid(p[i], p[(i + 1) % n])
    d += `Q${f(p[i][0])} ${f(p[i][1])} ${f(m[0])} ${f(m[1])}`
  }
  return d + 'Z'
}

/** point on the outline, `deg` clockwise from the top */
export function anchor(r: number[], w: number, h: number, deg: number): [number, number] {
  const t = ((((deg - 90) / 360) % 1) + 1) % 1
  const fi = t * N
  const i = Math.floor(fi)
  const v = r[i % N] + (r[(i + 1) % N] - r[i % N]) * (fi - i)
  const a = t * TAU
  return [Math.cos(a) * v * 100 * w, Math.sin(a) * v * 100 * h]
}
