import { useRef, useState } from 'react';
import * as L from '../logic.js';
import TopBar, { backFromRecord } from './TopBar.jsx';

const CHIPS = [
  ['none', '아무 일 없음'],
  ['small', '삼진 · 범타'],
  ['mid', '안타 · 득점'],
  ['big', '홈런 · 역전'],
];

export default function Record({ state, dispatch }) {
  const [selected, setSelected] = useState(null); // 'none' | 'small' | 'mid' | 'big' | 'dice'
  // POL-S3-05: 기록하기는 1회만 처리한다 (중복 기록 방지)
  const locked = useRef(false);

  const pending = state.pending;
  if (!pending) return null;
  const went = pending.action === 'went';

  // POL-S3-06·POL-DICE-01: 행동 버튼 시점 스냅샷의 긴장도를 쓴다 (스냅샷이 없으면 현재 전광판으로 계산)
  const score = pending.snapshot?.score ?? L.judge(state.board, state.urgency).score;

  const submit = () => {
    if (!selected || locked.current) return;
    locked.current = true;
    const byDice = selected === 'dice';
    const event = byDice ? L.rollDice(score) : selected; // 🎲는 기록하기를 누를 때 1회만 굴린다
    dispatch({ type: 'record', event, byDice, now: Date.now() });
  };

  const chip = (key, children) => (
    <button
      key={key}
      role="radio"
      aria-checked={selected === key}
      className={`rec-chip${selected === key ? ' on' : ''}`}
      onClick={() => setSelected(key)}
    >
      <i className="rec-radio" aria-hidden="true" />
      {children}
    </button>
  );

  return (
    <section className="lite rec">
      <TopBar title="복귀 기록" onBack={() => dispatch({ type: 'load', state: backFromRecord(state) })} />
      <div className="rec-body">
        {/* POL-S3-01 */}
        <h2 className="rec-q">{went ? '자리 비운 사이 무슨 일이 있었나요?' : '참는 동안 무슨 일이 있었나요?'}</h2>
        <div className="rec-list" role="radiogroup">
          {CHIPS.map(([key, label]) => chip(key, label))}
          {chip('dice', <>모르겠음 🎲<span className="rec-hint">야구신이 대신 결정</span></>)}
        </div>
      </div>
      <div className="rec-cta">
        <button className={`rec-submit${selected ? ' on' : ''}`} disabled={!selected} onClick={submit}>
          기록하기
        </button>
      </div>
    </section>
  );
}
