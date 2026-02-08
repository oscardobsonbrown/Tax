"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CURRENCY_NAMES, type Currency } from "@/lib/tax-calculations";

function HomeContent() {
  const searchParams = useSearchParams();

  const [salary, setSalary] = useState(searchParams.get("salary") || "");
  const [wealth, setWealth] = useState(searchParams.get("wealth") || "");
  const [currency, setCurrency] = useState<Currency>(
    (searchParams.get("currency") as Currency) || "AUD"
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  const updateUrl = (
    newSalary: string,
    newWealth: string,
    newCurrency: Currency
  ) => {
    const url = new URL(window.location.href);
    if (newSalary) {
      url.searchParams.set("salary", newSalary.replace(/\s/g, ""));
    } else {
      url.searchParams.delete("salary");
    }
    if (newWealth) {
      url.searchParams.set("wealth", newWealth.replace(/\s/g, ""));
    } else {
      url.searchParams.delete("wealth");
    }
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
    if (salary) {
      params.set("salary", salary.replace(/\s/g, ""));
    }
    if (wealth) {
      params.set("wealth", wealth.replace(/\s/g, ""));
    }
    const paramString = params.toString();
    return paramString
      ? `/country/${country}?${paramString}`
      : `/country/${country}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8 pb-32 font-mono text-sm antialiased sm:px-8">
      <div className="w-full max-w-[512px] border-border-light border-b pb-4">
        <div className="text-foreground">TAX</div>
        <div className="text-muted">
          Calculate, visualize, and compare global taxes
        </div>
      </div>

      <div className="mt-8 w-full max-w-[512px]">
        <button
          className="flex w-full items-center justify-between border border-border px-4 py-3 transition-colors hover:border-border-hover"
          onClick={() => setDetailsOpen(!detailsOpen)}
          type="button"
        >
          <div className="flex items-center gap-3">
            <span className="text-foreground">YOUR DETAILS</span>
            {!detailsOpen && (salary || wealth) && (
              <span className="text-muted text-xs">
                {salary || "0"} ({currency}){" "}
                {wealth && `/ ${wealth} (${currency})`}
              </span>
            )}
          </div>
          <span className="text-muted-light text-xs">
            {detailsOpen ? "−" : "+"}
          </span>
        </button>

        {detailsOpen && (
          <div className="border-border border-x border-b px-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-muted text-xs">Currency</div>
                <select
                  className="border border-border bg-background px-3 py-2 text-foreground text-sm outline-none transition-colors hover:border-border-hover focus:border-foreground"
                  onChange={(e) =>
                    handleCurrencyChange(e.target.value as Currency)
                  }
                  value={currency}
                >
                  {(Object.keys(CURRENCY_NAMES) as Currency[]).map((c) => (
                    <option key={c} value={c}>
                      {c} - {CURRENCY_NAMES[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-muted text-xs">Gross income</div>
                <input
                  className="border border-border bg-background px-3 py-2 text-foreground text-sm outline-none transition-colors hover:border-border-hover focus:border-foreground"
                  onChange={handleSalaryChange}
                  placeholder="0"
                  type="text"
                  value={salary}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-muted text-xs">Net wealth</div>
                <input
                  className="border border-border bg-background px-3 py-2 text-foreground text-sm outline-none transition-colors hover:border-border-hover focus:border-foreground"
                  onChange={handleWealthChange}
                  placeholder="0"
                  type="text"
                  value={wealth}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-[512px] border-border-light border-t pt-8">
        <div className="mb-6 text-foreground">COUNTRIES</div>
        <div className="flex flex-col gap-2">
          <Link className="no-underline" href={getCountryUrl("no")}>
            <div className="flex items-center justify-between border border-border px-[15px] py-4 transition-colors hover:border-border-hover">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="text-foreground">🇳🇴</div>
                  <div className="text-foreground">Norway</div>
                </div>
                <div className="text-muted">2026 Tax Year</div>
              </div>
              <div className="text-foreground">{"->"}</div>
            </div>
          </Link>
          <Link className="no-underline" href={getCountryUrl("au")}>
            <div className="flex items-center justify-between border border-border px-[15px] py-4 transition-colors hover:border-border-hover">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="text-foreground">🇦🇺</div>
                  <div className="text-foreground">Australia</div>
                </div>
                <div className="text-muted">2026 Tax Year</div>
              </div>
              <div className="text-foreground">{"->"}</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-3 text-center">
        <div className="h-[25px] w-[25px] rounded-[7px] bg-border" />
        <div className="text-muted">
          Tax calculators and visualizations for informational purposes only
        </div>
        <div className="text-muted">©2026</div>
        <div className="text-muted">- Oscar</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background font-mono text-muted text-sm">
          Loading...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
