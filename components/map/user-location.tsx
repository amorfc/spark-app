import React from "react";
import { UserLocation as MapboxUserLocation } from "@rnmapbox/maps";

interface UserLocationProps {
	visible?: boolean;
	showsUserHeadingIndicator?: boolean;
	androidRenderMode?: "normal" | "compass" | "gps";
	requestsAlwaysUse?: boolean;
	minDisplacement?: number;
}

export const UserLocation: React.FC<UserLocationProps> = ({
	visible = true,
	showsUserHeadingIndicator = true,
	androidRenderMode = "gps",
	requestsAlwaysUse = false,
	minDisplacement = 5,
}) => {
	if (!visible) return null;

	return (
		<MapboxUserLocation
			visible={visible}
			showsUserHeadingIndicator={showsUserHeadingIndicator}
			androidRenderMode={androidRenderMode}
			requestsAlwaysUse={requestsAlwaysUse}
			minDisplacement={minDisplacement}
		/>
	);
};

export default UserLocation;
