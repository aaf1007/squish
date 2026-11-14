import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Thumb } from '../mascot/Mascot'
import { SHAPES } from '../mascot/shapes'
import {
  ACCENT_COLORS, AURAS, BG_SOLIDS, BODY_COLORS, CHEEKS, EXPRESSIONS, EYES, EYEWEAR, FINISHES, GRADIENTS, INK_DARK, MOUTHS, PATTERNS, TOPS,
  mix, type Config, type Opt,
} from '../mascot/model'

export type Update = (patch: Partial<Config>, snap?: boolean) => void

interface P {
  cfg: Config
  update: Update
}

/* -------------------------------- primitives ------------------------------- */

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="sec">
      <header>
        <h3>{title}</h3>
        {hint && <span>{hint}</span>}
      </header>
      {children}
    </section>
  )
}

function Grid<K extends keyof Config>({ k, opts, cfg, base, update, view }: P & { k: K; opts: Opt[]; base: Config; view?: 'full' | 'face' | 'tight' | 'top' }) {
  return (
    <div className="grid" role="radiogroup">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={cfg[k] === o.id}
          className="cell"
          onClick={() => update({ [k]: o.id } as Partial<Config>)}
        >
          <Thumb cfg={{ ...base, [k]: o.id }} size={54} view={view} />
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  const i = Math.max(0, options.findIndex((o) => o.id === value))
  return (
    <div className="seg" role="radiogroup" aria-label={label} style={{ ['--n' as string]: options.length, ['--i' as string]: i } as CSSProperties}>
      <i aria-hidden="true" />
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={o.id === value} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Slider({ label, value, min, max, step = 0.01, onChange, format }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  const p = ((value - min) / (max - min)) * 100
  return (
    <label className="slider">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ['--p' as string]: `${p}%` } as CSSProperties} />
      <output>{format ? format(value) : Math.round(p)}</output>
    </label>
  )
}

function Swatches({ value, colors, onChange, label, extra }: { value: string; colors: string[]; onChange: (c: string) => void; label: string; extra?: ReactNode }) {
  const custom = /^#/.test(value) && !colors.includes(value)
  return (
    <div className="swatches" role="radiogroup" aria-label={label}>
      {extra}
      {colors.map((c) => (
        <button key={c} type="button" role="radio" aria-checked={value === c} aria-label={c} className="sw" style={{ ['--c' as string]: c } as CSSProperties} onClick={() => onChange(c)} />
      ))}
      <label className={`sw sw-custom${custom ? ' on' : ''}`} style={custom ? ({ ['--c' as string]: value } as CSSProperties) : undefined} title="Custom colour">
        <input type="color" value={/^#/.test(value) ? value : '#FF6B4A'} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={`${label}: custom`} />
      </label>
    </div>
  )
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="toggle" onClick={() => onChange(!checked)}>
      <span>
        <b>{label}</b>
        <small>{hint}</small>
      </span>
      <i aria-hidden="true" />
    </button>
  )
}

/* ---------------------------------- panel --------------------------------- */

const TABS = [
  { id: 'body', label: 'Body' },
  { id: 'face', label: 'Face' },
  { id: 'extras', label: 'Extras' },
  { id: 'colour', label: 'Colour' },
] as const
type Tab = (typeof TABS)[number]['id']

const mult = (v: number) => `${v.toFixed(2)}×`

export function Panel({ cfg, update }: P) {
  const [tab, setTab] = useState<Tab>('body')
  // thumbnails mirror the current mascot, minus the noisy extras
  const base = useMemo<Config>(() => ({ ...cfg, aura: 'none', sticker: false, shadow: false, anim: 'none' }), [cfg])
  const bare = useMemo<Config>(() => ({ ...base, top: 'none' }), [base])
  const g = { cfg, update, base }

  return (
    <aside className="panel" aria-label="Customise">
      <div className="panel-tabs">
        <Segmented label="Section" value={tab} options={TABS as unknown as { id: Tab; label: string }[]} onChange={setTab} />
      </div>
      <div className="panel-scroll" key={tab}>
        {tab === 'body' && (
          <>
            <Section title="Shape" hint={`${SHAPES.length} bodies`}>
              <Grid k="shape" opts={SHAPES} cfg={cfg} update={update} base={bare} view="tight" />
            </Section>
            <Section title="Sculpt">
              <Slider label="Roundness" value={cfg.round} min={0} max={1} onChange={(v) => update({ round: v }, true)} />
              <Slider label="Wobble" value={cfg.wobble} min={0} max={1} onChange={(v) => update({ wobble: v }, true)} />
              <Slider label="Width" value={cfg.w} min={0.75} max={1.3} onChange={(v) => update({ w: v }, true)} format={mult} />
              <Slider label="Height" value={cfg.h} min={0.75} max={1.3} onChange={(v) => update({ h: v }, true)} format={mult} />
            </Section>
            <Section title="Finish">
              <Segmented label="Finish" value={cfg.finish} options={FINISHES} onChange={(v) => update({ finish: v })} />
            </Section>
            <Section title="Pattern">
              <Segmented label="Pattern" value={cfg.pattern} options={PATTERNS} onChange={(v) => update({ pattern: v })} />
            </Section>
          </>
        )}

        {tab === 'face' && (
          <>
            <Section title="Mood" hint={`${EXPRESSIONS.length} expressions`}>
              <Grid view="face" k="expr" opts={EXPRESSIONS} {...g} />
            </Section>
            <Section title="Eyes">
              <Grid view="face" k="eyes" opts={EYES} {...g} />
              <Slider label="Size" value={cfg.eyeSize} min={0.6} max={1.6} onChange={(v) => update({ eyeSize: v }, true)} format={mult} />
              <Slider label="Spacing" value={cfg.eyeGap} min={0.5} max={1.7} onChange={(v) => update({ eyeGap: v }, true)} format={mult} />
              <Slider label="Height" value={-cfg.eyeY} min={-30} max={30} step={1} onChange={(v) => update({ eyeY: -v }, true)} format={(v) => (v > 0 ? `+${v}` : `${v}`)} />
            </Section>
            <Section title="Mouth">
              <Grid view="face" k="mouth" opts={MOUTHS} {...g} />
              <Slider label="Size" value={cfg.mouthSize} min={0.6} max={1.8} onChange={(v) => update({ mouthSize: v }, true)} format={mult} />
            </Section>
            <Section title="Cheeks">
              <Segmented label="Cheeks" value={cfg.cheeks} options={CHEEKS} onChange={(v) => update({ cheeks: v })} />
            </Section>
          </>
        )}

        {tab === 'extras' && (
          <>
            <Section title="On top">
              <Grid view="top" k="top" opts={TOPS} {...g} />
            </Section>
            <Section title="Eyewear">
              <Grid view="face" k="eyewear" opts={EYEWEAR} {...g} />
            </Section>
            <Section title="Aura">
              <Grid k="aura" opts={AURAS} cfg={cfg} update={update} base={bare} />
            </Section>
            <Section title="Effects">
              <Toggle label="Sticker" hint="White die-cut border" checked={cfg.sticker} onChange={(v) => update({ sticker: v })} />
              <Toggle label="Ground shadow" hint="Soft shadow underneath" checked={cfg.shadow} onChange={(v) => update({ shadow: v })} />
            </Section>
          </>
        )}

        {tab === 'colour' && (
          <>
            <Section title="Body">
              <Swatches label="Body colour" value={cfg.color} colors={BODY_COLORS} onChange={(c) => update({ color: c }, true)} />
            </Section>
            <Section title="Accent" hint="Headwear, aura, details">
              <Swatches label="Accent colour" value={cfg.color2} colors={ACCENT_COLORS} onChange={(c) => update({ color2: c }, true)} />
            </Section>
            <Section title="Fill" hint={cfg.fill === 'gradient' ? 'Body fades into the accent' : undefined}>
              <Segmented label="Fill" value={cfg.fill} options={[{ id: 'solid', label: 'Solid' }, { id: 'gradient', label: 'Gradient' }]} onChange={(v) => update({ fill: v })} />
            </Section>
            <Section title="Face ink">
              <Swatches
                label="Face colour"
                value={cfg.ink}
                colors={[INK_DARK, '#FFFFFF', mix(cfg.color, '#000000', 0.6)]}
                onChange={(c) => update({ ink: c }, true)}
                extra={
                  <button type="button" role="radio" aria-checked={cfg.ink === 'auto'} className="chip" onClick={() => update({ ink: 'auto' })}>
                    Auto
                  </button>
                }
              />
            </Section>
            <Section title="Backdrop">
              <Swatches
                label="Backdrop"
                value={cfg.bg}
                colors={BG_SOLIDS}
                onChange={(c) => update({ bg: c }, true)}
                extra={
                  <>
                    <button type="button" role="radio" aria-checked={cfg.bg === 'none'} aria-label="Transparent" title="Transparent" className="sw sw-none" onClick={() => update({ bg: 'none' })} />
                    <button type="button" role="radio" aria-checked={cfg.bg === 'tint'} aria-label="Match body" title="Match body" className="sw" style={{ ['--c' as string]: mix(cfg.color, '#FFFFFF', 0.8) } as CSSProperties} onClick={() => update({ bg: 'tint' })} />
                    {Object.entries(GRADIENTS).map(([id, gr]) => (
                      <button key={id} type="button" role="radio" aria-checked={cfg.bg === `g:${id}`} aria-label={gr.label} title={gr.label} className="sw" style={{ ['--c' as string]: `linear-gradient(160deg, ${gr.stops.join(',')})` } as CSSProperties} onClick={() => update({ bg: `g:${id}` })} />
                    ))}
                  </>
                }
              />
            </Section>
          </>
        )}
      </div>
    </aside>
  )
}
