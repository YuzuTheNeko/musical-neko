import { AutocompleteInteraction } from "discord.js";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";

export default async function(client: NekoClient, interaction: AutocompleteInteraction<'cached'>) {
    if (interaction.commandName !== 'music' || interaction.options.getSubcommand(true) !== 'play') {
        return;
    }

    const option = interaction.options.getFocused(false) as string
    if (!option) {
        return void interaction.respond([]).catch(noop)
    }

    const search = await client.manager.lavalink.search(null, {
        query: option
    })

    if (!search) {
        return void interaction.respond([]).catch(noop)
    }

    return void interaction.respond(
        search.tracks.map(c => (
            {
                name: c.title,
                value: c.url
            }
        )).slice(0, 25)
    )
}