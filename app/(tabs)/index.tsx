import { router } from "expo-router";
import { Button } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button title="Who's that Pokemon?" onPress={() => router.push("/who-pokemon")} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}