import { Accelerometer, Gyroscope } from "expo-sensors";
import { useEffect, useState } from "react";
import { AppState, type AppStateStatus, Platform, useWindowDimensions } from "react-native";
import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const TILT_MAX = 12;
const CURSOR_SENSITIVITY = 0.5;

export function useCardParallax() {
	const { width: winWidth, height: winHeight } = useWindowDimensions();
	const rotateX = useSharedValue(0);
	const rotateY = useSharedValue(0);
	const rollTilt = useSharedValue(0);
	const yawSpin = useSharedValue(0);

	const [appActive, setAppActive] = useState(() => AppState.currentState === "active");

	useEffect(() => {
		if (Platform.OS === "web") return;
		const onChange = (state: AppStateStatus) => {
			setAppActive(state === "active");
		};
		const sub = AppState.addEventListener("change", onChange);
		return () => sub.remove();
	}, []);

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

	useEffect(() => {
		if (Platform.OS === "web" || !appActive) return;
		let accelSub: { remove: () => void } | undefined;
		let gyroSub: { remove: () => void } | undefined;
		let cancelled = false;

		void (async () => {
			const ok = await Accelerometer.isAvailableAsync();
			if (cancelled || !ok) return;

			const perm = await Accelerometer.getPermissionsAsync();
			if (perm.status !== "granted") {
				const req = await Accelerometer.requestPermissionsAsync();
				if (cancelled || req.status !== "granted") return;
			}

			if (cancelled) return;
			Accelerometer.setUpdateInterval(50);
			accelSub = Accelerometer.addListener((data) => {
				const { x, y, z } = data;
				const rollRad = Math.atan2(x, Math.sqrt(y * y + z * z));
				const rollDeg = (-rollRad * 180) / Math.PI;
				rollTilt.value = Math.max(-TILT_MAX, Math.min(TILT_MAX, rollDeg * 0.45));
			});

			const gyroOk = await Gyroscope.isAvailableAsync();
			if (cancelled || !gyroOk) return;
			const gPerm = await Gyroscope.getPermissionsAsync();
			if (gPerm.status !== "granted") {
				const req = await Gyroscope.requestPermissionsAsync();
				if (cancelled || req.status !== "granted") return;
			}
			if (cancelled) return;
			Gyroscope.setUpdateInterval(50);
			gyroSub = Gyroscope.addListener((g) => {
				yawSpin.value = Math.max(-TILT_MAX, Math.min(TILT_MAX, g.z * 14));
			});
		})();

		return () => {
			cancelled = true;
			accelSub?.remove();
			gyroSub?.remove();
		};
	}, [appActive]);

	const isWeb = Platform.OS === "web";
	const cardAnimatedStyle = useAnimatedStyle(() => {
		const ry = isWeb
			? rotateY.value
			: Math.max(-TILT_MAX, Math.min(TILT_MAX, rollTilt.value + yawSpin.value));
		return {
			transform: [
				{ perspective: 1200 },
				{ rotateX: `${rotateX.value}deg` },
				{ rotateY: `${ry}deg` },
			],
		};
	});

	return { cardAnimatedStyle };
}
