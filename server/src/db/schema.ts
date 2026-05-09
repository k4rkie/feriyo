import { relations, sql } from "drizzle-orm";
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
  uuid,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const usersTable = pgTable("users", {
  userId: uuid("user_id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),

  isVerified: boolean("is_verified").default(false).notNull(),

  locationName: varchar("location_name"),

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

export const statusEnum = pgEnum("status", ["available", "pending", "sold"]);

const listingsTable = pgTable(
  "listings",
  {
    listingId: uuid("listing_id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 100 }).notNull(),
    description: text("description"),
    price: integer("price").notNull(),
    category: categoryEnum().notNull(),
    condition: conditionEnum().notNull(),
    locationName: varchar("location_name").notNull(),

    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),

    status: statusEnum().notNull().default("available"),

    imageUrls: text("image_urls")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    authorId: uuid("author_id")
      .notNull()
      .references(() => usersTable.userId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [check("price_check", sql`${table.price} > 0`)],
);

export const listingsRelations = relations(listingsTable, ({ one, many }) => ({
  author: one(usersTable, {
    fields: [listingsTable.authorId],
    references: [usersTable.userId],
  }),
  chats: many(chatsTable),
  savedBy: many(savedListingsTable),
}));

const chatsTable = pgTable(
  "chats",
  {
    chatId: uuid("chat_id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .references(() => listingsTable.listingId, {
        onDelete: "cascade",
      })
      .notNull(),
    buyerId: uuid("buyer_id")
      .references(() => usersTable.userId)
      .notNull(),
    sellerId: uuid("seller_id")
      .references(() => usersTable.userId)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    unqConvoConstraint: unique("unique_conv_idx").on(
      table.listingId,
      table.buyerId,
      table.sellerId,
    ),
  }),
);

const messagesTable = pgTable("messages", {
  messageId: uuid("message_id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .references(() => chatsTable.chatId, {
      onDelete: "cascade",
    })
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => usersTable.userId)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const offerStatusEnum = pgEnum("offer_status", [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
]);

const offersTable = pgTable(
  "offers",
  {
    offerId: uuid("offer_id").primaryKey().defaultRandom(),
    proposedBy: uuid("proposed_by")
      .references(() => usersTable.userId, {
        onDelete: "cascade",
      })
      .notNull(),
    chatId: uuid("chat_id")
      .references(() => chatsTable.chatId, {
        onDelete: "cascade",
      })
      .notNull(),
    status: offerStatusEnum("status").notNull(),
    price: integer("price").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    expireAt: timestamp("expire_at").notNull(),
  },
  (table) => [
    check("price_check", sql`${table.price} > 0`),
    uniqueIndex("unique_pending_offer_idx")
      .on(table.chatId)
      .where(sql`${table.status} = 'pending'`),
  ],
);

export const chatsRelations = relations(chatsTable, ({ one, many }) => ({
  listing: one(listingsTable, {
    fields: [chatsTable.listingId],
    references: [listingsTable.listingId],
  }),
  buyer: one(usersTable, {
    fields: [chatsTable.buyerId],
    references: [usersTable.userId],
  }),
  seller: one(usersTable, {
    fields: [chatsTable.sellerId],
    references: [usersTable.userId],
  }),
  messages: many(messagesTable),
  offers: many(offersTable),
}));

export const offersRelations = relations(offersTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [offersTable.chatId],
    references: [chatsTable.chatId],
  }),
  proposedByUser: one(usersTable, {
    fields: [offersTable.proposedBy],
    references: [usersTable.userId],
  }),
}));

const savedListingsTable = pgTable(
  "saved_listings",
  {
    saveId: uuid("save_id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => usersTable.userId, { onDelete: "cascade" })
      .notNull(),
    listingId: uuid("listing_id")
      .references(() => listingsTable.listingId, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    unqSaveConstraint: unique("unique_save_idx").on(table.userId, table.listingId),
  }),
);

export const savedListingsRelations = relations(savedListingsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [savedListingsTable.userId],
    references: [usersTable.userId],
  }),
  listing: one(listingsTable, {
    fields: [savedListingsTable.listingId],
    references: [listingsTable.listingId],
  }),
}));

export {
  usersTable,
  listingsTable,
  chatsTable,
  messagesTable,
  offersTable,
  savedListingsTable,
};
