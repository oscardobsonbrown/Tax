"use client";

import { getTaxData, convertCurrency, type Currency } from "@/lib/tax-calculations";

interface MiniTaxGraphProps {
  countryCode: string;
  currency: Currency;
  defaultSalary?: number;
}

export default function MiniTaxGraph({
  countryCode,
  currency,
  defaultSalary = 100000,
}: MiniTaxGraphProps) {
  const taxData = getTaxData(countryCode);
  const localCurrency = taxData.currency;

  // Convert default salary to local currency
  const convertedSalary = convertCurrency(defaultSalary, currency, localCurrency);

  // Calculate taxes
  const result = taxData.calculate(convertedSalary);

  // Simple bar: width represents effective tax rate
  const taxPercentage = Math.min(100, Math.max(0, result.effectiveTaxRate));

  return (
    <div 
      className="w-[60px] h-3 bg-zinc-100 relative"
      title={`${result.effectiveTaxRate.toFixed(1)}% effective tax rate (based on ${defaultSalary.toLocaleString()} ${currency})`}
    >
      <div 
        className="h-full bg-black"
        style={{ width: `${taxPercentage}%` }}
      />
    </div>
  );
}
