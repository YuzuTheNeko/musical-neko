import { ChatInputCommandInteraction, Message } from "discord.js";
import { NekoClient } from "../../core/NekoClient";
import { ArgType } from "../enums/ArgType";
import { EnumLike } from "../types/EnumLike";
import { Method } from "../types/Method";
import { UnwrapArgType } from "../types/Unwrap";

export type DefaultMethod<Type extends ArgType, Enum extends EnumLike, Choices extends string[]> = (this: NekoClient, m: Message<true>) => UnwrapArgType<Type, Enum, Choices> | null 

export interface ArgData<Type extends ArgType = ArgType, Required extends boolean = boolean, Enum extends EnumLike = EnumLike, Choices extends string[] = string[]> {
    name: string
    description: string
    type: Type
    autocomplete?: boolean
    enum?: Enum
    choices?: Choices
    enumValues?: 'string' | 'number'
    required?: Required
    default?: DefaultMethod<Type, Enum, Choices>
}