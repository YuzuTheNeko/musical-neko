import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: `clear-filters`,
    description: `Clears all applied filters`,
    music: {
        mustMatchVoice: true,
        userInVoice: true 
    },
    execute: async function(m) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice) return;

        voice.clearFilters()

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `Filters Removed`,
                    `All applied filters have been cleared!`
                )
            ]
        })   
        .catch(noop)
    }
})