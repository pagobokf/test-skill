import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type EventItem = {
    id: number;
    title: string;
    description: string | null;
    location: string | null;
    event_date: string;
    created_at: string | null;
};

type EventFormData = {
    title: string;
    description: string;
    location: string;
    event_date: string;
};

type WelcomeProps = {
    events: EventItem[];
};

const emptyEventForm: EventFormData = {
    title: '',
    description: '',
    location: '',
    event_date: '',
};

export default function Welcome({ events }: WelcomeProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const { flash } = usePage().props;

    const createForm = useForm<EventFormData>(emptyEventForm);
    const editForm = useForm<EventFormData>(emptyEventForm);

    const formatDate = (value: string) =>
        new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(value));

    const submitCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        createForm.post('/events', {
            onSuccess: () => createForm.reset(),
        });
    };

    const startEditing = (eventItem: EventItem) => {
        setEditingId(eventItem.id);
        editForm.setData({
            title: eventItem.title,
            description: eventItem.description ?? '',
            location: eventItem.location ?? '',
            event_date: eventItem.event_date,
        });
        editForm.clearErrors();
    };

    const cancelEditing = () => {
        setEditingId(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitUpdate = (event: FormEvent<HTMLFormElement>, eventId: number) => {
        event.preventDefault();

        editForm.put(`/events/${eventId}`, {
            onSuccess: () => cancelEditing(),
        });
    };

    const deleteEvent = (eventItem: EventItem) => {
        if (!window.confirm(`Delete "${eventItem.title}"?`)) {
            return;
        }

        editForm.delete(`/events/${eventItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (editingId === eventItem.id) {
                    cancelEditing();
                }
            },
        });
    };

    return (
        <>
            <Head title="Events" />

            <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.12),_transparent_30%),linear-gradient(180deg,_#fff8f1_0%,_#ffffff_45%,_#f8fafc_100%)] px-4 py-10 text-slate-900">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                    <section className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">
                            Event Planner
                        </p>
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-2xl space-y-2">
                                <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
                                    Create, update, and manage your events in one place.
                                </h1>
                                <p className="text-base text-slate-600">
                                    A simple CRUD screen with quick editing and deletion built on your Laravel + Inertia app.
                                </p>
                            </div>
                            <div className="rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
                                {events.length} {events.length === 1 ? 'event' : 'events'} saved
                            </div>
                        </div>
                    </section>

                    {flash.success ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {flash.success}
                        </div>
                    ) : null}

                    <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
                        <Card className="border border-white/70 bg-white/90 shadow-xl shadow-rose-100/40">
                            <CardHeader>
                                <CardTitle>New event</CardTitle>
                                <CardDescription>
                                    Add a title, date, and a few details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={submitCreate}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="title">
                                            Title
                                        </label>
                                        <input
                                            id="title"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-rose-300"
                                            value={createForm.data.title}
                                            onChange={(event) =>
                                                createForm.setData('title', event.target.value)
                                            }
                                            placeholder="Spring launch"
                                        />
                                        {createForm.errors.title ? (
                                            <p className="text-sm text-red-500">{createForm.errors.title}</p>
                                        ) : null}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="event_date">
                                            Date
                                        </label>
                                        <input
                                            id="event_date"
                                            type="date"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-rose-300"
                                            value={createForm.data.event_date}
                                            onChange={(event) =>
                                                createForm.setData('event_date', event.target.value)
                                            }
                                        />
                                        {createForm.errors.event_date ? (
                                            <p className="text-sm text-red-500">
                                                {createForm.errors.event_date}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700" htmlFor="location">
                                            Location
                                        </label>
                                        <input
                                            id="location"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-rose-300"
                                            value={createForm.data.location}
                                            onChange={(event) =>
                                                createForm.setData('location', event.target.value)
                                            }
                                            placeholder="Main hall"
                                        />
                                        {createForm.errors.location ? (
                                            <p className="text-sm text-red-500">
                                                {createForm.errors.location}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            className="text-sm font-medium text-slate-700"
                                            htmlFor="description"
                                        >
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-rose-300"
                                            value={createForm.data.description}
                                            onChange={(event) =>
                                                createForm.setData('description', event.target.value)
                                            }
                                            placeholder="What is this event about?"
                                        />
                                        {createForm.errors.description ? (
                                            <p className="text-sm text-red-500">
                                                {createForm.errors.description}
                                            </p>
                                        ) : null}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-11 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                                        disabled={createForm.processing}
                                    >
                                        {createForm.processing ? 'Saving...' : 'Create event'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <section className="space-y-4">
                            {events.length === 0 ? (
                                <Card className="border border-dashed border-slate-300 bg-white/80">
                                    <CardContent className="py-12 text-center">
                                        <p className="text-lg font-medium text-slate-900">
                                            No events yet
                                        </p>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Create your first event from the form on the left.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                events.map((eventItem) => {
                                    const isEditing = editingId === eventItem.id;

                                    return (
                                        <Card
                                            key={eventItem.id}
                                            className="border border-white/70 bg-white/90 shadow-lg shadow-slate-200/40"
                                        >
                                            {isEditing ? (
                                                <form onSubmit={(event) => submitUpdate(event, eventItem.id)}>
                                                    <CardHeader>
                                                        <CardTitle>Edit event</CardTitle>
                                                        <CardDescription>
                                                            Update the details and save your changes.
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">
                                                                    Title
                                                                </label>
                                                                <input
                                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-300"
                                                                    value={editForm.data.title}
                                                                    onChange={(event) =>
                                                                        editForm.setData(
                                                                            'title',
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                />
                                                                {editForm.errors.title ? (
                                                                    <p className="text-sm text-red-500">
                                                                        {editForm.errors.title}
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">
                                                                    Date
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-300"
                                                                    value={editForm.data.event_date}
                                                                    onChange={(event) =>
                                                                        editForm.setData(
                                                                            'event_date',
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                />
                                                                {editForm.errors.event_date ? (
                                                                    <p className="text-sm text-red-500">
                                                                        {editForm.errors.event_date}
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">
                                                                Location
                                                            </label>
                                                            <input
                                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-300"
                                                                value={editForm.data.location}
                                                                onChange={(event) =>
                                                                    editForm.setData(
                                                                        'location',
                                                                        event.target.value,
                                                                    )
                                                                }
                                                            />
                                                            {editForm.errors.location ? (
                                                                <p className="text-sm text-red-500">
                                                                    {editForm.errors.location}
                                                                </p>
                                                            ) : null}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">
                                                                Description
                                                            </label>
                                                            <textarea
                                                                className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-300"
                                                                value={editForm.data.description}
                                                                onChange={(event) =>
                                                                    editForm.setData(
                                                                        'description',
                                                                        event.target.value,
                                                                    )
                                                                }
                                                            />
                                                            {editForm.errors.description ? (
                                                                <p className="text-sm text-red-500">
                                                                    {editForm.errors.description}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="justify-between gap-3">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={cancelEditing}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            className="bg-amber-500 text-white hover:bg-amber-600"
                                                            disabled={editForm.processing}
                                                        >
                                                            {editForm.processing
                                                                ? 'Updating...'
                                                                : 'Save changes'}
                                                        </Button>
                                                    </CardFooter>
                                                </form>
                                            ) : (
                                                <>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-start justify-between gap-3">
                                                            <span>{eventItem.title}</span>
                                                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                                                                {formatDate(eventItem.event_date)}
                                                            </span>
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {eventItem.location || 'No location added'}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <p className="text-sm leading-6 text-slate-600">
                                                            {eventItem.description ||
                                                                'No description provided yet.'}
                                                        </p>
                                                    </CardContent>
                                                    <CardFooter className="justify-between gap-3">
                                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                                            Event #{eventItem.id}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => startEditing(eventItem)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                onClick={() => deleteEvent(eventItem)}
                                                                disabled={editForm.processing}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </CardFooter>
                                                </>
                                            )}
                                        </Card>
                                    );
                                })
                            )}
                        </section>
                    </section>
                </div>
            </main>
        </>
    );
}
