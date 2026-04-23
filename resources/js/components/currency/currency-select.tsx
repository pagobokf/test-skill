import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CURRENCY_FLAGS } from '@/types/currency';

interface CurrencySelectProps {
    currencies: Record<string, string>;
    value: string;
    onChange: (value: string) => void;
    label?: string;
    disabled?: boolean;
    id?: string;
}

export function CurrencySelect({ currencies, value, onChange, label, disabled = false, id }: CurrencySelectProps) {
    const [open, setOpen] = useState(false);
    const currencyEntries = Object.entries(currencies);

    const selectedName = currencies[value] ?? '';
    const selectedFlag = CURRENCY_FLAGS[value] ?? '💱';

    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className="h-12 w-full justify-between border-white/10 bg-white/5 px-3 text-left backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                    >
                        {value ? (
                            <span className="flex items-center gap-2.5 text-sm">
                                <span className="text-lg">{selectedFlag}</span>
                                <span className="font-semibold">{value}</span>
                                <span className="text-muted-foreground hidden text-xs sm:inline">{selectedName}</span>
                            </span>
                        ) : (
                            <span className="text-muted-foreground text-sm">Select currency...</span>
                        )}
                        <ChevronsUpDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] border-white/10 bg-neutral-900/95 p-0 backdrop-blur-xl sm:w-[340px]" align="start">
                    <Command className="bg-transparent">
                        <div className="flex items-center border-b border-white/10 px-3">
                            <Search className="text-muted-foreground mr-2 h-4 w-4" />
                            <CommandInput
                                placeholder="Search currencies..."
                                className="h-10 border-0 bg-transparent text-sm focus:ring-0"
                            />
                        </div>
                        <CommandList>
                            <CommandEmpty className="py-6 text-center text-sm text-neutral-400">
                                No currency found.
                            </CommandEmpty>
                            <CommandGroup className="max-h-[280px] overflow-auto p-1">
                                {currencyEntries.map(([code, name]) => (
                                    <CommandItem
                                        key={code}
                                        value={`${code} ${name}`}
                                        onSelect={() => {
                                            onChange(code);
                                            setOpen(false);
                                        }}
                                        className="cursor-pointer rounded-md px-2 py-2.5 text-sm transition-colors hover:bg-white/10"
                                    >
                                        <span className="mr-2.5 text-lg">{CURRENCY_FLAGS[code] ?? '💱'}</span>
                                        <span className="font-medium">{code}</span>
                                        <span className="text-muted-foreground ml-2 text-xs">{name}</span>
                                        <Check
                                            className={cn(
                                                'ml-auto h-4 w-4 text-emerald-400',
                                                value === code ? 'opacity-100' : 'opacity-0',
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
