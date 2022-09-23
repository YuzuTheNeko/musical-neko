import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: 'pause',
    description: 'pauses current playing song',
    music: {
        mustMatchVoice: true,
        state: [ 
            PlayerState.Playing 
        ],
        userInVoice: true 
    },
    execute: async function(m) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice || !voice.manageableBy(m.member!, undefined, m)) return;
        
        voice.pause()

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    'Paused',
                    `Successfully paused current song!`
                )
            ]
        })
        .catch(noop)
    }
})