import { marshalPokemonCardData } from "@/app/lib/marshalPokemonCardData";
import Guess from "@/components/guess/guess";
import { pokeDetails } from "@/queries/basicDetails";
import { useQuery } from "@apollo/client/react";
import { Text } from "react-native";

export default function WhoPokePage() {
  const { data, loading, error } = useQuery(pokeDetails, {
    variables: { id: Math.floor(Math.random() * 1025) },
  });

  const pokemon = data ? marshalPokemonCardData(data) : null;

  return (
    <>
      {loading && <Text>Loading...</Text>}
      {error && <Text>GraphQL error: {error.message}</Text>}
      {data && !pokemon && <Text>Could not load Pokémon</Text>}
      {pokemon && <Guess pokemon={pokemon} isHistorical={false} />}
    </>
  );
}