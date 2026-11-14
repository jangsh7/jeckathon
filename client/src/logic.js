// 야구신 화장실 관리법 — 판정·칭호·누적 지표·URL 인코딩 (순수 함수)
// React 앱과 node 테스트가 함께 쓰는 ES 모듈.

const VERDICTS = ['허가', '조건부 허가', '불허'];
const URGENCY = ['여유', '보통', '한계'];
const EVENT_KEYS = ['none', 'small', 'mid', 'big'];
const EVENT_LABELS = { none: '아무 일 없음', small: '삼진·범타', mid: '안타·득점', big: '홈런·역전' };

// [판정][다녀옴=0 | 참음=1][무사건·소형=0 | 중형·대형=1]
const TITLES = [
  [['신의 축복', '신도 몰랐다'], ['괜히 참음', '촉 좋은 팬']],
  [['모범 관람객', '타이밍의 배신'], ['소심한 신중함', '참은 보람']],
  [['신탁 무시, 운 좋게 생존', '경고를 무시한 대가'], ['억울 카드', '참은 보람']],
];

const LIMITS = { score: 20, inning: 10, balls: 3, strikes: 2, outs: 2 };

function defaultBoard() {
  return { away: 0, home: 0, inning: 1, balls: 0, strikes: 0, outs: 0, runners: [false, false, false] };
}

function diffOf(b) { return Math.abs(b.away - b.home); }
function hasRunners(r) { return r[0] || r[1] || r[2]; }
function scoringPosition(r) { return r[1] || r[2]; }
function inningLabel(i) { return i >= 10 ? '연장' : i + '회'; }

function runnersLabel(r) {
  if (r[0] && r[1] && r[2]) return '만루';
  const on = [1, 2, 3].filter((n) => r[n - 1]);
  return on.length ? on.join('·') + '루' : '주자 없음';
}

function boardSummary(b) {
  return `${inningLabel(b.inning)} ${b.away}:${b.home} · ${b.balls}B ${b.strikes}S ${b.outs}O · ${runnersLabel(b.runners)}`;
}

// 제1조~제6조
function clauses(b, urgency) {
  const d = diffOf(b);
  const i = b.inning;
  const r = b.runners;
  const list = [];

  list.push({ n: 1, name: '이닝', detail: i <= 3 ? '1~3회' : i <= 6 ? '4~6회' : i <= 8 ? '7~8회' : '9회·연장',
    pts: i <= 3 ? 5 : i <= 6 ? 15 : i <= 8 ? 25 : 35 });

  list.push({ n: 2, name: '접전', detail: d === 0 ? '동점' : d + '점 차',
    pts: d === 0 ? 20 : d <= 2 ? 15 : d <= 4 ? 5 : 0 });

  let rp = 0, rd = '주자 없음';
  if (r[0] && r[1] && r[2]) { rp = 20; rd = '만루'; }
  else if (r[1] || r[2]) { rp = 12; rd = '득점권'; }
  else if (r[0]) { rp = 5; rd = '1루만'; }
  list.push({ n: 3, name: '주자', detail: rd, pts: rp });

  list.push({ n: 4, name: '아웃', detail: b.outs + '아웃', pts: [6, 4, 2][b.outs] });

  const full = b.balls === 3 && b.strikes === 2;
  const two = b.strikes === 2 || b.balls === 3;
  list.push({ n: 5, name: '볼카운트',
    detail: full ? '풀카운트' : two ? (b.strikes === 2 ? '2스트라이크' : '3볼') : `${b.balls}B ${b.strikes}S`,
    pts: full ? 6 : two ? 3 : 0 });

  list.push({ n: 6, name: '급한 정도', detail: URGENCY[urgency], pts: [10, 0, -15][urgency] });
  return list;
}

function judge(b, urgency) {
  const cl = clauses(b, urgency);
  const raw = cl.reduce((s, c) => s + c.pts, 0);
  const score = Math.max(0, raw);
  let level = score >= 60 ? 2 : score >= 35 ? 1 : 0;
  const baseLevel = level;
  const specials = [];
  const d = diffOf(b);

  if (d >= 5 && level > 0) {
    level--; specials.push({ n: 1, name: '가비지 타임', effect: '한 단계 완화' });
  }
  if (b.outs === 2 && !hasRunners(b.runners) && level > 0) {
    level--; specials.push({ n: 2, name: '공수교대 임박', effect: '한 단계 완화' });
  }
  if (b.inning >= 9 && d <= 2 && scoringPosition(b.runners)) {
    level = 2; specials.push({ n: 3, name: '역사적 순간', effect: '무조건 불허' });
  }
  if (urgency === 2 && level === 2) {
    level = 1; specials.push({ n: 4, name: '생리현상 존중', effect: '불허를 조건부로' });
  }

  const condition = level === 1 ? (b.outs === 2 ? '공수교대 때 출발' : '이 타자 승부가 끝나면 출발') : null;
  return { score, raw, clauses: cl, baseLevel, level, verdict: VERDICTS[level], specials, condition };
}

// 모르겠음 🎲 : 발생 확률 15% + 긴장도×0.6%, 크기는 대형 min(긴장도/200, 0.4) · 중형 0.35 · 나머지 소형
function rollDice(score, rand) {
  rand = rand || Math.random;
  if (rand() >= 0.15 + score * 0.006) return 'none';
  const big = Math.min(score / 200, 0.4);
  const x = rand();
  if (x < big) return 'big';
  if (x < big + 0.35) return 'mid';
  return 'small';
}

