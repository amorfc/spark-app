import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";

export interface UserLocation {
	latitude: number;
	longitude: number;
	accuracy?: number;
	timestamp: number;
}

export interface UseUserLocationReturn {
	location: UserLocation | null;
	isLoading: boolean;
	error: string | null;
	hasPermission: boolean;
	requestPermission: () => Promise<boolean>;
	getCurrentLocation: () => Promise<UserLocation | null>;
	startWatching: () => void;
	stopWatching: () => void;
	isWatching: boolean;
}

export const useUserLocation = (): UseUserLocationReturn => {
	const [location, setLocation] = useState<UserLocation | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasPermission, setHasPermission] = useState(false);
	const [isWatching, setIsWatching] = useState(false);
	const [locationSubscription, setLocationSubscription] =
		useState<Location.LocationSubscription | null>(null);

	// Check initial permissions
	useEffect(() => {
		checkPermissions();
	}, []);

	const checkPermissions = async () => {
		try {
			const { status } = await Location.getForegroundPermissionsAsync();
			setHasPermission(status === "granted");
		} catch (err) {
			setError("Failed to check location permissions");
			console.error("Permission check error:", err);
		}
	};

	const requestPermission = useCallback(async (): Promise<boolean> => {
		try {
			setError(null);
			const { status } = await Location.requestForegroundPermissionsAsync();
			const granted = status === "granted";
			setHasPermission(granted);

			if (!granted) {
				setError("Location permission denied");
			}

			return granted;
		} catch (err) {
			setError("Failed to request location permission");
			console.error("Permission request error:", err);
			return false;
		}
	}, []);

	const getCurrentLocation =
		useCallback(async (): Promise<UserLocation | null> => {
			if (!hasPermission) {
				const granted = await requestPermission();
				if (!granted) return null;
			}

			try {
				setIsLoading(true);
				setError(null);

				const result = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
					timeInterval: 5000,
					distanceInterval: 10,
				});

				const userLocation: UserLocation = {
					latitude: result.coords.latitude,
					longitude: result.coords.longitude,
					accuracy: result.coords.accuracy || undefined,
					timestamp: result.timestamp,
				};

				setLocation(userLocation);
				return userLocation;
			} catch (err) {
				setError("Failed to get current location");
				console.error("Location error:", err);
				return null;
			} finally {
				setIsLoading(false);
			}
		}, [hasPermission, requestPermission]);

	const startWatching = useCallback(async () => {
		if (!hasPermission) {
			const granted = await requestPermission();
			if (!granted) return;
		}

		if (isWatching || locationSubscription) {
			return;
		}

		try {
			setError(null);
			setIsWatching(true);

			const subscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Balanced,
					timeInterval: 10000, // Update every 10 seconds
					distanceInterval: 20, // Update if moved 20 meters
				},
				(result) => {
					const userLocation: UserLocation = {
						latitude: result.coords.latitude,
						longitude: result.coords.longitude,
						accuracy: result.coords.accuracy || undefined,
						timestamp: result.timestamp,
					};
					setLocation(userLocation);
				},
			);

			setLocationSubscription(subscription);
		} catch (err) {
			setError("Failed to start location watching");
			setIsWatching(false);
			console.error("Location watching error:", err);
		}
	}, [hasPermission, requestPermission, isWatching, locationSubscription]);

	const stopWatching = useCallback(() => {
		if (locationSubscription) {
			locationSubscription.remove();
			setLocationSubscription(null);
		}
		setIsWatching(false);
	}, [locationSubscription]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			stopWatching();
		};
	}, [stopWatching]);

	return {
		location,
		isLoading,
		error,
		hasPermission,
		requestPermission,
		getCurrentLocation,
		startWatching,
		stopWatching,
		isWatching,
	};
};
