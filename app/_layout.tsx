import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Welcome" }} />
      <Stack.Screen name="who-pokemon" options={{ title: "Who's that Pokémon?" }} />
    </Stack>
  );
}
