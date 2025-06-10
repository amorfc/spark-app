import dotenv from "dotenv";
dotenv.config();

export const config = {
	supabaseUrl:
		process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
	supabaseServiceKey:
		process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY ||
		process.env.SUPABASE_SERVICE_KEY ||
		"",
	batchSize: 100,
};

// Validate configuration
if (!config.supabaseUrl) {
	throw new Error("Missing SUPABASE_URL environment variable");
}

if (!config.supabaseServiceKey) {
	throw new Error("Missing SUPABASE_SERVICE_KEY environment variable");
}

console.log("✅ Configuration loaded successfully");
