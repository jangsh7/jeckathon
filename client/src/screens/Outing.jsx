import { useEffect, useState } from 'react';
import * as L from '../logic.js';
import { LEVEL_CLASS, mmss } from '../format.js';
import TopBar from '../components/TopBar.jsx';
import GodCarousel from '../components/GodCarousel.jsx';
import { ANXIOUS_GODS } from '../assets/index.js';

const SUMMARY = ['허가를 받고 출발', '조건부 허가를 받고 출발', '불허를 무시하고 출발'];
// 야구신의 한 마디 (출발 당시 판정별 고정 문구)
const QUOTE = [
  '다녀와라. 경기는 잠시 기다려 줄 것이다.',
  '서둘러라. 승부가 곧 끝난다.',
  '지금이 가장 위험한 순간이다. 돌아가라.',
];

export default function Outing({ state, dispatch }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500); // 정책서 POL-S2A-01: 갱신 주기 최대 500ms
    return () => clearInterval(id);
  }, []);

  const level = L.judge(state.board, state.urgency).level;
  const sec = Math.max(0, Math.floor((now - state.outing.startedAt) / 1000));

  return (
    <section className={`screen s2 v-${LEVEL_CLASS[level]}`}>
      {/* TODO: 뒤로 가기 이동 경로는 추후 확정되면 연결 (정책서 POL-NAV-02는 S2-A 취소 없음) */}
      <TopBar title="외출 중" />

      <div className="s2-card">
        <span className="s2-card-label">야구신의 한 마디</span>
        <p className="s2-card-text">“{QUOTE[level]}”</p>
      </div>

      <GodCarousel images={ANXIOUS_GODS} className="s2-gods" />

      <div className="s2-timer-card">
        <span className="s2-timer-label">외출 경과 시간</span>
        <div className="s2-timer">{mmss(sec)}</div>
        <span className="s2-pill">{SUMMARY[level]}</span>
      </div>

      <div className="s2-bottom">
        <button className="s2-main" onClick={() => dispatch({ type: 'back', now: Date.now() })}>돌아왔다</button>
        <p className="s2-warn">⚠ 이 화면을 닫으면 오늘 기록이 사라집니다</p>
      </div>
    </section>
  );
}
