"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/** The Pawprints hero cat — the Lottie animation from the brand prompt. */
export function CatLottie({ className }: { className?: string }) {
  return (
    <DotLottieReact
      src="https://lottie.host/8cf4ba71-e5fb-44f3-8134-178c4d389417/0CCsdcgNIP.json"
      loop
      autoplay
      className={className}
    />
  );
}
