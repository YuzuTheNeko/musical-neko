import { ArgParser } from "arg-capturer";
import { ChatInputCommandInteraction, Message } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import cast from "../functions/cast";
import log from "../functions/log";
import noop from "../functions/noop";

const DefaultArgParser = new ArgParser()

export default async function(client: NekoClient, message: Message<true>) {
    if (!message.content.startsWith(client.prefix)) return;

    const rawArgs = message.content.slice(client.prefix.length).trim().split(/ +/g)

    const cmd = rawArgs.shift()?.toLowerCase()

    if (!cmd) return;

    const finder = cmd.replace(/-/g, '')

    const command = client.manager.commands.find(
        c => c.data.name.replace(/-/g, '') === finder || (
            c.data.aliases?.some(
                a => a.replace(/-/g, '') === finder
            ) ?? false
        ) 
    )

    if (!command) return;

    if (!(await command.checkAllPermissions(client, message, true))) return;

    const parsed = (command.data.flags ?? DefaultArgParser).parse(rawArgs.join(' '))

    const args = await command.parseArgs(client, message, parsed.args)

    if (args === false) return

    try {
        await command.execute.call(client, message, cast(args), {
            command,
            flags: parsed.flags
        })
    } catch (error: any) {
        await message.reply({
            content: `There was an error while running \`${command.name}\`:\n\`\`\`js\n${error.message}\`\`\``
        })
        .catch(noop)

        log('ERROR', `An exception occurred while running command ${command.name} for user ${message.author.tag} (${message.author.id}) in guild ${message.guild.name} (${message.guildId}):\n`, error)
    }
}