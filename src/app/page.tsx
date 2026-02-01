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
    <div style={{ backgroundColor: '#FFFFFF', boxSizing: 'border-box', fontSynthesis: 'none', MozOsxFontSmoothing: 'grayscale', overflow: 'clip', WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', position: 'relative', paddingBlock: '32px' }}>
      <div style={{ alignItems: 'start', borderBottomColor: '#E5E5E5', borderBottomStyle: 'solid', borderBottomWidth: '1px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 3, height: 'fit-content', paddingBottom: '16px', paddingLeft: 0, paddingRight: 0, paddingTop: 0, width: '512px', flexShrink: 0 }}>
        <div style={{ boxSizing: 'border-box', color: '#000000', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
          TAX
        </div>
        <div style={{ boxSizing: 'border-box', color: '#7D7D7D', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
          Calculate, visualize, and compare global taxes
        </div>
      </div>

      <div style={{ alignItems: 'start', borderBottomColor: '#E5E5E5', borderBottomStyle: 'solid', borderBottomWidth: '1px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24, height: 'fit-content', paddingBlock: '48px', paddingInline: 0, width: 'fit-content', marginTop: '52px', flexShrink: 0 }}>
        <div style={{ boxSizing: 'border-box', color: '#000000', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
          COUNTRIES
        </div>
        <div style={{ alignItems: 'start', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flexShrink: '0', gap: '8px', height: 'fit-content', paddingBlock: 0, paddingInline: 0, width: 'fit-content' }}>
          <Link
            href={getCountryUrl("no")}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{ alignItems: 'center', borderColor: '#CCCCCC', borderStyle: 'solid', borderWidth: '1px', boxSizing: 'border-box', display: 'flex', flexShrink: '0', gap: 371, height: 'fit-content', paddingBlock: '16px', paddingInline: '15px', width: 'fit-content', transition: 'border-color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#999999'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#CCCCCC'}
            >
              <div style={{ alignItems: 'start', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flexShrink: '0', gap: 4, height: 'fit-content', paddingBlock: 0, paddingInline: 0, width: 'fit-content' }}>
                <div style={{ alignItems: 'start', boxSizing: 'border-box', display: 'flex', flexShrink: '0', gap: 7, height: 'fit-content', paddingBlock: 0, paddingInline: 0, width: 'fit-content' }}>
                  <div style={{ boxSizing: 'border-box', color: '#000000', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
                    🇳🇴
                  </div>
                  <div style={{ boxSizing: 'border-box', color: '#000000', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
                    Norway
                  </div>
                </div>
                <div style={{ boxSizing: 'border-box', color: '#7F7F7F', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
                  2026 Tax Year
                </div>
              </div>
              <div style={{ boxSizing: 'border-box', color: '#000000', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
                {'->'}
              </div>
            </div>
          </Link>
          <Link
            href={getCountryUrl("au")}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{ alignItems: 'center', borderColor: '#CCCCCC', borderStyle: 'solid', borderWidth: '1px', boxSizing: 'border-box', display: 'flex', flexShrink: '0', gap: 371, height: 'fit-content', paddingBlock: '16px', paddingInline: '15px', width: 'fit-content', transition: 'border-color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#999999'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#CCCCCC'}
            >
              <div style={{ alignItems: 'start', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flexShrink: '0', gap: 4, height: 'fit-content', paddingBlock: 0, paddingInline: 0, width: 'fit-content' }}>
                <div style={{ alignItems: 'start', boxSizing: 'border-box', display: 'flex', flexShrink: '0', gap: 7, height: 'fit-content', paddingBlock: 0, paddingInline: 0, width: 'fit-content' }}>
                  <div style={{ boxSizing: 'border-box', color: '#000000', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
                    🇦🇺
                  </div>
                  <div style={{ boxSizing: 'border-box', color: '#000000', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
                    Australia
                  </div>
                </div>
                <div style={{ boxSizing: 'border-box', color: '#7F7F7F', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
                  2026 Tax Year
                </div>
              </div>
              <div style={{ boxSizing: 'border-box', color: '#000000', flexShrink: '0', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', height: 'fit-content', lineHeight: '16px', width: 'fit-content' }}>
                {'->'}
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 }}>
        <div style={{ boxSizing: 'border-box', height: '25px', width: '25px' }}>
          <div style={{ backgroundColor: '#DDDDDD', borderRadius: '7px', boxSizing: 'border-box', height: '25px', position: 'relative', top: 0, left: 0, width: '25px' }} />
        </div>
        <div style={{ boxSizing: 'border-box', color: '#7F7F7F', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', lineHeight: '16px', textAlign: 'center' }}>
          Tax calculators and visualizations for informational purposes only
        </div>
        <div style={{ boxSizing: 'border-box', color: '#7F7F7F', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', lineHeight: '16px', textAlign: 'center' }}>
          ©2026
        </div>
        <div style={{ boxSizing: 'border-box', color: '#7F7F7F', fontFamily: '"Geist Mono", system-ui, sans-serif', fontSize: '12px', lineHeight: '16px', textAlign: 'center' }}>
          - Oscar
        </div>
      </div>
    </div>
  );
}
