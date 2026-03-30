import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home", headerShown: false }} />
      <Tabs.Screen name="who-pokemon" options={{ title: "Who's that Pokémon?", headerShown: false }} />
    </Tabs>
  )
}