const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const base = "http://localhost:3001";

async function req(path, opts = {}) {
  const res = await fetch(base + path, opts);
  let data = {};
  try {
    data = await res.json();
  } catch (_e) {}
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  const stamp = Date.now();
  const employerEmail = `emp_${stamp}@test.com`;
  const seekerEmail = `seek_${stamp}@test.com`;
  const password = "password123";
  const hashed = await bcrypt.hash(password, 10);
  const secret = process.env.JWT_SECRET || "hirehub-secure-secret-key-2024";

  const employer = await prisma.user.create({
    data: { email: employerEmail, name: "Employer QA", password: hashed, role: "EMPLOYER" }
  });
  const seeker = await prisma.user.create({
    data: { email: seekerEmail, name: "Seeker QA", password: hashed, role: "USER" }
  });

  const employerToken = jwt.sign({ id: employer.id, role: employer.role, email: employer.email }, secret, { expiresIn: "7d" });
  const seekerToken = jwt.sign({ id: seeker.id, role: seeker.role, email: seeker.email }, secret, { expiresIn: "7d" });

  const employerHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${employerToken}` };
  const seekerHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${seekerToken}` };

  const jobRes = await req("/api/jobs", {
    method: "POST",
    headers: employerHeaders,
    body: JSON.stringify({
      title: `Message QA ${stamp}`,
      description: "Application message test",
      salary: 5000,
      location: "UB",
      type: "FULL_TIME"
    })
  });

  const appRes = await req("/api/applications", {
    method: "POST",
    headers: seekerHeaders,
    body: JSON.stringify({ jobId: jobRes.data.job.id, coverLetter: "Please review" })
  });

  const employerMsg = await req("/api/messages", {
    method: "POST",
    headers: employerHeaders,
    body: JSON.stringify({ content: "Interview hiih uu?", applicationId: appRes.data.application.id })
  });

  const seekerMsg = await req("/api/messages", {
    method: "POST",
    headers: seekerHeaders,
    body: JSON.stringify({ content: "Tiim, bolno", applicationId: appRes.data.application.id })
  });

  console.log(JSON.stringify({
    createJob: jobRes.status,
    createApplication: appRes.status,
    employerMessageByApplication: employerMsg.status,
    seekerReplyByApplication: seekerMsg.status
  }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
