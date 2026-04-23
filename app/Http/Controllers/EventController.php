<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpsertEventRequest;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        protected EventService $eventService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('welcome', [
            'events' => $this->eventService->listForPage(),
        ]);
    }

    public function store(UpsertEventRequest $request): RedirectResponse
    {
        $this->eventService->create($request->payload());

        return redirect()
            ->route('home')
            ->with('success', 'Event created successfully.');
    }

    public function update(UpsertEventRequest $request, Event $event): RedirectResponse
    {
        $this->eventService->update($event, $request->payload());

        return redirect()
            ->route('home')
            ->with('success', 'Event updated successfully.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $this->eventService->delete($event);

        return redirect()
            ->route('home')
            ->with('success', 'Event deleted successfully.');
    }
}
