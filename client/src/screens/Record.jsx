import * as L from '../logic.js';
import { duration } from '../format.js';

const CHIPS = [
  ['none', '아무 일 없음', ''],
  ['small', '삼진·범타', ''],
  ['mid', '안타·득점', ''],
  ['big', '홈런·역전', 'hot'],
];

export default function Record({ state, dispatch }) {
  const went = state.pending.action === 'went';

  const pick = (event) => dispatch({ type: 'record', event, byDice: false, now: Date.now() });
  const dice = () => {
    const score = L.judge(state.board, state.urgency).score;
    dispatch({ type: 'record', event: L.rollDice(score), byDice: true, now: Date.now() });
  };

  return (
    <section className="screen center">
      <h2 className="rec-q">{went ? '자리 비운 사이 무슨 일이 있었나요?' : '참는 동안 무슨 일이?'}</h2>
      <p className="rec-sub">{went ? `외출 시간 ${duration(state.pending.durationSec)}` : '모르면 🎲에 맡기세요'}</p>
      <div className="chips">
        {CHIPS.map(([key, label, cls]) => (
          <button key={key} className={`chip ${cls}`} onClick={() => pick(key)}>{label}</button>
        ))}
        <button className="chip dice" onClick={dice}>모르겠음 🎲</button>
      </div>
    </section>
  );
}
