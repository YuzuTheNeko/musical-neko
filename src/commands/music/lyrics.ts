import { EmbedBuilder } from "discord.js";
import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: 'lyrics',
    description: 'Attempt to get lyrics of current played track',
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

        m.channel.sendTyping().catch(noop)

        const track = (await voice.getCurrentTrack())!

        const lyrics = await voice.getTrackLyrics(track).catch(noop)

        if (!lyrics) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `Lyrics Not Found`,
                    `Could not find any lyrics for ${track.title}.`
                )
            ]
        })
        .catch(noop)

        const embeds = new Array<EmbedBuilder>()

        for (let i = 0;i < 3;i++) {
            const segment = lyrics.slice((i + 1) * 2000 - 2000, (i + 1) * 2000)
            if (!segment) break
            embeds.push(
                this.embedSuccess(
                    i === 0 ? m.author : null,
                    i === 0 ? `Lyrics for ${track.title}` : null,
                    segment
                )
            )
        }

        m.channel.send({
            embeds
        })
        .catch(noop)
    }
})