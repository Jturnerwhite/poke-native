import { marshalPokemonCardData } from "@/app/lib/marshalPokemonCardData";
import Guess from "@/components/guess/guess";
import { pokeDetails } from "@/queries/basicDetails";
import { useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function randomSpeciesId(): number {
	return Math.floor(Math.random() * 1025);
}

export default function WhoPokePage() {
	const [pokemonId, setPokemonId] = useState(randomSpeciesId);
	const [refreshing, setRefreshing] = useState(false);

	const { data, loading, error } = useQuery(pokeDetails, {
		variables: { id: pokemonId },
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!loading && refreshing) {
			setRefreshing(false);
		}
	}, [loading, refreshing]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setPokemonId(randomSpeciesId());
	}, []);

	const pokemon = data ? marshalPokemonCardData(data) : null;

	return (
		<SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					style={styles.flex}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
				>
					{loading && !data && (
						<View style={styles.centered}>
							<ActivityIndicator size="large" color="#e5e7eb" />
							<Text style={styles.statusText}>Loading...</Text>
						</View>
					)}
					{error && (
						<Text style={styles.errorText}>GraphQL error: {error.message}</Text>
					)}
					{data != null && pokemon === null && (
						<Text style={styles.statusText}>Could not load Pokémon</Text>
					)}
					{pokemon && (
						<Guess key={pokemonId} pokemon={pokemon} isHistorical={false} />
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: {
		flex: 1,
		backgroundColor: "#1b2735",
	},
	flex: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	centered: {
		flex: 1,
		minHeight: 200,
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
	},
	statusText: {
		color: "#e5e7eb",
		fontSize: 16,
	},
	errorText: {
		color: "#fca5a5",
		padding: 16,
		fontSize: 16,
	},
});
