<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyService
{
    private const BASE_URL = 'https://api.frankfurter.dev/v1';

    private const CURRENCIES_CACHE_TTL = 86400; // 24 hours

    private const RATES_CACHE_TTL = 1800; // 30 minutes

    /**
     * Get the list of available currencies.
     *
     * @return array<string, string>
     */
    public function getCurrencies(): array
    {
        return Cache::remember('currencies_list', self::CURRENCIES_CACHE_TTL, function () {
            try {
                $response = Http::timeout(10)->get(self::BASE_URL.'/currencies');

                if ($response->successful()) {
                    return $response->json();
                }

                Log::error('Frankfurter API: Failed to fetch currencies', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $this->getFallbackCurrencies();
            } catch (\Exception $e) {
                Log::error('Frankfurter API: Exception fetching currencies', [
                    'message' => $e->getMessage(),
                ]);

                return $this->getFallbackCurrencies();
            }
        });
    }

    /**
     * Get latest exchange rates for a base currency.
     *
     * @return array{amount: float, base: string, date: string, rates: array<string, float>}
     */
    public function getLatestRates(string $base = 'USD'): array
    {
        $cacheKey = "rates_{$base}";

        return Cache::remember($cacheKey, self::RATES_CACHE_TTL, function () use ($base) {
            try {
                $response = Http::timeout(10)->get(self::BASE_URL.'/latest', [
                    'base' => $base,
                ]);

                if ($response->successful()) {
                    return $response->json();
                }

                Log::error('Frankfurter API: Failed to fetch rates', [
                    'base' => $base,
                    'status' => $response->status(),
                ]);

                throw new \RuntimeException('Failed to fetch exchange rates from API.');
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error('Frankfurter API: Connection error', [
                    'message' => $e->getMessage(),
                ]);

                throw new \RuntimeException('Unable to connect to exchange rate service. Please try again later.');
            }
        });
    }

    /**
     * Convert an amount from one currency to another.
     *
     * @return array{amount: float, base: string, date: string, result: float, rate: float}
     */
    public function convert(string $from, string $to, float $amount): array
    {
        $rates = $this->getLatestRates($from);

        if (! isset($rates['rates'][$to])) {
            throw new \InvalidArgumentException("Currency pair {$from}/{$to} is not supported.");
        }

        $rate = $rates['rates'][$to];
        $result = round($amount * $rate, 4);

        return [
            'amount' => $amount,
            'base' => $from,
            'target' => $to,
            'date' => $rates['date'],
            'rate' => $rate,
            'result' => $result,
        ];
    }

    /**
     * Convert an amount from one currency to multiple target currencies.
     *
     * @param  string[]  $targets
     * @return array<string, array{rate: float, result: float}>
     */
    public function convertMultiple(string $from, array $targets, float $amount): array
    {
        $rates = $this->getLatestRates($from);
        $results = [];

        foreach ($targets as $to) {
            if (isset($rates['rates'][$to])) {
                $rate = $rates['rates'][$to];
                $results[$to] = [
                    'rate' => $rate,
                    'result' => round($amount * $rate, 4),
                ];
            }
        }

        return [
            'amount' => $amount,
            'base' => $from,
            'date' => $rates['date'],
            'conversions' => $results,
        ];
    }

    /**
     * Fallback currencies in case API is unavailable.
     *
     * @return array<string, string>
     */
    private function getFallbackCurrencies(): array
    {
        return [
            'AUD' => 'Australian Dollar',
            'BRL' => 'Brazilian Real',
            'CAD' => 'Canadian Dollar',
            'CHF' => 'Swiss Franc',
            'CNY' => 'Chinese Renminbi Yuan',
            'CZK' => 'Czech Koruna',
            'DKK' => 'Danish Krone',
            'EUR' => 'Euro',
            'GBP' => 'British Pound',
            'HKD' => 'Hong Kong Dollar',
            'HUF' => 'Hungarian Forint',
            'IDR' => 'Indonesian Rupiah',
            'ILS' => 'Israeli New Shekel',
            'INR' => 'Indian Rupee',
            'ISK' => 'Icelandic Króna',
            'JPY' => 'Japanese Yen',
            'KRW' => 'South Korean Won',
            'MXN' => 'Mexican Peso',
            'MYR' => 'Malaysian Ringgit',
            'NOK' => 'Norwegian Krone',
            'NZD' => 'New Zealand Dollar',
            'PHP' => 'Philippine Peso',
            'PLN' => 'Polish Złoty',
            'RON' => 'Romanian Leu',
            'SEK' => 'Swedish Krona',
            'SGD' => 'Singapore Dollar',
            'THB' => 'Thai Baht',
            'TRY' => 'Turkish Lira',
            'USD' => 'United States Dollar',
            'ZAR' => 'South African Rand',
        ];
    }
}
