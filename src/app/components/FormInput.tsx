import React from "react";

interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}: FormInputProps) {
  return (
    <div className="mb-1">
      <label className="block mb-2 text-sm font-semibold" style={{ color: "#3D1C1C" }}>
        {label}
        {required && <span style={{ color: "#D95F5F" }} className="ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-colors"
        style={{
          background: "#FFFFFF",
          border: "1.5px solid rgba(244,160,192,0.4)",
          color: "#3D1C1C",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#F4A0C0")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(244,160,192,0.4)")}
      />
    </div>
  );
}
