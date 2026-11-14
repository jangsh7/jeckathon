import { useEffect, useRef } from 'react';
import * as L from '../logic.js';
import { randomBoard } from '../state.js';
import { LEVEL_CLASS } from '../format.js';

const LAMP_NAME = { B: '볼', S: '스트라이크', O: '아웃' };

// N번째 원을 누르면 N개. 마지막으로 켜진 원을 다시 누르면 하나 줄어든다(첫 원이면 0).
function Lamps({ label, count, max, kind, onSet }) {
  const name = LAMP_NAME[label];
  return (
    <div className="s1-lamp-row" role="group" aria-label={`${name} ${count}`}>
      <span className="s1-lamp-lbl" aria-hidden="true">{label}</span>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const target = count === n ? n - 1 : n;
        return (
          <button
            key={i}
            className={`s1-lamp ${kind}${i < count ? ' on' : ''}`}
            aria-label={`${name} ${count}, 탭하면 ${target}`}
            onClick={() => onSet(target)}
          ><i /></button>
        );
      })}
    </div>
  );
}

// 보이는 버튼은 작게, 탭 영역은 ::after 로 44px 확보
function Step({ children, label, disabled, onTap, className = '' }) {
  return (
    <button className={`s1-step ${className}`} onClick={onTap} aria-label={label} disabled={disabled}>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function ScoreGroup({ name, value, onMinus, onPlus }) {
  return (
    <div className="s1-score">
      <span className="s1-team">{name}</span>
      <div className="s1-score-ctl">
        <Step className="score" label={`${name} 점수 ${value}, 빼기`} disabled={value <= 0} onTap={onMinus}>−</Step>
        <span className="s1-num">{value}</span>
        <Step className="score" label={`${name} 점수 ${value}, 더하기`} disabled={value >= L.LIMITS.score} onTap={onPlus}>+</Step>
      </div>
    </div>
  );
}

// 야구장 그림(장식) + 1·2·3루 탭 버튼. 좌표는 viewBox(200×160) 기준.
// 베이스 탭 영역(48px)이 서로 겹치지 않도록 베이스를 바깥쪽에 둔다
const BASES = [
  { n: 1, x: 162, y: 84 },
  { n: 2, x: 100, y: 26 },
  { n: 3, x: 38, y: 84 },
];

function Field({ runners, onToggle }) {
  return (
    <div className="s1-field">
      <svg viewBox="0 0 200 160" aria-hidden="true">
        <rect width="200" height="160" fill="#6aa84f" />
        <line x1="100" y1="142" x2="0" y2="42" stroke="#cfe3c2" strokeWidth="1.2" />
        <line x1="100" y1="142" x2="200" y2="42" stroke="#cfe3c2" strokeWidth="1.2" />
        <path d="M22 84 A78 78 0 0 1 178 84 L100 158 Z" fill="#e3a46f" />
        <polygon points="100,42 146,86 100,128 54,86" fill="#6aa84f" />
        <polygon points="100,26 162,84 100,142 38,84" fill="none" stroke="#f6efe6" strokeWidth="1.5" />
        <circle cx="100" cy="86" r="8" fill="#e3a46f" />
        <path d="M93 138 L107 138 L107 143 L100 149 L93 143 Z" fill="#fff" />
      </svg>
      {BASES.map(({ n, x, y }) => (
        <button
          key={n}
          className={`s1-base${runners[n - 1] ? ' on' : ''}`}
          style={{ left: `${(x / 200) * 100}%`, top: `${(y / 160) * 100}%` }}
          aria-label={`${n}루 주자 ${runners[n - 1] ? '있음' : '없음'}`}
          aria-pressed={runners[n - 1]}
          onClick={() => onToggle(n - 1)}
        ><i /></button>
      ))}
    </div>
  );
}

export default function Home({ state, dispatch }) {
  const b = state.board;
  const j = L.judge(b, state.urgency);
  const level = LEVEL_CLASS[j.level];
  const inning = L.inningLabel(b.inning);

  // 도장 애니메이션은 판정 단계가 바뀔 때만. 첫 진입·S4 복귀(마운트) 때는 없음.
  const prevLevel = useRef(null);
  const thump = prevLevel.current !== null && prevLevel.current !== j.level;
  useEffect(() => { prevLevel.current = j.level; }, [j.level]);

  return (
    <section className={`screen s1 v-${level}`}>
      <header className="s1-bar">
        <button className="s1-back" onClick={() => dispatch({ type: 'intro' })} aria-label="뒤로 가기">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1>전광판 홈</h1>
        <button className="s1-random" onClick={() => dispatch({ type: 'random', board: randomBoard() })}>
          <span aria-hidden="true">🎲</span>랜덤 상황
        </button>
      </header>

      <div className="s1-inning">
        <Step className="tri" label={`${inning}, 이전 이닝`} disabled={b.inning <= 1}
          onTap={() => dispatch({ type: 'inning', delta: -1 })}>◀</Step>
        <strong>{inning}</strong>
        <Step className="tri" label={`${inning}, 다음 이닝`} disabled={b.inning >= L.LIMITS.inning}
          onTap={() => dispatch({ type: 'inning', delta: 1 })}>▶</Step>
      </div>
      <p className="s1-hint">전광판 각 요소를 선택해주세요</p>

      <div className="s1-board">
        <div className="s1-scores">
          <ScoreGroup name="AWAY" value={b.away}
            onMinus={() => dispatch({ type: 'score', team: 'away', delta: -1 })}
            onPlus={() => dispatch({ type: 'score', team: 'away', delta: 1 })} />
          <ScoreGroup name="HOME" value={b.home}
            onMinus={() => dispatch({ type: 'score', team: 'home', delta: -1 })}
            onPlus={() => dispatch({ type: 'score', team: 'home', delta: 1 })} />
        </div>
        <div className="s1-board-bottom">
          <div className="s1-bso">
            <Lamps label="B" kind="ball" count={b.balls} max={3} onSet={(v) => dispatch({ type: 'count', key: 'balls', value: v })} />
            <Lamps label="S" kind="strike" count={b.strikes} max={2} onSet={(v) => dispatch({ type: 'count', key: 'strikes', value: v })} />
            <Lamps label="O" kind="out" count={b.outs} max={2} onSet={(v) => dispatch({ type: 'count', key: 'outs', value: v })} />
          </div>
          <Field runners={b.runners} onToggle={(i) => dispatch({ type: 'base', index: i })} />
        </div>
      </div>

      <div className="s1-urgency">
        <h2>급한 정도</h2>
        <div className="s1-tabs">
          {L.URGENCY.map((name, u) => (
            <button
              key={name}
              className={state.urgency === u ? 'on' : ''}
              aria-pressed={state.urgency === u}
              onClick={() => dispatch({ type: 'urgency', value: u })}
            >{name}</button>
          ))}
        </div>
      </div>

      <div className="s1-permit">
        <div className="s1-permit-head">허가증 · 실시간</div>
        <div className="s1-permit-main" aria-live="polite">
          <div key={j.level} className={`s1-stamp${thump ? ' thump' : ''}`}>{j.verdict}</div>
          <div className="s1-tension"><span>긴장도</span><b>{j.score}</b></div>
        </div>
        {j.condition && <p className="s1-condition"><b>조건</b>{j.condition}</p>}
        <ul className="s1-articles" aria-label="긴장도 구성">
          {j.clauses.map((c) => (
            <li key={c.n}>
              <span>제{c.n}조 {c.name}<em>{c.detail}</em></span>
              <b>{c.pts < 0 ? `−${-c.pts}` : `+${c.pts}`}</b>
            </li>
          ))}
        </ul>
        {j.specials.length > 0 && (
          <ul className="s1-specials">
            {j.specials.map((s) => <li key={s.n}>특례 {s.n} · {s.name} → {s.effect}</li>)}
          </ul>
        )}
        <p className="s1-note">※ 오른쪽 숫자는 긴장도 가산값이며 경기 점수가 아닙니다</p>
      </div>

      <div className="s1-actions">
        <button className="s1-go" onClick={() => dispatch({ type: 'go', now: Date.now() })}>다녀온다</button>
        <button className="s1-hold" onClick={() => dispatch({
          type: 'hold', now: Date.now(), cheerIdx: L.pickCheerIndex(b, state.urgency),
        })}>참는다</button>
      </div>
      <p className="s1-disclaimer">이 신탁은 근거가 없습니다</p>
    </section>
  );
}
