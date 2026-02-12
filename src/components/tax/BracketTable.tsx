"use client";

import {
  CURRENCY_SYMBOLS,
  type Currency,
  formatCurrency,
  formatRate,
  type TaxBracket,
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
    <div className="flex w-full flex-col">
      {brackets.map((bracket, index) => (
        <div
          className="flex shrink-0 justify-between border-border border-b px-0 py-[9px]"
          key={index}
        >
          <div className="w-[80%] font-mono text-foreground text-xs leading-4">
            Bracket {index + 1}: {formatCurrencyWithSymbol(bracket.min)}
            {" - "}
            {bracket.max ? formatCurrencyWithSymbol(bracket.max) : "∞"}
          </div>
          <div className="w-[20%] text-right font-mono text-foreground text-xs leading-4">
            {formatRate(bracket.rate * 100)}
          </div>
        </div>
      ))}
    </div>
  );
}
