"use client";

import { useId } from "react";

export default function InputCard({
  label,
  value,
  onChange,
  placeholder = "0",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  const formattedValue = value
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div className="flex flex-col gap-[7px]">
      <label
        className="shrink-0 font-mono text-muted-dark text-xs leading-4"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex h-fit w-full shrink-0 flex-col gap-0 border border-border px-3 py-3">
        <input
          className="w-full bg-transparent font-mono text-foreground text-xs leading-2 outline-none"
          id={id}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type="text"
          value={formattedValue}
        />
      </div>
    </div>
  );
}
