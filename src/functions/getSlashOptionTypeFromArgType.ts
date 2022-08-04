import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from "discord.js";
import { ArgType } from "../typings/enums/ArgType";
import { ArgData } from "../typings/interfaces/ArgData";
import { EnumLike } from "../typings/types/EnumLike";

export default function(type: ArgType, en?: ArgData["enumValues"]): APIApplicationCommandBasicOption["type"] {
    return type === ArgType.Number ? ApplicationCommandOptionType.Number : 
        type === ArgType.String ? ApplicationCommandOptionType.String : 
        type === ArgType.Enum ? en === 'string' ? ApplicationCommandOptionType.String : ApplicationCommandOptionType.Number :       
        null as never
}