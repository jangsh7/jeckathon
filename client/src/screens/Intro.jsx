import { useEffect, useState } from 'react';

// 야구신 캐릭터 9종 (빌드 시 함께 묶여 배포된다. 외부 요청 없음)
const GODS = Object.values(
  import.meta.glob('../assets/gods/god-*.png', { eager: true, import: 'default' }),
);
const INTERVAL_MS = 2000;

export default function Intro({ dispatch }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % GODS.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="screen s0">
      <div className="s0-center">
        <div className="s0-gods" aria-hidden="true">
          {GODS.map((src, i) => (
            <img key={src} src={src} alt="" className={i === index ? 'on' : ''} draggable="false" />
          ))}
        </div>
        <h1 className="s0-title"><span>화장실</span> <span>도루</span></h1>
        <p className="s0-desc">
          야구를 관람하는 중<br />
          ‘지금 화장실 가도 되나?’를 <b>야구 신</b>에게 묻고,<br />
          결과를 경기처럼 기록해봐요!
        </p>
      </div>
      <div className="s0-bottom">
        <button className="s0-start" onClick={() => dispatch({ type: 'start' })}>시작하기</button>
      </div>
    </section>
  );
}
