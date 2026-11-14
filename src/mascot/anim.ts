// All motion is plain CSS keyframes on SVG groups, so the exact same rules
// drive the live preview, the exported animated SVG, and — by pausing the
// clock at `--t` — every frame of the exported video.
//
// --L  loop length          --t  paused clock position (export only)
// --d  per-element stagger  --ps play state
//
// The rig, outermost first:
//   m-root    travel (jumps, drifting)
//   m-lean    rotation of the whole character
//   m-squash  squash & stretch, pinned to the ground
//   m-top     headwear — always a beat behind the body (follow-through)
//   m-face    eyes/mouth — leads or lags the body (overlapping action)
// Layers move on different clocks and with different easings; nothing here is
// a single sine wave applied to the whole mascot.

const OUT = 'cubic-bezier(.22,1,.36,1)' // fast start, long settle
const IN = 'cubic-bezier(.6,0,.9,.45)' // gravity / wind-up
const INOUT = 'cubic-bezier(.65,0,.35,1)'
const SOFT = 'cubic-bezier(.45,0,.55,1)'
const SNAP = 'cubic-bezier(.3,0,.1,1)' // saccades, impacts

export const LOOP_SECONDS = 4

const tf = (fn: string) => `animation-timing-function:${fn}`
const FOOT = 'transform-origin:0 108px'

