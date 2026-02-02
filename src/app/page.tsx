"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type Currency, CURRENCY_NAMES } from "@/lib/tax-calculations";
import MiniTaxGraph from "@/components/tax/MiniTaxGraph";

function HomeContent() {
  const searchParams = useSearchParams();

  const [salary, setSalary] = useState(searchParams.get("salary") || "");
  const [wealth, setWealth] = useState(searchParams.get("wealth") || "");
  const [currency, setCurrency] = useState<Currency>((searchParams.get("currency") as Currency) || "AUD");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const updateUrl = (newSalary: string, newWealth: string, newCurrency: Currency) => {
    const url = new URL(window.location.href);
    if (newSalary) url.searchParams.set("salary", newSalary.replace(/\s/g, ""));
    else url.searchParams.delete("salary");
    if (newWealth) url.searchParams.set("wealth", newWealth.replace(/\s/g, ""));
    else url.searchParams.delete("wealth");
    url.searchParams.set("currency", newCurrency);
    window.history.replaceState({}, "", url.toString());
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSalary(value);
    updateUrl(value, wealth, currency);
  };

  const handleWealthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWealth(value);
    updateUrl(salary, value, currency);
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    updateUrl(salary, wealth, newCurrency);
  };

  const getCountryUrl = (country: string) => {
    const params = new URLSearchParams();
    params.set("currency", currency);
    if (salary) params.set("salary", salary.replace(/\s/g, ""));
    if (wealth) params.set("wealth", wealth.replace(/\s/g, ""));
    const paramString = params.toString();
    return paramString
      ? `/country/${country}?${paramString}`
      : `/country/${country}`;
  };

  interface CountryCardProps {
    countryCode: string;
    countryName: string;
    year: string;
    currency: Currency;
    salary: string;
  }

  function CountryCard({ countryCode, countryName, year, currency, salary }: CountryCardProps) {
    return (
      <Link
        href={getCountryUrl(countryCode)}
        className="no-underline"
      >
        <div className="flex items-center justify-between border border-gray-300 px-[15px] py-4 transition-colors hover:border-gray-600">
          <div className="flex items-center gap-2">
            <div className="text-black">
              {countryCode === "no" && "🇳🇴"}
              {countryCode === "au" && "🇦🇺"}
              {countryCode === "fr" && "🇫🇷"}
              {countryCode === "es" && "🇪🇸"}
              {countryCode === "gr" && "🇬🇷"}
              {countryCode === "at" && "🇦🇹"}
              {countryCode === "ch" && "🇨🇭"}
              {countryCode === "mx" && "🇲🇽"}
              {countryCode === "pt" && "🇵🇹"}
              {countryCode === "jp" && "🇯🇵"}
              {countryCode === "ee" && "🇪🇪"}
            </div>
            <div className="text-black">{countryName}</div>
            <div className="text-zinc-500 text-xs">({year})</div>
          </div>
          <div className="flex items-center gap-4">
            <MiniTaxGraph countryCode={countryCode} currency={currency} salary={salary} />
            <div className="text-black">{'->'}</div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-8 pb-32 font-mono text-sm antialiased sm:px-8">
      <div className="w-full max-w-[562px] border-b border-gray-200 pb-4">
        <div className="text-black">TAX</div>
        <div className="text-zinc-500">Calculate, visualize, and compare global taxes</div>
      </div>

      <div className="mt-8 w-full max-w-[562px]">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="w-full flex items-center justify-between border border-gray-300 px-4 py-3 transition-colors hover:border-gray-600"
        >
          <div className="flex items-center gap-3">
            <span className="text-black">YOUR DETAILS</span>
            {!detailsOpen && (salary || wealth) && (
              <span className="text-zinc-500 text-xs">
                {salary || "0"} ({currency}) {wealth && `/ ${wealth} (${currency})`}
              </span>
            )}
          </div>
          <span className="text-zinc-400 text-xs">{detailsOpen ? "−" : "+"}</span>
        </button>

        {detailsOpen && (
          <div className="border-x border-b border-gray-300 px-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-zinc-500 text-xs">Currency</div>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                  className="border border-gray-300 px-3 py-2 text-sm text-black outline-none transition-colors hover:border-gray-600 focus:border-black bg-white"
                >
                  {(Object.keys(CURRENCY_NAMES) as Currency[]).map((c) => (
                    <option key={c} value={c}>
                      {c} - {CURRENCY_NAMES[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-zinc-500 text-xs">Gross income</div>
                <input
                  type="text"
                  value={salary}
                  onChange={handleSalaryChange}
                  placeholder="0"
                  className="border border-gray-300 px-3 py-2 text-sm text-black outline-none transition-colors hover:border-gray-600 focus:border-black"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-zinc-500 text-xs">Net wealth</div>
                <input
                  type="text"
                  value={wealth}
                  onChange={handleWealthChange}
                  placeholder="0"
                  className="border border-gray-300 px-3 py-2 text-sm text-black outline-none transition-colors hover:border-gray-600 focus:border-black"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-[562px]">
        <div className="mb-6 text-black">COUNTRIES</div>
        <div className="flex flex-col gap-2">
          <CountryCard countryCode="no" countryName="Norway" year="2026" currency={currency} salary={salary} />
          <CountryCard countryCode="au" countryName="Australia" year="FY25-26" currency={currency} salary={salary} />
          <CountryCard countryCode="fr" countryName="France" year="2026" currency={currency} salary={salary} />
          <CountryCard countryCode="es" countryName="Spain" year="2026" currency={currency} salary={salary} />
          <CountryCard countryCode="gr" countryName="Greece" year="2026" currency={currency} salary={salary} />
          <CountryCard countryCode="at" countryName="Austria" year="2026" currency={currency} salary={salary} />
          <CountryCard countryCode="ch" countryName="Switzerland" year="2026, Zürich" currency={currency} salary={salary} />
          <CountryCard countryCode="mx" countryName="Mexico" year="2026" currency={currency} salary={salary} />
          <CountryCard countryCode="pt" countryName="Portugal" year="2026" currency={currency} salary={salary} />
          <CountryCard countryCode="jp" countryName="Japan" year="FY2025" currency={currency} salary={salary} />
          <CountryCard countryCode="ee" countryName="Estonia" year="2026" currency={currency} salary={salary} />
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <div className="h-[25px] w-[25px] rounded-[7px] bg-gray-300" />
        <div className="text-zinc-500">Tax calculators and visualizations for informational purposes only</div>
        <div className="text-zinc-500">©2026</div>
        <div className="text-zinc-500">- Oscar</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white font-mono text-sm text-zinc-500">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
