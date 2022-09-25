import { ButtonInteraction } from "discord.js";
import { PLAYLIST_BACK, PLAYLIST_BACK_ID, PLAYLIST_NEXT, PLAYLIST_NEXT_ID, QUEUE_BACK, QUEUE_BACK_ID, QUEUE_NEXT, QUEUE_NEXT_ID } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import displayQueuePage from "../../functions/displayQueuePage";
import noop from "../../functions/noop";
import toTitleCase from "../../functions/toTitleCase";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (![
        PLAYLIST_NEXT_ID,
        PLAYLIST_BACK_ID
    ].some(c => i.customId.includes(c)) || !i.customId.includes(i.user.id)) return;

    const [
        ,
        action,
        name,
        raw
    ] = i.customId.split(/_/)

    const p = Number(raw)

    const playlist = client.manager.db.get('customPlaylists', [
        {
            column: 'name',
            equals: name,
            and: true 
        },
        {
            column: 'userID',
            equals: i.user.id
        }
    ])

    if (!playlist.name || !playlist.songs.length) return i.reply({
        ephemeral: true, 
        embeds: [
            client.embedError(
                i.user,
                `Load Failed`,
                `Given custom playlist name does not exist or is empty.`
            )
        ]
    })
    .catch(noop)

    const page = action === 'back' ? p - 1 : p + 1

    displayQueuePage(
        client,
        i,
        playlist.songs,
        page,
        `Custom Playlist \`${toTitleCase(playlist.name)}\``,
        PLAYLIST_BACK(i.user.id, name, page),
        PLAYLIST_NEXT(i.user.id, name, page),
        false 
    )
}