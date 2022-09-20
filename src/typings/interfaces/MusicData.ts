import { ChatInputCommandInteraction, Message } from "discord.js"
import { NekoClient } from "../../core/NekoClient"
import { InteractionResolvable } from "../../structures/Command"
import { PlayerState } from "../enums/PlayerState"

export interface MusicData {
    /**
     * The user must be in a voice channel.
     */
    userInVoice?: boolean

    /**
     * The bot has to be in a voice channel, this is optional if the bot is in no voice channel.
     */
    botInVoice?: boolean

    /**
     * Whether the bot and user voice channel must be the same one.
     */
    mustMatchVoice?: boolean

    /**
     * States of the player where this operation can be performed.
     */
    state?: PlayerState[]

    /**
     * A custom validator.
     */
    validator?: (this: NekoClient, command: Message<true> | InteractionResolvable, sendMessage: boolean) => boolean | Promise<boolean>
}