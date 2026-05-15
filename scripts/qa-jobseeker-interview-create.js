const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const base = "http://localhost:3001";

async function req(path, opts = {}) {
  const response = await fetch(base + path, opts);
  let data = {};
  try {
    data = await response.json();
  } catch (_error) {
    data = {};
  }
  return { status: response.status, ok: response.ok, data };
}

async function main() {
  const stamp = Date.now();
  const companyEmail = `company_${stamp}@test.com`;
  const seekerEmail = `seeker_${stamp}@test.com`;
  const password = "password123";
  const hashed = await bcrypt.hash(password, 10);

  const companyUser = await prisma.user.create({
    data: { email: companyEmail, name: "Company", password: hashed, role: "EMPLOYER" },
  });
  const seekerUser = await prisma.user.create({
    data: { email: seekerEmail, name: "Seeker", password: hashed, role: "USER" },
  });

  const secret = process.env.JWT_SECRET || "hirehub-secure-secret-key-2024";
  const companyToken = jwt.sign({ id: companyUser.id, role: companyUser.role, email: companyUser.email }, secret, {
    expiresIn: "7d",
  });
  const seekerToken = jwt.sign({ id: seekerUser.id, role: seekerUser.role, email: seekerUser.email }, secret, {
    expiresIn: "7d",
  });

  const companyHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${companyToken}` };
  const seekerHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${seekerToken}` };

  const jobRes = await req("/api/jobs", {
    method: "POST",
    headers: companyHeaders,
    body: JSON.stringify({
      title: `Seeker interview test ${stamp}`,
      description: "Validation flow",
      salary: 3000,
      location: "UB",
      type: "FULL_TIME",
    }),
  });

  const appRes = await req("/api/applications", {
    method: "POST",
    headers: seekerHeaders,
    body: JSON.stringify({ jobId: jobRes.data.job.id, coverLetter: "test apply" }),
  });

  const interviewRes = await req("/api/interviews", {
    method: "POST",
    headers: seekerHeaders,
    body: JSON.stringify({
      applicationId: appRes.data.application.id,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      mode: "ONLINE",
      meetingLink: "https://meet.google.com/seeker-create",
    }),
  });

  console.log(
    JSON.stringify(
      {
        createJob: jobRes.status,
        createApplication: appRes.status,
        seekerCreateInterview: interviewRes.status,
        ok: interviewRes.ok,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
