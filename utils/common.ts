/**
 * Generate a unique ID using timestamp and random number
 * @returns Unique string ID
 */
export const generateUniqueId = (): string => {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
