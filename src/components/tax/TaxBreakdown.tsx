"use client";

import { useState } from "react";
import {
  TaxBreakdown as TaxBreakdownType,
  formatCurrency,
  formatRate,
  CURRENCY_SYMBOLS,
  type Currency,
} from "@/lib/tax-calculations";

const TAX_COLORS = [
  'bg-blue-600',
  'bg-emerald-600', 
  'bg-amber-500',
  'bg-rose-500',
  'bg-purple-600',
  'bg-cyan-600',
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
  const [hoveredBar, setHoveredBar] = useState<{ type: string; amount: number; index: number; x: number; y: number } | null>(null);
  
  const totalBars = 36;
  
  const getBarCount = (amount: number) => {
    if (grossSalary <= 0) return 0;
    return Math.max(0, Math.round((amount / grossSalary) * totalBars));
  };

  const taxBarCounts = taxes.map(tax => getBarCount(tax.amount));
  const netPayBarCount = getBarCount(netPay);
  const usedBars = taxBarCounts.reduce((sum, count) => sum + count, 0) + netPayBarCount;
  const remainingBars = totalBars - usedBars;

  let barIndex = 0;
  const allBars: { color: string; type: string; amount: number }[] = [];
  
  taxes.forEach((tax, idx) => {
    const count = taxBarCounts[idx];
    const color = TAX_COLORS[idx % TAX_COLORS.length];
    for (let i = 0; i < count; i++) {
      allBars.push({ color, type: tax.name, amount: tax.amount });
      barIndex++;
    }
  });
  
  for (let i = 0; i < netPayBarCount; i++) {
    allBars.push({ color: 'bg-zinc-100', type: 'Net Pay', amount: netPay });
    barIndex++;
  }
  
  for (let i = 0; i < remainingBars; i++) {
    allBars.push({ color: 'bg-zinc-200', type: 'Remaining', amount: 0 });
    barIndex++;
  }

  return (
    <div className="flex flex-col text-black font-mono text-xs leading-4">
      <div className="flex flex-col gap-4">
        {taxes.map((tax, taxIdx) => {
          const taxColor = TAX_COLORS[taxIdx % TAX_COLORS.length];
          const percentage = grossSalary > 0 
            ? ((tax.amount / grossSalary) * 100).toFixed(1)
            : '0.0';
          
          return (
          <div key={`tax-${tax.name}-${taxIdx}`} className="flex flex-col">
            <div className="flex justify-between items-start py-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-3 ${taxColor} shrink-0`} />
                <span>{tax.name}</span>
                <span className="text-zinc-500 text-[10px]">
                  ({percentage}%)
                </span>
              </div>
              <span className="text-zinc-600">
                -{formatCurrencyWithSymbol(tax.amount)}
              </span>
            </div>

            {tax.brackets && (
              <div className="flex flex-col gap-1 pl-4 mt-1">
                {tax.brackets.map((bracket, bracketIdx) => (
                  <div
                    key={`bracket-${tax.name}-${bracketIdx}`}
                    className="flex justify-between text-[10px] text-zinc-500"
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

      <div className="border-t border-zinc-200 my-4"></div>

      <div className="flex justify-between mb-6">
        <span className="text-black font-bold">Total Taxes</span>
        <span className="text-zinc-600">-{formatCurrencyWithSymbol(totalTaxes)}</span>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="text-center text-[10px] text-zinc-400 mb-1">
          Each bar represents {formatCurrencyWithSymbol(grossSalary / 36)} of income
        </div>
        
        <div 
          className="relative flex gap-0.5 h-12 items-center justify-center"
          role="presentation"
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
                y: 0 
              });
            }
          }}
          onMouseLeave={() => setHoveredBar(null)}
        >
          {allBars.map((bar, idx) => (
            <div
              key={`income-bar-${idx}`}
              className={`w-[2px] h-12 shrink-0 ${bar.color}`}
            />
          ))}
          
          {hoveredBar && (
            <div
              className="absolute bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none -top-8"
              style={{
                left: hoveredBar.x,
                transform: 'translateX(-50%)'
              }}
            >
              {hoveredBar.type}: {formatCurrencyWithSymbol(hoveredBar.amount)}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
