import type { PokemonTypeName } from "@/types/pokemonTypes";
import type { FC } from "react";
import { View } from "react-native";
import type { SvgProps } from "react-native-svg";
import styles from "./typeIcon.style";

import BugImport from "../../resources/pokeTypes/bug.svg";
import DarkImport from "../../resources/pokeTypes/dark.svg";
import DragonImport from "../../resources/pokeTypes/dragon.svg";
import ElectricImport from "../../resources/pokeTypes/electric.svg";
import FairyImport from "../../resources/pokeTypes/fairy.svg";
import FightingImport from "../../resources/pokeTypes/fighting.svg";
import FireImport from "../../resources/pokeTypes/fire.svg";
import FlyingImport from "../../resources/pokeTypes/flying.svg";
import GhostImport from "../../resources/pokeTypes/ghost.svg";
import GrassImport from "../../resources/pokeTypes/grass.svg";
import GroundImport from "../../resources/pokeTypes/ground.svg";
import IceImport from "../../resources/pokeTypes/ice.svg";
import NormalImport from "../../resources/pokeTypes/normal.svg";
import PoisonImport from "../../resources/pokeTypes/poison.svg";
import PsychicImport from "../../resources/pokeTypes/psychic.svg";
import RockImport from "../../resources/pokeTypes/rock.svg";
import SteelImport from "../../resources/pokeTypes/steel.svg";
import WaterImport from "../../resources/pokeTypes/water.svg";

/** Metro/SVGR may expose the component as default or as `{ default: fn }`. */
function asSvgComponent(m: unknown): FC<SvgProps> {
	if (typeof m === "function") return m as FC<SvgProps>;
	if (m && typeof m === "object") {
		const mod = m as Record<string, unknown>;
		if (typeof mod.default === "function") return mod.default as FC<SvgProps>;
		if (typeof mod.ReactComponent === "function") return mod.ReactComponent as FC<SvgProps>;
	}
	throw new Error("Invalid SVG module: expected a component or { default }");
}

const TYPE_ICONS: Record<PokemonTypeName, FC<SvgProps>> = {
	normal: asSvgComponent(NormalImport),
	fire: asSvgComponent(FireImport),
	water: asSvgComponent(WaterImport),
	electric: asSvgComponent(ElectricImport),
	grass: asSvgComponent(GrassImport),
	ice: asSvgComponent(IceImport),
	fighting: asSvgComponent(FightingImport),
	poison: asSvgComponent(PoisonImport),
	ground: asSvgComponent(GroundImport),
	flying: asSvgComponent(FlyingImport),
	psychic: asSvgComponent(PsychicImport),
	bug: asSvgComponent(BugImport),
	rock: asSvgComponent(RockImport),
	ghost: asSvgComponent(GhostImport),
	dragon: asSvgComponent(DragonImport),
	dark: asSvgComponent(DarkImport),
	steel: asSvgComponent(SteelImport),
	fairy: asSvgComponent(FairyImport),
};

function TypeIcon({ type }: { type: PokemonTypeName }) {
	const Icon = TYPE_ICONS[type] ?? TYPE_ICONS.normal;

	return (
		<View style={styles.frame} pointerEvents="none">
			<Icon width={32} height={32} />
		</View>
	);
}

export default TypeIcon;
