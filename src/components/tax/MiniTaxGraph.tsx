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

  // 10 bars total representing 100% of income (each bar = 10%)
  const totalBars = 10;

  // Calculate how many bars should be tax bars based on effective rate
  const exactTaxBars = (result.effectiveTaxRate / 100) * totalBars;
  const totalTaxBars = Math.max(1, Math.round(exactTaxBars)); // At least 1 bar if any tax

  // Calculate bars for each tax type proportionally
  const totalTaxAmount = result.totalTaxes;
  const bars: { color: string }[] = [];
  let barsAssigned = 0;

  result.taxes.forEach((tax, idx) => {
    const isLastTax = idx === result.taxes.length - 1;
    let count: number;

    if (totalTaxAmount <= 0) {
      count = 0;
    } else if (isLastTax) {
      // Last tax gets remaining bars
      count = totalTaxBars - barsAssigned;
    } else {
      // Proportional allocation
      const proportion = tax.amount / totalTaxAmount;
      count = Math.round(proportion * totalTaxBars);
    }

    count = Math.max(0, Math.min(count, totalTaxBars - barsAssigned));
    barsAssigned += count;

    const color = TAX_COLORS[idx % TAX_COLORS.length];
    for (let i = 0; i < count; i++) {
      bars.push({ color });
    }
  });

  // Fill remaining bars with background (net pay)
  while (bars.length < totalBars) {
    bars.push({ color: "bg-zinc-100" });
  }

  return (
    <div 
      className="flex items-center gap-[2px]"
      title={`${result.effectiveTaxRate.toFixed(1)}% effective tax rate`}
    >
      {bars.map((bar, idx) => (
        <div
          key={`mini-bar-${countryCode}-${idx}`}
          className={`w-[4px] h-4 ${bar.color}`}
        />
      ))}
    </div>
  );
}
