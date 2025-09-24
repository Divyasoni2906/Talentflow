import Dexie from 'dexie';
import { faker } from '@faker-js/faker';

export const db = new Dexie('TalentFlowDB');

// --- Schema Definition ---
db.version(1).stores({
    jobs: '++id, title, status, order, *tags',
    candidates: '++id, name, email, jobId, stage',
    assessments: 'jobId' // Primary key is jobId
});

// --- Stage Constants ---
export const STAGE_ORDER = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
export const STAGE_LABELS = {
    applied: 'Applied',
    screen: 'Screen',
    tech: 'Tech Interview',
    offer: 'Offer',
    hired: 'Hired',
    rejected: 'Rejected',
};

// --- Database Seeding Function ---
// This function creates the initial fake data for the application.
export const seedDatabase = async () => {
    try {
        const jobCount = await db.jobs.count();
        if (jobCount > 0) {
            console.log("Database already contains data. Skipping seed.");
            return;
        }

        console.log("Seeding database with initial data...");

        // 1. Create Jobs
        const jobsToSeed = Array(25).fill(0).map((_, index) => ({
            id: faker.string.uuid(),
            title: faker.person.jobTitle(),
            slug: faker.helpers.slugify(faker.person.jobTitle()).toLowerCase() + `-${index}`,
            status: faker.helpers.arrayElement(['active', 'archived']),
            tags: faker.helpers.arrayElements(['Full-Time', 'Remote', 'Contract', 'Engineering', 'Design'], { min: 1, max: 3 }),
            order: index,
        }));
        await db.jobs.bulkAdd(jobsToSeed);

        // 2. Create Candidates
        const candidatesToSeed = Array(1000).fill(0).map(() => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email().toLowerCase(),
            jobId: faker.helpers.arrayElement(jobsToSeed).id,
            stage: faker.helpers.arrayElement(STAGE_ORDER),
        }));
        await db.candidates.bulkAdd(candidatesToSeed);

        // 3. Create Assessments
        const assessmentsToSeed = jobsToSeed.slice(0, 5).map(job => ({
            jobId: job.id,
            structure: {
                title: `${job.title} Assessment`,
                sections: [
                    {
                        id: `s-${faker.string.uuid()}`,
                        title: 'Initial Screening',
                        questions: [
                            { id: `q-${faker.string.uuid()}`, type: 'short-text', label: 'What is your expected salary?', required: true },
                            { id: `q-${faker.string.uuid()}`, type: 'long-text', label: 'Why are you interested in this role?', required: true },
                        ]
                    }
                ]
            }
        }));
        await db.assessments.bulkAdd(assessmentsToSeed);

        console.log("Database seeding complete.");

    } catch (error) {
        console.error("Error seeding database:", error);
    }
};

