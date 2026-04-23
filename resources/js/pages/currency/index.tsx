import { Head } from '@inertiajs/react';
import { AlertCircle, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

import { ConversionResultDisplay } from '@/components/currency/conversion-result';
import { ConverterCard } from '@/components/currency/converter-card';
import { FavoritePairs } from '@/components/currency/favorite-pairs';
import { MultiConvertPanel } from '@/components/currency/multi-convert-panel';
import { ProviderFeesTable } from '@/components/currency/provider-fees-table';
import { RateTicker } from '@/components/currency/rate-ticker';
import { useCurrencyConverter } from '@/hooks/use-currency-converter';
import type { ExchangeRates, FavoritePair } from '@/types/currency';

interface CurrencyDashboardProps {
    currencies: Record<string, string>;
    favorites: FavoritePair[];
    initialRates: ExchangeRates | null;
}

export default function CurrencyDashboard({ currencies, favorites: initialFavorites, initialRates }: CurrencyDashboardProps) {
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('PHP');
    const [amount, setAmount] = useState('1000');
    const [favorites, setFavorites] = useState<FavoritePair[]>(initialFavorites);
    const [isOnline, setIsOnline] = useState(true);

    const { result, multiResult, isConverting, isMultiConverting, error, convert, convertMultiple, clearError } =
        useCurrencyConverter();

    // Online/offline detection
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Back online!');
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.error('You are offline. Some features may not work.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Show error toasts
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    const handleSwap = useCallback(() => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    }, [fromCurrency, toCurrency]);

    const handleConvert = useCallback(async () => {
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        await convert(fromCurrency, toCurrency, amt);
    }, [amount, fromCurrency, toCurrency, convert]);

    const handleMultiConvert = useCallback(
        async (targets: string[]) => {
            const amt = parseFloat(amount);
            if (!amt || amt <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }
            await convertMultiple(fromCurrency, targets, amt);
        },
        [amount, fromCurrency, convertMultiple],
    );

    const handleSelectFavorite = useCallback((from: string, to: string) => {
        setFromCurrency(from);
        setToCurrency(to);
    }, []);

    const handleAddFavorite = useCallback(async (from: string, to: string) => {
        try {
            const response = await fetch('/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ from_currency: from, to_currency: to }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || 'Failed to add favorite');
                return;
            }

            setFavorites((prev) => [data, ...prev]);
            toast.success(`${from}/${to} added to favorites!`);
        } catch {
            toast.error('Failed to add favorite. Please try again.');
        }
    }, []);

    const handleDeleteFavorite = useCallback(async (id: number) => {
        try {
            const response = await fetch(`/favorites/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                toast.error('Failed to delete favorite');
                return;
            }

            setFavorites((prev) => prev.filter((f) => f.id !== id));
            toast.success('Favorite removed');
        } catch {
            toast.error('Failed to delete favorite. Please try again.');
        }
    }, []);

    const handleUpdateLabel = useCallback(async (id: number, label: string) => {
        try {
            const response = await fetch(`/favorites/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ label: label || null }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || 'Failed to update label');
                return;
            }

            setFavorites((prev) => prev.map((f) => (f.id === id ? { ...f, label: data.label } : f)));
            toast.success('Label updated');
        } catch {
            toast.error('Failed to update label. Please try again.');
        }
    }, []);

    return (
        <>
            <Head title="Currency Converter Dashboard" />
            <Toaster
                theme="dark"
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'rgba(23, 23, 23, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                    },
                }}
            />

            <div className="relative min-h-screen bg-neutral-950 text-white">
                {/* Background gradients */}
                <div className="pointer-events-none fixed inset-0">
                    <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
                    <div className="absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[120px]" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-600/5 blur-[150px]" />
                </div>

                <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Offline Banner */}
                    {!isOnline && (
                        <div className="animate-in slide-in-from-top mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            <WifiOff className="h-4 w-4" />
                            <span>You are offline. Currency rates may be outdated.</span>
                        </div>
                    )}

                    {/* Header */}
                    <header className="mb-8 text-center">
                        <div className="mb-3 flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-400 backdrop-blur-sm">
                                {isOnline ? (
                                    <>
                                        <Wifi className="h-3 w-3 text-emerald-400" />
                                        <span>Live Rates</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="h-3 w-3 text-red-400" />
                                        <span>Offline</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <h1 className="bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                            Currency Converter
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Real-time exchange rates powered by the European Central Bank
                        </p>
                    </header>

                    {/* Rate Ticker */}
                    <div className="mb-8">
                        <RateTicker rates={initialRates} />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                        {/* Left Column — Converter + Results */}
                        <div className="space-y-6">
                            {/* Converter Card */}
                            <ConverterCard
                                currencies={currencies}
                                fromCurrency={fromCurrency}
                                toCurrency={toCurrency}
                                amount={amount}
                                isConverting={isConverting}
                                onFromChange={setFromCurrency}
                                onToChange={setToCurrency}
                                onAmountChange={setAmount}
                                onSwap={handleSwap}
                                onConvert={handleConvert}
                            />

                            {/* Conversion Result */}
                            {result && (
                                <ConversionResultDisplay
                                    result={result}
                                    currencies={currencies}
                                />
                            )}

                            {/* Provider Fee Comparison */}
                            {result && <ProviderFeesTable result={result} />}

                            {/* Multi Convert Panel */}
                            <MultiConvertPanel
                                currencies={currencies}
                                fromCurrency={fromCurrency}
                                amount={amount}
                                isConverting={isMultiConverting}
                                multiResult={multiResult}
                                onConvert={handleMultiConvert}
                            />
                        </div>

                        {/* Right Column — Favorites */}
                        <div className="lg:sticky lg:top-6 lg:self-start">
                            <FavoritePairs
                                favorites={favorites}
                                currentFrom={fromCurrency}
                                currentTo={toCurrency}
                                onSelect={handleSelectFavorite}
                                onAdd={handleAddFavorite}
                                onDelete={handleDeleteFavorite}
                                onUpdateLabel={handleUpdateLabel}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-12 border-t border-white/5 pt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span>
                                Exchange rates sourced from{' '}
                                <a
                                    href="https://api.frankfurter.dev"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neutral-400 underline decoration-neutral-600 underline-offset-2 transition-colors hover:text-white"
                                >
                                    Frankfurter API
                                </a>{' '}
                                (European Central Bank)
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-600">
                            Rates are cached and updated every 30 minutes. Not for financial advice.
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
