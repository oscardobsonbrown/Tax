"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ChangeEvent, Suspense, useEffect, useRef, useState } from "react";
import MiniTaxGraph from "@/components/tax/mini-tax-graph";
import { CURRENCY_NAMES, type Currency } from "@/lib/tax-calculations";

const DEFAULT_SALARY = "100000";

// Format number with spaces as thousands separator
function formatNumberWithSpaces(value: string): string {
  const num = Number.parseInt(value.replace(/\s/g, ""), 10);
  if (isNaN(num)) {
    return value;
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Calculate cursor position after formatting
function calculateNewCursorPosition(
  oldValue: string,
  newValue: string,
  oldCursorPos: number
): number {
  const charsBeforeCursor = oldValue
    .slice(0, oldCursorPos)
    .replace(/\s/g, "").length;
  let newPos = 0;
  let digitCount = 0;
  for (let i = 0; i < newValue.length; i++) {
    if (newValue[i] !== " ") {
      digitCount++;
    }
    if (digitCount === charsBeforeCursor) {
      newPos = i + 1;
      break;
    }
  }
  return newPos;
}

function useFormattedInput(initialValue: string) {
  const [rawValue, setRawValue] = useState(initialValue.replace(/\s/g, ""));
  const [displayValue, setDisplayValue] = useState(() =>
    formatNumberWithSpaces(initialValue)
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPosRef = useRef<number>(0);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    onChange?: (raw: string) => void
  ) => {
    const input = e.target;
    const value = input.value;
    cursorPosRef.current = input.selectionStart || 0;

    // Remove all spaces and non-digits
    const rawValue = value.replace(/[^\d]/g, "");

    if (rawValue === "") {
      setRawValue("");
      setDisplayValue("");
      onChange?.("");
      return;
    }

    const formatted = formatNumberWithSpaces(rawValue);
    const newCursorPos = calculateNewCursorPosition(
      value,
      formatted,
      cursorPosRef.current
    );

    setRawValue(rawValue);
    setDisplayValue(formatted);
    onChange?.(rawValue);

    // Restore cursor position after React updates
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  const setValue = (value: string) => {
    const raw = value.replace(/\s/g, "");
    setRawValue(raw);
    setDisplayValue(formatNumberWithSpaces(raw));
  };

  return { rawValue, displayValue, inputRef, handleChange, setValue };
}

function HomeContent() {
  const searchParams = useSearchParams();

  const salaryInput = useFormattedInput(
    searchParams.get("salary") || DEFAULT_SALARY
  );
  const wealthInput = useFormattedInput(searchParams.get("wealth") || "");
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
      url.searchParams.set("salary", newSalary);
    } else {
      url.searchParams.delete("salary");
    }
    if (newWealth) {
      url.searchParams.set("wealth", newWealth);
    } else {
      url.searchParams.delete("wealth");
    }
    url.searchParams.set("currency", newCurrency);
    window.history.replaceState({}, "", url.toString());
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    updateUrl(salaryInput.rawValue, wealthInput.rawValue, newCurrency);
  };

  const getCountryUrl = (country: string) => {
    const params = new URLSearchParams();
    params.set("currency", currency);
    if (salaryInput.rawValue) {
      params.set("salary", salaryInput.rawValue);
    }
    if (wealthInput.rawValue) {
      params.set("wealth", wealthInput.rawValue);
    }
    const paramString = params.toString();
    return paramString
      ? `/country/${country}?${paramString}`
      : `/country/${country}`;
  };

  // Update URL with default salary if not provided
  useEffect(() => {
    if (!searchParams.get("salary")) {
      updateUrl(DEFAULT_SALARY, wealthInput.rawValue, currency);
      salaryInput.setValue(DEFAULT_SALARY);
    }
  }, []);

  interface CountryCardProps {
    countryCode: string;
    countryName: string;
    year: string;
    currency: Currency;
    salary: string;
  }

  function CountryCard({
    countryCode,
    countryName,
    year,
    currency,
    salary,
  }: CountryCardProps) {
    return (
      <Link className="no-underline" href={getCountryUrl(countryCode)}>
        <div className="flex items-center justify-between border border-gray-300 px-[15px] py-4 transition-colors hover:border-gray-400">
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
            <div className="text-xs text-zinc-500">({year})</div>
          </div>
          <div className="flex items-center gap-4">
            <MiniTaxGraph
              countryCode={countryCode}
              currency={currency}
              salary={salary}
            />
            <div className="text-black">{"->"}</div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-8 pb-32 font-mono text-sm antialiased sm:px-8">
      <div className="w-full max-w-[562px] border-gray-200 border-b pb-4">
        <div className="text-black">TAX</div>
        <div className="text-zinc-500">
          Calculate, visualize, and compare global taxes
        </div>
      </div>

      <div className="mt-8 w-full max-w-[562px]">
        <button
          className="flex w-full items-center justify-between border border-gray-300 px-4 py-3 transition-colors hover:border-gray-400"
          onClick={() => setDetailsOpen(!detailsOpen)}
          type="button"
        >
          <div className="flex items-center gap-3">
            <span className="text-black">YOUR DETAILS</span>
            {!detailsOpen && (salaryInput.rawValue || wealthInput.rawValue) && (
              <span className="text-xs text-zinc-500">
                {salaryInput.displayValue || "0"} ({currency}){" "}
                {wealthInput.displayValue &&
                  `/ ${wealthInput.displayValue} (${currency})`}
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400">
            {detailsOpen ? "−" : "+"}
          </span>
        </button>

        {detailsOpen && (
          <div className="border-gray-300 border-x border-b px-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-xs text-zinc-500">Currency</div>
                <select
                  className="border border-gray-300 bg-white px-3 py-2 text-black text-sm outline-none transition-colors hover:border-gray-400 focus:border-black"
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
                <div className="text-xs text-zinc-500">Gross income</div>
                <input
                  className="border border-gray-300 px-3 py-2 text-black text-sm outline-none transition-colors hover:border-gray-400 focus:border-black"
                  onChange={(e) =>
                    salaryInput.handleChange(e, (raw) =>
                      updateUrl(raw, wealthInput.rawValue, currency)
                    )
                  }
                  placeholder="0"
                  ref={salaryInput.inputRef}
                  type="text"
                  value={salaryInput.displayValue}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs text-zinc-500">Net wealth</div>
                <input
                  className="border border-gray-300 px-3 py-2 text-black text-sm outline-none transition-colors hover:border-gray-400 focus:border-black"
                  onChange={(e) =>
                    wealthInput.handleChange(e, (raw) =>
                      updateUrl(salaryInput.rawValue, raw, currency)
                    )
                  }
                  placeholder="0"
                  ref={wealthInput.inputRef}
                  type="text"
                  value={wealthInput.displayValue}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-[562px]">
        <div className="mb-6 text-black">COUNTRIES</div>
        <div className="flex flex-col gap-2">
          <CountryCard
            countryCode="no"
            countryName="Norway"
            currency={currency}
            salary={salaryInput.rawValue}
            year="2026"
          />
          <CountryCard
            countryCode="au"
            countryName="Australia"
            currency={currency}
            salary={salaryInput.rawValue}
            year="FY25-26"
          />
          <CountryCard
            countryCode="fr"
            countryName="France"
            currency={currency}
            salary={salaryInput.rawValue}
            year="2026"
          />
          <CountryCard
            countryCode="es"
            countryName="Spain"
            currency={currency}
            salary={salaryInput.rawValue}
            year="2026"
          />
          <CountryCard
            countryCode="gr"
            countryName="Greece"
            currency={currency}
            salary={salaryInput.rawValue}
            year="2026"
          />
          <CountryCard
            countryCode="at"
            countryName="Austria"
            currency={currency}
            salary={salaryInput.rawValue}
            year="2026"
          />
          <CountryCard
            countryCode="ch"
            countryName="Switzerland"
            currency={currency}
            salary={salaryInput.rawValue}
            year="2026, Zürich"
          />
          <CountryCard
            countryCode="mx"
            countryName="Mexico"
            currency={currency}
            salary={salaryInput.rawValue}
            year="2026"
          />
          <CountryCard
            countryCode="pt"
            countryName="Portugal"
            currency={currency}
            salary={salaryInput.rawValue}
            year="2026"
          />
          <CountryCard
            countryCode="jp"
            countryName="Japan"
            currency={currency}
            salary={salaryInput.rawValue}
            year="FY2025"
          />
          <CountryCard
            countryCode="ee"
            countryName="Estonia"
            currency={currency}
            salary={salaryInput.rawValue}
            year="2026"
          />
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <div className="h-[25px] w-[25px] rounded-[7px] bg-gray-300" />
        <div className="text-zinc-500">
          Tax calculators and visualizations for informational purposes only
        </div>
        <div className="text-zinc-500">©2026</div>
        <div className="text-zinc-500">- Oscar</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white font-mono text-sm text-zinc-500">
          Loading...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
