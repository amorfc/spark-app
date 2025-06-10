#!/usr/bin/env node

// Load environment variables from .env file
import dotenv from "dotenv";

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as turf from "@turf/turf";
import { FeatureType, OSMRawFeature, ProcessedFeature } from "@/types/osm";
import { config } from "./config";
dotenv.config();

// Configuration - Now these should work
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY!;
const BATCH_SIZE = 100;

// Debug: Check if env vars are loaded
console.log("🔧 Environment Check:");
console.log("SUPABASE_URL:", SUPABASE_URL ? "✅ Loaded" : "❌ Missing");
console.log("SERVICE_KEY:", SUPABASE_SERVICE_KEY ? "✅ Loaded" : "❌ Missing");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error("❌ Missing required environment variables!");
	console.error(
		"Make sure you have EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_SERVICE_KEY in your .env file",
	);
	process.exit(1);
}

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

interface ProcessingStats {
	total: number;
	processed: number;
	errors: number;
	skipped: number;
	districts: number;
	neighborhoods: number;
	transport_stops: number;
	skipReasons: Record<string, number>;
}

class OSMProcessor {
	private stats: ProcessingStats = {
		total: 0,
		processed: 0,
		errors: 0,
		skipped: 0,
		districts: 0,
		neighborhoods: 0,
		transport_stops: 0,
		skipReasons: {},
	};

	async processFile(filePath: string): Promise<void> {
		console.log(`📖 Reading file: ${filePath}`);

		const rawData = fs.readFileSync(filePath, "utf-8");
		const geoJson = JSON.parse(rawData);

		if (!geoJson.features || !Array.isArray(geoJson.features)) {
			throw new Error("Invalid GeoJSON format: no features array found");
		}

		this.stats.total = geoJson.features.length;
		console.log(`🔍 Found ${this.stats.total} features to process`);

		// Process features in batches
		const batches = this.createBatches(geoJson.features, BATCH_SIZE);

		for (let i = 0; i < batches.length; i++) {
			const batch = batches[i];
			console.log(
				`⚡ Processing batch ${i + 1}/${batches.length} (${batch.length} features)`,
			);

			await this.processBatch(batch as OSMRawFeature[]);

			// Progress update
			const progress = (((i + 1) / batches.length) * 100).toFixed(1);
			console.log(
				`📊 Progress: ${progress}% (${this.stats.processed + this.stats.skipped}/${this.stats.total})`,
			);
		}

		this.printStats();
	}

	private createBatches<T>(array: T[], batchSize: number): T[][] {
		const batches: T[][] = [];
		for (let i = 0; i < array.length; i += batchSize) {
			batches.push(array.slice(i, i + batchSize));
		}
		return batches;
	}

	private async processBatch(features: OSMRawFeature[]): Promise<void> {
		const processedFeatures: ProcessedFeature[] = [];

		for (const feature of features) {
			try {
				const processed = this.processFeature(feature);
				if (processed) {
					processedFeatures.push(processed);
				}
			} catch (error) {
				console.error(`❌ Error processing feature ${feature.id}:`, error);
				this.stats.errors++;
			}
		}

		if (processedFeatures.length > 0) {
			await this.insertFeatures(processedFeatures);
		}
	}

	private processFeature(feature: OSMRawFeature): ProcessedFeature | null {
		const props = feature.properties;

		// Parse OSM ID first
		const refId = this.parseOSMId(feature.id);
		if (!refId) {
			this.addSkipReason(`invalid_id_format: ${feature.id}`);
			console.warn(`⚠️ Skipped - Could not parse OSM ID: ${feature.id}`);
			return null;
		}

		// Determine feature type
		const featureType = this.determineFeatureType(props);
		if (!featureType) {
			this.addSkipReason(`unclassified_feature`);

			// Debug: Show what this feature looks like
			console.warn(`⚠️ Skipped - Unclassified feature ${feature.id}:`);
			console.warn(`   - admin_level: ${props.admin_level}`);
			console.warn(`   - place: ${props.place}`);
			console.warn(`   - highway: ${props.highway}`);
			console.warn(`   - public_transport: ${props.public_transport}`);
			console.warn(`   - railway: ${props.railway}`);
			console.warn(`   - amenity: ${props.amenity}`);
			console.warn(`   - name: ${props.name}`);

			return null;
		}

		// Extract names
		const name = props.name || props["name:tr"] || props["name:en"] || null;
		const name_en = props["name:en"] || null;
		const name_tr = props["name:tr"] || props.name || null;

		// Extract city and country
		const city = this.extractCity(props);
		const country = this.extractCountry(props);

		// Calculate center coordinate
		const centerCoordinate = this.calculateCenterCoordinate(feature.geometry);

		// Build full address
		const fullAddress = this.buildFullAddress(props);

		// Extract admin level
		const adminLevel = props.admin_level ? parseInt(props.admin_level) : null;

		// Update stats
		this.updateStats(featureType);

		return {
			ref_id: refId,
			name,
			name_en,
			name_tr,
			feature_type: featureType,
			full_address: fullAddress,
			city,
			country,
			tags: {
				...props,
				osm_id_original: feature.id,
			},
			geometry: feature.geometry,
			center_coordinate: centerCoordinate,
			admin_level: adminLevel,
			parent_district_id: null,
			parent_neighborhood_id: null,
		};
	}

