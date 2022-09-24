import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: `replay`,
    description: `Replays current song`,
    music: {
        mustMatchVoice: true,
        userInVoice: true,
        state: [
            PlayerState.Paused,
            PlayerState.Playing
        ]
    },
    execute: async function(m) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice) return;

        if (!voice.manageableBy(m.member!, undefined, m)) return;
    
        voice.setPosition(voice.position)
        const trk = voice.getCurrentTrack()!

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `Replaying now`,
                    `Replaying [${trk.title}](${trk.url})!`
                )
            ]
        })
        .catch(noop)
    }
})