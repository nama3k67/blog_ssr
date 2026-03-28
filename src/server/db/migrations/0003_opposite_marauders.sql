ALTER TABLE "posts" DROP CONSTRAINT "posts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;