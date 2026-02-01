"use client";

import { TaxBracket, formatCurrency, formatRate } from "@/lib/tax-calculations";

export default function BracketTable({ brackets }: { brackets: TaxBracket[] }) {
  return (
    <div className="flex flex-col w-fit">
      {brackets.map((bracket, index) => (
        <div
          key={index}
          className="flex shrink-0 gap-[300px] border-b border-zinc-300 px-0 py-[9px]"
        >
          <div className="text-black font-mono text-xs leading-4">
            Bracket {index + 1}: {formatCurrency(bracket.min)}
            {" - "}
            {bracket.max ? formatCurrency(bracket.max) : "∞"}
          </div>
          <div className="text-black font-mono text-xs leading-4 text-right">
            {formatRate(bracket.rate * 100)}
          </div>
        </div>
      ))}
    </div>
  );
}
