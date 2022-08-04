import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";

export default new Command({
    name: 'ping',
    description: 'Shows the bot\'s latency',
    execute: async function (interaction, args, extras) {
        await interaction.reply(`Uwu rawr!`)
    }
})