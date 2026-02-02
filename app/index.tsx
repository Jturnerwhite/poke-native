import { useEffect, useState } from 'react';
import { Image, Text, View } from "react-native";
import { pokeDetails } from './queries/basicDetails';

export default function Index() {
	const [pokeData, setPokeData] = useState(null as any);

	async function fetchQL(pkmn:string) {
		const result = await fetch(
			"https://graphql.pokeapi.co/v1beta2",
			{
				method: "POST",
				body: JSON.stringify({
					query: pokeDetails,
					operationName: "pokemon_details"
				})
			}
		)

		return await result.json()
	}

	useEffect(() => {
		fetchQL("Trapinch").then((data) => {
			setPokeData(data);
			console.log("PokeData:", data);
		});
	}, []);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			{pokeData && <>
				<Text>{pokeData.data.species[0].name}</Text>
				<Image source={{uri: pokeData.data.species[0].pokemon.nodes[0].sprites[0].sprites.other["official-artwork"].front_default}} style={{width: 300, height: 300}} />
			</>}
			{!pokeData && <Text>Loading...</Text>}
		</View>
	);
}
