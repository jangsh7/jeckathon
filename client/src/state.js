// 앱 상태 리듀서 + URL(#s=...) 동기화. DB·서버·브라우저 저장소를 쓰지 않는다.
import { useEffect, useReducer } from 'react';
import * as L from './logic.js';

export function initialState() {
  return { board: L.defaultBoard(), urgency: 1, view: 'home', outing: null, pending: null, todayLog: [] };
}

function readHash() {
  const m = window.location.hash.match(/^#s=([A-Za-z0-9_-]+)$/);
  return m ? L.decodeState(m[1]) : null;
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const cycle = (v, max) => (v >= max ? 0 : v + 1);

// 리듀서는 순수해야 하므로(StrictMode 이중 호출) 시간·난수는 action에 담아 넘긴다.
export function reducer(state, a) {
  const b = state.board;
  const setBoard = (patch) => ({ ...state, board: { ...b, ...patch } });

  switch (a.type) {
    case 'load': return a.state;
    case 'score': return setBoard({ [a.team]: clamp(b[a.team] + a.delta, 0, L.LIMITS.score) });
    case 'inning': return setBoard({ inning: clamp(b.inning + a.delta, 1, L.LIMITS.inning) });
    case 'count': return setBoard({ [a.key]: cycle(b[a.key], L.LIMITS[a.key]) });
    case 'base': return setBoard({ runners: b.runners.map((on, i) => (i === a.index ? !on : on)) });
    case 'urgency': return { ...state, urgency: a.value };
    case 'random': return { ...state, board: a.board };

    case 'go': return { ...state, outing: { startedAt: a.now }, view: 'out' };
    case 'hold': return { ...state, pending: { action: 'held', durationSec: 0 }, view: 'rec' };
    case 'back': {
      if (!state.outing) return state;
      const sec = Math.max(0, Math.floor((a.now - state.outing.startedAt) / 1000));
      return { ...state, outing: null, pending: { action: 'went', durationSec: sec }, view: 'rec' };
    }
    case 'record': {
      if (!state.pending) return state;
      const entry = L.buildEntry({
        at: a.now,
        board: L.cloneBoard(b),
        urgency: state.urgency,
        action: state.pending.action,
        durationSec: state.pending.durationSec,
        event: a.event,
        eventByDice: a.byDice,
      });
      return { ...state, pending: null, todayLog: [...state.todayLog, entry], view: 'res' };
    }
    case 'again': return { ...state, urgency: 1, view: 'home' }; // 전광판 유지, 급한 정도만 초기화
    case 'close': return { ...state, view: 'box' };
    case 'resume': return { ...state, view: state.todayLog.length ? 'res' : 'home' };
    case 'newgame': return initialState();
    default: return state;
  }
}

export function useUrlState() {
  const [state, dispatch] = useReducer(reducer, undefined, () => readHash() || initialState());

  useEffect(() => {
    const { pathname, search } = window.location;
    window.history.replaceState(null, '', `${pathname}${search}#s=${L.encodeState(state)}`);
  }, [state]);

  // 다른 기록 링크를 주소창에 붙여넣은 경우
  useEffect(() => {
    const onHash = () => {
      const s = readHash();
      if (s) dispatch({ type: 'load', state: s });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return [state, dispatch];
}

export function randomBoard() {
  const r = (n) => Math.floor(Math.random() * n);
  return {
    away: r(8), home: r(8), inning: 1 + r(10),
    balls: r(4), strikes: r(3), outs: r(3),
    runners: [r(2) === 1, r(2) === 1, r(2) === 1],
  };
}
