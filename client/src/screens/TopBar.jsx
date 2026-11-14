// 상단 바 + 왼쪽 위 '<' 이전 버튼 (S3·S4·S5 공용)
export default function TopBar({ title, onBack }) {
  return (
    <header className="lite-bar">
      {onBack && (
        <button className="back-btn" onClick={onBack} aria-label="이전으로">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {title}
    </header>
  );
}

// ---- 이전 화면 상태 만들기 (공용 리듀서의 'load' 액션으로 적용) ----

// S3 → 이전: 다녀옴이면 S2-A(외출 타이머 이어서), 참음이면 S1
export function backFromRecord(state, now = Date.now()) {
  const p = state.pending;
  if (p && p.action === 'went') {
    return { ...state, pending: null, outing: { startedAt: now - p.durationSec * 1000 }, view: 'out' };
  }
  return { ...state, pending: null, view: 'home' };
}

// S4 → 이전: 방금 기록을 되돌리고 S3로 (사건을 다시 고를 수 있다)
export function backFromResult(state) {
  const log = state.todayLog;
  const last = log[log.length - 1];
  if (!last) return { ...state, view: 'home' };
  return {
    ...state,
    todayLog: log.slice(0, -1),
    pending: { action: last.action, durationSec: last.durationSec },
    view: 'rec',
  };
}
