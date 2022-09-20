import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";

export default new Command({
    name: 'ping',
    description: 'Shows the bot\'s latency',
    execute: async function (m, args, extras) {
        await m.reply(`Ping! ${this.ws.ping}ms`)
    }
})