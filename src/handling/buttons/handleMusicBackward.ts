import { ButtonInteraction } from "discord.js";
import { TRACK_BACKWARD } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (i.customId !== TRACK_BACKWARD) return;

    if (!(await client.manager.playCommand.checkVoicePermissions(client, i, true))) return;

    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage()) return;

    if (!(await voice.manageableBy(i.member, undefined, i))) return;
    
    const pos = voice.position - 1
    const last = await voice.getLastTrack()

    if (!last) {
        return i.reply({
            ephemeral: true,
            embeds: [
                client.embedError(
                    i.user,
                    `No Track Found`,
                    `There was no song prior to this one as far as I know`
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
                `Went back to prior played track ([${last.title}](${last.url}))!`
            )
        ]
    })
    .catch(noop)
}