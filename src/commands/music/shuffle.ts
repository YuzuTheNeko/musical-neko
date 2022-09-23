import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: `shuffle`,
    description: `Shuffles the queue`,
    music: {
        mustMatchVoice: true,
        userInVoice: true 
    },
    execute: async function(m) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice) return;

        voice.shuffle()
        
        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `Queue Shuffled`,
                    `The queue has been shuffled!`
                )
            ]
        })
        .catch(noop)
    }
})