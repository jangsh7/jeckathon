import { useEffect, useRef } from 'react';
import * as L from '../logic.js';
import { randomBoard } from '../state.js';
import { LEVEL_CLASS } from '../format.js';

const LAMP_NAME = { B: '볼', S: '스트라이크', O: '아웃' };

// N번째 원을 누르면 N개. 마지막으로 켜진 원을 다시 누르면 하나 줄어든다(첫 원이면 0).
function Lamps({ label, count, max, kind, onSet }) {
  const name = LAMP_NAME[label];
  return (
    <div className="lamp-row" role="group" aria-label={`${name} ${count}`}>
      <span className="lbl" aria-hidden="true">{label}</span>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const target = count === n ? n - 1 : n;
        return (
          <button
            key={i}
            className={`lamp ${kind}${i < count ? ' on' : ''}`}
            aria-label={`${name} ${count}, 탭하면 ${target}`}
            onClick={() => onSet(target)}
          ><i /></button>
        );
      })}
    </div>
  );
}

// 보이는 상자는 작게, 탭 영역은 44px
function Step({ children, label, disabled, onTap }) {
  return (
    <button className="step" onClick={onTap} aria-label={label} disabled={disabled}>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function Scoreboard({ board: b, dispatch }) {
  const team = (key, name) => (
    <div className="team-row">
      <span className="team">{name}</span>
      <Step label={`${name} 점수 ${b[key]}, 빼기`} disabled={b[key] <= 0}
        onTap={() => dispatch({ type: 'score', team: key, delta: -1 })}>−</Step>
      <span className="led">{b[key]}</span>
      <Step label={`${name} 점수 ${b[key]}, 더하기`} disabled={b[key] >= L.LIMITS.score}
        onTap={() => dispatch({ type: 'score', team: key, delta: 1 })}>+</Step>
    </div>
  );
  const base = (n) => (
    <button
      className={`base b${n}${b.runners[n - 1] ? ' on' : ''}`}
      aria-label={`${n}루 주자 ${b.runners[n - 1] ? '있음' : '없음'}`}
      aria-pressed={b.runners[n - 1]}
      onClick={() => dispatch({ type: 'base', index: n - 1 })}
    />
  );
  const inning = L.inningLabel(b.inning);

  return (
    <div className="board">
      <div className="board-top">
        <div className="scores">
          {team('away', 'AWAY')}
          {team('home', 'HOME')}
        </div>
        <div className="inning">
          <Step label={`${inning}, 이전 이닝`} disabled={b.inning <= 1}
            onTap={() => dispatch({ type: 'inning', delta: -1 })}>◀</Step>
          <span className="led led-inning">{inning}</span>
          <Step label={`${inning}, 다음 이닝`} disabled={b.inning >= L.LIMITS.inning}
            onTap={() => dispatch({ type: 'inning', delta: 1 })}>▶</Step>
        </div>
      </div>
      <div className="board-bottom">
        <div className="bso">
          <Lamps label="B" kind="ball" count={b.balls} max={3} onSet={(v) => dispatch({ type: 'count', key: 'balls', value: v })} />
          <Lamps label="S" kind="strike" count={b.strikes} max={2} onSet={(v) => dispatch({ type: 'count', key: 'strikes', value: v })} />
          <Lamps label="O" kind="out" count={b.outs} max={2} onSet={(v) => dispatch({ type: 'count', key: 'outs', value: v })} />
        </div>
        <div className="diamond" role="group" aria-label="주자">
          {base(2)}{base(3)}{base(1)}
          <span className="plate" />
        </div>
      </div>
    </div>
  );
}

export default function Home({ state, dispatch }) {
  const j = L.judge(state.board, state.urgency);

  // 도장 애니메이션은 판정 단계가 바뀔 때만. 첫 진입·S4 복귀(마운트) 때는 없음.
  const prevLevel = useRef(null);
  const thump = prevLevel.current !== null && prevLevel.current !== j.level;
  useEffect(() => { prevLevel.current = j.level; }, [j.level]);

  return (
    <section className="screen">
      <header className="brand">
        <h1>화장실 허가증</h1>
        <button className="ghost small" onClick={() => dispatch({ type: 'random', board: randomBoard() })}>🎲 랜덤 상황</button>
      </header>

      <div className="board-wrap">
        <p className="hint">전광판 (각 요소를 탭하여 입력)</p>
        <Scoreboard board={state.board} dispatch={dispatch} />
      </div>

      <div className="urgency">
        <span className="urgency-label">급한 정도</span>
        <div className="seg">
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

      <div className="permit">
        <div className="permit-main" aria-live="polite">
          <div key={j.level} className={`stamp ${LEVEL_CLASS[j.level]}${thump ? ' thump' : ''}`}>{j.verdict}</div>
          <div className="tension">긴장도 <b>{j.score}</b></div>
        </div>
        <p className="articles" aria-label="긴장도 구성">
          {j.clauses.map((c) => (
            <span key={c.n} className="art" title={c.detail}>
              제{c.n}조 {c.name} <b>{c.pts < 0 ? `−${-c.pts}` : `+${c.pts}`}</b>
            </span>
          ))}
        </p>
        {j.specials.length > 0 && (
          <ul className="specials">
            {j.specials.map((s) => <li key={s.n}>특례 {s.n} · {s.name} → {s.effect}</li>)}
          </ul>
        )}
        {j.condition && <p className="condition">조건: {j.condition}</p>}
        <p className="permit-foot">※ 조항 숫자는 긴장도 가산값이며 경기 점수가 아닙니다 · 이 신탁은 근거가 없습니다</p>
      </div>

      <div className="actions">
        <button className="primary" onClick={() => dispatch({ type: 'go', now: Date.now() })}>다녀온다</button>
        <button className="outline" onClick={() => dispatch({ type: 'hold' })}>참는다</button>
      </div>
    </section>
  );
}
