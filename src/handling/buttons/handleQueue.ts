import { ButtonInteraction } from "discord.js";
import { QUEUE_BACK, QUEUE_BACK_ID, QUEUE_NEXT, QUEUE_NEXT_ID } from "../../constants";
import { NekoClient } from "../../core/NekoClient";
import displayQueuePage from "../../functions/displayQueuePage";

export default async function(client: NekoClient, i: ButtonInteraction<'cached'>) {
    if (![
        QUEUE_BACK_ID,
        QUEUE_NEXT_ID
    ].some(c => i.customId.includes(c)) || !i.customId.includes(i.user.id)) return;

    const voice = client.manager.lavalink.guild(i.guild.id)
    if (!voice) return;

    const [
        ,
        action,
        raw
    ] = i.customId.split(/_/)

    const p = Number(raw)

    displayQueuePage(
        client,
        i,
        voice.queue,
        action === 'back' ? p - 1 : p + 1 
    )
}