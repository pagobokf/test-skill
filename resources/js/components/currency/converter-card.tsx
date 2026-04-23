import { ArrowDownUp, Loader2, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';

import { CurrencySelect } from '@/components/currency/currency-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ConverterCardProps {
    currencies: Record<string, string>;
    fromCurrency: string;
    toCurrency: string;
    amount: string;
    isConverting: boolean;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    onAmountChange: (value: string) => void;
    onSwap: () => void;
    onConvert: () => void;
}

export function ConverterCard({
    currencies,
    fromCurrency,
    toCurrency,
    amount,
    isConverting,
    onFromChange,
    onToChange,
    onAmountChange,
    onSwap,
    onConvert,
}: ConverterCardProps) {
    const [amountError, setAmountError] = useState<string | null>(null);
    const isSameCurrency = fromCurrency === toCurrency && fromCurrency !== '';

    const handleAmountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;

            // Allow empty or valid numeric input
            if (val === '' || /^\d*\.?\d*$/.test(val)) {
                onAmountChange(val);
                if (parseFloat(val) > 999999999) {
                    setAmountError('Maximum amount is 999,999,999');
                } else if (parseFloat(val) <= 0 && val !== '' && val !== '0' && val !== '0.') {
                    setAmountError('Amount must be greater than 0');
                } else {
                    setAmountError(null);
                }
            }
        },
        [onAmountChange],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !isConverting && amount && fromCurrency && toCurrency && !isSameCurrency) {
                onConvert();
            }
        },
        [amount, fromCurrency, toCurrency, isConverting, isSameCurrency, onConvert],
    );

    const isValid = amount !== '' && parseFloat(amount) > 0 && parseFloat(amount) <= 999999999 && fromCurrency && toCurrency && !isSameCurrency;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            {/* Background decorations */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
            <div className="absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-indigo-600/10 blur-3xl" />

            <div className="relative">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Convert Currency</h2>
                        <p className="text-muted-foreground text-xs">Live exchange rates from ECB</p>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="mb-5">
                    <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
                        Amount
                    </label>
                    <Input
                        id="converter-amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={handleAmountChange}
                        onKeyDown={handleKeyDown}
                        className="h-14 border-white/10 bg-white/5 text-lg font-semibold tracking-wide text-white placeholder:text-neutral-500 focus:border-violet-500/50 focus:ring-violet-500/20"
                    />
                    {amountError && (
                        <p className="mt-1.5 text-xs font-medium text-red-400">{amountError}</p>
                    )}
                </div>

                {/* Currency Selectors with Swap */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
                    <div className="flex-1">
                        <CurrencySelect
                            id="converter-from-currency"
                            currencies={currencies}
                            value={fromCurrency}
                            onChange={onFromChange}
                            label="From"
                        />
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center sm:pb-0.5">
                        <Button
                            id="converter-swap-btn"
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={onSwap}
                            className="h-10 w-10 rounded-full border-white/10 bg-white/5 text-white/60 transition-all duration-300 hover:rotate-180 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-400"
                        >
                            <ArrowDownUp className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1">
                        <CurrencySelect
                            id="converter-to-currency"
                            currencies={currencies}
                            value={toCurrency}
                            onChange={onToChange}
                            label="To"
                        />
                    </div>
                </div>

                {/* Same currency warning */}
                {isSameCurrency && (
                    <div className="animate-in fade-in mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs font-medium text-amber-300">
                        ⚠️ Source and target currencies must be different
                    </div>
                )}

                {/* Convert Button */}
                <Button
                    id="converter-submit-btn"
                    onClick={onConvert}
                    disabled={!isValid || isConverting}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold tracking-wide text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-40 disabled:shadow-none"
                >
                    {isConverting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Converting...
                        </span>
                    ) : (
                        'Convert'
                    )}
                </Button>
            </div>
        </div>
    );
}
