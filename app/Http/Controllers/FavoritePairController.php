<?php

namespace App\Http\Controllers;

use App\Models\FavoritePair;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoritePairController extends Controller
{
    /**
     * Store a new favorite currency pair.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from_currency' => 'required|string|size:3',
            'to_currency' => 'required|string|size:3',
            'label' => 'nullable|string|max:50',
        ]);

        if ($validated['from_currency'] === $validated['to_currency']) {
            return response()->json([
                'error' => 'Source and target currencies must be different.',
            ], 422);
        }

        // Check for existing pair
        $exists = FavoritePair::where('from_currency', $validated['from_currency'])
            ->where('to_currency', $validated['to_currency'])
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'This currency pair is already saved as a favorite.',
            ], 409);
        }

        $pair = FavoritePair::create($validated);

        return response()->json($pair, 201);
    }

    /**
     * Update a favorite pair's label.
     */
    public function update(Request $request, FavoritePair $favoritePair): JsonResponse
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:50',
        ]);

        $favoritePair->update($validated);

        return response()->json($favoritePair);
    }

    /**
     * Remove a favorite pair.
     */
    public function destroy(FavoritePair $favoritePair): JsonResponse
    {
        $favoritePair->delete();

        return response()->json(['message' => 'Favorite pair deleted successfully.']);
    }
}
