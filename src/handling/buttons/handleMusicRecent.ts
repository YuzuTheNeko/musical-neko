import { ButtonInteraction } from "discord.js";
import { TRACK_FIRST, TRACK_FORWARD, TRACK_LAST } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (i.customId !== TRACK_FIRST) return;

    if (!(await client.manager.playCommand.checkVoicePermissions(client, i, true))) return;

    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage()) return;

    if (!(await voice.manageableBy(i.member, undefined, i))) return;
    
    voice.setPosition(0)

    i.reply({
        embeds: [
            client.embedSuccess(
                i.user,
                `Player Moved`,
                `Successfully moved the player to the first track in the queue!`
            )
        ]
    })
    .catch(noop)
}