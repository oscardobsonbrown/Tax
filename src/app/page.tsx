"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [salary, setSalary] = useState("");
  const [wealth, setWealth] = useState("");

  const formatCurrency = (value: string) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalary(e.target.value);
  };

  const handleWealthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWealth(e.target.value);
  };

  const getCountryUrl = (country: string) => {
    const params = new URLSearchParams();
    if (salary) params.set("salary", salary.replace(/\s/g, ""));
    if (wealth) params.set("wealth", wealth.replace(/\s/g, ""));
    const paramString = params.toString();
    return paramString
      ? `/country/${country}?${paramString}`
      : `/country/${country}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-8 pb-32 font-mono text-sm antialiased sm:px-8">
      <div className="w-full max-w-[512px] border-b border-gray-200 pb-4">
        <div className="text-black">TAX</div>
        <div className="text-zinc-500">Calculate, visualize, and compare global taxes</div>
      </div>

      <div className="mt-12 w-full max-w-[512px] border-b border-gray-200 py-12">
        <div className="mb-6 text-black">COUNTRIES</div>
        <div className="flex flex-col gap-2">
          <Link
            href={getCountryUrl("no")}
            className="no-underline"
          >
            <div className="flex items-center justify-between border border-gray-300 px-[15px] py-4 transition-colors hover:border-gray-600">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="text-black">🇳🇴</div>
                  <div className="text-black">Norway</div>
                </div>
                <div className="text-zinc-500">2026 Tax Year</div>
              </div>
              <div className="text-black">{'->'}</div>
            </div>
          </Link>
          <Link
            href={getCountryUrl("au")}
            className="no-underline"
          >
            <div className="flex items-center justify-between border border-gray-300 px-[15px] py-4 transition-colors hover:border-gray-600">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="text-black">🇦🇺</div>
                  <div className="text-black">Australia</div>
                </div>
                <div className="text-zinc-500">2026 Tax Year</div>
              </div>
              <div className="text-black">{'->'}</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-3 text-center">
        <div className="h-[25px] w-[25px] rounded-[7px] bg-gray-300" />
        <div className="text-zinc-500">Tax calculators and visualizations for informational purposes only</div>
        <div className="text-zinc-500">©2026</div>
        <div className="text-zinc-500">- Oscar</div>
      </div>
    </div>
  );
}
