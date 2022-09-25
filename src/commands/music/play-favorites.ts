import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { VoiceGuild } from "../../structures/VoiceGuild";
import { FavoriteSongData } from "../../typings/interfaces/FavoriteSongData";

export default new Command({
    name: `play-favorites`,
    aliases: [
        "pf"
    ],
    description: `Add all favorited songs to the queue`,
    music: {
        userInVoice: true,
        mustMatchVoice: true 
    },
    execute: async function(m) {
        const favorites = this.manager.db.all('favoriteSongs', {
            where: {
                column: 'userID',
                equals: m.author.id
            }
        }) as unknown as FavoriteSongData[]

        if (!favorites.length) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `Load Failed`,
                    `You have no favorited songs to add.`
                )
            ]
        })
        .catch(noop)

        const voice = VoiceGuild.orDefault(m.guild)
        .setChannel(m.channel)
        .setVoice(m.member?.voice.channel!)

        if (!voice) {
            return void m.channel.send({
                embeds: [
                    this.embedError(
                        m.author,
                        `Node Error`,
                        `A player for this guild could not be created, please try again later!`
                    )
                ]
            }).catch(noop)
        }

        voice.queue.push(...favorites)
        await voice.tryPlay()
        m.channel.send({
            embeds: [
                this.embedSuccess(
                    m.author,
                    `Load Success`,
                    `Successfully added ${favorites.length} favorited songs to the queue`
                )
            ]
        })
        .catch(noop)
    }
})