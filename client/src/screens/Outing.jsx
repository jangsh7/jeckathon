import { useEffect, useState } from 'react';
import * as L from '../logic.js';
import { LEVEL_CLASS, mmss } from '../format.js';

const SUMMARY = [
  '허가를 받고 당당히 출발했습니다',
  '조건부 허가를 받고 출발했습니다',
  '불허를 무시하고 출발했습니다',
];

export default function Outing({ state, dispatch }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const level = L.judge(state.board, state.urgency).level;
  const sec = Math.max(0, Math.floor((now - state.outing.startedAt) / 1000));

  return (
    <section className="screen center">
      <p className="eyebrow">외출 중</p>
      <div className="timer">{mmss(sec)}</div>
      <p className={`out-summary ${LEVEL_CLASS[level]}`}>{SUMMARY[level]}</p>
      <p className="oracle">야구신이 지켜보고 있다. 서둘러라.</p>
      <button className="primary big" onClick={() => dispatch({ type: 'back', now: Date.now() })}>돌아왔다</button>
      <p className="note">기록은 이 페이지 주소에 담겨 있어요. 새로고침해도 타이머는 이어집니다.</p>
    </section>
  );
}
