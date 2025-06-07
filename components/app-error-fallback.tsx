import { View, Text, StyleSheet } from "react-native";

interface ErrorFallbackProps {
	error?: Error | null;
	message?: string;
}

export const ErrorFallback = ({
	error,
	message = "Something went wrong",
}: ErrorFallbackProps) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>{message}</Text>
			{error && <Text style={styles.errorText}>{error.message}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	errorText: {
		color: "red",
	},
});
