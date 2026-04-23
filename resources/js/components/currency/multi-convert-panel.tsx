import { Globe, Loader2, Plus, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { CurrencySelect } from '@/components/currency/currency-select';
import { Button } from '@/components/ui/button';
import { CURRENCY_FLAGS, PROVIDERS } from '@/types/currency';
import type { MultiConversionResult } from '@/types/currency';

interface MultiConvertPanelProps {
    currencies: Record<string, string>;
    fromCurrency: string;
    amount: string;
    isConverting: boolean;
    multiResult: MultiConversionResult | null;
    onConvert: (targets: string[]) => void;
}

export function MultiConvertPanel({
    currencies,
    fromCurrency,
    amount,
    isConverting,
    multiResult,
    onConvert,
}: MultiConvertPanelProps) {
    const [targets, setTargets] = useState<string[]>(['EUR', 'GBP', 'JPY']);

    const addTarget = useCallback(() => {
        // Find a currency not yet in targets
        const available = Object.keys(currencies).find(
            (code) => !targets.includes(code) && code !== fromCurrency,
        );
        if (available) {
            setTargets((prev) => [...prev, available]);
        }
    }, [currencies, targets, fromCurrency]);

    const removeTarget = useCallback((index: number) => {
        setTargets((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const updateTarget = useCallback((index: number, value: string) => {
        setTargets((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    }, []);

    const handleConvert = useCallback(() => {
        const valid = targets.filter((t) => t && t !== fromCurrency);
        if (valid.length > 0) {
            onConvert(valid);
        }
    }, [targets, fromCurrency, onConvert]);

    const parsedAmount = parseFloat(amount) || 0;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                        <Globe className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Multi-Currency Convert</h3>
                        <p className="text-muted-foreground text-xs">Convert to multiple currencies at once</p>
                    </div>
                </div>

                {/* Target currencies */}
                <div className="mb-4 space-y-2.5">
                    {targets.map((target, index) => (
                        <div key={index} className="flex items-end gap-2">
                            <div className="flex-1">
                                <CurrencySelect
                                    currencies={currencies}
                                    value={target}
                                    onChange={(v) => updateTarget(index, v)}
                                />
                            </div>
                            {targets.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTarget(index)}
                                    className="h-10 w-10 shrink-0 text-neutral-500 hover:text-red-400"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mb-4 flex gap-2">
                    {targets.length < 10 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addTarget}
                            className="border-white/10 bg-white/5 text-xs hover:bg-white/10"
                        >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Add Currency
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={handleConvert}
                        disabled={isConverting || !amount || parsedAmount <= 0 || !fromCurrency || targets.filter(Boolean).length === 0}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-medium text-white hover:from-cyan-500 hover:to-blue-500"
                    >
                        {isConverting ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Converting...
                            </span>
                        ) : (
                            'Convert All'
                        )}
                    </Button>
                </div>

                {/* Results */}
                {multiResult && multiResult.conversions && (
                    <div className="animate-in fade-in grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(multiResult.conversions).map(([code, data], index) => {
                            const flag = CURRENCY_FLAGS[code] ?? '💱';
                            const currencyName = currencies[code] ?? code;

                            // Best provider for this conversion
                            const providerResults = PROVIDERS.map((p) => {
                                const fee = p.calculateFee(multiResult.amount);
                                const effective = Math.max(multiResult.amount - fee, 0);
                                return {
                                    name: p.name,
                                    icon: p.icon,
                                    final: effective * data.rate,
                                };
                            }).sort((a, b) => b.final - a.final);

                            const best = providerResults[0];

                            return (
                                <div
                                    key={code}
                                    className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/15 hover:bg-white/[0.05]"
                                    style={{ animationDelay: `${index * 60}ms` }}
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="text-lg">{flag}</span>
                                        <span className="text-xs font-semibold text-white">{code}</span>
                                        <span className="text-muted-foreground text-xs">{currencyName}</span>
                                    </div>
                                    <p className="text-xl font-bold text-white">
                                        {data.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-muted-foreground mb-2 text-xs">
                                        Rate: {data.rate.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                                    </p>
                                    {best && (
                                        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-xs">
                                            <span className="text-neutral-400">Best: </span>
                                            <span className="text-emerald-400">
                                                {best.icon} {best.name} → {best.final.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
