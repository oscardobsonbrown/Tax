"use client";

import {
  TaxBracket,
  formatCurrency,
  formatRate,
  CURRENCY_SYMBOLS,
  type Currency,
} from "@/lib/tax-calculations";

export default function BracketTable({
  brackets,
  currency = "AUD",
}: {
  brackets: TaxBracket[];
  currency?: Currency;
}) {
  const formatCurrencyWithSymbol = (amount: number): string => {
    return `${CURRENCY_SYMBOLS[currency]}${formatCurrency(amount)}`;
  };

  return (
    <div className="flex flex-col w-full">
      {brackets.map((bracket, index) => (
        <div
          key={index}
          className="flex shrink-0 justify-between border-b border-zinc-300 px-0 py-[9px]"
        >
          <div className="text-black font-mono text-xs leading-4 w-[80%]">
            Bracket {index + 1}: {formatCurrencyWithSymbol(bracket.min)}
            {" - "}
            {bracket.max ? formatCurrencyWithSymbol(bracket.max) : "∞"}
          </div>
          <div className="text-black font-mono text-xs leading-4 text-right w-[20%]">
            {formatRate(bracket.rate * 100)}
          </div>
        </div>
      ))}
    </div>
  );
}
