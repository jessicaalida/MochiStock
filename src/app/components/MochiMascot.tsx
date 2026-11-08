import React from "react";
import mochiLogo from "@/imports/Screenshot_2026-06-23_at_20.46.07.png";

export function MochiMascot() {
  return (
    <div className="flex justify-center mb-4">
      <div className="relative">
        <img
          src={mochiLogo}
          alt="Mascote MochiStock"
          className="w-36 h-36 object-contain drop-shadow-lg"
          style={{ filter: "drop-shadow(0 8px 24px rgba(247,182,210,0.5))" }}
        />
        {/* Sparkles */}
        <span className="absolute -top-2 -right-2 text-xl animate-bounce" style={{ animationDuration: "2s" }}>✨</span>
        <span className="absolute -bottom-1 -left-2 text-base animate-bounce" style={{ animationDelay: "0.8s", animationDuration: "2.5s" }}>⭐</span>
      </div>
    </div>
  );
}
