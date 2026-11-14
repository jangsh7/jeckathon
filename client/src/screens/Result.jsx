import { useState } from 'react';
import * as L from '../logic.js';
import ErrorScreen, { toHome } from './ErrorScreen.jsx';
import { duration } from '../format.js';
import TopBar, { backFromResult } from './TopBar.jsx';

// 부적 그림: client/public/talisman.png 를 넣으면 자동으로 쓰고, 없으면 CSS로 그린 임시 부적을 보여 준다
const TALISMAN_SRC = '/talisman.png';

function TalismanFront() {
  const [imgOk, setImgOk] = useState(true);
  if (imgOk) {
    return <img className="tal-img" src={TALISMAN_SRC} alt="" onError={() => setImgOk(false)} draggable="false" />;
  }
  return (
    <div className="tal-draw" aria-hidden="true">
      <span className="tal-seal tl">결</span><span className="tal-seal tr">과</span>
      <span className="tal-seal bl">확</span><span className="tal-seal br">인</span>
      <span className="tal-scroll">만루대박</span>
    </div>
  );
}

export default function Result({ state, dispatch }) {
  const [flipped, setFlipped] = useState(false);
  const [armed, setArmed] = useState(false);

  const log = state.todayLog;
  const e = log[log.length - 1];
  if (!e) return <ErrorScreen view={state.view} onHome={() => dispatch({ type: 'load', state: toHome(state) })} />;
  const went = e.action === 'went';
  const s = L.stats(log);
  const rate = s.hitRate === null ? '—' : `${Math.round(s.hitRate * 100)}%`; // POL-MET-04

  // 1탭: 부적 → "결과확인" 표시 / 2탭: 결과확인 → 뒷면으로 뒤집기 / 뒷면 탭: 다시 부적으로
  const arm = () => setArmed(true);
  const reveal = (ev) => { ev.stopPropagation(); setArmed(false); setFlipped(true); };
  const unflip = () => setFlipped(false);

  return (
    <section className="lite res">
      <TopBar title="결과 카드" onBack={() => dispatch({ type: 'load', state: backFromResult(state) })} />

      <div className="res-body">
        <h3 className="res-h">오늘 누적</h3>
        <div className="res-stats">
          <div><b>{s.outings}회</b><span>외출</span></div>
          <div><b>{rate}</b><span>신탁 적중률</span></div>
          <div><b>{s.missedHomers}</b><span>놓친 홈런볼</span></div>
        </div>

        {/* POL-S4-04 */}
        <p className="res-save">스크린샷으로 저장하세요</p>

        <div className={`flip${flipped ? ' flipped' : ''}${armed ? ' armed' : ''}`}>
          <div className="flip-inner">
            <div className="flip-face front" aria-hidden={flipped}>
              <TalismanFront />
              {armed ? (
                <div className="tal-dim" onClick={() => setArmed(false)}>
                  <button className="tal-cta" onClick={reveal}>결과확인</button>
                </div>
              ) : (
                <button className="tal-hit" onClick={arm} aria-label="부적 열기" tabIndex={flipped ? -1 : 0} />
              )}
            </div>

            <div className="flip-face back" onClick={unflip} aria-hidden={!flipped}>
              {/* POL-S4-02: 적중 표시는 went만. 참음은 적중률에서 제외 */}
              {went && <span className={`res-hit ${e.hit ? 'yes' : 'no'}`}>{e.hit ? '✅ 적중' : '❌ 빗나감'}</span>}
              <h2 className="res-title">{e.title}</h2>
              <dl className="res-rows">
                <div><dt>상황</dt><dd>{L.boardSummary(e.board)}</dd></div>
                <div><dt>신탁 판정</dt><dd>{e.verdict}</dd></div>
                {/* POL-S4-03: 참음이면 외출 시간 미표시 */}
                {went && <div><dt>외출 시간</dt><dd>{duration(e.durationSec)}</dd></div>}
                <div>
                  <dt>{went ? '놓친 것' : '참는 동안'}</dt>
                  <dd>{L.EVENT_LABELS[e.event]}{e.eventByDice ? ' 🎲' : ''}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="res-actions">
        <button onClick={() => dispatch({ type: 'again' })}>다시 신탁 받기</button>
        <button onClick={() => dispatch({ type: 'close' })}>오늘 경기 마감</button>
      </div>
    </section>
  );
}
