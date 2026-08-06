"use client";

import { useRef } from "react";

export function HeroVisual() {
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div
      className="relative flex justify-center items-center"
      onMouseMove={(e) => {
        const img = imgRef.current;
        if (!img) return;
        const moveX = (e.clientX - window.innerWidth / 2) / 100;
        const moveY = (e.clientY - window.innerHeight / 2) / 100;
        img.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }}
    >
      <div className="absolute inset-0 bg-secondary/10 blur-[120px] rounded-full scale-150" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        alt="Advanced SMM Networking Visualization"
        className="relative z-10 w-full max-w-[600px] object-contain drop-shadow-2xl transition-transform"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZYe_kCU0_wnGXKwR2O2YHXCRuvyzLUraSN2vPVQF1aPoUh-L-KlNB7f63UURo8SdKFX6ewi4v_yhslai-MufVOleU2n8cv4Rv5JUZerXTQXKaT62Y-yZ28WlTeuMJQ_d9utFJ7XIUI8U1FlvvB9UshUiqymLz7xZuOiRlaW57OXHUoAx3VUPez_iIT3bvit_V6HjEEJBFRzysjjk5Vaku2Yd9xZ8-GATIIY8oPx2sej1tIoTggNnpK7SvcuohP23NGRdmhsTZ7Lg"
      />
    </div>
  );
}
