import type { PokemonTypeName } from "@/types/pokemonTypes";

/** Normalized Pokémon data for the Guess card UI (from `pokemon_details` query). */
export type PokemonCardData = {
	speciesId: number;
	speciesName: string;
	pokemonId: number;
	pokemonName: string;
	height: number;
	weight: number;
	officialArtworkUrl: string | null;
	/** Types in slot order (primary first when API orders by slot). */
	types: PokemonTypeName[];
	primaryType: PokemonTypeName;
	secondaryType: PokemonTypeName | undefined;
	abilityNames: string[];
	/** First ability, hyphenated API name → display (spaces). */
	firstAbilityDisplay: string | null;
	flavorTextEnFirered: string | null;
	isLegendary: boolean;
	isMythical: boolean;
	generationName: string | null;
	habitatName: string | null;
};

const VALID_TYPES = new Set<string>([
	"normal",
	"fire",
	"water",
	"electric",
	"grass",
	"ice",
	"fighting",
	"poison",
	"ground",
	"flying",
	"psychic",
	"bug",
	"rock",
	"ghost",
	"dragon",
	"dark",
	"steel",
	"fairy",
]);

function toPokemonTypeName(name: string | undefined | null): PokemonTypeName {
	if (name && VALID_TYPES.has(name)) return name as PokemonTypeName;
	return "normal";
}

function formatAbilityName(apiName: string): string {
	return apiName.replaceAll("-", " ");
}

function extractOfficialArtworkUrl(pokemonNode: Record<string, unknown>): string | null {
	const spritesArr = pokemonNode.sprites;
	if (!Array.isArray(spritesArr) || spritesArr.length === 0) return null;
	const row = spritesArr[0] as Record<string, unknown>;
	const spritesJson = row?.sprites;
	if (!spritesJson || typeof spritesJson !== "object") return null;
	const other = (spritesJson as Record<string, unknown>).other as Record<string, unknown> | undefined;
	const art = other?.["official-artwork"] as Record<string, unknown> | undefined;
	const url = art?.front_default;
	return typeof url === "string" ? url : null;
}

/**
 * Maps the Apollo `pokemon_details` query result into {@link PokemonCardData}.
 * Returns `null` if required species / Pokémon nodes are missing.
 */
export function marshalPokemonCardData(raw: unknown): PokemonCardData | null {
	if (!raw || typeof raw !== "object") return null;
	const root = raw as Record<string, unknown>;
	const speciesArr = root.species;
	if (!Array.isArray(speciesArr) || speciesArr.length === 0) return null;

	const species = speciesArr[0] as Record<string, unknown>;
	const speciesId = species.id;
	const speciesName = species.name;
	if (typeof speciesId !== "number" || typeof speciesName !== "string") return null;

	const agg = species.pokemon as Record<string, unknown> | undefined;
	const nodes = agg?.nodes;
	if (!Array.isArray(nodes) || nodes.length === 0) return null;

	const pokemon = nodes[0] as Record<string, unknown>;
	const pokemonId = pokemon.id;
	const pokemonName = pokemon.name;
	if (typeof pokemonId !== "number" || typeof pokemonName !== "string") return null;

	const height = typeof pokemon.height === "number" ? pokemon.height : 0;
	const weight = typeof pokemon.weight === "number" ? pokemon.weight : 0;

	const typeRows = pokemon.types;
	const sortedSlots = Array.isArray(typeRows)
		? [...typeRows].sort((a, b) => {
				const sa = (a as { slot?: number })?.slot ?? 0;
				const sb = (b as { slot?: number })?.slot ?? 0;
				return sa - sb;
			})
		: [];

	const types: PokemonTypeName[] = sortedSlots.map((row) => {
		const t = (row as { type?: { name?: string } })?.type?.name;
		return toPokemonTypeName(t);
	});

	const primaryType = types[0] ?? "normal";
	const secondaryType = types.length > 1 ? types[1] : undefined;

	const abilitiesAgg = pokemon.abilities as { nodes?: unknown[] } | undefined;
	const abilityNodes = Array.isArray(abilitiesAgg?.nodes) ? abilitiesAgg!.nodes! : [];
	const abilityNames: string[] = abilityNodes
		.map((n) => {
			const name = (n as { ability?: { name?: string } })?.ability?.name;
			return typeof name === "string" ? name : null;
		})
		.filter((n): n is string => n != null);

	const firstRaw = abilityNames[0] ?? null;
	const firstAbilityDisplay = firstRaw ? formatAbilityName(firstRaw) : null;

	const flavorArr = species.flavorText;
	let flavorTextEnFirered: string | null = null;
	if (Array.isArray(flavorArr) && flavorArr.length > 0) {
		const ft = (flavorArr[0] as { flavor_text?: string })?.flavor_text;
		flavorTextEnFirered = typeof ft === "string" ? ft : null;
	}

	const gen = species.generation as { name?: string } | undefined;
	const habitat = species.habitat as { name?: string } | undefined;

	return {
		speciesId,
		speciesName,
		pokemonId,
		pokemonName,
		height,
		weight,
		officialArtworkUrl: extractOfficialArtworkUrl(pokemon),
		types,
		primaryType,
		secondaryType,
		abilityNames,
		firstAbilityDisplay,
		flavorTextEnFirered,
		isLegendary: Boolean(species.is_legendary),
		isMythical: Boolean(species.is_mythical),
		generationName: typeof gen?.name === "string" ? gen.name : null,
		habitatName: typeof habitat?.name === "string" ? habitat.name : null,
	};
}
