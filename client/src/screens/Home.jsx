import * as L from '../logic.js';
import { randomBoard } from '../state.js';
import { LEVEL_CLASS } from '../format.js';

function Lamps({ label, count, max, kind, onTap }) {
  return (
    <button className={`lamps ${kind}`} onClick={onTap} aria-label={`${label} ${count}`}>
      <span className="lbl">{label}</span>
      {Array.from({ length: max }, (_, i) => <i key={i} className={i < count ? 'on' : ''} />)}
    </button>
  );
}

function Step({ children, label, onTap }) {
  return <button className="step" onClick={onTap} aria-label={label}>{children}</button>;
}

function Scoreboard({ board: b, dispatch }) {
  const team = (key, name) => (
    <div className="team-row">
      <span className="team">{name}</span>
      <Step label={`${name} 점수 빼기`} onTap={() => dispatch({ type: 'score', team: key, delta: -1 })}>−</Step>
      <span className="led">{b[key]}</span>
      <Step label={`${name} 점수 더하기`} onTap={() => dispatch({ type: 'score', team: key, delta: 1 })}>+</Step>
    </div>
  );
  const base = (n) => (
    <button
      className={`base b${n}${b.runners[n - 1] ? ' on' : ''}`}
      aria-label={`${n}루`}
      aria-pressed={b.runners[n - 1]}
      onClick={() => dispatch({ type: 'base', index: n - 1 })}
    />
  );

  return (
    <div className="board" aria-label="전광판">
      <div className="board-top">
        <div className="scores">
          {team('away', 'AWAY')}
          {team('home', 'HOME')}
        </div>
        <div className="inning">
          <Step label="이전 이닝" onTap={() => dispatch({ type: 'inning', delta: -1 })}>◀</Step>
          <span className="led led-inning">{L.inningLabel(b.inning)}</span>
          <Step label="다음 이닝" onTap={() => dispatch({ type: 'inning', delta: 1 })}>▶</Step>
        </div>
      </div>
      <div className="board-bottom">
        <div className="bso">
          <Lamps label="B" kind="ball" count={b.balls} max={3} onTap={() => dispatch({ type: 'count', key: 'balls' })} />
          <Lamps label="S" kind="strike" count={b.strikes} max={2} onTap={() => dispatch({ type: 'count', key: 'strikes' })} />
          <Lamps label="O" kind="out" count={b.outs} max={2} onTap={() => dispatch({ type: 'count', key: 'outs' })} />
        </div>
        <div className="diamond" aria-label="주자">
          {base(2)}{base(3)}{base(1)}
          <span className="plate" />
        </div>
      </div>
    </div>
  );
}

export default function Home({ state, dispatch }) {
  const j = L.judge(state.board, state.urgency);

  return (
    <section className="screen">
      <header className="brand">
        <h1>화장실 허가증</h1>
        <button className="ghost small" onClick={() => dispatch({ type: 'random', board: randomBoard() })}>🎲 랜덤 상황</button>
      </header>

      <Scoreboard board={state.board} dispatch={dispatch} />

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
        <div className="permit-head">허가증 · 실시간</div>
        <div className="permit-main">
          {/* key가 바뀌면 다시 마운트되어 판정 단계가 바뀔 때만 도장이 찍힌다 */}
          <div key={j.level} className={`stamp ${LEVEL_CLASS[j.level]}`}>{j.verdict}</div>
          <div className="tension">긴장도 <b>{j.score}</b></div>
        </div>
        {j.condition && <p className="condition">조건: {j.condition}</p>}
        <ol className="articles">
          {j.clauses.map((c) => (
            <li key={c.n}>
              <span>제{c.n}조 {c.name} <em>{c.detail}</em></span>
              <b>{c.pts > 0 ? '+' : ''}{c.pts}</b>
            </li>
          ))}
        </ol>
        {j.specials.length > 0 && (
          <ul className="specials">
            {j.specials.map((s) => <li key={s.n}>특례 {s.n} · {s.name} → {s.effect}</li>)}
          </ul>
        )}
      </div>

      <div className="actions">
        <button className="primary" onClick={() => dispatch({ type: 'go', now: Date.now() })}>다녀온다</button>
        <button className="secondary" onClick={() => dispatch({ type: 'hold' })}>참는다</button>
      </div>
      <p className="disclaimer">이 신탁은 근거가 없습니다</p>
    </section>
  );
}
