// 빌드에 포함되는 캐릭터 이미지 (외부 요청 없음)
const sorted = (mods) => Object.keys(mods).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((k) => mods[k]);

// 웃는 야구신 9종 — 시작 화면, 참는 중
export const HAPPY_GODS = sorted(import.meta.glob('./gods/god-*.png', { eager: true, import: 'default' }));

// 불안한 야구신 9종 — 외출 중
export const ANXIOUS_GODS = sorted(import.meta.glob('./anxious/anx-*.png', { eager: true, import: 'default' }));
