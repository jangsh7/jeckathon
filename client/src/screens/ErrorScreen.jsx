// S6 · 공통 오류 화면 (F-601): 로딩·입력·상태 오류를 한 화면으로 통일하고 "처음으로 가기"로 S1 복귀
import { Component, useEffect } from 'react';
import TopBar from './TopBar.jsx';

const VIEW_TITLES = { intro: '시작', home: '전광판', out: '외출 중', hold: '참는 중', rec: '복귀 기록', res: '결과 카드', box: '박스 스코어' };

// 처음으로: 전광판·오늘 기록은 두고 진행 중이던 외출/참는 중/복귀 대기만 비운 뒤 S1로
export function toHome(state) {
  return { ...state, view: 'home', outing: null, holding: null, pending: null };
}

export default function ErrorScreen({ view, onHome }) {
  // 화면 옆(480px 바깥) 배경도 흰색으로
  useEffect(() => { document.body.dataset.view = 'error'; }, []);

  return (
    <section className="lite err">
      <TopBar title={VIEW_TITLES[view] || ''} onBack={onHome} />
      <div className="err-body" role="alert">
        <span className="err-icon" aria-hidden="true">!</span>
        <h2 className="err-title">문제가 생겼어요</h2>
        <p className="err-desc">입력이 꼬였거나 화면을 너무 오래 비웠어요.<br />처음부터 다시 시작할까요?</p>
      </div>
      <div className="err-foot">
        <button className="btn-accent" onClick={onHome}>처음으로 가기</button>
      </div>
    </section>
  );
}

// 화면 렌더 중 예기치 못한 오류가 나면 S6를 보여 준다
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  goHome = () => {
    this.setState({ failed: false });
    this.props.onHome();
  };

  render() {
    if (this.state.failed) return <ErrorScreen view={this.props.view} onHome={this.goHome} />;
    return this.props.children;
  }
}
