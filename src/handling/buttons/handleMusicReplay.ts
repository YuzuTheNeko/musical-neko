import { ButtonInteraction } from "discord.js";
import { TRACK_REPLAY } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (i.customId !== TRACK_REPLAY) return;

    if (!(await client.manager.playCommand.checkVoicePermissions(client, i, true))) return;
    
    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage()) return; 

    if (!(await voice.manageableBy(i.member, undefined, i))) return;
    
    voice.setPosition(voice.position)

    i.reply({
        embeds: [
            client.embedSuccess(
                i.user,
                `Replaying Now`,
                `Current track is being replayed!`
            )
        ]
    })
    .catch(noop)
}