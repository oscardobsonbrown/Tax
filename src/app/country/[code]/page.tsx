"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { formatCurrency, getTaxData } from "@/lib/tax-calculations";
import InputCard from "@/components/tax/InputCard";
import TaxBreakdown from "@/components/tax/TaxBreakdown";
import BracketTable from "@/components/tax/BracketTable";

export default function CountryPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const countryCode = pathname.split("/").pop() || "no";

  const urlSalary = searchParams.get("salary") || "1000000";
  const urlWealth = searchParams.get("wealth") || "1000000";

  const [salary, setSalary] = useState(urlSalary);
  const [wealth, setWealth] = useState(urlWealth);

  const salaryNum = parseInt(salary.replace(/\s/g, "")) || 0;

  const taxData = getTaxData(countryCode);
  const taxResult = taxData.calculate(salaryNum);

  const updateUrl = (newSalary: string, newWealth: string) => {
    const url = new URL(window.location.href);
    if (newSalary) url.searchParams.set("salary", newSalary.replace(/\s/g, ""));
    else url.searchParams.delete("salary");
    if (newWealth) url.searchParams.set("wealth", newWealth.replace(/\s/g, ""));
    else url.searchParams.delete("wealth");
    window.history.replaceState({}, "", url.toString());
  };

  const handleSalaryChange = (value: string) => {
    setSalary(value);
    updateUrl(value, wealth);
  };

  const handleWealthChange = (value: string) => {
    setWealth(value);
    updateUrl(salary, value);
  };

  const defaultSalary = countryCode === "au" ? "150000" : "1000000";

  return (
    <div className="min-h-screen bg-white px-4 py-8 font-mono text-[12px] leading-4 text-black sm:px-8">
      <div className="mx-auto max-w-[512px] p-0">
        <div className="mb-4 text-zinc-400 cursor-pointer hover:text-black">
          <Link href="/" className="hover:underline">
            &lt;- Back to countries
          </Link>
        </div>

        <div className="mb-2 flex flex-col gap-1">
          <div className="text-black">
            EMPLOYMENT TAX CALCULATOR - {taxData.emoji} {taxData.name}
          </div>
          <div className="text-zinc-400">2026 Tax Year</div>
        </div>

        <div className="mb-8 flex flex-col gap-6">
          <InputCard
            label="GROSS ANNUAL SALARY"
            value={salary}
            onChange={handleSalaryChange}
            placeholder={defaultSalary}
          />
          <InputCard
            label="NET WEALTH"
            value={wealth}
            onChange={handleWealthChange}
            placeholder={defaultSalary}
          />
          <div className="border border-zinc-300 px-3 py-3 w-fit cursor-pointer hover:bg-zinc-100 transition-colors">
            Advanced Options
          </div>
        </div>

        <div className="mb-8 flex flex-col">
          <div className="mb-4 text-center text-black font-bold text-sm">
            TAX CALCULATION
          </div>

          {taxResult.deductions.standard > 0 && (
            <div className="mb-4">
              <div className="mb-2 text-center text-black">DEDUCTIONS</div>
              <div className="mb-1 flex justify-between text-zinc-600">
                <span>- Standard Deduction</span>
                <span>-{formatCurrency(taxResult.deductions.standard)}</span>
              </div>
              {taxResult.deductions.personalAllowance > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>- Personal Allowance</span>
                  <span>
                    -{formatCurrency(taxResult.deductions.personalAllowance)}
                  </span>
                </div>
              )}
              <div className="mt-2 text-center text-black">Taxable Income</div>
              <div className="text-center text-black">
                {formatCurrency(taxResult.taxableIncome)}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="mb-2 text-center text-black">TAX BREAKDOWN</div>
            <TaxBreakdown taxes={taxResult.taxes} />
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <div className="mb-2 text-black font-bold text-xs">
                NET ANNUAL PAY
              </div>
              <div className="mb-1 flex justify-between">
                <span className="text-black font-bold">
                  {formatCurrency(taxResult.netPay)}
                </span>
                <span className="text-black">
                  -{formatCurrency(taxResult.totalTaxes)}
                </span>
              </div>
            </div>

            <div>
              <div className="mb-2 text-zinc-400">Per Month</div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Per 2 Weeks</span>
                <span className="text-zinc-400">
                  {formatCurrency(taxResult.breakdown.perMonth)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Per Day</span>
                <span className="text-zinc-400">
                  {formatCurrency(taxResult.breakdown.perFortnight)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Per Hour</span>
                <span className="text-zinc-400">
                  {formatCurrency(taxResult.breakdown.perDay)}
                </span>
              </div>
              <div className="flex justify-between">
                <span></span>
                <span className="text-zinc-400">
                  {formatCurrency(taxResult.breakdown.perHour)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Effective Tax Rate</span>
              <span className="flex h-fit items-center justify-center gap-0 rounded-full outline outline-1 outline-zinc-400 px-0.5 py-0">
                <span className="text-[6px] leading-2 text-zinc-400">?</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Marginal Tax Rate</span>
              <span className="text-zinc-400">
                {formatCurrency(taxResult.effectiveTaxRate)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Working Days for Taxes</span>
              <span className="text-zinc-400">
                {formatCurrency(taxResult.marginalTaxRate)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Working Days for Taxes</span>
              <span className="flex h-fit items-center justify-center gap-0 rounded-full outline outline-1 outline-zinc-400 px-0.5 py-0">
                <span className="text-[6px] leading-2 text-zinc-400">?</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 border border-zinc-300 p-3">
          <div className="mb-4 text-zinc-600">DID YOU KNOW?</div>
          <div className="mb-4 border-b border-zinc-200 pb-2 pt-3">
            <div className="flex justify-between">
              <span className="text-black">Your Salary</span>
              <span className="text-zinc-600">
                {formatCurrency(taxResult.grossSalary)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">
                + Employer Tax ({taxData.location} {taxData.employerRate})
              </span>
              <span className="text-zinc-600">
                {formatCurrency(taxResult.employerTax)}
              </span>
            </div>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-black">Total Employment Cost</span>
            <span className="text-zinc-600">
              {formatCurrency(taxResult.totalEmploymentCost)}
            </span>
          </div>
          <div className="mt-4 text-zinc-700 whitespace-pre-line text-xs leading-[18px]">
            {taxData.employerNote}
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-zinc-600">PROGRESSIVE TAX BRACKETS</div>
          <BracketTable brackets={taxData.brackets} />
        </div>

        <div className="mb-6 border border-zinc-300 p-3">
          <div className="mb-2 text-black text-xs">
            THE {taxData.name.toUpperCase()} TAX SYSTEM
          </div>
          <div className="mb-2 text-center text-zinc-400 text-xs leading-4 w-[297px] mx-auto">
            Tax rates based on 2026 {taxData.name} regulations
          </div>
          <div className="mb-2 text-center text-zinc-400 text-xs leading-4">
            For informational purposes only
          </div>
          <div className="mb-4 text-center text-zinc-400 text-xs leading-4">
            - Oscar
          </div>
          <div className="mb-2 text-center text-zinc-200 text-[10px] leading-3">
            v00/00.000000
          </div>
          <div className="bg-zinc-200 h-px w-full mb-2"></div>
          <div className="flex gap-0.5">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="bg-zinc-200 w-[2px] h-12 shrink-0" />
            ))}
          </div>
        </div>

        <div className="text-center text-zinc-400">{taxData.location}</div>
      </div>
    </div>
  );
}
