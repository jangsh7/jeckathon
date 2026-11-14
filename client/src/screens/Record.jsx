import { useState } from 'react';
import * as L from '../logic.js';

// tone: 선택 시 강조 색 (아무 일 없음=검정, 소형=초록, 중형=갈색, 대형=빨강, 🎲=보라)
const OPTIONS = [
  { key: 'none', label: '아무 일 없음', tone: 'none' },
  { key: 'small', label: '삼진 · 범타', tone: 'calm' },
  { key: 'mid', label: '안타 · 득점', tone: 'mid' },
  { key: 'big', label: '홈런 · 역전', tone: 'big' },
  { key: 'dice', label: '모르겠음 🎲', tone: 'dice', note: '야구신이 대신 결정' },
];

export default function Record({ state, dispatch }) {
  const went = state.pending.action === 'went';
  const [picked, setPicked] = useState(null);
  const tone = OPTIONS.find((o) => o.key === picked)?.tone;

  const submit = () => {
    if (!picked) return;
    if (picked === 'dice') {
      const score = L.judge(state.board, state.urgency).score;
      dispatch({ type: 'record', event: L.rollDice(score), byDice: true, now: Date.now() });
    } else {
      dispatch({ type: 'record', event: picked, byDice: false, now: Date.now() });
    }
  };

  return (
    <section className="screen s3">
      <header className="s1-bar">
        {/* TODO: 뒤로 가기 이동 경로는 추후 확정되면 연결 (정책서 POL-NAV-02는 S3 뒤로 가기 없음) */}
        <button className="s1-back" onClick={() => {}} aria-label="뒤로 가기">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1>복귀 기록</h1>
        <span />
      </header>

      <div className="s3-head">
        <h2>{went ? '자리 비운 사이 무슨 일이 있었나요?' : '참는 동안 무슨 일이 있었나요?'}</h2>
        <p>상황을 선택해주세요</p>
      </div>

      <div className="s3-options" role="radiogroup" aria-label="사건 선택">
        {OPTIONS.map((o) => {
          const on = picked === o.key;
          return (
            <button
              key={o.key}
              role="radio"
              aria-checked={on}
              className={`s3-option t-${o.tone}${on ? ' on' : ''}`}
              onClick={() => setPicked(o.key)}
            >
              <span className="s3-radio" aria-hidden="true" />
              <span className="s3-label">{o.label}</span>
              {o.note && <span className="s3-note">{o.note}</span>}
            </button>
          );
        })}
      </div>

      <div className="s3-bottom">
        <button className={`s3-submit${tone ? ` t-${tone}` : ''}`} disabled={!picked} onClick={submit}>
          기록하기
        </button>
      </div>
    </section>
  );
}
