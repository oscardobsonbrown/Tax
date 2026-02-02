"use client";

import { getTaxData, convertCurrency, type Currency } from "@/lib/tax-calculations";

const TAX_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-400",
  "bg-rose-400",
  "bg-purple-500",
  "bg-cyan-500",
];

interface MiniTaxGraphProps {
  countryCode: string;
  currency: Currency;
  defaultSalary?: number;
}

export default function MiniTaxGraph({
  countryCode,
  currency,
  defaultSalary = 50000,
}: MiniTaxGraphProps) {
  const taxData = getTaxData(countryCode);
  const localCurrency = taxData.currency;

  // Convert default salary to local currency
  const convertedSalary = convertCurrency(defaultSalary, currency, localCurrency);

  // Calculate taxes
  const result = taxData.calculate(convertedSalary);

  // Simple visualization: 20 bars representing income distribution
  const totalBars = 20;

  const getBarCount = (amount: number) => {
    if (result.grossSalary <= 0) return 0;
    return Math.max(0, Math.round((amount / result.grossSalary) * totalBars));
  };

  const taxBarCounts = result.taxes.map((tax) => getBarCount(tax.amount));
  const netPayBarCount = getBarCount(result.netPay);
  const usedBars = taxBarCounts.reduce((sum, count) => sum + count, 0) + netPayBarCount;
  const remainingBars = totalBars - usedBars;

  // Build bars array
  const bars: { color: string }[] = [];

  result.taxes.forEach((_, idx) => {
    const count = taxBarCounts[idx];
    const color = TAX_COLORS[idx % TAX_COLORS.length];
    for (let i = 0; i < count; i++) {
      bars.push({ color });
    }
  });

  for (let i = 0; i < netPayBarCount; i++) {
    bars.push({ color: "bg-zinc-200" });
  }

  for (let i = 0; i < remainingBars; i++) {
    bars.push({ color: "bg-zinc-100" });
  }

  const effectiveRate = result.effectiveTaxRate.toFixed(0);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-[1px] h-2">
        {bars.map((bar, idx) => (
          <div
            key={`mini-bar-${countryCode}-${idx}`}
            className={`flex-1 ${bar.color}`}
          />
        ))}
      </div>
      <div className="text-[10px] text-zinc-500 text-right">
        {effectiveRate}% effective rate
      </div>
    </div>
  );
}
