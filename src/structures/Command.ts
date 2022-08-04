import { ArgParser } from "arg-capturer";
import cast from "dbdts.db/dist/functions/cast";
import { APIApplicationCommand, APIApplicationCommandOption, APIApplicationCommandSubcommandOption, ApplicationCommandChoicesData, ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction } from "discord.js";
import { VOICE_ERROR } from "../constants";
import { NekoClient } from "../core/NekoClient";
import getSlashOptionTypeFromArgType from "../functions/getSlashOptionTypeFromArgType";
import log from "../functions/log";
import noop from "../functions/noop";
import separatePascalCase from "../functions/separatePascalCase";
import { PlayerState } from "../typings/enums/PlayerState";
import { ArgData } from "../typings/interfaces/ArgData";
import { CommandData } from "../typings/interfaces/CommandData";

export type InteractionResolvable = ModalSubmitInteraction<'cached'> | ChatInputCommandInteraction<'cached'> | ButtonInteraction<'cached'>

export class Command<Args extends [...ArgData[]] = ArgData[]> {
    constructor(
        readonly data: CommandData<Args>
    ) {}

    get execute() {
        return this.data.execute
    }

    get args() {
        return this.data.args
    }

    get category() {
        return this.data.category!
    }

    get name() {
        return this.data.name
    }

    get description() {
        return this.data.description
    }

    isOwnerCategory() {
        return this.category === 'developer'
    }

    hasArgs() {
        return !!this.data.args?.length
    }

    asSlashOption(): APIApplicationCommandSubcommandOption {
        return {
            type: ApplicationCommandOptionType.Subcommand,
            name: this.name,
            description: this.description,
            options: this.hasArgs() ? this.args!.map(arg => {
                const option = {
                    name: arg.name,
                    autocomplete: arg.autocomplete,
                    required: arg.required ?? false,
                    description: arg.description,
                    type: getSlashOptionTypeFromArgType(arg.type, arg.enumValues),
                    choices: arg.enum !== undefined ? Object.keys(arg.enum).filter(c => isNaN(Number(c))).map(key => {
                        const value = arg.enum![key]
                        return {
                            name: separatePascalCase(key),
                            value
                        } as ApplicationCommandOptionChoiceData
                    }) : undefined,
                } as Exclude<APIApplicationCommandSubcommandOption["options"], undefined>[number]

                return option 
            }) : []
        }
    }

    log(...args: unknown[]) {
        log('COMMAND', ...args)
    }
    
    async checkAllPermissions(client: NekoClient, i: InteractionResolvable, sendMessage = false) {
        if (!(
            await this.checkOwnerPermissions(client, i, sendMessage) && 
            await this.checkVoicePermissions(client, i, sendMessage)
        )) return false 

        return true 
    }

    async checkOwnerPermissions(client: NekoClient, i: InteractionResolvable, sendMessage: boolean) {
        if (this.data.owner && !client.config.owners.includes(i.user.id)) {
            if (sendMessage) {
                i.reply({
                    ephemeral: true,
                    embeds: [
                        client.embedError(
                            i.user,
                            `Owner Only Command`,
                            `This command can only be used by the owners of this bot!`
                        )
                    ]
                })
                .catch(noop)
            }

            return false 
        }

        return true 
    }

    async checkVoicePermissions(client: NekoClient, i: InteractionResolvable, sendMessage: boolean) {
        const data = this.data.music
        const me = i.guild.members.me

        if (!data) return true 

        if (data.userInVoice && i.member.voice.channelId === null) {
            if (sendMessage) {
                i.reply({
                    ephemeral: true,
                    embeds: [
                        client.embedError(
                            i.user,
                            VOICE_ERROR,
                            `You have to be connected to a voice channel first`
                        )
                    ] 
                })
                .catch(noop)
            }

            return false
        }

        if (data.mustMatchVoice && me?.voice.channelId && me.voice.channelId !== i.member.voice.channelId) {
            if (sendMessage) {
                i.reply({
                    embeds: [
                        client.embedError(
                            i.user,
                            VOICE_ERROR,
                            `You have to be connected to ${me.voice.channel}`
                        )
                    ],
                    ephemeral: true 
                })
                .catch(noop)
            }

            return false
        }

        if (data.state !== undefined) {
            const voice = client.manager.lavalink.guild(i.guildId)
            if (!voice) {
                if (sendMessage) {
                    i.reply({
                        ephemeral: true,
                        embeds: [
                            client.embedError(
                                i.user,
                                VOICE_ERROR,
                                `I have to be connected to a voice channel in order to perform this action`
                            )
                        ]
                    })
                    .catch(noop)
                }
                return false 
            }

            if (!data.state.includes(voice.status)) {
                if (sendMessage) {
                    i.reply({
                        ephemeral: true,
                        embeds: [
                            client.embedError(
                                i.user,
                                VOICE_ERROR,
                                `The voice player has to be ${
                                    data.state.length === 1 ? 
                                        `\`${PlayerState[data.state[0]].toLowerCase()}\`` :
                                        `in one of these states: ${
                                            data.state.map(
                                                state => PlayerState[state].toLowerCase()
                                            ).join(', ')
                                        }`
                                } in order to perform this action!`
                            )
                        ] 
                    }) 
                    .catch(noop)
                }

                return false 
            }
        }

        if (data.validator) {
            const got = await data.validator.call(client, i, sendMessage)
            if (!got) return got 
        }

        return true 
    }
}