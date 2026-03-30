import { LinearGradient } from "expo-linear-gradient";
import { Accelerometer } from "expo-sensors";
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import type { PokemonCardData } from "@/app/lib/marshalPokemonCardData";
import TypeIcon from "../typeIcon/typeIcon";
import styles, { typeLowerHalfGradients, type PokemonTypeName } from "./guess.style";

interface GuessProps {
	pokemon: PokemonCardData;
	isHistorical: boolean;
}

const TILT_MAX = 12;
const CURSOR_SENSITIVITY = 0.5;

const Guess:React.FC<GuessProps> = ({ pokemon, isHistorical }) => {
	const [hintCount, setHintCount] = useState(0);
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

	function requestHint():void {
		console.log("Hint requested");
		setHintCount((c) => c + 1);
	}

	function submitGuess():void {
		console.log(nameGuess);
	}

	const abilityName = pokemon.firstAbilityDisplay ?? undefined;

	const primaryType = pokemon.primaryType;
	const secondaryType = pokemon.secondaryType;
	const lowerGradient = typeLowerHalfGradients[secondaryType ?? primaryType];

	const hintedCardStyle = (() => {
		switch (primaryType) {
			case "normal": return styles.cardNormal;
			case "fire": return styles.cardFire;
			case "water": return styles.cardWater;
			case "electric": return styles.cardElectric;
			case "grass": return styles.cardGrass;
			case "ice": return styles.cardIce;
			case "fighting": return styles.cardFighting;
			case "poison": return styles.cardPoison;
			case "ground": return styles.cardGround;
			case "flying": return styles.cardFlying;
			case "psychic": return styles.cardPsychic;
			case "bug": return styles.cardBug;
			case "rock": return styles.cardRock;
			case "ghost": return styles.cardGhost;
			case "dragon": return styles.cardDragon;
			case "dark": return styles.cardDark;
			case "steel": return styles.cardSteel;
			case "fairy": return styles.cardFairy;
			default: return undefined;
		}
	})();

	return (
		<View style={styles.screen}>
			<Animated.View style={[styles.card, hintCount > 0 ? hintedCardStyle : null, cardAnimatedStyle]}>
				{/* Type gradient for lower-half of the card (only after first hint) */}
				{hintCount > 0 && (
					<LinearGradient
						colors={lowerGradient.colors}
						start={{ x: 0.5, y: 0 }}
						end={{ x: 0.5, y: 1 }}
						style={styles.lowerHalfGradient}
						pointerEvents="none"
					/>
				)}
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
						{hintCount > 0 && (
							<View style={styles.typeIconsRow}>
								<TypeIcon type={primaryType} />
								{secondaryType && secondaryType !== primaryType && (
									<TypeIcon type={secondaryType} />
								)}
							</View>
						)}
					</View>
				)}
				{/* Middle: illustration area */}
				<View style={styles.imageWrapper}>
					{pokemon.officialArtworkUrl ? (
						<Image 
							source={{ uri: pokemon.officialArtworkUrl }} 
							style={styles.image}
							tintColor={!isHistorical ? "black" : undefined} 
						/>
					) : null}
				</View>
				{/* Bottom: attack row (Guess button) */}
				{!isHistorical && (
					<View style={styles.attackRow}>
						{hintCount > 1 && (
							<View style={styles.abilityRow}>
								<Text style={styles.abilityLabel}>Ability</Text>
								<Text style={styles.abilityValue} numberOfLines={1}>
									{abilityName ?? "—"}
								</Text>
							</View>
						)}
						<Pressable style={styles.hintButton} onPress={requestHint}>
							<Text style={styles.hintButtonText}>Hint</Text>
						</Pressable>
						<Pressable style={styles.guessButton} onPress={submitGuess}>
							<Text style={styles.guessButtonText}>Guess</Text>
						</Pressable>
					</View>
				)}
			</Animated.View>
		</View>
	);
}

export default Guess;