function isBigEvent(ev) { return ev === 'mid' || ev === 'big'; }

function titleOf(level, action, event) {
  return TITLES[level][action === 'went' ? 0 : 1][isBigEvent(event) ? 1 : 0];
}

// 참음은 확인할 수 없는 반사실이라 null
function hitOf(level, action, event) {
  if (action !== 'went') return null;
  return level === 2 ? isBigEvent(event) : !isBigEvent(event);
}

function buildEntry(e) {
  const j = judge(e.board, e.urgency);
  return {
    at: e.at,
    board: cloneBoard(e.board),
    urgency: e.urgency,
    score: j.score,
    level: j.level,
    verdict: j.verdict,
    action: e.action,
    durationSec: e.action === 'went' ? e.durationSec : 0,
    event: e.event,
    eventByDice: !!e.eventByDice,
    hit: hitOf(j.level, e.action, e.event),
    title: titleOf(j.level, e.action, e.event),
  };
}

function stats(log) {
  const went = log.filter((e) => e.action === 'went');
  const judged = log.filter((e) => e.hit !== null);
  const hits = judged.filter((e) => e.hit === true).length;
  return {
    total: log.length,
    outings: went.length,
    totalSec: went.reduce((s, e) => s + e.durationSec, 0),
    hits,
    judged: judged.length,
    hitRate: judged.length ? hits / judged.length : null,
    missedHomers: went.filter((e) => e.event === 'big').length,
  };
}

function cloneBoard(b) { return { ...b, runners: [...b.runners] }; }

// ---------- URL 인코딩 ----------
// 판정·칭호·적중은 입력에서 결정적으로 다시 계산되므로 원본 입력만 담는다.
function boardToArr(b) {
  return [b.away, b.home, b.inning, b.balls, b.strikes, b.outs,
    (b.runners[0] ? 1 : 0) | (b.runners[1] ? 2 : 0) | (b.runners[2] ? 4 : 0)];
}

function int(v, min, max, fallback) {
  v = Number(v);
  if (!Number.isInteger(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

function arrToBoard(a) {
  if (!Array.isArray(a)) return defaultBoard();
  const bits = int(a[6], 0, 7, 0);
  return {
    away: int(a[0], 0, LIMITS.score, 0),
    home: int(a[1], 0, LIMITS.score, 0),
    inning: int(a[2], 1, LIMITS.inning, 1),
    balls: int(a[3], 0, LIMITS.balls, 0),
    strikes: int(a[4], 0, LIMITS.strikes, 0),
    outs: int(a[5], 0, LIMITS.outs, 0),
    runners: [!!(bits & 1), !!(bits & 2), !!(bits & 4)],
  };
}

function toBase64Url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromBase64Url(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}

const VIEWS = ['home', 'out', 'rec', 'res', 'box'];

function encodeState(s) {
  const obj = {
    k: 1,
    b: boardToArr(s.board),
    u: s.urgency,
    v: VIEWS.indexOf(s.view),
    l: s.todayLog.map((e) => [
      Math.round(e.at / 1000), ...boardToArr(e.board), e.urgency,
      e.action === 'went' ? 1 : 0, e.durationSec, EVENT_KEYS.indexOf(e.event), e.eventByDice ? 1 : 0,
    ]),
  };
  if (s.outing) obj.o = Math.round(s.outing.startedAt / 1000);
  if (s.pending) obj.p = [s.pending.action === 'went' ? 1 : 0, s.pending.durationSec];
  return toBase64Url(JSON.stringify(obj));
}

// 잘못된 값은 버리거나 범위 안으로 맞춘다. 해석 불가면 null.
function decodeState(str) {
  let obj;
  try { obj = JSON.parse(fromBase64Url(str)); } catch (_) { return null; }
  if (!obj || obj.k !== 1) return null;

  const todayLog = (Array.isArray(obj.l) ? obj.l : [])
    .filter((a) => Array.isArray(a) && a.length >= 13)
    .map((a) => buildEntry({
      at: int(a[0], 0, 4e9, 0) * 1000,
      board: arrToBoard(a.slice(1, 8)),
      urgency: int(a[8], 0, 2, 1),
      action: a[9] === 1 ? 'went' : 'held',
      durationSec: int(a[10], 0, 86400, 0),
      event: EVENT_KEYS[int(a[11], 0, 3, 0)],
      eventByDice: a[12] === 1,
    }));

  const outing = Number.isInteger(obj.o) && obj.o > 0 ? { startedAt: obj.o * 1000 } : null;
  const pending = Array.isArray(obj.p)
    ? { action: obj.p[0] === 1 ? 'went' : 'held', durationSec: int(obj.p[1], 0, 86400, 0) }
    : null;

  let view = VIEWS[int(obj.v, 0, VIEWS.length - 1, 0)];
  if (view === 'out' && !outing) view = 'home';
  if (view === 'rec' && !pending) view = 'home';
  if (view === 'res' && !todayLog.length) view = 'home';

  return { board: arrToBoard(obj.b), urgency: int(obj.u, 0, 2, 1), view, outing, pending, todayLog };
}

export {
  VERDICTS, URGENCY, EVENT_KEYS, EVENT_LABELS, LIMITS, VIEWS,
  defaultBoard, cloneBoard, diffOf, inningLabel, runnersLabel, boardSummary,
  clauses, judge, rollDice, titleOf, hitOf, buildEntry, stats,
  encodeState, decodeState,
};
