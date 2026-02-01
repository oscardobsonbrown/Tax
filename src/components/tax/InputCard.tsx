"use client";

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
  const formattedValue = value
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div className="flex flex-col gap-[7px]">
      <label className="text-zinc-600 font-mono text-xs leading-4 shrink-0">
        {label}
      </label>
      <div className="flex h-fit shrink-0 flex-col gap-0 border border-zinc-300 px-3 py-3 w-[512px]">
        <input
          type="text"
          value={formattedValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-black font-mono text-xs leading-16 w-full bg-transparent outline-none"
        />
      </div>
    </div>
  );
}
