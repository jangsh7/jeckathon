// 밝은 테마 화면 공통 상단 바: 뒤로 가기 · 제목 · (오른쪽 요소)
export default function TopBar({ title, onBack = () => {}, right = <span /> }) {
  return (
    <header className="s1-bar">
      <button className="s1-back" onClick={onBack} aria-label="뒤로 가기">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1>{title}</h1>
      {right}
    </header>
  );
}
