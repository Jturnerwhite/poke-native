import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { Stack } from "expo-router";
import React from "react";

// Initialize Apollo Client
const client = new ApolloClient({
  link: new HttpLink({ uri: "https://graphql.pokeapi.co/v1beta2" }),
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ApolloProvider>
  );
}
