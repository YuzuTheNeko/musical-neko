import { ChatInputCommandInteraction } from "discord.js";
import { NekoClient } from "../core/NekoClient";
import { ArgType } from "../typings/enums/ArgType";
import { ArgData } from "../typings/interfaces/ArgData";
import { UnwrapArgDataTuple } from "../typings/types/Unwrap";

export default function<T extends [...ArgData[]]>(args: [...T] | undefined, interaction: ChatInputCommandInteraction): UnwrapArgDataTuple<T> {
    const resolver = interaction.options

    const arr = new Array(args?.length ?? 0) as UnwrapArgDataTuple<T>

    if (!args?.length) return arr 

    for (let i = 0, len = args.length;i < len;i++) {
        const { name, required = false, ...arg } = args[i]

        let v: unknown = null 

        switch (arg.type) {
            case ArgType.Number: {
                v = resolver.getNumber(name, required);
                break
            }
            
            case ArgType.String: {
                v = resolver.getString(name, required);
                break
            }

            case ArgType.Enum: {
                v = resolver[arg.enumValues === 'string' ? 'getString' : 'getNumber'](name, required)
                break
            }
        }

        arr[i] = (v ?? arg.default?.call(interaction.client as NekoClient, interaction) ?? null) as UnwrapArgDataTuple<T>[typeof i]
    }
    
    return arr 
}