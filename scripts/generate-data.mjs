import { faker } from '@faker-js/faker';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

function randomDateInLast(days) {
    const now = new Date();
    const past = new Date(now);
    past.setDate(now.getDate() - Math.floor(Math.random() * days));
    return past.toISOString();
}

const ROWS = 250;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const data = Array.from({ length: ROWS }, (_, i) => {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const serviceDate = randomDateInLast(120);
    const lastUpdated = randomDateInLast(15);
    const status = faker.helpers.weightedArrayElement([
        { weight: 0.45, value: 'RESUBMITTED' },
        { weight: 0.25, value: 'PENDING' },
        { weight: 0.2,  value: 'REJECTED' },
        { weight: 0.1,  value: 'CALL' }
    ]);

    return {
        id: faker.string.uuid(),
        patientName: `${first} ${last}`,
        patientId: faker.number.int({ min: 1000, max: 9999 }).toString(),
        serviceDate,
        insuranceCarrier: faker.company.name().toUpperCase(),
        amountCents: faker.number.int({ min: 10000, max: 250000 }), // $100–$2,500
        status,
        lastUpdated,
        userInitials: `${first[0]}${last[0]}`.toUpperCase(),
        dateSent: randomDateInLast(60),
        dateSentOrig: randomDateInLast(180),
        pmsSyncStatus: faker.helpers.arrayElement(['Synced','Not synced']),
        provider: `Dr. ${faker.person.firstName()} ${faker.person.lastName()}`
    };
});

if (!existsSync('public')) mkdirSync('public');
writeFileSync('public/claims.json', JSON.stringify(data, null, 2));
console.log(`✅ Generated ${data.length} rows -> public/claims.json`);
