import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Accelerometer } from "expo-sensors";
import { LinearGradient } from "expo-linear-gradient";

interface GuessProps {
	pokeData: any;
	isHistorical: boolean;
}

const TILT_MAX = 12;
const CURSOR_SENSITIVITY = 0.5;

const Guess:React.FC<GuessProps> = ({pokeData, isHistorical}) => {
	const [nameGuess, setNameGuess] = useState('');
	const { width: winWidth, height: winHeight } = useWindowDimensions();
	const rotateX = useSharedValue(0);
	const rotateY = useSharedValue(0);

	// Web: parallax from cursor position
	useEffect(() => {
		if (Platform.OS !== "web") return;
		const handleMouseMove = (e: { clientX: number; clientY: number }) => {
			const nx = (e.clientX / winWidth - 0.5) * 2;
			const ny = (e.clientY / winHeight - 0.5) * 2;
			rotateY.value = withSpring(nx * TILT_MAX * CURSOR_SENSITIVITY, { damping: 25, stiffness: 200 });
			rotateX.value = withSpring(-ny * TILT_MAX * CURSOR_SENSITIVITY, { damping: 25, stiffness: 200 });
		};
		if (typeof window !== "undefined") {
			window.addEventListener("mousemove", handleMouseMove);
			return () => window.removeEventListener("mousemove", handleMouseMove);
		}
	}, [winWidth, winHeight]);

	// Native: parallax from accelerometer
	useEffect(() => {
		if (Platform.OS === "web") return;
		Accelerometer.setUpdateInterval(50);
		const sub = Accelerometer.addListener((data) => {
			// Mobile: left-right parallax only (rotateY from device tilt)
			const tiltY = Math.max(-TILT_MAX, Math.min(TILT_MAX, -data.x * 18));
			rotateX.value = withSpring(0, { damping: 28, stiffness: 90 });
			rotateY.value = withSpring(tiltY, { damping: 28, stiffness: 90 });
		});
		return () => sub.remove();
	}, []);

	const cardAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ perspective: 1200 },
			{ rotateX: `${rotateX.value}deg` },
			{ rotateY: `${rotateY.value}deg` },
		],
	}));

	// Sheen moves with tilt so the card looks foiled at different angles
	const SHEEN_DRIFT = 18;
	const sheenAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: rotateY.value * SHEEN_DRIFT },
			{ translateY: rotateX.value * SHEEN_DRIFT },
		],
	}));

	function submitGuess():void {
		console.log(nameGuess);
	}

	return (
		<View style={styles.screen}>
			<Animated.View style={[styles.card, cardAnimatedStyle]}>
				{/* Sheen only on border: overlay covers full card; yellow mask covers interior so only the border ring shows sheen */}
				<View style={styles.sheenOverlay} pointerEvents="none">
					<Animated.View style={[styles.sheenGradientWrap, sheenAnimatedStyle]}>
						{Platform.OS === "web" ? (
							<View
								style={[
									styles.sheenGradient,
									{
										// @ts-expect-error - web-only CSS (green + wider stripe for debug)
										backgroundImage: "linear-gradient(135deg, transparent 0%, transparent 45%, rgba(0,255,0,0.8) 50%, transparent 55%, transparent 100%)",
									},
								]}
							/>
						) : (
							<LinearGradient
								colors={[
									"transparent",
									"transparent",
									"rgba(0,255,0,0.8)",
									"transparent",
									"transparent",
								]}
								locations={[0, 0.45, 0.5, 0.55, 1]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.sheenGradient}
							/>
						)}
					</Animated.View>
				</View>
				<View style={styles.sheenBorderMask} pointerEvents="none" />
				{/* Top: name row (like TCG header) */}
				{!isHistorical && (
					<View style={styles.nameRow}>
						<TextInput
							style={styles.nameInput}
							onChangeText={setNameGuess}
							value={nameGuess}
							placeholder="Who's that Pokémon?"
							placeholderTextColor="#9ca3af"
							keyboardType="default"
						/>
					</View>
				)}
				{/* Middle: illustration area */}
				<View style={styles.imageWrapper}>
					<Image 
						source={{ uri: pokeData.data.species[0].pokemon.nodes[0].sprites[0].sprites.other["official-artwork"].front_default }} 
						style={styles.image}
						tintColor={!isHistorical ? "black" : undefined} 
					/>
				</View>
				{/* Bottom: attack row (Guess button) */}
				{!isHistorical && (
					<View style={styles.attackRow}>
						<Pressable style={styles.guessButton} onPress={submitGuess}>
							<Text style={styles.guessButtonText}>Guess</Text>
						</Pressable>
					</View>
				)}
			</Animated.View>
		</View>
	);
}

export { Guess };

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#1b2735",
		padding: 16,
	},
	card: {
		width: 300,
		aspectRatio: 2.5 / 3.5,
		borderRadius: 12,
		backgroundColor: "#f7e35c",
		borderWidth: 9,
		borderColor: "#8b8b8b",
		padding: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
		overflow: "hidden",
	},
	sheenOverlay: {
		position: "absolute",
		top: -19,
		left: -19,
		right: -19,
		bottom: -19,
		borderRadius: 12,
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
	},
	sheenBorderMask: {
		position: "absolute",
		top: -10,
		left: -10,
		right: -10,
		bottom: -10,
		backgroundColor: "#f7e35c",
		borderRadius: 3,
	},
	sheenGradientWrap: {
		width: 2800,
		height: 2800,
	},
	sheenGradient: {
		width: "100%",
		height: "100%",
	},
	nameRow: {
		paddingVertical: 8,
		paddingHorizontal: 4,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.08)",
	},
	nameInput: {
		backgroundColor: "rgba(255,255,255,0.85)",
		borderWidth: 1.5,
		borderColor: "#9ca3af",
		borderRadius: 6,
		fontSize: 18,
		fontWeight: "bold",
		color: "#1f2937",
		paddingVertical: 6,
		paddingHorizontal: 10,
	},
	imageWrapper: {
		height: 168,
		backgroundColor: "#fdf8e4",
		borderRadius: 8,
		borderWidth: 2,
		borderColor: "#8b8b8b",
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 6,
	},
	image: {
		width: "100%",
		height: "100%",
		resizeMode: "contain",
	},
	attackRow: {
		paddingVertical: 10,
		paddingHorizontal: 6,
		borderTopWidth: 1,
		borderTopColor: "rgba(0,0,0,0.08)",
	},
	guessButton: {
		backgroundColor: "#3b4cca",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	guessButtonText: {
		color: "#ffffff",
		fontWeight: "bold",
		fontSize: 16,
	},
});

