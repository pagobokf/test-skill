import { CURRENCY_FLAGS } from '@/types/currency';
import type { ConversionResult } from '@/types/currency';

interface ConversionResultDisplayProps {
    result: ConversionResult;
    currencies: Record<string, string>;
}

export function ConversionResultDisplay({ result, currencies }: ConversionResultDisplayProps) {
    const fromFlag = CURRENCY_FLAGS[result.base] ?? '💱';
    const toFlag = CURRENCY_FLAGS[result.target] ?? '💱';
    const fromName = currencies[result.base] ?? result.base;
    const toName = currencies[result.target] ?? result.target;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 mt-6 duration-500">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 p-6 backdrop-blur-sm">
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />

                <div className="relative">
                    {/* Rate info */}
                    <div className="mb-4 text-center">
                        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                            Exchange Rate as of {result.date}
                        </p>
                        <p className="text-sm text-neutral-300">
                            1 {result.base} = <span className="font-semibold text-emerald-400">{result.rate.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span> {result.target}
                        </p>
                    </div>

                    {/* Main conversion */}
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
                        {/* From */}
                        <div className="text-center">
                            <span className="text-2xl">{fromFlag}</span>
                            <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                {result.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {result.base} · {fromName}
                            </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center">
                            <div className="hidden h-px w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent sm:block" />
                            <span className="mx-2 text-xl text-white/40">→</span>
                            <div className="hidden h-px w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent sm:block" />
                        </div>

                        {/* To */}
                        <div className="text-center">
                            <span className="text-2xl">{toFlag}</span>
                            <p className="text-2xl font-bold text-emerald-400 sm:text-3xl">
                                {result.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {result.target} · {toName}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
