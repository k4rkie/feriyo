ALTER TABLE "offers" RENAME COLUMN "purposed_by" TO "proposed_by";--> statement-breakpoint
ALTER TABLE "offers" DROP CONSTRAINT "offers_purposed_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_proposed_by_users_user_id_fk" FOREIGN KEY ("proposed_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;