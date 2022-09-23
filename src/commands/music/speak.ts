import noop from "../../functions/noop"
import removeBackticks from "../../functions/removeBackticks"
import { Command } from "../../structures/Command"
import { VoiceGuild } from "../../structures/VoiceGuild"
import { ArgType } from "../../typings/enums/ArgType"

export default new Command({
    name: `speak`,
    description: "Speaks something you say",
    args: [
        {
            name: `tts`,
            description: `what to say`,
            type: ArgType.String,
            required: true
        },
    ],
    music: {
        userInVoice: true,
        mustMatchVoice: true 
    },
    execute: async function(m, [ query ], extras) {        
        const voice = VoiceGuild.orDefault(m.guild)
            .setChannel(m.channel)
            .setVoice(m.member?.voice.channel!)

        if (!voice) {
            return void m.channel.send({
                embeds: [
                    this.embedError(
                        m.author,
                        `Node Error`,
                        `A player for this guild could not be created, please try again later!`
                    )
                ]
            }).catch(noop)
        }

        const track = await this.manager.lavalink.search(m.author, {
            query: "speak:" + query, 
            source: "" as any
        })
        
        if (!track) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `TTS Failed`,
                    `Unknwon Error`
                )
            ]
        })
        .catch(noop)

        const title = voice.enqueue(track)

        if (title === null) {
            m.channel.send({
                embeds: [
                    this.embedError(
                        m.author,
                        `Load Error`,
                        `Could not find any song with given query: \`${query}\``
                    )
                ]
            })
                .catch(noop)
            return;
        }

        voice.tryPlay()

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `TTS added`,
                    `Successfully added \`${removeBackticks(title)}\` to the queue`
                )
            ]
        })
            .catch(noop)
    }
})