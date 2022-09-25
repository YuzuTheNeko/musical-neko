import { ActionRowBuilder, ComponentType, SelectMenuBuilder } from "discord.js";
import { MAX_FAVORITED_SONGS } from "../../constants";
import noop from "../../functions/noop";
import { Command } from "../../structures/Command";
import { CustomPlaylistData } from "../../typings/interfaces/CustomPlaylistData";
import { FavoriteSongData } from "../../typings/interfaces/FavoriteSongData";

export default new Command({
    name: `remove-playlist`,
    aliases: [
        'rp'
    ],
    description: `Removes a custom playlist`,
    execute: async function(m) {
        const playlists = this.manager.db.all('customPlaylists', {
            where: {
                column: 'userID',
                equals: m.author.id
            }
        }) as unknown as CustomPlaylistData[]

        if (!playlists.length) return void m.channel.send({
            embeds: [
                this.embedError(
                    m.author,
                    `Retrieval Failed`,
                    `You have no custom playlists to load`
                )
            ]
        })
        .catch(noop)

        const id = `delete_custom_playlist_menu` as const

        const menu = new SelectMenuBuilder()
        .setCustomId(id)
        .setMinValues(1)
        .setMaxValues(playlists.length)
        .setPlaceholder(`Select playlists to remove...`)
        .setOptions(playlists.map(
            (x, y) => ({
                label: x.name,
                value: y.toString(),
                description: `Playlist created ${
                    this.manager.parser.parseToString(
                        Date.now() - x.createdAt, {
                            and: true,
                            limit: 2 
                        }
                    )
                } ago`
            })
        ))

        const embed = this.embedSuccess(
            m.author,
            `Custom Playlists Removal`,
            `Select the playlists to remove from your custom playlists!`
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

        const deleted = got.values.map(c => playlists[Number(c)])
        this.manager.db.delete('customPlaylists', {
            where: {
                column: 'name',
                in: deleted.map(c => c.name)
            }
        })

        got.update({
            components: [],
            embeds: [
                embed.setColor('Green')
                .setDescription(`Sucessfully deleted ${deleted.length} playlists from your custom playlists!`)
                .setFooter(null)
            ]
        })
        .catch(noop)
    }
})