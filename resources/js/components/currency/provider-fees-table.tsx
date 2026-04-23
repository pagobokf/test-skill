import { Badge } from '@/components/ui/badge';
import { CURRENCY_FLAGS, PROVIDERS } from '@/types/currency';
import type { ConversionResult } from '@/types/currency';

interface ProviderFeesTableProps {
    result: ConversionResult;
}

export function ProviderFeesTable({ result }: ProviderFeesTableProps) {
    const toFlag = CURRENCY_FLAGS[result.target] ?? '💱';

    // Calculate fees and sort by final amount (best deal first)
    const providerResults = PROVIDERS.map((provider) => {
        const fee = provider.calculateFee(result.amount);
        const effectiveAmount = Math.max(result.amount - fee, 0);
        const finalAmount = effectiveAmount * result.rate;

        return {
            provider,
            fee,
            effectiveAmount,
            finalAmount,
        };
    }).sort((a, b) => b.finalAmount - a.finalAmount);

    const bestDealId = providerResults[0]?.provider.id;

    return (
        <div
            className="mt-6 animate-in duration-500 fade-in slide-in-from-bottom-4"
            style={{ animationDelay: '150ms' }}
        >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />

                <h3 className="mb-1 text-sm font-semibold text-white">
                    Provider Fee Comparison
                </h3>
                <p className="mb-5 text-xs text-muted-foreground">
                    Converting {result.amount.toLocaleString()} {result.base} →{' '}
                    {result.target} across 5 providers
                </p>

                <div className="space-y-3">
                    {providerResults.map(
                        ({ provider, fee, finalAmount }, index) => {
                            const isBest = provider.id === bestDealId;
                            return (
                                <div
                                    key={provider.id}
                                    className={`relative animate-in overflow-hidden rounded-xl border p-4 transition-all fade-in slide-in-from-left ${
                                        isBest
                                            ? 'border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                                            : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                                    }`}
                                    style={{
                                        animationDelay: `${index * 80}ms`,
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">
                                                {provider.icon}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {provider.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {provider.feeDescription}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isBest && (
                                                    <Badge className="border-emerald-500/30 bg-emerald-500/15 text-xs font-medium text-emerald-400">
                                                        ✨ Best Deal
                                                    </Badge>
                                                )}
                                                <p className="text-xs text-neutral-400">
                                                    Fee:{' '}
                                                    <span className="text-red-400">
                                                        {fee.toLocaleString(
                                                            undefined,
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            },
                                                        )}{' '}
                                                        {result.base}
                                                    </span>
                                                </p>
                                            </div>

                                            <p
                                                className={`text-base font-bold ${isBest ? 'text-emerald-400' : 'text-white'}`}
                                            >
                                                {toFlag}{' '}
                                                {finalAmount.toLocaleString(
                                                    undefined,
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    },
                                                )}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {result.target}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        },
                    )}
                </div>
            </div>
        </div>
    );
}
