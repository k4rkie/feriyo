ALTER TYPE "public"."offer_status" ADD VALUE 'expired';--> statement-breakpoint
CREATE INDEX "chats_buyer_id_idx" ON "chats" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "chats_seller_id_idx" ON "chats" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "listings_author_id_idx" ON "listings" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "listings_status_created_at_idx" ON "listings" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "listings_category_status_idx" ON "listings" USING btree ("category","status");--> statement-breakpoint
CREATE INDEX "messages_chat_id_created_at_idx" ON "messages" USING btree ("chat_id","created_at");--> statement-breakpoint
CREATE INDEX "offers_chat_id_status_idx" ON "offers" USING btree ("chat_id","status");--> statement-breakpoint
CREATE INDEX "saved_listings_user_id_idx" ON "saved_listings" USING btree ("user_id");