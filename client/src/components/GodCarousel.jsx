import { useEffect, useState } from 'react';

// 야구신 캐릭터를 2초마다 크로스페이드로 바꾼다. 전체는 둥실 떠 있다.
export default function GodCarousel({ images, interval = 2000, className = '' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  return (
    <div className={`gods ${className}`} aria-hidden="true">
      {images.map((src, i) => (
        <img key={src} src={src} alt="" className={i === index ? 'on' : ''} draggable="false" />
      ))}
    </div>
  );
}
