export const LEVEL_CLASS = ['ok', 'cond', 'no'];

export function mmss(sec) {
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

export function duration(sec) {
  if (sec < 60) return `${sec}초`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}분 ${s}초` : `${m}분`;
}
