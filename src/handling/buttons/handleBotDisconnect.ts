import { count } from "console";
import { ButtonInteraction } from "discord.js";
import { BOT_DISCONNECT, TRACK_SKIP } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import noop from "../../functions/noop";
import { VoiceGuild } from "../../structures/VoiceGuild";
import { CountType } from "../../typings/enums/CountType";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (i.customId !== BOT_DISCONNECT) return;

    if (!(await client.manager.playCommand.checkVoicePermissions(client, i, true))) return;

    const voice = VoiceGuild.orDefault(i.guild)

    if (!voice.hasMessage()) return;
    
    voice.destroy()
    i.reply({
        embeds: [
            client.embedSuccess(
                i.user,
                `Disconnected`,
                `Successfully disconnected from voice channel.`
            )
        ]
    })
    .catch(noop)
}