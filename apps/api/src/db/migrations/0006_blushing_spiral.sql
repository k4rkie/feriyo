CREATE INDEX "chats_listing_id_idx" ON "chats" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "offers_status_expire_at_idx" ON "offers" USING btree ("status","expire_at");