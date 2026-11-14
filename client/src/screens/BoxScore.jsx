import * as L from '../logic.js';
import TopBar from './TopBar.jsx';

// POL-MET-02: N분 SS초, 1분 미만은 SS초 (예: 7분 02초, 45초, 0초)
function minSec(sec) {
  if (sec < 60) return `${sec}초`;
  return `${Math.floor(sec / 60)}분 ${String(sec % 60).padStart(2, '0')}초`;
}

export default function BoxScore({ state, dispatch }) {
  const log = state.todayLog;
  const s = L.stats(log);
  // POL-MET-03·04: 적중률은 went만 분모. 분모 0이면 —
  const rate = s.hitRate === null ? '—' : `${Math.round(s.hitRate * 100)}% (${s.hits}/${s.judged})`;

  return (
    <section className="lite box5">
      <TopBar title="박스 스코어" onBack={() => dispatch({ type: 'resume' })} />

      <div className="box5-body">
        <h2 className="box5-h">오늘의 화장실 박스 스코어</h2>
        <dl className="box5-stats">
          <div><dt>외출 횟수</dt><dd>{s.outings}회</dd></div>
          <div><dt>총 외출 시간</dt><dd>{minSec(s.totalSec)}</dd></div>
          <div><dt>신탁 적중률</dt><dd>{rate}</dd></div>
          <div><dt>놓친 홈런</dt><dd>{s.missedHomers}개</dd></div>
        </dl>

        <h3 className="box5-sub">오늘의 칭호</h3>
        {/* POL-S5-05·06: 시간순, 0건이면 안내 문구 */}
        {log.length === 0 ? (
          <p className="box5-empty">오늘 기록이 없습니다</p>
        ) : (
          <ul className="box5-tags">
            {log.map((e, i) => <li key={i}># {e.title}</li>)}
          </ul>
        )}
      </div>

      <div className="box5-foot">
        {/* POL-S5-03 */}
        <p className="res-save">오늘의 기록은 스크린샷으로만 남습니다</p>
        {/* POL-S5-04: 메모리 초기화 후 S1 */}
        <button className="box5-new" onClick={() => dispatch({ type: 'newgame' })}>새 경기 시작</button>
      </div>
    </section>
  );
}
