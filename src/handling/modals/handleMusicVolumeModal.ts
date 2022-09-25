import { ModalSubmitInteraction, TextInputModalData } from "discord.js";
import { MAX_VOLUME, MIN_VOLUME, TRACK_VOLUME_MODAL } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";

export default async function(client: NekoClient, i: ModalSubmitInteraction<'cached'>) {
    if (i.customId !== TRACK_VOLUME_MODAL) return;

    if (!(await client.manager.playCommand.checkVoicePermissions(client, i, true))) return;

    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage()) return; 

    if (!(await voice.manageableBy(i.member, undefined, i))) return;
        
    const n = Number((i.components[0].components[0] as TextInputModalData).value)
    if (!voice.setVolume(n)) {
        return i.reply({
            ephemeral: true,
            embeds: [
                client.embedError(
                    i.user,
                    `Volume Error`,
                    `Given volume must be in between ${MIN_VOLUME} and ${MAX_VOLUME} and be a valid number.`
                )
            ]
        })
        .catch(noop)
    }

    return i.reply({
        embeds: [
            client.embedSuccess(
                i.user,
                `Volume Changed`,
                `Successfully set volume to \`${n}\`!`
            )
        ]
    })
    .catch(noop)
}