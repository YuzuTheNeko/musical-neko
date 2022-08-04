import { ButtonInteraction } from "discord.js";
import { TRACK_FORWARD, TRACK_LAST } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (i.customId !== TRACK_FORWARD) return;

    if (!(await client.manager.playCommand.checkVoicePermissions(client, i, true))) return;

    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage()) return;

    if (!voice.manageableBy(i.member, undefined, i)) return;
    
    const pos = voice.position + 1
    const next = voice.getNextTrack()

    if (!next) {
        return i.reply({
            ephemeral: true,
            embeds: [
                client.embedError(
                    i.user,
                    `No Track Found`,
                    `There is no next song as far as I know`
                )
            ]
        })
        .catch(noop)
    }

    voice.setPosition(pos)
    i.reply({
        embeds: [
            client.embedSuccess(
                i.user,
                `Track Found`,
                `Forwarded one track! ([${next.title}](${next.url}))!`
            )
        ]
    })
    .catch(noop)
}