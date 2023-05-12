import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, Message, userMention } from "discord.js";
import { QUEUE_BACK, QUEUE_NEXT } from "../constants";
import { NekoClient } from "../core/NekoClient";
import { RawSongData } from "../typings/interfaces/RawSongData";
import noop from "./noop";
import { MoonlinkTrack } from "moonlink.js";

type Fn = (id: string, page: number) => string

export default function(
    client: NekoClient,
    i: ButtonInteraction<'cached'> | Message<true>,
    tracks: (MoonlinkTrack | RawSongData)[],
    page: number,
    name?: string,
    backCustomId?: string,
    nextCustomId?: string,
    showRequested = true 
) {
    const pageCount = Math.floor(tracks.length / 10) + 1
    const user = i instanceof Message ? i.author : i.user

    const embed = client.embedSuccess(
        user,
        name ?? `${i.guild.name} Song Queue`,
        tracks.slice(page * 10 - 10, page * 10).map(
            (track, y) => `**\`[${page * 10 - 10 + y + 1}]\`** [${track.title}](${track.url})${showRequested ? ` (Requested by ${track instanceof MoonlinkTrack ? userMention(track.requester) : `<@${track.userID}>`})` : ''}`
        ).join('\n') || 'Nothing to display'
    )

    const rows = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder({
            label: `◀️`,
            type: ComponentType.Button,
            disabled: page === 1,
            style: ButtonStyle.Primary,
            custom_id: backCustomId ?? QUEUE_BACK(user.id, page)
        }),
        new ButtonBuilder({
            label: `▶️`,
            style: ButtonStyle.Primary,
            type: ComponentType.Button,
            custom_id: nextCustomId ?? QUEUE_NEXT(user.id, page),
            disabled: page === pageCount
        })
    )

    embed.setFooter({
        text: `Page ${page} / ${pageCount || 1}`
    })

    if (i instanceof Message) {
        i.channel.send({
            embeds: [
                embed
            ],
            components: [ rows ]
        }).catch(noop)
    } else {
        i.update({
            embeds: [
                embed
            ],
            components: [ rows ]
        })
        .catch(noop)
    }
}