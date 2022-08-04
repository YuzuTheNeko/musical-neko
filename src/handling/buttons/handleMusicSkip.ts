import { count } from "console";
import { ButtonInteraction } from "discord.js";
import { TRACK_SKIP } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";
import { CountType } from "../../typings/enums/CountType";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (i.customId !== TRACK_SKIP) return;

    if (!(await client.manager.playCommand.checkVoicePermissions(client, i, true))) return;

    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage()) return;

    const counter = voice.skipCounter
    if (counter.includes(i.user.id)) {
        return void i.reply({
            ephemeral: true,
            embeds: [
                client.embedError(
                    i.user,
                    `Skip Error`,
                    `You have already voted to skip this song.`
                )
            ]
        })
        .catch(noop)
    }

    counter.push(i.user.id)
    voice["onCounterUpdate"](CountType.Skip, counter)

    i.reply({
        embeds: [
            client.embedSuccess(
                i.user,
                `Vote Success`,
                `Successfully voted for skipping this track.`
            )
        ]
    })
    .catch(noop)
}