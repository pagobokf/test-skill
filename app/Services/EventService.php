<?php

namespace App\Services;

use App\Models\Event;
use Illuminate\Support\Collection;

class EventService
{
    /**
     * @return Collection<int, array<string, int|string|null>>
     */
    public function listForPage(): Collection
    {
        return Event::query()
            ->latest('event_date')
            ->latest('id')
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'location' => $event->location,
                'event_date' => $event->event_date?->format('Y-m-d'),
                'created_at' => $event->created_at?->toDateTimeString(),
            ]);
    }

    /**
     * @param  array<string, string|null>  $attributes
     */
    public function create(array $attributes): Event
    {
        return Event::query()->create($attributes);
    }

    /**
     * @param  array<string, string|null>  $attributes
     */
    public function update(Event $event, array $attributes): Event
    {
        $event->update($attributes);

        return $event->refresh();
    }

    public function delete(Event $event): void
    {
        $event->delete();
    }
}
