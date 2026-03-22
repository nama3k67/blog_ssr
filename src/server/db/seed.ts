import { db } from "./client";
import { categories, tags } from "./schema";

async function seed() {
	console.log("🌱 Seeding database...");

	// Clear existing data (optional - comment out if you want to keep existing data)
	// await db.delete(tags);
	// await db.delete(categories);

	// Seed categories
	const categoriesData = [
		{
			name: "Running & Training",
			slug: "running-training",
			description:
				"Articles about running techniques, training plans, and performance improvement",
		},
		{
			name: "Nutrition",
			slug: "nutrition",
			description: "Nutrition guides for endurance athletes and runners",
		},
		{
			name: "Technology",
			slug: "technology",
			description: "Tech reviews, tutorials, and development insights",
		},
		{
			name: "Lifestyle",
			slug: "lifestyle",
			description: "Health, wellness, and lifestyle tips for athletes",
		},
	];

	for (const cat of categoriesData) {
		await db
			.insert(categories)
			.values(cat)
			.onConflictDoNothing({ target: categories.slug });
	}

	console.log("✅ Categories seeded");

	// Seed tags
	const tagsData = [
		{
			name: "marathon",
			slug: "marathon",
			description: "Marathon running and training",
		},
		{
			name: "half-marathon",
			slug: "half-marathon",
			description: "Half marathon content",
		},
		{ name: "5K", slug: "5k", description: "5K race content" },
		{
			name: "speed-work",
			slug: "speed-work",
			description: "Speed training techniques",
		},
		{
			name: "recovery",
			slug: "recovery",
			description: "Recovery and rest tips",
		},
		{
			name: "protein",
			slug: "protein",
			description: "Protein and supplementation",
		},
		{
			name: "hydration",
			slug: "hydration",
			description: "Hydration strategies",
		},
		{
			name: "carb-loading",
			slug: "carb-loading",
			description: "Carbohydrate strategies",
		},
		{
			name: "web-development",
			slug: "web-development",
			description: "Web dev tutorials",
		},
		{
			name: "typescript",
			slug: "typescript",
			description: "TypeScript content",
		},
		{
			name: "react",
			slug: "react",
			description: "React and frontend frameworks",
		},
		{
			name: "databases",
			slug: "databases",
			description: "Database design and optimization",
		},
		{
			name: "injury-prevention",
			slug: "injury-prevention",
			description: "Avoiding injuries",
		},
		{
			name: "gear-reviews",
			slug: "gear-reviews",
			description: "Running shoes and gear",
		},
		{
			name: "mental-health",
			slug: "mental-health",
			description: "Mental wellness for athletes",
		},
	];

	for (const tag of tagsData) {
		await db
			.insert(tags)
			.values(tag)
			.onConflictDoNothing({ target: tags.slug });
	}

	console.log("✅ Tags seeded");
	console.log("🎉 Database seeded successfully!");
}

seed()
	.catch((err) => {
		console.error("❌ Seed failed:", err);
		process.exit(1);
	})
	.then(() => {
		process.exit(0);
	});
