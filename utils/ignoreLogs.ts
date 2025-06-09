import { LogBox } from "react-native";

//
const ignoredLogs = [
	// This specific warning is often caused by a version mismatch in @rnmapbox/maps
	// and can be safely ignored if the map functions correctly.
	"Invalid prop `sourceID` supplied to `React.Fragment`",
	"Warning: Invalid prop `sourceID` supplied to `React.Fragment`.",
	// Add other warnings to ignore here
];

/**
 * Sets up LogBox to ignore a predefined list of warnings.
 * This is useful for hiding warnings that are known to be non-critical or
 * are caused by third-party library version incompatibilities.
 */
export const setupLogBox = () => {
	LogBox.ignoreLogs(ignoredLogs);
};
