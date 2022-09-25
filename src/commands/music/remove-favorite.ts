import { ActionRowBuilder, ComponentType, SelectMenuBuilder } from "discord.js";
import { MAX_FAVORITED_SONGS } from "../../constants";
import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { FavoriteSongData } from "../../typings/interfaces/FavoriteSongData";

export default new Command({
    name: `remove-favorite`,
    aliases: [
        'rf'
    ],
    description: `Removes a favorited song!`,
    execute: async function(m) {
        const songs = this.manager.db.all('favoriteSongs', {
            where: {
                column: 'userID',
                equals: m.author.id
            }
        }) as unknown as FavoriteSongData[]

        if (!songs.length) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `Retrieval Failed`,
                    `You have no favorited songs to load`
                )
            ]
        })
        .catch(noop)

        const id = `delete_favorite_song_menu` as const

        const menu = new SelectMenuBuilder()
        .setCustomId(id)
        .setMinValues(1)
        .setMaxValues(songs.length)
        .setPlaceholder(`Select songs to remove...`)
        .setOptions(songs.map(
            (x, y) => ({
                label: x.title,
                value: y.toString(),
                description: `Song liked ${
                    this.manager.parser.parseToString(
                        Date.now() - x.favoritedAt, {
                            and: true,
                            limit: 2 
                        }
                    )
                } ago`
            })
        ))

        const embed = this.embedSuccess(
            m.author,
            `Liked Songs Removal`,
            `Select the songs to remove from your favorite list!`
        )
        embed.setFooter({
            text: `This will expire in a minute.`
        })

        const msg = await m.channel.send({
            embeds: [
                embed
            ],
            components: [
                new ActionRowBuilder<SelectMenuBuilder>().addComponents(menu)
            ]
        })
        .catch(noop)

        if (!msg) return;

        const got = await msg.awaitMessageComponent({
            componentType: ComponentType.SelectMenu,
            time: 60000,
            filter: i => i.user.id === m.author.id && i.customId === id 
        })
        .catch(noop)

        if (!got) {
            embed.setColor('Red')
            .setDescription(`You did not select anything within the time range...`)
            .setFooter(null)
            msg.edit({
                embeds: [
                    embed
                ],
                components: []
            })
            .catch(noop)
            return;
        }

        const deleted = got.values.map(c => songs[Number(c)])
        this.manager.db.delete('favoriteSongs', {
            where: {
                column: 'url',
                in: deleted.map(c => c.url)
            }
        })

        got.update({
            components: [],
            embeds: [
                embed.setColor('Green')
                .setDescription(`Sucessfully deleted ${deleted.length} songs from your favorite list!`)
                .setFooter(null)
            ]
        })
        .catch(noop)
    }
})