import { AutocompleteInteraction } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import noop from "../functions/noop";
import handlePlaySongOption from "./autocomplete/handlePlaySongOption";
import handleSeekPositionOption from "./autocomplete/handleSeekPositionOption";

export default async function(client: NekoClient, interaction: AutocompleteInteraction<'cached'>) {
    handlePlaySongOption(client, interaction)
    handleSeekPositionOption(client, interaction)
}