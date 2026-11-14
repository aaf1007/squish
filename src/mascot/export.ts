import { LOOP_SECONDS } from './anim'
import { mix, resolveBg, type Config } from './model'
import { VIEWBOX } from './Mascot'

export type Aspect = 'square' | 'reel' | 'wide'

export const ASPECTS: Record<Aspect, { label: string; hint: string; w: number; h: number }> = {
  square: { label: 'Square', hint: '1:1', w: 1, h: 1 },
  reel: { label: 'Reel', hint: '9:16', w: 9, h: 16 },
  wide: { label: 'Wide', hint: '16:9', w: 16, h: 9 },
}

export function dims(aspect: Aspect, short: number): [number, number] {
  const a = ASPECTS[aspect]
  const k = short / Math.min(a.w, a.h)
  return [Math.round(a.w * k), Math.round(a.h * k)]
}

interface SvgOpts {
  aspect: Aspect
  short: number
  /** 'static' = neutral pose, 'loop' = self-animating, number = frozen at that second */
  mode: 'static' | 'loop' | number
  /** paint a backdrop even when the mascot has a transparent background */
  forceBg?: boolean
}

/** Serialise the live stage mascot into a standalone SVG document. */
export function buildSvg(live: SVGSVGElement, cfg: Config, o: SvgOpts): string {
  const clone = live.cloneNode(true) as SVGSVGElement
  // drop pointer-tracking offsets so every export looks straight ahead
  clone.querySelectorAll('.m-look, .m-pupil').forEach((n) => n.removeAttribute('style'))
  const ser = new XMLSerializer()
  let inner = ''
  clone.childNodes.forEach((n) => (inner += ser.serializeToString(n)))

  const [W, H] = dims(o.aspect, o.short)
  const S = Math.min(W, H) * 0.84
  const bg = resolveBg(cfg)
  let back = ''
  if (bg.kind === 'solid') back = `<rect width="${W}" height="${H}" fill="${bg.color}"/>`
  else if (bg.kind === 'grad')
    back =
      `<defs><linearGradient id="bl-bg" x1="0.2" y1="0" x2="0.8" y2="1">` +
      bg.stops.map((c, i) => `<stop offset="${i / (bg.stops.length - 1)}" stop-color="${c}"/>`).join('') +
      `</linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bl-bg)"/>`
  else if (o.forceBg) back = `<rect width="${W}" height="${H}" fill="${mix(cfg.color, '#FFFFFF', 0.8)}"/>`

  const L = (LOOP_SECONDS / cfg.speed).toFixed(3)
  let attrs = ''
  if (o.mode === 'loop') attrs = ` class="bl-anim a-${cfg.anim}" style="--L:${L}s"`
  else if (typeof o.mode === 'number') attrs = ` class="bl-anim a-${cfg.anim}" style="--L:${L}s;--t:${o.mode.toFixed(4)}s;--ps:paused"`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${back}` +
    `<svg x="${(W - S) / 2}" y="${(H - S) / 2}" width="${S}" height="${S}" viewBox="${VIEWBOX}" overflow="visible"${attrs}>${inner}</svg></svg>`
  )
}

function loadImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      res(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rej(new Error('Could not rasterise the mascot'))
    }
    img.src = url
  })
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export const fileBase = (cfg: Config) => (cfg.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mascot') + '-squish'

export async function exportPng(live: SVGSVGElement, cfg: Config, aspect: Aspect, short: number) {
  const [W, H] = dims(aspect, short)
  const img = await loadImage(buildSvg(live, cfg, { aspect, short, mode: 'static' }))
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  canvas.getContext('2d')!.drawImage(img, 0, 0, W, H)
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
  if (!blob) throw new Error('PNG encoding failed')
  download(blob, `${fileBase(cfg)}.png`)
}

export function exportSvg(live: SVGSVGElement, cfg: Config, aspect: Aspect, animated: boolean) {
  const svg = buildSvg(live, cfg, { aspect, short: 1080, mode: animated ? 'loop' : 'static' })
  download(new Blob([svg], { type: 'image/svg+xml' }), `${fileBase(cfg)}${animated ? '-animated' : ''}.svg`)
}

export function videoMime(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === 'undefined') return null
  const options: [string, string][] = [
    ['video/mp4;codecs=avc1.42E01E', 'mp4'],
    ['video/mp4', 'mp4'],
    ['video/webm;codecs=vp9', 'webm'],
    ['video/webm', 'webm'],
  ]
  for (const [mime, ext] of options) if (MediaRecorder.isTypeSupported(mime)) return { mime, ext }
  return null
}

/** Record the loop in real time by rasterising one paused SVG frame per tick. */
export async function exportVideo(
  live: SVGSVGElement,
  cfg: Config,
  aspect: Aspect,
  onProgress: (p: number) => void,
): Promise<void> {
  const fmt = videoMime()
  if (!fmt) throw new Error('This browser cannot record video')
  const [W, H] = dims(aspect, 1080)
  const loop = LOOP_SECONDS / cfg.speed
  const duration = Math.max(loop, Math.ceil(6 / loop) * loop) // whole loops, ≥ 6s
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const draw = async (t: number) => {
    const img = await loadImage(buildSvg(live, cfg, { aspect, short: 1080, mode: t % loop, forceBg: true }))
    ctx.clearRect(0, 0, W, H)
    ctx.drawImage(img, 0, 0, W, H)
  }
  await draw(0)

  const stream = canvas.captureStream(30)
  const rec = new MediaRecorder(stream, { mimeType: fmt.mime, videoBitsPerSecond: 8_000_000 })
  const chunks: Blob[] = []
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  const done = new Promise<void>((res) => (rec.onstop = () => res()))
  rec.start()

  const start = performance.now()
  for (;;) {
    const t = (performance.now() - start) / 1000
    if (t >= duration) break
    await draw(t)
    onProgress(t / duration)
    await new Promise((r) => setTimeout(r, 0))
  }
  rec.stop()
  await done
  stream.getTracks().forEach((tr) => tr.stop())
  download(new Blob(chunks, { type: fmt.mime.split(';')[0] }), `${fileBase(cfg)}.${fmt.ext}`)
}
