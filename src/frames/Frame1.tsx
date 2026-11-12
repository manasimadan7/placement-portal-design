import { useRef } from 'react'
import HeroFactory from '../hero/HeroFactory'
import { asset, Chapter, Crop, Pic, Pill, S, T } from '../ui'
import { useScrollZoom } from '../useScrollZoom'

const f = (n: string) => asset(`f1/${n}`)
const HERO_H = 1000 // the Figma hero band, now its own section (HeroFactory)

/** MacBook Pro 16" – 1 · Hero, problem statement, the three counterparts */
export default function Frame1() {
  const frame = useRef<HTMLElement>(null)
  // Section 2: screenshots zoom in around the problem statement as you scroll through it
  // (band is relative to this section, which starts at Figma y = 1000; item centres stay in Figma px)
  useScrollZoom(frame, { top: 0, bottom: 1000, centerX: 864, centerY: 1520 })

  return (
    <>
    <HeroFactory />
    <section ref={frame} className="frame" style={{ height: 2967 - HERO_H }} data-node-id="245:3200" aria-label="The problem and its three counterparts">
    <div className="shift" data-noreveal style={{ top: -HERO_H, height: 2967 }}>
      {/* pastel wash, continuing from the hero */}
      <div className="page-glow" data-noreveal aria-hidden="true" style={{ top: HERO_H - 200 }} />
      <Chapter t={1300} name="The problem" />
      <Chapter t={2150} name="Counterparts" />

      {/* Problem statement */}
      <T l={441} t={1472} w={846} h={123} s={32} c="var(--n700)" tr={-0.3} center>
        <p>IITs have one of the largest placement drives in India</p>
        <p>
          and yet our <S wt={500}>placement portal is sub optimal </S>and a hindrance in productivity of both
          students and the team that organizes the drive.
        </p>
      </T>

      <T l={152} t={2231} w={290} s={24} c="var(--n700)" tr={-0.3} pw>
        <p>
          There are <S wt={500}>3 Counter Parts </S>
        </p>
        <p>of the well oiled engine that is the placement drive</p>
      </T>
      <T l={152} t={2375} w={280} c="var(--n700)" tr={-0.3}>
        I have Conducted through user research on the involved parties to construct the redesign
      </T>

      {/* Old portal screenshots collage */}
      <Pic zoom l={88} t={1170} w={382} h={183} r={7} shadow src={f('shot-163114.png')} alt="Current placement portal" />
      <Pic zoom l={1097} t={1045} w={602} h={323} r={7} shadow src={f('shot-183046.png')} alt="Current portal dashboard" />
      <Crop zoom l={172} t={1595} w={164} h={50} r={8} blur={2} src={f('shot-184657.png')} img={[193.22, 329.09, -57.88, -147.27]} />
      <Pic zoom l={236} t={1714} w={411} h={203} r={7} shadow blur={6} src={f('shot-184941.png')} />
      <Pic zoom l={849} t={1692} w={183} h={150} r={7} blur={2} src={f('shot-185053.png')} />
      <Pic zoom l={590} t={1271} w={305.088} h={110} r={7} shadow blur={5} src={f('shot-185114.png')} />
      <Crop zoom l={1177} t={1752} w={351} h={179} r={7} shadow src={f('shot-152551.png')} img={[107.76, 113.02, 0, -12.97]} />
      <Crop zoom l={1353} t={1511} w={274} h={167} r={7} shadow blur={2} src={f('shot-162051.png')} img={[119.12, 107.92, -5.15, -5.46]} />

      {/* 3 · Hiring Manager */}
      <div className="a clip" style={{ left: 1203, top: 2201, width: 375, height: 599, borderRadius: 30, background: 'rgba(153,174,218,0.15)' }}>
        <div className="a" style={{ left: -122, top: 97, width: 593, height: 593 }}>
          <img className="vec" src={f('startup.svg')} alt="" />
        </div>
        <Pill l={39} t={507} w={298} h={58} bg="#999eda" shade="#5f5aa2" label="Hiring Manager" href="#/hiring-manager" />
        <T l={14} t={19} s={196} c="#fff" nw style={{ opacity: 0.6 }}>3</T>
      </div>

      {/* 1 · Student */}
      <div className="a clip" style={{ left: 540, top: 2206, width: 598, height: 270, borderRadius: 30, background: 'rgba(187,219,227,0.21)' }}>
        <T l={23} t={19} s={196} c="#fff" nw style={{ opacity: 0.6 }}>1</T>
        <div className="a" style={{ left: 31, top: -5, width: 437, height: 437 }}>
          <img className="vec" src={f('work-from-home.svg')} alt="" />
        </div>
        <Pill l={377} t={174} w={183} h={58} bg="#85bfce" shade="#0887a0" label="Student" href="#/student" />
      </div>

      {/* 2 · Placement Team */}
      <div className="a clip" style={{ left: 154, top: 2531, width: 984, height: 270, borderRadius: 30, background: 'rgba(218,172,255,0.22)' }}>
        <T l={12} t={13} s={196} c="#fff" nw style={{ opacity: 0.6 }}>2</T>
        <div className="a" style={{ left: 106, top: -217, width: 630, height: 630 }}>
          <img className="vec" src={f('team-brainstorming.svg')} alt="" />
        </div>
        <Pill l={696} t={176} w={247} h={58} bg="#9d84d4" shade="#8a38f5" label="Placement Team" href="#/placement-team" />
      </div>
    </div>
    </section>
    </>
  )
}
