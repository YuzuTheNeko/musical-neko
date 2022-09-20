import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: 'disconnect',
    aliases: [
        "dc"
    ],
    description: 'Disconnect the bot from voice channel',
    music: {
        mustMatchVoice: true,
        state: [ 
            PlayerState.Playing, 
            PlayerState.Paused 
        ],
        userInVoice: true 
    },
    execute: async function(m) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice) return;
        
        voice.destroy()

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    'Disconnected',
                    `Successfully disconnected from voice channel.`
                )
            ]
        })
        .catch(noop)
    }
})