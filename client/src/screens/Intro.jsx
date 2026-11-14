import GodCarousel from '../components/GodCarousel.jsx';
import { HAPPY_GODS } from '../assets/index.js';

export default function Intro({ dispatch }) {
  return (
    <section className="screen s0">
      <div className="s0-center">
        <GodCarousel images={HAPPY_GODS} className="s0-gods" />
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
