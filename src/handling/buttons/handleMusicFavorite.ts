import { ButtonInteraction } from "discord.js";
import { InsertDataResolvable, SqliteWhereOption } from "rhino.db";
import { MAX_FAVORITED_SONGS, TRACK_FAVORITE } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";
import { FavoriteSongData } from "../../typings/interfaces/FavoriteSongData";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (i.customId !== TRACK_FAVORITE) return;
    
    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage() || !(await voice.getCurrentTrack())) return;

    const track = (await voice.getCurrentTrack())!

    const has = client.manager.db.get('favoriteSongs', [
        {
            column: 'userID',
            equals: i.user.id,
            and: true
        },
        {
            column: 'url',
            equals: track.url
        }
    ])

    if (has.userID !== null) {
        client.manager.db.delete('favoriteSongs', {
            where: [
                {
                    column: 'userID',
                    equals: i.user.id,
                    and: true 
                },
                {
                    column: `url`,
                    equals: track.url
                }
            ]
        })
        return i.reply({
            content: `Removed this song from your favorite list!`
        })
        .catch(noop)
    }

    const count = client.manager.db.getRowCount('favoriteSongs', {
        where: {
            column: 'userID',
            equals: i.user.id 
        }
    })

    if (count >= MAX_FAVORITED_SONGS) return i.reply({
        ephemeral: true,
        content: `You cannot add more songs to your list.`
    })
    .catch(noop)

    const data: FavoriteSongData = {
        favoritedAt: Date.now(),
        title: track.title,
        url: track.url,
        userID: i.user.id 
    }

    client.manager.db.insert('favoriteSongs', data as unknown as InsertDataResolvable)
    i.reply({
        content: `Successfully added this song to your favorite list`
    })
    .catch(noop)
}