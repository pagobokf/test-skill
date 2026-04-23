<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_a_successful_response()
    {
        Event::query()->create([
            'title' => 'Team Planning',
            'description' => 'Quarterly planning session',
            'location' => 'Conference Room',
            'event_date' => '2026-05-01',
        ]);

        $response = $this->get(route('home'));

        $response
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('welcome')
                ->has('events', 1)
                ->where('events.0.title', 'Team Planning'));
    }

    public function test_can_create_an_event()
    {
        $response = $this->post(route('events.store'), [
            'title' => 'Launch Day',
            'description' => 'Product launch event',
            'location' => 'Main Hall',
            'event_date' => '2026-06-15',
        ]);

        $response->assertRedirect(route('home'));

        $this->assertDatabaseHas('events', [
            'title' => 'Launch Day',
            'location' => 'Main Hall',
            'event_date' => '2026-06-15',
        ]);
    }

    public function test_can_update_an_event()
    {
        $event = Event::query()->create([
            'title' => 'Old Name',
            'description' => 'Old description',
            'location' => 'Old place',
            'event_date' => '2026-07-01',
        ]);

        $response = $this->put(route('events.update', $event), [
            'title' => 'New Name',
            'description' => 'Updated description',
            'location' => 'New place',
            'event_date' => '2026-07-10',
        ]);

        $response->assertRedirect(route('home'));

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'New Name',
            'location' => 'New place',
            'event_date' => '2026-07-10',
        ]);
    }

    public function test_can_delete_an_event()
    {
        $event = Event::query()->create([
            'title' => 'Delete Me',
            'description' => null,
            'location' => null,
            'event_date' => '2026-08-01',
        ]);

        $response = $this->delete(route('events.destroy', $event));

        $response->assertRedirect(route('home'));

        $this->assertDatabaseMissing('events', [
            'id' => $event->id,
        ]);
    }
}
