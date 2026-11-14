import { useRef, useState } from 'react';
import * as L from '../logic.js';
import TopBar from '../components/TopBar.jsx';
import { backFromRecord } from './TopBar.jsx';
import ErrorScreen, { toHome } from './ErrorScreen.jsx';

// tone: 선택 시 강조 색 (아무 일 없음=검정, 소형=초록, 중형=갈색, 대형=빨강, 🎲=보라)
const OPTIONS = [
  { key: 'none', label: '아무 일 없음', tone: 'none' },
  { key: 'small', label: '삼진 · 범타', tone: 'calm' },
  { key: 'mid', label: '안타 · 득점', tone: 'mid' },
  { key: 'big', label: '홈런 · 역전', tone: 'big' },
  { key: 'dice', label: '모르겠음 🎲', tone: 'dice', note: '야구신이 대신 결정' },
];

export default function Record({ state, dispatch }) {
  const [picked, setPicked] = useState(null);
  // POL-S3-05: 기록하기는 1회만 처리한다 (중복 기록 방지)
  const locked = useRef(false);

  const pending = state.pending;
  if (!pending) return <ErrorScreen view={state.view} onHome={() => dispatch({ type: 'load', state: toHome(state) })} />;
  const went = pending.action === 'went';
  const tone = OPTIONS.find((o) => o.key === picked)?.tone;

  // POL-S3-06·POL-DICE-01: 행동 버튼 시점 스냅샷의 긴장도를 쓴다 (스냅샷이 없으면 현재 전광판으로 계산)
  const score = pending.snapshot?.score ?? L.judge(state.board, state.urgency).score;

  const submit = () => {
    if (!picked || locked.current) return;
    locked.current = true;
    const byDice = picked === 'dice';
    const event = byDice ? L.rollDice(score) : picked; // 🎲는 기록하기를 누를 때 1회만 굴린다
    dispatch({ type: 'record', event, byDice, now: Date.now() });
  };

  return (
    <section className="screen s3">
      {/* 이전: 다녀옴이면 외출 중(타이머 이어서), 참음이면 전광판 홈 */}
      <TopBar title="복귀 기록" onBack={() => dispatch({ type: 'load', state: backFromRecord(state) })} />

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