export const ANIM_CSS = `
.m-sticker *{fill:#fff!important;stroke:#fff!important;stroke-width:15px!important;stroke-linejoin:round!important;stroke-linecap:round!important;opacity:1!important}
/* blink: lids drop fast, open slower; one single and one double per loop */
.bl-anim .m-blink{animation:bl-blink var(--L) infinite}
@keyframes bl-blink{
0%,23%{transform:scaleY(1);${tf(IN)}}
24.6%{transform:scaleY(.05);${tf(OUT)}}
28.5%,66%{transform:scaleY(1);${tf(IN)}}
67.6%{transform:scaleY(.05);${tf(OUT)}}
70.4%{transform:scaleY(.9);${tf(IN)}}
71.8%{transform:scaleY(.05);${tf(OUT)}}
76%,100%{transform:scaleY(1)}}

.bl-anim .m-tw{animation:bl-tw calc(var(--L)/2) infinite}
@keyframes bl-tw{0%,100%{transform:scale(.3) rotate(-20deg);opacity:.2;${tf(OUT)}}35%{transform:scale(1) rotate(0);opacity:1;${tf(SOFT)}}}
.bl-anim .m-rise{animation:bl-rise calc(var(--L)/2) infinite}
@keyframes bl-rise{0%{transform:translate(0,16px) scale(.5);opacity:0;${tf(OUT)}}25%{transform:translate(-3px,4px) scale(1);opacity:1;${tf('linear')}}60%{transform:translate(3px,-16px) scale(1);opacity:.9}100%{transform:translate(-2px,-38px) scale(.9);opacity:0}}
.bl-anim .m-orbit{animation:bl-rock var(--L) ${SOFT} infinite}
@keyframes bl-rock{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}

/* idle — breath, a slow weight shift, headwear sway and one glance, all on different clocks */
.a-idle .m-squash{animation:bl-breathe calc(var(--L)/2) infinite;${FOOT}}
.a-idle .m-lean{animation:bl-shift var(--L) ${SOFT} infinite;${FOOT}}
.a-idle .m-top{animation:bl-sway calc(var(--L)/2) ${SOFT} infinite;--d:calc(var(--L)*-.31)}
.a-idle .m-face{animation:bl-glance var(--L) infinite}
@keyframes bl-breathe{0%,100%{transform:scale(1.012,.988);${tf(SOFT)}}42%{transform:scale(.986,1.02);${tf(SOFT)}}}
@keyframes bl-shift{0%,100%{transform:rotate(-1.1deg)}50%{transform:rotate(1.1deg)}}
@keyframes bl-sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@keyframes bl-glance{0%,50%{transform:translate(0,0);${tf(SNAP)}}54%,66%{transform:translate(6px,-2px);${tf(SNAP)}}71%,100%{transform:translate(0,0)}}

/* float — bob and tilt run at different rates so the drift never repeats exactly on the beat */
.a-float .m-root{animation:bl-float calc(var(--L)/2) ${SOFT} infinite}
.a-float .m-lean{animation:bl-tilt var(--L) ${SOFT} infinite}
.a-float .m-squash{animation:bl-float-q calc(var(--L)/2) ${SOFT} infinite;--d:calc(var(--L)*-.06);${FOOT}}
.a-float .m-top{animation:bl-sway calc(var(--L)/2) ${SOFT} infinite;--d:calc(var(--L)*-.4)}
.a-float .m-shadow{animation:bl-float-s calc(var(--L)/2) ${SOFT} infinite;transform-origin:0 122px}
@keyframes bl-float{0%,100%{transform:translateY(5px)}50%{transform:translateY(-13px)}}
@keyframes bl-tilt{0%,100%{transform:rotate(-2.4deg)}50%{transform:rotate(2.4deg)}}
@keyframes bl-float-q{0%,100%{transform:scale(1.015,.985)}50%{transform:scale(.988,1.014)}}
@keyframes bl-float-s{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.78);opacity:.55}}

/* bounce — crouch, launch, hang, fall, impact. Headwear and face trail the body. */
.a-bounce .m-root{animation:bl-jump calc(var(--L)/3) infinite}
.a-bounce .m-squash{animation:bl-jump-q calc(var(--L)/3) infinite;${FOOT}}
.a-bounce .m-top{animation:bl-jump-top calc(var(--L)/3) infinite}
.a-bounce .m-face{animation:bl-jump-face calc(var(--L)/3) infinite}
.a-bounce .m-shadow{animation:bl-jump-s calc(var(--L)/3) infinite;transform-origin:0 122px}
@keyframes bl-jump{0%,13%{transform:translateY(0);${tf('cubic-bezier(.15,.75,.3,1)')}}52%{transform:translateY(-60px);${tf(IN)}}86%,100%{transform:translateY(0)}}
@keyframes bl-jump-q{
0%{transform:scale(1.08,.92);${tf(SOFT)}}
9%{transform:scale(1.17,.84);${tf(SNAP)}}
19%{transform:scale(.9,1.13);${tf(SOFT)}}
52%{transform:scale(1.02,.985);${tf(SOFT)}}
82%{transform:scale(.93,1.09);${tf(SNAP)}}
88%{transform:scale(1.21,.8);${tf(OUT)}}
95%{transform:scale(.98,1.03);${tf(SOFT)}}
100%{transform:scale(1.08,.92)}}
@keyframes bl-jump-top{
0%{transform:translateY(2px) rotate(0);${tf(SOFT)}}
20%{transform:translateY(7px) rotate(-5deg);${tf(SOFT)}}
56%{transform:translateY(-5px) rotate(4deg);${tf(SOFT)}}
85%{transform:translateY(-7px) rotate(2deg);${tf(SNAP)}}
92%{transform:translateY(8px) rotate(-4deg);${tf(OUT)}}
100%{transform:translateY(2px) rotate(0)}}
@keyframes bl-jump-face{0%{transform:translateY(2px);${tf(SOFT)}}20%{transform:translateY(6px);${tf(SOFT)}}55%{transform:translateY(-4px);${tf(SOFT)}}84%{transform:translateY(-3px);${tf(SNAP)}}91%{transform:translateY(7px);${tf(OUT)}}100%{transform:translateY(2px)}}
@keyframes bl-jump-s{0%,13%{transform:scale(1.1);opacity:1;${tf('cubic-bezier(.15,.75,.3,1)')}}52%{transform:scale(.55);opacity:.4;${tf(IN)}}86%,100%{transform:scale(1.1);opacity:1}}

/* wiggle — the face leads the turn, the body follows, the headwear arrives last */
.a-wiggle .m-lean{animation:bl-wig calc(var(--L)/4) ${INOUT} infinite;${FOOT}}
.a-wiggle .m-squash{animation:bl-wig-q calc(var(--L)/4) ${INOUT} infinite;${FOOT}}
.a-wiggle .m-face{animation:bl-wig-face calc(var(--L)/4) ${INOUT} infinite;--d:calc(var(--L)/4*-.1)}
.a-wiggle .m-top{animation:bl-wig-top calc(var(--L)/4) ${INOUT} infinite;--d:calc(var(--L)/4*-.86)}
@keyframes bl-wig{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}
@keyframes bl-wig-q{0%,50%,100%{transform:scale(1.035,.965)}25%,75%{transform:scale(.985,1.02)}}
@keyframes bl-wig-face{0%,100%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
@keyframes bl-wig-top{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}

/* jelly — one hit, then a decaying ring-out and a real rest */
.a-jelly .m-squash{animation:bl-jelly calc(var(--L)/2) infinite;${FOOT}}
.a-jelly .m-face{animation:bl-jelly-face calc(var(--L)/2) infinite;--d:calc(var(--L)/2*-.97)}
.a-jelly .m-top{animation:bl-jelly-top calc(var(--L)/2) infinite;--d:calc(var(--L)/2*-.95)}
@keyframes bl-jelly{
0%{transform:scale(1,1);${tf(SNAP)}}
7%{transform:scale(1.23,.79);${tf(SOFT)}}
18%{transform:scale(.86,1.17);${tf(SOFT)}}
29%{transform:scale(1.11,.9);${tf(SOFT)}}
40%{transform:scale(.94,1.06);${tf(SOFT)}}
51%{transform:scale(1.035,.968);${tf(SOFT)}}
62%{transform:scale(.985,1.014);${tf(SOFT)}}
72%,100%{transform:scale(1,1)}}
@keyframes bl-jelly-face{0%{transform:translateY(0);${tf(SNAP)}}7%{transform:translateY(8px);${tf(SOFT)}}18%{transform:translateY(-6px);${tf(SOFT)}}29%{transform:translateY(4px);${tf(SOFT)}}40%{transform:translateY(-2px);${tf(SOFT)}}52%,100%{transform:translateY(0)}}
@keyframes bl-jelly-top{0%{transform:rotate(0) translateY(0);${tf(SNAP)}}7%{transform:rotate(-7deg) translateY(6px);${tf(SOFT)}}18%{transform:rotate(8deg) translateY(-5px);${tf(SOFT)}}29%{transform:rotate(-5deg) translateY(3px);${tf(SOFT)}}40%{transform:rotate(3deg) translateY(-1px);${tf(SOFT)}}51%{transform:rotate(-1.5deg);${tf(SOFT)}}64%,100%{transform:rotate(0) translateY(0)}}

/* spin — wind up the wrong way, whip round, overshoot, settle */
.a-spin .m-lean{animation:bl-spin calc(var(--L)/2) infinite}
.a-spin .m-root{animation:bl-spin-hop calc(var(--L)/2) infinite}
.a-spin .m-squash{animation:bl-spin-q calc(var(--L)/2) infinite;${FOOT}}
.a-spin .m-top{animation:bl-spin-top calc(var(--L)/2) infinite}
.a-spin .m-shadow{animation:bl-spin-s calc(var(--L)/2) infinite;transform-origin:0 122px}
@keyframes bl-spin{0%{transform:rotate(0);${tf(SOFT)}}15%{transform:rotate(-26deg);${tf('cubic-bezier(.55,0,.15,1)')}}60%{transform:rotate(374deg);${tf(SOFT)}}72%{transform:rotate(356deg);${tf(SOFT)}}82%,100%{transform:rotate(360deg)}}
@keyframes bl-spin-hop{0%,15%{transform:translateY(0);${tf(OUT)}}38%{transform:translateY(-26px);${tf(IN)}}60%,100%{transform:translateY(0)}}
@keyframes bl-spin-q{0%{transform:scale(1,1);${tf(SOFT)}}15%{transform:scale(1.12,.89);${tf(SNAP)}}28%{transform:scale(.94,1.07);${tf(SOFT)}}56%{transform:scale(1,1);${tf(SNAP)}}63%{transform:scale(1.1,.91);${tf(OUT)}}74%{transform:scale(.985,1.015);${tf(SOFT)}}84%,100%{transform:scale(1,1)}}
@keyframes bl-spin-top{0%{transform:rotate(0);${tf(SOFT)}}15%{transform:rotate(8deg);${tf(SOFT)}}40%{transform:rotate(-10deg);${tf(SOFT)}}62%{transform:rotate(9deg);${tf(SOFT)}}74%{transform:rotate(-5deg);${tf(SOFT)}}86%,100%{transform:rotate(0)}}
@keyframes bl-spin-s{0%,15%{transform:scale(1);opacity:1;${tf(OUT)}}38%{transform:scale(.75);opacity:.6;${tf(IN)}}60%,100%{transform:scale(1);opacity:1}}

/* nod — a small lift first, two dips (the second smaller), then stillness */
.a-nod .m-face{animation:bl-nod calc(var(--L)/2) infinite}
.a-nod .m-squash{animation:bl-nod-q calc(var(--L)/2) infinite;${FOOT}}
.a-nod .m-top{animation:bl-nod-top calc(var(--L)/2) infinite;--d:calc(var(--L)/2*-.96)}
@keyframes bl-nod{0%{transform:translateY(0);${tf(SOFT)}}9%{transform:translateY(-4px);${tf(SNAP)}}22%{transform:translateY(12px);${tf(SOFT)}}36%{transform:translateY(-2px);${tf(SNAP)}}48%{transform:translateY(8px);${tf(OUT)}}66%,100%{transform:translateY(0)}}
@keyframes bl-nod-q{0%{transform:scale(1,1);${tf(SOFT)}}9%{transform:scale(.99,1.012);${tf(SNAP)}}22%{transform:scale(1.035,.962);${tf(SOFT)}}36%{transform:scale(.995,1.006);${tf(SNAP)}}48%{transform:scale(1.022,.976);${tf(OUT)}}66%,100%{transform:scale(1,1)}}
@keyframes bl-nod-top{0%{transform:translateY(0) rotate(0);${tf(SOFT)}}9%{transform:translateY(-2px) rotate(-2deg);${tf(SNAP)}}22%{transform:translateY(6px) rotate(5deg);${tf(SOFT)}}36%{transform:translateY(-2px) rotate(-3deg);${tf(SNAP)}}48%{transform:translateY(4px) rotate(3deg);${tf(OUT)}}70%,100%{transform:translateY(0) rotate(0)}}

/* nope — a decaying head shake; the body twists against it */
.a-shake .m-face{animation:bl-nope calc(var(--L)/2) infinite}
.a-shake .m-lean{animation:bl-nope-lean calc(var(--L)/2) infinite;${FOOT}}
.a-shake .m-top{animation:bl-nope-top calc(var(--L)/2) infinite;--d:calc(var(--L)/2*-.955)}
@keyframes bl-nope{0%{transform:translateX(0);${tf(SOFT)}}6%{transform:translateX(4px);${tf(SNAP)}}17%{transform:translateX(-14px);${tf(INOUT)}}30%{transform:translateX(13px);${tf(INOUT)}}43%{transform:translateX(-9px);${tf(INOUT)}}55%{transform:translateX(5px);${tf(SOFT)}}66%{transform:translateX(-1.5px);${tf(SOFT)}}75%,100%{transform:translateX(0)}}
@keyframes bl-nope-lean{0%,6%{transform:rotate(0);${tf(SNAP)}}17%{transform:rotate(2.6deg);${tf(INOUT)}}30%{transform:rotate(-2.4deg);${tf(INOUT)}}43%{transform:rotate(1.6deg);${tf(INOUT)}}55%{transform:rotate(-.8deg);${tf(SOFT)}}70%,100%{transform:rotate(0)}}
@keyframes bl-nope-top{0%,6%{transform:rotate(0);${tf(SNAP)}}17%{transform:rotate(-9deg);${tf(INOUT)}}30%{transform:rotate(9deg);${tf(INOUT)}}43%{transform:rotate(-6deg);${tf(INOUT)}}55%{transform:rotate(3.5deg);${tf(SOFT)}}66%{transform:rotate(-1.5deg);${tf(SOFT)}}78%,100%{transform:rotate(0)}}

/* look — eyes jump and hold like real saccades, with a blink on each jump; the body leans in late */
.a-look .m-face{animation:bl-look var(--L) infinite}
.a-look .m-lean{animation:bl-look-lean var(--L) infinite;${FOOT}}
.a-look .m-blink{animation:bl-look-blink var(--L) infinite}
@keyframes bl-look{0%,9%{transform:translate(0,0);${tf(SNAP)}}13.5%,38%{transform:translate(-16px,-2px);${tf(SNAP)}}43.5%,66%{transform:translate(15px,-5px);${tf(SNAP)}}70%,84%{transform:translate(9px,7px);${tf(SNAP)}}89%,100%{transform:translate(0,0)}}
@keyframes bl-look-lean{0%,10%{transform:rotate(0);${tf(SOFT)}}22%,38%{transform:rotate(-2.6deg);${tf(SOFT)}}54%,84%{transform:rotate(2.4deg);${tf(SOFT)}}97%,100%{transform:rotate(0)}}
@keyframes bl-look-blink{
0%,8.6%{transform:scaleY(1);${tf(IN)}}10.2%{transform:scaleY(.05);${tf(OUT)}}14%,38%{transform:scaleY(1);${tf(IN)}}
39.8%{transform:scaleY(.05);${tf(OUT)}}44%,84%{transform:scaleY(1);${tf(IN)}}
85.8%{transform:scaleY(.05);${tf(OUT)}}90%,100%{transform:scaleY(1)}}

/* pulse — lub-dub: sharp attack, quick release, a pause between beats */
.a-pulse .m-root{animation:bl-pulse calc(var(--L)/4) infinite;transform-origin:0 10px}
.a-pulse .m-top{animation:bl-pulse-top calc(var(--L)/4) infinite;--d:calc(var(--L)/4*-.93)}
@keyframes bl-pulse{0%{transform:scale(1);${tf(OUT)}}11%{transform:scale(1.1);${tf(SOFT)}}22%{transform:scale(.99);${tf(OUT)}}32%{transform:scale(1.055);${tf(SOFT)}}50%,100%{transform:scale(1)}}
@keyframes bl-pulse-top{0%{transform:translateY(0);${tf(OUT)}}11%{transform:translateY(-4px);${tf(SOFT)}}22%{transform:translateY(2px);${tf(OUT)}}32%{transform:translateY(-2px);${tf(SOFT)}}52%,100%{transform:translateY(0)}}

/* talk — uneven syllables, a breath pause, and a head bob on the stressed ones */
.a-talk .m-mouth{animation:bl-talk calc(var(--L)/2) infinite}
.a-talk .m-face{animation:bl-talk-bob calc(var(--L)/2) infinite}
.a-talk .m-squash{animation:bl-breathe calc(var(--L)/2) infinite;${FOOT}}
.a-talk .m-top{animation:bl-sway calc(var(--L)/2) ${SOFT} infinite;--d:calc(var(--L)*-.31)}
@keyframes bl-talk{
0%{transform:scale(1,1);${tf(OUT)}}6%{transform:scale(.82,2.1);${tf(SOFT)}}13%{transform:scale(1.06,.55);${tf(OUT)}}
19%{transform:scale(.9,1.5);${tf(SOFT)}}25%{transform:scale(1.1,.7);${tf(OUT)}}32%{transform:scale(.78,2.3);${tf(SOFT)}}
42%{transform:scale(1.04,.6);${tf(OUT)}}47%{transform:scale(.92,1.3);${tf(SOFT)}}53%,64%{transform:scale(1,1);${tf(OUT)}}
70%{transform:scale(.85,1.9);${tf(SOFT)}}77%{transform:scale(1.08,.6);${tf(OUT)}}84%{transform:scale(.88,1.6);${tf(SOFT)}}93%,100%{transform:scale(1,1)}}
@keyframes bl-talk-bob{0%{transform:translateY(0);${tf(OUT)}}6%{transform:translateY(-2.5px);${tf(SOFT)}}19%{transform:translateY(.5px);${tf(OUT)}}32%{transform:translateY(-3.5px);${tf(SOFT)}}53%,64%{transform:translateY(1px);${tf(OUT)}}70%{transform:translateY(-2.5px);${tf(SOFT)}}93%,100%{transform:translateY(0)}}

/* sleep — long inhale, held, slow sigh; the head droops then jerks back up */
.a-sleep .m-squash{animation:bl-sleep var(--L) infinite;${FOOT}}
.a-sleep .m-lean{animation:bl-droop var(--L) infinite;${FOOT}}
.a-sleep .m-face{animation:bl-droop-face var(--L) infinite}
.a-sleep .m-top{animation:bl-droop-top var(--L) infinite}
.a-sleep .m-blink{animation:none;transform:scaleY(.07)}
.a-sleep .m-z{animation:bl-z var(--L) linear infinite}
@keyframes bl-sleep{0%{transform:scale(1.02,.975);${tf(SOFT)}}38%{transform:scale(.985,1.035);${tf(SOFT)}}48%{transform:scale(.987,1.032);${tf('cubic-bezier(.3,0,.4,1)')}}100%{transform:scale(1.02,.975)}}
@keyframes bl-droop{0%{transform:rotate(2deg);${tf('cubic-bezier(.4,0,.8,.6)')}}72%{transform:rotate(7deg);${tf(OUT)}}80%{transform:rotate(.5deg);${tf(SOFT)}}100%{transform:rotate(2deg)}}
@keyframes bl-droop-face{0%{transform:translateY(1px);${tf('cubic-bezier(.4,0,.8,.6)')}}72%{transform:translateY(7px);${tf(OUT)}}80%{transform:translateY(-2px);${tf(SOFT)}}100%{transform:translateY(1px)}}
@keyframes bl-droop-top{0%{transform:rotate(2deg);${tf(SOFT)}}72%{transform:rotate(6deg);${tf(OUT)}}83%{transform:rotate(-7deg);${tf(SOFT)}}93%{transform:rotate(4deg);${tf(SOFT)}}100%{transform:rotate(2deg)}}
@keyframes bl-z{0%{transform:translate(0,0) scale(.35) rotate(-12deg);opacity:0}12%{opacity:1}35%{transform:translate(14px,-20px) scale(.7) rotate(8deg)}65%{transform:translate(12px,-42px) scale(.95) rotate(-6deg);opacity:1}100%{transform:translate(28px,-64px) scale(1.15) rotate(10deg);opacity:0}}

.bl-anim [class^="m-"]{animation-delay:calc(var(--d,0s) - var(--t,0s))!important;animation-play-state:var(--ps,running)!important}
`.trim()
