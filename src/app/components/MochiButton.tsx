import React from "react";
import { LucideIcon } from "lucide-react";

interface MochiButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function MochiButton({
  children,
  onClick,
  icon: Icon,
  variant = "primary",
  fullWidth = false,
  type = "button",
  disabled = false,
}: MochiButtonProps) {
  const base =
    "flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-2xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-sm tracking-wide";

  const variants = {
    primary: "text-white hover:opacity-90",
    secondary: "bg-white hover:bg-[#FDF0F5]",
    danger: "text-white hover:opacity-90",
  };

  const inlineStyle =
    variant === "primary"
      ? { background: "linear-gradient(135deg, #F4A0C0 0%, #E8839E 100%)", color: "#FFFFFF", border: "none" }
      : variant === "secondary"
      ? { background: "#FFFFFF", color: "#3D1C1C", border: "1.5px solid rgba(244,160,192,0.5)" }
      : { background: "linear-gradient(135deg, #D95F5F 0%, #C04040 100%)", color: "#FFFFFF", border: "none" };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      style={inlineStyle}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </button>
  );
}
