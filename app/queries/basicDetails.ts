const pokeDetails:string = `
query pokemon_details {
  species: pokemonspecies(where: {name: {_eq: "trapinch"}}) {
	name
	base_happiness
	is_legendary
	is_mythical
	generation: generation {
	  name
	}
	habitat: pokemonhabitat {
	  name
	}
	pokemon: pokemons_aggregate(limit: 1) {
	  nodes {
		height
		name
		id
		weight
		abilities: pokemonabilities_aggregate {
		  nodes {
			ability: ability {
			  name
			}
		  }
		}
		stats: pokemonstats {
		  base_stat
		  stat: stat {
			name
		  }
		}
		types: pokemontypes {
		  slot
		  type: type {
			name
		  }
		}
		levelUpMoves: pokemonmoves_aggregate(where: {movelearnmethod: {name: {_eq: "level-up"}}}, distinct_on: move_id) {
		  nodes {
			move: move {
			  name
			}
			level
		  }
		}
		foundInAsManyPlaces: encounters_aggregate {
		  aggregate {
			count
		  }
		}
		sprites: pokemonsprites(limit: 1) {
			sprites
		}
	  }
	}
	flavorText: pokemonspeciesflavortexts(where: {language: {name: {_eq: "en"}}, version: {name: {_eq: "firered"}}}) {
	  flavor_text
	}
  }
}
`;

export { pokeDetails };

