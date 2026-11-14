import * as L from '../logic.js';
import { duration } from '../format.js';

export default function StatsGrid({ log }) {
  const s = L.stats(log);
  const rate = s.hitRate === null ? '—' : `${Math.round(s.hitRate * 100)}%`;
  return (
    <div className="today-grid">
      <div><span>외출</span><b>{s.outings}회</b></div>
      <div><span>총 외출 시간</span><b>{duration(s.totalSec)}</b></div>
      <div><span>신탁 적중률</span><b>{rate}{s.judged > 0 && <small> {s.hits}/{s.judged}</small>}</b></div>
      <div><span>놓친 홈런</span><b>{s.missedHomers}개</b></div>
    </div>
  );
}
