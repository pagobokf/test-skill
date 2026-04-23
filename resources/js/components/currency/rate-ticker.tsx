import { useEffect, useState } from 'react';

import { CURRENCY_FLAGS } from '@/types/currency';
import type { ExchangeRates } from '@/types/currency';

interface RateTickerProps {
    rates: ExchangeRates | null;
}

const POPULAR_PAIRS = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD', 'HKD', 'INR', 'PHP', 'KRW'];

export function RateTicker({ rates }: RateTickerProps) {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setOffset((prev) => prev - 0.5);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    if (!rates || !rates.rates) return null;

    const items = POPULAR_PAIRS.filter((code) => rates.rates[code]).map((code) => ({
        code,
        flag: CURRENCY_FLAGS[code] ?? '💱',
        rate: rates.rates[code],
    }));

    // Double the items for seamless looping
    const doubledItems = [...items, ...items];

    return (
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] py-3 backdrop-blur-sm">
            <div className="absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-neutral-950 to-transparent" />
            <div className="absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-neutral-950 to-transparent" />

            <div
                className="flex gap-6 whitespace-nowrap transition-none"
                style={{ transform: `translateX(${offset % (items.length * 140)}px)` }}
            >
                {doubledItems.map((item, index) => (
                    <div key={`${item.code}-${index}`} className="flex shrink-0 items-center gap-2">
                        <span className="text-sm">{item.flag}</span>
                        <span className="text-xs font-medium text-white">{rates.base}/{item.code}</span>
                        <span className="text-xs font-semibold text-emerald-400">
                            {item.rate.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                            })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
