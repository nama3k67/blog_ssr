import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Conditional database client initialization
 * - Local development: Uses 'pg' driver (TCP connection, supports transactions)
 * - Production/Serverless: Uses '@neondatabase/serverless' HTTP client (stateless, no persistent connections)
 *
 * For transactions in CF Workers, use `withTransaction()` instead of `db.transaction()`.
 * It creates a short-lived WebSocket Client per call and ends it immediately after,
 * avoiding the hung-worker issue caused by persistent pool connections.
 */
let db: NodePgDatabase<typeof schema> | NeonHttpDatabase<typeof schema>;

if (env.USE_LOCAL_DB) {
	const { drizzle: drizzlePostgres } = await import(
		"drizzle-orm/node-postgres"
	);
	const { Pool } = await import("pg");
	db = drizzlePostgres(new Pool({ connectionString: env.DATABASE_URL }), {
		schema,
	});
} else {
	const { drizzle: drizzleNeon } = await import("drizzle-orm/neon-http");
	const { neon } = await import("@neondatabase/serverless");
	db = drizzleNeon(neon(env.DATABASE_URL), { schema });
}

export { db };

/**
 * Run `fn` inside a database transaction.
 *
 * - Local dev: delegates to `db.transaction()` on the shared pg pool.
 * - CF Workers: creates a fresh single-use WebSocket Client, runs the
 *   transaction, then immediately calls `client.end()` so the connection
 *   is fully closed before the Worker response is sent.  Using a Pool here
 *   would leave an idle WebSocket open and cause subsequent requests to hang.
 */
export async function withTransaction<T>(
	fn: (
		tx: Parameters<
			Parameters<NodePgDatabase<typeof schema>["transaction"]>[0]
		>[0],
	) => Promise<T>,
): Promise<T> {
	if (env.USE_LOCAL_DB) {
		return (db as NodePgDatabase<typeof schema>).transaction(fn as never);
	}

	const { drizzle: drizzleNeon } = await import("drizzle-orm/neon-serverless");
	const { neonConfig, Client } = await import("@neondatabase/serverless");

	neonConfig.webSocketConstructor = WebSocket;
	const client = new Client({ connectionString: env.DATABASE_URL });
	await client.connect();

	const txDb = drizzleNeon(client, { schema }) as NeonDatabase<typeof schema>;
	try {
		return await txDb.transaction(fn as never);
	} finally {
		await client.end();
	}
}

export type Database = typeof db;
