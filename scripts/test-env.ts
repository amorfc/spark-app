import dotenv from "dotenv";
dotenv.config();

console.log("🔧 Environment Variables Test:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
	"EXPO_PUBLIC_SUPABASE_URL:",
	process.env.EXPO_PUBLIC_SUPABASE_URL ? "SET ✅" : "MISSING ❌",
);
console.log(
	"EXPO_PUBLIC_SUPABASE_SERVICE_KEY:",
	process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY ? "SET ✅" : "MISSING ❌",
);

if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
	console.log(
		"URL Preview:",
		process.env.EXPO_PUBLIC_SUPABASE_URL.substring(0, 30) + "...",
	);
}

if (process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY) {
	console.log(
		"Key Preview:",
		process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY.substring(0, 20) + "...",
	);
}
