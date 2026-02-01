"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  formatCurrency,
  getTaxData,
  convertCurrency,
  type Currency,
  CURRENCY_SYMBOLS,
  EXCHANGE_RATES,
} from "@/lib/tax-calculations";
import TaxBreakdown from "@/components/tax/TaxBreakdown";
import BracketTable from "@/components/tax/BracketTable";

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

  const salaryNum = parseInt(salary.replace(/\s/g, "")) || 0;
  const convertedSalaryNum = convertCurrency(salaryNum, currency, localCurrency);

  const taxResult = taxData.calculate(convertedSalaryNum);

  const conversionRate =
    EXCHANGE_RATES[localCurrency] / EXCHANGE_RATES[currency];

  const formatCurrencyWithSymbol = (
    amount: number,
    currencyCode: Currency,
  ): string => {
    return `${CURRENCY_SYMBOLS[currencyCode]}${formatCurrency(amount)}`;
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 font-mono text-[12px] leading-4 text-black sm:px-8">
      <div className="mx-auto max-w-[512px] p-0">
        <div className="mb-4 text-zinc-400 cursor-pointer hover:text-black">
          <Link
            href={`/?${new URLSearchParams({
              ...(salary && { salary: salary.replace(/\s/g, "") }),
              ...(wealth && { wealth: wealth.replace(/\s/g, "") }),
              currency,
            }).toString()}`}
            className="hover:underline"
          >
            &lt;- Back to countries
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-1">
          <div className="text-black">
            EMPLOYMENT TAX CALCULATOR - {taxData.emoji} {taxData.name}
          </div>
          <div className="text-zinc-400">2026 Tax Year</div>
        </div>

        <div className="mb-8 border border-zinc-300 p-3">
          <div className="mb-4 text-center text-black font-bold text-sm">
            YOUR INPUTS
          </div>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Gross income ({currency})</span>
              <span className="text-black">
                {CURRENCY_SYMBOLS[currency]}{formatCurrency(salaryNum)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Converted to local ({localCurrency})</span>
              <span className="text-black">
                {CURRENCY_SYMBOLS[localCurrency]}{formatCurrency(convertedSalaryNum)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Exchange rate</span>
              <span className="text-black">
                1 {currency} = {conversionRate.toFixed(4)} {localCurrency}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 border border-zinc-300 p-3">
          <div className="mb-4 text-center text-black font-bold text-sm">
            TAX CALCULATION
          </div>
          <div className="text-center text-zinc-400 text-xs mb-6">
            {taxData.location}
          </div>

          <div className="flex flex-col">
            <div className="mb-1 flex justify-between text-black">
              <span>GROSS ANNUAL SALARY</span>
              <span>{formatCurrencyWithSymbol(taxResult.grossSalary, localCurrency)}</span>
            </div>

            <div className="border-t border-zinc-200 my-4"></div>

            {(taxResult.deductions.standard > 0 || taxResult.deductions.personalAllowance > 0) && (
              <div className="mb-4">
                <div className="mb-2 text-zinc-400 text-xs">DEDUCTIONS</div>
                {taxResult.deductions.standard > 0 && (
                  <div className="flex justify-between text-zinc-600 text-xs mb-1">
                    <span>- Standard Deduction</span>
                    <span>-{formatCurrencyWithSymbol(taxResult.deductions.standard, localCurrency)}</span>
                  </div>
                )}
                {taxResult.deductions.personalAllowance > 0 && (
                  <div className="flex justify-between text-zinc-600 text-xs">
                    <span>- Personal Allowance</span>
                    <span>-{formatCurrencyWithSymbol(taxResult.deductions.personalAllowance, localCurrency)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between text-black font-bold mb-6">
              <span>Taxable Income</span>
              <span>{formatCurrencyWithSymbol(taxResult.taxableIncome, localCurrency)}</span>
            </div>

            <div className="border-t border-zinc-200 mb-4"></div>

            <div className="mb-4">
              <div className="mb-4 text-zinc-400 text-xs">TAX BREAKDOWN</div>
              <TaxBreakdown taxes={taxResult.taxes} totalTaxes={taxResult.totalTaxes} grossSalary={taxResult.grossSalary} netPay={taxResult.netPay} currency={localCurrency} />
            </div>

            <div className="border-t border-zinc-200 my-4"></div>

            <div className="mb-1 flex justify-between text-black font-bold text-sm">
              <span>NET ANNUAL PAY</span>
              <span>{formatCurrencyWithSymbol(taxResult.netPay, localCurrency)}</span>
            </div>

            <div className="mt-4 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Per Month</span>
                <span>{formatCurrencyWithSymbol(taxResult.breakdown.perMonth, localCurrency)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Per 2 Weeks</span>
                <span>{formatCurrencyWithSymbol(taxResult.breakdown.perFortnight, localCurrency)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Per Day</span>
                <span>{formatCurrencyWithSymbol(taxResult.breakdown.perDay, localCurrency)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Per Hour</span>
                <span>{formatCurrencyWithSymbol(taxResult.breakdown.perHour, localCurrency)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Effective Tax Rate</span>
                <span>{taxResult.effectiveTaxRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Marginal Tax Rate</span>
                <span>{taxResult.marginalTaxRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Working Days for Taxes</span>
                <span>{taxResult.workingDaysForTaxes}d</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 border border-zinc-300 p-3">
          <div className="mb-4 text-zinc-600">DID YOU KNOW?</div>
          <div className="mb-4 border-b border-zinc-200 pb-2 pt-3">
            <div className="flex justify-between">
              <span className="text-black">Your Salary</span>
              <span className="text-zinc-600">
                {formatCurrencyWithSymbol(taxResult.grossSalary, localCurrency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">
                + Employer Tax ({taxData.location} {taxData.employerRate})
              </span>
              <span className="text-zinc-600">
                {formatCurrencyWithSymbol(taxResult.employerTax, localCurrency)}
              </span>
            </div>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-black">Total Employment Cost</span>
            <span className="text-zinc-600">
              {formatCurrencyWithSymbol(taxResult.totalEmploymentCost, localCurrency)}
            </span>
          </div>
          <div className="mt-4 text-zinc-700 whitespace-pre-line text-xs leading-[18px]">
            {taxData.employerNote}
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4 text-zinc-600">PROGRESSIVE TAX BRACKETS</div>
          <BracketTable brackets={taxData.brackets} currency={localCurrency} />
        </div>

        <div className="mb-8 border border-zinc-300">
          <button 
            type="button"
            onClick={() => setGlossaryOpen(!glossaryOpen)}
            className="w-full p-3 flex items-center justify-between hover:bg-zinc-50 transition-colors"
          >
            <span className="text-black text-xs">
              THE {taxData.name.toUpperCase()} TAX SYSTEM
            </span>
            <span className="text-zinc-400 text-xs">
              {glossaryOpen ? '−' : '+'}
            </span>
          </button>
          
          {glossaryOpen && (
            <div className="px-3 pb-3 border-t border-zinc-200 pt-3">
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-black font-bold mb-1">Effective Tax Rate</div>
                  <div className="text-zinc-600">
                    The average rate at which your income is taxed. Calculated as total taxes divided by gross income.
                  </div>
                </div>
                
                <div>
                  <div className="text-black font-bold mb-1">Marginal Tax Rate</div>
                  <div className="text-zinc-600">
                    The rate applied to your last dollar earned. Only income above each bracket threshold is taxed at that rate.
                  </div>
                </div>
                
                <div>
                  <div className="text-black font-bold mb-1">Progressive Taxation</div>
                  <div className="text-zinc-600">
                    A system where higher income portions are taxed at higher rates. Not all income is taxed at your top rate.
                  </div>
                </div>
                
                <div>
                  <div className="text-black font-bold mb-1">Tax Brackets</div>
                  <div className="text-zinc-600">
                    Income ranges with specific tax rates. Each bracket only applies to income within that range.
                  </div>
                </div>
                
                {taxResult.taxes.some(t => t.name.toLowerCase().includes('medicare')) && (
                  <div>
                    <div className="text-black font-bold mb-1">Medicare Levy</div>
                    <div className="text-zinc-600">
                      An additional tax to fund public healthcare. Calculated as a percentage of taxable income.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-zinc-400">{taxData.location}</div>

        <div className="text-center text-zinc-400 text-[10px] leading-3 mt-2">
          Tax rates based on 2026 {taxData.name} regulations
        </div>
        <div className="text-center text-zinc-400 text-[10px] leading-3">
          For informational purposes only
        </div>
        <div className="text-center text-zinc-400 text-[10px] leading-3 mt-1">
          - Oscar
        </div>
      </div>
    </div>
  );
}
