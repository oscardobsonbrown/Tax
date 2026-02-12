"use client";

import { useState } from "react";
import {
  CURRENCY_SYMBOLS,
  type Currency,
  formatCurrency,
  type TaxBreakdown as TaxBreakdownType,
} from "@/lib/tax-calculations";

const TAX_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-rose-500",
  "bg-purple-600",
  "bg-cyan-600",
];

export default function TaxBreakdown({
  taxes,
  totalTaxes,
  grossSalary,
  netPay,
  currency = "AUD",
}: {
  taxes: TaxBreakdownType[];
  totalTaxes: number;
  grossSalary: number;
  netPay: number;
  currency?: Currency;
}) {
  const formatCurrencyWithSymbol = (amount: number): string => {
    return `${CURRENCY_SYMBOLS[currency]}${formatCurrency(amount)}`;
  };
  const [hoveredBar, setHoveredBar] = useState<{
    type: string;
    amount: number;
    index: number;
    x: number;
    y: number;
  } | null>(null);

  const totalBars = 36;

  const getBarCount = (amount: number) => {
    if (grossSalary <= 0) {
      return 0;
    }
    return Math.max(0, Math.round((amount / grossSalary) * totalBars));
  };

  const taxBarCounts = taxes.map((tax) => getBarCount(tax.amount));
  const netPayBarCount = getBarCount(netPay);
  const usedBars =
    taxBarCounts.reduce((sum, count) => sum + count, 0) + netPayBarCount;
  const remainingBars = totalBars - usedBars;

  const allBars: { color: string; type: string; amount: number }[] = [];

  taxes.forEach((tax, idx) => {
    const count = taxBarCounts[idx];
    const color = TAX_COLORS[idx % TAX_COLORS.length];
    for (let i = 0; i < count; i++) {
      allBars.push({ color, type: tax.name, amount: tax.amount });
    }
  });

  for (let i = 0; i < netPayBarCount; i++) {
    allBars.push({ color: "bg-chart-bar", type: "Net Pay", amount: netPay });
  }

  for (let i = 0; i < remainingBars; i++) {
    allBars.push({ color: "bg-chart-bar-alt", type: "Remaining", amount: 0 });
  }

  return (
    <div className="flex flex-col font-mono text-foreground text-xs leading-4">
      <div className="flex flex-col gap-4">
        {taxes.map((tax, taxIdx) => {
          const taxColor = TAX_COLORS[taxIdx % TAX_COLORS.length];
          const percentage =
            grossSalary > 0
              ? ((tax.amount / grossSalary) * 100).toFixed(1)
              : "0.0";

          return (
            <div className="flex flex-col" key={`tax-${tax.name}-${taxIdx}`}>
              <div className="flex items-start justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-2 ${taxColor} shrink-0`} />
                  <span>{tax.name}</span>
                  <span className="text-[10px] text-muted">
                    ({percentage}%)
                  </span>
                </div>
                <span className="text-muted-dark">
                  -{formatCurrencyWithSymbol(tax.amount)}
                </span>
              </div>

              {tax.brackets && (
                <div className="mt-1 flex flex-col gap-1 pl-4">
                  {tax.brackets.map((bracket, bracketIdx) => (
                    <div
                      className="flex justify-between text-[10px] text-muted"
                      key={`bracket-${tax.name}-${bracketIdx}`}
                    >
                      <span>{bracket.name}</span>
                      <span>-{formatCurrencyWithSymbol(bracket.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="my-4 border-border-light border-t" />

      <div className="mb-6 flex justify-between">
        <span className="font-bold text-foreground">Total Taxes</span>
        <span className="text-muted-dark">
          -{formatCurrencyWithSymbol(totalTaxes)}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="mb-1 text-center text-[10px] text-muted-light">
          Each bar represents {formatCurrencyWithSymbol(grossSalary / 36)} of
          income
        </div>

        <div
          className="relative flex h-12 items-center justify-center gap-0.5"
          onMouseLeave={() => setHoveredBar(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const chartWidth = allBars.length * 4;
            const offsetX = (rect.width - chartWidth) / 2;
            const x = e.clientX - rect.left - offsetX;
            const barIndex = Math.floor(x / 4);
            if (barIndex >= 0 && barIndex < allBars.length) {
              const bar = allBars[barIndex];
              setHoveredBar({
                type: bar.type,
                amount: bar.amount,
                index: barIndex,
                x: offsetX + barIndex * 4 + 1,
                y: 0,
              });
            }
          }}
          role="presentation"
        >
          {allBars.map((bar, idx) => (
            <div
              className={`h-12 w-[2px] shrink-0 ${bar.color}`}
              key={`income-bar-${idx}`}
            />
          ))}

          {hoveredBar && (
            <div
              className="pointer-events-none absolute -top-8 z-10 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background"
              style={{
                left: hoveredBar.x,
                transform: "translateX(-50%)",
              }}
            >
              {hoveredBar.type}: {formatCurrencyWithSymbol(hoveredBar.amount)}
              <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