	private extractCity(props: any): string | null {
		// Try different city fields
		return (
			props.city ||
			props["addr:city"] ||
			props.addr?.city ||
			(props.admin_level === "4" ? props.name : null) || // City level
			"Istanbul"
		); // Default for Istanbul data
	}

	private extractCountry(props: any): string {
		// Try different country fields
		return (
			props.country || props["addr:country"] || props.addr?.country || "Turkey"
		); // Default for Turkish data
	}

	private addSkipReason(reason: string): void {
		this.stats.skipped++;
		this.stats.skipReasons[reason] = (this.stats.skipReasons[reason] || 0) + 1;
	}

	private parseOSMId(id: any): number | null {
		if (typeof id === "number") {
			return id;
		}

		if (typeof id === "string") {
			// Handle "relation/1766094", "way/123", "node/456" formats
			const match = id.match(/^(?:relation|way|node)\/(\d+)$/);
			if (match) {
				return parseInt(match[1], 10);
			}

			// Handle plain numeric strings
			const numericMatch = id.match(/^\d+$/);
			if (numericMatch) {
				return parseInt(id, 10);
			}
		}

		return null;
	}

	private determineFeatureType(props: any): FeatureType | null {
		// Districts (admin_level=6)
		if (props.admin_level === "6" || props.admin_level === 6) {
			return "district";
		}

		// Neighborhoods (admin_level=8)
		if (props.admin_level === "8" || props.admin_level === 8) {
			return "neighborhood";
		}

		// Also check for other admin levels that might be districts/neighborhoods
		if (props.admin_level === "7" || props.admin_level === 7) {
			// Level 7 could be sub-districts, treat as districts
			return "district";
		}

		if (props.admin_level === "9" || props.admin_level === 9) {
			// Level 9 could be sub-neighborhoods, treat as neighborhoods
			return "neighborhood";
		}

		// Check for place types
		if (
			props.place === "suburb" ||
			props.place === "neighbourhood" ||
			props.place === "quarter"
		) {
			return "neighborhood";
		}

		if (props.place === "city_district" || props.place === "district") {
			return "district";
		}

		// Transportation stops
		if (
			props.public_transport === "stop_position" ||
			props.public_transport === "platform" ||
			props.highway === "bus_stop"
		) {
			return "bus_stop";
		}

		if (
			props.railway === "tram_stop" ||
			props.public_transport === "stop_area"
		) {
			return "tram_station";
		}

		if (props.amenity === "ferry_terminal") {
			return "ferry_terminal";
		}

		if (
			props.railway === "station" &&
			(props.subway === "yes" || props.metro === "yes")
		) {
			return "metro_station";
		}

		// Other transport-related features
		if (
			props.public_transport ||
			props.railway ||
			props.amenity?.includes("transport")
		) {
			return "other_transport";
		}

		return null;
	}

	private calculateCenterCoordinate(geometry: any): {
		lat: number;
		lng: number;
	} {
		try {
			const feature = turf.feature(geometry);
			const center = turf.centroid(feature);
			const [lng, lat] = center.geometry.coordinates;
			return { lat, lng };
		} catch {
			console.warn("Could not calculate centroid, using first coordinate");
			const coords = this.extractFirstCoordinate(geometry);
			return { lat: coords[1], lng: coords[0] };
		}
	}

	private extractFirstCoordinate(geometry: any): [number, number] {
		switch (geometry.type) {
			case "Point":
				return geometry.coordinates as [number, number];
			case "LineString":
				return geometry.coordinates[0] as [number, number];
			case "Polygon":
				return geometry.coordinates[0][0] as [number, number];
			case "MultiPolygon":
				return geometry.coordinates[0][0][0] as [number, number];
			default:
				throw new Error(`Unsupported geometry type: ${geometry.type}`);
		}
	}

