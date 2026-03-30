import type { PokemonCardData } from "@/app/lib/marshalPokemonCardData";
import { computeNameClosenessScore, normalizeNameForScore } from "@/app/lib/nameGuessScore";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ParallaxCard } from "../parallax";
import TypeIcon from "../typeIcon/typeIcon";
import styles, { typeLowerHalfGradients } from "./guess.style";

interface GuessProps {
	pokemon: PokemonCardData;
	isHistorical: boolean;
}

const Guess:React.FC<GuessProps> = ({ pokemon, isHistorical }) => {
	const [hintCount, setHintCount] = useState(0);
	const [nameGuess, setNameGuess] = useState('');
	const [outcome, setOutcome] = useState<boolean | null>(null);
	const [hintsUsed, setHintsUsed] = useState(0);
	const [nameCloseness, setNameCloseness] = useState<number | null>(null);

	function requestHint():void {
		console.log("Hint requested");
		setHintCount((c) => c + 1);
	}

	function submitGuess():void {
		setHintsUsed(hintCount);
		setHintCount(99);
		const correct =
			normalizeNameForScore(nameGuess) === normalizeNameForScore(pokemon.pokemonName);
		setOutcome(correct);
		if(!correct) {
			setNameCloseness(computeNameClosenessScore(nameGuess, pokemon.pokemonName));
		}
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
			<ParallaxCard style={[styles.card, hintCount > 2 ? hintedCardStyle : null]}>
				{hintCount > 2 && (
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
						{outcome !== null ? (
							<Text
								style={[
									styles.nameInput,
									outcome ? styles.nameRevealCorrect : styles.nameRevealWrong,
								]}
								numberOfLines={2}
							>
								{pokemon.pokemonName}
							</Text>
						) : (
							<TextInput
								style={styles.nameInput}
								onChangeText={setNameGuess}
								value={nameGuess}
								placeholder="Who's that Pokémon?"
								placeholderTextColor="#9ca3af"
								keyboardType="default"
							/>
						)}
						{hintCount > 2 && (
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
							tintColor={!(isHistorical || outcome !== null) ? "black" : undefined} 
						/>
					) : null}
				</View>
				{/* Bottom: attack row (Guess button) */}
				{!isHistorical && (
					<View style={styles.attackRow}>
						{hintCount > 0 && (
							<View style={styles.hintRow}>
								<Text style={styles.hintLabel}>Ability</Text>
								<Text style={styles.hintValue} numberOfLines={1}>
									{abilityName ?? "—"}
								</Text>
							</View>
						)}
						{hintCount > 1 && (
							<View style={styles.hintRow}>
								<Text style={styles.hintLabel}>Generation</Text>
								<Text style={styles.hintValue} numberOfLines={1}>
									{pokemon.generationName ?? "—"}
								</Text>
							</View>
						)}
						{hintCount < 3 && (
							<Pressable style={styles.hintButton} onPress={requestHint}>
								<Text style={styles.hintButtonText}>Hint</Text>
							</Pressable>
						)}
						{outcome === null && (
							<Pressable style={styles.guessButton} onPress={submitGuess}>
								<Text style={styles.guessButtonText}>Guess</Text>
							</Pressable>
						)}
					</View>
				)}
			</ParallaxCard>
			{outcome !== null && (
				<Animated.View
					key={`${outcome}-${nameGuess}`}
					entering={FadeIn.duration(420).delay(40)}
					style={styles.outcomeBlock}
				>
					<View style={styles.outcomeGuessRow}>
						<Text style={styles.outcomeLabel}>Your guess</Text>
						<Text style={styles.outcomeGuessText} numberOfLines={2}>
							{nameGuess.trim() ? nameGuess : "—"}
						</Text>
					</View>
					<Text
						style={[
							styles.outcomeVerdict,
							outcome ? styles.outcomeVerdictCorrect : styles.outcomeVerdictWrong,
						]}
					>
						{outcome ? "Correct!" : "Incorrect"}
					</Text>
					{!outcome && nameCloseness !== null && (
						<>
						<Text style={styles.outcomeScore}>Hints Used: {hintsUsed}</Text>
						<Text style={styles.outcomeScore}>Name Closeness: {nameCloseness}%</Text>
						</>
					)}
				</Animated.View>
			)}
		</View>
	);
}

export default Guess;

