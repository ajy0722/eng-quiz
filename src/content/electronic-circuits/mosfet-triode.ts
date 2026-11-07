import type { FormulaContent, NumericGeneratorSpec } from '../../types/content'
import type { RealAnswer } from '../../types/answer'

interface MosfetTriodeParams {
  kn: number
  wl: number
  vth: number
  vgs: number
  vds: number
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

const MICRO = 1e-6

function real(valueInMicroAmps: number): RealAnswer {
  return { type: 'real', value: valueInMicroAmps * MICRO, unit: 'A', relTolerance: 0.02 }
}

const numericGenerator: NumericGeneratorSpec<MosfetTriodeParams> = {
  randomParams: () => {
    const vth = round(randomInRange(0.3, 1.2), 2)
    const vgs = round(vth + randomInRange(0.5, 3), 2)
    const vov = vgs - vth
    const vds = round(vov * randomInRange(0.1, 0.9), 2)
    const kn = round(randomInRange(50, 500), 0)
    const wl = round(randomInRange(1, 50), 1)
    return { kn, wl, vth, vgs, vds }
  },

  isValid: (p) => p.vgs > p.vth && p.vds > 0 && p.vds < p.vgs - p.vth && p.kn > 0 && p.wl > 0,

  correct: (p) => real(p.kn * p.wl * ((p.vgs - p.vth) * p.vds - (p.vds * p.vds) / 2)),

  mistakes: [
    (p) => real(p.kn * p.wl * ((p.vgs - p.vth) * p.vds - p.vds * p.vds)),
    (p) => real(p.kn * p.wl * ((p.vgs - p.vth) * p.vds - p.vds / 2)),
    (p) => real(0.5 * p.kn * p.wl * (p.vgs - p.vth) * (p.vgs - p.vth)),
  ],

  prompt: (p) =>
    `NMOS 트랜지스터가 트라이오드(선형) 영역에서 동작하고 있다. ` +
    `$k_n' = \\mu_n C_{ox} = ${p.kn}\\ \\mu A/V^2$, $W/L = ${p.wl}$, ` +
    `$V_{th} = ${p.vth}\\ V$, $V_{GS} = ${p.vgs}\\ V$, $V_{DS} = ${p.vds}\\ V$ 일 때, ` +
    `드레인 전류 $I_D$는?`,

  explanation: (p) => {
    const vov = round(p.vgs - p.vth, 2)
    const id = p.kn * p.wl * ((p.vgs - p.vth) * p.vds - (p.vds * p.vds) / 2)
    return (
      `트라이오드 조건 확인: $V_{DS}(${p.vds}V) < V_{GS}-V_{th}(${vov}V)$ 만족.\n` +
      `$I_D = k_n'(W/L)[(V_{GS}-V_{th})V_{DS} - V_{DS}^2/2]$\n` +
      `$= ${p.kn} \\times ${p.wl} \\times [(${p.vgs}-${p.vth}) \\times ${p.vds} - ${p.vds}^2/2]$\n` +
      `$\\approx ${id.toFixed(1)}\\ \\mu A$`
    )
  },
}

const formula: FormulaContent = {
  id: 'mosfet-triode-current',
  subjectId: 'electronic-circuits',
  chapterId: 'ch6',
  name: 'MOSFET 트라이오드 영역 드레인 전류',
  latex: 'I_D = \\mu_n C_{ox}\\frac{W}{L}\\left[(V_{GS}-V_{th})V_{DS} - \\frac{V_{DS}^2}{2}\\right]',
  conditions: [
    '핀치오프 전 트라이오드(선형) 영역: 0 < V_DS < V_GS - V_th',
    'V_GS > V_th (채널이 형성되어 소자가 켜진 상태)',
    '장채널 근사 — 채널 길이 변조 등 2차 효과는 무시',
  ],
  conceptQuestions: [
    {
      id: 'c1',
      prompt:
        '다음 중 NMOS가 트라이오드(선형) 영역에서 동작하기 위한 조건으로 올바른 것은? (단, $V_{GS} > V_{th}$)',
      choices: [
        { id: 'a', label: '$V_{DS} < V_{GS} - V_{th}$', correct: true },
        { id: 'b', label: '$V_{DS} > V_{GS} - V_{th}$', correct: false },
        { id: 'c', label: '$V_{DS} = 0$', correct: false },
        { id: 'd', label: '$V_{GS} < V_{th}$', correct: false },
      ],
      explanation:
        '트라이오드 영역은 채널이 핀치오프 되기 전 상태다. 드레인 쪽 채널이 끊기지 않으려면 V_DS가 과잉전압(V_GS-V_th)보다 작아야 한다. 더 커지면 포화 영역, V_GS<V_th이면 컷오프다.',
    },
    {
      id: 'c2',
      prompt: '트라이오드 영역의 드레인 전류 식으로 올바른 것은?',
      choices: [
        {
          id: 'a',
          label: "$I_D = k_n'\\frac{W}{L}\\left[(V_{GS}-V_{th})V_{DS} - \\frac{V_{DS}^2}{2}\\right]$",
          correct: true,
        },
        { id: 'b', label: "$I_D = k_n'\\frac{W}{L}\\left[(V_{GS}-V_{th})V_{DS} - V_{DS}^2\\right]$", correct: false },
        { id: 'c', label: "$I_D = k_n'\\frac{W}{L}\\left[(V_{GS}-V_{th})V_{DS} - \\frac{V_{DS}}{2}\\right]$", correct: false },
        { id: 'd', label: "$I_D = \\frac{1}{2}k_n'\\frac{W}{L}(V_{GS}-V_{th})^2$", correct: false },
      ],
      explanation:
        '채널을 따라 전하와 전계를 0~V_DS 구간에서 적분하면 (V_GS-V_th)V_DS 항과 V_DS²/2 항이 모두 나온다. 1/2을 빠뜨리거나(b) 제곱항을 1차항으로 쓰면(c) 틀리고, d는 포화 영역 식이다.',
    },
    {
      id: 'c3',
      prompt: 'V_DS가 매우 작을 때($V_{DS} \\ll V_{GS}-V_{th}$), MOSFET은 어떤 소자처럼 동작하는가?',
      choices: [
        { id: 'a', label: '선형 저항 ($I_D \\propto V_{DS}$)', correct: true },
        { id: 'b', label: '정전류원', correct: false },
        { id: 'c', label: '다이오드', correct: false },
        { id: 'd', label: '커패시터', correct: false },
      ],
      explanation:
        'V_DS²/2 항이 매우 작아져 I_D ≈ k_n\'(W/L)(V_GS-V_th)V_DS 로 근사되므로 V_DS에 선형 비례한다. 이 영역에서 MOSFET은 V_GS로 제어되는 가변 저항처럼 동작한다.',
    },
    {
      id: 'c4',
      prompt: '트라이오드 영역에서의 온-저항 $R_{on}$ 식으로 올바른 것은?',
      choices: [
        { id: 'a', label: "$R_{on} = \\dfrac{1}{k_n'(W/L)(V_{GS}-V_{th})}$", correct: true },
        { id: 'b', label: "$R_{on} = k_n'(W/L)(V_{GS}-V_{th})$", correct: false },
        { id: 'c', label: "$R_{on} = \\dfrac{1}{k_n'(W/L)(V_{GS}-V_{th})^2}$", correct: false },
        { id: 'd', label: "$R_{on} = \\dfrac{2}{k_n'(W/L)(V_{GS}-V_{th})}$", correct: false },
      ],
      explanation:
        "V_DS가 작을 때 I_D ≈ k_n'(W/L)(V_GS-V_th)V_DS 이므로 R_on = V_DS/I_D = 1/[k_n'(W/L)(V_GS-V_th)] 이다.",
    },
    {
      id: 'c5',
      prompt: 'W/L 비율을 2배로 늘리면 $R_{on}$은 어떻게 변하는가? (다른 조건 동일)',
      choices: [
        { id: 'a', label: '1/2로 감소', correct: true },
        { id: 'b', label: '2배로 증가', correct: false },
        { id: 'c', label: '변화 없음', correct: false },
        { id: 'd', label: '4배로 증가', correct: false },
      ],
      explanation: "R_on = 1/[k_n'(W/L)(V_GS-V_th)] 이므로 R_on은 W/L에 반비례한다. W/L이 2배가 되면 R_on은 1/2이 된다.",
    },
    {
      id: 'c6',
      prompt: '$V_{DS} = V_{GS}-V_{th}$를 트라이오드 식에 대입하면 어떤 식이 되는가?',
      choices: [
        { id: 'a', label: "$I_D = \\dfrac{1}{2}k_n'\\dfrac{W}{L}(V_{GS}-V_{th})^2$", correct: true },
        { id: 'b', label: "$I_D = k_n'\\dfrac{W}{L}(V_{GS}-V_{th})^2$", correct: false },
        { id: 'c', label: "$I_D = k_n'\\dfrac{W}{L}(V_{GS}-V_{th})$", correct: false },
        { id: 'd', label: '$I_D = 0$', correct: false },
      ],
      explanation:
        'V_DS=V_GS-V_th 대입: I_D = k_n\'(W/L)[(V_GS-V_th)² - (V_GS-V_th)²/2] = (1/2)k_n\'(W/L)(V_GS-V_th)². 트라이오드-포화 경계에서 전류가 연속임을 보여주는 포화 전류식과 일치한다.',
    },
    {
      id: 'c7',
      prompt:
        '트라이오드 영역 성립을 위해 함께 필요한 조건을 모두 고르면? ① $V_{GS}>V_{th}$ ② $V_{DS}<V_{GS}-V_{th}$ ③ $V_{DS}>0$',
      choices: [
        { id: 'a', label: '①, ②, ③ 모두 필요', correct: true },
        { id: 'b', label: '①만 필요', correct: false },
        { id: 'c', label: '②만 필요', correct: false },
        { id: 'd', label: '①, ③만 필요 (②는 불필요)', correct: false },
      ],
      explanation:
        '채널이 형성되고(①), 드레인 쪽에서 핀치오프가 일어나지 않아야(②) 하며, NMOS 기준 전류 방향을 정의하기 위해 V_DS>0(③)이어야 트라이오드 식이 성립한다.',
    },
    {
      id: 'c8',
      prompt: '$V_{GS} - V_{th}$를 보통 무엇이라 부르는가?',
      choices: [
        { id: 'a', label: '과잉전압(overdrive voltage), $V_{OV}$', correct: true },
        { id: 'b', label: '핀치오프 전압', correct: false },
        { id: 'c', label: '포화 전압', correct: false },
        { id: 'd', label: '임계전압 그 자체', correct: false },
      ],
      explanation:
        'V_OV = V_GS - V_th는 게이트가 임계전압을 얼마나 초과했는지를 나타내며 과잉전압(overdrive voltage)이라 부른다. 포화 전압은 V_DS가 V_OV와 같아지는 경계값이다.',
    },
  ],
  numericGenerator,
}

export default formula
