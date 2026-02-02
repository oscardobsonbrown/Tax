export type Currency = "AUD" | "NOK" | "USD" | "EUR" | "GBP" | "CHF" | "MXN" | "JPY";

export const CURRENCY_NAMES: Record<Currency, string> = {
  AUD: "Australian Dollar",
  NOK: "Norwegian Krone",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  CHF: "Swiss Franc",
  MXN: "Mexican Peso",
  JPY: "Japanese Yen",
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AUD: "A$",
  NOK: "kr",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CHF: "CHF",
  MXN: "$",
  JPY: "¥",
};

// Exchange rates (base: 1 AUD)
// These should be updated with real-time rates in production
export const EXCHANGE_RATES: Record<Currency, number> = {
  AUD: 1,
  NOK: 6.8,
  USD: 0.65,
  EUR: 0.60,
  GBP: 0.51,
  CHF: 0.58,
  MXN: 13.5,
  JPY: 98,
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

// ==================== FRANCE TAX CONSTANTS ====================
export const frenchTaxBrackets: TaxBracket[] = [
  { min: 0, max: 11497, rate: 0 },
  { min: 11497, max: 29315, rate: 0.11 },
  { min: 29315, max: 83823, rate: 0.30 },
  { min: 83823, max: 180294, rate: 0.41 },
  { min: 180294, max: null, rate: 0.45 },
];

// Social contributions (employee portion) - approximate rates
export const FR_SOCIAL_SECURITY_RATE = 0.082; // ~8.2% for employees

// ==================== SPAIN TAX CONSTANTS ====================
export const spanishTaxBrackets: TaxBracket[] = [
  { min: 0, max: 12450, rate: 0.19 },
  { min: 12450, max: 20200, rate: 0.24 },
  { min: 20200, max: 35200, rate: 0.30 },
  { min: 35200, max: 60000, rate: 0.37 },
  { min: 60000, max: 300000, rate: 0.45 },
  { min: 300000, max: null, rate: 0.47 },
];

// Spanish social security (employee contribution)
export const ES_SOCIAL_SECURITY_RATE = 0.0635; // ~6.35% average

// ==================== GREECE TAX CONSTANTS ====================
export const greekTaxBrackets2026: TaxBracket[] = [
  { min: 0, max: 10000, rate: 0.09 },
  { min: 10000, max: 20000, rate: 0.20 },
  { min: 20000, max: 30000, rate: 0.26 },
  { min: 30000, max: 40000, rate: 0.34 },
  { min: 40000, max: 60000, rate: 0.39 },
  { min: 60000, max: null, rate: 0.44 },
];

// Greek social security (employee portion)
export const GR_SOCIAL_SECURITY_RATE = 0.1387; // ~13.87%

// Solidarity contribution for high earners
export const GR_SOLIDARITY_THRESHOLD = 30000;
export const GR_SOLIDARITY_RATE = 0.022;

// ==================== AUSTRIA TAX CONSTANTS ====================
export const austrianTaxBrackets2026: TaxBracket[] = [
  { min: 0, max: 13541, rate: 0 },
  { min: 13541, max: 21992, rate: 0.20 },
  { min: 21992, max: 36458, rate: 0.30 },
  { min: 36458, max: 70365, rate: 0.40 },
  { min: 70365, max: 104859, rate: 0.48 },
  { min: 104859, max: 1000000, rate: 0.50 },
  { min: 1000000, max: null, rate: 0.55 },
];

// Austrian social security (employee contribution)
export const AT_SOCIAL_SECURITY_RATE = 0.1807; // ~18.07%

// ==================== SWITZERLAND (ZURICH) TAX CONSTANTS ====================
// Zurich combined federal, cantonal, and municipal rates (approximate for city of Zurich)
export const swissZurichTaxBrackets: TaxBracket[] = [
  { min: 0, max: 30000, rate: 0.02 },
  { min: 30000, max: 60000, rate: 0.08 },
  { min: 60000, max: 100000, rate: 0.15 },
  { min: 100000, max: 150000, rate: 0.22 },
  { min: 150000, max: 250000, rate: 0.28 },
  { min: 250000, max: null, rate: 0.35 },
];

// AHV/IV/EO (pension) - employee contribution
export const CH_SOCIAL_SECURITY_RATE = 0.057; // ~5.7%

// ==================== MEXICO TAX CONSTANTS ====================
export const mexicanTaxBrackets: TaxBracket[] = [
  { min: 0, max: 7735, rate: 0.0192 },
  { min: 7735, max: 65643, rate: 0.064 },
  { min: 65643, max: 115375, rate: 0.1088 },
  { min: 115375, max: 134119, rate: 0.16 },
  { min: 134119, max: 160577, rate: 0.1792 },
  { min: 160577, max: 323862, rate: 0.2136 },
  { min: 323862, max: 510451, rate: 0.2352 },
  { min: 510451, max: 974535, rate: 0.30 },
  { min: 974535, max: 1299380, rate: 0.32 },
  { min: 1299380, max: 3898140, rate: 0.34 },
  { min: 3898140, max: null, rate: 0.35 },
];

// Mexican social security (employee contribution)
export const MX_SOCIAL_SECURITY_RATE = 0.02875; // ~2.875%

// ==================== PORTUGAL TAX CONSTANTS ====================
export const portugueseTaxBrackets: TaxBracket[] = [
  { min: 0, max: 8059, rate: 0.1325 },
  { min: 8059, max: 12160, rate: 0.165 },
  { min: 12160, max: 17233, rate: 0.22 },
  { min: 17233, max: 22306, rate: 0.25 },
  { min: 22306, max: 28400, rate: 0.32 },
  { min: 28400, max: 41629, rate: 0.355 },
  { min: 41629, max: 44987, rate: 0.435 },
  { min: 44987, max: 83696, rate: 0.45 },
  { min: 83696, max: null, rate: 0.48 },
];

// Portuguese social security (employee contribution)
export const PT_SOCIAL_SECURITY_RATE = 0.11; // 11%

// Solidarity surcharge thresholds
export const PT_SOLIDARITY_THRESHOLD_1 = 80000;
const PT_SOLIDARITY_THRESHOLD_2 = 250000;
export const PT_SOLIDARITY_RATE_1 = 0.025;
const PT_SOLIDARITY_RATE_2 = 0.05;

// ==================== JAPAN TAX CONSTANTS ====================
export const japaneseTaxBrackets: TaxBracket[] = [
  { min: 0, max: 1950000, rate: 0.05 },
  { min: 1950000, max: 3300000, rate: 0.10 },
  { min: 3300000, max: 6950000, rate: 0.20 },
  { min: 6950000, max: 9000000, rate: 0.23 },
  { min: 9000000, max: 18000000, rate: 0.33 },
  { min: 18000000, max: 40000000, rate: 0.40 },
  { min: 40000000, max: null, rate: 0.45 },
];

// Japanese social insurance (health + pension + unemployment) - approximate
export const JP_SOCIAL_INSURANCE_RATE = 0.135; // ~13.5% (varies by age/region)

// Residence tax (local inhabitant tax) - roughly 10%
export const JP_RESIDENCE_TAX_RATE = 0.10;

// ==================== ESTONIA TAX CONSTANTS ====================
export const ESTONIA_FLAT_TAX_RATE = 0.22; // 22% flat rate for 2026
export const ESTONIA_TAX_FREE_ALLOWANCE = 8400; // €8,400 annual

// Estonian social tax (paid by employer, but we track it)
export const EE_SOCIAL_TAX_PAID_BY_EMPLOYER = 0.33; // 33% paid by employer
export const EE_UNEMPLOYMENT_INSURANCE_EMPLOYEE = 0.016; // 1.6% employee
export const EE_UNEMPLOYMENT_INSURANCE_EMPLOYER = 0.008; // 0.8% employer
export const EE_PENSION_EMPLOYEE = 0.02; // 2% employee (mandatory funded pension)

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

// ==================== FRANCE TAX CALCULATION ====================
export function calculateFrenchTax(grossSalary: number): TaxResult {
  const taxableIncome = Math.max(0, grossSalary);

  const incomeTax = calculateProgressiveTax(taxableIncome, frenchTaxBrackets);
  const socialContributions = grossSalary * FR_SOCIAL_SECURITY_RATE;

  const totalTaxes = incomeTax.totalTax + socialContributions;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate = grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = getFrenchMarginalTaxRate(grossSalary) * 100;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  // Employer contributions in France (~40-45% total, employee portion already deducted)
  const employerTax = grossSalary * 0.35; // Approximate employer contributions

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
        name: "Social Contributions",
        amount: socialContributions,
        rate: FR_SOCIAL_SECURITY_RATE,
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

function getFrenchMarginalTaxRate(income: number): number {
  if (income > 180294) return 0.45;
  if (income > 83823) return 0.41;
  if (income > 29315) return 0.30;
  if (income > 11497) return 0.11;
  return 0;
}

// ==================== SPAIN TAX CALCULATION ====================
export function calculateSpanishTax(grossSalary: number): TaxResult {
  const taxableIncome = Math.max(0, grossSalary);

  const incomeTax = calculateProgressiveTax(taxableIncome, spanishTaxBrackets);
  const socialSecurity = grossSalary * ES_SOCIAL_SECURITY_RATE;

  const totalTaxes = incomeTax.totalTax + socialSecurity;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate = grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = getSpanishMarginalTaxRate(grossSalary) * 100;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  // Spanish employer social security (~23-30% depending on conditions)
  const employerTax = grossSalary * 0.25;

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
        name: "Income Tax (IRPF)",
        amount: incomeTax.totalTax,
        brackets: incomeTax.breakdown,
      },
      {
        name: "Social Security",
        amount: socialSecurity,
        rate: ES_SOCIAL_SECURITY_RATE,
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

function getSpanishMarginalTaxRate(income: number): number {
  if (income > 300000) return 0.47;
  if (income > 60000) return 0.45;
  if (income > 35200) return 0.37;
  if (income > 20200) return 0.30;
  if (income > 12450) return 0.24;
  return 0.19;
}

// ==================== GREECE TAX CALCULATION ====================
export function calculateGreekTax(grossSalary: number): TaxResult {
  const taxableIncome = Math.max(0, grossSalary);

  const incomeTax = calculateProgressiveTax(taxableIncome, greekTaxBrackets2026);
  const socialSecurity = grossSalary * GR_SOCIAL_SECURITY_RATE;

  // Solidarity contribution for income > €30,000
  const solidarityTax =
    taxableIncome > GR_SOLIDARITY_THRESHOLD
      ? taxableIncome * GR_SOLIDARITY_RATE
      : 0;

  const totalTaxes = incomeTax.totalTax + socialSecurity + solidarityTax;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate = grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = getGreekMarginalTaxRate(grossSalary) * 100;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  // Greek employer contributions (~22%)
  const employerTax = grossSalary * 0.22;

  const breakdown = {
    perMonth: netPay / 12,
    perFortnight: netPay / 26,
    perDay: netPay / ANNUAL_WORKING_DAYS,
    perHour: netPay / ANNUAL_WORKING_HOURS,
  };

  const taxes: TaxBreakdown[] = [
    {
      name: "Income Tax",
      amount: incomeTax.totalTax,
      brackets: incomeTax.breakdown,
    },
    {
      name: "Social Security",
      amount: socialSecurity,
      rate: GR_SOCIAL_SECURITY_RATE,
    },
  ];

  if (solidarityTax > 0) {
    taxes.push({
      name: "Solidarity Contribution",
      amount: solidarityTax,
      rate: GR_SOLIDARITY_RATE,
    });
  }

  return {
    grossSalary,
    taxableIncome,
    deductions: {
      standard: 0,
      personalAllowance: 0,
    },
    taxes,
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

function getGreekMarginalTaxRate(income: number): number {
  if (income > 60000) return 0.44;
  if (income > 40000) return 0.39;
  if (income > 30000) return 0.34;
  if (income > 20000) return 0.26;
  if (income > 10000) return 0.20;
  return 0.09;
}

// ==================== AUSTRIA TAX CALCULATION ====================
export function calculateAustrianTax(grossSalary: number): TaxResult {
  const taxableIncome = Math.max(0, grossSalary);

  const incomeTax = calculateProgressiveTax(taxableIncome, austrianTaxBrackets2026);
  const socialSecurity = grossSalary * AT_SOCIAL_SECURITY_RATE;

  const totalTaxes = incomeTax.totalTax + socialSecurity;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate = grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = getAustrianMarginalTaxRate(grossSalary) * 100;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  // Austrian employer contributions (~21%)
  const employerTax = grossSalary * 0.21;

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
        name: "Social Security",
        amount: socialSecurity,
        rate: AT_SOCIAL_SECURITY_RATE,
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

function getAustrianMarginalTaxRate(income: number): number {
  if (income > 1000000) return 0.55;
  if (income > 104859) return 0.50;
  if (income > 70365) return 0.48;
  if (income > 36458) return 0.40;
  if (income > 21992) return 0.30;
  if (income > 13541) return 0.20;
  return 0;
}

// ==================== SWITZERLAND (ZURICH) TAX CALCULATION ====================
export function calculateSwissZurichTax(grossSalary: number): TaxResult {
  const taxableIncome = Math.max(0, grossSalary);

  // Combined federal, cantonal, and municipal tax for Zurich city
  const incomeTax = calculateProgressiveTax(taxableIncome, swissZurichTaxBrackets);
  const socialSecurity = grossSalary * CH_SOCIAL_SECURITY_RATE;

  const totalTaxes = incomeTax.totalTax + socialSecurity;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate = grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = getSwissMarginalTaxRate(grossSalary) * 100;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  // Swiss employer contributions (~8-12%)
  const employerTax = grossSalary * 0.10;

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
        name: "Income Tax (Federal + Cantonal + Municipal)",
        amount: incomeTax.totalTax,
        brackets: incomeTax.breakdown,
      },
      {
        name: "Social Security (AHV/IV/EO)",
        amount: socialSecurity,
        rate: CH_SOCIAL_SECURITY_RATE,
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

function getSwissMarginalTaxRate(income: number): number {
  if (income > 250000) return 0.35;
  if (income > 150000) return 0.28;
  if (income > 100000) return 0.22;
  if (income > 60000) return 0.15;
  if (income > 30000) return 0.08;
  return 0.02;
}

// ==================== MEXICO TAX CALCULATION ====================
export function calculateMexicanTax(grossSalary: number): TaxResult {
  const taxableIncome = Math.max(0, grossSalary);

  const incomeTax = calculateProgressiveTax(taxableIncome, mexicanTaxBrackets);
  const socialSecurity = grossSalary * MX_SOCIAL_SECURITY_RATE;

  const totalTaxes = incomeTax.totalTax + socialSecurity;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate = grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = getMexicanMarginalTaxRate(grossSalary) * 100;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  // Mexican employer contributions (~15-20%)
  const employerTax = grossSalary * 0.17;

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
        name: "Income Tax (ISR)",
        amount: incomeTax.totalTax,
        brackets: incomeTax.breakdown,
      },
      {
        name: "Social Security",
        amount: socialSecurity,
        rate: MX_SOCIAL_SECURITY_RATE,
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

function getMexicanMarginalTaxRate(income: number): number {
  if (income > 3898140) return 0.35;
  if (income > 1299380) return 0.34;
  if (income > 974535) return 0.32;
  if (income > 510451) return 0.30;
  if (income > 323862) return 0.2352;
  if (income > 160577) return 0.2136;
  if (income > 134119) return 0.1792;
  if (income > 115375) return 0.16;
  if (income > 65643) return 0.1088;
  if (income > 7735) return 0.064;
  return 0.0192;
}

// ==================== PORTUGAL TAX CALCULATION ====================
export function calculatePortugueseTax(grossSalary: number): TaxResult {
  const taxableIncome = Math.max(0, grossSalary);

  const incomeTax = calculateProgressiveTax(taxableIncome, portugueseTaxBrackets);
  const socialSecurity = grossSalary * PT_SOCIAL_SECURITY_RATE;

  // Solidarity surcharge for high earners
  let solidarityTax = 0;
  if (taxableIncome > PT_SOLIDARITY_THRESHOLD_2) {
    solidarityTax = taxableIncome * PT_SOLIDARITY_RATE_2;
  } else if (taxableIncome > PT_SOLIDARITY_THRESHOLD_1) {
    solidarityTax = taxableIncome * PT_SOLIDARITY_RATE_1;
  }

  const totalTaxes = incomeTax.totalTax + socialSecurity + solidarityTax;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate = grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = getPortugueseMarginalTaxRate(grossSalary) * 100;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  // Portuguese employer contributions (~23.75%)
  const employerTax = grossSalary * 0.2375;

  const breakdown = {
    perMonth: netPay / 12,
    perFortnight: netPay / 26,
    perDay: netPay / ANNUAL_WORKING_DAYS,
    perHour: netPay / ANNUAL_WORKING_HOURS,
  };

  const taxes: TaxBreakdown[] = [
    {
      name: "Income Tax (IRS)",
      amount: incomeTax.totalTax,
      brackets: incomeTax.breakdown,
    },
    {
      name: "Social Security",
      amount: socialSecurity,
      rate: PT_SOCIAL_SECURITY_RATE,
    },
  ];

  if (solidarityTax > 0) {
    taxes.push({
      name: "Solidarity Surcharge",
      amount: solidarityTax,
      rate:
        taxableIncome > PT_SOLIDARITY_THRESHOLD_2
          ? PT_SOLIDARITY_RATE_2
          : PT_SOLIDARITY_RATE_1,
    });
  }

  return {
    grossSalary,
    taxableIncome,
    deductions: {
      standard: 0,
      personalAllowance: 0,
    },
    taxes,
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

function getPortugueseMarginalTaxRate(income: number): number {
  if (income > 83696) return 0.48;
  if (income > 44987) return 0.45;
  if (income > 41629) return 0.435;
  if (income > 28400) return 0.355;
  if (income > 22306) return 0.32;
  if (income > 17233) return 0.25;
  if (income > 12160) return 0.22;
  if (income > 8059) return 0.165;
  return 0.1325;
}

// ==================== JAPAN TAX CALCULATION ====================
export function calculateJapaneseTax(grossSalary: number): TaxResult {
  // Basic deduction for income tax
  const basicDeduction = 480000; // ¥480,000 basic deduction
  const taxableIncome = Math.max(0, grossSalary - basicDeduction);

  const incomeTax = calculateProgressiveTax(taxableIncome, japaneseTaxBrackets);
  const socialInsurance = grossSalary * JP_SOCIAL_INSURANCE_RATE;

  // Residence tax (local inhabitant tax) - approximate calculation
  // Taxable income for residence tax has different deductions
  const residenceTaxableIncome = Math.max(0, grossSalary - 430000); // Different basic deduction
  const residenceTax = residenceTaxableIncome * JP_RESIDENCE_TAX_RATE;

  const totalTaxes = incomeTax.totalTax + socialInsurance + residenceTax;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate = grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = getJapaneseMarginalTaxRate(taxableIncome) * 100;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  // Japanese employer contributions (~15% for social insurance)
  const employerTax = grossSalary * 0.15;

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
      standard: basicDeduction,
      personalAllowance: 0,
    },
    taxes: [
      {
        name: "Income Tax",
        amount: incomeTax.totalTax,
        brackets: incomeTax.breakdown,
      },
      {
        name: "Social Insurance",
        amount: socialInsurance,
        rate: JP_SOCIAL_INSURANCE_RATE,
      },
      {
        name: "Residence Tax",
        amount: residenceTax,
        rate: JP_RESIDENCE_TAX_RATE,
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

function getJapaneseMarginalTaxRate(taxableIncome: number): number {
  if (taxableIncome > 40000000) return 0.45;
  if (taxableIncome > 18000000) return 0.40;
  if (taxableIncome > 9000000) return 0.33;
  if (taxableIncome > 6950000) return 0.23;
  if (taxableIncome > 3300000) return 0.20;
  if (taxableIncome > 1950000) return 0.10;
  return 0.05;
}

// ==================== ESTONIA TAX CALCULATION ====================
export function calculateEstonianTax(grossSalary: number): TaxResult {
  // Tax-free allowance
  const taxFreeAllowance = Math.min(ESTONIA_TAX_FREE_ALLOWANCE, grossSalary);
  const taxableIncome = Math.max(0, grossSalary - taxFreeAllowance);

  // Flat income tax
  const incomeTax = taxableIncome * ESTONIA_FLAT_TAX_RATE;

  // Unemployment insurance (employee)
  const unemploymentInsurance = grossSalary * EE_UNEMPLOYMENT_INSURANCE_EMPLOYEE;

  // Mandatory funded pension (2% for employees born after 1983)
  const pensionContribution = grossSalary * EE_PENSION_EMPLOYEE;

  const totalTaxes = incomeTax + unemploymentInsurance + pensionContribution;

  const netPay = grossSalary - totalTaxes;
  const effectiveTaxRate = grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const marginalTaxRate = taxableIncome > 0 ? ESTONIA_FLAT_TAX_RATE * 100 : 0;
  const workingDaysForTaxes =
    effectiveTaxRate > 0
      ? Math.round((effectiveTaxRate / 100) * ANNUAL_WORKING_DAYS)
      : 0;

  // Estonian employer pays social tax (33%) + unemployment insurance (0.8%)
  const employerTax =
    grossSalary * (EE_SOCIAL_TAX_PAID_BY_EMPLOYER + EE_UNEMPLOYMENT_INSURANCE_EMPLOYER);

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
      personalAllowance: taxFreeAllowance,
    },
    taxes: [
      {
        name: "Income Tax (Flat Rate)",
        amount: incomeTax,
        rate: ESTONIA_FLAT_TAX_RATE,
      },
      {
        name: "Unemployment Insurance",
        amount: unemploymentInsurance,
        rate: EE_UNEMPLOYMENT_INSURANCE_EMPLOYEE,
      },
      {
        name: "Pension Contribution",
        amount: pensionContribution,
        rate: EE_PENSION_EMPLOYEE,
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
    case "fr":
    case "france":
      return "EUR";
    case "es":
    case "spain":
      return "EUR";
    case "gr":
    case "greece":
      return "EUR";
    case "at":
    case "austria":
      return "EUR";
    case "ch":
    case "switzerland":
      return "CHF";
    case "mx":
    case "mexico":
      return "MXN";
    case "pt":
    case "portugal":
      return "EUR";
    case "jp":
    case "japan":
      return "JPY";
    case "ee":
    case "estonia":
      return "EUR";
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
    case "fr":
    case "france":
      return {
        calculate: calculateFrenchTax,
        brackets: frenchTaxBrackets,
        name: "France",
        emoji: "🇫🇷",
        location: "Paris",
        employerRate: "35%",
        employerNote:
          "Your employer pays approximately 35% in social contributions on top of your salary. This includes health insurance, pension, and other social benefits.",
        currency: "EUR" as Currency,
      };
    case "es":
    case "spain":
      return {
        calculate: calculateSpanishTax,
        brackets: spanishTaxBrackets,
        name: "Spain",
        emoji: "🇪🇸",
        location: "Madrid",
        employerRate: "25%",
        employerNote:
          "Your employer pays approximately 25% in social security contributions on top of your salary. This covers pensions, healthcare, and unemployment benefits.",
        currency: "EUR" as Currency,
      };
    case "gr":
    case "greece":
      return {
        calculate: calculateGreekTax,
        brackets: greekTaxBrackets2026,
        name: "Greece",
        emoji: "🇬🇷",
        location: "Athens",
        employerRate: "22%",
        employerNote:
          "Your employer pays approximately 22% in social security contributions on top of your salary.",
        currency: "EUR" as Currency,
      };
    case "at":
    case "austria":
      return {
        calculate: calculateAustrianTax,
        brackets: austrianTaxBrackets2026,
        name: "Austria",
        emoji: "🇦🇹",
        location: "Vienna",
        employerRate: "21%",
        employerNote:
          "Your employer pays approximately 21% in social security contributions on top of your salary.",
        currency: "EUR" as Currency,
      };
    case "ch":
    case "switzerland":
      return {
        calculate: calculateSwissZurichTax,
        brackets: swissZurichTaxBrackets,
        name: "Switzerland",
        emoji: "🇨🇭",
        location: "Zürich",
        employerRate: "10%",
        employerNote:
          "Your employer pays approximately 10% in social contributions (AHV/IV/EO) on top of your salary. Note: Tax rates vary significantly by canton and municipality.",
        currency: "CHF" as Currency,
      };
    case "mx":
    case "mexico":
      return {
        calculate: calculateMexicanTax,
        brackets: mexicanTaxBrackets,
        name: "Mexico",
        emoji: "🇲🇽",
        location: "Mexico City",
        employerRate: "17%",
        employerNote:
          "Your employer pays approximately 17% in social security contributions on top of your salary.",
        currency: "MXN" as Currency,
      };
    case "pt":
    case "portugal":
      return {
        calculate: calculatePortugueseTax,
        brackets: portugueseTaxBrackets,
        name: "Portugal",
        emoji: "🇵🇹",
        location: "Lisbon",
        employerRate: "23.75%",
        employerNote:
          "Your employer pays 23.75% in social security contributions on top of your salary. Note: NHR regime may offer reduced rates for qualifying new residents.",
        currency: "EUR" as Currency,
      };
    case "jp":
    case "japan":
      return {
        calculate: calculateJapaneseTax,
        brackets: japaneseTaxBrackets,
        name: "Japan",
        emoji: "🇯🇵",
        location: "Tokyo",
        employerRate: "15%",
        employerNote:
          "Your employer pays approximately 15% in social insurance contributions (health, pension, unemployment) on top of your salary.",
        currency: "JPY" as Currency,
      };
    case "ee":
    case "estonia":
      return {
        calculate: calculateEstonianTax,
        brackets: [{ min: ESTONIA_TAX_FREE_ALLOWANCE, max: null, rate: ESTONIA_FLAT_TAX_RATE }],
        name: "Estonia",
        emoji: "🇪🇪",
        location: "Tallinn",
        employerRate: "33.8%",
        employerNote:
          "Your employer pays 33% social tax + 0.8% unemployment insurance on top of your salary. Estonia uses a flat 22% income tax rate with €8,400 tax-free allowance.",
        currency: "EUR" as Currency,
      };
    default:
      throw new Error(`Country ${country} not supported`);
  }
}
