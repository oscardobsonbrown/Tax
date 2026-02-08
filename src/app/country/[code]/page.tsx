"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import BracketTable from "@/components/tax/BracketTable";
import TaxBreakdown from "@/components/tax/TaxBreakdown";
import {
  CURRENCY_SYMBOLS,
  type Currency,
  convertCurrency,
  EXCHANGE_RATES,
  formatCurrency,
  getTaxData,
} from "@/lib/tax-calculations";

export default function CountryPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const countryCode = pathname.split("/").pop() || "no";

  const urlSalary = searchParams.get("salary") || "1000000";
  const urlWealth = searchParams.get("wealth") || "";
  const urlCurrency = (searchParams.get("currency") as Currency) || "AUD";

  const salary = urlSalary;
  const wealth = urlWealth;
  const currency = urlCurrency;
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const taxData = getTaxData(countryCode);
  const localCurrency = taxData.currency;

  const salaryNum = Number.parseInt(salary.replace(/\s/g, "")) || 0;
  const convertedSalaryNum = convertCurrency(
    salaryNum,
    currency,
    localCurrency
  );

  const taxResult = taxData.calculate(convertedSalaryNum);

  const conversionRate =
    EXCHANGE_RATES[localCurrency] / EXCHANGE_RATES[currency];

  const formatCurrencyWithSymbol = (
    amount: number,
    currencyCode: Currency
  ): string => {
    return `${CURRENCY_SYMBOLS[currencyCode]}${formatCurrency(amount)}`;
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 font-mono text-[12px] text-foreground leading-4 sm:px-8">
      <div className="mx-auto max-w-[512px] p-0">
        <div className="mb-4 cursor-pointer text-muted-light hover:text-foreground">
          <Link
            className="hover:underline"
            href={`/?${new URLSearchParams({
              ...(salary && { salary: salary.replace(/\s/g, "") }),
              ...(wealth && { wealth: wealth.replace(/\s/g, "") }),
              currency,
            }).toString()}`}
          >
            &lt;- Back to countries
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-1">
          <div className="text-foreground">
            EMPLOYMENT TAX CALCULATOR - {taxData.emoji} {taxData.name}
          </div>
          <div className="text-muted-light">2026 Tax Year</div>
        </div>

        <div className="mb-8 border border-border p-3">
          <div className="mb-4 text-center font-bold text-foreground text-sm">
            YOUR INPUTS
          </div>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between text-muted">
              <span>Gross income ({currency})</span>
              <span className="text-foreground">
                {CURRENCY_SYMBOLS[currency]}
                {formatCurrency(salaryNum)}
              </span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Converted to local ({localCurrency})</span>
              <span className="text-foreground">
                {CURRENCY_SYMBOLS[localCurrency]}
                {formatCurrency(convertedSalaryNum)}
              </span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Exchange rate</span>
              <span className="text-foreground">
                1 {currency} = {conversionRate.toFixed(4)} {localCurrency}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 border border-border p-3">
          <div className="mb-4 text-center font-bold text-foreground text-sm">
            TAX CALCULATION
          </div>
          <div className="mb-6 text-center text-muted-light text-xs">
            {taxData.location}
          </div>

          <div className="flex flex-col">
            <div className="mb-1 flex justify-between text-foreground">
              <span>GROSS ANNUAL SALARY</span>
              <span>
                {formatCurrencyWithSymbol(taxResult.grossSalary, localCurrency)}
              </span>
            </div>

            <div className="my-4 border-border-light border-t" />

            {(taxResult.deductions.standard > 0 ||
              taxResult.deductions.personalAllowance > 0) && (
              <div className="mb-4">
                <div className="mb-2 text-muted-light text-xs">DEDUCTIONS</div>
                {taxResult.deductions.standard > 0 && (
                  <div className="mb-1 flex justify-between text-muted-dark text-xs">
                    <span>- Standard Deduction</span>
                    <span>
                      -
                      {formatCurrencyWithSymbol(
                        taxResult.deductions.standard,
                        localCurrency
                      )}
                    </span>
                  </div>
                )}
                {taxResult.deductions.personalAllowance > 0 && (
                  <div className="flex justify-between text-muted-dark text-xs">
                    <span>- Personal Allowance</span>
                    <span>
                      -
                      {formatCurrencyWithSymbol(
                        taxResult.deductions.personalAllowance,
                        localCurrency
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mb-6 flex justify-between font-bold text-foreground">
              <span>Taxable Income</span>
              <span>
                {formatCurrencyWithSymbol(
                  taxResult.taxableIncome,
                  localCurrency
                )}
              </span>
            </div>

            <div className="mb-4 border-border-light border-t" />

            <div className="mb-4">
              <div className="mb-4 text-muted-light text-xs">TAX BREAKDOWN</div>
              <TaxBreakdown
                currency={localCurrency}
                grossSalary={taxResult.grossSalary}
                netPay={taxResult.netPay}
                taxes={taxResult.taxes}
                totalTaxes={taxResult.totalTaxes}
              />
            </div>

            <div className="my-4 border-border-light border-t" />

            <div className="mb-1 flex justify-between font-bold text-foreground text-sm">
              <span>NET ANNUAL PAY</span>
              <span>
                {formatCurrencyWithSymbol(taxResult.netPay, localCurrency)}
              </span>
            </div>

            <div className="mt-4 space-y-1 text-xs">
              <div className="flex justify-between text-muted">
                <span>Per Month</span>
                <span>
                  {formatCurrencyWithSymbol(
                    taxResult.breakdown.perMonth,
                    localCurrency
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Per 2 Weeks</span>
                <span>
                  {formatCurrencyWithSymbol(
                    taxResult.breakdown.perFortnight,
                    localCurrency
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Per Day</span>
                <span>
                  {formatCurrencyWithSymbol(
                    taxResult.breakdown.perDay,
                    localCurrency
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Per Hour</span>
                <span>
                  {formatCurrencyWithSymbol(
                    taxResult.breakdown.perHour,
                    localCurrency
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-1 text-xs">
              <div className="flex justify-between text-muted">
                <span>Effective Tax Rate</span>
                <span>{taxResult.effectiveTaxRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Marginal Tax Rate</span>
                <span>{taxResult.marginalTaxRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Working Days for Taxes</span>
                <span>{taxResult.workingDaysForTaxes}d</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 border border-border p-3">
          <div className="mb-4 text-muted-dark">DID YOU KNOW?</div>
          <div className="mb-4 border-border-light border-b pt-3 pb-2">
            <div className="flex justify-between">
              <span className="text-foreground">Your Salary</span>
              <span className="text-muted-dark">
                {formatCurrencyWithSymbol(taxResult.grossSalary, localCurrency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">
                + Employer Tax ({taxData.location} {taxData.employerRate})
              </span>
              <span className="text-muted-dark">
                {formatCurrencyWithSymbol(taxResult.employerTax, localCurrency)}
              </span>
            </div>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-foreground">Total Employment Cost</span>
            <span className="text-muted-dark">
              {formatCurrencyWithSymbol(
                taxResult.totalEmploymentCost,
                localCurrency
              )}
            </span>
          </div>
          <div className="mt-4 whitespace-pre-line text-muted-darker text-xs leading-[18px]">
            {taxData.employerNote}
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4 text-muted-dark">PROGRESSIVE TAX BRACKETS</div>
          <BracketTable brackets={taxData.brackets} currency={localCurrency} />
        </div>

        <div className="mb-8 border border-border">
          <button
            className="flex w-full items-center justify-between p-3 transition-colors hover:bg-surface-hover"
            onClick={() => setGlossaryOpen(!glossaryOpen)}
            type="button"
          >
            <span className="text-foreground text-xs">
              THE {taxData.name.toUpperCase()} TAX SYSTEM
            </span>
            <span className="text-muted-light text-xs">
              {glossaryOpen ? "−" : "+"}
            </span>
          </button>

          {glossaryOpen && (
            <div className="border-border-light border-t px-3 pt-3 pb-3">
              <div className="space-y-3 text-xs">
                <div>
                  <div className="mb-1 font-bold text-foreground">
                    Effective Tax Rate
                  </div>
                  <div className="text-muted-dark">
                    The average rate at which your income is taxed. Calculated
                    as total taxes divided by gross income.
                  </div>
                </div>

                <div>
                  <div className="mb-1 font-bold text-foreground">
                    Marginal Tax Rate
                  </div>
                  <div className="text-muted-dark">
                    The rate applied to your last dollar earned. Only income
                    above each bracket threshold is taxed at that rate.
                  </div>
                </div>

                <div>
                  <div className="mb-1 font-bold text-foreground">
                    Progressive Taxation
                  </div>
                  <div className="text-muted-dark">
                    A system where higher income portions are taxed at higher
                    rates. Not all income is taxed at your top rate.
                  </div>
                </div>

                <div>
                  <div className="mb-1 font-bold text-foreground">
                    Tax Brackets
                  </div>
                  <div className="text-muted-dark">
                    Income ranges with specific tax rates. Each bracket only
                    applies to income within that range.
                  </div>
                </div>

                {taxResult.taxes.some((t) =>
                  t.name.toLowerCase().includes("medicare")
                ) && (
                  <div>
                    <div className="mb-1 font-bold text-foreground">
                      Medicare Levy
                    </div>
                    <div className="text-muted-dark">
                      An additional tax to fund public healthcare. Calculated as
                      a percentage of taxable income.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-muted-light">{taxData.location}</div>

        <div className="mt-2 text-center text-[10px] text-muted-light leading-3">
          Tax rates based on 2026 {taxData.name} regulations
        </div>
        <div className="text-center text-[10px] text-muted-light leading-3">
          For informational purposes only
        </div>
        <div className="mt-1 text-center text-[10px] text-muted-light leading-3">
          - Oscar
        </div>
      </div>
    </div>
  );
}
