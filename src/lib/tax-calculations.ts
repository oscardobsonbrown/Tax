export type Currency = "AUD" | "NOK" | "USD" | "EUR" | "GBP";

export const CURRENCY_NAMES: Record<Currency, string> = {
  AUD: "Australian Dollar",
  NOK: "Norwegian Krone",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AUD: "A$",
  NOK: "kr",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

// Exchange rates (base: 1 AUD)
// These should be updated with real-time rates in production
export const EXCHANGE_RATES: Record<Currency, number> = {
  AUD: 1,
  NOK: 6.8,
  USD: 0.65,
  EUR: 0.60,
  GBP: 0.51,
};

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface TaxBreakdown {
  name: string;
  amount: number;
  rate?: number;
  brackets?: { name: string; amount: number; rate: number }[];
}

export interface TaxResult {
  grossSalary: number;
  taxableIncome: number;
  deductions: {
    standard: number;
    personalAllowance: number;
  };
  taxes: TaxBreakdown[];
  totalTaxes: number;
  netPay: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  workingDaysForTaxes: number;
  employerTax: number;
  totalEmploymentCost: number;
  breakdown: {
    perMonth: number;
    perFortnight: number;
    perDay: number;
    perHour: number;
  };
}

export const norwegianTaxBrackets: TaxBracket[] = [
  { min: 226100, max: 318300, rate: 0.017 },
  { min: 318300, max: 725050, rate: 0.04 },
  { min: 725050, max: 980100, rate: 0.137 },
  { min: 980100, max: 1467200, rate: 0.168 },
  { min: 1467200, max: null, rate: 0.178 },
];

export const australianTaxBrackets: TaxBracket[] = [
  { min: 0, max: 18200, rate: 0 },
  { min: 18200, max: 45000, rate: 0.19 },
  { min: 45000, max: 120000, rate: 0.325 },
  { min: 120000, max: 180000, rate: 0.37 },
  { min: 180000, max: null, rate: 0.45 },
];

export const STANDARD_DEDUCTION = 95700;
export const PERSONAL_ALLOWANCE = 114540;
export const NATIONAL_INSURANCE_RATE = 0.02;
export const GENERAL_TAX_RATE = 0.22;
export const EMPLOYER_TAX_RATE_OSLO = 0.141;
const ANNUAL_WORKING_DAYS = 250;
const ANNUAL_WORKING_HOURS = 2000;

export const AU_MEDICARE_LEVY_RATE = 0.02;
export const AU_MEDICARE_LEVY_LOW_INCOME_THRESHOLD = 23365;
export const AU_SUPERANNUATION_RATE = 0.115;

export function calculateProgressiveTax(
  income: number,
  brackets: TaxBracket[],
) {
  let totalTax = 0;
  const breakdown: { name: string; amount: number; rate: number }[] = [];

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    if (income <= bracket.min) break;

    const taxableInBracket = Math.min(
      income - bracket.min,
      (bracket.max ?? income) - bracket.min,
    );

    if (taxableInBracket > 0) {
      const tax = taxableInBracket * bracket.rate;
      totalTax += tax;
      breakdown.push({
        name: `Bracket ${i + 1} (${(bracket.rate * 100).toFixed(1)}%)`,
        amount: tax,
        rate: bracket.rate,
      });
    }
  }

  return { totalTax, breakdown };
}

export function calculateNorwegianTax(grossSalary: number): TaxResult {
  const taxableIncome = Math.max(
    0,
    grossSalary - STANDARD_DEDUCTION - PERSONAL_ALLOWANCE,
  );

  const nationalInsurance = grossSalary * NATIONAL_INSURANCE_RATE;
  const progressiveTax = calculateProgressiveTax(
    grossSalary,
    norwegianTaxBrackets,
  );
  const generalIncomeTax = taxableIncome * GENERAL_TAX_RATE;

  const totalTaxes =
    nationalInsurance + progressiveTax.totalTax + generalIncomeTax;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate =
    grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = getNorwegianMarginalTaxRate(grossSalary) * 100;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  const employerTax = grossSalary * EMPLOYER_TAX_RATE_OSLO;

  const breakdown = {
    perMonth: netPay / 12,
    perFortnight: netPay / 26,
    perDay: netPay / ANNUAL_WORKING_DAYS,
    perHour: netPay / ANNUAL_WORKING_HOURS,
  };

  return {
    grossSalary,
    taxableIncome,
    deductions: {
      standard: STANDARD_DEDUCTION,
      personalAllowance: PERSONAL_ALLOWANCE,
    },
    taxes: [
      {
        name: "National Insurance",
        amount: nationalInsurance,
        rate: NATIONAL_INSURANCE_RATE,
      },
      {
        name: "Progressive Tax",
        amount: progressiveTax.totalTax,
        brackets: progressiveTax.breakdown,
      },
      {
        name: "General Income Tax",
        amount: generalIncomeTax,
        rate: GENERAL_TAX_RATE,
      },
    ],
    totalTaxes,
    netPay,
    effectiveTaxRate,
    marginalTaxRate,
    workingDaysForTaxes,
    employerTax,
    totalEmploymentCost: grossSalary + employerTax,
    breakdown,
  };
}

