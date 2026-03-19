import { sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";

const usersTable = pgTable("users", {
  userId: integer("user_id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),

  isVerified: boolean("is_verified").default(false).notNull(),

  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoryEnum = pgEnum("category", [
  "electronics",
  "education",
  "fashion",
  "furniture",
  "vehicle",
  "others",
]);

export const conditionEnum = pgEnum("condition", [
  "new",
  "good",
  "fair",
  "old",
]);

const listingsTable = pgTable(
  "listings",
  {
    listingId: integer("listing_id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 100 }).notNull(),
    description: text("description"),
    price: integer("price").notNull(),
    category: categoryEnum().notNull(),
    condition: conditionEnum().notNull(),
    location: varchar("location").notNull(),
    isSold: boolean("is_sold").default(false).notNull(),
    imageUrls: text("image_urls")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    authorId: integer("author_id")
      .notNull()
      .references(() => usersTable.userId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [check("price_check", sql`${table.price} > 0`)],
);

export { usersTable, listingsTable };
