import { Redirect } from "expo-router";
import Guess from "./guess/guess";
import History from "./history";

export { Guess, History };

/** Expo Router requires a default export for this segment; this is a barrel, not a real screen. */
export default function ComponentsIndex() {
	return <Redirect href="/(tabs)" />;
}
