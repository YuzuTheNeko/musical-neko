import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: 'now-playing',
    aliases: [
        'np'
    ],
    description: 'shows info of current song',
    music: {
        mustMatchVoice: true,
        state: [ 
            PlayerState.Paused,
            PlayerState.Playing
        ],
        userInVoice: true 
    },
    execute: async function(m) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice) return;
        
        const trk = voice.getCurrentTrack()!

        const embed = this.embedSuccess(
            m.author,
            trk.title,
            `Requested by ${trk.requester}`
        )

        embed.setURL(trk.url)

        const thumb = trk.displayThumbnail('default')
        if (thumb) embed.setThumbnail(thumb)

        embed.addFields([
            {
                name: `Playback Position`,
                value: this.manager.parser.parseToString(
                    voice.player!.position, { and: true, limit: 2 }
                ) || '0 seconds'
            },
            {
                name: `Track Duration`,
                value: this.manager.parser.parseToString(
                    trk.duration, { and: true, limit: 2 }
                )
            }
        ])

        m.channel.send({
            embeds: [
                embed
            ]
        })
        .catch(noop)
    }
})