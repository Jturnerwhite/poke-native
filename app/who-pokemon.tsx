import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Guess } from "./components/guess";
import { pokeDetails } from "./queries/basicDetails";

export default function WhoPokePage() {
  const [pokeData, setPokeData] = useState<any>(null);

  async function fetchQL(pkmn: string): Promise<any> {
    const result = await fetch("https://graphql.pokeapi.co/v1beta2", {
      method: "POST",
      body: JSON.stringify({
        query: pokeDetails,
        operationName: "pokemon_details",
      }),
    });

    return await result.json();
  }

  useEffect(() => {
    fetchQL("Trapinch").then((data) => {
      setPokeData(data);
      console.log("PokeData:", data);
    });
  }, []);

  return (
    <>
      {pokeData && <Guess pokeData={pokeData} isHistorical={false} />}
      {!pokeData && <Text>Loading...</Text>}
    </>
  );
}

