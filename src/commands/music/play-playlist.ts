import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { VoiceGuild } from "../../structures/VoiceGuild";
import { ArgType } from "../../typings/enums/ArgType";
import { FavoriteSongData } from "../../typings/interfaces/FavoriteSongData";

export default new Command({
    name: `play-playlist`,
    aliases: [
        "pp"
    ],
    description: `Add all songs in a custom playlist to the queue`,
    music: {
        userInVoice: true,
        mustMatchVoice: true 
    },
    args: [
        {
            name: `playlist name`,
            description: `The custom playlist name to load`,
            required: true,
            type: ArgType.String
        }
    ],
    execute: async function(m, [ name ]) {
        const playlist = this.manager.db.get('customPlaylists', [
            {
                column: 'name',
                equals: name,
                and: true 
            },
            {
                column: 'userID',
                equals: m.author.id
            }
        ])

        if (!playlist.name || !playlist.songs.length) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `Load Failed`,
                    `Given custom playlist name does not exist or is empty.`
                )
            ]
        })
        .catch(noop)

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

        voice.queue.push(...playlist.songs)
        await voice.tryPlay()
        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `Load Success`,
                    `Successfully added ${playlist.songs.length} songs to the queue`
                )
            ]
        })
        .catch(noop)
    }
})