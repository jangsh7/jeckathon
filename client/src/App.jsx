import { useCallback, useEffect, useRef, useState } from 'react';
import { useUrlState } from './state.js';
import Home from './screens/Home.jsx';
import Outing from './screens/Outing.jsx';
import Record from './screens/Record.jsx';
import Result from './screens/Result.jsx';
import BoxScore from './screens/BoxScore.jsx';
import ErrorScreen, { ErrorBoundary, toHome } from './screens/ErrorScreen.jsx';

export default function App() {
  const [state, dispatch] = useUrlState();
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1800);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const copyLink = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast('기록 링크를 복사했어요');
    } catch {
      window.prompt('이 링크를 복사해 두세요', url);
    }
  }, [showToast]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.dataset.view = state.view; // S1만 밝은 테마
  }, [state.view]);

  const props = { state, dispatch, copyLink };
  const Screen = { home: Home, out: Outing, rec: Record, res: Result, box: BoxScore }[state.view];
  const goHome = () => dispatch({ type: 'load', state: toHome(state) });

  return (
    <main className="app">
      <ErrorBoundary view={state.view} onHome={goHome}>
        {Screen ? <Screen {...props} /> : <ErrorScreen view={state.view} onHome={goHome} />}
      </ErrorBoundary>
      <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </main>
  );
}
