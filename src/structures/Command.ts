import { ArgParser } from "arg-capturer";
import { APIApplicationCommand, APIApplicationCommandOption, APIApplicationCommandSubcommandOption, APIEmbedField, ApplicationCommandChoicesData, ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, EmbedBuilder, Interaction, InteractionResponseFields, Message, ModalSubmitInteraction, SelectMenuInteraction } from "discord.js";
import { VOICE_ERROR } from "../constants";
import { NekoClient } from "../core/NekoClient";
import log from "../functions/log";
import noop from "../functions/noop";
import separatePascalCase from "../functions/separatePascalCase";
import toTitleCase from "../functions/toTitleCase";
import { ArgType } from "../typings/enums/ArgType";
import { PlayerState } from "../typings/enums/PlayerState";
import { RejectArgReason } from "../typings/enums/RejectArgReason";
import { ArgData } from "../typings/interfaces/ArgData";
import { CommandData } from "../typings/interfaces/CommandData";

export type InteractionResolvable = (
    Interaction<'cached'> & InteractionResponseFields<'cached'>
) | ModalSubmitInteraction<'cached'> | ButtonInteraction<'cached'>


export class Command<Args extends [...ArgData[]] = ArgData[], Flags = {}> {
    constructor(
        readonly data: CommandData<Args, Flags>
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

    private rejectArgs(
        client: NekoClient,
        message: Message<true>,
        arg: ArgData,
        currentValue: string = '',
        reason: RejectArgReason 
    ): false {
        const embed = client.embedError(
            message.author,
            `Argument Exception`,
            reason === RejectArgReason.Choice ? `Given value did not match any of the possible choices` : 
            reason === RejectArgReason.Invalid ? `Given value is invalid for this argument type` :
            reason === RejectArgReason.Required ? `No value was given for a required argument` : 
            `Given value is not in the specified range of this arguments`
        )

        const fields: APIEmbedField[] = [
            {
                name: `Argument`,
                value: arg.name,
                inline: true 
            },
            
            {
                name: `Type`,
                inline: true,
                value: ArgType[arg.type]
            }
        ]

        if (arg.enum) {
            fields.push({
                inline: true,
                name: `Possible Choices`,
                value: Object.values(arg.enum).filter(c => isNaN(c)).join('\n')
            })
        }

        fields.push({
            inline: true,
            name: `Received`,
            value: currentValue.slice(0, 256) || `None given`
        })
        
        if (arg.min !== undefined || arg.max !== undefined) {
            fields.push({
                inline: true,
                name: `Range`,
                value: `${arg.min?.toLocaleString() ?? '?'} - ${arg.max?.toLocaleString() ?? `?`}`
            })
        }

        embed.addFields(fields)

        message.channel.send({
            embeds: [
                embed
            ]
        })
        .catch(noop)

        return false
    }

    async parseArgs(
        client: NekoClient,
        message: Message<true>,
        args: string[]
    ): Promise<false | unknown[]> {
        const arr = new Array<unknown>()

        if (!this.data.args?.length) return arr 

        for (let i = 0, len = this.data.args.length;i < len;i++) {
            const arg = this.data.args[i]
            let current = (i + 1 === len ? args.slice(i).join(' ') : args[i]) || await arg.default?.call(client, message)
            
            if (current !== undefined && typeof current !== 'string') {
                arr.push(current)
                continue
            }

            const reject = this.rejectArgs.bind(this, client, message, arg, current)

            if (arg.required && !current) {
                return reject(RejectArgReason.Required)
            }

            let data: any = current

            if (!data) {
                arr.push(null)
                continue
            }

            switch (arg.type) {
                case ArgType.Enum: {
                    const got = arg.enum![toTitleCase(data) as keyof typeof arg.enum]
                    if (got === undefined) return reject(RejectArgReason.Choice)
                    data = got 
                    break
                }
                
                case ArgType.String: {
                    break
                }

                case ArgType.Number: {
                    const parsed = arg.float ? Number(data) : parseInt(data)
                    if (isNaN(parsed)) return reject(RejectArgReason.Invalid)
                    if ((arg.min !== undefined && arg.min > parsed) || (arg.max !== undefined && arg.max < parsed)) {
                        return reject(RejectArgReason.Range)
                    } 

                    data = parsed
                    break
                }

                default:
                    break
            }

            arr.push(data)
        }

        return arr 
    }

    log(...args: unknown[]) {
        log('COMMAND', ...args)
    }
    
    async checkAllPermissions(client: NekoClient, m: Message<true>, sendMessage = false) {
        if (!(
            await this.checkOwnerPermissions(client, m, sendMessage) && 
            await this.checkVoicePermissions(client, m, sendMessage)
        )) return false 

        return true 
    }

    async checkOwnerPermissions(client: NekoClient, m: Message<true>, sendMessage: boolean) {
        if (this.data.owner && !client.config.owners.includes(m.author.id)) {
            if (sendMessage) {
                m.channel.send({
                    embeds: [
                        client.embedError(
                            m.author,
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

    private rejectVoice(client: NekoClient, m: Message<true> | InteractionResolvable, sendMessage: boolean, title: string, desc: string): false {
        if (sendMessage) {
            const embed = client.embedError(
                m instanceof Message ? m.author : m.user,
                title,
                desc
            )

            if (m instanceof Message) {
                m.channel.send({
                    embeds: [
                        embed
                    ] 
                })
                .catch(noop)
            } else {
                m.reply({
                    ephemeral: true,
                    embeds: [
                        embed
                    ] 
                })
                .catch(noop)
            }
        }

        return false
    }

    async checkVoicePermissions(client: NekoClient, m: Message<true> | InteractionResolvable, sendMessage: boolean) {
        const data = this.data.music
        const me = m.guild.members.me
        const reject = this.rejectVoice.bind(this, client, m, sendMessage)

        if (!data) return true 

        if (data.userInVoice && m.member?.voice.channelId === null) {
            return reject(  
                VOICE_ERROR,
                `You have to be connected to a voice channel first`
            )
        }

        if (data.mustMatchVoice && me?.voice.channelId && me.voice.channelId !== m.member?.voice.channelId) {
            return reject(
                VOICE_ERROR,
                `You have to be connected to ${me.voice.channel}`
            )
        }

        if (data.state !== undefined) {
            const voice = client.manager.lavalink.guild(m.guildId)
            if (!voice) {
                return reject(
                    VOICE_ERROR,
                    `I have to be connected to a voice channel in order to perform this action`
                )
            }

            if (!data.state.includes(voice.status)) {
                return reject(
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
            }
        }

        if (data.validator) {
            const got = await data.validator.call(client, m, sendMessage)
            if (!got) return got 
        }

        return true 
    }
}