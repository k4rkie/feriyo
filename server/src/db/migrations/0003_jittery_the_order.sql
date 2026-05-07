CREATE TYPE "public"."offer_status" AS ENUM('pending', 'accepted', 'rejected', 'cancelled');--> statement-breakpoint
ALTER TABLE "offers" DROP CONSTRAINT "offers_listing_id_listings_listing_id_fk";
--> statement-breakpoint
DROP INDEX "unique_pending_offer_idx";--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "status" SET DATA TYPE "public"."offer_status" USING "status"::text::"public"."offer_status";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_pending_offer_idx" ON "offers" USING btree ("chat_id") WHERE "offers"."status" = 'pending';--> statement-breakpoint
ALTER TABLE "offers" DROP COLUMN "listing_id";