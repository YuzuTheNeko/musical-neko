import { AutocompleteInteraction } from "discord.js";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";

export default async function(client: NekoClient, interaction: AutocompleteInteraction<'cached'>) {
    if (interaction.commandName !== 'music' || interaction.options.getSubcommand(true) !== 'seek') {
        return;
    }

    const option = interaction.options.getFocused(false) as string
    try {
        const ms = client.manager.parser.unsafeParseToMS(option)
        const format = client.manager.parser.parseToString(ms, {
            and: true,
            limit: 2
        })

        interaction.respond([
            {
                name: format,
                value: ms.toString()
            }
        ])
        .catch(noop)
    } catch (error) {
        interaction.respond([])
        .catch(noop)
    }
}