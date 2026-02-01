import type { Metadata } from "next";
import { getTaxData } from "@/lib/tax-calculations";

type Params = Promise<{ code: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { code } = await params;
  const taxData = getTaxData(code);
  return {
    title: `Tax Calculator - ${taxData.name}`,
    description: `Calculate employment taxes for ${taxData.name}`,
  };
}

export default function CountryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
