import { useEffect, useRef, useState, type RefObject } from 'react'
import { ASPECTS, buildSvg, exportPng, exportSvg, exportVideo, videoMime, type Aspect } from '../mascot/export'
import type { Config } from '../mascot/model'
import { Segmented } from './Panel'
import { Icon } from './icons'

interface Props {
  cfg: Config
  svgRef: RefObject<SVGSVGElement | null>
  toast: (msg: string) => void
}

export function ExportMenu({ cfg, svgRef, toast }: Props) {
  const [open, setOpen] = useState(false)
  const [aspect, setAspect] = useState<Aspect>('square')
  const [res, setRes] = useState<'1080' | '2160'>('1080')
  const [rec, setRec] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const video = videoMime()

  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => {
      if (rec === null && !root.current?.contains(e.target as Node)) setOpen(false)
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && rec === null) setOpen(false)
    }
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open, rec])

  const run = async (label: string, fn: (svg: SVGSVGElement) => Promise<void> | void) => {
    const svg = svgRef.current
    if (!svg) return
    try {
      await fn(svg)
      toast(label)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Export failed')
    }
  }

  const still = cfg.anim === 'none'
  const rows = [
    {
      icon: 'image' as const,
      title: 'PNG image',
      sub: cfg.bg === 'none' ? 'Transparent background' : 'Crisp still with backdrop',
      go: () => run('PNG saved', (s) => exportPng(s, cfg, aspect, Number(res))),
    },
    {
      icon: 'vector' as const,
      title: 'SVG vector',
      sub: 'Scales to any size',
      go: () => run('SVG saved', (s) => exportSvg(s, cfg, aspect, false)),
    },
    {
      icon: 'loop' as const,
      title: 'Animated SVG',
      sub: still ? 'Pick a motion first' : 'Loops forever, tiny file',
      disabled: still,
      go: () => run('Animated SVG saved', (s) => exportSvg(s, cfg, aspect, true)),
    },
    {
      icon: 'film' as const,
      title: video ? `Video · ${video.ext.toUpperCase()}` : 'Video',
      sub: !video ? 'Not supported in this browser' : still ? 'Pick a motion first' : '1080p loop, ready for Reels',
      disabled: !video || still,
      go: () =>
        run('Video saved', async (s) => {
          setRec(0)
          try {
            await exportVideo(s, cfg, aspect, setRec)
          } finally {
            setRec(null)
          }
        }),
    },
    {
      icon: 'code' as const,
      title: 'Copy SVG code',
      sub: 'Paste straight into your project',
      go: () => run('SVG copied', (s) => navigator.clipboard.writeText(buildSvg(s, cfg, { aspect, short: 512, mode: still ? 'static' : 'loop' }))),
    },
  ]

  return (
    <div className="export" ref={root}>
      <button type="button" className="btn primary" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="download" />
        Export
      </button>
      {open && (
        <div className="pop" role="dialog" aria-label="Export">
          <div className="pop-row">
            <span>Canvas</span>
            <Segmented
              label="Canvas"
              value={aspect}
              options={(Object.keys(ASPECTS) as Aspect[]).map((id) => ({ id, label: `${ASPECTS[id].label} ${ASPECTS[id].hint}` }))}
              onChange={setAspect}
            />
          </div>
          <div className="pop-row">
            <span>PNG size</span>
            <Segmented label="PNG size" value={res} options={[{ id: '1080', label: '1080 px' }, { id: '2160', label: '2160 px' }]} onChange={setRes} />
          </div>
          <ul className="pop-list">
            {rows.map((r) => {
              const recording = r.icon === 'film' && rec !== null
              return (
                <li key={r.title}>
                  <button type="button" disabled={r.disabled || rec !== null} onClick={r.go}>
                    <span className="pop-ico">
                      <Icon name={r.icon} />
                    </span>
                    <span className="pop-text">
                      <b>{r.title}</b>
                      <small>{recording ? `Recording… ${Math.round(rec * 100)}%` : r.sub}</small>
                    </span>
                    {recording && <i className="pop-bar" style={{ transform: `scaleX(${rec})` }} />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
