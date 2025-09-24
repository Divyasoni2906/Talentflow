import { http, HttpResponse, delay } from 'msw';
import { faker } from '@faker-js/faker';
import { db } from '../../db';

// Ensure the database is seeded on startup
db.on('ready', async () => {
    const { seedDatabase } = await import('../../db');
    seedDatabase();
});

export const handlers = [
    // --- JOBS ---
    http.get('/jobs', async ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const search = url.searchParams.get('search') || '';
        const status = url.searchParams.get('status') || 'all';
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

        await delay(faker.number.int({ min: 200, max: 800 }));

        let allJobs = await db.jobs.orderBy('order').toArray();
        if (status !== 'all') {
            allJobs = allJobs.filter(job => job.status === status);
        }
        if (search) {
            allJobs = allJobs.filter(job => job.title.toLowerCase().includes(search.toLowerCase()));
        }

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedJobs = allJobs.slice(start, end);

        return HttpResponse.json({ jobs: paginatedJobs, total: allJobs.length });
    }),

    http.post('/jobs', async ({ request }) => {
        const newJob = await request.json();
        const highestOrderJob = await db.jobs.orderBy('order').last();
        const newOrder = highestOrderJob ? highestOrderJob.order + 1 : 0;
        const jobWithId = { ...newJob, id: faker.string.uuid(), order: newOrder };
        await db.jobs.add(jobWithId);
        return HttpResponse.json(jobWithId, { status: 201 });
    }),
    
    http.patch('/jobs/:id', async ({ params, request }) => {
        const { id } = params;
        const updates = await request.json();
        await db.jobs.update(id, updates);
        const updatedJob = await db.jobs.get(id);
        return HttpResponse.json(updatedJob);
    }),

    // Corrected reorder logic
    http.patch('/jobs/reorder', async ({ request }) => {
        const { fromId, toId } = await request.json();
        await db.transaction('rw', db.jobs, async () => {
            const allJobs = await db.jobs.orderBy('order').toArray();
            const fromIndex = allJobs.findIndex(j => j.id === fromId);
            const toIndex = allJobs.findIndex(j => j.id === toId);

            if (fromIndex === -1 || toIndex === -1) return;
            
            const [movedItem] = allJobs.splice(fromIndex, 1);
            allJobs.splice(toIndex, 0, movedItem);

            const updatePromises = allJobs.map((job, index) => 
                db.jobs.update(job.id, { order: index })
            );
            await Promise.all(updatePromises);
        });
        return HttpResponse.json({ success: true });
    }),


    // --- CANDIDATES ---
    http.get('/candidates', async ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        let candidates = await db.candidates.toArray();
        if (search) {
            candidates = candidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
        }
        return HttpResponse.json({ candidates });
    }),

    http.get('/candidates/:id', async ({ params }) => {
        const { id } = params;
        const candidate = await db.candidates.get(id);
        if (candidate) {
            const job = await db.jobs.get(candidate.jobId);
            return HttpResponse.json({ ...candidate, jobTitle: job?.title || 'N/A' });
        }
        return new HttpResponse(null, { status: 404 });
    }),
    // NEW: Handler for candidate timeline
    http.get('/candidates/:id/timeline', async ({ params }) => {
        // This generates fake timeline data for demonstration
        await delay(300);
        const events = Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, (_, i) => ({
            id: faker.string.uuid(),
            date: faker.date.recent({ days: 30 }).toISOString(),
            event: `Moved to stage: ${faker.helpers.arrayElement(Object.values(STAGE_LABELS))}`,
            notes: `Notes added by HR Team.`,
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
        return HttpResponse.json(events);
    }),

    http.patch('/candidates/:id', async ({ params, request }) => {
        const { id } = params;
        const { stage } = await request.json();
        await db.candidates.update(id, { stage });
        const updatedCandidate = await db.candidates.get(id);
        return HttpResponse.json(updatedCandidate);
    }),

    // --- ASSESSMENTS ---
    http.get('/assessments/:jobId', async ({ params }) => {
        const { jobId } = params;
        let assessment = await db.assessments.get(jobId);
        if (!assessment) {
            assessment = { jobId, structure: { title: 'New Assessment', sections: [] } };
            await db.assessments.add(assessment);
        }
        return HttpResponse.json(assessment);
    }),

    http.put('/assessments/:jobId', async ({ params, request }) => {
        const { jobId } = params;
        const { structure } = await request.json();
        await db.assessments.put({ jobId, structure });
        return HttpResponse.json({ jobId, structure });
    }),
    http.post('/assessments/:jobId/submit', async ({ request }) => {
        const submission = await request.json();
        console.log("Assessment Submission Received:", submission);
        // In a real app, this would be stored. Here, we just acknowledge it.
        await delay(800);
        return HttpResponse.json({ success: true, message: "Assessment submitted successfully!" });
    }),
];