	private buildFullAddress(props: any): string | null {
		const addressParts: string[] = [];

		if (props.name) {
			addressParts.push(props.name);
		}

		if (props["addr:street"]) addressParts.push(props["addr:street"]);
		if (props["addr:neighbourhood"])
			addressParts.push(props["addr:neighbourhood"]);
		if (props["addr:district"]) addressParts.push(props["addr:district"]);
		if (props["addr:city"]) addressParts.push(props["addr:city"]);

		if (addressParts.length === 0) {
			if (props.place) addressParts.push(props.place);
			if (props.district) addressParts.push(props.district);
			if (props.city) addressParts.push(props.city);
		}

		return addressParts.length > 0 ? addressParts.join(", ") : null;
	}

	private updateStats(featureType: FeatureType): void {
		switch (featureType) {
			case "district":
				this.stats.districts++;
				break;
			case "neighborhood":
				this.stats.neighborhoods++;
				break;
			case "bus_stop":
			case "tram_station":
			case "ferry_terminal":
			case "metro_station":
			case "other_transport":
				this.stats.transport_stops++;
				break;
		}
	}

	async insertFeatures(features: ProcessedFeature[]): Promise<void> {
		// Process one by one to handle errors better
		for (const feature of features) {
			try {
				await this.upsertFeature(feature);
				this.stats.processed++;
			} catch (error) {
				console.error(`❌ Error upserting feature ${feature.ref_id}:`, error);
				this.stats.errors++;
			}
		}
	}

	private async upsertFeature(feature: ProcessedFeature): Promise<void> {
		const { error } = await supabase.rpc("upsert_osm_feature", {
			p_ref_id: feature.ref_id,
			p_name: feature.name,
			p_feature_type: feature.feature_type,
			p_name_en: feature.name_en,
			p_name_tr: feature.name_tr,
			p_full_address: feature.full_address,
			p_city: feature.city,
			p_country: feature.country,
			p_tags: feature.tags,
			p_geometry: `SRID=4326;${this.geometryToWKT(feature.geometry)}`,
			p_center_coordinate: `SRID=4326;POINT(${feature.center_coordinate.lng} ${feature.center_coordinate.lat})`,
			p_admin_level: feature.admin_level,
			p_parent_district_id: feature.parent_district_id,
			p_parent_neighborhood_id: feature.parent_neighborhood_id,
		});

		if (error) {
			throw error;
		}
	}

	private geometryToWKT(geometry: any): string {
		switch (geometry.type) {
			case "Point":
				const [lng, lat] = geometry.coordinates;
				return `POINT(${lng} ${lat})`;

			case "Polygon":
				const rings = geometry.coordinates
					.map(
						(ring: number[][]) =>
							"(" +
							ring
								.map((coord: number[]) => `${coord[0]} ${coord[1]}`)
								.join(", ") +
							")",
					)
					.join(", ");
				return `POLYGON(${rings})`;

			case "MultiPolygon":
				const polygons = geometry.coordinates
					.map((polygon: number[][][]) => {
						const rings = polygon
							.map(
								(ring: number[][]) =>
									"(" +
									ring
										.map((coord: number[]) => `${coord[0]} ${coord[1]}`)
										.join(", ") +
									")",
							)
							.join(", ");
						return `(${rings})`;
					})
					.join(", ");
				return `MULTIPOLYGON(${polygons})`;

			default:
				throw new Error(
					`Unsupported geometry type for WKT conversion: ${geometry.type}`,
				);
		}
	}

	private printStats(): void {
		console.log("\n📈 Processing Summary:");
		console.log(`Total features: ${this.stats.total}`);
		console.log(`Successfully processed: ${this.stats.processed}`);
		console.log(`Skipped: ${this.stats.skipped}`);
		console.log(`Errors: ${this.stats.errors}`);
		console.log(`Districts: ${this.stats.districts}`);
		console.log(`Neighborhoods: ${this.stats.neighborhoods}`);
		console.log(`Transport stops: ${this.stats.transport_stops}`);
		console.log(
			`Success rate: ${((this.stats.processed / this.stats.total) * 100).toFixed(1)}%`,
		);

		// Show skip reasons
		if (Object.keys(this.stats.skipReasons).length > 0) {
			console.log("\n⚠️ Skip Reasons:");
			Object.entries(this.stats.skipReasons).forEach(([reason, count]) => {
				console.log(`   ${reason}: ${count}`);
			});
		}
	}
}

// Main execution
async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: yarn process-osm <path-to-geojson-file>");
		process.exit(1);
	}

	const filePath = args[0];

	if (!fs.existsSync(filePath)) {
		console.error(`File not found: ${filePath}`);
		process.exit(1);
	}

	const processor = new OSMProcessor();

	try {
		console.log("🚀 Starting OSM data processing...");
		await processor.processFile(filePath);
		console.log("✅ Processing completed successfully!");
	} catch (error) {
		console.error("💥 Processing failed:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}

export { OSMProcessor };
