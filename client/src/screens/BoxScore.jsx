import * as L from '../logic.js';
import { LEVEL_CLASS, mmss } from '../format.js';
import StatsGrid from './StatsGrid.jsx';

export default function BoxScore({ state, dispatch, copyLink }) {
  const log = state.todayLog;

  const newGame = () => {
    if (window.confirm('오늘 기록을 모두 지우고 새 경기를 시작할까요?\n(지금 링크를 복사해 두면 기록을 다시 열 수 있어요)')) {
      dispatch({ type: 'newgame' });
    }
  };

  return (
    <section className="screen">
      <article className="card box">
        <h2 className="box-title">오늘의 화장실 박스스코어</h2>
        <StatsGrid log={log} />
        <div className="box-table-wrap">
          <table className="box-table">
            <thead><tr><th>#</th><th>상황</th><th>판정</th><th>선택</th><th>사건</th><th /></tr></thead>
            <tbody>
              {log.length === 0 && <tr><td colSpan={6} className="empty">아직 기록이 없어요</td></tr>}
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
        {log.length > 0 && (
          <div className="titles">
            {log.map((e, i) => <span key={i} className={`pill ${LEVEL_CLASS[e.level]}`}>{e.title}</span>)}
          </div>
        )}
        <p className="card-foot">오늘의 기록은 스크린샷과 이 링크로만 남습니다</p>
      </article>
      <div className="actions stack">
        <button className="primary" onClick={copyLink}>🔗 기록 링크 복사</button>
        <button className="secondary" onClick={() => dispatch({ type: 'resume' })}>경기로 돌아가기</button>
        <button className="ghost danger" onClick={newGame}>새 경기 시작</button>
      </div>
    </section>
  );
}
