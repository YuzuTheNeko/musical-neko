import { ChatInputCommandInteraction } from "discord.js"
import { NekoClient } from "../../core/NekoClient"
import { UnwrapArgDataTuple } from "../types/Unwrap"
import { ArgData } from "./ArgData"
import { ExtrasData } from "./ExtrasData"
import { MusicData } from "./MusicData"

/**
 * Represents a command's data.
 */
export interface CommandData<Args extends [...ArgData[]]> {
    name: string 
    description: string
    aliases?: string[]
    category?: string
    args?: [...Args]
    music?: MusicData

    owner?: boolean
    
    execute: (this: NekoClient, interaction: ChatInputCommandInteraction<'cached'>, args: UnwrapArgDataTuple<Args>, extras: ExtrasData<Args>) => Promise<void> | void  
}