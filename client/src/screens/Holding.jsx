import { useEffect, useState } from 'react';
import * as L from '../logic.js';
import { mmss } from '../format.js';
import TopBar from '../components/TopBar.jsx';
import GodCarousel from '../components/GodCarousel.jsx';
import { HAPPY_GODS } from '../assets/index.js';

// S2-B 참는 중: 응원 문구·리마인드는 진입 시점 값으로 고정(POL-S2B-08)
export default function Holding({ state, dispatch }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const { holding, board, urgency } = state;
  const sec = Math.max(0, Math.floor((now - holding.startedAt) / 1000));

  return (
    <section className="screen s2 v-hold">
      {/* TODO: 뒤로 가기 이동 경로는 추후 확정되면 연결 (정책서 POL-S2B-06은 S2-B 뒤로 가기 없음) */}
      <TopBar title="참는 중" />

      <div className="s2-card">
        <span className="s2-card-label">야구신의 응원</span>
        <p className="s2-card-text">{L.cheerText(board, urgency, holding.cheerIdx)}</p>
      </div>

      <GodCarousel images={HAPPY_GODS} className="s2-gods small" />

      <div className="s2-remind">{L.reminderText(board)}</div>

      <div className="s2-timer-card">
        <span className="s2-timer-label">참는 시간</span>
        <div className="s2-timer">{mmss(sec)}</div>
      </div>

      <div className="s2-bottom">
        <button className="s2-main" onClick={() => dispatch({ type: 'held' })}>다 참았다</button>
        <button className="s2-sub" onClick={() => dispatch({ type: 'escape', now: Date.now() })}>결국 다녀온다</button>
        <p className="s2-warn">⚠ 이 화면을 닫으면 오늘 기록이 사라집니다</p>
      </div>
    </section>
  );
}
