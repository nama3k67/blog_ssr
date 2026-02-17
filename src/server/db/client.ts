import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Conditional database client initialization
 * - Local development: Uses 'pg' driver (TCP connection)
 * - Production/Serverless: Uses '@neondatabase/serverless' (HTTP connection)
 */
let db: NodePgDatabase<typeof schema> | NeonHttpDatabase<typeof schema>;

// Use pg driver for local development or traditional PostgreSQL
if (env.USE_LOCAL_DB || env.NODE_ENV === "development") {
	const { drizzle: drizzlePostgres } = await import(
		"drizzle-orm/node-postgres"
	);
	const { Pool } = await import("pg");

	const pool = new Pool({
		connectionString: env.DATABASE_URL,
	});

	db = drizzlePostgres(pool, { schema });
} else {
	// Use Neon HTTP client for serverless environments
	const { drizzle: drizzleNeon } = await import("drizzle-orm/neon-http");
	const { neon } = await import("@neondatabase/serverless");

	const sql = neon(env.DATABASE_URL);
	db = drizzleNeon(sql, { schema });
}

export { db };

export type Database = typeof db;
