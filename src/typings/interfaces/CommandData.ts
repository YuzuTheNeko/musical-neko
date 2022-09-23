import { ArgParser } from "arg-capturer"
import { ChatInputCommandInteraction, Message } from "discord.js"
import { NekoClient } from "../../core/NekoClient"
import { UnwrapArgDataTuple } from "../types/Unwrap"
import { ArgData } from "./ArgData"
import { ExtrasData } from "./ExtrasData"
import { MusicData } from "./MusicData"

/**
 * Represents a command's data.
 */
export interface CommandData<Args extends [...ArgData[]], Flags = {}> {
    name: string 
    description: string
    flags?: ArgParser<Flags>
    aliases?: string[]
    category?: string
    args?: [...Args]
    music?: MusicData

    owner?: boolean
    
    execute: (this: NekoClient, m: Message<true>, args: UnwrapArgDataTuple<Args>, extras: ExtrasData<Args, Partial<Flags>>) => Promise<void> | void  
}