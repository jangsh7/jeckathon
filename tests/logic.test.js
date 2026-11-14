// 실행: node tests/logic.test.js
import assert from 'node:assert/strict';
import * as L from '../client/src/logic.js';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('ok  ', name); }
  catch (e) { console.error('FAIL', name); console.error(e.message); process.exitCode = 1; }
}

function board(inning, away, home, balls, strikes, outs, runners) {
  return { away, home, inning, balls, strikes, outs, runners };
}
const NONE = [false, false, false];
const FULL = [true, true, true];

// 8장 수용 기준
const cases = [
  ['T1', board(1, 0, 0, 0, 0, 0, NONE), 1, 31, '허가'],
  ['T2', board(7, 3, 2, 1, 1, 1, [false, true, false]), 1, 56, '조건부 허가'],
  ['T3', board(8, 4, 3, 0, 0, 1, FULL), 1, 64, '불허'],
  ['T4', board(9, 2, 2, 3, 2, 0, FULL), 2, 72, '조건부 허가'],
  ['T5', board(8, 7, 1, 0, 0, 2, NONE), 1, 27, '허가'],
  ['T6', board(1, 0, 0, 0, 0, 0, NONE), 0, 41, '조건부 허가'],
];
for (const [id, b, u, score, verdict] of cases) {
  test(`${id} ${score}점 ${verdict}`, () => {
    const j = L.judge(b, u);
    assert.equal(j.score, score);
    assert.equal(j.verdict, verdict);
  });
}

test('T2 조건 문구: 이 타자 승부', () => {
  assert.equal(L.judge(cases[1][1], 1).condition, '이 타자 승부가 끝나면 출발');
});
test('T4 특례 3 → 특례 4', () => {
  assert.deepEqual(L.judge(cases[3][1], 2).specials.map((s) => s.n), [3, 4]);
});
test('T5 특례 1·2 미적용', () => {
  assert.equal(L.judge(cases[4][1], 1).specials.length, 0);
});
test('2아웃 조건부 → 공수교대 때 출발', () => {
  const j = L.judge(board(7, 3, 2, 0, 0, 2, [false, true, false]), 1); // 25+15+12+2 = 54
  assert.equal(j.level, 1);
  assert.equal(j.condition, '공수교대 때 출발');
});
test('긴장도 0 미만은 0', () => {
  assert.equal(L.judge(board(1, 10, 0, 0, 0, 2, NONE), 2).score, 0);
});

test('FR-04 한계면 어떤 상황에서도 불허 없음', () => {
  for (let i = 1; i <= 10; i++) for (let d = 0; d <= 6; d++) for (let bl = 0; bl <= 3; bl++)
    for (let s = 0; s <= 2; s++) for (let o = 0; o <= 2; o++) for (let r = 0; r < 8; r++) {
      const b = board(i, d, 0, bl, s, o, [!!(r & 1), !!(r & 2), !!(r & 4)]);
      assert.notEqual(L.judge(b, 2).level, 2);
    }
});

test('🎲 확률 경계', () => {
  const seq = (...xs) => () => xs.shift();
  assert.equal(L.rollDice(0, seq(0.1499)), 'small');   // 발생, 크기 소형(big 0)
  assert.equal(L.rollDice(0, seq(0.15)), 'none');
  assert.equal(L.rollDice(100, seq(0.74, 0.39)), 'big'); // p=0.75, big=0.4
  assert.equal(L.rollDice(100, seq(0.74, 0.74)), 'mid');
  assert.equal(L.rollDice(100, seq(0.74, 0.75)), 'small');
  assert.equal(L.rollDice(100, seq(0.75)), 'none');
});

test('칭호·적중 매트릭스', () => {
  const expect = [
    [0, 'went', 'none', '신의 축복', true], [0, 'went', 'big', '신도 몰랐다', false],
    [0, 'held', 'small', '괜히 참음', null], [0, 'held', 'mid', '촉 좋은 팬', null],
    [1, 'went', 'small', '모범 관람객', true], [1, 'went', 'mid', '타이밍의 배신', false],
    [1, 'held', 'none', '소심한 신중함', null], [1, 'held', 'big', '참은 보람', null],
    [2, 'went', 'none', '신탁 무시, 운 좋게 생존', false], [2, 'went', 'big', '경고를 무시한 대가', true],
    [2, 'held', 'small', '억울 카드', null], [2, 'held', 'mid', '참은 보람', null],
  ];
  for (const [lv, act, ev, title, hit] of expect) {
    assert.equal(L.titleOf(lv, act, ev), title);
    assert.equal(L.hitOf(lv, act, ev), hit);
  }
});

test('누적 지표', () => {
  const log = [
    L.buildEntry({ at: 1, board: cases[2][1], urgency: 1, action: 'went', durationSec: 184, event: 'big', eventByDice: true }), // 불허+big ✅
    L.buildEntry({ at: 2, board: cases[0][1], urgency: 1, action: 'went', durationSec: 60, event: 'mid' }),  // 허가+mid ❌
    L.buildEntry({ at: 3, board: cases[0][1], urgency: 1, action: 'held', durationSec: 99, event: 'big' }), // 참음
  ];
  const s = L.stats(log);
  assert.equal(s.outings, 2);
  assert.equal(s.totalSec, 244);
  assert.equal(s.hitRate, 0.5);
  assert.equal(s.missedHomers, 1);
  assert.equal(log[2].durationSec, 0);
});

