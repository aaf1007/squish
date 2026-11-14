import { useEffect, useLayoutEffect, useMemo, useRef, useState, type Ref } from 'react'
import { ANIM_CSS, MascotArt, VIEWBOX, animStyle } from '../mascot/Mascot'
import { bgCss, lerpModel, resolve, resolveBg, type Config, type Model } from '../mascot/model'

/** Springs the numeric model toward its target so every change morphs. */
function useMorph(target: Model, snap: boolean): Model {
  const [cur, setCur] = useState(target)
  const s = useRef({ from: target, to: target, cur: target, p: 1, v: 0, raf: 0, last: 0 })

  useEffect(() => {
    const st = s.current
    if (st.to === target) return
    cancelAnimationFrame(st.raf)
    if (snap || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      st.to = st.cur = target
      st.p = 1
      setCur(target)
      return
    }
    st.from = st.cur
    st.to = target
    st.p = 0
    st.v = 0
    st.last = performance.now()
    const tick = (now: number) => {
      // fixed 4ms substeps keep the spring identical at any frame rate
      let left = Math.min(0.12, Math.max(0, (now - st.last) / 1000))
      st.last = now
      while (left > 0) {
        const h = Math.min(0.004, left)
        st.v += (260 * (1 - st.p) - 22 * st.v) * h
        st.p += st.v * h
        left -= h
      }
      if (Math.abs(1 - st.p) < 0.002 && Math.abs(st.v) < 0.02) {
        st.cur = st.to
        st.p = 1
        setCur(st.to)
        return
      }
      st.cur = lerpModel(st.from, st.to, st.p)
      setCur(st.cur)
      st.raf = requestAnimationFrame(tick)
    }
    st.raf = requestAnimationFrame(tick)
  }, [target, snap])

  useEffect(() => () => cancelAnimationFrame(s.current.raf), [])
  return cur
}

interface Props {
  cfg: Config
  snap: boolean
  svgRef: Ref<SVGSVGElement>
  onName: (name: string) => void
}

export function Stage({ cfg, snap, svgRef, onName }: Props) {
  const [flash, setFlash] = useState<string | null>(null)
  const hit = useRef<HTMLButtonElement>(null)
  const wrap = useRef<HTMLDivElement>(null)

  const expr = flash ?? cfg.expr
  const target = useMemo(
    () => resolve({ ...cfg, expr }),
    // only the fields that feed the numeric model
    [cfg.shape, cfg.round, cfg.wobble, cfg.w, cfg.h, cfg.eyeSize, cfg.eyeGap, cfg.eyeY, cfg.mouthSize, expr],
  )
  const m = useMorph(target, snap)

  // eyes follow the pointer — written straight to the DOM, no re-render
  useEffect(() => {
    const el = wrap.current
    if (!el || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)
      tx = Math.max(-1, Math.min(1, nx)) * 10
      ty = Math.max(-1, Math.min(1, ny)) * 7
      if (!raf) raf = requestAnimationFrame(step)
    }
    const step = () => {
      x += (tx - x) * 0.14
      y += (ty - y) * 0.14
      el.querySelectorAll<SVGGElement>('.m-look').forEach((g) => (g.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`))
      el.querySelectorAll<SVGGElement>('.m-pupil').forEach((g) => (g.style.transform = `translate(${(x * 0.55).toFixed(2)}px,${(y * 0.6).toFixed(2)}px)`))
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(step) : 0
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Parts mounted later (eyewear, sticker border, aura…) would otherwise start
  // their CSS animations late and drift out of phase with the body. Pin every
  // animation to the same origin so the whole rig shares one clock.
  useLayoutEffect(() => {
    wrap.current?.querySelector('svg')?.getAnimations({ subtree: true }).forEach((a) => {
      if (a.startTime !== 0) a.startTime = 0
    })
  }, [cfg])

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 700)
    return () => clearTimeout(t)
  }, [flash])

  const poke = () => {
    setFlash(cfg.expr === 'surprised' ? 'joy' : 'surprised')
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
      hit.current?.animate(
        [{ transform: 'scale(1,1)' }, { transform: 'scale(1.08,.9)', offset: 0.25 }, { transform: 'scale(.96,1.05)', offset: 0.55 }, { transform: 'scale(1,1)' }],
        { duration: 480, easing: 'cubic-bezier(0.23,1,0.32,1)' },
      )
  }

  const bg = resolveBg(cfg)

  return (
    <section className={`stage${bg.kind === 'none' ? ' is-clear' : ''}`} style={{ background: bg.kind === 'none' ? undefined : bgCss(bg) }} aria-label="Mascot preview">
      <label className="nametag">
        <span>Meet</span>
        <input
          value={cfg.name}
          onChange={(e) => onName(e.target.value.slice(0, 18))}
          size={Math.max(cfg.name.length, 2)}
          spellCheck={false}
          aria-label="Mascot name"
        />
      </label>
      <div className="mascot-wrap" ref={wrap}>
        <button ref={hit} type="button" className="mascot-hit" onClick={poke} aria-label={`Poke ${cfg.name || 'the mascot'}`}>
          <svg
            ref={svgRef}
            className={`mascot bl-anim a-${cfg.anim}`}
            style={animStyle(cfg)}
            viewBox={VIEWBOX}
            role="img"
            aria-label={`${cfg.name || 'Mascot'}, an animated mascot`}
          >
            <style>{ANIM_CSS}</style>
            <MascotArt cfg={cfg} m={m} uid="stage" />
          </svg>
        </button>
      </div>
    </section>
  )
}
