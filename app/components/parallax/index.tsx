import { Redirect } from "expo-router";
export { ParallaxCard } from "./ParallaxCard";
export { useCardParallax } from "./useCardParallax";

/** Expo Router requires a default export for this segment; this is a barrel, not a real screen. */
export default function ParallaxIndex() {
	return <Redirect href="/(tabs)" />;
}
