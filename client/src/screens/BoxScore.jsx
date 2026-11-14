import * as L from '../logic.js';
import { LEVEL_CLASS, mmss } from '../format.js';
import StatsGrid from './StatsGrid.jsx';
import TopBar from './TopBar.jsx';

export default function BoxScore({ state, dispatch }) {
  const log = state.todayLog;

  return (
    <section className="screen">
      <TopBar title="박스스코어" onBack={() => dispatch({ type: 'resume' })} />
      <article className="card box">
        <h2 className="box-title">오늘의 화장실 박스스코어</h2>
        <StatsGrid log={log} />
        <div className="box-table-wrap">
          <table className="box-table">
            <thead><tr><th>#</th><th>상황</th><th>판정</th><th>선택</th><th>사건</th><th /></tr></thead>
            <tbody>
              {log.length === 0 && <tr><td colSpan={6} className="empty">오늘 기록이 없습니다</td></tr>}
              {log.map((e, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{L.inningLabel(e.board.inning)} {e.board.away}:{e.board.home}</td>
                  <td><span className={`pill ${LEVEL_CLASS[e.level]}`}>{e.level === 1 ? '조건부' : e.verdict}</span></td>
                  <td>{e.action === 'went' ? mmss(e.durationSec) : '참음'}</td>
                  <td>{L.EVENT_LABELS[e.event]}{e.eventByDice ? ' 🎲' : ''}</td>
                  <td>{e.hit === null ? '' : e.hit ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* POL-S5-05·06: 칭호 목록은 시간순, 0건이면 안내 문구 */}
        <div className="titles">
          {log.length === 0
            ? <span className="empty">오늘 기록이 없습니다</span>
            : log.map((e, i) => <span key={i} className={`pill ${LEVEL_CLASS[e.level]}`}>{e.title}</span>)}
        </div>
        <p className="card-foot">오늘의 기록은 스크린샷으로만 남습니다</p>
      </article>
      <div className="actions stack">
        {/* 제품 원칙 5: 확인 팝업 없이 1탭으로 초기화 (POL-S5-04) */}
        <button className="primary" onClick={() => dispatch({ type: 'newgame' })}>새 경기 시작</button>
        <button className="ghost" onClick={() => dispatch({ type: 'resume' })}>경기로 돌아가기</button>
      </div>
    </section>
  );
}
