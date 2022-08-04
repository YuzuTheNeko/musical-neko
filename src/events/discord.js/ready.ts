import { inspect } from "util";
import createDiscordEventListener from "../../functions/createDiscordEventListener";
import { toPluralAmount } from "../../functions/toPlural";

export default createDiscordEventListener("messageCreate", async function() {
    this.manager.loadCommands()
    this.manager.lavalink.start()

    await this.guilds.cache.get(this.config.supportGuildID)!.commands.set(this.manager.asSlashCommands())

    this.log(`Ready on client ${this.user!.tag} and loaded ${toPluralAmount('command', this.manager.commands.size)}!`)
})