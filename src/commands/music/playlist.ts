import { PLAYLIST_BACK, PLAYLIST_NEXT } from "../../constants";
import displayQueuePage from "../../functions/displayQueuePage";
import noop from "../../functions/noop";
import toTitleCase from "../../functions/toTitleCase";
import { Command } from "../../structures/Command";
import { ArgType } from "../../typings/enums/ArgType";

export default new Command({
    name: `playlist`,
    description: `Gets all songs in a playlist`,
    args: [
        {
            name: `name`,
            description: `playlist name`,
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

        displayQueuePage(
            this,
            m,
            playlist.songs,
            1,
            `Custom Playlist \`${toTitleCase(playlist.name)}\``,
            PLAYLIST_BACK(m.author.id, name, 1),
            PLAYLIST_NEXT(m.author.id, name, 1),
            false 
        )
    }
})