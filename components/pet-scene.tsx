'use client';
import { useEffect, useState } from 'react';
import { useAnimate } from 'motion/react-mini';
import { useReducedMotion } from 'motion/react';
import { Heart, PawPrint, RotateCcw, Sparkles } from 'lucide-react';

function Dog() {
  return (
    <svg viewBox="0 0 330 390" fill="none" aria-hidden="true">
      <path d="M252 250c45-15 47-60 26-76-12-9-23-5-20 7 14 31-8 37-22 37" fill="#B97C44" />
      <path d="M92 206c-29 36-40 96-19 126 19 26 134 25 156-4 27-34 13-91-20-119" fill="#DBA765" />
      <path d="M126 217c-20 39-19 82-9 107 7 17 53 17 62 0 12-26 4-71-12-107" fill="#F5DDB6" />
      <path
        d="M86 280l-7 56c-15 0-29 5-29 17 0 17 62 20 72 5l4-78M198 280l8 54c18 0 29 6 29 19 0 17-60 21-72 3l-5-75"
        fill="#C98F53"
      />
      <path
        d="M97 355v-8m13 9v-9m74 8v-8m14 8v-8"
        stroke="#98643E"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M93 193c6 14 105 21 116-1l-5 22c-23 16-87 10-106-1z" fill="#2D6353" />
      <circle cx="153" cy="222" r="12" fill="#E7B94E" />
      <path d="M153 216v11m-4-5h8" stroke="#986A2F" strokeWidth="2" strokeLinecap="round" />
      <path d="M105 69C53 64 29 110 51 158c10 22 34 36 47 21l28-79" fill="#B97C44" />
      <path d="M205 69c44-1 63 37 48 84-8 26-28 47-45 31l-24-85" fill="#B97C44" />
      <path d="M79 99c5-54 143-53 153 3l-7 58c-4 44-37 66-75 61-38-2-71-27-75-58z" fill="#E7B778" />
      <path
        d="M97 92c5-18 23-26 39-29-10-7-11-16-7-23 6 10 14 11 22 9 6-11 14-17 26-17-3 10-1 16 8 20 11-7 23-4 29 2-11 2-13 10-10 16"
        fill="#E7B778"
      />
      <ellipse cx="111" cy="128" rx="6" ry="9" fill="#293D32" />
      <ellipse cx="193" cy="128" rx="6" ry="9" fill="#293D32" />
      <circle cx="113" cy="125" r="2" fill="#fff" />
      <circle cx="195" cy="125" r="2" fill="#fff" />
      <path d="M102 105l17-2m66 0 18 3" stroke="#9B673D" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="134" cy="163" rx="30" ry="26" fill="#F7DCB6" />
      <ellipse cx="170" cy="163" rx="30" ry="26" fill="#F7DCB6" />
      <path d="M139 145c4-6 22-6 26 0 2 6-7 14-13 14s-15-8-13-14" fill="#293D32" />
      <path d="M134 178c9 18 28 18 37-1" fill="#734C35" />
      <path d="M146 183c0-4 13-4 14 0l-1 17c-2 9-14 9-16 0z" fill="#DA8C7F" />
      <path
        d="M152 160v10m0 0c-3 7-12 9-18 5m18-5c3 7 12 9 18 5"
        stroke="#734C35"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="98" cy="157" rx="9" ry="5" fill="#D99466" />
      <ellipse cx="209" cy="157" rx="9" ry="5" fill="#D99466" />
    </svg>
  );
}
function Cat() {
  return (
    <svg viewBox="0 0 260 310" fill="none" aria-hidden="true">
      <path d="M188 244c57 4 65-53 46-77-8-10-16-6-16 6 9 29-7 39-30 33" fill="#D18559" />
      <path d="M89 135c-23 35-36 90-18 123 15 23 105 24 126-1 17-22 3-89-23-120" fill="#F6ECDC" />
      <path d="M92 173c-20 11-32 43-23 65l33-5 17-52z" fill="#D18559" />
      <path
        d="M96 222l-2 40c-14 0-24 5-24 13 0 12 44 13 52 2l4-53m24 0 1 39c15 0 25 5 25 13 0 12-43 14-51 1l-4-53"
        fill="#F6ECDC"
      />
      <path
        d="M93 276v-6m13 7v-7m34 7v-7m13 7v-7"
        stroke="#C9BDA7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M79 65 75 18c0-8 7-11 13-5l35 29m23 0 37-29c6-5 13-2 12 6l-1 50" fill="#F6ECDC" />
      <path d="m85 25 3 34 24-13m69-18-24 20 25 14" fill="#D89985" />
      <path d="M65 76c3-50 122-50 138 0 12 43-17 82-69 81-47 0-79-36-69-81" fill="#F6ECDC" />
      <path d="M67 71c4-32 37-40 66-39-3 31-18 54-52 58z" fill="#D18559" />
      <path d="m98 48 7 18m10-24 5 18" stroke="#B76843" strokeWidth="6" strokeLinecap="round" />
      <path
        d="M93 100c5-7 12-7 17 0m46 0c5-7 12-7 17 0"
        stroke="#293D32"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="m128 113 12 0-6 7z" fill="#BD786F" />
      <path
        d="M134 119v7m0 0c-3 6-10 7-14 3m14-3c3 6 9 7 13 3"
        stroke="#6A6C58"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m76 116-26-4m27 13-26 4m140-13 26-4m-27 13 26 4"
        stroke="#8F9078"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="98" cy="118" rx="9" ry="5" fill="#E4BCAF" />
      <ellipse cx="171" cy="118" rx="9" ry="5" fill="#E4BCAF" />
      <path d="M99 149c18 8 52 9 72-1l-3 10c-19 12-51 9-67 0z" fill="#C48275" />
      <circle cx="135" cy="164" r="7" fill="#E7B94E" />
    </svg>
  );
}
export function PetScene() {
  const [scope, animate] = useAnimate();
  const reducedMotion = useReducedMotion();
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    if (reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animations = [
      animate(
        '.scene-dog',
        {
          transform: [
            'translateY(0) rotate(0deg)',
            'translateY(-25px) rotate(-7deg)',
            'translateY(4px) rotate(3deg)',
            'translateY(0) rotate(0deg)',
          ],
        },
        { duration: 1.8, delay: 0.25, ease: 'easeInOut' },
      ),
      animate(
        '.scene-cat',
        {
          transform: [
            'translateY(0) rotate(0deg)',
            'translateY(-15px) rotate(6deg)',
            'translateY(0) rotate(-3deg)',
            'translateY(0) rotate(0deg)',
          ],
        },
        { duration: 1.7, delay: 0.7, ease: 'easeInOut' },
      ),
      animate(
        '.scene-heart',
        {
          transform: [
            'scale(1) rotate(-12deg)',
            'scale(1.25) rotate(8deg)',
            'scale(1) rotate(-12deg)',
          ],
        },
        { duration: 1.2, delay: 0.8, ease: 'easeInOut' },
      ),
      animate(
        '.scene-note',
        {
          transform: [
            'translateY(0) rotate(-5deg)',
            'translateY(-13px) rotate(-8deg)',
            'translateY(0) rotate(-5deg)',
          ],
        },
        { duration: 1.4, delay: 1.2, ease: 'easeInOut' },
      ),
    ];
    return () => animations.forEach((animation) => animation.stop());
  }, [animate, reducedMotion, replay]);
  return (
    <div ref={scope} className="landing-scene">
      <div
        className="landing-pet-art"
        role="img"
        aria-label="Um cão dourado e um gato malhado sentados juntos, rodeados de carinho"
      >
        <div className="scene-backdrop" />
        <div className="scene-orbit scene-orbit-one" />
        <div className="scene-orbit scene-orbit-two" />
        <span className="scene-spark scene-spark-one">
          <Sparkles size={27} />
        </span>
        <span className="scene-spark scene-spark-two">
          <Sparkles size={18} />
        </span>
        <span className="scene-paw">
          <PawPrint size={30} />
        </span>
        <span className="scene-heart">
          <Heart size={31} fill="currentColor" strokeWidth={1.5} />
        </span>
        <div className="scene-ground" />
        <div className="scene-dog">
          <Dog />
        </div>
        <div className="scene-cat">
          <Cat />
        </div>
        <div className="scene-note">
          <span>
            <Heart size={15} />
          </span>
          <div>
            Os melhores amigos.<small>O melhor cuidado.</small>
          </div>
        </div>
        <div className="scene-caption">
          <span /> Aqui, cada patinha conta.
        </div>
        <svg className="scene-sprig" viewBox="0 0 100 160" fill="none">
          <path d="M52 150C43 110 49 60 69 15" stroke="#6D8B66" strokeWidth="3" />
          <path
            d="M53 121c-28 2-39-19-38-27 20-1 33 9 38 27m-3-28c25 0 37-16 38-26-20-3-33 10-38 26m7-28c-24-2-33-21-31-30 19 0 29 11 31 30m8-26c18 3 29-7 30-16-18-5-25 3-30 16"
            fill="#8CA782"
          />
        </svg>
      </div>
      <button
        type="button"
        className="scene-replay"
        onClick={() => setReplay((value) => value + 1)}
        disabled={!!reducedMotion}
        aria-label="Rever a animação dos animais"
      >
        <RotateCcw size={13} /> Rever a entrada
      </button>
    </div>
  );
}
