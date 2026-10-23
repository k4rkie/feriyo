import { db } from "./db.js";
import {
  usersTable,
  listingsTable,
  categoryEnum,
  conditionEnum,
} from "./schema.js";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🚀 Starting Feriyo Seed...");

  // 1. Setup Admin User
  const password = "password123";
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const [adminUser] = await db
    .insert(usersTable)
    .values({
      userId: crypto.randomUUID(),
      username: "admin_dev",
      email: "admin@feriyo.com",
      passwordHash: passwordHash,
      isVerified: true,
    })
    .onConflictDoNothing()
    .returning();

  // Handle case where user already exists
  const authorId =
    adminUser?.userId ||
    (await db.select().from(usersTable).limit(1))[0].userId;

  console.log(`👤 Admin ready: admin@feriyo.com | Pass: ${password}`);

  // 2. Prepare Data Constants
  const count = 300;
  const dummyImagePath = "https://placehold.co/600x400?text=Feriyo";

  // Extract values from Drizzle Enums
  const categories = categoryEnum.enumValues;
  const conditions = conditionEnum.enumValues;

  const listingsToInsert = [];

  console.log(`🎲 Generating ${count} randomized listings...`);

  for (let i = 0; i < count; i++) {
    // Pick random items from the enums
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const randomCondition =
      conditions[Math.floor(Math.random() * conditions.length)];

    listingsToInsert.push({
      listingId: crypto.randomUUID(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription().substring(0, 1000),
      price: Math.floor(Math.random() * 50000) + 500,
      category: randomCategory, // Automatically typed by Drizzle Enum
      condition: randomCondition,
      locationName: "Kathmandu",
      status: "available" as const,
      imageUrls: [dummyImagePath],
      authorId: authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // 3. Batch Insert
  console.log(`📦 Inserting into Postgres...`);
  await db.insert(listingsTable).values(listingsToInsert);

  console.log("✅ Seeding finished! Category sorting is now testable.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
