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
  const report = [];

  const hashed = await bcrypt.hash(password, 10);
  const companyUser = await prisma.user.create({
    data: {
      email: companyEmail,
      name: "QA Company",
      password: hashed,
      role: "EMPLOYER",
    },
  });
  report.push(["create company user (DB)", 201, true]);

  const seekerUser = await prisma.user.create({
    data: {
      email: seekerEmail,
      name: "QA Seeker",
      password: hashed,
      role: "USER",
    },
  });
  report.push(["create seeker user (DB)", 201, true]);

  const secret = process.env.JWT_SECRET || "hirehub-secure-secret-key-2024";
  const companyToken = jwt.sign(
    { id: companyUser.id, role: companyUser.role, email: companyUser.email },
    secret,
    { expiresIn: "7d" }
  );
  const seekerToken = jwt.sign(
    { id: seekerUser.id, role: seekerUser.role, email: seekerUser.email },
    secret,
    { expiresIn: "7d" }
  );
  report.push(["issue JWT for company and seeker", 200, true]);

  const cHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${companyToken}`,
  };
  const sHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${seekerToken}`,
  };

  const createJob = await req("/api/jobs", {
    method: "POST",
    headers: cHeaders,
    body: JSON.stringify({
      title: `Interview QA Job ${stamp}`,
      description: "Flow validation job posting for interviews",
      salary: 2500,
      location: "Ulaanbaatar",
      type: "FULL_TIME",
    }),
  });
  report.push(["company create job", createJob.status, createJob.ok]);
  const jobId = createJob.data?.job?.id;

  const apply = await req("/api/applications", {
    method: "POST",
    headers: sHeaders,
    body: JSON.stringify({ jobId, coverLetter: "Please consider me" }),
  });
  report.push(["seeker apply job", apply.status, apply.ok]);
  const appId = apply.data?.application?.id;

  const createInterview = await req("/api/interviews", {
    method: "POST",
    headers: cHeaders,
    body: JSON.stringify({
      applicationId: appId,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      mode: "ONLINE",
      meetingLink: "https://meet.google.com/qa-flow",
    }),
  });
  report.push(["company create interview", createInterview.status, createInterview.ok]);
  const interviewId = createInterview.data?.interview?.id;

  const updateInterview = await req(`/api/interviews/${interviewId}`, {
    method: "PUT",
    headers: cHeaders,
    body: JSON.stringify({ status: "RESCHEDULED", durationMinute: 45 }),
  });
  report.push(["company update interview", updateInterview.status, updateInterview.ok]);

  const deleteInterview = await req(`/api/interviews/${interviewId}`, {
    method: "DELETE",
    headers: cHeaders,
  });
  report.push(["company delete interview", deleteInterview.status, deleteInterview.ok]);

  const seekerForbidden = await req("/api/interviews", {
    method: "POST",
    headers: sHeaders,
    body: JSON.stringify({
      applicationId: appId,
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      mode: "ONLINE",
      meetingLink: "https://meet.google.com/forbidden",
    }),
  });
  report.push([
    "seeker cannot create interview",
    seekerForbidden.status,
    seekerForbidden.status === 403,
  ]);

  console.log(
    JSON.stringify(
      {
        companyEmail,
        seekerEmail,
        companyUserId: companyUser.id,
        seekerUserId: seekerUser.id,
        jobId,
        appId,
        interviewId,
        report,
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
