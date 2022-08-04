import { NewsChannel, VoiceState } from "discord.js";
import { NekoClient } from "../core/NekoClient";

export default function(client: NekoClient, oldState: VoiceState, newState: VoiceState) {
    if (oldState.id !== client.user.id) return;

    const guild = client.manager.lavalink.guild(oldState.guild.id)
    if (!guild) return;

    // If client was disconnected
    if (oldState.channelId !== null && newState.channelId === null) {
        guild.destroy()
    }
}