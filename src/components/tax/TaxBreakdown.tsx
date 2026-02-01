"use client";

import {
  TaxBreakdown as TaxBreakdownType,
  formatRate,
} from "@/lib/tax-calculations";

export default function TaxBreakdown({ taxes }: { taxes: TaxBreakdownType[] }) {
  return (
    <div className="flex flex-col gap-8 text-black font-mono text-xs leading-4">
      {taxes.map((tax, index) => (
        <div key={index} className="flex flex-col gap-5 shrink-0">
          <div className="shrink-0">
            {tax.name}
            {tax.rate && (
              <span className="ml-1 text-[10px] text-zinc-500">
                ({formatRate(tax.rate * 100)} of gross income)
              </span>
            )}
          </div>

          {tax.brackets && (
            <div className="flex flex-col gap-[5px] pl-4">
              {tax.brackets.map((bracket, bracketIndex) => (
                <div
                  key={bracketIndex}
                  className="text-zinc-400 text-[10px] leading-3"
                >
                  {bracket.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
