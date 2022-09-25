import { MAX_CUSTOM_PLAYLISTS } from "../../constants";
import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { VoiceGuild } from "../../structures/VoiceGuild";
import { ArgType } from "../../typings/enums/ArgType";

export default new Command({
    name: `save-queue`,
    description: `Saves this queue in a new (or existing) custom playlist`,
    args: [
        {
            name: `playlist name`,
            description: `The playlist to save this to`,
            required: true,
            type: ArgType.String,
            max: 48
        }
    ],
    music: {
        userInVoice: true,
        mustMatchVoice: true 
    },
    execute: async function(m, [ name ]) {
        const voice = VoiceGuild.orDefault(m.guild)
        if (!voice.queue.length) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `Save Failed`,
                    `The queue is empty...`
                )
            ]
        })
        .catch(noop)

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

        let exists = true 

        if (!playlist.userID) {
            const count = this.manager.db.getRowCount('customPlaylists', {
                where: [
                    {
                        column: 'name',
                        equals: name,
                        and: true 
                    },
                    {
                        column: 'userID',
                        equals: m.author.id
                    }
                ]
            })

            if (count >= MAX_CUSTOM_PLAYLISTS) return void m.channel.send({
                embeds: [
                    this.embedError(
                        m.author,
                        `Save Failed`,
                        `You have reached max number of playlists.`
                    )
                ]
            })
            .catch(noop)

            exists = false
            
            playlist.name = name
            playlist.userID = m.author.id
            playlist.createdAt = Date.now()
            playlist.songs = voice.toRawSongs(m.author)
        } else {
            playlist.songs.push(...voice.toRawSongs(m.author))
        }

        this.manager.db.upsert('customPlaylists', playlist, [
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

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `Playlist ${exists ? `Updated` : `Created`}`,
                    `Added ${voice.queue.length.toLocaleString()} songs to playlist \`${playlist.name}\`!`
                )
            ]
        })
    }
})