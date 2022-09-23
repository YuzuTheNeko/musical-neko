import { ArgParser, NumberFlagParser } from "arg-capturer";
import { inspect } from "util";
import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";

export default new Command({
    name: 'update',
    description: 'updates all commands',
    execute: async function(m) {
        this.manager.loadCommands(true)
        m.channel.send(`Successfully reloaded all commands`)
        .catch(noop)
    }
})