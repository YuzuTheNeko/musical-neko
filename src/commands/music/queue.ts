import displayQueuePage from "../../functions/displayQueuePage";
import noop from "../../functions/noop";
import { Command } from "../../structures/Command";

export default new Command({
    name: `queue`,
    aliases: [
        `q`
    ],
    description: `Gets song queue`,
    music: {
        botInVoice: true
    },
    execute: async function(m) {
        const voice = this.manager.lavalink.guild(m.guildId)
        if (!voice) return;

        const tracks = voice.queue 
        if (!tracks.length) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `Queue Failed`,
                    `No song in the queue!`
                )
            ]
        })
        .catch(noop)

        displayQueuePage(
            this,
            m,
            voice.queue,
            1
        )
    }
})