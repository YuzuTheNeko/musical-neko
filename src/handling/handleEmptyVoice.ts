import { VoiceState } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import noop from "../functions/noop";

export default function(client: NekoClient, oldState: VoiceState, newState: VoiceState) {
    const voice = client.manager.lavalink.guild(newState.guild.id)
    if (!voice) return;
    const members = (oldState.channel ?? newState.channel)!.members.filter(c => !c.user.bot)
    if (!members.size) {
        voice.send(
            client.embedError(
                newState.member!.user,
                `Voice Empty`,
                `I've left the voice channel due to it being empty.`
            )
        )
        .catch(noop)
        voice.destroy()
    }
}