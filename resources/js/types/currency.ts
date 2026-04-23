export interface Currency {
    code: string;
    name: string;
}

export interface ConversionResult {
    amount: number;
    base: string;
    target: string;
    date: string;
    rate: number;
    result: number;
}

export interface MultiConversionResult {
    amount: number;
    base: string;
    date: string;
    conversions: Record<string, { rate: number; result: number }>;
}

export interface Provider {
    id: string;
    name: string;
    icon: string;
    feeType: 'flat' | 'percentage' | 'flat_percentage' | 'tiered';
    feeDescription: string;
    calculateFee: (amount: number) => number;
    color: string;
}

export interface FavoritePair {
    id: number;
    from_currency: string;
    to_currency: string;
    label: string | null;
    created_at: string;
    updated_at: string;
}

export interface ExchangeRates {
    amount: number;
    base: string;
    date: string;
    rates: Record<string, number>;
}

// Currency flag emoji mapping
export const CURRENCY_FLAGS: Record<string, string> = {
    AUD: '🇦🇺',
    BRL: '🇧🇷',
    CAD: '🇨🇦',
    CHF: '🇨🇭',
    CNY: '🇨🇳',
    CZK: '🇨🇿',
    DKK: '🇩🇰',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    HKD: '🇭🇰',
    HUF: '🇭🇺',
    IDR: '🇮🇩',
    ILS: '🇮🇱',
    INR: '🇮🇳',
    ISK: '🇮🇸',
    JPY: '🇯🇵',
    KRW: '🇰🇷',
    MXN: '🇲🇽',
    MYR: '🇲🇾',
    NOK: '🇳🇴',
    NZD: '🇳🇿',
    PHP: '🇵🇭',
    PLN: '🇵🇱',
    RON: '🇷🇴',
    SEK: '🇸🇪',
    SGD: '🇸🇬',
    THB: '🇹🇭',
    TRY: '🇹🇷',
    USD: '🇺🇸',
    ZAR: '🇿🇦',
};

// Provider definitions with fee calculations
export const PROVIDERS: Provider[] = [
    {
        id: 'bank-central',
        name: 'Bank Central',
        icon: '🏦',
        feeType: 'flat',
        feeDescription: 'Flat fee: $5.00',
        calculateFee: () => 5.0,
        color: 'from-blue-500 to-blue-700',
    },
    {
        id: 'transferwise',
        name: 'TransferWise',
        icon: '⚡',
        feeType: 'percentage',
        feeDescription: '0.35% of amount',
        calculateFee: (amount: number) => amount * 0.0035,
        color: 'from-emerald-500 to-emerald-700',
    },
    {
        id: 'paypal',
        name: 'PayPal',
        icon: '💳',
        feeType: 'percentage',
        feeDescription: '3.00% of amount',
        calculateFee: (amount: number) => amount * 0.03,
        color: 'from-indigo-500 to-indigo-700',
    },
    {
        id: 'western-union',
        name: 'Western Union',
        icon: '🌐',
        feeType: 'flat_percentage',
        feeDescription: '$3.00 + 1.50% of amount',
        calculateFee: (amount: number) => 3.0 + amount * 0.015,
        color: 'from-amber-500 to-amber-700',
    },
    {
        id: 'revolut',
        name: 'Revolut',
        icon: '🚀',
        feeType: 'tiered',
        feeDescription: '0.5% (first $1,000), 1% (above)',
        calculateFee: (amount: number) => {
            if (amount <= 1000) {
                return amount * 0.005;
            }
            return 1000 * 0.005 + (amount - 1000) * 0.01;
        },
        color: 'from-purple-500 to-purple-700',
    },
];