test('URL 인코딩 왕복', () => {
  const state = {
    board: cases[1][1], urgency: 2, view: 'res', outing: null, holding: null, pending: null,
    todayLog: [L.buildEntry({ at: 1731561600000, board: cases[3][1], urgency: 2, action: 'went', durationSec: 184, event: 'big', eventByDice: true })],
  };
  const enc = L.encodeState(state);
  assert.match(enc, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(L.decodeState(enc), state);
});

test('외출 중·복귀 대기 상태 왕복', () => {
  const base = { board: L.defaultBoard(), urgency: 1, todayLog: [] };
  const out = L.decodeState(L.encodeState({ ...base, view: 'out', outing: { startedAt: 1731561600000 }, pending: null }));
  assert.equal(out.view, 'out');
  assert.equal(out.outing.startedAt, 1731561600000);
  const rec = L.decodeState(L.encodeState({ ...base, view: 'rec', outing: null, pending: { action: 'went', durationSec: 42 } }));
  assert.deepEqual(rec.pending, { action: 'went', durationSec: 42 });
});

test('망가진 URL은 null 또는 범위 보정', () => {
  assert.equal(L.decodeState('!!!'), null);
  assert.equal(L.decodeState(btoa('{"k":2}')), null);
  const s = L.decodeState(btoa(JSON.stringify({ k: 1, b: [99, -3, 50, 9, 9, 9, 99], u: 7, v: 3 })));
  assert.deepEqual(s.board, { away: 20, home: 0, inning: 10, balls: 3, strikes: 2, outs: 2, runners: [true, true, true] }); // 주자 비트 99 → 7
  assert.equal(s.urgency, 2);
  assert.equal(s.view, 'home'); // 기록 없이 결과 화면 요청 → 홈
});

test('기록 30건도 URL 2000자 이내', () => {
  const e = L.buildEntry({ at: 1731561600000, board: cases[3][1], urgency: 2, action: 'went', durationSec: 1234, event: 'big', eventByDice: true });
  const enc = L.encodeState({ board: L.defaultBoard(), urgency: 1, view: 'box', outing: null, pending: null, todayLog: Array(30).fill(e) });
  assert.ok(enc.length < 2000, `length ${enc.length}`);
});

// 정책서 4-3-1 분기 검증 케이스 C1~C9
const R1 = [true, false, false];
const cheerCases = [
  ['C1', board(8, 7, 1, 0, 0, 2, NONE), 1, 'out2'],
  ['C2', board(8, 4, 3, 0, 0, 1, FULL), 1, 'high'],
  ['C3', board(4, 0, 0, 1, 2, 0, R1), 2, 'limit'],
  ['C4', board(7, 3, 2, 1, 1, 1, [false, true, false]), 1, 'base'],
  ['C5', board(9, 2, 2, 3, 2, 2, FULL), 1, 'out2'],
  ['C6', board(1, 8, 0, 0, 0, 2, NONE), 2, 'out2'],
  ['C7', board(9, 2, 2, 3, 2, 0, FULL), 2, 'high'],
  ['C8', board(4, 0, 0, 1, 2, 0, R1), 0, 'base'],
  ['C9', board(4, 0, 0, 3, 2, 1, R1), 0, 'high'],
];
for (const [id, b, u, branch] of cheerCases) {
  test(`${id} 응원 분기 ${branch}`, () => assert.equal(L.cheerBranch(b, u), branch));
}

test('응원 문구: 고정 난수 0 / 0.5 / 0.99 → 첫째·가운데·마지막, 대표 문구 포함', () => {
  const b = cheerCases[3][1];
  const pool = L.CHEER_POOL.base;
  assert.equal(L.cheerText(b, 1, L.pickCheerIndex(b, 1, () => 0)), pool[0]);
  assert.equal(L.cheerText(b, 1, L.pickCheerIndex(b, 1, () => 0.5)), pool[1]);
  assert.equal(L.cheerText(b, 1, L.pickCheerIndex(b, 1, () => 0.99)), pool[2]);
  assert.equal(L.CHEER_POOL.out2[0], '곧 공수교대입니다');
  assert.equal(L.CHEER_POOL.high[0], '지금 나가면 평생 후회합니다');
  assert.equal(L.CHEER_POOL.limit[0], '정 급하면 다녀오세요');
  assert.equal(pool[0], '이번 이닝까지 한 번 참아보시죠');
});

test('상황 리마인드 표기', () => {
  assert.equal(L.reminderText(board(7, 0, 0, 0, 0, 1, NONE)), '현재 7회 1아웃 · 3아웃까지 2개');
  assert.equal(L.reminderText(board(9, 0, 0, 0, 0, 2, NONE)), '현재 9회 2아웃 · 3아웃까지 1개');
  assert.equal(L.reminderText(board(10, 0, 0, 0, 0, 0, NONE)), '현재 연장 0아웃 · 3아웃까지 3개');
});

test('참는 중 상태 왕복', () => {
  const s = { board: L.defaultBoard(), urgency: 1, view: 'hold', outing: null, holding: { startedAt: 1731561600000, cheerIdx: 2 }, pending: null, todayLog: [] };
  assert.deepEqual(L.decodeState(L.encodeState(s)), s);
  assert.equal(L.decodeState(L.encodeState({ ...s, holding: null })).view, 'home');
});

console.log(`\n${passed} passed`);
