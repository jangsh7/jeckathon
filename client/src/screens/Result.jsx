import * as L from '../logic.js';
import { LEVEL_CLASS, duration } from '../format.js';
import StatsGrid from './StatsGrid.jsx';

export default function Result({ state, dispatch, copyLink }) {
  const log = state.todayLog;
  const e = log[log.length - 1];
  const went = e.action === 'went';
  const outingNo = log.filter((x) => x.action === 'went').length;

  return (
    <section className="screen">
      <article className={`card ${LEVEL_CLASS[e.level]}`}>
        <div className="card-top">
          <span className="card-no">{went ? `오늘 외출 ${outingNo}번째` : `오늘 기록 ${log.length}번째 · 참음`}</span>
          {e.hit !== null && <span className={`hit ${e.hit ? 'yes' : 'no'}`}>{e.hit ? '✅ 적중' : '❌ 빗나감'}</span>}
        </div>
        <h2 className="card-title">{e.title}</h2>
        <dl className="card-rows">
          <div><dt>전광판</dt><dd>{L.boardSummary(e.board)}</dd></div>
          <div><dt>판정</dt><dd>{e.verdict} · 긴장도 {e.score}</dd></div>
          <div><dt>선택</dt><dd>{went ? `다녀옴 · ${duration(e.durationSec)}` : '참음'}</dd></div>
          <div><dt>사건</dt><dd>{L.EVENT_LABELS[e.event]}{e.eventByDice ? ' 🎲' : ''}</dd></div>
        </dl>
        <div className="today">
          <div className="today-head">오늘의 누적</div>
          <StatsGrid log={log} />
        </div>
        <p className="card-foot">스크린샷으로 저장하거나 기록 링크를 복사해 두세요</p>
      </article>
      <div className="actions stack">
        <button className="primary" onClick={() => dispatch({ type: 'again' })}>다시 신탁 받기</button>
        <button className="secondary" onClick={copyLink}>🔗 기록 링크 복사</button>
        <button className="ghost" onClick={() => dispatch({ type: 'close' })}>오늘 경기 마감 →</button>
      </div>
    </section>
  );
}
