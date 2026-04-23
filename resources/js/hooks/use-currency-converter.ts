import { useCallback, useState } from 'react';

import type { ConversionResult, MultiConversionResult } from '@/types/currency';

interface UseCurrencyConverterReturn {
    result: ConversionResult | null;
    multiResult: MultiConversionResult | null;
    isConverting: boolean;
    isMultiConverting: boolean;
    error: string | null;
    convert: (from: string, to: string, amount: number) => Promise<ConversionResult | null>;
    convertMultiple: (from: string, targets: string[], amount: number) => Promise<MultiConversionResult | null>;
    clearResult: () => void;
    clearError: () => void;
}

export function useCurrencyConverter(): UseCurrencyConverterReturn {
    const [result, setResult] = useState<ConversionResult | null>(null);
    const [multiResult, setMultiResult] = useState<MultiConversionResult | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [isMultiConverting, setIsMultiConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const convert = useCallback(async (from: string, to: string, amount: number): Promise<ConversionResult | null> => {
        setIsConverting(true);
        setError(null);

        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ from, to, amount }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || data.message || 'Conversion failed. Please try again.';
                setError(errorMsg);
                return null;
            }

            setResult(data);
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Network error. Please check your connection.';
            setError(message);
            return null;
        } finally {
            setIsConverting(false);
        }
    }, []);

    const convertMultiple = useCallback(
        async (from: string, targets: string[], amount: number): Promise<MultiConversionResult | null> => {
            setIsMultiConverting(true);
            setError(null);

            try {
                const response = await fetch('/api/convert-multiple', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ from, targets, amount }),
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMsg = data.error || data.message || 'Multiple conversion failed.';
                    setError(errorMsg);
                    return null;
                }

                setMultiResult(data);
                return data;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Network error. Please check your connection.';
                setError(message);
                return null;
            } finally {
                setIsMultiConverting(false);
            }
        },
        [],
    );

    const clearResult = useCallback(() => {
        setResult(null);
        setMultiResult(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        result,
        multiResult,
        isConverting,
        isMultiConverting,
        error,
        convert,
        convertMultiple,
        clearResult,
        clearError,
    };
}
