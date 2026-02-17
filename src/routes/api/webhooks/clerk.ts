import { verifyWebhook } from "@clerk/tanstack-react-start/webhooks";
import { createFileRoute } from "@tanstack/react-router";
import {
	createUser,
	deleteUser,
	getUserByClerkId,
	updateUser,
} from "~/server/db/queries";

export const Route = createFileRoute("/api/webhooks/clerk")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const evt = await verifyWebhook(request);

					const { id } = evt.data;
					const eventType = evt.type;
					console.log(
						`[Webhook] Received webhook with ID ${id} and event type of ${eventType}`,
					);

					// Handle webhook events
					if (evt.type === "user.created") {
						const {
							id: clerkId,
							email_addresses,
							first_name,
							last_name,
							image_url,
						} = evt.data;

						if (!clerkId) {
							return new Response("Missing clerkId", { status: 400 });
						}

						const primaryEmail = email_addresses.find(
							(e) => e.id === evt.data.primary_email_address_id,
						);

						if (primaryEmail) {
							await createUser({
								clerkId,
								email: primaryEmail.email_address,
								firstName: first_name || null,
								lastName: last_name || null,
								imageUrl: image_url || null,
							});
							console.log(`[Webhook] Created user: ${clerkId}`);
						}
					}

					if (evt.type === "user.updated") {
						const {
							id: clerkId,
							email_addresses,
							first_name,
							last_name,
							image_url,
						} = evt.data;

						if (!clerkId) {
							return new Response("Missing clerkId", { status: 400 });
						}

						const primaryEmail = email_addresses.find(
							(e) => e.id === evt.data.primary_email_address_id,
						);
						const existingUser = await getUserByClerkId(clerkId);

						if (existingUser && primaryEmail) {
							await updateUser(existingUser.id, {
								email: primaryEmail.email_address,
								firstName: first_name || null,
								lastName: last_name || null,
								imageUrl: image_url || null,
							});
							console.log(`[Webhook] Updated user: ${clerkId}`);
						}
					}

					if (evt.type === "user.deleted") {
						const { id: clerkId } = evt.data;

						if (!clerkId) {
							return new Response("Missing clerkId", { status: 400 });
						}

						const existingUser = await getUserByClerkId(clerkId);

						if (existingUser) {
							await deleteUser(existingUser.id);
							console.log(`[Webhook] Deleted user: ${clerkId}`);
						}
					}

					return new Response("Webhook received", { status: 200 });
				} catch (err) {
					console.error("[Webhook] Error verifying webhook:", err);
					return new Response("Error verifying webhook", { status: 400 });
				}
			},
		},
	},
});
