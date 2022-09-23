import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: 'resume',
    description: 'resumes current pause song',
    music: {
        mustMatchVoice: true,
        state: [ 
            PlayerState.Paused 
        ],
        userInVoice: true 
    },
    execute: async function(m) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice || !voice.manageableBy(m.member!, undefined, m)) return;
        
        voice.resume()

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    'Resumed',
                    `Successfully resumed current song!`
                )
            ]
        })
        .catch(noop)
    }
})