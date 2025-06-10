import { OSMProcessor } from "./process-osm-data";

async function dailySync() {
	console.log("🔄 Starting daily OSM sync...");

	const processor = new OSMProcessor();

	// Process updated data files
	const dataFiles = [
		"osm/districts-istanbul.geojson",
		"osm/neighborhoods-istanbul.geojson",
		"osm/transport-stops-istanbul.geojson",
	];

	for (const file of dataFiles) {
		await processor.processFile(file);
	}

	console.log("✅ Daily sync completed");
}

if (require.main === module) {
	dailySync().catch(console.error);
}
