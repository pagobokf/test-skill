<?php

namespace App\Http\Controllers;

use App\Services\CurrencyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function __construct(
        private readonly CurrencyService $currencyService
    ) {}

    /**
     * Display the currency converter dashboard.
     */
    public function index(): Response
    {
        $currencies = $this->currencyService->getCurrencies();
        $favorites = \App\Models\FavoritePair::orderBy('created_at', 'desc')->get();

        // Pre-fetch USD rates for initial load
        $initialRates = null;
        try {
            $initialRates = $this->currencyService->getLatestRates('USD');
        } catch (\Exception $e) {
            // Will be null — frontend handles gracefully
        }

        return Inertia::render('currency/index', [
            'currencies' => $currencies,
            'favorites' => $favorites,
            'initialRates' => $initialRates,
        ]);
    }

    /**
     * Convert currency via AJAX.
     */
    public function convert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:999999999',
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',
        ]);

        if ($validated['from'] === $validated['to']) {
            return response()->json([
                'error' => 'Source and target currencies must be different.',
            ], 422);
        }

        try {
            $result = $this->currencyService->convert(
                $validated['from'],
                $validated['to'],
                (float) $validated['amount']
            );

            return response()->json($result);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 503);
        }
    }

    /**
     * Fetch latest rates for a base currency.
     */
    public function rates(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'base' => 'required|string|size:3',
        ]);

        try {
            $rates = $this->currencyService->getLatestRates($validated['base']);

            return response()->json($rates);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 503);
        }
    }

    /**
     * Convert to multiple currencies at once.
     */
    public function convertMultiple(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:999999999',
            'from' => 'required|string|size:3',
            'targets' => 'required|array|min:1|max:10',
            'targets.*' => 'string|size:3',
        ]);

        try {
            $result = $this->currencyService->convertMultiple(
                $validated['from'],
                $validated['targets'],
                (float) $validated['amount']
            );

            return response()->json($result);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 503);
        }
    }
}
