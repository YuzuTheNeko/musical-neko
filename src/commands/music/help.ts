import { inlineCode } from "discord.js";
import noop from "../../functions/noop";
import { Command } from "../../structures/Command";

export default new Command({
    name: `help`,
    description: `Gets all commands`,
    execute: async function(m) {
        const arr = new Array<string>()
        
        for (const [, command] of this.manager.commands) {
            if (!command.checkAllPermissions(this, m, false)) continue
            arr.push(`**${this.prefix}${command.data.name}**${
                command.data.args?.length ? ` ${
                    command.data.args.map(c => inlineCode(
                        c.required ? `<${c.name}>` : `[${c.name}]`
                    ))
                }` : ''
            } - ${command.data.description || `No description provided`}`)
        }

        const embed = this.embedSuccess(
            m.author,
            `Commands for ${this.user.username}`,
            arr.join('\n')
        )

        m.channel.send({
            embeds: [
                embed
            ]
        })
        .catch(noop)
    }
})