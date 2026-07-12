import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log("1. Checking Database Connection...");
  const users = await prisma.employee.count();
  console.log(`✅ Database is online. Found ${users} users in DB.`);

  console.log("\n2. Testing Backend Authentication...");
  const loginRes = await fetch("http://localhost:3001/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "john@seed.com", password: "Odoo@123" })
  });
  
  if (!loginRes.ok) {
    throw new Error("❌ Login failed: " + await loginRes.text());
  }
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log("✅ Login successful! Token acquired.");

  console.log("\\n3. Testing Zero-Touch AI Request (Connecting Backend -> AI Model)...");
  console.log("This will also verify if the AI model is ready.");
  const requestRes = await fetch("http://localhost:3001/maintenance/zero-touch", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ issueDescription: "My laptop battery is draining very fast and feels swollen." })
  });

  if (!requestRes.ok) {
      throw new Error("❌ Zero-touch request failed: " + await requestRes.text());
  }

  const result = await requestRes.json();
  console.log("✅ Success! The entire pipeline worked!");
  console.log("AI Result Stored in DB:");
  console.log(JSON.stringify(result, null, 2));
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
