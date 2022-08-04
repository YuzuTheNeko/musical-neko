import { ChatInputCommandInteraction } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import getArgsFromInteractionOptions from "../functions/getArgsFromInteractionOptions";
import log from "../functions/log";
import noop from "../functions/noop";

export default async function(client: NekoClient, interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand(true)

    const command = client.manager.commands.get(subcommand)

    if (!command) {
        return void interaction.reply({
            ephemeral: true,
            content: `:x: This command does no longer exist!`
        })
        .catch(noop)
    }

    if (!(await command.checkAllPermissions(client, interaction as ChatInputCommandInteraction<'cached'>, true))) return;

    const args = getArgsFromInteractionOptions(command.args, interaction)

    try {
        await command.execute.call(client, interaction as ChatInputCommandInteraction<'cached'>, args, {
            command
        })
    } catch (error: any) {
        if (interaction.replied) return;
        await interaction.reply({
            content: `There was an error while running \`${command.name}\`:\n\`\`\`js\n${error.message}\`\`\``
        })
        .catch(noop)

        log('ERROR', `An exception occurred while running command ${command.name} for user ${interaction.user.tag} (${interaction.user.id}) in guild ${interaction.guild?.name} (${interaction.guild?.id}):\n`, error.stack)
    }
}