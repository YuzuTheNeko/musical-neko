import { ActionRowBuilder, ComponentType, SelectMenuBuilder } from "discord.js";
import { MAX_FAVORITED_SONGS } from "../../constants";
import noop from "../../functions/noop";
import removeBackticks from "../../functions/removeBackticks";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";
import { CustomPlaylistData } from "../../typings/interfaces/CustomPlaylistData";
import { FavoriteSongData } from "../../typings/interfaces/FavoriteSongData";

export default new Command({
    name: `remove-playlist-song`,
    aliases: [
        'rps'
    ],
    description: `Removes a song from a custom playlist`,
    args: [
        {
            name: `name`,
            description: `playlist name`,
            required: true,
            type: ArgType.String
        },
        {
            name: `index`,
            description: `position of the song in the list, can be found using \`playlist\` command`,
            required: true,
            type: ArgType.Number
        }
    ],
    execute: async function(m, [ name, index ]) {
        const playlist = this.manager.db.get('customPlaylists', [
            {
                column: 'userID',
                equals: m.author.id,
                and: true 
            }, 
            {
                column: 'name',
                equals: name
            }
        ])

        if (!playlist.name || !playlist.songs.length) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `Retrieval Failed`,
                    `Given playlist does not exist or is empty`
                )
            ]
        })
        .catch(noop)

        const song = playlist.songs[index - 1]
        if (!song) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `Removal Failed`,
                    `Song not found at given index`
                )
            ]
        })
        .catch(noop)

        playlist.songs.splice(index - 1, 1)

        this.manager.db.upsert('customPlaylists', playlist, [
            {
                column: 'userID',
                equals: m.author.id,
                and: true 
            },
            {
                column: 'name',
                equals: name
            }
        ])

        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `Playlist Updated`,
                    `Successfully removed \`${removeBackticks(song.title)}\` from the custom playlist!`
                )
            ]
        })
        .catch(noop)
    }
})