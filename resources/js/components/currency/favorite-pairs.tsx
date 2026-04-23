import { Heart, Pencil, Trash2, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CURRENCY_FLAGS } from '@/types/currency';
import type { FavoritePair } from '@/types/currency';

interface FavoritePairsProps {
    favorites: FavoritePair[];
    currentFrom: string;
    currentTo: string;
    onSelect: (from: string, to: string) => void;
    onAdd: (from: string, to: string) => void;
    onDelete: (id: number) => void;
    onUpdateLabel: (id: number, label: string) => void;
}

export function FavoritePairs({
    favorites,
    currentFrom,
    currentTo,
    onSelect,
    onAdd,
    onDelete,
    onUpdateLabel,
}: FavoritePairsProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editLabel, setEditLabel] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const isCurrentPairSaved = favorites.some(
        (f) => f.from_currency === currentFrom && f.to_currency === currentTo,
    );

    const canAddCurrent = currentFrom && currentTo && currentFrom !== currentTo && !isCurrentPairSaved;

    const handleStartEdit = useCallback((pair: FavoritePair) => {
        setEditingId(pair.id);
        setEditLabel(pair.label ?? '');
    }, []);

    const handleSaveEdit = useCallback(
        (id: number) => {
            onUpdateLabel(id, editLabel);
            setEditingId(null);
            setEditLabel('');
        },
        [editLabel, onUpdateLabel],
    );

    const handleConfirmDelete = useCallback(
        (id: number) => {
            onDelete(id);
            setDeletingId(null);
        },
        [onDelete],
    );

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-pink-500/10 blur-3xl" />

            <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/25">
                            <Heart className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Favorite Pairs</h3>
                            <p className="text-muted-foreground text-xs">Quick access to your saved pairs</p>
                        </div>
                    </div>

                    {canAddCurrent && (
                        <Button
                            id="add-favorite-btn"
                            size="sm"
                            onClick={() => onAdd(currentFrom, currentTo)}
                            className="bg-gradient-to-r from-pink-600 to-rose-600 text-xs font-medium text-white hover:from-pink-500 hover:to-rose-500"
                        >
                            <Heart className="mr-1.5 h-3.5 w-3.5" />
                            Save Pair
                        </Button>
                    )}

                    {isCurrentPairSaved && currentFrom && currentTo && (
                        <Badge variant="outline" className="border-pink-500/30 text-xs text-pink-400">
                            <Heart className="mr-1 h-3 w-3 fill-current" />
                            Saved
                        </Badge>
                    )}
                </div>

                {favorites.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
                        <Heart className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
                        <p className="text-sm text-neutral-500">No favorite pairs yet</p>
                        <p className="text-muted-foreground text-xs">Select a currency pair and click "Save Pair"</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {favorites.map((pair) => {
                            const fromFlag = CURRENCY_FLAGS[pair.from_currency] ?? '💱';
                            const toFlag = CURRENCY_FLAGS[pair.to_currency] ?? '💱';
                            const isActive = pair.from_currency === currentFrom && pair.to_currency === currentTo;
                            const isEditing = editingId === pair.id;
                            const isDeleting = deletingId === pair.id;

                            return (
                                <div
                                    key={pair.id}
                                    className={`group relative overflow-hidden rounded-xl border p-3 transition-all ${
                                        isActive
                                            ? 'border-violet-500/30 bg-violet-500/5'
                                            : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                                    }`}
                                >
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={editLabel}
                                                onChange={(e) => setEditLabel(e.target.value)}
                                                placeholder="Enter label..."
                                                className="h-8 border-white/10 bg-white/5 text-xs"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit(pair.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleSaveEdit(pair.id)}
                                                className="h-8 bg-emerald-600 text-xs hover:bg-emerald-500"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingId(null)}
                                                className="h-8 text-xs"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ) : isDeleting ? (
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-red-400">Delete this pair?</p>
                                            <div className="flex gap-1.5">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleConfirmDelete(pair.id)}
                                                    className="h-7 bg-red-600 px-2.5 text-xs hover:bg-red-500"
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setDeletingId(null)}
                                                    className="h-7 px-2.5 text-xs"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => onSelect(pair.from_currency, pair.to_currency)}
                                                className="flex flex-1 items-center gap-2 text-left"
                                            >
                                                <span className="text-base">{fromFlag}</span>
                                                <span className="text-xs font-semibold text-white">{pair.from_currency}</span>
                                                <span className="text-xs text-neutral-500">→</span>
                                                <span className="text-base">{toFlag}</span>
                                                <span className="text-xs font-semibold text-white">{pair.to_currency}</span>
                                                {pair.label && (
                                                    <Badge variant="outline" className="ml-2 border-white/10 text-xs text-neutral-400">
                                                        {pair.label}
                                                    </Badge>
                                                )}
                                            </button>

                                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleStartEdit(pair)}
                                                    className="h-7 w-7 text-neutral-500 hover:text-white"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeletingId(pair.id)}
                                                    className="h-7 w-7 text-neutral-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
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
