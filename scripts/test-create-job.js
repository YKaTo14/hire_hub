const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  // create or find employer user
  const email = 'ci-employer+test@hirehub.local';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'CI Employer',
        role: 'EMPLOYER'
      }
    });
    console.log('Created user', user.id);
  } else {
    console.log('Found user', user.id);
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'hirehub-secure-secret-key-2024');

  // Post a test job with custom category
  const jobPayload = {
    title: 'CI Test Job - OTHER category',
    description: 'This is a test job created by CI script. Ignore.',
    salary: 1000000,
    location: 'Ulaanbaatar',
    type: 'FULL_TIME',
    category: 'OTHER',
    customCategory: 'Анагаах салбар (custom)'
  };

  const res = await fetch('http://localhost:3001/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(jobPayload)
  });

  const data = await res.json();
  console.log('Status', res.status);
  console.log('Response', data);

  // verify in DB
  if (res.ok && data?.job?.id) {
    const created = await prisma.job.findUnique({ where: { id: data.job.id } });
    console.log('Saved in DB:', created ? { id: created.id, category: created.category, customCategory: created.customCategory } : 'not found');
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
