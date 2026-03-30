import type { ReactNode } from "react";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useCardParallax } from "./useCardParallax";

type ParallaxCardProps = Omit<ViewProps, "style"> & {
	style?: StyleProp<ViewStyle>;
	children: ReactNode;
};

/**
 * Animated card shell with web cursor parallax and native accelerometer + gyro tilt.
 */
export function ParallaxCard({ style, children, ...rest }: ParallaxCardProps) {
	const { cardAnimatedStyle } = useCardParallax();
	return (
		<Animated.View style={[style, cardAnimatedStyle]} {...rest}>
			{children}
		</Animated.View>
	);
}
