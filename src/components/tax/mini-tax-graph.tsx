"use client";

import {
  type Currency,
  convertCurrency,
  formatCurrency,
  getTaxData,
} from "@/lib/tax-calculations";

interface MiniTaxGraphProps {
  countryCode: string;
  currency: Currency;
  salary?: string;
}

export default function MiniTaxGraph({
  countryCode,
  currency,
  salary,
}: MiniTaxGraphProps) {
  const taxData = getTaxData(countryCode);
  const localCurrency = taxData.currency;

  // Parse salary input or use default of 100,000
  const salaryNum = salary ? Number.parseInt(salary.replace(/\s/g, ""), 10) : 0;
  const defaultSalary = 100_000;
  const baseSalary = salaryNum > 0 ? salaryNum : defaultSalary;

  // Convert salary to local currency
  const convertedSalary = convertCurrency(baseSalary, currency, localCurrency);

  // Calculate taxes
  const result = taxData.calculate(convertedSalary);

  // Simple bar: width represents effective tax rate
  const taxPercentage = Math.min(100, Math.max(0, result.effectiveTaxRate));

  return (
    <div
      className="relative h-3 w-[60px] bg-surface"
      title={`${result.effectiveTaxRate.toFixed(1)}% effective tax rate (based on ${formatCurrency(baseSalary)} ${currency})`}
    >
      <div
        className="h-full bg-foreground"
        style={{ width: `${taxPercentage}%` }}
      />
    </div>
  );
}