function getNorwegianMarginalTaxRate(income: number): number {
  if (income > 1467200) return 0.178;
  if (income > 980100) return 0.168;
  if (income > 725050) return 0.137;
  if (income > 318300) return 0.04;
  if (income > 226100) return 0.017;
  return 0;
}

export function calculateAustralianTax(grossSalary: number): TaxResult {
  const taxableIncome = Math.max(0, grossSalary);

  const incomeTax = calculateProgressiveTax(
    taxableIncome,
    australianTaxBrackets,
  );

  const medicareLevy =
    taxableIncome > AU_MEDICARE_LEVY_LOW_INCOME_THRESHOLD
      ? taxableIncome * AU_MEDICARE_LEVY_RATE
      : 0;

  const totalTaxes = incomeTax.totalTax + medicareLevy;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate =
    grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = getAustralianMarginalTaxRate(grossSalary) * 100;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  const superannuation = grossSalary * AU_SUPERANNUATION_RATE;

  const breakdown = {
    perMonth: netPay / 12,
    perFortnight: netPay / 26,
    perDay: netPay / ANNUAL_WORKING_DAYS,
    perHour: netPay / ANNUAL_WORKING_HOURS,
  };

  return {
    grossSalary,
    taxableIncome,
    deductions: {
      standard: 0,
      personalAllowance: 0,
    },
    taxes: [
      {
        name: "Income Tax",
        amount: incomeTax.totalTax,
        brackets: incomeTax.breakdown,
      },
      {
        name: "Medicare Levy",
        amount: medicareLevy,
        rate: AU_MEDICARE_LEVY_RATE,
      },
    ],
    totalTaxes,
    netPay,
    effectiveTaxRate,
    marginalTaxRate,
    workingDaysForTaxes,
    employerTax: superannuation,
    totalEmploymentCost: grossSalary + superannuation,
    breakdown,
  };
}

function getAustralianMarginalTaxRate(income: number): number {
  if (income > 180000) return 0.45;
  if (income > 120000) return 0.37;
  if (income > 45000) return 0.325;
  if (income > 18200) return 0.19;
  return 0;
}

export function formatCurrency(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
): number {
  if (from === to) return amount;
  const rate = EXCHANGE_RATES[to] / EXCHANGE_RATES[from];
  return amount * rate;
}

export function getCountryCurrency(country: string): Currency {
  switch (country.toLowerCase()) {
    case "no":
    case "norway":
      return "NOK";
    case "au":
    case "australia":
      return "AUD";
    default:
      return "AUD";
  }
}

export function getTaxData(country: string) {
  switch (country.toLowerCase()) {
    case "no":
    case "norway":
      return {
        calculate: calculateNorwegianTax,
        brackets: norwegianTaxBrackets,
        name: "Norway",
        emoji: "🇳🇴",
        location: "Oslo",
        employerRate: "14.1%",
        employerNote:
          "Your employer also pays 14.1% employer tax on top of your salary. This isn't deducted from your pay, but it's part of total cost of employing you.",
        currency: "NOK" as Currency,
      };
    case "au":
    case "australia":
      return {
        calculate: calculateAustralianTax,
        brackets: australianTaxBrackets,
        name: "Australia",
        emoji: "🇦🇺",
        location: "Sydney",
        employerRate: "11.5%",
        employerNote:
          "Your employer pays 11.5% superannuation on top of your salary. This is invested in a super fund for your retirement.",
        currency: "AUD" as Currency,
      };
    default:
      throw new Error(`Country ${country} not supported`);
  }
}
