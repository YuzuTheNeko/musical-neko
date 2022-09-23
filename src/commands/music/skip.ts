import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: 'skip',
    aliases: [
        "sk"
    ],
    description: 'skips current song',
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
        
        if (!voice.vote(m.member!)) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `Vote Failed`,
                    `You've already voted to skip this song.`
                )
            ]
        })
        .catch(noop)

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    'Voted',
                    `Successfully voted to skip current song!`
                )
            ]
        })
        .catch(noop)
    }
})