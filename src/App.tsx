import { useCallback, useEffect, useRef, useState } from 'react'
import { Thumb } from './mascot/Mascot'
import { ANIMS, DEFAULT, PRESETS, decode, encode, randomConfig, sanitize, type Config } from './mascot/model'
import { ExportMenu } from './ui/ExportMenu'
import { Panel, type Update } from './ui/Panel'
import { Stage } from './ui/Stage'
import { Icon } from './ui/icons'

const STORE = 'squish:mascot'
const THEME = 'squish:theme'
// keys from when the site was called bloop, so saved mascots survive the rename
const OLD_STORE = 'bloop:mascot'
const OLD_THEME = 'bloop:theme'

function initial(): Config {
  const hash = location.hash.slice(1)
  if (hash) {
    const fromLink = decode(hash)
    if (fromLink) return fromLink
  }
  try {
    const saved = localStorage.getItem(STORE) ?? localStorage.getItem(OLD_STORE)
    if (saved) return sanitize(JSON.parse(saved))
  } catch {
    /* storage unavailable — fall through */
  }
  return DEFAULT
}

function initialTheme(): 'light' | 'dark' {
  try {
    const t = localStorage.getItem(THEME) ?? localStorage.getItem(OLD_THEME)
    if (t === 'light' || t === 'dark') return t
  } catch {
    /* ignore */
  }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function App() {
  const [state, setState] = useState(() => ({ cfg: initial(), snap: false }))
  const [theme, setTheme] = useState(initialTheme)
  const [toastMsg, setToastMsg] = useState<{ text: string; id: number } | null>(null)
  const past = useRef<Config[]>([])
  const live = useRef(state)
  const svgRef = useRef<SVGSVGElement>(null)
  const { cfg, snap } = state

  const commit = useCallback((next: Config | ((c: Config) => Config), snapNow = false) => {
    const s = live.current
    // slider drags (snap) coalesce into a single undo step
    if (!(snapNow && s.snap)) past.current = [...past.current.slice(-49), s.cfg]
    live.current = { cfg: typeof next === 'function' ? next(s.cfg) : next, snap: snapNow }
    setState(live.current)
  }, [])

  const update: Update = useCallback((patch, snapNow) => commit((c) => ({ ...c, ...patch }), snapNow), [commit])
  const shuffle = useCallback(() => commit((c) => randomConfig(c)), [commit])
  const undo = useCallback(() => {
    const prev = past.current.pop()
    if (!prev) return
    live.current = { cfg: prev, snap: false }
    setState(live.current)
  }, [])

  const toast = useCallback((text: string) => setToastMsg({ text, id: Date.now() }), [])

  // persist + keep the URL shareable
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORE, JSON.stringify(cfg))
      } catch {
        /* ignore */
      }
      window.history.replaceState(null, '', `#${encode(cfg)}`)
    }, 250)
    return () => clearTimeout(t)
  }, [cfg])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 2200)
    return () => clearTimeout(t)
  }, [toastMsg])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      const typing = el.tagName === 'INPUT' && (el as HTMLInputElement).type !== 'range'
      if (typing || e.altKey) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      } else if (e.code === 'Space' && !e.metaKey && !e.ctrlKey && (el === document.body || el.tagName !== 'BUTTON')) {
        e.preventDefault()
        shuffle()
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [shuffle, undo])

  const share = async () => {
    const url = `${location.origin}${location.pathname}#${encode(cfg)}`
    try {
      await navigator.clipboard.writeText(url)
      toast('Link copied — anyone can remix it')
    } catch {
      toast('Copy the address bar to share')
    }
  }

  return (
    <div className="app">
      <header className="top">
        <a className="logo" href="./" aria-label="Squish home">
          <span className="logo-mark">
            <Thumb cfg={{ ...DEFAULT, shadow: false }} size={34} />
          </span>
          squish
          <em>mascot studio</em>
        </a>
        <div className="top-actions">
          <button type="button" className="btn icon" onClick={undo} aria-label="Undo" title="Undo (⌘Z)">
            <Icon name="undo" />
          </button>
          <button type="button" className="btn icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme" title="Toggle theme">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button type="button" className="btn" onClick={share}>
            <Icon name="link" />
            <span className="lbl">Share</span>
          </button>
          <ExportMenu cfg={cfg} svgRef={svgRef} toast={toast} />
        </div>
      </header>

      <main className="work">
        <div className="stage-col">
          <Stage cfg={cfg} snap={snap} svgRef={svgRef} onName={(name) => update({ name }, true)} />

          <nav className="crew" aria-label="Starter mascots">
            {PRESETS.map((p) => (
              <button key={p.name} type="button" className="crew-item" onClick={() => commit({ ...p, speed: cfg.speed })} title={p.name} aria-label={`Load ${p.name}`}>
                <Thumb cfg={{ ...p, aura: 'none', shadow: false }} size={40} />
              </button>
            ))}
          </nav>

          <div className="dock">
            <button type="button" className="btn shuffle" onClick={shuffle}>
              <Icon name="dice" />
              Shuffle
              <kbd>space</kbd>
            </button>
            <div className="dock-anims" role="radiogroup" aria-label="Motion">
              {ANIMS.map((a) => (
                <button key={a.id} type="button" role="radio" aria-checked={cfg.anim === a.id} className="chip" onClick={() => update({ anim: a.id })}>
                  {a.label}
                </button>
              ))}
            </div>
            <label className="speed" title="Speed">
              <span>Speed</span>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={cfg.speed}
                onChange={(e) => update({ speed: Number(e.target.value) }, true)}
                style={{ ['--p' as string]: `${((cfg.speed - 0.5) / 1.5) * 100}%` }}
                aria-label="Animation speed"
              />
              <output>{cfg.speed.toFixed(1)}×</output>
            </label>
          </div>
        </div>

        <Panel cfg={cfg} update={update} />
      </main>

      <div className="toast-zone" aria-live="polite">
        {toastMsg && (
          <div className="toast" key={toastMsg.id}>
            {toastMsg.text}
          </div>
        )}
      </div>
    </div>
  )
}
