import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, Message } from "discord.js";
import { CoffeeTrack } from "lavacoffee";
import { QUEUE_BACK, QUEUE_NEXT } from "../constants";
import { NekoClient } from "../core/NekoClient";
import noop from "./noop";

export default function(
    client: NekoClient,
    i: ButtonInteraction<'cached'> | Message<true>,
    tracks: CoffeeTrack[],
    page: number
) {
    const pageCount = Math.floor(tracks.length / 10) + 1
    const user = i instanceof Message ? i.author : i.user

    const embed = client.embedSuccess(
        user,
        `${i.guild.name} Song Queue`,
        tracks.slice(page * 10 - 10, page * 10).map(
            (track, y) => `**\`[${page * 10 - 10 + y + 1}]\`** [${track.title}](${track.url}) (Requested by ${track.requester})`
        ).join('\n') || 'Nothing to display'
    )

    const rows = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder({
            label: `◀️`,
            type: ComponentType.Button,
            disabled: page === 1,
            style: ButtonStyle.Primary,
            custom_id: QUEUE_BACK(user.id, page)
        }),
        new ButtonBuilder({
            label: `▶️`,
            style: ButtonStyle.Primary,
            type: ComponentType.Button,
            custom_id: QUEUE_NEXT(user.id, page),
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