import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { PlayerState } from "../../typings/enums/PlayerState";

export default new Command({
    name: `back`,
    description: `Replays last song`,
    music: {
        mustMatchVoice: true,
        userInVoice: true 
    },
    execute: async function(m) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice) return;

        if (!voice.manageableBy(m.member!, undefined, m)) return;
    
        const pos = voice.position - 1
        const last = voice.getLastTrack()
    
        if (!last) {
            return void m.channel.send({
                embeds: [
                    this.embedError(
                        m.author,
                        `No Track Found`,
                        `There was no song prior to this one as far as I know`
                    )
                ]
            })
            .catch(noop)
        }
    
        voice.setPosition(pos)
        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `Track Found`,
                    `Went back to prior played track ([${last.title}](${last.url}))!`
                )
            ]
        })
        .catch(noop)
    }
})