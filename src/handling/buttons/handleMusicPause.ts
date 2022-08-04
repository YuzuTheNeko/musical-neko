import { ButtonInteraction } from "discord.js";
import { TRACK_PAUSE } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (i.customId !== TRACK_PAUSE) return;

    if (!(await client.manager.playCommand.checkVoicePermissions(client, i, true))) return;

    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage()) return; 

    if (!voice.manageableBy(i.member, undefined, i)) return;

    i.reply({
        embeds: [
            voice.isPaused() ? (
                voice.resume(),
                client.embedSuccess(
                    i.user,
                    `Track Resumed`,
                    `The track has successfully been resumed!`
                )
            ) : (
                voice.pause(),
                client.embedSuccess(
                    i.user,
                    `Track Paused`,
                    `The track has successfully been paused!`
                )
            )
        ]
    })
    .catch(noop)
}